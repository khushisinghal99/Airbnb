from datetime import date, datetime, timezone

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        CheckConstraint("check_out > check_in", name="ck_bookings_date_order"),
        CheckConstraint("guest_count > 0", name="ck_bookings_guest_count_positive"),
        CheckConstraint("nightly_price_cents >= 0 AND cleaning_fee_cents >= 0 AND service_fee_cents >= 0 AND total_price_cents >= 0", name="ck_bookings_amounts_nonnegative"),
        CheckConstraint("status IN ('confirmed', 'cancelled', 'completed')", name="ck_bookings_status"),
        Index("ix_bookings_listing_dates_status", "listing_id", "check_in", "check_out", "status"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    guest_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True, nullable=False)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="RESTRICT"), index=True, nullable=False)
    check_in: Mapped[date] = mapped_column(Date, nullable=False)
    check_out: Mapped[date] = mapped_column(Date, nullable=False)
    guest_count: Mapped[int] = mapped_column(Integer, nullable=False)
    nightly_price_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    cleaning_fee_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    service_fee_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_price_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="confirmed", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    guest: Mapped["User"] = relationship(back_populates="bookings")
    listing: Mapped["Listing"] = relationship(back_populates="bookings")
    review: Mapped["Review | None"] = relationship(back_populates="booking", uselist=False)

    @property
    def payment_confirmation(self) -> str:
        return "mock_confirmed" if self.status == "confirmed" else "not_applicable"
