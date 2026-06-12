/**
 * Phase 4 — Stripe Connect server client.
 * TODO: install `stripe` package and initialize when STRIPE_SECRET_KEY is set.
 *
 * @see docs/STRIPE_CONNECT.md
 */

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

// TODO: export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '...' });
