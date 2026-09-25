from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Amenity
from app.schemas.api import AmenityResponse

router = APIRouter(prefix="/amenities", tags=["amenities"])


@router.get("", response_model=list[AmenityResponse])
def list_amenities(db: Session = Depends(get_db)):
    return db.scalars(select(Amenity).order_by(Amenity.name)).all()
