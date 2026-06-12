# Supabase Auth — myfr.ai

myfr.ai uses Supabase Auth for email/password and OAuth (Google, Apple). Provider credentials are configured in the **Supabase Dashboard** — no extra env vars are required in the app beyond `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Redirect URLs

In **Authentication → URL Configuration**, set:

| Environment | Site URL | Redirect URLs |
|-------------|----------|---------------|
| Local | `http://localhost:3000` | `http://localhost:3000/auth/callback` |
| Production | `https://myfr.ai` | `https://myfr.ai/auth/callback` |

OAuth flows redirect to `/auth/callback?next=...` where `next` is the post-login destination (e.g. `/?resume=dispatch` or `/pro`).

## Email / password

Enabled by default. Registration creates a `profiles` row via the `handle_new_user` trigger in `schema.sql`.

## Google OAuth

1. **Supabase Dashboard** → Authentication → Providers → **Google** → Enable.
2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/):
   - Application type: Web application
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Copy **Client ID** and **Client Secret** into the Supabase Google provider settings.
4. No app-side keys needed — the anon key handles the browser redirect.

## Apple OAuth

Apple requires an [Apple Developer](https://developer.apple.com) account.

1. **Supabase Dashboard** → Authentication → Providers → **Apple** → Enable.
2. In Apple Developer:
   - Create an **App ID** with Sign in with Apple capability.
   - Create a **Services ID** (this is the Client ID for Supabase).
   - Configure the Services ID redirect URL: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Create a **Sign in with Apple** key; download the `.p8` file.
3. In Supabase Apple provider settings, enter:
   - Services ID (Client ID)
   - Team ID
   - Key ID
   - Private key (contents of `.p8`)
4. Apple only returns the user's name on the **first** sign-in; myfr.ai syncs `full_name` from OAuth metadata in `/auth/callback` and `syncProfileFromAuth`.

## Profile sync

After OAuth or password login, myfr.ai:

- Fills `profiles.full_name` from provider metadata if empty.
- Sets `profiles.preferred_language` from metadata/locale if missing.
- Stores locale in `localStorage` (`myfr-locale`) for the i18n provider.

## Pending dispatch resume

If a user classifies a request while logged out, the pending payload is stored in `sessionStorage` (`myfr-pending`). After login/OAuth, redirect to `/?resume=dispatch` to auto-dispatch.

## Schema requirement for quote acceptance

Run the `customer accepts quotes` RLS policy from `schema.sql` so customers can update quote status via the authenticated API route (`PATCH /api/jobs`).

## Migrations (run in order if upgrading an existing project)

| File | Purpose |
|------|---------|
| `supabase/migrations/003_loyalty_tier.sql` | Adds `profiles.loyalty_tier` |
| `supabase/migrations/004_promoted_and_analytics.sql` | Promoted merchants + quote filter analytics |
| `supabase/migrations/005_fix_handle_new_user.sql` | Hardens signup trigger so profile errors never block auth |

Fresh installs: run `supabase/00_RUN_THIS_IN_SUPABASE.sql` (includes the hardened trigger).

## Troubleshooting signup

### "Could not create account" / "Database error finding user"

Usually a **corrupted `auth.users` row** for that email (often from manual SQL or a failed Dashboard "Add user"). New emails work; one stuck email fails with HTTP 500.

1. In **Supabase → SQL Editor**, run `scripts/fix-broken-auth-user.sql` (edit the email if needed).
2. Run `supabase/migrations/005_fix_handle_new_user.sql` so future profile errors cannot block signup.
3. Register again at `/auth/register`.

In local dev, the register form logs the raw Supabase error to the browser console.

Verify with `npm run check:supabase` — it probes auth signup and checks `loyalty_tier`.
