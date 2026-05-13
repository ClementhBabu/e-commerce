import hashlib
import os
from fastapi import APIRouter, HTTPException, Response
from jose import jwt
from datetime import datetime, timedelta
from app.database import get_connection
from app.schemas import UserRegister, UserLogin
from app.dependencies import SECRET_KEY, ALGORITHM

router = APIRouter()


def hash_password(password: str) -> str:
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return salt.hex() + ":" + key.hex()


def verify_password(password: str, stored: str) -> bool:
    salt_hex, key_hex = stored.split(":", 1)
    salt = bytes.fromhex(salt_hex)
    key = bytes.fromhex(key_hex)
    new_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return new_key == key


@router.post("/register")
async def register(user: UserRegister, response: Response):
    conn = get_connection()

    existing = conn.execute(
        "SELECT id FROM users WHERE email = ? OR username = ?",
        (user.email, user.username)
    ).fetchone()

    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="User with this email or username already exists")

    password_hash = hash_password(user.password)

    cursor = conn.execute(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        (user.username, user.email, password_hash)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    token_data = {
        "user_id": user_id,
        "username": user.username,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=604800,
        samesite="lax"
    )

    return {"message": "Registration successful", "redirect": "/"}


@router.post("/login")
async def login(user: UserLogin, response: Response):
    conn = get_connection()
    db_user = conn.execute(
        "SELECT * FROM users WHERE email = ?",
        (user.email,)
    ).fetchone()
    conn.close()

    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = {
        "user_id": db_user["id"],
        "username": db_user["username"],
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=604800,
        samesite="lax"
    )

    return {"message": "Login successful", "redirect": "/"}
