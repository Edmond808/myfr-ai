# Review Queue

**GitHub:** https://github.com/Edmond808/myfr-ai

## Open items

- [2026-06-12] [CURSOR] [main @ bb35594] — Phase 1-2 pushed to GitHub: Next.js + Supabase schema/API, auth (register/login), EN/FR i18n, VoiceInput (Web Speech API). Needs: Claude code review of `app/api/jobs/route.ts` + `components/RivlyApp.tsx`

- [2026-06-12] [CLAUDE review blockers on `main`] — **Still open** (not fixed in `design/alive-v1`):
  1. **Quote acceptance not persisted** — `RivlyApp.tsx` `onAccept={setAccepted}` only updates local React state; no API call to update `quotes.status` / job in Supabase.
  2. **Demo quotes after real dispatch** — `simulateDemoQuotes()` still runs when `dispatched === 0`, Supabase fetch fails, or env missing; users can see fake merchant names alongside/instead of live quotes. Fix before or alongside design merge.

- [2026-06-12] [CURSOR] [design/alive-v1] — **Alive v1 amplified** (after visual QA): richer Mediterranean gradient shell, 4 saturated ambient blobs + vignette, stronger glass blur, gradient hero title (72px), glass-rivly-strong on header/input. Original 53c341f was present but too subtle (flat #F1F7FA overlay, 45% blob opacity, 72% white glass). Needs: visual sign-off on localhost:3000.

## Claude reviews

_(Pending: review realtime quote subscription and dispatch_job RPC integration)_

_(Reviewed 2026-06-12: quote persistence + demo-quote fallback blockers confirmed on `main` — see Open items above.)_

## Completed

- [2026-06-12] Initial Vite prototype migrated from Downloads JSX
- [2026-06-12] Phase 1 — Vite → Next.js App Router + `/api/classify`
- [2026-06-12] Phase 2 — Supabase schema, auth gate, job persistence API (code ready; Supabase project TBD)
- [2026-06-12] VoiceInput — Web Speech API with interim preview, EN/FR locale
- [2026-06-12] `npm run build` passes (Next.js 15.5.19)

## Next (do not start until review)

- Phase 3 — Merchant dashboard (`/pro`)
