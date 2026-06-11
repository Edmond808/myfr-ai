# myfr.ai — Production migration plan (handoff for Cursor)

Drop this file in the repo root next to AGENTS.md / CLAUDE.md. Execute phases in order.
Companion file: `schema.sql` (run in Supabase SQL editor before Phase 2).

## Phase 1 — Vite → Next.js App Router

Goal: get a deployable server. The Vite dev middleware for `/api/classify`
does not exist in production builds.

1. `npx create-next-app@latest myfr-next --typescript --tailwind --app`
2. Move `src/components/*` and `src/lib/*` as-is. RivlyApp/HomeView/DispatchView
   become client components (`'use client'`).
3. `server/classify.ts` → `app/api/classify/route.ts` (POST handler).
   Keep the prompt byte-for-byte identical — it is core IP. Keep the
   keyword demo fallback for local dev without a key.
4. Env: `ANTHROPIC_API_KEY` server-side only (no `NEXT_PUBLIC_` prefix).
5. Fonts: move Fraunces + Inter to `next/font/google` (kills the FOUT).
6. Deploy to Vercel, point myfr.ai DNS. Done = live demo URL.

## Phase 2 — Supabase persistence

1. Create Supabase project (EU region — Frankfurt or Paris, GDPR).
2. Run `schema.sql`. Enable Supabase Auth: email magic link + Google.
3. After `/api/classify` returns: insert into `jobs`, then call
   `dispatch_job(job_id)` RPC. Replace `simulateQuotes()` with a Supabase
   realtime subscription on `quotes` where `job_id = current job`.
4. Keep `raw_request` always — it is future training/eval data for the
   classifier and proof of demand per category for investors/acquirers.
5. Anonymous-first UX: let users type and classify WITHOUT login; require
   auth only at "Send to pros". (Conversion killer otherwise.)

## Phase 3 — Merchant side (the supply — top priority after persistence)

1. `/pro` route: merchant signup → row in `merchants` with status `applied`.
   Admin (you) flips to `verified` manually for the first 50 — manual
   whitelisting IS the quality moat, do not automate yet.
2. Merchant dashboard: query `merchant_job_feed` view → list of dispatched
   jobs → quote form (price + message) → updates `quotes` row to `submitted`.
3. Notifications v1: email via Resend on new dispatch. v2: WhatsApp Business
   API (Riviera pros live on WhatsApp) — Twilio or 360dialog as provider.
4. Quote expiry: pending quotes expire after 4h (already in schema); cron
   via Vercel Cron or pg_cron to mark expired + re-dispatch to next merchant.

## Phase 4 — Stripe Connect (commission + escrow)

Model: **destination charges with separate transfers (manual payouts)**.

1. Merchant onboarding: Stripe Connect **Express** accounts. Onboarding link
   from merchant dashboard → store `stripe_account_id`, flip
   `stripe_onboarded` on `account.updated` webhook.
2. On quote accept:
   - Create PaymentIntent for full amount, `transfer_group = job_id`,
     capture immediately. Insert `transactions` row, status `held`.
   - Job status → `in_progress`.
3. On customer "mark complete" (add this button to DispatchView):
   - Create Transfer to merchant for `merchant_payout_eur`
     (amount − commission). Status → `released`. Job → `completed`.
   - Commission stays in platform balance automatically.
4. Dispute path: no transfer until resolved; refund via PaymentIntent if
   needed. Status → `disputed`. Manual handling at this stage is fine.
5. Regulatory note (France): routing third-party funds normally requires
   payment-agent registration with ACPR. Using Stripe Connect correctly
   keeps Stripe as the regulated entity. Verify the current Stripe Connect
   France terms cover the marketplace exemption before launch — confirm
   with Stripe support in writing.
6. Auto-release: if customer doesn't confirm within 72h of merchant marking
   done, release automatically (protects merchants, standard marketplace
   practice).

## Phase 5 — Polish for launch

- FR + EN i18n (next-intl). The classifier already handles French input;
  the UI must too. Riviera = French locals + international visitors.
- SEO landing pages per category × city ("housekeeping Cannes",
  "boat charter Antibes") — these are exactly the searches the Facebook
  group members make.
- Admin panel: jobs table, merchant approval queue, transaction log.

## Sequencing summary

| Order | Phase | Why first |
|-------|-------|-----------|
| 1 | Next.js migration | Nothing deploys without it |
| 2 | Supabase | Nothing persists without it |
| 3 | Merchant side | Supply is the existential risk |
| 4 | Stripe Connect | Revenue switch — flip when supply exists |
| 5 | Polish | Launch into the Facebook groups |

## Do not change

- The classification prompt in classify route (core IP)
- The 8-category enum (DB enum + prompt + UI must stay in sync —
  single source of truth: `src/lib/types.ts`, generate the rest)
- COMMISSION default 0.15 (now per-merchant `commission_rate` in DB)
