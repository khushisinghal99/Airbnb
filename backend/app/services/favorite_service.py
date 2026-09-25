from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.models import Favorite, Listing, User
from app.schemas.api import FavoriteCreate


def list_favorites(db: Session, user: User) -> list[Favorite]:
    return db.scalars(select(Favorite).options(
        joinedload(Favorite.listing).joinedload(Listing.host),
        joinedload(Favorite.listing).selectinload(Listing.images),
        joinedload(Favorite.listing).selectinload(Listing.amenities),
    ).where(Favorite.user_id == user.id).order_by(Favorite.created_at.desc())).unique().all()


def add_favorite(db: Session, user: User, data: FavoriteCreate) -> Favorite:
    if db.get(Listing, data.listing_id) is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    favorite = db.scalar(select(Favorite).where(Favorite.user_id == user.id, Favorite.listing_id == data.listing_id))
    if favorite is not None:
        favorite.wishlist_name = data.wishlist_name
        db.commit()
        return db.scalar(select(Favorite).options(joinedload(Favorite.listing).joinedload(Listing.host), joinedload(Favorite.listing).selectinload(Listing.images), joinedload(Favorite.listing).selectinload(Listing.amenities)).where(Favorite.id == favorite.id))
    favorite = Favorite(user_id=user.id, listing_id=data.listing_id, wishlist_name=data.wishlist_name)
    db.add(favorite)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="This listing is already in your favorites")
    return db.scalar(select(Favorite).options(joinedload(Favorite.listing).joinedload(Listing.host), joinedload(Favorite.listing).selectinload(Listing.images), joinedload(Favorite.listing).selectinload(Listing.amenities)).where(Favorite.id == favorite.id))


def remove_favorite(db: Session, user: User, listing_id: int) -> None:
    favorite = db.scalar(select(Favorite).where(Favorite.user_id == user.id, Favorite.listing_id == listing_id))
    if favorite is None:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(favorite)
    db.commit()
