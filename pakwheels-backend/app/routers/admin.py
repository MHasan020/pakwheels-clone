from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Car, User
from app.schemas.schemas import CarOut
from app.core.security import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/pending", response_model=List[CarOut])
def get_pending_cars(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(Car).filter(Car.status == "pending").order_by(Car.created_at.desc()).all()


def set_car_status(car_id: int, new_status: str, db: Session):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    car.status = new_status
    db.commit()
    db.refresh(car)
    return car


@router.put("/cars/{car_id}/approve", response_model=CarOut)
def approve_car(car_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return set_car_status(car_id, "approved", db)


@router.put("/cars/{car_id}/reject", response_model=CarOut)
def reject_car(car_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return set_car_status(car_id, "rejected", db)

@router.get("/approved", response_model=List[CarOut])
def get_approved_cars(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(Car).filter(Car.status == "approved").order_by(Car.created_at.desc()).all()

@router.get("/users")
def get_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).order_by(User.id.desc()).all()
    return [
        {"id": u.id, "name": u.name, "email": u.email, "phone": u.phone, "role": u.role}
        for u in users
    ]