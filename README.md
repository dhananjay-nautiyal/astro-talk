<p align="center">
  <img src="frontend/public/icon-192.png" width="120" alt="AstroTalk app icon" />
</p>

<h1 align="center">AstroTalk</h1>

<p align="center"><b>Talk to expert astrologers over live chat, voice and video</b></p>

<p align="center">

[![Latest release](https://img.shields.io/github/v/release/dhani748/astro-talk?style=for-the-badge&labelColor=0d1117)](https://github.com/dhani748/astro-talk/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/dhani748/astro-talk/CI?style=for-the-badge&labelColor=0d1117)](https://github.com/dhani748/astro-talk/actions)

</p>

<p align="center">

[**Download**](#download) · [**Features**](#features) · [**Quick Start**](#quick-start) · [**Releases**](https://github.com/dhani748/astro-talk/releases) · [**Disclaimer**](#disclaimer)

</p>

> [!IMPORTANT]
> AstroTalk is an independent project. It is not affiliated with, endorsed by,
> or connected to any astrology authority or app store. Payments resolve via
> Razorpay — availability varies by region.

---

# Features

| #### Consult & Pay - **Live chat** with read receipts and typing indicators. - **Voice/video calls** via WebRTC signaling over STOMP. - **Per-minute billing** with automatic low-balance cutoff. - **Wallet** with Razorpay top-ups and transaction history. - **Reviews** with astrologer ratings. - **Notifications** pushed live over WebSocket. | #### Experience & Platform - **Installable PWA** — add the web app to any phone home screen, offline shell. - **Web app** (Vite + React 19, Tailwind, Redux Toolkit). - **JWT auth** (15-min access + 7-day refresh), BCrypt, `USER` / `ASTROLOGER` / `ADMIN` roles. - **Admin dashboard** — users, astrologer verification, revenue, wallet tweaks. - **Spring Boot 3.2 API** — JPA/Hibernate, MySQL 8 (H2 dev mode), OpenAPI docs. - **CI** — backend verify + frontend lint/test/build on every push and PR. |
| --- | --- |

---

# Download

<p>

[![Download for Android](https://img.shields.io/badge/Download_for_Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/dhani748/astro-talk/releases/latest)
[![Backend & Web](https://img.shields.io/badge/Backend_%26_Web-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://github.com/dhani748/astro-talk/releases/latest)

</p>

Grab the APK, backend JAR and web bundle from the
[**Releases**](https://github.com/dhani748/astro-talk/releases/latest) page.
Sideloading the APK needs **Install unknown apps** allowed for the browser you
download with (debug-signed — fine for testing, use a release key for stores).

| Artifact | File | Install |
|----------|------|---------|
| Android app | `astrotalk-v1.2.0.apk` | Download → tap → install |
| Backend | `astrotalk-backend-<version>.jar` | `java -jar` with env (see Quick Start) |
| Web frontend (PWA) | `astrotalk-web-<version>.zip` | Unzip to any HTTPS static host, then “Add to Home Screen” |

No release published yet? Build both locally:

```bash
mvn clean package --file astroTalk-backend/pom.xml
cd frontend && VITE_API_URL=https://<backend-host> npm run build && cd ..
```

## Publishing a release (maintainer)

```bash
# 1. Build backend + web
mvn clean package --file astroTalk-backend/pom.xml
cd frontend && VITE_API_URL=https://<backend-host> npm run build && cd ..
# 2. Zip the web bundle
cd frontend/dist && zip -r ../../astrotalk-web-1.2.0.zip . && cd ../..
# 3. Build the Android APK (needs ANDROID_HOME set, first run downloads the SDK)
cd frontend && npx cap sync android && cd android && ./gradlew assembleDebug && cd ../..
cp frontend/android/app/build/outputs/apk/debug/app-debug.apk astrotalk-v1.2.0.apk
# 4. Publish everything to GitHub Releases
#    (this also triggers the Maven publish workflow to GitHub Packages)
gh release create v1.2.0 \
  astroTalk-backend/target/astro-talk-backend-*.jar \
  astrotalk-web-1.2.0.zip \
  astrotalk-v1.2.0.apk \
  --title "v1.2.0" --notes "See README for install steps"
```

---

# Quick Start

## Backend (zero-config dev, H2 in-memory)

```bash
cd astroTalk-backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

API on `http://localhost:8080` ·
Swagger at `http://localhost:8080/swagger-ui.html` ·
H2 console at `http://localhost:8080/h2-console`.

## Backend (MySQL, like prod)

```bash
cd astroTalk-backend
cp .env.example .env   # fill in DB_PASS, DB_ROOT_PASS, JWT_SECRET, ...
export $(grep -v '^#' .env | xargs)
mvn spring-boot:run
```

Full variable list in `astroTalk-backend/.env.example`. Secrets have no defaults —
the app fails fast at startup when one is missing.

## Backend Docker

```bash
cd astroTalk-backend
cp .env.example .env   # fill in secrets
docker compose up --build
```

Starts MySQL 8 (health-checked) + the app on `:8080`.

## Web frontend

```bash
cd frontend
cp .env.example .env   # VITE_GOOGLE_CLIENT_ID / VITE_RAZORPAY_KEY_ID
npm install
npm run dev            # empty VITE_API_URL => proxies /api + /ws to :5173 target
VITE_API_URL=https://<backend-host> npm run build   # production PWA in dist/
```

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server with backend proxy |
| `npm run build` | Production PWA build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint (kept error-free) |
| `npm run test` / `test:watch` | Vitest suite |

Google sign-in and Razorpay stay disabled with a clear message until their keys
are configured.

---

# Project Structure

```
├── astroTalk-backend/src/main/java/com/astrotalk/
│   ├── controller/      # 12 REST controllers (auth, astrologer, consultation,
│   │                      # chat + WS signaling, wallet, payment, review,
│   │                      # notification, admin) + STOMP/SDP signaling
│   ├── service/ + impl/ # business logic (auth incl. Google, billing scheduler)
│   ├── entity/ + repo/  # 19 JPA entities + repositories
│   ├── model/           # request/response models (single canonical package)
│   ├── config/          # security, JWT, WS origins, Razorpay, OpenAPI
│   └── exception/       # domain + JWT/payment/mail handlers
├── frontend/src/
│   ├── api/             # axios instance + per-domain wrappers
│   ├── components/      # shared UI (common/*, layout/*)
│   ├── context/         # Language + Socket (STOMP/WebRTC) providers
│   ├── features/        # per-domain pages/components/store
│   ├── hooks/           # useWebSocket, useWebRTC, useTheme
│   ├── store/           # Redux Toolkit root
│   └── utils/           # env flags, Razorpay checkout loader
└── .github/workflows/   # CI (push/PR) + Maven publish (on release)
```

| Component | Technology |
|-----------|-----------|
| Backend | Spring Boot 3.2, Java 21, MySQL 8 (H2 in dev) |
| Web | Vite 8, React 19, React Router 7, Redux Toolkit, Tailwind 4 |
| Real-time | STOMP + SockJS, SimplePeer WebRTC |
| Auth | JWT (jjwt 0.12) + Spring Security, BCrypt |
| Mobile story | Installable PWA (manifest, icons, offline shell) |

---

# Disclaimer

AstroTalk is a community consultation client. It hosts no astrological content
itself and makes no claims about predictive accuracy. You are responsible for
complying with your local laws and each payment provider's terms of use.

---

# License

No license file is published yet — add one (e.g. MIT / GPL-3.0) to define
reuse terms.
