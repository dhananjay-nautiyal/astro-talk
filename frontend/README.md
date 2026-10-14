# AstroTalk Frontend

React 19 + Vite 8 client for the AstroTalk platform. The production build is an
installable PWA (manifest, icons, offline app shell) so it works like a mobile app.

## Setup

```bash
cp .env.example .env   # fill in keys below
npm install
npm run dev            # http://localhost:5173 (proxies /api + /ws to backend)
```

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server with backend proxy |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint (must be error-free) |
| `npm run test` / `test:watch` | Vitest suite |

## Environment (`frontend/.env.example`)

| Variable | Required for | Notes |
|----------|--------------|-------|
| `VITE_API_URL` | API calls | Defaults to same-origin `/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google sign-in button | App runs without the provider and warns until set |
| `VITE_RAZORPAY_KEY_ID` | Wallet top-up checkout | Checkout refuses with a clear message until set |

## Mobile install (PWA)

`npm run build` emits `manifest.webmanifest`, icons and `sw.js` (cache-first
static assets, network-first navigations, API never cached). Deploy `dist/` over
HTTPS, then on a phone use “Add to Home Screen” / Install. Bump `CACHE_VERSION`
in `public/sw.js` when shipping breaking shell changes.

## Structure

```
src/
  api/            axios instance + per-domain wrappers (auth/astrologer/…)
  components/     shared UI (common/*, layout/*)
  context/        Language + Socket (STOMP/WebRTC) providers
  features/       per-domain pages/components/store (auth/astrologer/…)
  hooks/          useWebSocket, useWebRTC, useTheme
  store/          Redux Toolkit root (auth/wallet/consultation/…)
  translations/   en + hi strings via LanguageContext
  utils/          env flags, razorpay checkout loader
```
