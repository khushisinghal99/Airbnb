from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Listing(Base):
    __tablename__ = "listings"
    __table_args__ = (
        CheckConstraint("price_per_night_cents >= 0", name="ck_listings_price_nonnegative"),
        CheckConstraint("capacity > 0", name="ck_listings_capacity_positive"),
        CheckConstraint("rating IS NULL OR (rating >= 0 AND rating <= 5)", name="ck_listings_rating_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str] = mapped_column(String(4000), nullable=False)
    location: Mapped[str] = mapped_column(String(180), index=True, nullable=False)
    property_type: Mapped[str] = mapped_column(String(60), nullable=False)
    price_per_night_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    rating: Mapped[float | None] = mapped_column(nullable=True)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    cleaning_fee_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    host: Mapped["User"] = relationship(back_populates="listings")
    images: Mapped[list["ListingImage"]] = relationship(back_populates="listing", cascade="all, delete-orphan", order_by="ListingImage.position")
    amenities: Mapped[list["Amenity"]] = relationship(secondary="listing_amenities", back_populates="listings")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="listing")
    reviews: Mapped[list["Review"]] = relationship(back_populates="listing", cascade="all, delete-orphan")
    favorites: Mapped[list["Favorite"]] = relationship(back_populates="listing", cascade="all, delete-orphan")


class ListingImage(Base):
    __tablename__ = "listing_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), index=True, nullable=False)
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    caption: Mapped[str | None] = mapped_column(String(180))
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    listing: Mapped["Listing"] = relationship(back_populates="images")


class ListingAmenity(Base):
    __tablename__ = "listing_amenities"

    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True)
    amenity_id: Mapped[int] = mapped_column(ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True)
