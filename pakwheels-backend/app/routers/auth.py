from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from jose import jwt, JWTError
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserOut, LoginRequest, Token
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    SECRET_KEY,
    ALGORITHM,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

RESET_TOKEN_EXPIRE_MINUTES = 30


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Sirf buyer ya seller allowed hai, admin yahan se nahi ban sakta
    role = user.role if user.role in ("buyer", "seller") else "buyer"

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        phone=user.phone,
        role=role,
        city_id=user.city_id,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


def _reset_key(user: User) -> str:
    # Key mein purana password hash shamil hai, isliye password badalte hi purana link bekaar ho jata hai
    return SECRET_KEY + user.password_hash


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user:
        payload = {
            "uid": user.id,
            "exp": datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
        }
        token = jwt.encode(payload, _reset_key(user), algorithm=ALGORITHM)
        link = f"http://localhost:5173/reset-password?token={token}"
        # Abhi email ki jagah terminal mein print hota hai. Deployment ke waqt yahan asli email bhejenge.
        print("PASSWORD RESET LINK:", link)
    # Hamesha same jawab, taake koi andaza na laga sake ke kaunsi email registered hai
    return {"message": "If this email is registered, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    invalid = HTTPException(status_code=400, detail="Reset link is invalid or has expired")
    try:
        claims = jwt.get_unverified_claims(data.token)
        user = db.query(User).filter(User.id == int(claims.get("uid"))).first()
        if user is None:
            raise invalid
        jwt.decode(data.token, _reset_key(user), algorithms=[ALGORITHM])
    except (JWTError, ValueError, TypeError):
        raise invalid

    user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}