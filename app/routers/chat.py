import os
from fastapi import APIRouter, Request
from app.database import get_connection
from app.schemas import ChatRequest

router = APIRouter()

SYSTEM_PROMPT = """You are ShopBot, the AI assistant for ShopHub, an e-commerce store.

Your ONLY job is to help customers with questions about the ShopHub store.

STRICT RULES:
1. ONLY answer questions that are DIRECTLY related to ShopHub — its products, categories, prices, navigation, account management, shopping cart, checkout, orders, store information, or general e-commerce assistance within ShopHub.
2. If a user asks ANYTHING unrelated (weather, coding, recipes, math, general knowledge, trivia, personal advice, writing code, politics, entertainment, sports, news, etc.), you MUST politely decline. Say exactly: "I'm here to help with ShopHub-related questions only. Feel free to ask me about our products, your cart, ordering, or anything about the store!"
3. Never provide information about other stores, competing services, or external websites.
4. Keep responses concise, friendly, and helpful. Use 1-3 sentences when possible.
5. Do NOT make up products or features that don't exist. Only reference what you know from the store context provided below.

ShopHub Store Information:
- ShopHub is a demo e-commerce platform built with FastAPI
- Categories available: Electronics, Fashion, Food & Beverages, Accessories, Home & Kitchen, Sports
- All prices are in USD
- Free shipping on all orders
- Support email: support@shophub.demo
- Payment is handled securely in demo mode
- Users can register, login, reset forgotten passwords, and logout
- Key pages: Home (product browsing), Product Detail, Cart, Checkout"""


def get_client():
    api_key = os.getenv("DEEPSEEK_API_KEY") or os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_API_BASE", "https://api.deepseek.com/v1")
    if not api_key:
        return None
    from openai import AsyncOpenAI
    return AsyncOpenAI(api_key=api_key, base_url=base_url)


@router.post("/chat")
async def chat(request: Request, body: ChatRequest):
    client = get_client()
    if not client:
        return {"response": "Sorry, the AI assistant is not configured. Please set the DEEPSEEK_API_KEY environment variable."}

    conn = get_connection()
    products = conn.execute(
        "SELECT id, name, price, category, description, rating, stock FROM products"
    ).fetchall()
    conn.close()

    product_context = "Current Product Catalog:\n" + "\n".join(
        f"- [{p['category']}] {p['name']} — ${p['price']:.2f} — "
        f"Rating: {p['rating']}/5 — Stock: {p['stock']} — {p['description'][:120]}"
        for p in products
    )

    model = os.getenv("OPENAI_MODEL", "deepseek-chat")

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "system", "content": product_context},
                {"role": "user", "content": body.message}
            ],
            max_tokens=500,
            temperature=0.7,
        )
        reply = response.choices[0].message.content.strip()
    except Exception:
        reply = "Sorry, I'm having trouble right now. Please try again later."

    return {"response": reply}
