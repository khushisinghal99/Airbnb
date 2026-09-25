from datetime import date, datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator

T = TypeVar("T")


class ORMResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserResponse(ORMResponse):
    id: int
    name: str
    email: str
    role: str
    avatar_url: str | None


class UserSummary(ORMResponse):
    id: int
    name: str
    avatar_url: str | None


class ListingImageInput(BaseModel):
    url: HttpUrl
    caption: str | None = Field(default=None, max_length=180)


class ListingImageResponse(ORMResponse):
    id: int
    url: str
    caption: str | None
    position: int


class AmenityResponse(ORMResponse):
    id: int
    name: str
    slug: str
    icon_name: str | None


class ListingFields(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    description: str = Field(min_length=10, max_length=4000)
    location: str = Field(min_length=2, max_length=180)
    property_type: str = Field(min_length=2, max_length=60)
    price_per_night_cents: int = Field(ge=0)
    capacity: int = Field(gt=0, le=30)
    cleaning_fee_cents: int = Field(default=0, ge=0)
    images: list[ListingImageInput] = Field(default_factory=list, max_length=20)
    amenity_ids: list[int] = Field(default_factory=list, max_length=30)


class ListingCreate(ListingFields):
    pass


class ListingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=180)
    description: str | None = Field(default=None, min_length=10, max_length=4000)
    location: str | None = Field(default=None, min_length=2, max_length=180)
    property_type: str | None = Field(default=None, min_length=2, max_length=60)
    price_per_night_cents: int | None = Field(default=None, ge=0)
    capacity: int | None = Field(default=None, gt=0, le=30)
    cleaning_fee_cents: int | None = Field(default=None, ge=0)
    images: list[ListingImageInput] | None = Field(default=None, max_length=20)
    amenity_ids: list[int] | None = Field(default=None, max_length=30)


class ListingResponse(ORMResponse):
    id: int
    host_id: int
    title: str
    description: str
    location: str
    property_type: str
    price_per_night_cents: int
    cleaning_fee_cents: int
    rating: float | None
    capacity: int
    created_at: datetime
    updated_at: datetime
    host: UserSummary
    images: list[ListingImageResponse]
    amenities: list[AmenityResponse]


class ListingPage(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int


class BookingCreate(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guest_count: int = Field(gt=0, le=30)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        return self


class BookingQuoteRequest(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guest_count: int = Field(gt=0, le=30)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        return self


class PriceBreakdown(BaseModel):
    currency: str = "INR"
    nights: int
    nightly_price_cents: int
    nightly_subtotal_cents: int
    cleaning_fee_cents: int
    service_fee_cents: int
    total_price_cents: int


class BookingListingSummary(ORMResponse):
    id: int
    title: str
    location: str
    images: list[ListingImageResponse]


class BookingResponse(ORMResponse):
    id: int
    guest_id: int
    listing_id: int
    check_in: date
    check_out: date
    guest_count: int
    nightly_price_cents: int
    cleaning_fee_cents: int
    service_fee_cents: int
    total_price_cents: int
    status: str
    created_at: datetime
    payment_confirmation: str
    listing: BookingListingSummary


class BookingReceipt(BaseModel):
    booking: BookingResponse
    price_breakdown: PriceBreakdown


class FavoriteCreate(BaseModel):
    listing_id: int
    wishlist_name: str = Field(default="Wish List", min_length=1, max_length=100)


class FavoriteResponse(ORMResponse):
    id: int
    user_id: int
    listing_id: int
    wishlist_name: str
    created_at: datetime
    listing: ListingResponse


class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=5, max_length=2000)


class ReviewResponse(ORMResponse):
    id: int
    listing_id: int
    guest_id: int
    booking_id: int | None
    rating: int
    comment: str
    created_at: datetime
    guest: UserSummary
