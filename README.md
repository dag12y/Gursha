# Gursha - Restaurant Reservation + Table Management Platform

Gursha is a full-stack reservation platform with three roles:
- Diner: browse restaurants and make reservations.
- Staff: manage reservations, table states, and menu.
- Admin: manage restaurants and assign staff.

## Tech Stack
- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Auth: JWT + role-based middleware

## Project Structure
- `client/` - React frontend
- `server/` - Express API + MongoDB models

## Features Implemented
- JWT auth: register/login/get current user
- Email verification flow
- Role-based access control (`diner`, `staff`, `admin`)
- Restaurant CRUD (admin) + menu management (staff)
- Reservation flow:
  - availability lookup by date/time/party size
  - booking with auto table assignment
  - cancellation by diner
  - status management by staff
- Table management by staff (CRUD + status)
- Staff analytics dashboard (restaurant-level)
- API pagination:
  - `GET /api/restaurants`
  - `GET /api/reservations/my`
  - `GET /api/reservations/restaurant`
- Diner search/filter UI for restaurant discovery

## Prerequisites
- Node.js 20+
- MongoDB running locally or hosted URI

## Environment Variables

Create `server/.env`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/Gursha
JWT_SECRET=replace_me
FRONTEND_BASE_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173

# Optional email provider (for verification emails)
EMAIL_PROVIDER=auto
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
RESEND_API_KEY=
RESEND_FROM=

# Optional cloud image upload (menu images)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Create `client/.env`:

```env
VITE_BACKEND_API_BASE_URL=http://localhost:3000/api
```

## Install & Run

From project root:

```bash
npm install
npm install --prefix server
npm install --prefix client
npm run dev
```

This runs backend + frontend concurrently.

## Seed Demo Data

```bash
npm run seed --prefix server
```

Seeded credentials:
- Admin: `admin@gursha.dev` / `password123`
- Staff: `staff@gursha.dev` / `password123`
- Diner: `diner@gursha.dev` / `password123`

## Run Backend Tests

```bash
npm run test --prefix server
```

Includes integration coverage for:
- auth flow (register/login/me)
- reservation flow (create/cancel)

## Useful API Query Examples

- Restaurants with search/filter/pagination:
  - `GET /api/restaurants?search=italian&location=bole&priceRange=$$&page=1&limit=9`
- Diner reservations with pagination:
  - `GET /api/reservations/my?page=1&limit=10`
- Staff reservations with status/date filters:
  - `GET /api/reservations/restaurant?status=Pending&dateFrom=2026-01-01&dateTo=2026-12-31&page=1&limit=10`

## Deployment
- Frontend can be deployed to Vercel (`client/vercel.json` included).
- Backend can be deployed to Railway/Render/Fly.
- Set production env vars for both apps.

## Demo Deliverables Placeholders
- Live app: `<add-your-live-url>`
- Demo video (2-4 min): `<add-video-link>`
- GitHub repo: `https://github.com/dag12y/Gursha`
