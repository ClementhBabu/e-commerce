import hashlib
import os
import secrets
from fastapi import APIRouter, HTTPException, Response, Request
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
    cur = conn.cursor()
    if is_email(login):
        cur.execute("SELECT * FROM users WHERE email = %s", (login,))
        return cur.fetchone()
    else:
        cur.execute("SELECT * FROM users WHERE phone = %s", (login,))
        return cur.fetchone()


@router.get("/me")
async def me(request: Request):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, username, email, phone FROM users WHERE id = %s",
        (request.state.user_id,)
    )
    user = cur.fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "phone": user["phone"],
    }


@router.post("/register")
async def register(user: UserRegister):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id FROM users WHERE email = %s OR username = %s",
        (user.email, user.username)
    )
    existing = cur.fetchone()

    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="User with this email or username already exists")

    if user.phone:
        cur.execute(
            "SELECT id FROM users WHERE phone = %s", (user.phone,)
        )
        if cur.fetchone():
            conn.close()
            raise HTTPException(status_code=400, detail="User with this phone number already exists")

    password_hash = hash_password(user.password)

    cur.execute(
        "INSERT INTO users (username, email, phone, password_hash) VALUES (%s, %s, %s, %s)",
        (user.username, user.email, user.phone, password_hash)
    )
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

    return {
        "message": "Login successful",
        "redirect": "/",
        "user_id": db_user["id"],
        "username": db_user["username"],
        "email": db_user["email"],
    }


@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword):
    conn = get_connection()
    db_user = find_user_by_login(conn, data.login)

    if not db_user:
        conn.close()
        return {"message": "If that email or phone is registered, a reset token has been generated."}

    cur = conn.cursor()
    cur.execute(
        "UPDATE password_resets SET used = 1 WHERE user_id = %s AND used = 0",
        (db_user["id"],)
    )

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    cur.execute(
        "INSERT INTO password_resets (user_id, token, expires_at) VALUES (%s, %s, %s)",
        (db_user["id"], token, expires_at)
    )
    conn.commit()
    conn.close()

    return {"message": "Reset token generated.", "token": token, "login": data.login}


@router.post("/reset-password")
async def reset_password(data: ResetPassword):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM password_resets WHERE token = %s AND used = 0 AND expires_at > %s",
        (data.token, datetime.utcnow())
    )
    reset = cur.fetchone()

    if not reset:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    password_hash = hash_password(data.password)

    cur.execute(
        "UPDATE users SET password_hash = %s WHERE id = %s",
        (password_hash, reset["user_id"])
    )
    cur.execute(
        "UPDATE password_resets SET used = 1 WHERE id = %s",
        (reset["id"],)
    )
    conn.commit()
    conn.close()

    return {"message": "Password has been reset successfully."}
