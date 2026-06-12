# Review Queue

**GitHub:** https://github.com/Edmond808/myfr-ai

## Open items

- [2026-06-12] [CURSOR] [main] — **User action:** Run `supabase/migrations/002_accept_quote.sql` in Supabase SQL editor. Configure OAuth providers per `docs/SUPABASE_AUTH.md`.

- [2026-06-12] [CURSOR] [main] — Phase 3 item 3 still open: Resend email notifications on merchant dispatch.

- [2026-06-12] [CURSOR] [main] — **User action:** Enable branch protection on `main` (require CI + 1 review). See `docs/PR_REVIEW_AND_ROADMAP.md` Part 4.

- [2026-06-12] [CURSOR] [cursor/rebrand-myfr-ai] — Rebrand Rivly → **myfr.ai**; French tricolor entry splash (`LoadingSplash`), favicon, docs/metadata/i18n. Needs review: splash on first session visit, instant on repeat navigation.

## Claude reviews

- [2026-06-12] [CLAUDE] — Reviewed PRs #2/#3; handoff at `docs/PR_REVIEW_AND_ROADMAP.md`. Fixes A–E applied on `cursor/phase-3-oauth-journey` before merge.

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

## Next

1. Run migration `002_accept_quote.sql` in Supabase
2. Job completion loop (Improvement #1 in roadmap)
3. Resend dispatch notifications
4. Phase 4 — Stripe Connect (`docs/STRIPE_CONNECT.md`)
