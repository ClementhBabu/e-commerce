from fastapi import APIRouter, HTTPException
from app.database import get_connection

router = APIRouter()


@router.get("/products")
async def get_products(category: str = None, search: str = None):
    conn = get_connection()
    query = "SELECT * FROM products"
    params = []

    conditions = []
    if category:
        conditions.append("category = ?")
        params.append(category)
    if search:
        conditions.append("(name LIKE ? OR description LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%"])

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    products = conn.execute(query, params).fetchall()
    conn.close()

    return [dict(p) for p in products]


@router.get("/products/{product_id}")
async def get_product(product_id: int):
    conn = get_connection()
    product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    conn.close()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return dict(product)
