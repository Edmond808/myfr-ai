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

## Expo GitHub + EAS cloud builds

This app is linked to Expo project **`ec89741c-6973-4ab8-9047-6934e9e9f072`** (`owner`: `edmond808`, slug: `myfrai`) via `app.json` → `extra.eas.projectId`. The GitHub repo **Edmond808/myfr-ai** is connected on [expo.dev](https://expo.dev).

Because the Expo app lives in a **monorepo subdirectory**, cloud builds must use the **`mobile`** base directory (not the repo root).

### expo.dev dashboard checklist

1. **Project → GitHub settings**
   - Repo: `Edmond808/myfr-ai`
   - **Base directory:** `mobile`
   - Branch for builds: `cursor/mobile-app` (or `main` when merged)

2. **Project → Environment variables** (Secrets)
   Set for **production** (and **preview** if you use that profile):

   | Variable | Example / notes |
   |----------|-----------------|
   | `EXPO_PUBLIC_API_URL` | `https://myfr.ai` — deployed Next.js API (not `localhost`) |
   | `EXPO_PUBLIC_SUPABASE_URL` | Same as web `NEXT_PUBLIC_SUPABASE_URL` |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same as web `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

   `EXPO_PUBLIC_*` values are baked into the app at **build time**. Rebuild after changing them.

3. **First-time EAS setup** (once per platform, from your Mac)
   ```bash
   cd mobile
   npm install
   npx eas-cli login
   npx eas build -p ios --profile production    # or android / all
   ```
   GitHub-triggered builds require at least one successful local EAS build per platform ([Expo docs](https://docs.expo.dev/build/building-from-github/)).

4. **Trigger builds from GitHub**
   - **Dashboard:** Project → Builds → **Build from GitHub** → pick branch, platform, profile (`development` | `preview` | `production`)
   - **PR label:** `eas-build-ios:production`, `eas-build-android:preview`, `eas-build-all`, etc.
   - **Workflows (recommended):** add `.eas/workflows/` under `mobile/` for push-to-branch automation ([EAS Workflows](https://docs.expo.dev/eas/workflows/))

5. **Build profiles** (`mobile/eas.json`)
   - `development` — dev client, internal distribution
   - `preview` — internal test builds (TestFlight / internal APK)
   - `production` — store-ready builds

### Local dev vs cloud build

| | `npx expo start` (local) | EAS cloud build |
|--|--------------------------|-----------------|
| Output | Metro dev server + QR / simulator | Native `.ipa` / `.apk` / `.aab` |
| Env vars | `mobile/.env` | expo.dev **Environment variables** |
| API URL | `localhost` or LAN IP OK | Must be public HTTPS (e.g. production deploy) |
| Hot reload | Yes | No — full native compile |
| Expo Go | Yes (managed workflow) | No — install the built binary |
| When to use | Day-to-day development | TestFlight, Play internal testing, App Store |

Local development still needs the **web API** running (`npm run dev` in repo root) unless `EXPO_PUBLIC_API_URL` points at a deployed backend.

## Branch

Developed on `cursor/mobile-app`.
