from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_host
from app.db.session import get_db
from app.models import User
from app.schemas.api import ListingCreate, ListingPage, ListingResponse, ListingUpdate
from app.services import listing_service
from app.services.review_service import list_listing_reviews
from app.schemas.api import ReviewResponse

router = APIRouter(prefix="/listings", tags=["listings"])


@router.get("", response_model=ListingPage[ListingResponse])
def search_listings(
    location: str | None = Query(default=None, max_length=180),
    check_in: date | None = None,
    check_out: date | None = None,
    guests: int | None = Query(default=None, gt=0, le=30),
    min_price: int | None = Query(default=None, ge=0, description="Minimum nightly price in INR cents"),
    max_price: int | None = Query(default=None, ge=0, description="Maximum nightly price in INR cents"),
    property_type: str | None = Query(default=None, max_length=60),
    amenities: list[str] = Query(default=[]),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    if (check_in is None) != (check_out is None):
        raise HTTPException(status_code=422, detail="check_in and check_out must be provided together")
    if check_in is not None and check_out is not None and check_out <= check_in:
        raise HTTPException(status_code=422, detail="check_out must be after check_in")
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(status_code=422, detail="min_price cannot exceed max_price")
    items, total = listing_service.list_listings(
        db, location=location, check_in=check_in, check_out=check_out, guests=guests,
        min_price=min_price, max_price=max_price, property_type=property_type,
        amenities=amenities, page=page, page_size=page_size,
    )
    return ListingPage[ListingResponse](items=items, total=total, page=page, page_size=page_size)


@router.get("/{listing_id}", response_model=ListingResponse)
def read_listing(listing_id: int, db: Session = Depends(get_db)):
    return listing_service.get_listing(db, listing_id)


@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(data: ListingCreate, host: User = Depends(get_current_host), db: Session = Depends(get_db)):
    return listing_service.create_listing(db, host, data)


@router.put("/{listing_id}", response_model=ListingResponse)
def replace_listing(listing_id: int, data: ListingCreate, host: User = Depends(get_current_host), db: Session = Depends(get_db)):
    return listing_service.update_listing(db, listing_id, host, ListingUpdate(**data.model_dump()))


@router.patch("/{listing_id}", response_model=ListingResponse)
def edit_listing(listing_id: int, data: ListingUpdate, host: User = Depends(get_current_host), db: Session = Depends(get_db)):
    return listing_service.update_listing(db, listing_id, host, data)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_listing(listing_id: int, host: User = Depends(get_current_host), db: Session = Depends(get_db)):
    listing_service.delete_listing(db, listing_id, host)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{listing_id}/reviews", response_model=list[ReviewResponse])
def listing_reviews(listing_id: int, db: Session = Depends(get_db)):
    return list_listing_reviews(db, listing_id)
