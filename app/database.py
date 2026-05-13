import sqlite3

DATABASE_NAME = "ecommerce.db"


def get_connection():
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            image_url TEXT NOT NULL,
            category TEXT NOT NULL,
            rating REAL DEFAULT 4.0,
            stock INTEGER DEFAULT 100,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (product_id) REFERENCES products (id),
            UNIQUE(user_id, product_id)
        )
    """)

    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        products = [
            ("Wireless Bluetooth Headphones",
             "Premium noise-cancelling wireless headphones with 30-hour battery life. Features deep bass, comfortable ear cushions, and built-in microphone for crystal clear calls.",
             79.99, "https://picsum.photos/seed/headphones/400/400", "Electronics", 4.5),
            ("Smart Watch Pro",
             "Advanced smartwatch with heart rate monitoring, GPS tracking, sleep analysis, and 7-day battery life. Water resistant up to 50 meters.",
             199.99, "https://picsum.photos/seed/smartwatch/400/400", "Electronics", 4.3),
            ("Running Shoes Ultra",
             "Lightweight running shoes with responsive cushioning and breathable mesh upper. Perfect for daily training and long distance runs.",
             129.99, "https://picsum.photos/seed/shoes/400/400", "Fashion", 4.7),
            ("Organic Green Tea Collection",
             "Premium organic green tea set with 5 distinct flavors. Rich in antioxidants and naturally sourced from sustainable farms.",
             24.99, "https://picsum.photos/seed/tea/400/400", "Food & Beverages", 4.2),
            ("Laptop Backpack Pro",
             "Durable water-resistant backpack with padded laptop compartment, USB charging port, and anti-theft design. Fits up to 15.6 inch laptops.",
             49.99, "https://picsum.photos/seed/backpack/400/400", "Accessories", 4.6),
            ("Wireless Charging Pad",
             "Fast wireless charger compatible with all Qi-enabled devices. Slim design with LED indicator and foreign object detection.",
             29.99, "https://picsum.photos/seed/charger/400/400", "Electronics", 4.1),
            ("Stainless Steel Water Bottle",
             "Double-wall vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and eco-friendly.",
             19.99, "https://picsum.photos/seed/bottle/400/400", "Home & Kitchen", 4.4),
            ("Premium Yoga Mat",
             "Extra thick 6mm yoga mat with non-slip surface. Includes carrying strap. Perfect for yoga, pilates, and stretching exercises.",
             34.99, "https://picsum.photos/seed/yogamat/400/400", "Sports", 4.8),
            ("Mechanical Keyboard RGB",
             "Full-size mechanical keyboard with custom blue switches and per-key RGB backlighting. Aircraft-grade aluminum frame.",
             89.99, "https://picsum.photos/seed/keyboard/400/400", "Electronics", 4.5),
            ("Polarized Sunglasses",
             "Classic aviator sunglasses with polarized lenses. UV400 protection, lightweight metal frame, and scratch-resistant coating.",
             39.99, "https://picsum.photos/seed/sunglasses/400/400", "Fashion", 4.3),
            ("Portable Bluetooth Speaker",
             "Compact wireless speaker with 360 surround sound, 12-hour battery, and IPX7 waterproof rating. Perfect for outdoor adventures.",
             59.99, "https://picsum.photos/seed/speaker/400/400", "Electronics", 4.6),
            ("Genuine Leather Wallet",
             "Genuine leather bifold wallet with RFID blocking technology. Slim design with multiple card slots and ID window.",
             27.99, "https://picsum.photos/seed/wallet/400/400", "Accessories", 4.4),
        ]
        cursor.executemany(
            "INSERT INTO products (name, description, price, image_url, category, rating) VALUES (?, ?, ?, ?, ?, ?)",
            products
        )

    conn.commit()
    conn.close()
