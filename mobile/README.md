# myfr.ai Mobile (Expo)

React Native app for **myfr.ai** — shares Supabase auth and calls the existing Next.js API (`/api/classify`, `/api/jobs`). No Anthropic keys in the mobile client.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Expo Go](https://expo.dev/go) on your phone **or** Xcode (iPhone Simulator on Mac)
- The **web app** running locally (`npm run dev` in repo root) for AI classify + dispatch

## Quick start

```bash
# 1. Web API (separate terminal, repo root)
npm install
npm run dev

# 2. Mobile app
cd mobile
cp .env.example .env
# Edit .env — set EXPO_PUBLIC_API_URL and Supabase keys

npm install
npx expo start
```

Press **`i`** in the terminal to open the **iPhone Simulator** (requires Xcode).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_API_URL` | Next.js base URL (default `http://localhost:3000`) |
| `EXPO_PUBLIC_SUPABASE_URL` | Same as web `NEXT_PUBLIC_SUPABASE_URL` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same as web `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

### iPhone Simulator

Use `EXPO_PUBLIC_API_URL=http://localhost:3000` — the simulator shares your Mac’s network.

### Physical iPhone (Expo Go)

`localhost` on the phone points to the phone, not your Mac. Use your computer’s LAN IP:

```bash
# Find your Mac IP: System Settings → Network, or:
ipconfig getifaddr en0
```

Set e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.42:3000` and ensure phone and Mac are on the same Wi‑Fi.

## Screens (Phase 1)

| Screen | Status |
|--------|--------|
| Splash + tricolor wordmark | ✅ Implemented |
| Home — request + city picker | ✅ Implemented |
| Dispatch — demo (anonymous) / live quotes (signed in) | ✅ Implemented |
| Auth — login / register | ✅ Email/password (OAuth stub on web) |
| My requests | ✅ List via `/api/jobs?mine=1` |
| Pro tab | 🔶 Stub — opens web `/pro` in browser |

## Scripts

```bash
npx expo start          # Dev server + QR code
npm run ios             # Open iOS simulator
npm run android         # Open Android emulator
npm run typecheck       # TypeScript check
npx expo-doctor         # Expo health check
```

## Architecture

```
mobile/
  app/              Expo Router screens
  components/       BrandWordmark, LoadingSplash, Screen
  context/          AppProvider (auth + dispatch state)
  lib/
    types.ts        Copied from web lib/types.ts
    constants.ts    Copied from web (PALETTE, LOCATIONS, demo merchants)
    api-client.ts   Calls web API with Bearer token when logged in
    supabase.ts     Supabase client + AsyncStorage session
    i18n/           EN/FR messages (copied from web)
```

Mobile auth sends `Authorization: Bearer <token>` to `/api/jobs`; web cookie auth is unchanged.

## Troubleshooting

- **“Classification failed”** — Is `npm run dev` running on port 3000? Check `EXPO_PUBLIC_API_URL`.
- **401 on dispatch** — Sign in on the Account tab first (real dispatch requires auth).
- **Demo quotes only** — Expected when anonymous with Supabase configured; register to dispatch for real.

## Branch

Developed on `cursor/mobile-app`.
