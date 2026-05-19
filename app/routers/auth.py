import hashlib
import os
import secrets
from fastapi import APIRouter, HTTPException, Response
from jose import jwt
from datetime import datetime, timedelta
from app.database import get_connection
from app.schemas import UserRegister, UserLogin, ForgotPassword, ResetPassword
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


def is_email(value: str) -> bool:
    return "@" in value


def find_user_by_login(conn, login: str):
    if is_email(login):
        return conn.execute(
            "SELECT * FROM users WHERE email = ?", (login,)
        ).fetchone()
    else:
        return conn.execute(
            "SELECT * FROM users WHERE phone = ?", (login,)
        ).fetchone()


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

    if user.phone:
        existing_phone = conn.execute(
            "SELECT id FROM users WHERE phone = ?", (user.phone,)
        ).fetchone()
        if existing_phone:
            conn.close()
            raise HTTPException(status_code=400, detail="User with this phone number already exists")

    password_hash = hash_password(user.password)

    cursor = conn.execute(
        "INSERT INTO users (username, email, phone, password_hash) VALUES (?, ?, ?, ?)",
        (user.username, user.email, user.phone, password_hash)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {"message": "Registration successful", "redirect": "/login"}


@router.post("/login")
async def login(user: UserLogin, response: Response):
    conn = get_connection()
    db_user = find_user_by_login(conn, user.login)
    conn.close()

    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid login credentials or password")

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


@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword):
    conn = get_connection()
    db_user = find_user_by_login(conn, data.login)

    if not db_user:
        conn.close()
        return {"message": "If that email or phone is registered, a reset token has been generated."}

    conn.execute(
        "UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0",
        (db_user["id"],)
    )

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    conn.execute(
        "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
        (db_user["id"], token, expires_at)
    )
    conn.commit()
    conn.close()

    return {"message": "Reset token generated.", "token": token, "login": data.login}


@router.post("/reset-password")
async def reset_password(data: ResetPassword):
    conn = get_connection()
    reset = conn.execute(
        "SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > ?",
        (data.token, datetime.utcnow())
    ).fetchone()

    if not reset:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    password_hash = hash_password(data.password)

    conn.execute(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        (password_hash, reset["user_id"])
    )
    conn.execute(
        "UPDATE password_resets SET used = 1 WHERE id = ?",
        (reset["id"],)
    )
    conn.commit()
    conn.close()

    return {"message": "Password has been reset successfully."}
