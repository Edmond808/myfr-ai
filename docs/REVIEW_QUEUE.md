# Review Queue

**GitHub:** https://github.com/Edmond808/myfr-ai

## Open items

- [2026-06-12] [CURSOR] [cursor/phase-3-oauth-journey] — OAuth (Google/Apple), alive-v1 auth polish, user menu, quote acceptance API, demo-quote fix, Phase 4 Stripe stubs. Needs: Claude review + Supabase dashboard OAuth setup per `docs/SUPABASE_AUTH.md`. Run new `customer accepts quotes` RLS policy in Supabase SQL editor.

- [2026-06-12] [CURSOR] [design/alive-v1] — **Alive v1 amplified** — PR #2 open. Needs: visual sign-off on localhost:3000 before merge to main.

- [2026-06-12] [CURSOR] [cursor/phase-3-merchant] — Phase 3 merchant side merged to main (PR #1). TODO: Resend email notifications (Phase 3 item 3).

## Claude reviews

_(Pending: review OAuth callback + `PATCH /api/jobs` quote acceptance on `cursor/phase-3-oauth-journey`)_

_(Pending: review merchant_job_feed RLS + quote submit flow on `main`)_

## Completed

- [2026-06-12] Initial Vite prototype migrated from Downloads JSX
- [2026-06-12] Phase 1 — Vite → Next.js App Router + `/api/classify`
- [2026-06-12] Phase 2 — Supabase schema, auth gate, job persistence API (code ready; Supabase project TBD)
- [2026-06-12] VoiceInput — Web Speech API with interim preview, EN/FR locale
- [2026-06-12] `npm run build` passes (Next.js 15.5.19)
- [2026-06-12] [main @ bb35594] — Phase 1-2 pushed to GitHub: Next.js + Supabase schema/API, auth (register/login), EN/FR i18n, VoiceInput
- [2026-06-12] [main @ 4ea7bc9] — Phase 3 merchant signup/dashboard merged (PR #1)
- [2026-06-12] [cursor/phase-3-oauth-journey] — **Blockers fixed:** quote acceptance persisted via `PATCH /api/jobs`; demo quotes only when Supabase unavailable or dispatch API fails (not when `dispatched === 0`)

## Next

- Phase 4 — Stripe Connect (`docs/STRIPE_CONNECT.md` scaffold ready; no keys required yet)
- Merge `design/alive-v1` → `main` after visual sign-off
- Resend notifications for merchant dispatches
