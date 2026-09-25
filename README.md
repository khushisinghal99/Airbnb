# Staybnb

Staybnb is a student full-stack short-stay marketplace inspired by familiar home-rental apps. Guests can browse and filter stays, save favorites, and create mock-confirmed bookings. Hosts can manage their own listings and view their bookings. Data is stored in SQLite.

## Features

- Responsive listing marketplace with location, date, guest, property type, price, and amenity filters
- Listing details with photo gallery, amenities, reviews, availability dates, and a server-priced booking summary
- Booking validation, mock checkout, confirmation, and My Trips
- Guest wishlists/favorites
- Host dashboard with listing create, edit, delete, and host booking views
- Seeded demo data with 18 stays and location/property-themed photo sets
- Health endpoint and interactive FastAPI documentation

## Tech stack

- Frontend: Next.js 15, React, TypeScript, Tailwind CSS, Lucide React, date-fns
- Backend: Python, FastAPI, Pydantic Settings, SQLAlchemy 2
- Database: SQLite
- API: JSON REST with a mock current-user header

## Architecture

The frontend and backend are separate applications. Next.js pages compose UI components; reusable API modules call FastAPI. FastAPI route handlers validate requests and delegate database/business operations to services. SQLAlchemy models define persistence and relationships. Booking prices and availability are checked by the backend; the browser does not determine the final charge.

## Project structure

```text
frontend/
  src/app/               Next.js routes and global styles
  src/components/        Marketplace, listing, booking, host, and shared UI
  src/lib/api/            Typed API client and endpoint modules
  public/                 Local fallback artwork
  .env.example            Public API URL example
backend/
  app/api/routes/         FastAPI routers
  app/core/               Environment-backed settings
  app/db/                 Engine, session, initialization, and seed scripts
  app/models/             SQLAlchemy tables and relationships
  app/schemas/            Pydantic request/response models
  app/services/           Listing, booking, favorite, review, and health logic
  .env.example            Backend setting examples
  requirements.txt        Python dependencies
```

Main frontend routes are `/`, `/listings/[id]`, `/checkout/[listingId]`, `/booking-confirmation/[bookingId]`, `/trips`, `/wishlist`, `/host`, `/host/listings/new`, and `/host/listings/[id]/edit`.

## Database overview

| Table | Purpose and relationships |
|---|---|
| `users` | Mock guest and host accounts; a host owns listings and a guest creates bookings/reviews. |
| `listings` | Stay details, price, capacity, property type, rating, and host foreign key. |
| `listing_images` | Ordered image URLs and captions; each image belongs to one listing. |
| `amenities` | Reusable amenity definitions. |
| `listing_amenities` | Many-to-many link between listings and amenities. |
| `bookings` | Guest/listing reservation, exclusive check-out date, guest count, price snapshots, fees, and status. |
| `reviews` | Guest review associated with a listing and, when submitted, a completed booking. |
| `favorites` | User-to-listing saved item, unique per pair. |

SQLite is configured at `backend/staybnb.db` when commands run from `backend/`. The database file is ignored by Git; it is created locally by initialization/seed commands and retained across backend restarts.

## Main API endpoints

All endpoints are prefixed by `/api`.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | API health check. |
| `GET` | `/users/me` | Return the selected mock user. |
| `GET` | `/amenities` | List filterable amenities. |
| `GET`, `POST` | `/listings` | Search and paginate listings; create as the selected host. |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/listings/{id}` | Read or manage a listing; changes require host ownership. |
| `GET` | `/host/listings`, `/host/bookings` | Selected host's listings and bookings. |
| `POST` | `/bookings/quote` | Validate dates/guests/availability and return a price quote. |
| `POST` | `/bookings` | Create a confirmed booking with mock payment. |
| `GET` | `/bookings/mine`, `/bookings/{id}` | List the selected guest's bookings or read an authorized booking. |
| `GET`, `POST` | `/favorites` | List/add the selected user's favorites. |
| `DELETE` | `/favorites/{listing_id}` | Remove a favorite. |
| `GET` | `/listings/{id}/reviews` | List reviews for a stay. |
| `POST` | `/reviews` | Submit a review for an eligible completed booking. |

Interactive API docs are available at `http://127.0.0.1:8000/docs` while the backend is running.

## Booking and availability validation

The backend rejects check-in dates in the past, check-out dates that are not after check-in, missing listings, guest counts above listing capacity, and date ranges that overlap a confirmed booking. Ranges use check-in inclusive/check-out exclusive semantics, so a guest can check in on another booking's check-out date. The service calculates nights and the authoritative total using the listing's current nightly price, cleaning fee, and a 12% service fee, then stores price snapshots on the booking. SQLite obtains a write lock before the overlap check to reduce concurrent double bookings.

## Guest and host roles

Authentication is intentionally mocked. The frontend stores a selected demo user ID in local storage and sends it as `X-User-Id`; if omitted, the API defaults to guest ID `6`. Seeded host IDs are `1` through `5`. The header switches between guest ID `6` and host ID `1`. Backend dependencies check the selected user's role, and host listing updates/deletes also check ownership. This is assignment/demo behavior, not production authentication.

## Run locally

Requirements: Node.js 20.9+ with npm, and Python 3.10+.

### Backend (PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m app.db.initialize
python -m app.db.seed
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

If PowerShell blocks virtual-environment activation, run the environment's interpreter directly after creation:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m app.db.initialize
.\.venv\Scripts\python.exe -m app.db.seed
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend (another terminal)

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. To create a production frontend build, run `npm run build` from `frontend/`.

On Windows, if `npm` is not found but Node.js is installed in its standard location, add it to the current terminal's path and invoke the Windows command shim:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
npm.cmd install
npm.cmd run dev
```

If Windows denies access to port `8000`, run Uvicorn with `--port 8001` and set `NEXT_PUBLIC_API_URL=http://127.0.0.1:8001/api` in `frontend/.env.local`, then restart Next.js.

### Environment variables

`backend/.env.example`:

```dotenv
APP_NAME=Staybnb API
DATABASE_URL=sqlite:///./staybnb.db
FRONTEND_ORIGIN=http://localhost:3000
```

`frontend/.env.example`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Both applications have defaults for local development. `.env` and `.env.local` are ignored and should not be committed. Do not put secrets in `NEXT_PUBLIC_` variables.

### Seed data

Run from `backend/` after installing dependencies:

```powershell
python -m app.db.initialize
python -m app.db.seed
```

The seed script creates demo users, amenities, 18 listings with three images each, reviews, favorites, and past/future bookings. It can be rerun: when demo users already exist, it refreshes images for the known demo listings and leaves other data intact. To start with a completely fresh demo database, stop the backend, remove `backend/staybnb.db`, then run the initialization and seed commands again.

## Assumptions and limitations

- Prices are represented in integer cents of INR to avoid floating-point totals.
- Booking dates are calendar dates, and check-out is exclusive.
- Checkout/payment, identity, and authentication are mock flows; there is no payment provider or production account security.
- Demo user IDs and role switching are for local evaluation only.
- Listing photos are remote Unsplash URLs (with a local fallback image); image availability depends on that external service.
- No live map, real-time pricing, messaging, or production booking cancellation flow is included.
- Availability is based on confirmed bookings in the SQLite database.

## Bonus touches

Responsive layouts, category shortcuts, amenity/price filters, persistent favorites, toast feedback, an availability-aware booking quote, themed seeded photo galleries, and FastAPI interactive docs are included. No interactive map or real payment integration is included.

## Deploy quickly (Vercel + Render)

Push this repository to GitHub. On Render, create a Python Web Service with root `backend`, build command `pip install -r requirements.txt`, and start command `python -m app.db.seed && uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set `FRONTEND_ORIGIN` to the Vercel site's exact HTTPS origin. The start command initializes and seeds an empty SQLite database.

On Vercel, import the same repository, set root directory to `frontend`, keep the Next.js preset, and use `npm ci` / `npm run build`. Set `NEXT_PUBLIC_API_URL` to the Render URL ending in `/api`, then deploy. This variable is read at build time.

Required environment variables: Render `FRONTEND_ORIGIN`; Vercel `NEXT_PUBLIC_API_URL`. Render supplies `PORT`. SQLite defaults to `backend/staybnb.db`; Render's temporary disk can lose data when the service is replaced or redeployed, at which point startup seeds demo data again. This setup is for a quick single-instance demo.
