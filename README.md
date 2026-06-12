# myfr.ai

**My French Riviera** — AI-powered services marketplace for the Côte d'Azur.

## Stack

- **Next.js 15** App Router (deployable API routes)
- **Supabase** Auth + Postgres + Realtime
- **Tailwind CSS v4**
- **Anthropic** server-side classification (`/api/classify`)

## Quick start

```bash
npm install
cp .env.example .env.local   # add keys when ready
npm run dev                  # http://localhost:3000
```

For a full Supabase go-live walkthrough, see **[docs/SETUP_CHECKLIST.md](docs/SETUP_CHECKLIST.md)** (~15 min).

Works in **demo mode** without Supabase or Anthropic keys — uses keyword classification and simulated quotes.

### Stale `.next` cache

If dev shows `Cannot find module './NNN.js'` in `.next/server/webpack-runtime.js`, kill the dev server, run `rm -rf .next`, then `npm run dev:clean` (or `./scripts/dev.sh`, which clears the cache automatically).

## Supabase setup (Phase 2)

Follow **[docs/SETUP_CHECKLIST.md](docs/SETUP_CHECKLIST.md)** — or the short version:

1. Create project in **EU region** (Frankfurt or Paris)
2. Run [`supabase/00_RUN_THIS_IN_SUPABASE.sql`](supabase/00_RUN_THIS_IN_SUPABASE.sql) in SQL Editor
3. Enable Auth: email + password (Google optional)
4. Enable Realtime on `quotes` table
5. Copy `.env.example` → `.env.local`, add keys, then `npm run check:supabase`

## Auth flow

- Users can **type and classify anonymously**
- **Registration required** at dispatch (when sending to real pros)
- `/auth/register` — full name, email, password, language (EN/FR), default city
- `/auth/login` — returns to pending dispatch via `?resume=dispatch`

## i18n

EN + FR via header language switcher. Preference saved to `profiles.preferred_language` on registration.

## Dual-team workflow

| Workspace | Tool |
|-----------|------|
| `/Users/e808m/myfr.ai` | Cursor |
| `/Users/e808m/rivly-claude` | Claude Code |

See [MIGRATION_PLAN.md](MIGRATION_PLAN.md), [AGENTS.md](AGENTS.md), [docs/REVIEW_QUEUE.md](docs/REVIEW_QUEUE.md).

## Project structure

```
app/
  api/classify/     # AI dispatch (core IP — do not change prompt)
  api/jobs/         # Persist job + dispatch_job RPC + fetch quotes
  api/profile/      # User profile CRUD
  auth/             # Login, register, OAuth callback
components/         # RivlyApp, HomeView, DispatchView, LoadingSplash, auth forms
lib/                # classify, constants, i18n, supabase clients
schema.sql                        # Source schema (also in supabase/ bundle)
supabase/00_RUN_THIS_IN_SUPABASE.sql  # One-shot SQL for new projects
docs/SETUP_CHECKLIST.md           # 15-min go-live walkthrough
scripts/check-supabase.mjs        # npm run check:supabase
```

## Phases completed

- [x] Phase 1 — Next.js migration
- [x] Phase 2 — Supabase schema + auth + job persistence (code ready; needs Supabase project)
- [ ] Phase 3 — Merchant dashboard (`/pro`)
- [ ] Phase 4 — Stripe Connect
- [ ] Phase 5 — SEO landing pages
