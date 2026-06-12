# Rivly — Agent Instructions

Rivly is an AI-powered services marketplace prototype for the French Riviera (Côte d'Azur).

## Project structure

```
app/
  page.tsx              # Customer home (RivlyApp)
  pro/                  # Merchant signup + dashboard
  auth/                 # Login / register
  api/
    classify/           # AI dispatch (core IP)
    jobs/               # Job persistence + quote fetch
    merchants/          # Merchant apply, feed, quote submit
components/
  RivlyApp, HomeView, DispatchView, Header, Stars
  auth/                 # LoginForm, RegisterForm, AuthLayout
  pro/                  # MerchantSignupForm, MerchantDashboard
lib/
  constants.ts, types.ts, classify.ts, api-client.ts
  i18n/                 # EN/FR messages + LocaleProvider
  supabase/             # SSR + browser clients
schema.sql              # Supabase schema (run in SQL editor)
scripts/
  verify-merchant.sql   # Manual merchant verification for testing
```

## Stack

- Next.js 15 App Router + TypeScript
- Tailwind CSS v4
- Supabase (Auth, Postgres, Realtime)
- Lucide icons
- Anthropic API (server-side only, via `/api/classify`)

## Running locally

```bash
npm install
npm run dev          # http://localhost:5173
```

Copy `.env.example` → `.env.local`:
- `ANTHROPIC_API_KEY` — live AI classification (optional; demo fallback works)
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — persistence + auth

## Dual-team workflow

Two workspaces share this git repo:

| Team | Workspace | Role |
|------|-----------|------|
| **Cursor** | `/Users/e808m/myfr.ai` | Primary build team |
| **Claude** | `/Users/e808m/rivly-claude` | Review + parallel work |

### Branch convention

- `main` — stable, reviewed code
- `cursor/*` — Cursor team feature branches
- `claude/*` — Claude team review/fix branches

### Handoff protocol

1. **Before starting work**: read `docs/REVIEW_QUEUE.md` for open items
2. **After completing work**: append a line to `docs/REVIEW_QUEUE.md` with branch, summary, and what needs review
3. **Reviewing another team's work**: check out their branch, run `npm run build`, test the flow, leave findings in `docs/REVIEW_QUEUE.md`

### What to preserve

- Brand palette in `lib/constants.ts` (navy `#10324A`, azure `#2B86BC`, amber `#E2992F`)
- Fraunces + Inter typography
- Never expose API keys in client code — all AI calls go through `app/api/classify`

### Review checklist

- [ ] `npm run build` passes
- [ ] Home → dispatch → accept quote flow works
- [ ] `/pro` signup → dashboard → submit quote flow works
- [ ] Demo mode works without API key
- [ ] No secrets in git
- [ ] Mobile layout acceptable (responsive grid)
