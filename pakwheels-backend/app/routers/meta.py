from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import City, Brand, CarModel

router = APIRouter(tags=["Meta"])


@router.get("/cities")
def get_cities(db: Session = Depends(get_db)):
    return [{"id": c.id, "name": c.name} for c in db.query(City).all()]


@router.get("/brands")
def get_brands(db: Session = Depends(get_db)):
    return [{"id": b.id, "name": b.name} for b in db.query(Brand).all()]


@router.get("/brands/{brand_id}/models")
def get_models(brand_id: int, db: Session = Depends(get_db)):
    models = db.query(CarModel).filter(CarModel.brand_id == brand_id).all()
    return [{"id": m.id, "name": m.name} for m in models]