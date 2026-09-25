from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_host, get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.api import BookingCreate, BookingQuoteRequest, BookingReceipt, BookingResponse, PriceBreakdown
from app.services import booking_service

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/quote", response_model=PriceBreakdown)
def quote_booking(data: BookingQuoteRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return booking_service.quote_booking(db, data)


@router.post("", response_model=BookingReceipt, status_code=status.HTTP_201_CREATED)
def create_booking(data: BookingCreate, guest: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking, breakdown = booking_service.create_booking(db, guest, data)
    return BookingReceipt(booking=booking, price_breakdown=breakdown)


@router.get("/mine", response_model=list[BookingResponse])
def my_bookings(guest: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return booking_service.get_guest_bookings(db, guest)


@router.get("/{booking_id}", response_model=BookingResponse)
def read_booking(booking_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return booking_service.get_booking(db, booking_id, user)


@router.get("/host/mine", response_model=list[BookingResponse])
def host_bookings(host: User = Depends(get_current_host), db: Session = Depends(get_db)):
    return booking_service.get_host_bookings(db, host)
