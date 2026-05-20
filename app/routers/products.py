from fastapi import APIRouter, HTTPException
from app.database import get_connection

router = APIRouter()


@router.get("/products")
async def get_products(category: str = None, search: str = None):
    conn = get_connection()
    cur = conn.cursor()
    query = "SELECT * FROM products"
    params = []

    conditions = []
    if category:
        conditions.append("category = %s")
        params.append(category)
    if search:
        conditions.append("(name ILIKE %s OR description ILIKE %s)")
        params.extend([f"%{search}%", f"%{search}%"])

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    cur.execute(query, params)
    products = cur.fetchall()
    conn.close()

    return [dict(p) for p in products]


@router.get("/products/{product_id}")
async def get_product(product_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM products WHERE id = %s", (product_id,))
    product = cur.fetchone()
    conn.close()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return dict(product)
