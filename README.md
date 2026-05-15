# ShopHub - Full-Stack E-Commerce Application

A modern, responsive full-stack e-commerce web application built with **Python**, **FastAPI**, and **SQLite3**. Features user authentication (email + phone), product browsing, AI-powered chatbot, shopping cart, and dummy payment checkout with a polished, modern UI.

## Features

- **User Authentication** — Register and login with email or phone number. PBKDF2 password hashing with JWT token-based sessions
- **Password Reset** — Forgot password flow with secure reset tokens
- **AI Chatbot (ShopBot)** — DeepSeek-powered assistant that answers store-related questions only, available on every page
- **Protected Routes** — Middleware redirects unauthenticated users to login
- **Product Browsing** — 36 products across 9 categories with search and filter
- **Product Details** — Star ratings, stock urgency badges, delivery & returns info
- **Shopping Cart** — Add/remove items, update quantities, order summary
- **Checkout** — Dummy payment with card formatting and 90% success rate
- **Responsive Design** — Mobile-first UI built with Tailwind CSS
- **Modern UI/UX** — Animated hero, glassmorphism navbar, hover effects, toast notifications, staggered card animations

## Tech Stack

- **Backend**: Python 3.8+, FastAPI, SQLite3
- **Frontend**: HTML5, CSS3, JavaScript, Tailwind CSS (CDN), Font Awesome 6
- **Authentication**: JWT (python-jose), PBKDF2 password hashing
- **AI**: OpenAI-compatible API (DeepSeek default)
- **Template Engine**: Jinja2

## Project Structure

```
e-commerce/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI entry point, page routes, middleware, dotenv
│   ├── database.py          # SQLite3 connection, schema, seed data (36 products)
│   ├── dependencies.py      # JWT auth helpers
│   ├── schemas.py           # Pydantic request/response models
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          # Register, login, forgot/reset password
│   │   ├── products.py      # Product listing and detail APIs
│   │   ├── cart.py          # Cart CRUD APIs
│   │   ├── checkout.py      # Dummy payment processing
│   │   └── chat.py          # AI chatbot endpoint (DeepSeek)
│   └── templates/
│       ├── base.html        # Base layout (navbar, footer, chat widget)
│       ├── index.html       # Home page (hero, categories, product grid, newsletter)
│       ├── login.html       # Login (email or phone)
│       ├── register.html    # Registration (username, email, phone, password)
│       ├── forgot_password.html
│       ├── reset_password.html
│       ├── product_detail.html
│       ├── cart.html
│       └── checkout.html
├── static/
│   ├── css/
│   │   └── style.css        # Custom styles, animations, chat widget
│   └── js/
│       └── script.js        # Shared utilities, cart, chat widget
├── .env                     # DEEPSEEK_API_KEY (gitignored)
├── .gitignore
├── run.py                   # Application entry point (uvicorn)
├── requirements.txt
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- DeepSeek API key (for the AI chatbot)

### Installation

1. **Navigate to the project directory:**

```bash
cd e-commerce
```

2. **Create a virtual environment:**

```bash
python -m venv .venv
```

3. **Activate the virtual environment:**

- Windows:
```bash
.venv\Scripts\activate
```
- Linux/Mac:
```bash
source .venv/bin/activate
```

4. **Install dependencies:**

```bash
pip install -r requirements.txt
```

5. **Set your API key** by editing the `.env` file:

```
DEEPSEEK_API_KEY=your-deepseek-api-key
```

6. **Run the application:**

```bash
python run.py
```

7. **Open your browser:**

```
http://127.0.0.1:8000
```

## Usage

1. **Register** a new account — provide username, email, optional phone number, and password
2. **Login** using your email or phone number
3. **Browse products** — filter by category, search by name
4. **Click a product** to view details, ratings, and add to cart
5. **View your cart** via the cart icon in the navbar
6. **Proceed to checkout** and enter dummy card details
7. **Chat with ShopBot** — click the robot icon (bottom-right) to ask about products, orders, or store features

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user (username, email, phone?, password) |
| POST | `/api/auth/login` | Login with email or phone + password |
| POST | `/api/auth/forgot-password` | Request password reset token |
| POST | `/api/auth/reset-password` | Reset password with token |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (?category=&search=) |
| GET | `/api/products/{id}` | Get product details |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update/{id}` | Update item quantity |
| DELETE | `/api/cart/remove/{id}` | Remove item from cart |

### Checkout
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/checkout` | Process dummy payment |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to ShopBot AI |

## Database

SQLite3 with auto-migration. Tables:

- **users** — id, username, email, phone, password_hash
- **products** — 36 pre-seeded products across 9 categories
- **cart_items** — user_id, product_id, quantity
- **password_resets** — user_id, token, expires_at

## AI Chatbot Configuration

The chatbot uses the OpenAI-compatible API. Defaults to DeepSeek:

| Env Variable | Default | Description |
|---|---|---|
| `DEEPSEEK_API_KEY` | — | Your API key |
| `OPENAI_API_BASE` | `https://api.deepseek.com/v1` | API base URL |
| `OPENAI_MODEL` | `deepseek-chat` | Model name |

The assistant is restricted to ShopHub-related questions only — it will decline anything unrelated.

## Notes

- This is a **demo project** — no real payment processing
- Product images from Unsplash
- JWT tokens stored in HTTP-only cookies
- Password hashing uses PBKDF2 with SHA-256
