from datetime import date

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models import Booking, Listing, Review, User
from app.schemas.api import ReviewCreate


def list_listing_reviews(db: Session, listing_id: int) -> list[Review]:
    if db.get(Listing, listing_id) is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return db.scalars(select(Review).options(joinedload(Review.guest)).where(Review.listing_id == listing_id).order_by(Review.created_at.desc())).all()


def create_review(db: Session, guest: User, data: ReviewCreate) -> Review:
    booking = db.scalar(select(Booking).where(Booking.id == data.booking_id, Booking.guest_id == guest.id))
    if booking is None:
        raise HTTPException(status_code=404, detail="Completed booking not found for this user")
    if booking.status != "completed" or booking.check_out > date.today():
        raise HTTPException(status_code=409, detail="A review can be added after the stay is complete")
    if booking.review is not None:
        raise HTTPException(status_code=409, detail="This booking already has a review")
    review = Review(booking_id=booking.id, listing_id=booking.listing_id, guest_id=guest.id, rating=data.rating, comment=data.comment)
    db.add(review)
    db.flush()
    average = db.scalar(select(func.avg(Review.rating)).where(Review.listing_id == booking.listing_id))
    booking.listing.rating = round(float(average), 2) if average is not None else None
    db.commit()
    db.refresh(review)
    return db.scalar(select(Review).options(joinedload(Review.guest)).where(Review.id == review.id))
