# AstroTalk — Astrology Consultation Platform

Connect with professional astrologers via chat, voice, and video calls.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2.5, Java 21 |
| Frontend | React 19, Vite 8, Tailwind CSS 4 (installable PWA) |
| Database | MySQL 8 (compose) / H2 in-memory (dev profile) |
| ORM | Spring Data JPA / Hibernate |
| Security | Spring Security 6 + JWT |
| Real-time | STOMP WebSocket + SockJS |
| Payments | Razorpay |
| API Docs | SpringDoc OpenAPI |

## Project Structure

```
astroTalk-backend/   Spring Boot REST API (port 8080)
frontend/            React + Vite client (port 5173)
```

## Quick Start

### Backend

```bash
cd astroTalk-backend

# Option A: Development (H2 in-memory DB, needs test/dummy props only for full boot)
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Option B: Production (MySQL required + secrets, see Environment Variables)
mvn spring-boot:run
```

### Docker Compose (MySQL + app)

```bash
cd astroTalk-backend
cp .env.example .env   # fill in DB_PASS, DB_ROOT_PASS, JWT_SECRET, ...
docker compose up --build
```

### Frontend

```bash
cd frontend
cp .env.example .env   # fill in VITE_GOOGLE_CLIENT_ID / VITE_RAZORPAY_KEY_ID
npm install
npm run dev
```

The production build is an installable PWA (manifest + offline app shell):
`npm run build` → deploy `dist/`. On mobile use “Add to Home Screen” / Install.

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_URL` | No (MySQL localhost default) | JDBC URL |
| `DB_USER` / `DB_PASS` | Yes | Database credentials (no defaults) |
| `JWT_SECRET` | Yes | Base64-encoded ≥32-byte signing key |
| `JWT_ACCESS_EXPIRATION_MS` | No (900000) | Access token lifetime |
| `JWT_REFRESH_EXPIRATION_MS` | No (604800000) | Refresh token lifetime |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Yes for payments | Razorpay credentials |
| `GOOGLE_CLIENT_ID` | Yes for Google sign-in | Google OAuth client ID |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS/WS origins |

Frontend (`frontend/.env.example`): `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_RAZORPAY_KEY_ID`.

- Backend: http://localhost:8080
- Frontend: http://localhost:5173
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console (dev): http://localhost:8080/h2-console

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/register/astrologer` | Register a new astrologer |
| POST | `/api/auth/login` | Login and get JWT token |

### Astrologers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/astrologers` | Search/filter astrologers |
| GET | `/api/astrologers/top` | Top 6 by rating |
| GET | `/api/astrologers/{id}` | Get profile |
| GET | `/api/astrologers/{id}/availability` | Check online status |
| PUT | `/api/astrologers/profile` | Update own profile |
| PUT | `/api/astrologers/status/toggle` | Toggle online/offline |

### Consultations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/consultations/start` | Start a consultation |
| POST | `/api/consultations/end/{id}` | End + final billing |
| GET | `/api/consultations/active` | Get active consultation |
| GET | `/api/consultations/history` | Consultation history |

### Wallet & Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/balance` | Get balance |
| GET | `/api/wallet/transactions` | Transaction history |
| POST | `/api/wallet/add` | Add money |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/{id}/messages` | Message history |
| POST | `/api/chat/{id}/read` | Mark messages as read |
| GET | `/api/chat/{id}/unread-count` | Unread count |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Submit a review |
| GET | `/api/reviews/astrologer/{id}` | Astrologer reviews |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/astrologers` | List astrologers |
| PUT | `/api/admin/astrologers/{id}/verify` | Verify astrologer |
| PUT | `/api/admin/astrologers/{id}/reject` | Reject astrologer |
| GET | `/api/admin/revenue` | Revenue report |
| POST | `/api/admin/wallet/adjust` | Adjust wallet |

## WebSocket Topics

| Topic | Purpose |
|-------|---------|
| `/ws` | STOMP endpoint (SockJS) |
| `/topic/consultation/{id}` | Live chat messages |
| `/topic/consultation/{id}/signal` | WebRTC signaling |
| `/topic/consultation/{id}/typing` | Typing indicators |
| `/topic/user/{id}/call` | Incoming call invites |
| `/topic/user/{id}/notifications` | Push notifications |

## Environment Variables

Backend (`astroTalk-backend/.env.example` — copy to `.env`, never commit it):

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_URL` | No (MySQL localhost default) | JDBC URL |
| `DB_USER` / `DB_PASS` | Yes | Database credentials (no defaults) |
| `JWT_SECRET` | Yes | Base64-encoded ≥32-byte signing key |
| `JWT_ACCESS_EXPIRATION_MS` | No (900000) | Access token lifetime |
| `JWT_REFRESH_EXPIRATION_MS` | No (604800000) | Refresh token lifetime |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Yes for payments | Razorpay credentials |
| `GOOGLE_CLIENT_ID` | Yes for Google sign-in | Google OAuth client ID |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS + WebSocket origins |

Frontend (`frontend/.env.example`): `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_RAZORPAY_KEY_ID`.
Google/Razorpay features stay disabled with a clear message until configured.

## CI

`.github/workflows/ci.yml` runs on push to `main` and PRs: backend `mvn verify`
(JDK 21) plus frontend `npm ci` → `lint` → `test` → `build` (Node 22).
