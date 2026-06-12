# Review Queue

**GitHub:** https://github.com/Edmond808/myfr-ai

## Simultaneous work (Cursor + Claude)

| Workspace | Path | Branch convention |
|-----------|------|-------------------|
| **Cursor** | `/Users/e808m/myfr.ai` | `cursor/*` feature branches |
| **Claude** | `/Users/e808m/rivly-claude` | `claude/*` review/fix branches |

Both clones share one repo (`origin` → GitHub `Edmond808/myfr-ai`; rivly-claude may also use local `/Users/e808m/myfr.ai`). Before starting work: `git fetch origin && git pull origin main`. After pushing a branch, append a line here. Full loop: `docs/TEAM_WORKFLOW.md`.

**Current sync:** main @ `c5123a4` (PR #11 merged) — `cursor/mobile-app` @ `d15efbf` has dispatch RLS fixes + mobile setup **not yet on main**. Claude: pull `cursor/mobile-app` or wait for PR #12 merge.

---

## 🚨 URGENT — Claude review (2026-06-12)

**Read first:** `docs/REVIEW_QUEUE.md` (this section) → `app/api/jobs/route.ts` → `lib/dispatch-job-fallback.ts` → `components/RivlyApp.tsx` → `schema.sql` (RLS helpers + `dispatch_job`).

### P0: Dispatch flow broken for logged-in customers

**Symptoms (reproduced, not fixed end-to-end):**

1. Customer signs in as **edmond199906@gmail.com**
2. Submits request: *concierge / groceries in Cannes* (or similar grocery delivery text)
3. Classify succeeds; dispatch either **fails silently**, shows **demo quotes only**, or **nothing reaches pro**
4. Pro **treg92093@gmail.com** (verified merchant) sees **no job** in `/pro` dashboard feed

**Root cause (suspected):** Supabase **jobs ↔ quotes RLS infinite recursion** when `POST /api/jobs` inserts a job and calls `dispatch_job` RPC. Rate-limit count query can also hit recursion.

**Files involved:**

| File | Role |
|------|------|
| `components/RivlyApp.tsx` | `submit()` → `completeDispatch()` → `dispatchJobClient()`; on API error falls back to `runDemoDispatch()` (demo quotes — **masks real failure**) |
| `app/api/jobs/route.ts` | Auth gate, rate limit, `persistClassifiedJob()`, `dispatch_job` RPC, inline fallback |
| `lib/dispatch-job-fallback.ts` | `persistClassifiedJob`, `inlineDispatchJob`, `isDispatchRecoverableError`, `normalizeJobCategory` |
| `schema.sql` | `is_job_customer`, `is_merchant_on_job` security-definer helpers; `dispatch_job` sets `row_security = off` |
| `scripts/check-supabase.mjs` | Probes `is_job_customer` RPC — run `node scripts/check-supabase.mjs` |

**Cursor attempted fix (commits `91479ee`, `d15efbf` on `cursor/mobile-app`):** admin persist + inline dispatch on recursion; client demo fallback. **Still not verified** with real Supabase + both test accounts.

**Migration gap:** Code references `supabase/migrations/008_fix_jobs_quotes_rls_recursion.sql` but **file does not exist** — SQL is in `schema.sql` only. Claude must create migration `008` from `schema.sql` diff and run in Supabase SQL editor.

### Exact test case

```
Customer: edmond199906@gmail.com (logged in)
Pro:      treg92093@gmail.com (verified merchant, groceries/concierge category)
Request:  "I need groceries delivered in Cannes" (location: Cannes)
Expected: Job created → dispatch_job creates pending quotes → pro sees job in feed → customer sees real quotes (not demo)
Actual:   Dispatch fails or demo fallback; pro feed empty
```

**Verify:** `node scripts/check-supabase.mjs` → `is_job_customer` installed. Then `./scripts/dev.sh`, login as customer, submit, check Supabase `jobs` + `quotes` tables and pro dashboard.

### Mobile app — SDK 54/56 status

| Item | Status |
|------|--------|
| `package.json` | **SDK 56** (`expo` ~56.0.11) — unchanged |
| `package-lock.json` | Partial lockfile drift toward SDK 54 deps (incomplete downgrade — **do not assume SDK 54 works**) |
| App Store Expo Go on physical iPhone | **Broken** — only supports SDK 54; documented in `docs/EXPO_SIMPLE.md`, `mobile/README.md` |
| Working path today | **iPhone Simulator:** `cd mobile && npx expo start` → press **`i`** (Xcode required) |
| Tab icons | Switched from `expo-symbols` → `@expo/vector-icons` Ionicons (`mobile/app/(tabs)/_layout.tsx`) |

**Claude:** Decide SDK 54 full downgrade vs stay on 56 + simulator/EAS. Do not half-upgrade lockfile without `package.json`.

### Expo EAS setup

- Project linked: `ec89741c-6973-4ab8-9047-6934e9e9f072` (`edmond808` / `myfrai`)
- Setup script: `./scripts/mobile-expo-setup.sh` (copies `.env.local` → `mobile/.env`, EAS secrets)
- Docs: `docs/EXPO_SIMPLE.md`, `mobile/README.md` (EAS build section)
- expo.dev: set **Base directory** = `mobile`, **Production branch** = `main`

### Fix order for Claude

1. **Dispatch end-to-end** — migration `008`, run `check-supabase.mjs`, fix `POST /api/jobs` + `dispatch_job` so pro feed receives jobs (test accounts above)
2. **Remove or gate demo fallback** for authenticated users — don't mask production failures
3. **Mobile SDK decision** — 54 downgrade or 56 + EAS dev build
4. Everything else (loyalty, promotions, i18n audits)

---

## Pre-release QA

- [2026-06-12] [CURSOR] [cursor/mobile-app] — Pre-release QA: build pass (isolated), demo classify OK, customer dispatch not completed (`.next` corruption under concurrent dev/build). Report: `docs/audits/pre-release-qa-cursor-mobile-app-2026-06-12.md`. P0: exclude `mobile/` from root tsconfig; never build while dev running.

## Open items

- [2026-06-12] [CURSOR] [cursor/mobile-app / PR #12](https://github.com/Edmond808/myfr-ai/pull/12) — Dispatch RLS recursion workaround (admin persist + inline dispatch + demo fallback). **Still broken:** logged-in live dispatch until migration `008_fix_jobs_quotes_rls_recursion` applied in Supabase (+ `SUPABASE_SERVICE_ROLE_KEY` for admin path). Commits `91479ee`, `d15efbf`. Claude: review `lib/dispatch-job-fallback.ts`, `app/api/jobs/route.ts`, add migration 008 file if missing, test logged-in flow.

- [2026-06-12] [CURSOR] [PR #11 / cursor/mobile-app] — **Merge-ready (CI green).** Expo mobile app + Bearer API auth + dispatch fallback + migration `006`. Babysat: excluded `mobile/` from root tsconfig (CI typecheck fix). No review comments yet. Claude: test `cd mobile && npx expo start` against local API; run migration `006` if dispatch RPC fails. **Verified locally:** `mobile/` `npm run typecheck` pass, `npx expo-doctor` 21/21; Expo SDK 56, tab nav (Home / Requests / Pro / Account), dispatch stack, auth screens. iPhone Simulator: `npx expo start` → press `i`.

- [2026-06-12] [CURSOR] [cursor/mobile-app] — **Pro merchant audit:** `docs/audits/pro-merchant-audit-2026-06-12.md`. Top frictions: empty post-apply dashboard, no verification emails, SIRET unvalidated. P0: merchant_job_feed RLS + dispatch_job auth.

- [2026-06-12] [CURSOR] [main @ 883ce27] — **Claude: review latest main.** PRs #8–#10 merged. See Completed below. Run migrations `003`, `004`, `005` in Supabase. Test: signup, `/account/requests`, dispatch filters + loyalty, `/pro` lucide fix, error boundaries, `scripts/dev.sh` on port 3000.

- [2026-06-12] [CURSOR] [cursor/simple-setup] — Non-dev setup: `docs/SETUP_SIMPLE.md`, `npm run setup` wizard, OAuth hidden behind "More options". Needs review: run wizard flow on fresh clone.

- [2026-06-12] [CURSOR] [main] — Phase 3 item 3 still open: Resend email notifications on merchant dispatch.

- [2026-06-12] [CURSOR] [main] — **User action:** Enable branch protection on `main` (require CI + 1 review). See `docs/PR_REVIEW_AND_ROADMAP.md` Part 4.

## Audits

- [2026-06-12] [CURSOR] [cursor/mobile-app @ `0a1f915`] — **Parallel audit (5 lenses + synthesizer).** Branch identical to `main`; mobile scaffold untracked. **6 deduplicated P0**, 22 P1. Security P0s documented only (require migrations, not applied).
  - [Master summary](./audits/parallel-audit-2026-06-12/master-summary.md)
  - [Security](./audits/parallel-audit-2026-06-12/security.md) — P0:1 P1:4 P2:9
  - [Customer journey](./audits/parallel-audit-2026-06-12/customer-journey.md) — P0:2 P1:6 P2:7
  - [Pro journey](./audits/parallel-audit-2026-06-12/pro-journey.md) — P0:2 P1:10 P2:7
  - [Data layer](./audits/parallel-audit-2026-06-12/data-layer.md) — P0:2 P1:9 P2:6
  - [Mobile code review](./audits/parallel-audit-2026-06-12/code-review.md) — P0:1 P1:5 P2:7
  - **Fix first:** migration `006` for `dispatch_job` + feed view; accept errors on dispatch; resume quote after auth; align `00_RUN_THIS_IN_SUPABASE.sql`; commit `mobile/`.

- [2026-06-12] [CURSOR] [main] — **Security+auth audit:** [security-auth-audit-2026-06-12.md](./audits/security-auth-audit-2026-06-12.md) (P0=2, P1=5). Priority: harden `dispatch_job` RPC, merchant status guard, merchant PII view. Read-only; patches proposed, not applied.

- [2026-06-12] [CURSOR] [main] — **i18n/copy audit:** [i18n-copy-review-2026-06-12.md](./audits/i18n-copy-review-2026-06-12.md) — 28 issues; **185/185 key parity**; hardcoded EN in `global-error`, API errors, RivlyApp ETA; FR anglicisms + dispatch jargon. Top fixes: `home.dispatchError`, `global-error.tsx`, `loyalty.signUpToUnlock`.

- [2026-06-12] [CURSOR] [main] — **Classify→dispatch pipeline review** (playbook §3.3): [classify-dispatch-pipeline-review-2026-06-12.md](./audits/classify-dispatch-pipeline-review-2026-06-12.md). Top risks: `dispatch_job` RPC auth (P0), `/api/classify` rate limit (P1), client-trusted classification on POST /api/jobs (P1). `lib/classify.ts` flagged for human review only — no prompt edits.

- [2026-06-12] [CURSOR] [main] — **Playbook audits** (§3.2–3.7; `.cursor/SKILLS.md`, `.cursor/AUDIT_PLAYBOOK.md`):
  - [Pre-release browser QA](./audits/2026-06-12-browser-qa.md) — Cannes demo flow pass; analytics 500; `.next` corruption if build during dev
  - [Security + auth](./audits/2026-06-12-security.md) — RPC/RLS gaps, `/api/classify` rate limit, auth boundary matrix
  - [Performance](./audits/2026-06-12-performance.md)
  - [Accessibility & i18n](./audits/2026-06-12-accessibility-i18n.md) — form labels, `format-eta` i18n, `LocaleProvider` `lang`, loyalty/dispatch a11y fixes applied in code

## Claude reviews

- [2026-06-12] [CLAUDE] — Reviewed PRs #2/#3; handoff at `docs/PR_REVIEW_AND_ROADMAP.md`. Fixes A–E applied on `cursor/phase-3-oauth-journey` before merge.

- [2026-06-12] [CLAUDE] — **Start here:** `git checkout main && git pull`. Main @ `883ce27` includes loyalty (#8), promoted quotes + filters (#9), signup/error-boundary/My-requests/dev.sh fixes (#10). Docs: `docs/LOYALTY.md`, `docs/PROMOTIONS.md`, `docs/SUPABASE_AUTH.md`.

- [2026-06-12] [CURSOR] [main] — **Skills audit handoff.** `.cursor/SKILLS.md`, `.cursor/AUDIT_PLAYBOOK.md`. Code fixes from playbook audits applied (form labels, `format-eta` i18n, `LocaleProvider` `lang`, loyalty/dispatch a11y). See **Audits** above.

## Completed

- [2026-06-12] Initial Vite prototype migrated from Downloads JSX
- [2026-06-12] Phase 1 — Vite → Next.js App Router + `/api/classify`
- [2026-06-12] Phase 2 — Supabase schema, auth gate, job persistence API (code ready; Supabase project TBD)
- [2026-06-12] VoiceInput — Web Speech API with interim preview, EN/FR locale
- [2026-06-12] `npm run build` passes (Next.js 15.5.19)
- [2026-06-12] [main @ bb35594] — Phase 1-2 pushed to GitHub: Next.js + Supabase schema/API, auth (register/login), EN/FR i18n, VoiceInput
- [2026-06-12] [main @ 4ea7bc9] — Phase 3 merchant signup/dashboard merged (PR #1)
- [2026-06-12] [cursor/phase-3-oauth-journey] — Claude review fixes: atomic `accept_quote` RPC, realtime channel cleanup, honest empty state, OAuth redirect hardening, POST /api/jobs validation + rate limit, GitHub Actions CI
- [2026-06-12] PR #3 merged (OAuth + journey + alive-v1 design). PR #2 closed (superseded by #3).
- [2026-06-12] PR #7 merged — auth-after-quotes (anonymous demo quotes before register).
- [2026-06-12] PR #8 merged — Riviera Club loyalty UX on dispatch quotes.
- [2026-06-12] PR #9 merged — sponsored quote placement, quote filter bar, full pro dispatch, lucide server fix.
- [2026-06-12] PR #10 merged — signup `handle_new_user` fix, App Router error boundaries, `/account/requests`, dev.sh port cleanup, dispatch error UX.

- [2026-06-12] [CLAUDE] — Applied `claude-review-fixes-v2.patch` on main: margin-safe loyalty tiers (3/5/8%), RLS fix on `user_quote_preferences`, staged dispatch (`dispatch_job` wave 1 + `widen_dispatch` wave 2), EU ranking disclosure, honest demo/loyalty copy. Migration `006_review_fixes.sql` — run in Supabase.

## Next

1. Run migrations `003_loyalty_tier.sql`, `004_promoted_and_analytics.sql`, `005_fix_handle_new_user.sql`, `006_review_fixes.sql` in Supabase (if not already)
2. Job completion loop (Improvement #1 in roadmap)
3. Resend dispatch notifications
4. Phase 4 — Stripe Connect (`docs/STRIPE_CONNECT.md`)
