# ShopHub - Full-Stack E-Commerce Application

A modern, responsive full-stack e-commerce web application built with **Python**, **FastAPI**, and **SQLite3**. Features user authentication, product browsing, shopping cart, and dummy payment checkout with a polished UI inspired by Amazon/Flipkart.

## Features

- **User Authentication** - Secure registration and login with bcrypt password hashing and JWT token-based sessions
- **Protected Routes** - Unauthenticated users are redirected to the login page
- **Product Browsing** - Browse products with category filtering and search functionality
- **Product Details** - View detailed product information including image, description, price, and ratings
- **Shopping Cart** - Add/remove items, update quantities, and view total price
- **Checkout** - Dummy payment system with simulated success/failure (90% success rate)
- **Responsive Design** - Mobile-first UI built with Tailwind CSS
- **Modern UI/UX** - Smooth animations, hover effects, toast notifications, and loading states

## Tech Stack

- **Backend**: Python 3.8+, FastAPI, SQLite3
- **Frontend**: HTML5, CSS3, JavaScript, Tailwind CSS (CDN), Font Awesome
- **Authentication**: JWT (python-jose), bcrypt (passlib)
- **Template Engine**: Jinja2

## Project Structure

```
e-commerce/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry, page routes, middleware
│   ├── database.py          # SQLite3 connection and table initialization
│   ├── dependencies.py      # Auth dependency utilities
│   ├── schemas.py           # Pydantic request/response models
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          # Registration and login APIs
│   │   ├── products.py      # Product listing and detail APIs
│   │   ├── cart.py          # Cart CRUD APIs
│   │   └── checkout.py      # Payment processing API
│   └── templates/
│       ├── base.html        # Base layout with navbar and footer
│       ├── index.html       # Home page with hero banner and product grid
│       ├── login.html       # User login page
│       ├── register.html    # User registration page
│       ├── product_detail.html  # Individual product page
│       ├── cart.html        # Shopping cart page
│       └── checkout.html    # Checkout and payment page
├── static/
│   ├── css/
│   │   └── style.css        # Custom styles and animations
│   └── js/
│       └── script.js        # Shared JavaScript utilities
├── run.py                   # Application entry point
├── requirements.txt         # Python dependencies
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone or navigate to the project directory:**

```bash
cd e-commerce
```

2. **Create a virtual environment (recommended):**

```bash
python -m venv venv
```

3. **Activate the virtual environment:**

- Windows:
```bash
venv\Scripts\activate
```

- Linux/Mac:
```bash
source venv/bin/activate
```

4. **Install dependencies:**

```bash
pip install -r requirements.txt
```

5. **Run the application:**

```bash
python run.py
```

6. **Open your browser and visit:**

```
http://127.0.0.1:8000
```

## Usage

1. **Register** a new account (any email and password with min 6 characters)
2. **Login** with your credentials
3. **Browse products** on the home page - filter by category or search by name
4. **Click a product** to view its details
5. **Add products** to your cart using the "+" button
6. **View your cart** by clicking the cart icon in the navigation bar
7. **Proceed to checkout** from the cart page
8. **Enter dummy payment details** (any 16-digit card number) and place your order
9. Payment has a **90% success rate** - try again if it fails

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT cookie |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products (optional: `?category=` and `?search=`) |
| GET | `/api/products/{id}` | Get product details |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get current user's cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update/{id}` | Update cart item quantity |
| DELETE | `/api/cart/remove/{id}` | Remove item from cart |

### Checkout
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/checkout` | Process payment (dummy) |

## Database

The application uses SQLite3 with the following tables:

- **users** - User accounts with hashed passwords
- **products** - Product catalog (pre-seeded with 12 dummy products)
- **cart_items** - Shopping cart items linked to users and products

The database file (`ecommerce.db`) is created automatically on first run.

## Notes

- This is a **demo project** for educational purposes
- No real payment processing - the checkout simulates success/failure randomly
- Product images are sourced from picsum.photos (random placeholder images)
- JWT tokens are stored in HTTP-only cookies for security
- Password hashing uses bcrypt via passlib
