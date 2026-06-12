import { NextResponse } from "next/server";

/**
 * Phase 4 — Stripe Connect webhook handler.
 * TODO: verify signature with STRIPE_WEBHOOK_SECRET and handle:
 *   - account.updated → flip merchants.stripe_onboarded
 *   - payment_intent.succeeded / payment_intent.payment_failed
 *
 * @see docs/STRIPE_CONNECT.md
 */
export async function POST(request: Request) {
  // TODO: const sig = request.headers.get('stripe-signature');
  void request;
  return NextResponse.json(
    { error: "Stripe webhook not implemented — Phase 4" },
    { status: 501 },
  );
}
