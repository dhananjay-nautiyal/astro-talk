# AstroTalk Backend

AstroTalk is an astrology consultation platform connecting users with professional astrologers via chat, voice, and video calls.

## Features

- **User & Astrologer Auth** — JWT-based registration, login, and role-based access
- **Astrologer Browse** — Search and filter astrologers by specialization, language, price, rating, and online status
- **Wallet** — Digital wallet with real-time balance tracking and transaction history
- **Consultations** — Start, bill, and manage consultations with per-minute billing
- **Real-time Chat** — WebSocket-based messaging with read receipts and typing indicators
- **WebRTC Calls** — Signaling server for voice/video calls
- **Payments** — Razorpay integration for wallet top-ups
- **Reviews & Ratings** — Post-consultation feedback with average rating calculation
- **Notifications** — Real-time push notifications via WebSocket
- **Admin Dashboard** — User/astrologer management, revenue reports, wallet adjustments
- **Billing Scheduler** — Automatic per-minute deduction during active consultations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Spring Boot 3.2.5 |
| Language | Java 21 |
| Database | MySQL 8 (compose) / H2 in-memory (dev profile) |
| ORM | Spring Data JPA / Hibernate |
| Security | Spring Security 6 + JWT (jjwt 0.12.5) |
| WebSocket | STOMP over WebSocket with SockJS |
| API Docs | SpringDoc OpenAPI 2.5.0 |
| Payments | Razorpay Java SDK 1.4.4 |
| Build | Maven |
| Container | Docker + docker-compose |

## Prerequisites

- Java 21
- Maven 3.8+
- MySQL 8 (production/compose; H2 is used for the `dev` profile and tests)
- Docker & Docker Compose (optional)

## Setup

### Clone & Configure

```bash
git clone <repo-url>
cd astrotalk-backend
cp .env.example .env
# Edit .env with your credentials
```

### Run Locally

```bash
# Ensure MySQL is running with database 'astrotalk'
# (or export DB_URL/DB_USER/DB_PASS - all secrets are required, see below)
mvn clean compile
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

Swagger UI: `http://localhost:8080/swagger-ui.html`

### Run with Docker

```bash
cp .env.example .env   # fill in DB_PASS, DB_ROOT_PASS, JWT_SECRET, ...
docker compose up --build
```

This starts MySQL 8 and the app (health-checked, port 8080).

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
| GET | `/api/astrologers/{id}` | Get astrologer profile |
| GET | `/api/astrologers/{id}/availability` | Check online status |
| PUT | `/api/astrologers/profile` | Update own profile |
| PUT | `/api/astrologers/status/toggle` | Toggle online/offline |

### Consultations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/consultations/start` | Start a consultation |
| POST | `/api/consultations/end/{id}` | End a consultation |
| GET | `/api/consultations/active` | Get active consultation |
| GET | `/api/consultations/history` | Get consultation history |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/balance` | Get wallet balance |
| GET | `/api/wallet/transactions` | Get transaction history |
| POST | `/api/wallet/add` | Add money to wallet |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment signature |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/{id}/messages` | Get message history |
| POST | `/api/chat/{id}/read` | Mark messages as read |
| GET | `/api/chat/{id}/unread-count` | Get unread count |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Submit a review |
| GET | `/api/reviews/astrologer/{id}` | Get astrologer reviews |
| DELETE | `/api/reviews/{id}` | Delete a review (admin) |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get dashboard stats |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/astrologers` | List all astrologers |
| PUT | `/api/admin/astrologers/{id}/verify` | Verify astrologer |
| PUT | `/api/admin/astrologers/{id}/reject` | Reject astrologer |
| GET | `/api/admin/revenue` | Revenue report |
| POST | `/api/admin/wallet/adjust` | Adjust wallet balance |
| DELETE | `/api/admin/reviews/{id}` | Delete review |

## WebSocket Events

| Topic | Direction | Description |
|-------|-----------|-------------|
| `/ws` | Connect | STOMP WebSocket endpoint (SockJS) |
| `/topic/consultation/{id}` | Subscribe | Live chat messages |
| `/topic/consultation/{id}/signal` | Subscribe | WebRTC signaling |
| `/topic/consultation/{id}/typing` | Subscribe | Typing indicators |
| `/topic/consultation/{id}/read` | Subscribe | Read receipts |
| `/topic/user/{id}/call` | Subscribe | Incoming call invites |
| `/topic/user/{id}/notifications` | Subscribe | Push notifications |
| `/app/chat.send` | Send | Send a chat message |
| `/app/chat.read` | Send | Mark messages read |
| `/app/chat.typing` | Send | Typing indicator |
| `/app/call.invite` | Send | Call invitation |
| `/app/call.accept` | Send | Accept call |
| `/app/call.reject` | Send | Reject call |
| `/app/call.offer` | Send | SDP offer |
| `/app/call.answer` | Send | SDP answer |
| `/app/call.ice` | Send | ICE candidate |
| `/app/call.end` | Send | End call |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_URL` | No (MySQL localhost default) | MySQL JDBC URL |
| `DB_USER` / `DB_PASS` | Yes | Database credentials (no defaults) |
| `JWT_SECRET` | Yes | Base64-encoded ≥32-byte JWT signing secret |
| `JWT_ACCESS_EXPIRATION_MS` | No (900000) | Access token lifetime |
| `JWT_REFRESH_EXPIRATION_MS` | No (604800000) | Refresh token lifetime |
| `RAZORPAY_KEY_ID` | Yes for payments | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Yes for payments | Razorpay API secret |
| `GOOGLE_CLIENT_ID` | Yes for Google sign-in | Google OAuth client ID |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS + WebSocket origins |

## Run Tests

```bash
mvn test
```

## Build

```bash
mvn clean package -DskipTests
java -jar target/astro-talk-backend-1.0.0.jar
```
