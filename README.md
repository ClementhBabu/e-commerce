# ShopHub - Full-Stack E-Commerce Application

A modern full-stack e-commerce web application built with **React**, **FastAPI**, and **SQLite3**. Features user authentication, product browsing, shopping cart, dummy payment checkout, AI chatbot, and address management with a polished responsive UI.

## Features

- **User Authentication** - Registration and login with PBKDF2-SHA256 password hashing and JWT cookie-based sessions
- **Protected Routes** - React route guards redirect unauthenticated users to login
- **Product Browsing** - Browse 486 products across 9 categories with filtering and search
- **Product Details** - Full product view with images, descriptions, ratings, quantity selector
- **Shopping Cart** - Add/remove items, update quantities, persistent per-user cart
- **Checkout** - Address management, dummy payment with card formatting (90% success rate)
- **AI Chatbot** - ShopBot answers product and order questions (DeepSeek/OpenAI powered)
- **Password Reset** - Forgot/reset password flow with secure tokens
- **Address Management** - Save addresses with geolocation auto-fill
- **Responsive Design** - Mobile-first UI built with Tailwind CSS
- **Toast Notifications** - Real-time feedback for all user actions

## Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, React Router v6
- **Backend**: Python 3.10+, FastAPI, SQLite3
- **Authentication**: JWT (python-jose) with HTTP-only cookies
- **AI**: OpenAI-compatible API (DeepSeek Chat)

## Project Structure

```
e-commerce/
├── app/                          # FastAPI backend (API only)
│   ├── __init__.py
│   ├── main.py                   # App entry, CORS, auth middleware, SPA serving
│   ├── database.py               # SQLite3 connection, schema, seed data
│   ├── dependencies.py           # JWT helpers and config
│   ├── schemas.py                # Pydantic request/response models
│   └── routers/
│       ├── __init__.py
│       ├── auth.py               # Register, login, me, password reset
│       ├── products.py           # Product listing and detail APIs
│       ├── cart.py               # Cart CRUD APIs
│       ├── checkout.py           # Payment processing API
│       ├── address.py            # Address CRUD + geocoding
│       └── chat.py               # AI chatbot API
├── frontend/                     # React frontend (Vite)
│   ├── src/
│   │   ├── api.js                # API service layer with cookie auth
│   │   ├── main.jsx              # React entry point
│   │   ├── App.jsx               # Routes and layout
│   │   ├── index.css             # Tailwind + custom animations
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Auth state with /api/auth/me check
│   │   │   ├── CartContext.jsx    # Global cart count
│   │   │   └── ToastContext.jsx   # Toast notification system
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Sticky nav with search, cart badge, user dropdown
│   │   │   ├── Footer.jsx         # Site footer with links
│   │   │   ├── ProductCard.jsx    # Product card with quick-add
│   │   │   ├── ChatWidget.jsx     # Floating ShopBot chatbot
│   │   │   └── ProtectedRoute.jsx # Auth guard wrapper
│   │   └── pages/
│   │       ├── Home.jsx           # Hero banner, category grid, product cards
│   │       ├── Login.jsx          # Email/phone + password login
│   │       ├── Register.jsx       # Registration form
│   │       ├── ProductDetail.jsx  # Full product view with qty selector
│   │       ├── Cart.jsx           # Cart items, qty controls, order summary
│   │       ├── Checkout.jsx       # Address display, card payment form
│   │       ├── Address.jsx        # Address CRUD with geolocation
│   │       ├── ForgotPassword.jsx # Request password reset token
│   │       ├── ResetPassword.jsx  # Set new password with token
│   │       └── Logout.jsx         # Clear auth + redirect
│   ├── vite.config.js            # Vite + Tailwind + API proxy
│   └── package.json
├── start.py                      # Start both backend + frontend
├── start_backend.py              # Start backend only (:8000)
├── start_frontend.py             # Start frontend dev server (:5173)
├── start_prod.py                 # Build + serve production
├── run.py                        # Backend entry point
├── requirements.txt              # Python dependencies
└── README.md
```

## Setup Instructions

### Prerequisites

- **Python 3.10+** (works with 3.12)
- **Node.js 18+** (for the React frontend)
- pip and npm

### Installation

1. **Clone the repository:**

```bash
cd e-commerce
```

2. **Create and activate a virtual environment:**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. **Install Python dependencies:**

```bash
pip install -r requirements.txt
```

4. **Install frontend dependencies:**

```bash
cd frontend
npm install
cd ..
```

### Running in Development

**Option A - Start both servers at once:**

```bash
python start.py
```

**Option B - Start servers separately (two terminals):**

```bash
# Terminal 1: Backend
python start_backend.py        # http://127.0.0.1:8000

# Terminal 2: Frontend
python start_frontend.py       # http://localhost:5173
```

Open **http://localhost:5173** in your browser. The Vite dev server proxies API calls to the backend automatically.

### Running in Production

```bash
python start_prod.py
```

This builds the React app and serves everything on **http://127.0.0.1:8000**.

## Usage

1. **Register** a new account (username + email + password min 6 chars)
2. **Login** with email/phone + password
3. **Browse products** on the home page - filter by category or search
4. **Click a product** to view details and select quantity
5. **Add to cart** and view cart from the navbar
6. **Add delivery address** (supports geolocation auto-fill)
7. **Enter payment details** (any 16-digit card) and place order
8. **Chat with ShopBot** via the floating chat button for product help

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login, sets JWT cookie |
| GET | `/api/auth/me` | Yes | Get current user info |
| POST | `/api/auth/forgot-password` | No | Request reset token |
| POST | `/api/auth/reset-password` | No | Set new password |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | No | List all (query: `?category=X&search=Y`) |
| GET | `/api/products/{id}` | No | Get product details |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | Yes | Get cart with items and total |
| POST | `/api/cart/add` | Yes | Add item (`{product_id, quantity}`) |
| PUT | `/api/cart/update/{id}` | Yes | Update quantity (`{quantity}`) |
| DELETE | `/api/cart/remove/{id}` | Yes | Remove item |

### Checkout
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/checkout` | Yes | Process payment (`{card_number, card_name, expiry, cvv}`) |

### Address
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/address` | Yes | List all saved addresses |
| GET | `/api/address/default` | Yes | Get default address |
| POST | `/api/address` | Yes | Create new address |
| PUT | `/api/address/{id}` | Yes | Update address |
| DELETE | `/api/address/{id}` | Yes | Delete address |
| POST | `/api/address/geocode` | No | Reverse geocode (`{lat, lng}`) |

### Chat
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/chat` | Yes | Send message, get AI response (`{message}`) |

## Database

SQLite3 with 7 tables: `users`, `products`, `password_resets`, `cart_items`, `addresses`, `orders`, `order_items`. The database (`ecommerce.db`) is auto-created on first run with 486 seed products across 9 categories.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DEEPSEEK_API_KEY` | For chat | DeepSeek API key (also supports `OPENAI_API_KEY`) |

Create a `.env` file in the project root:

```env
DEEPSEEK_API_KEY=sk-your-key-here
```

## Notes

- This is a demo project - no real payment processing
- Product images use `source.unsplash.com` with keyword-based search
- JWT tokens stored in HTTP-only cookies (`/api/auth/me` validates auth state)
- Password hashing uses PBKDF2-HMAC-SHA256 with 100,000 iterations
- Chat requires a valid API key, falls back to static responses otherwise
