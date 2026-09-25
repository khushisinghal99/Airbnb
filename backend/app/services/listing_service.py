from datetime import date

from fastapi import HTTPException
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import Amenity, Booking, Listing, ListingImage, User
from app.schemas.api import ListingCreate, ListingUpdate


def _listing_options():
    return (joinedload(Listing.host), selectinload(Listing.images), selectinload(Listing.amenities))


def list_listings(
    db: Session, *, location: str | None, check_in: date | None, check_out: date | None,
    guests: int | None, min_price: int | None, max_price: int | None,
    property_type: str | None, amenities: list[str], page: int, page_size: int,
):
    query = select(Listing)
    conditions = []
    if location:
        conditions.append(Listing.location.ilike(f"%{location.strip()}%"))
    if guests is not None:
        conditions.append(Listing.capacity >= guests)
    if min_price is not None:
        conditions.append(Listing.price_per_night_cents >= min_price)
    if max_price is not None:
        conditions.append(Listing.price_per_night_cents <= max_price)
    if property_type:
        conditions.append(Listing.property_type.ilike(property_type.strip()))
    if amenities:
        for slug in amenities:
            conditions.append(Listing.amenities.any(Amenity.slug == slug))
    if check_in and check_out:
        unavailable = select(Booking.id).where(
            Booking.listing_id == Listing.id,
            Booking.status == "confirmed",
            Booking.check_in < check_out,
            Booking.check_out > check_in,
        )
        conditions.append(~unavailable.exists())
    if conditions:
        query = query.where(and_(*conditions))

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    items = db.scalars(
        query.options(*_listing_options())
        .order_by(Listing.rating.desc().nullslast(), Listing.id)
        .offset((page - 1) * page_size).limit(page_size)
    ).unique().all()
    return items, total


def get_listing(db: Session, listing_id: int) -> Listing:
    listing = db.scalar(select(Listing).options(*_listing_options()).where(Listing.id == listing_id))
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


def get_host_listings(db: Session, host: User) -> list[Listing]:
    return db.scalars(select(Listing).options(*_listing_options()).where(Listing.host_id == host.id).order_by(Listing.created_at.desc())).unique().all()


def _amenities_by_id(db: Session, ids: list[int]) -> list[Amenity]:
    unique_ids = set(ids)
    amenities = db.scalars(select(Amenity).where(Amenity.id.in_(unique_ids))).all() if unique_ids else []
    if len(amenities) != len(unique_ids):
        raise HTTPException(status_code=422, detail="One or more amenities do not exist")
    return amenities


def create_listing(db: Session, host: User, data: ListingCreate) -> Listing:
    values = data.model_dump(exclude={"images", "amenity_ids"})
    listing = Listing(**values, host=host)
    listing.images = [ListingImage(url=str(photo.url), caption=photo.caption, position=index) for index, photo in enumerate(data.images)]
    listing.amenities = _amenities_by_id(db, data.amenity_ids)
    db.add(listing)
    db.commit()
    return get_listing(db, listing.id)


def update_listing(db: Session, listing_id: int, host: User, data: ListingUpdate) -> Listing:
    listing = get_listing(db, listing_id)
    if listing.host_id != host.id:
        raise HTTPException(status_code=403, detail="You can only edit your own listings")
    values = data.model_dump(exclude_unset=True)
    if "images" in values:
        photos = values.pop("images") or []
        listing.images = [ListingImage(url=str(photo["url"]), caption=photo.get("caption"), position=index) for index, photo in enumerate(photos)]
    if "amenity_ids" in values:
        listing.amenities = _amenities_by_id(db, values.pop("amenity_ids") or [])
    for field, value in values.items():
        setattr(listing, field, value)
    db.commit()
    return get_listing(db, listing.id)


def delete_listing(db: Session, listing_id: int, host: User) -> None:
    listing = get_listing(db, listing_id)
    if listing.host_id != host.id:
        raise HTTPException(status_code=403, detail="You can only delete your own listings")
    any_booking = db.scalar(select(Booking.id).where(
        Booking.listing_id == listing.id
    ).limit(1))
    if any_booking:
        raise HTTPException(status_code=409, detail="Cannot delete a listing with booking history")
    db.delete(listing)
    db.commit()
