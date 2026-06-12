# myfr.ai on your phone — 3 steps

Everything else is already done (PR merged, Expo project linked, EAS secrets set).

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

## Step 3 — Start Expo and scan QR

```bash
cd mobile && npx expo start
```

- **iPhone:** Install [Expo Go](https://expo.dev/go) → open Camera → scan the QR in the terminal.
- **Mac simulator:** Press `i` in the Expo terminal (needs Xcode).

Phone and Mac must be on the **same Wi‑Fi**.

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
| “Classification failed” | Is `./scripts/dev.sh` running? |
| Works on simulator, not phone | Re-run setup script (refreshes LAN IP in `mobile/.env`) |
| 401 on dispatch | Sign in on the Account tab first |

More detail: `mobile/README.md`
