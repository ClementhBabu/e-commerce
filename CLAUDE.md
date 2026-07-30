# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

ShopHub — a full-stack e-commerce demo app: FastAPI backend (API-only) + React (Vite) frontend, with JWT cookie-based auth and a DeepSeek/OpenAI-powered chatbot.

**Important:** the app uses **PostgreSQL via psycopg2** (`DATABASE_URL`, default `postgresql://postgres:postgres@localhost:5432/shophub`), not SQLite.

## Commands

### Backend (from repo root, with venv active)
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000   # dev, http://127.0.0.1:8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4  # production (no --reload)
```
A PostgreSQL server must be running and reachable via `DATABASE_URL` (env var or `.env`) before the backend will start — `init_db()` runs on FastAPI startup and creates tables/seed data if missing. `SECRET_KEY` must also be set in the environment or the app raises `KeyError` on import (`app/dependencies.py`).

No test suite exists in this repo currently.

### Frontend (from `frontend/`)
```bash
npm install
npm run dev       # Vite dev server, http://localhost:5173, proxies /api -> 127.0.0.1:8000
npm run lint       # eslint
npm run build      # production build to frontend/dist
npm run preview
```
In production there's no separate frontend process — build to `frontend/dist` and let the FastAPI backend serve it (see Architecture below).

### Environment
`.env` in repo root, loaded via `python-dotenv`:
- `SECRET_KEY` — **required**, signs JWT auth cookies; app fails to start without it
- `DATABASE_URL` — Postgres connection string (see default above)
- `ALLOWED_ORIGINS` — comma-separated CORS origins, defaults to the two local Vite dev origins
- `DEEPSEEK_API_KEY` (or `OPENAI_API_KEY`) — enables `/api/chat`; without it the endpoint returns a static "not configured" message instead of erroring
- `OPENAI_API_BASE` — defaults to `https://api.deepseek.com/v1`
- `OPENAI_MODEL` — defaults to `deepseek-chat`

## Architecture

### Backend request flow
- `app/main.py` wires up CORS (origins from `ALLOWED_ORIGINS`, see Commands above), registers routers under `/api/*`, and runs `init_db()` on startup.
- A single custom `@app.middleware("http")` in `main.py` is the **only** auth gate — it runs before every request to a `/api/*` path, decodes the `access_token` cookie (JWT, HS256, secret from `SECRET_KEY` via `app/dependencies.py`), and sets `request.state.user_id` / `request.state.username`. Routes read `request.state.user_id` directly rather than using a FastAPI dependency for auth.
  - Public paths bypassing this check are hardcoded in `main.py`'s `public_paths` list: login, register, forgot/reset-password, `GET /api/products*`, `POST /api/address/geocode`. Any new unauthenticated endpoint must be added there.
- Below `/api/*`, `main.py` also conditionally mounts `frontend/dist` as static assets and serves `index.html` for any non-API, non-asset path — this is how a single `uvicorn` process serves both the SPA and the API in production once `npm run build` has produced `frontend/dist`. In dev, the frontend is served separately by Vite and proxies `/api` calls to the backend instead.
- Routers (`app/routers/*.py`) are thin: each opens its own `psycopg2` connection via `get_connection()`, runs raw SQL with `%s` placeholders, and closes the connection manually before returning — there's no ORM, connection pooling, or dependency-injected DB session. Follow this same per-request connect/execute/close pattern when adding endpoints rather than introducing a new pattern.
- Password hashing is hand-rolled PBKDF2-HMAC-SHA256 (100k iterations) in `app/routers/auth.py`, not passlib/bcrypt — reuse `hash_password`/`verify_password` from there rather than adding a new hashing scheme.
- `app/schemas.py` holds all Pydantic request models for every router (not split per-router).

### Frontend structure
- `frontend/src/api.js` is the single fetch wrapper for all backend calls (`credentials: 'include'` for the auth cookie). A 401 response auto-redirects to `/login` (storing `redirectAfterLogin`) unless the call passes `skipAuthRedirect` — used by `AuthContext`'s initial `/api/auth/me` probe so that check itself doesn't trigger a redirect loop.
- Global state is three nested context providers wrapping the whole app in `App.jsx`: `AuthProvider` > `ToastProvider` > `CartProvider`. `AuthProvider` blocks rendering behind a loading screen until the initial `/api/auth/me` check resolves.
- `ProtectedRoute` wraps individual `<Route element>`s (not a layout route) to guard `/`, `/product/:id`, `/cart`, `/checkout`, `/address`.
- Routing is plain `react-router-dom` `<Routes>/<Route>` in `App.jsx` — add new pages there, not via a route config file.

### Data model
7 Postgres tables defined in `app/database.py::init_db()`: `users`, `products`, `password_resets`, `cart_items`, `addresses`, `orders`, `order_items`. Schema creation and 486-product seeding both happen idempotently in `init_db()` (checks `COUNT(*)` before seeding) — this is the only source of truth for the schema, there are no migration files.

### Checkout behavior
`app/routers/checkout.py` simulates payment with a hardcoded 90% success rate (`random.random() < 0.9`) — there is no real payment integration. A successful checkout creates an `orders` + `order_items` rows and clears the cart in one flow; failure leaves the cart untouched.
