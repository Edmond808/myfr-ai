# Promoted placement (pro sellers)

Verified pros can pay for **sponsored placement** at the top of the customer quote list on the dispatch screen.

## How it works

1. Customer submits a request → `dispatch_job()` runs **staged dispatch** (migration 006): wave 1 = all active-promoted pros + top 5 by rating. `widen_dispatch(job_id)` adds remaining matching pros — call it via cron ~60–90 min after dispatch when fewer than 2 quotes arrived. Staging protects merchant win rates (all-merchant blasts cause quote fatigue and supply churn).
2. Merchants with an active promotion appear first, ordered by `promotion_rank` (higher = closer to top), then rating and completed jobs.
3. Promoted quotes show an amber **Sponsored** badge in `DispatchView`.

## Database fields (`merchants`)

| Column | Purpose |
|--------|---------|
| `is_promoted` | Whether the pro has paid placement |
| `promotion_rank` | Tie-break among promoted pros (default 0) |
| `promotion_expires_at` | Optional expiry; `null` = no end date |

Expired promotions (`promotion_expires_at < now()`) are ignored for ordering.

## Testing locally

Run migration `supabase/migrations/004_promoted_and_analytics.sql`, then use `scripts/promote-merchant.sql` to set `is_promoted = true` on a verified merchant.

Without Supabase, demo mode simulates 6–8 merchants per category with 1–2 promoted (see `DEMO_MERCHANTS` in `lib/constants.ts`).

## Billing (Phase 4 — placeholder)

Stripe subscription or one-off checkout for promotion slots is **not implemented yet**. Until then:

- Promotions are set manually via SQL (`scripts/promote-merchant.sql`).
- Pro dashboard will later expose “Promote my listing” with Stripe Checkout.

Suggested Phase 4 flow:

1. Pro selects duration (7 / 30 days) and rank tier.
2. Stripe Checkout → webhook sets `is_promoted`, `promotion_rank`, `promotion_expires_at`.
3. Cron or webhook clears `is_promoted` when expired.

## Customer filters & analytics

Customers can sort and filter quotes (price, rating, response time). Choices are logged to `user_quote_preferences` via `POST /api/analytics/quote-filters` for future personalized offers.

## Ranking disclosure (EU/FR compliance)

The customer quote list displays the ordering criteria ("sponsored first,
then rating and completed jobs") via `t.dispatch.rankingDisclosure` —
required transparency for paid ranking under EU consumer rules. Keep this
line if the ordering logic changes; update it instead of removing it.
