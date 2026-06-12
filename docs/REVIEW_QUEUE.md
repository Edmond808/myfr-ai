# Review Queue

**GitHub:** https://github.com/Edmond808/myfr-ai

## Open items

- [2026-06-12] [CURSOR] [cursor/phase-3-merchant] — Phase 3 merchant side: `/pro` signup (status `applied`), `/pro/dashboard` job feed + quote submit, RLS patches in `schema.sql`, `scripts/verify-merchant.sql`. Needs: Claude review of merchant API routes + RLS policies. TODO: Resend email notifications (Phase 3 item 3).

## Claude reviews

_(Pending: review merchant_job_feed RLS + quote submit flow on `cursor/phase-3-merchant`)_

## Completed

- [2026-06-12] Initial Vite prototype migrated from Downloads JSX
- [2026-06-12] Phase 1 — Vite → Next.js App Router + `/api/classify`
- [2026-06-12] Phase 2 — Supabase schema, auth gate, job persistence API (code ready; Supabase project TBD)
- [2026-06-12] VoiceInput — Web Speech API with interim preview, EN/FR locale
- [2026-06-12] `npm run build` passes (Next.js 15.5.19)
- [2026-06-12] [main @ bb35594] — Phase 1-2 pushed to GitHub: Next.js + Supabase schema/API, auth (register/login), EN/FR i18n, VoiceInput

## Next (do not start until review)

- Phase 4 — Stripe Connect (commission + escrow)
