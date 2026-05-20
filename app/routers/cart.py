from fastapi import APIRouter, Request, HTTPException
from app.database import get_connection
from app.schemas import CartItemAdd, CartItemUpdate

router = APIRouter()


@router.get("")
async def get_cart(request: Request):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image_url, p.rating
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = %s
    """, (request.state.user_id,))
    items = cur.fetchall()
    conn.close()

    cart_items = [dict(item) for item in items]
    total = sum(item["price"] * item["quantity"] for item in cart_items)

    return {"items": cart_items, "total": round(total, 2), "count": len(cart_items)}


@router.post("/add")
async def add_to_cart(request: Request, item: CartItemAdd):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM products WHERE id = %s", (item.product_id,))
    if not cur.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    cur.execute(
        "SELECT * FROM cart_items WHERE user_id = %s AND product_id = %s",
        (request.state.user_id, item.product_id)
    )
    existing = cur.fetchone()

    if existing:
        cur.execute(
            "UPDATE cart_items SET quantity = quantity + %s WHERE id = %s",
            (item.quantity, existing["id"])
        )
    else:
        cur.execute(
            "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (%s, %s, %s)",
            (request.state.user_id, item.product_id, item.quantity)
        )

    conn.commit()

    cur.execute(
        "SELECT COALESCE(SUM(quantity), 0) as count FROM cart_items WHERE user_id = %s",
        (request.state.user_id,)
    )
    count = cur.fetchone()["count"]

    conn.close()

    return {"message": "Added to cart", "cart_count": count}


@router.put("/update/{item_id}")
async def update_cart_item(request: Request, item_id: int, update: CartItemUpdate):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM cart_items WHERE id = %s AND user_id = %s",
        (item_id, request.state.user_id)
    )
    item = cur.fetchone()

    if not item:
        conn.close()
        raise HTTPException(status_code=404, detail="Cart item not found")

    if update.quantity <= 0:
        cur.execute("DELETE FROM cart_items WHERE id = %s", (item_id,))
    else:
        cur.execute(
            "UPDATE cart_items SET quantity = %s WHERE id = %s",
            (update.quantity, item_id)
        )

    conn.commit()
    conn.close()

    return {"message": "Cart updated"}


@router.delete("/remove/{item_id}")
async def remove_from_cart(request: Request, item_id: int):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "DELETE FROM cart_items WHERE id = %s AND user_id = %s",
        (item_id, request.state.user_id)
    )
    conn.commit()

    cur.execute(
        "SELECT COALESCE(SUM(quantity), 0) as count FROM cart_items WHERE user_id = %s",
        (request.state.user_id,)
    )
    count = cur.fetchone()["count"]

    conn.close()

    return {"message": "Removed from cart", "cart_count": count}
