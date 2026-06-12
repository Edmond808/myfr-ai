# Stripe Connect — Phase 4 checklist

Phase 4 from `MIGRATION_PLAN.md`. **Do not implement until merchant supply exists.** No Stripe keys are required for scaffolding.

## Model

Destination charges with separate transfers (manual payouts). Stripe Connect Express accounts for merchants.

## Checklist

### 1. Merchant onboarding

- [ ] Add Stripe Connect Express onboarding link from `/pro/dashboard`
- [ ] Store `stripe_account_id` on `merchants` row
- [ ] Flip `stripe_onboarded` on `account.updated` webhook
- [ ] Block quote payouts until `stripe_onboarded = true`

### 2. Quote accept → PaymentIntent

- [ ] On customer quote accept (`PATCH /api/jobs` today): create PaymentIntent for full amount
- [ ] Set `transfer_group = job_id`, capture immediately
- [ ] Insert `transactions` row with status `held`
- [ ] Update job status → `in_progress`

### 3. Job complete → Transfer

- [ ] Add "Mark complete" button in `DispatchView`
- [ ] Create Transfer to merchant for `merchant_payout_eur` (amount − commission)
- [ ] Update transaction status → `released`, job → `completed`
- [ ] Commission remains in platform balance

### 4. Disputes

- [ ] Hold transfer until resolved
- [ ] Refund via PaymentIntent if needed
- [ ] Transaction status → `disputed` (manual handling OK at launch)

### 5. Auto-release (72h)

- [ ] If customer doesn't confirm within 72h of merchant marking done, auto-release transfer
- [ ] Vercel Cron or pg_cron job

### 6. Regulatory (France)

- [ ] Confirm Stripe Connect France terms cover marketplace exemption with Stripe support in writing (ACPR payment-agent rules)

## Env vars (when ready)

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Code stubs

- `lib/stripe.ts` — server-side Stripe client (TODO)
- `app/api/stripe/webhook/route.ts` — webhook handler (TODO)

## DB (already in schema)

- `merchants.stripe_account_id`, `merchants.stripe_onboarded`
- `transactions` table with `stripe_payment_intent_id`, `stripe_transfer_id`
