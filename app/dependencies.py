from fastapi import Request, HTTPException
from jose import jwt, JWTError

SECRET_KEY = "ecommerce-secret-key-change-in-production-2024"
ALGORITHM = "HS256"


def get_token_from_cookie(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_current_user_id(request: Request) -> int:
    payload = get_token_from_cookie(request)
    if not payload:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return payload.get("user_id")
