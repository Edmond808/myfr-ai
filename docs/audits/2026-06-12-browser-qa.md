# Pre-release Browser QA — myfr.ai

**Date:** 2026-06-12  
**Branch:** `main`  
**Scope:** `.cursor/AUDIT_PLAYBOOK.md` §3.2 Pre-release QA  
**Skills used:** `visual-qa-testing`, `verifying-in-browser`, `form-testing`  
**Build:** `npm run build` — **pass** (Next.js 15.5.19)  
**Environment:** `localhost:3000` via `./scripts/dev.sh`, `.env.local` present (Supabase configured, demo classify active)

---

## Executive summary

Core customer demo flow works end-to-end for anonymous users: home → classify → dispatch → 7 demo quotes → filter/sort → accept redirects to register. Pro and auth pages render correctly on desktop. Two server-side issues surfaced in network logs: **`POST /api/analytics/quote-filters` returns 500** (missing migration table), and **running `npm run build` while the dev server is running corrupts `.next`**, causing CSS to fail to load until a clean restart.

| Area | Result |
|------|--------|
| Customer flow (demo) | **Pass** |
| Quote filters (UI) | **Pass** (client-side) |
| Quote filter analytics API | **Fail** (500) |
| Accept quote (anonymous) | **Pass** (redirects to register) |
| Pro flow (unauthenticated) | **Pass** (auth gate) |
| Pro dashboard | **Not tested** (requires login + verified merchant) |
| Auth register form | **Pass** (HTML5 validation); mobile layout issues |
| Demo mode without API key | **Pass** |
| Mobile (375px) | **Partial** — usable but auth forms clip / left-align |
| `npm run build` | **Pass** |

---

## AGENTS.md review checklist

| Item | Pass/Fail | Notes |
|------|-----------|-------|
| `npm run build` passes | ✅ Pass | Clean build, 19 routes |
| Home → dispatch → accept quote | ✅ Pass | Demo quotes; accept → `/auth/register?next=/?resume=dispatch` |
| `/pro` signup → dashboard → submit quote | ⚠️ Partial | Auth gate OK; dashboard not reachable without credentials |
| Demo mode without API key | ✅ Pass | "Demo mode — set ANTHROPIC_API_KEY" banner shown; classify uses demo fallback |
| No secrets in git | ✅ Pass | Not in scope of browser pass; no secrets observed in UI/network |
| Mobile layout acceptable | ⚠️ Partial | Home/dispatch OK at 375px; register form card clips bottom field |

---

## Flow test results

### 1. Customer flow — Cannes grocery request

**Steps:** Home → enter *"I need groceries delivered in Cannes tomorrow"* → Cannes selected → Send request.

| Step | Result | Evidence |
|------|--------|----------|
| Classify | ✅ 200 | Server log: `POST /api/classify 200` |
| Dispatch view | ✅ | Category "Groceries & errands", location Cannes, 7 quotes animate in |
| Demo banner | ℹ️ | "Demo mode — set ANTHROPIC_API_KEY for live AI dispatch" visible |
| Sort/filter | ✅ | Changed sort to "Price: low to high"; "Clear all" chip appeared; client re-sorted |
| Accept quote | ✅ | Redirected to `/auth/register?next=/%3Fresume%3Ddispatch`; pending request saved in session |

**Screenshot notes:** Dispatch view shows quote cards with member pricing, sponsored badges, and Riviera Club CTA banner. Job title displays truncated (*"…Cannes tom…"*) while summary shows full text.

### 2. Pro flow — `/pro`

**Steps:** Navigate to `/pro` while logged out.

| Step | Result | Notes |
|------|--------|-------|
| Auth gate | ✅ | "Join as a Riviera pro" with OAuth, Sign in, Create account buttons |
| Signup form | — | Not reachable without auth (expected) |
| Dashboard | — | Skipped — requires authenticated verified merchant |

Desktop layout is clean and centered. Earlier false alarm (black/unstyled page) was caused by stale `.next` after concurrent `npm run build` — resolved by killing dev server, `rm -rf .next`, restart.

### 3. Auth — register form

**Steps:** `/auth/register` → empty submit.

| Test | Result |
|------|--------|
| Empty submit | ✅ Pass | HTML5 "Please fill in this field" on first required input |
| Fields present | ✅ | Full name, email, password, confirm, language, default city |
| Mobile 375px | ⚠️ | Form card left-aligned; "Default city" field partially clipped; submit reachable after scroll |

### 4. Mobile viewport (375×812)

| Page | Result | Notes |
|------|--------|-------|
| Home | ✅ | Hero, request card, location pills, category grid stack correctly |
| Dispatch | ✅ | Quote cards stack; filters wrap; CTAs accessible |
| Register | ⚠️ | Form usable but card not full-width; bottom field clipped in initial viewport |

---

## Network audit

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /api/classify` | 200 | Demo classification returned |
| `POST /api/analytics/quote-filters` | **500** | `Could not find the table 'public.user_quote_preferences'` — migration `004_promoted_and_analytics.sql` not applied |
| `POST /api/jobs` (curl, no auth) | 401 | Expected — auth required at dispatch for logged-in users |
| Static assets / CSS | 200 | After clean dev restart; **0 stylesheets** observed when `.next` corrupted |

Filter changes on dispatch view trigger debounced analytics POST (~500ms). Failure is silent in UI (no user-facing error) but pollutes server logs and loses analytics data.

---

## Findings (prioritized)

### P1 — `POST /api/analytics/quote-filters` 500 (missing table)

**Severity:** P1 — broken API, repeated on every filter change  
**Repro:** Submit any request → dispatch → change sort or filter dropdown  
**Error:** `Could not find the table 'public.user_quote_preferences' in the schema cache`  
**Root cause:** `supabase/migrations/004_promoted_and_analytics.sql` not applied to the linked Supabase project  
**Fix:** Run migration 004 in Supabase SQL editor, or make the route fail gracefully when table is absent (return `{ ok: true, skipped: true }` like the no-Supabase path)

### P1 — Dev/build cache collision breaks CSS

**Severity:** P1 — operational; renders app unusable  
**Repro:** Run `npm run build` while `npm run dev` is active on the same `.next` directory  
**Symptom:** All pages lose CSS (`document.styleSheets.length === 0`); black/unstyled layout  
**Fix:** Document in AGENTS.md/dev script: never run production build concurrently with dev; `./scripts/dev.sh` already clears `.next` on start — add warning after build or use separate output dirs

### P2 — Job title truncated mid-word in dispatch header

**Severity:** P2 — UX confusion  
**Repro:** Request *"I need groceries delivered in Cannes tomorrow"* → title shows *"I need groceries delivered in Cannes tom…"* while summary below shows full text  
**Root cause:** `lib/classify.ts` demo path: first 8 words joined, then hard 40-char cut (`words.slice(0, 40) + "…"`)  
**Fix:** Use word-boundary truncation, or show full title in dispatch and truncate only in list views

### P2 — Demo-mode banner visible to end users

**Severity:** P2 — polish  
**Repro:** Any dispatch in demo classify mode  
**Symptom:** "Demo mode — set ANTHROPIC_API_KEY for live AI dispatch" shown in customer-facing card  
**Fix:** Hide behind `process.env.NODE_ENV === 'development'` or replace with customer-friendly copy

### P3 — Next.js dev issue overlay on page

**Severity:** P3 — dev-only noise  
**Symptom:** Red "1 Issue" badge bottom-left during QA (likely tied to analytics 500)  
**Fix:** Resolve underlying 500; overlay won't appear in production builds

### P3 — Register form mobile layout

**Severity:** P3 — UX  
**Symptom:** At 375px, auth card left-aligned with empty space; bottom field clipped before scroll  
**Fix:** Review `AuthLayout` max-width/centering at small breakpoints

---

## What passed

- Production build compiles all 19 routes without errors
- Anonymous classify → demo dispatch → quote animation → sort/filter (client-side)
- Accept quote correctly gates anonymous users to registration with resume param
- `/pro` auth gate renders OAuth + email auth CTAs
- Register form HTML5 required-field validation
- Home and dispatch responsive at 375px
- No client-side Anthropic calls observed (classify via `/api/classify` only)

---

## Not tested (blocked)

| Item | Blocker |
|------|---------|
| Pro merchant signup form (SIRET, categories) | Requires authenticated user |
| Merchant dashboard + quote submit | Requires verified merchant account |
| Logged-in dispatch via `/api/jobs` | No test credentials in session |
| `/account/requests` | Requires login |
| Live AI classify (with `ANTHROPIC_API_KEY`) | Demo fallback active in this environment |
| Accept quote persistence | Requires auth + job in Supabase |

---

## Recommendations before release

1. **Apply migration 004** (`user_quote_preferences`) or degrade analytics route gracefully
2. **Add dev workflow note:** do not run `npm run build` while dev server is running
3. **Fix title truncation** in demo/live classify output for dispatch header
4. **Hide demo-mode banner** from production-facing UI
5. **Re-run this QA** after migration with a test merchant account to cover pro dashboard and logged-in accept flow

---

## QA metadata

- **Browser:** Cursor IDE browser MCP (`cursor-ide-browser`)
- **Viewports tested:** Desktop (default panel), 375×812 mobile emulation
- **Screenshots:** Captured in-browser during session (dispatch quotes, /pro auth gate, mobile home, register validation tooltip)
- **Commit:** None (audit only)
