from datetime import date

from fastapi import HTTPException
from sqlalchemy import select, update
from sqlalchemy.orm import Session, joinedload

from app.models import Booking, Listing, User
from app.schemas.api import BookingCreate, BookingQuoteRequest, PriceBreakdown

SERVICE_FEE_PERCENT = 12


def _validate_and_price(db: Session, listing_id: int, check_in: date, check_out: date, guest_count: int):
    if check_in < date.today():
        raise HTTPException(status_code=422, detail="Check-in cannot be in the past")
    if check_out <= check_in:
        raise HTTPException(status_code=422, detail="Check-out must be after check-in")
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    if guest_count > listing.capacity:
        raise HTTPException(status_code=422, detail=f"This listing accommodates at most {listing.capacity} guests")
    overlap = db.scalar(select(Booking.id).where(
        Booking.listing_id == listing.id,
        Booking.status == "confirmed",
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    ).limit(1))
    if overlap:
        raise HTTPException(status_code=409, detail="The listing is unavailable for those dates")
    nights = (check_out - check_in).days
    subtotal = listing.price_per_night_cents * nights
    fee = (subtotal * SERVICE_FEE_PERCENT + 50) // 100
    return listing, PriceBreakdown(
        nights=nights,
        nightly_price_cents=listing.price_per_night_cents,
        nightly_subtotal_cents=subtotal,
        cleaning_fee_cents=listing.cleaning_fee_cents,
        service_fee_cents=fee,
        total_price_cents=subtotal + listing.cleaning_fee_cents + fee,
    )


def quote_booking(db: Session, request: BookingQuoteRequest) -> PriceBreakdown:
    _, breakdown = _validate_and_price(db, request.listing_id, request.check_in, request.check_out, request.guest_count)
    return breakdown


def create_booking(db: Session, guest: User, request: BookingCreate) -> tuple[Booking, PriceBreakdown]:
    # This harmless write obtains SQLite's reserved write lock before checking availability.
    # Other booking writers wait here, then see the committed booking before proceeding.
    db.execute(update(Listing).where(Listing.id == request.listing_id).values(updated_at=Listing.updated_at))
    listing, breakdown = _validate_and_price(db, request.listing_id, request.check_in, request.check_out, request.guest_count)
    if listing.host_id == guest.id:
        raise HTTPException(status_code=409, detail="Hosts cannot book their own listing")
    booking = Booking(
        guest_id=guest.id,
        listing_id=listing.id,
        check_in=request.check_in,
        check_out=request.check_out,
        guest_count=request.guest_count,
        nightly_price_cents=breakdown.nightly_price_cents,
        cleaning_fee_cents=breakdown.cleaning_fee_cents,
        service_fee_cents=breakdown.service_fee_cents,
        total_price_cents=breakdown.total_price_cents,
        status="confirmed",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking, breakdown


def get_booking(db: Session, booking_id: int, current_user: User) -> Booking:
    booking = db.scalar(select(Booking).options(joinedload(Booking.listing)).where(Booking.id == booking_id))
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.guest_id != current_user.id and booking.listing.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You cannot view this booking")
    return booking


def get_guest_bookings(db: Session, guest: User) -> list[Booking]:
    return db.scalars(select(Booking).options(joinedload(Booking.listing)).where(Booking.guest_id == guest.id).order_by(Booking.created_at.desc())).all()


def get_host_bookings(db: Session, host: User) -> list[Booking]:
    return db.scalars(select(Booking).join(Listing).options(joinedload(Booking.listing), joinedload(Booking.guest)).where(Listing.host_id == host.id).order_by(Booking.check_in)).unique().all()
