# Staybnb 🏡

Staybnb is a full-stack Airbnb-style stay booking application built as a project. It allows users to browse stays, filter listings, view property details, make bookings, manage their trips, and save properties to a wishlist. Hosts can create and manage their listings and view bookings.

**Live Demo:** [Staybnb – Find your place](https://airbnb-frontend-ff31.onrender.com/)

---

## 1. Tech Stack

### Frontend

* Next.js 15
* React
* TypeScript
* Tailwind CSS

### Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy

### Database

* SQLite

### Deployment

* Render

---

## 2. Architecture Overview

The application follows a simple **frontend + backend + database** architecture.

```text
                ┌─────────────────────┐
                │      Next.js        │
                │     Frontend        │
                └──────────┬──────────┘
                           │
                     REST API Calls
                           │
                           ▼
                ┌─────────────────────┐
                │       FastAPI       │
                │       Backend       │
                └──────────┬──────────┘
                           │
                      SQLAlchemy
                           │
                           ▼
                ┌─────────────────────┐
                │       SQLite        │
                │      Database       │
                └─────────────────────┘
```

### How it works

1. The user interacts with the Next.js frontend.
2. The frontend sends requests to the FastAPI backend.
3. FastAPI handles the application logic and validation.
4. SQLAlchemy is used to communicate with the SQLite database.
5. The backend returns the required data to the frontend.

The backend is responsible for important operations such as **booking validation, availability checking, and price calculation**.

---

## 3. Database Schema

The main database tables are:

### `users`

Stores guest and host information.

| Column | Description   |
| ------ | ------------- |
| id     | User ID       |
| name   | User name     |
| email  | User email    |
| role   | Guest or host |

### `listings`

Stores property information.

| Column          | Description          |
| --------------- | -------------------- |
| id              | Listing ID           |
| host_id         | ID of the host       |
| title           | Property title       |
| description     | Property description |
| location        | Property location    |
| price_per_night | Nightly price        |
| guests          | Maximum guests       |
| bedrooms        | Number of bedrooms   |
| bathrooms       | Number of bathrooms  |
| property_type   | Type of property     |

### `listing_images`

Stores images associated with listings.

| Column     | Description     |
| ---------- | --------------- |
| id         | Image ID        |
| listing_id | Related listing |
| image_url  | Image URL       |

### `amenities`

Stores available amenities.

| Column | Description  |
| ------ | ------------ |
| id     | Amenity ID   |
| name   | Amenity name |

### `listing_amenities`

Connects listings with their amenities.

| Column     | Description |
| ---------- | ----------- |
| listing_id | Listing ID  |
| amenity_id | Amenity ID  |

This creates a **many-to-many relationship** between listings and amenities.

### `bookings`

Stores user reservations.

| Column      | Description         |
| ----------- | ------------------- |
| id          | Booking ID          |
| listing_id  | Booked listing      |
| user_id     | Guest ID            |
| check_in    | Check-in date       |
| check_out   | Check-out date      |
| guests      | Number of guests    |
| total_price | Total booking price |
| status      | Booking status      |

### `reviews`

Stores reviews for listings.

| Column     | Description |
| ---------- | ----------- |
| id         | Review ID   |
| listing_id | Listing ID  |
| user_id    | Reviewer ID |
| rating     | Rating      |
| comment    | Review text |

### `favorites`

Stores wishlist items.

| Column     | Description   |
| ---------- | ------------- |
| user_id    | User ID       |
| listing_id | Saved listing |

---

## 4. Setup Instructions

### Prerequisites

Make sure the following are installed:

* Python 3.12
* Node.js
* npm

### Step 1: Clone the repository

```bash
git clone <repository-url>
cd Staybnb
```

### Step 2: Setup Backend

```powershell
cd backend

python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

Create the environment file:

```powershell
Copy-Item .env.example .env
```

Initialize and seed the database:

```powershell
python -m app.db.initialize
python -m app.db.seed
```

Start the backend:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

### Step 3: Setup Frontend

Open a new terminal:

```powershell
cd frontend

npm install
```

Create the environment file:

```powershell
Copy-Item .env.example .env.local
```

Start the frontend:

```powershell
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## 5. Environment Variables

### Backend

Create `backend/.env`:

```env
APP_NAME=Staybnb API
DATABASE_URL=sqlite:///./staybnb.db
FRONTEND_ORIGIN=http://localhost:3000
```

### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

For the deployed application:

```env
NEXT_PUBLIC_API_URL=https://airbnb-1-he54.onrender.com/api
```

---

## 6. Assumptions Made

The following assumptions were made to keep the project suitable for a college-level implementation:

* Authentication is **mocked** using demo user IDs instead of implementing a full authentication system.
* The frontend sends the current user through the `X-User-Id` request header.
* User ID `6` is used as the default guest and user IDs `1–5` are used as hosts.
* Payments are simulated; no real payment gateway is connected.
* SQLite is used as the database because the project is intended for demonstration.
* Listing images are provided through image URLs rather than a dedicated image-upload system.
* Booking dates are handled as calendar dates.
* A booking is considered unavailable when its dates overlap with another confirmed booking.
* The backend calculates the final booking price.
* The application uses seeded demo listings and users.
* Production features such as real authentication, payments, messaging, and real-time updates are outside the scope of this project.

---

## 7. Deployment

The application is deployed using Render.

**Frontend:**
[https://airbnb-frontend-ff31.onrender.com/](https://airbnb-frontend-ff31.onrender.com/)

**Backend:**
[https://airbnb-1-he54.onrender.com](https://airbnb-1-he54.onrender.com)

**API Documentation:**
[https://airbnb-1-he54.onrender.com/docs](https://airbnb-1-he54.onrender.com/docs)

---

## 8. Project Structure

```text
Staybnb/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── public/
│   └── .env.example
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

---

## 9. Summary

Staybnb demonstrates a complete full-stack application with:

* Next.js frontend
* FastAPI backend
* SQLite database
* REST API communication
* CRUD operations
* Booking and availability validation
* Guest and host functionality
* Cloud deployment
