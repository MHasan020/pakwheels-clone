from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import uuid
import os
from app.database import get_db
from app.models.models import Car, User, CarImage, Favorite
from app.schemas.schemas import CarCreate, CarOut, CarUpdate
from app.core.security import get_current_user

router = APIRouter(prefix="/cars", tags=["Cars"])

UPLOAD_DIR = "app/uploads"


# CREATE - naya car listing post karna (login zaroori hai)
@router.post("/", response_model=CarOut)
def create_car(car: CarCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ("seller", "admin"):
        raise HTTPException(status_code=403, detail="Only sellers can post ads")
    new_car = Car(**car.dict(), seller_id=current_user.id)
    db.add(new_car)
    db.commit()
    db.refresh(new_car)
    return new_car


# READ ALL - saari cars dekhna, filters ke sath (koi login zaroori nahi)
@router.get("/", response_model=List[CarOut])
def get_cars(
    q: Optional[str] = None,
    city_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Car).filter(Car.status == "approved")

    if q:
        query = query.filter(Car.title.ilike(f"%{q}%"))
    if city_id:
        query = query.filter(Car.city_id == city_id)
    if brand_id:
        query = query.filter(Car.brand_id == brand_id)
    if min_price is not None:
        query = query.filter(Car.price >= min_price)
    if max_price is not None:
        query = query.filter(Car.price <= max_price)

    return query.order_by(Car.created_at.desc()).all()


# ===== MY ADS ===== (ye /{car_id} se PEHLE hona zaroori hai)
@router.get("/my/ads", response_model=List[CarOut])
def get_my_ads(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Car).filter(Car.seller_id == current_user.id).order_by(Car.created_at.desc()).all()


# ===== FAVORITES ===== (ye bhi /{car_id} se PEHLE hona zaroori hai)
@router.get("/my/favorites", response_model=List[CarOut])
def get_my_favorites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    favs = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    car_ids = [f.car_id for f in favs]
    return db.query(Car).filter(Car.id.in_(car_ids)).all()


# READ ONE - ek car ki detail dekhna
@router.get("/{car_id}", response_model=CarOut)
def get_car(car_id: int, db: Session = Depends(get_db)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return car


# UPDATE - sirf apni car edit kar sakte ho
@router.put("/{car_id}", response_model=CarOut)
def update_car(car_id: int, updated_car: CarUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    if car.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this car")

    for key, value in updated_car.dict(exclude_unset=True).items():
        setattr(car, key, value)

    db.commit()
    db.refresh(car)
    return car


# DELETE - sirf apni car delete kar sakte ho
@router.delete("/{car_id}")
def delete_car(car_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    if car.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this car")

    db.delete(car)
    db.commit()
    return {"message": "Car deleted successfully"}


# ===== CAR IMAGES =====

@router.post("/{car_id}/images")
def add_car_image(car_id: int, image_url: str, is_primary: bool = False, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    if car.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add images to this car")

    new_image = CarImage(car_id=car_id, image_url=image_url, is_primary=is_primary)
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return new_image


@router.get("/{car_id}/images")
def get_car_images(car_id: int, db: Session = Depends(get_db)):
    images = db.query(CarImage).filter(CarImage.car_id == car_id).all()
    return images


@router.delete("/images/{image_id}")
def delete_car_image(image_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    image = db.query(CarImage).filter(CarImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    car = db.query(Car).filter(Car.id == image.car_id).first()
    if car.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this image")

    db.delete(image)
    db.commit()
    return {"message": "Image deleted successfully"}


@router.post("/{car_id}/images/upload")
def upload_car_image(
    car_id: int,
    file: UploadFile = File(...),
    is_primary: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    if car.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add images to this car")

    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"http://127.0.0.1:8000/uploads/{filename}"
    new_image = CarImage(car_id=car_id, image_url=image_url, is_primary=is_primary)
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return new_image


# ===== FAVORITES (add/remove) =====

@router.post("/{car_id}/favorite")
def add_favorite(car_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id, Favorite.car_id == car_id
    ).first()
    if existing:
        return {"message": "Already in favorites"}

    fav = Favorite(user_id=current_user.id, car_id=car_id)
    db.add(fav)
    db.commit()
    return {"message": "Added to favorites"}


@router.delete("/{car_id}/favorite")
def remove_favorite(car_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id, Favorite.car_id == car_id
    ).first()
    if fav:
        db.delete(fav)
        db.commit()
    return {"message": "Removed from favorites"}