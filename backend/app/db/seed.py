from datetime import date, timedelta

from sqlalchemy import func, select

from app.db.session import SessionLocal, init_db
from app.models import Amenity, Booking, Favorite, Listing, ListingImage, Review, User

HOST_DATA = [
    ("Aarav Mehta", "aarav@example.com"),
    ("Maya Kapoor", "maya@example.com"),
    ("Ishaan Rao", "ishaan@example.com"),
    ("Nina Fernandes", "nina@example.com"),
    ("Kabir Shah", "kabir@example.com"),
]
GUEST_DATA = [
    ("Ananya Iyer", "ananya@example.com"),
    ("Rohan Das", "rohan@example.com"),
    ("Sara Thomas", "sara@example.com"),
    ("Dev Malhotra", "dev@example.com"),
]
AMENITY_DATA = [
    ("Wifi", "wifi", "wifi"), ("Kitchen", "kitchen", "cooking-pot"),
    ("Air conditioning", "air-conditioning", "snowflake"), ("Free parking", "free-parking", "car"),
    ("Pool", "pool", "waves"), ("Workspace", "workspace", "laptop"),
    ("Washer", "washer", "washing-machine"), ("Mountain view", "mountain-view", "mountain"),
    ("Pets allowed", "pets-allowed", "paw-print"), ("Hot tub", "hot-tub", "bath"),
]
STAYS = [
    ("Coorg", "Rainwood cabin among the coffee trees", "A timber cabin with a wide deck, misty mornings and a peaceful coffee estate setting.", "Cabin", 12800, 4),
    ("Goa", "Casa Sol near the quiet end of the beach", "A breezy Portuguese-style home with a shaded courtyard and easy beach access.", "Villa", 18400, 6),
    ("Manali", "Pine View alpine cottage", "Wake up to cedar forests and mountain air in this warm, wood-lined cottage.", "Cottage", 9600, 4),
    ("Jaipur", "The Pink Courtyard haveli suite", "A restored haveli room with hand-painted details and a leafy shared courtyard.", "Guesthouse", 7400, 2),
    ("Alibaug", "Salt House with a private plunge pool", "A simple coastal home designed for long lunches and slow afternoons.", "Villa", 22000, 8),
    ("Udaipur", "Lakeview terrace apartment", "An airy apartment with a rooftop terrace and views across the old city.", "Apartment", 11200, 3),
    ("Rishikesh", "Ganga-side garden cottage", "A calm garden stay with river walks, yoga space and a well-equipped kitchen.", "Cottage", 8900, 3),
    ("Ooty", "Fernhill tea estate bungalow", "A heritage bungalow surrounded by tea gardens, with fireplaces and garden paths.", "Bungalow", 15600, 6),
    ("Pondicherry", "Blue Door French quarter home", "A colorful, renovated home with a sunny balcony near cafes and the promenade.", "Townhouse", 10300, 4),
    ("Lonavala", "Monsoon Ridge glass cabin", "A compact hilltop retreat with a picture window overlooking the valley.", "Cabin", 13200, 2),
    ("Munnar", "Cloudline tea garden stay", "A peaceful plantation home with winding walks through the tea fields.", "Farm stay", 10800, 4),
    ("Gokarna", "Kadal beach bungalow", "A relaxed bungalow a short walk from a quiet stretch of sand.", "Bungalow", 9800, 5),
    ("Shimla", "Cedar House with a mountain balcony", "A bright family home with a fireplace, reading corners and forest views.", "Chalet", 14500, 6),
    ("Hampi", "Stone & Sky heritage home", "A thoughtfully restored home with local stonework and open-sky dining.", "Heritage home", 8200, 4),
    ("Kochi", "Fort Kochi artist's residence", "A calm old-town residence filled with art, books and tropical plants.", "Townhouse", 11900, 3),
    ("Wayanad", "Wild Fig treehouse", "A private treehouse tucked into a green hillside with birdsong all around.", "Treehouse", 13900, 2),
    ("Varanasi", "Ghat House rooftop room", "A welcoming guesthouse room with a shared rooftop and old-city views.", "Guesthouse", 6500, 2),
    ("Pune", "The Gulmohar urban loft", "A clean, modern loft with a dedicated desk and easy access to neighborhood cafes.", "Loft", 9200, 3),
]

# Each stay has its own photo set so the card and gallery match its location
# and property style. These are representative mock photos from Unsplash.
STAY_PHOTOS = {
    "Coorg": ["1510798831971-661eb04b3739", "1441974231531-c6227db76b6e", "1600210492486-724fe5c67fb0"],
    "Goa": ["1507525428034-b723cf961d3e", "1540541338287-41700207dee6", "1499793983690-e29da59ef1c2"],
    "Manali": ["1464822759023-fed622ff2c3b", "1519681393784-d120267933ba", "1600210492486-724fe5c67fb0"],
    "Jaipur": ["1524229321985-1e1989075d9b", "1600607687939-ce8a6c25118c", "1499793983690-e29da59ef1c2"],
    "Alibaug": ["1571896349842-33c89424de2d", "1507525428034-b723cf961d3e", "1600585154340-be6161a56a0c"],
    "Udaipur": ["1470770841072-f978cf4d019e", "1524492412937-b28074a5d7da", "1600210492486-724fe5c67fb0"],
    "Rishikesh": ["1501785888041-af3ef285b470", "1441974231531-c6227db76b6e", "1600585154340-be6161a56a0c"],
    "Ooty": ["1449158743715-0a90ebb6d2d8", "1510798831971-661eb04b3739", "1600210492486-724fe5c67fb0"],
    "Pondicherry": ["1523906834658-6e24ef2386f9", "1600607687939-ce8a6c25118c", "1499793983690-e29da59ef1c2"],
    "Lonavala": ["1518780664697-55e3ad937233", "1501785888041-af3ef285b470", "1600210492486-724fe5c67fb0"],
    "Munnar": ["1500530855697-b586d89ba3ee", "1441974231531-c6227db76b6e", "1600585154340-be6161a56a0c"],
    "Gokarna": ["1519046904884-53103b34b206", "1507525428034-b723cf961d3e", "1499793983690-e29da59ef1c2"],
    "Shimla": ["1519681393784-d120267933ba", "1464822759023-fed622ff2c3b", "1600210492486-724fe5c67fb0"],
    "Hampi": ["1764426381040-d451fb82c8b5", "1501785888041-af3ef285b470", "1600607687939-ce8a6c25118c"],
    "Kochi": ["1499793983690-e29da59ef1c2", "1523906834658-6e24ef2386f9", "1600607687939-ce8a6c25118c"],
    "Wayanad": ["1441974231531-c6227db76b6e", "1500530855697-b586d89ba3ee", "1510798831971-661eb04b3739"],
    "Varanasi": ["1561361058-c24cecae35ca", "1600607687939-ce8a6c25118c", "1524229321985-1e1989075d9b"],
    "Pune": ["1600607687939-ce8a6c25118c", "1600210492486-724fe5c67fb0", "1600566753086-00f18fb6b3ea"],
}


def refresh_seed_listing_images(db) -> int:
    """Refresh photos for known demo stays without touching user-created listings."""
    refreshed = 0
    for location, title, *_ in STAYS:
        listing = db.scalar(select(Listing).where(Listing.title == title))
        if listing is None:
            continue
        listing.images = [
            ListingImage(
                url=f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w=1200&q=85",
                caption=f"{location} stay — {['exterior and setting', 'surrounding area', 'interior'][position]}",
                position=position,
            )
            for position, photo_id in enumerate(STAY_PHOTOS[location])
        ]
        refreshed += 1
    return refreshed


def seed_database() -> None:
    init_db()
    with SessionLocal() as db:
        existing = db.scalar(select(func.count(User.id)))
        if existing:
            refreshed = refresh_seed_listing_images(db)
            db.commit()
            print(f"Seed data already exists; refreshed photos for {refreshed} demo listings.")
            return

        hosts = [User(name=name, email=email, role="host", avatar_url=f"https://i.pravatar.cc/160?img={index + 12}") for index, (name, email) in enumerate(HOST_DATA)]
        guests = [User(name=name, email=email, role="guest", avatar_url=f"https://i.pravatar.cc/160?img={index + 24}") for index, (name, email) in enumerate(GUEST_DATA)]
        db.add_all(hosts + guests)
        amenities = [Amenity(name=name, slug=slug, icon_name=icon) for name, slug, icon in AMENITY_DATA]
        db.add_all(amenities)
        db.flush()

        listings = []
        for index, (location, title, description, property_type, price, capacity) in enumerate(STAYS):
            listing = Listing(
                host=hosts[index % len(hosts)], title=title, description=description,
                location=f"{location}, India", property_type=property_type,
                price_per_night_cents=price * 100, cleaning_fee_cents=(price // 8) * 100,
                rating=round(4.72 + (index % 28) / 100, 2), capacity=capacity,
            )
            listing.images = [
                ListingImage(
                    url=f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w=1200&q=85",
                    caption=f"{location} stay — {['exterior and setting', 'surrounding area', 'interior'][image_number]}",
                    position=image_number,
                )
                for image_number, photo_id in enumerate(STAY_PHOTOS[location])
            ]
            listing.amenities = [amenities[(index + offset) % len(amenities)] for offset in range(5)]
            listings.append(listing)
        db.add_all(listings)
        db.flush()

        today = date.today()
        bookings = []
        for index in range(6):
            listing = listings[index]
            check_in = today - timedelta(days=70 - index * 5)
            nights = 2 + index % 3
            nightly = listing.price_per_night_cents
            cleaning = listing.cleaning_fee_cents
            service = (nightly * nights * 12 + 50) // 100
            bookings.append(Booking(
                guest=guests[index % len(guests)], listing=listing,
                check_in=check_in, check_out=check_in + timedelta(days=nights), guest_count=min(2, listing.capacity),
                nightly_price_cents=nightly, cleaning_fee_cents=cleaning,
                service_fee_cents=service, total_price_cents=nightly * nights + cleaning + service,
                status="completed",
            ))
        # These future stays also demonstrate how confirmed reservations are stored.
        for index in range(3):
            listing = listings[10 + index]
            check_in = today + timedelta(days=35 + index * 14)
            nights = 3
            nightly = listing.price_per_night_cents
            cleaning = listing.cleaning_fee_cents
            service = (nightly * nights * 12 + 50) // 100
            bookings.append(Booking(
                guest=guests[index], listing=listing, check_in=check_in,
                check_out=check_in + timedelta(days=nights), guest_count=2,
                nightly_price_cents=nightly, cleaning_fee_cents=cleaning,
                service_fee_cents=service, total_price_cents=nightly * nights + cleaning + service,
                status="confirmed",
            ))
        db.add_all(bookings)
        db.flush()

        for index, booking in enumerate(bookings[:6]):
            db.add(Review(
                listing=booking.listing, guest=booking.guest, booking=booking,
                rating=4 + index % 2,
                comment=("A lovely, comfortable stay. The host was thoughtful and the place matched the photos." if index % 2 == 0 else "Beautiful setting, easy check-in and a very relaxing visit. Would happily return."),
            ))
        for guest_index, guest in enumerate(guests):
            for offset in range(3):
                listing = listings[(guest_index * 3 + offset + 2) % len(listings)]
                db.add(Favorite(user=guest, listing=listing, wishlist_name=("Weekend ideas" if offset % 2 == 0 else "Dream stays")))

        db.commit()
        print(f"Seeded {len(hosts) + len(guests)} users, {len(listings)} listings, {len(bookings)} bookings, {len(bookings[:6])} reviews, and {len(guests) * 3} favorites.")


if __name__ == "__main__":
    seed_database()
