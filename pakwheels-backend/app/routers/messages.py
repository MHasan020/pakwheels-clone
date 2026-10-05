from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from app.database import get_db
from app.models.models import Message, Car, User
from app.schemas.schemas import MessageCreate, MessageOut
from app.core.security import get_current_user

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/", response_model=MessageOut)
def send_message(msg: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    car = db.query(Car).filter(Car.id == msg.car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    new_msg = Message(
        sender_id=current_user.id,
        receiver_id=msg.receiver_id,
        car_id=msg.car_id,
        message_text=msg.message_text,
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg


@router.get("/car/{car_id}/with/{other_user_id}", response_model=List[MessageOut])
def get_thread(car_id: int, other_user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Message).filter(
        Message.car_id == car_id,
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id),
        )
    ).order_by(Message.created_at.asc()).all()


@router.get("/inbox")
def get_inbox(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    messages = db.query(Message).filter(
        or_(Message.sender_id == current_user.id, Message.receiver_id == current_user.id)
    ).order_by(Message.created_at.desc()).all()

    conversations = {}
    for m in messages:
        other_id = m.receiver_id if m.sender_id == current_user.id else m.sender_id
        key = (m.car_id, other_id)
        if key not in conversations:
            car = db.query(Car).filter(Car.id == m.car_id).first()
            other_user = db.query(User).filter(User.id == other_id).first()
            conversations[key] = {
                "car_id": m.car_id,
                "car_title": car.title if car else "Unknown",
                "other_user_id": other_id,
                "other_user_name": other_user.name if other_user else "Unknown",
                "last_message": m.message_text,
                "last_time": m.created_at,
            }
    return list(conversations.values())