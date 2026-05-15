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
        CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
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
             79.99, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop", "Electronics", 4.5),
            ("Smart Watch Pro",
             "Advanced smartwatch with heart rate monitoring, GPS tracking, sleep analysis, and 7-day battery life. Water resistant up to 50 meters.",
             199.99, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop", "Electronics", 4.3),
            ("Running Shoes Ultra",
             "Lightweight running shoes with responsive cushioning and breathable mesh upper. Perfect for daily training and long distance runs.",
             129.99, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop", "Fashion", 4.7),
            ("Organic Green Tea Collection",
             "Premium organic green tea set with 5 distinct flavors. Rich in antioxidants and naturally sourced from sustainable farms.",
             24.99, "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=600&fit=crop", "Food & Beverages", 4.2),
            ("Laptop Backpack Pro",
             "Durable water-resistant backpack with padded laptop compartment, USB charging port, and anti-theft design. Fits up to 15.6 inch laptops.",
             49.99, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "Accessories", 4.6),
            ("Wireless Charging Pad",
             "Fast wireless charger compatible with all Qi-enabled devices. Slim design with LED indicator and foreign object detection.",
             29.99, "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop", "Electronics", 4.1),
            ("Stainless Steel Water Bottle",
             "Double-wall vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and eco-friendly.",
             19.99, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop", "Home & Kitchen", 4.4),
            ("Premium Yoga Mat",
             "Extra thick 6mm yoga mat with non-slip surface. Includes carrying strap. Perfect for yoga, pilates, and stretching exercises.",
             34.99, "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop", "Sports", 4.8),
            ("Mechanical Keyboard RGB",
             "Full-size mechanical keyboard with custom blue switches and per-key RGB backlighting. Aircraft-grade aluminum frame.",
             89.99, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop", "Electronics", 4.5),
            ("Polarized Sunglasses",
             "Classic aviator sunglasses with polarized lenses. UV400 protection, lightweight metal frame, and scratch-resistant coating.",
             39.99, "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop", "Fashion", 4.3),
            ("Portable Bluetooth Speaker",
             "Compact wireless speaker with 360 surround sound, 12-hour battery, and IPX7 waterproof rating. Perfect for outdoor adventures.",
             59.99, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop", "Electronics", 4.6),
            ("Genuine Leather Wallet",
             "Genuine leather bifold wallet with RFID blocking technology. Slim design with multiple card slots and ID window.",
             27.99, "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop", "Accessories", 4.4),
            ("Samsung Galaxy Tab S9",
             "11-inch Dynamic AMOLED display tablet. Powerful processor, S Pen included, 12GB RAM, 256GB storage. Perfect for creativity and productivity.",
             549.99, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop", "Electronics", 4.7),
            ("Apple AirPods Pro 2",
             "Active noise cancellation, Adaptive Transparency, Personalized Spatial Audio. MagSafe charging case with U1 chip for precision finding.",
             249.99, "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=600&h=600&fit=crop", "Electronics", 4.8),
            ("Casio G-Shock Watch",
             "Shock-resistant digital watch with 200M water resistance. LED backlight, stopwatch, countdown timer, and world time.",
             99.99, "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600&h=600&fit=crop", "Fashion", 4.5),
            ("Leather Chelsea Boots",
             "Premium handcrafted leather boots with elastic side panels. Comfortable cushioned insole and durable rubber sole.",
             149.99, "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&h=600&fit=crop", "Fashion", 4.4),
            ("Silk Evening Dress",
             "Elegant floor-length silk dress with delicate lace trim. Perfect for formal events and special occasions. Available in multiple colors.",
             199.99, "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop", "Fashion", 4.6),
            ("Non-Stick Cooking Pan Set",
             "Premium 10-piece ceramic non-stick cookware set. Oven safe, dishwasher safe, suitable for all stovetops including induction.",
             119.99, "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop", "Home & Kitchen", 4.5),
            ("Memory Foam Pillow",
             "Ergonomic orthopedic pillow with cooling gel layer. Adjustable height, hypoallergenic bamboo cover. Perfect for side and back sleepers.",
             44.99, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=600&fit=crop", "Home & Kitchen", 4.3),
            ("Scented Candle Collection",
             "4-pack premium soy wax candles. Long-lasting 50-hour burn time each. Lavender, Vanilla, Eucalyptus, and Rose scents.",
             34.99, "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=600&fit=crop", "Home & Kitchen", 4.7),
            ("Leather Messenger Bag",
             "Vintage full-grain leather messenger bag. Fits 13'' laptop, multiple compartments, adjustable shoulder strap. Ages beautifully with use.",
             79.99, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop", "Accessories", 4.6),
            ("Designer Scarf",
             "100% cashmere luxury scarf. Ultra-soft and warm, classic herringbone pattern. A timeless accessory for any wardrobe.",
             69.99, "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=600&fit=crop", "Accessories", 4.4),
            ("Resistance Bands Set",
             "Complete set of 5 resistance bands with different strength levels. Includes door anchor, ankle straps, and carrying bag.",
             24.99, "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&h=600&fit=crop", "Sports", 4.3),
            ("Adjustable Dumbbell Set",
             "Space-saving adjustable dumbbells from 5 to 52.5 lbs. Quick-change weight system, durable steel construction, comfortable grip.",
             299.99, "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600&h=600&fit=crop", "Sports", 4.6),
            ("Premium Protein Powder",
             "Whey isolate protein powder with 25g protein per serving. Low carb, gluten-free. Rich chocolate flavor. 2lb container.",
             49.99, "https://images.unsplash.com/photo-1622485831128-bc71c7fa0a79?w=600&h=600&fit=crop", "Food & Beverages", 4.5),
            ("Gourmet Coffee Beans",
             "Single-origin Arabica coffee beans from Ethiopia. Medium roast with notes of blueberry, chocolate, and citrus. 1lb bag.",
             18.99, "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop", "Food & Beverages", 4.8),
            ("Hydrating Face Serum",
             "Vitamin C + Hyaluronic Acid face serum. Brightens skin, reduces fine lines, and deeply hydrates. Suitable for all skin types.",
             34.99, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop", "Beauty & Health", 4.5),
            ("Electric Toothbrush",
             "Sonic electric toothbrush with 5 cleaning modes, 2-minute smart timer, and long-lasting 30-day battery. Comes with 4 replacement heads.",
             59.99, "https://images.unsplash.com/photo-1559650656-5d1d5d1d5d1d?w=600&h=600&fit=crop", "Beauty & Health", 4.4),
            ("Essential Oil Diffuser",
             "500ml ultrasonic aromatherapy diffuser with 7 LED colors, auto shut-off, and timer settings. Includes 10 essential oils starter kit.",
             39.99, "https://images.unsplash.com/photo-1602928298849-325cec8771c0?w=600&h=600&fit=crop", "Beauty & Health", 4.6),
            ("Hardcover Notebook Set",
             "Premium 3-pack hardcover journals with 192 pages each. Thick 100gsm paper, lay-flat binding, and elastic closure band.",
             22.99, "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=600&fit=crop", "Books & Stationery", 4.7),
            ("Fountain Pen Collection",
             "Luxury fountain pen set with 3 nib sizes. Includes 12 ink cartridges and gift box. Smooth writing experience for professionals.",
             49.99, "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&h=600&fit=crop", "Books & Stationery", 4.5),
            ("Desk Organizer Set",
             "Bamboo desk organizer with 5 compartments. Includes phone stand, pen holder, and drawer. Keeps your workspace clean and organized.",
             32.99, "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop", "Books & Stationery", 4.3),
            ("Building Blocks Set",
             "1200-piece creative building blocks set. Compatible with major brands. Includes base plates, wheels, windows, and instruction booklet.",
             39.99, "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=600&fit=crop", "Toys & Games", 4.8),
            ("Board Game Collection",
             "Family board game set with 5 classic games in one box. Chess, Checkers, Backgammon, Ludo, and Snakes & Ladders. Wooden board included.",
             45.99, "https://images.unsplash.com/photo-1606503153255-59d8b8e1b46e?w=600&h=600&fit=crop", "Toys & Games", 4.6),
            ("Wireless Earbuds Sport",
             "Sweatproof wireless earbuds with ear-hook design. 8-hour battery, Bluetooth 5.3, touch controls, and built-in mic for workouts.",
             45.99, "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=600&fit=crop", "Electronics", 4.3),
            ("Denim Jacket Classic",
             "Timeless blue denim jacket with button closure. Regular fit, soft cotton blend, and classic chest pockets. A wardrobe essential.",
             69.99, "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=600&fit=crop", "Fashion", 4.4),
        ]
        cursor.executemany(
            "INSERT INTO products (name, description, price, image_url, category, rating) VALUES (?, ?, ?, ?, ?, ?)",
            products
        )

    conn.commit()
    conn.close()
