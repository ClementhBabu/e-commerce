from pydantic import BaseModel, Field


class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=100)
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: str
    password: str


class ForgotPassword(BaseModel):
    email: str = Field(..., max_length=100)


class ResetPassword(BaseModel):
    token: str
    password: str = Field(..., min_length=6, max_length=100)


class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
