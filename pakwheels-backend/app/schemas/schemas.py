from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ===== USER SCHEMAS =====
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: Optional[str] = "buyer"
    city_id: Optional[int] = None


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    city_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ===== CAR SCHEMAS =====
class CarCreate(BaseModel):
    brand_id: int
    model_id: int
    city_id: int
    title: str
    description: Optional[str] = None
    price: float
    year: int
    mileage: Optional[int] = None
    fuel_type: Optional[str] = "petrol"
    transmission: Optional[str] = "manual"
    condition_type: Optional[str] = "used"
    color: Optional[str] = None
    registration_city: Optional[str] = None


class CarUpdate(BaseModel):
    brand_id: Optional[int] = None
    model_id: Optional[int] = None
    city_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    year: Optional[int] = None
    mileage: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    condition_type: Optional[str] = None
    color: Optional[str] = None
    registration_city: Optional[str] = None


class CarOut(BaseModel):
    id: int
    seller_id: int
    brand_id: int
    model_id: int
    city_id: int
    title: str
    description: Optional[str] = None
    price: float
    year: int
    mileage: Optional[int] = None
    fuel_type: str
    transmission: str
    condition_type: str
    color: Optional[str] = None
    registration_city: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ===== LOGIN SCHEMA =====
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ===== MESSAGE SCHEMAS =====
class MessageCreate(BaseModel):
    car_id: int
    receiver_id: int
    message_text: str


class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    car_id: int
    message_text: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True