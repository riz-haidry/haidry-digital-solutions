# Haidry Digital Solutions

A scroll-led agency website with public service, portfolio and contact pages, plus a protected admin dashboard and Express/MongoDB API. The visual direction takes inspiration from animated storytelling and oversized type, recolored for the Haidry logo.

## Project layout

```text
haidry-digital-solutions/
├── frontend/                 # React, Vite, Tailwind CSS, Framer Motion, React Router
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
├── backend/                  # Express API and Mongoose models
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── README.md
```

## Requirements

- Node.js 20 or newer
- MongoDB (local or hosted)

## Setup

1. Install frontend packages: `cd frontend && npm install`
2. Copy `frontend/.env.example` to `frontend/.env`. Set `VITE_API_URL`; optionally set `VITE_WHATSAPP_NUMBER` to a country-code phone number using digits only.
3. Install API packages: `cd ../backend && npm install`
4. Copy `backend/.env.example` to `backend/.env`. Set `MONGODB_URI`, a private `JWT_SECRET` of at least 32 characters, and admin name/email/password. Use a unique password of at least 12 characters.
5. Create/update the admin account with `npm run create-admin` from `backend/`.

## Run locally

Start the API in one terminal: `cd backend && npm run dev`

Start the website in another terminal: `cd frontend && npm run dev`

The public website runs at `http://localhost:5173`. Admin sign-in is at `/admin/login`.

## API routes

- `GET /api/health` — API status
- `POST /api/auth/login`, `GET /api/auth/me` — admin authentication
- `POST /api/inquiries` — public contact form submission
- `GET /api/inquiries`, `PATCH /api/inquiries/:id` — protected enquiry management
- `GET /api/customers` — protected customer list
- `GET /api/orders`, `POST /api/orders`, `PATCH /api/orders/:id` — protected project records

Admin routes require a bearer token. Do not commit `.env` files or real credentials.
