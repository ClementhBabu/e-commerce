from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.dependencies import SECRET_KEY, ALGORITHM
from app.routers import auth, products, cart, checkout, chat, address
from jose import jwt, JWTError
from pathlib import Path

app = FastAPI(title="ShopHub - E-Commerce Store")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api", tags=["products"])
app.include_router(cart.router, prefix="/api/cart", tags=["cart"])
app.include_router(checkout.router, prefix="/api/checkout", tags=["checkout"])
app.include_router(address.router, prefix="/api/address", tags=["address"])
app.include_router(chat.router, prefix="/api", tags=["chat"])


@app.on_event("startup")
async def startup():
    init_db()


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    public_paths = [
        "/api/auth/login", "/api/auth/register",
        "/api/auth/forgot-password", "/api/auth/reset-password",
        "/api/products",
        "/api/address/geocode",
    ]

    if not request.url.path.startswith("/api/"):
        return await call_next(request)

    is_public = any(request.url.path.startswith(p) for p in public_paths)
    if is_public:
        return await call_next(request)

    token = request.cookies.get("access_token")
    if not token:
        return JSONResponse(status_code=401, content={"detail": "Not authenticated"})

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        request.state.user_id = payload.get("user_id")
        request.state.username = payload.get("username")
    except JWTError:
        return JSONResponse(status_code=401, content={"detail": "Not authenticated"})

    return await call_next(request)


FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="react_assets")

    @app.get("/{full_path:path}")
    async def serve_react_spa(request: Request, full_path: str):
        if full_path.startswith("api/") or full_path.startswith("assets/"):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return JSONResponse(status_code=404, content={"detail": "Not found"})
