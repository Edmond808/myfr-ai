# Review Queue

## Open items

- [2026-06-12] [CURSOR] [main @ bb35594] — Phase 1-2 committed locally: Next.js + Supabase schema/API, auth (register/login), EN/FR i18n, VoiceInput (Web Speech API). **Push blocked** — run `gh auth login` then `gh repo create myfr.ai --public --source=. --remote=origin --push`. Needs: Claude code review of `app/api/jobs/route.ts` + `components/RivlyApp.tsx`

## Claude reviews

_(Pending: review realtime quote subscription and dispatch_job RPC integration)_

## Completed

- [2026-06-12] Initial Vite prototype migrated from Downloads JSX
- [2026-06-12] Phase 1 — Vite → Next.js App Router + `/api/classify`
- [2026-06-12] Phase 2 — Supabase schema, auth gate, job persistence API (code ready; Supabase project TBD)
- [2026-06-12] VoiceInput — Web Speech API with interim preview, EN/FR locale
- [2026-06-12] `npm run build` passes (Next.js 15.5.19)

## Next (do not start until review)

- Phase 3 — Merchant dashboard (`/pro`)
