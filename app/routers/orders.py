from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from app.database import get_connection
from app.schemas import ReturnRequest

router = APIRouter()


def _order_status(created_at) -> str:
    elapsed = datetime.utcnow() - created_at
    if elapsed.days >= 3:
        return "Delivered"
    if elapsed.days >= 1:
        return "Shipped"
    return "Order Placed"


@router.get("/orders")
async def list_orders(request: Request):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT o.id, o.total, o.payment_status, o.created_at,
               COALESCE(SUM(oi.quantity), 0) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = %s
        GROUP BY o.id
        ORDER BY o.created_at DESC
        """,
        (request.state.user_id,)
    )
    orders = cur.fetchall()
    conn.close()

    return [
        {
            "id": o["id"],
            "total": o["total"],
            "payment_status": o["payment_status"],
            "created_at": o["created_at"],
            "item_count": o["item_count"],
            "status": _order_status(o["created_at"]),
        }
        for o in orders
    ]


@router.get("/orders/{order_id}")
async def get_order(request: Request, order_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM orders WHERE id = %s AND user_id = %s",
        (order_id, request.state.user_id)
    )
    order = cur.fetchone()
    if not order:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")

    cur.execute(
        "SELECT product_id, product_name, price, quantity FROM order_items WHERE order_id = %s",
        (order_id,)
    )
    items = cur.fetchall()

    cur.execute("SELECT * FROM returns WHERE order_id = %s", (order_id,))
    ret = cur.fetchone()
    conn.close()

    return {
        "id": order["id"],
        "total": order["total"],
        "payment_status": order["payment_status"],
        "created_at": order["created_at"],
        "status": _order_status(order["created_at"]),
        "items": [dict(item) for item in items],
        "return": dict(ret) if ret else None,
    }


@router.post("/orders/{order_id}/return")
async def request_return(request: Request, order_id: int, body: ReturnRequest):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id FROM orders WHERE id = %s AND user_id = %s",
        (order_id, request.state.user_id)
    )
    if not cur.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")

    cur.execute("SELECT id FROM returns WHERE order_id = %s", (order_id,))
    if cur.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="A return has already been requested for this order")

    cur.execute(
        "INSERT INTO returns (order_id, user_id, reason) VALUES (%s, %s, %s)",
        (order_id, request.state.user_id, body.reason)
    )
    conn.commit()
    conn.close()

    return {"message": "Return request submitted"}


@router.get("/returns")
async def list_returns(request: Request):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT r.id, r.order_id, r.reason, r.status, r.created_at, o.total
        FROM returns r
        JOIN orders o ON o.id = r.order_id
        WHERE r.user_id = %s
        ORDER BY r.created_at DESC
        """,
        (request.state.user_id,)
    )
    returns = cur.fetchall()
    conn.close()
    return [dict(r) for r in returns]
