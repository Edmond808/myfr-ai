# myfr.ai on your phone — 3 steps

Everything else is already done (PR merged, Expo project linked, EAS secrets set).

## SDK 56 vs App Store Expo Go (read this first)

This project uses **Expo SDK 56**. The **Expo Go app from the App Store** on a real iPhone only supports up to **SDK 54** right now (Apple has not approved newer Expo Go builds yet).

**Updating Expo Go from the App Store will not fix this.** The store version is simply too old for SDK 56.

**Works today:** press **`i`** in the Expo terminal to open the **iPhone Simulator** (requires Xcode). Do not scan the QR on a physical iPhone until Expo publishes SDK 56 to the App Store or you use an EAS dev build.

---

## Step 1 — Run setup (once)

From the project folder:

```bash
./scripts/mobile-expo-setup.sh
```

This copies Supabase keys from `.env.local` → `mobile/.env`, installs deps, and syncs EAS cloud vars.

## Step 2 — Start the web API

```bash
./scripts/dev.sh
```

Leave this running.

## Step 3 — Start Expo

```bash
cd mobile && npx expo start
```

- **Mac simulator (recommended):** Press `i` in the Expo terminal (needs Xcode).
- **Physical iPhone:** Not supported with App Store Expo Go + SDK 56 — use simulator or EAS build.

Phone and Mac must be on the **same Wi‑Fi** if you later use a compatible Expo Go build.

---

## If EAS login is ever needed (one command)

```bash
cd mobile && npx eas-cli login
```

Use the same Expo account as expo.dev (`edmond808`).

---

## One-time expo.dev click (cloud builds only)

Skip this if you only use Expo Go locally.

1. Open [expo.dev → myfrai → GitHub](https://expo.dev/accounts/edmond808/projects/myfrai/github)
2. Connect repo **Edmond808/myfr-ai** if not already
3. Set **Base directory** to `mobile` (not repo root)
4. Set **Production branch** to `main`

There is no reliable CLI for the base-directory field — those four clicks are the manual part.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “Incompatible with this version” on phone | Press **`i`** for Simulator — don’t scan QR on a real iPhone |
| “Classification failed” | Is `./scripts/dev.sh` running? |
| Works on simulator, not phone | Re-run setup script (refreshes LAN IP in `mobile/.env`) |
| 401 on dispatch | Sign in on the Account tab first |

More detail: [mobile/README.md](../mobile/README.md)
