from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse, JSONResponse
from app.database import init_db, get_connection
from app.dependencies import SECRET_KEY, ALGORITHM
from app.routers import auth, products, cart, checkout
from jose import jwt, JWTError

app = FastAPI(title="ShopHub - E-Commerce Store")

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="app/templates")

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api", tags=["products"])
app.include_router(cart.router, prefix="/api/cart", tags=["cart"])
app.include_router(checkout.router, prefix="/api/checkout", tags=["checkout"])


@app.on_event("startup")
async def startup():
    init_db()


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    public_paths = [
        "/login", "/register", "/static",
        "/forgot-password", "/reset-password",
        "/api/auth/login", "/api/auth/register",
        "/api/auth/forgot-password", "/api/auth/reset-password"
    ]

    is_public = any(request.url.path.startswith(p) for p in public_paths)

    if is_public:
        return await call_next(request)

    token = request.cookies.get("access_token")

    if not token:
        if request.url.path.startswith("/api/"):
            return JSONResponse(status_code=401, content={"detail": "Not authenticated"})
        return RedirectResponse(url="/login", status_code=302)

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        request.state.user_id = payload.get("user_id")
        request.state.username = payload.get("username")
    except JWTError:
        if request.url.path.startswith("/api/"):
            return JSONResponse(status_code=401, content={"detail": "Not authenticated"})
        response = RedirectResponse(url="/login", status_code=302)
        response.delete_cookie("access_token")
        return response

    return await call_next(request)


@app.get("/")
async def home(request: Request):
    conn = get_connection()
    products_list = conn.execute("SELECT * FROM products").fetchall()
    categories = conn.execute("SELECT DISTINCT category FROM products").fetchall()
    conn.close()

    return templates.TemplateResponse("index.html", {
        "request": request,
        "products": [dict(p) for p in products_list],
        "categories": [c["category"] for c in categories],
        "user": {"username": request.state.username}
    })


@app.get("/login")
async def login_page(request: Request):
    token = request.cookies.get("access_token")
    if token:
        try:
            jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return RedirectResponse(url="/", status_code=302)
        except JWTError:
            pass
    return templates.TemplateResponse("login.html", {"request": request})


@app.get("/register")
async def register_page(request: Request):
    token = request.cookies.get("access_token")
    if token:
        try:
            jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return RedirectResponse(url="/", status_code=302)
        except JWTError:
            pass
    return templates.TemplateResponse("register.html", {"request": request})


@app.get("/product/{product_id}")
async def product_detail(request: Request, product_id: int):
    conn = get_connection()
    product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    conn.close()

    if not product:
        return templates.TemplateResponse("index.html", {
            "request": request,
            "products": [],
            "categories": [],
            "user": {"username": request.state.username}
        }, status_code=404)

    return templates.TemplateResponse("product_detail.html", {
        "request": request,
        "product": dict(product),
        "user": {"username": request.state.username}
    })


@app.get("/cart")
async def cart_page(request: Request):
    conn = get_connection()
    items = conn.execute("""
        SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image_url, p.rating
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    """, (request.state.user_id,)).fetchall()
    conn.close()

    cart_items = [dict(item) for item in items]
    total = round(sum(item["price"] * item["quantity"] for item in cart_items), 2)

    return templates.TemplateResponse("cart.html", {
        "request": request,
        "cart_items": cart_items,
        "total": total,
        "user": {"username": request.state.username}
    })


@app.get("/checkout")
async def checkout_page(request: Request):
    conn = get_connection()
    items = conn.execute("""
        SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image_url
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    """, (request.state.user_id,)).fetchall()
    conn.close()

    cart_items = [dict(item) for item in items]
    total = round(sum(item["price"] * item["quantity"] for item in cart_items), 2)

    if not cart_items:
        return RedirectResponse(url="/cart", status_code=302)

    return templates.TemplateResponse("checkout.html", {
        "request": request,
        "cart_items": cart_items,
        "total": total,
        "user": {"username": request.state.username}
    })


@app.get("/forgot-password")
async def forgot_password_page(request: Request):
    return templates.TemplateResponse("forgot_password.html", {"request": request})


@app.get("/reset-password")
async def reset_password_page(request: Request):
    return templates.TemplateResponse("reset_password.html", {"request": request})


@app.get("/logout")
async def logout():
    response = RedirectResponse(url="/login", status_code=302)
    response.delete_cookie("access_token")
    return response
