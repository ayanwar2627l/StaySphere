# StaySphere — Project Report

**A full-stack hotel booking web application built with React + Express + MongoDB.**

---

## Overview

StaySphere lets users browse hotels, select rooms and add-ons, and complete a UPI-based booking — all persisted to a cloud MongoDB database. It includes JWT-based user authentication and a clean SPA interface.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router DOM, Axios, Vanilla CSS |
| **Backend** | Node.js, Express.js 5, Mongoose 9 |
| **Database** | MongoDB Atlas |
| **Auth** | JWT + bcryptjs |
| **Icons** | Lucide React |

---

## Architecture

```
Browser (React + Vite)
       |
       | Axios (JWT attached via interceptor)
       |
Express REST API  (port 5000)
       |
MongoDB Atlas  (hotels / users / bookings)
```

---

## Pages & Features

| Page | What it does |
|---|---|
| **Home** | Hero section + hotel grid loaded from API |
| **Hotel Details** | Room picker, date picker, guest count, optional extras, live price summary |
| **Payment** | UPI ID entry + validation, simulated payment, saves booking to DB |
| **Booking Confirmation** | Shows booking ID, stay details, extras, and total paid |
| **Navbar** | Nav links, Sign in / Register modal, user avatar + sign-out dropdown |

---

## Database Models

**Hotel** — `name`, `location`, `price`, `rating`, `category`, `image`, `packages`

**User** — `name`, `email`, `password` (bcrypt hashed)

**Booking** — `hotelId`, `room`, `guests`, `checkIn`, `checkOut`, `nights`, `extras`, `totalPrice`, `upiId`

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/hotels` | List all hotels |
| `GET` | `/api/hotels/:id` | Get one hotel |
| `POST` | `/api/bookings` | Create a booking |
| `POST` | `/api/auth/register` | Register user |
| `POST` | `/api/auth/login` | Login user |

---

## User Flow

```
Home --> Hotel Details --> Payment --> Booking Confirmation
         (room/dates/extras)  (UPI ID)     (booking ID shown)
```

---

## Seeded Hotels (10 total)

Ranthambore · Goa · Manali · Jaipur · Alleppey · Bengaluru · Srinagar · Rishikesh · Mumbai · Jaisalmer

Price range: **Rs. 3,200 – Rs. 8,500 / night** | Ratings: **4.4 – 4.9**

---

## Future Scope

- Link bookings to user accounts + booking history page
- Real payment gateway (Razorpay / Stripe)
- Search & category filters
- Admin dashboard
- Email confirmation on booking
- Mobile-responsive layout improvements

---

## Conclusion

StaySphere demonstrates a complete MERN-style booking flow — from authentication and hotel discovery to payment and confirmation — with clean separation between the React frontend and the Express + MongoDB backend.

---

*October 2026 · StaySphere v0.0.0*
