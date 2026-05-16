from pydantic import BaseModel, Field
from typing import Optional


class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    login: str = Field(..., max_length=100)
    password: str


class ForgotPassword(BaseModel):
    login: str = Field(..., max_length=100)


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


class AddressCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    street_address: str = Field(..., min_length=1, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    pincode: str = Field(..., min_length=4, max_length=20)
    is_default: bool = False


class AddressUpdate(BaseModel):
    full_name: str = Field(default=None, min_length=1, max_length=100)
    phone: str = Field(default=None, min_length=10, max_length=20)
    street_address: str = Field(default=None, min_length=1, max_length=255)
    city: str = Field(default=None, min_length=1, max_length=100)
    state: str = Field(default=None, min_length=1, max_length=100)
    pincode: str = Field(default=None, min_length=4, max_length=20)
    is_default: bool = False
