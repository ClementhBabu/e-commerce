from fastapi import APIRouter, HTTPException, Request
from app.database import get_connection
from app.schemas import WishlistAdd

router = APIRouter()


@router.get("")
async def get_wishlist(request: Request):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT w.id, p.id as product_id, p.name, p.price, p.image_url, p.rating, p.category
        FROM wishlist_items w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = %s
        ORDER BY w.created_at DESC
        """,
        (request.state.user_id,)
    )
    items = cur.fetchall()
    conn.close()

    return {"items": [dict(item) for item in items], "count": len(items)}


@router.post("/add")
async def add_to_wishlist(request: Request, body: WishlistAdd):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM products WHERE id = %s", (body.product_id,))
    if not cur.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    cur.execute(
        "SELECT id FROM wishlist_items WHERE user_id = %s AND product_id = %s",
        (request.state.user_id, body.product_id)
    )
    if not cur.fetchone():
        cur.execute(
            "INSERT INTO wishlist_items (user_id, product_id) VALUES (%s, %s)",
            (request.state.user_id, body.product_id)
        )
        conn.commit()

    cur.execute(
        "SELECT COUNT(*) as count FROM wishlist_items WHERE user_id = %s",
        (request.state.user_id,)
    )
    count = cur.fetchone()["count"]
    conn.close()

    return {"message": "Added to wishlist", "wishlist_count": count}


@router.delete("/remove/{product_id}")
async def remove_from_wishlist(request: Request, product_id: int):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "DELETE FROM wishlist_items WHERE user_id = %s AND product_id = %s",
        (request.state.user_id, product_id)
    )
    conn.commit()

    cur.execute(
        "SELECT COUNT(*) as count FROM wishlist_items WHERE user_id = %s",
        (request.state.user_id,)
    )
    count = cur.fetchone()["count"]
    conn.close()

    return {"message": "Removed from wishlist", "wishlist_count": count}
