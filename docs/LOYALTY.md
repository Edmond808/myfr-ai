# Riviera Club — Loyalty Program

myfr.ai loyalty beats OTA patterns (Booking.com Genius) with transparent Mediterranean tier naming and member pricing shown on every quote.

## Tiers

| Tier | Name | Discount | Unlock |
|------|------|----------|--------|
| 0 | Guest | 0% | Default — join free |
| 1 | Azur I | 8% | 1 completed booking |
| 2 | Côte II | 12% | 4 completed bookings |
| 3 | Prestige III | 18% | 10 completed bookings |

## Pricing

- **List price** `P` — merchant quote (unchanged in dispatch).
- **Member price** — `round(P × (1 − discount))`.
- Escrow charges the member price for tiers 1–3; Guest pays list until first booking unlocks Azur.

## UX rules

- **Anonymous** — preview Azur I member prices (greyed) + “Sign up to unlock Riviera Club prices”.
- **Logged-in Guest (tier 0)** — same preview + “Complete your first booking to unlock Azur I”.
- **Members** — strikethrough list price, bold member price, green “You save €X” pill, tier badge.
- **Header** — small tier badge next to avatar when tier ≥ 1.

## Schema

Run `supabase/migrations/003_loyalty_tier.sql` in Supabase SQL editor. Column: `profiles.loyalty_tier` (default 0).

Tier upgrades are manual/automated in a future phase (webhook on job completion).
