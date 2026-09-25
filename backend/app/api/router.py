from fastapi import APIRouter

from app.api.routes import amenities, bookings, favorites, health, host, listings, reviews, users

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router, tags=["health"])
api_router.include_router(amenities.router)
api_router.include_router(listings.router)
api_router.include_router(bookings.router)
api_router.include_router(host.router)
api_router.include_router(favorites.router)
api_router.include_router(reviews.router)
api_router.include_router(users.router)
