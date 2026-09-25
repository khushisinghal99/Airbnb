from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_host
from app.db.session import get_db
from app.models import User
from app.schemas.api import ListingResponse
from app.schemas.api import BookingResponse
from app.services.booking_service import get_host_bookings
from app.services.listing_service import get_host_listings

router = APIRouter(prefix="/host", tags=["host"])


@router.get("/listings", response_model=list[ListingResponse])
def host_listings(host: User = Depends(get_current_host), db: Session = Depends(get_db)):
    return get_host_listings(db, host)


@router.get("/bookings", response_model=list[BookingResponse])
def host_booking_list(host: User = Depends(get_current_host), db: Session = Depends(get_db)):
    return get_host_bookings(db, host)
