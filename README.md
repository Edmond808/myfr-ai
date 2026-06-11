# Rivly / myfr.ai

AI-powered services marketplace for the French Riviera.

## Stack

- **Next.js 15** App Router (deployable API routes)
- **Supabase** Auth + Postgres + Realtime
- **Tailwind CSS v4**
- **Anthropic** server-side classification (`/api/classify`)

## Quick start

```bash
npm install
cp .env.example .env   # add keys when ready
npm run dev            # http://localhost:3000
```

Works in **demo mode** without Supabase or Anthropic keys — uses keyword classification and simulated quotes.

## Supabase setup (Phase 2)

1. Create project in **EU region** (Frankfurt or Paris)
2. Run `schema.sql` in SQL Editor
3. Enable Auth: email + password (Google optional)
4. Enable Realtime on `quotes` table
5. Add env vars to `.env`

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
components/         # RivlyApp, HomeView, DispatchView, auth forms
lib/                # classify, constants, i18n, supabase clients
schema.sql          # Full Supabase schema + RLS + dispatch_job()
```

## Phases completed

- [x] Phase 1 — Next.js migration
- [x] Phase 2 — Supabase schema + auth + job persistence (code ready; needs Supabase project)
- [ ] Phase 3 — Merchant dashboard (`/pro`)
- [ ] Phase 4 — Stripe Connect
- [ ] Phase 5 — SEO landing pages
