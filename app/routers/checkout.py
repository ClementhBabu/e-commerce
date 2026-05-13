from fastapi import APIRouter, Request
from app.database import get_connection
import random

router = APIRouter()


@router.post("")
async def process_checkout(request: Request):
    conn = get_connection()

    items = conn.execute("""
        SELECT c.id, c.quantity, p.id as product_id, p.name, p.price
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    """, (request.state.user_id,)).fetchall()

    if not items:
        conn.close()
        return {"success": False, "message": "Your cart is empty"}

    total = round(sum(item["price"] * item["quantity"] for item in items), 2)

    payment_success = random.random() < 0.9

    if payment_success:
        conn.execute("DELETE FROM cart_items WHERE user_id = ?", (request.state.user_id,))
        conn.commit()
        conn.close()
        return {
            "success": True,
            "message": "Payment successful! Your order has been placed.",
            "total": total
        }
    else:
        conn.close()
        return {
            "success": False,
            "message": "Payment failed. Please try again.",
            "total": total
        }
