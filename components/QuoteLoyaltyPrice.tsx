"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { PALETTE } from "@/lib/constants";
import {
  computeLoyaltyPricing,
  LOYALTY_TIERS,
  tierBadgeLabel,
  type LoyaltyTier,
} from "@/lib/loyalty";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LoyaltyBadge } from "./LoyaltyBadge";

function interpolate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (acc, [key, val]) => acc.replace(`{${key}}`, String(val)),
    template,
  );
}

interface QuoteLoyaltyPriceProps {
  listPrice: number;
  loyaltyTier: LoyaltyTier;
  isLoggedIn: boolean;
  onSignUp?: () => void;
}

export function QuoteLoyaltyPrice({
  listPrice,
  loyaltyTier,
  isLoggedIn,
  onSignUp,
}: QuoteLoyaltyPriceProps) {
  const { t } = useLocale();
  const pricing = computeLoyaltyPricing(listPrice, loyaltyTier, isLoggedIn);
  const tierLabel = tierBadgeLabel(pricing.displayTier) ?? LOYALTY_TIERS[pricing.displayTier].name;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <LoyaltyBadge tier={pricing.displayTier} size="sm" />
        {pricing.locked && (
          <span
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-semibold"
            style={{ color: "#5C7E92" }}
          >
            <Lock size={10} />
            {t.loyalty.priceLocked}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span
          className="text-base line-through"
          style={{ color: "#5C7E92", fontWeight: 500 }}
        >
          €{pricing.listPrice}
        </span>
        <span
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 24,
            fontWeight: 600,
            color: pricing.locked ? "#5C7E92" : PALETTE.navy,
            opacity: pricing.locked ? 0.75 : 1,
          }}
        >
          €{pricing.memberPrice}
        </span>
      </div>

      {!pricing.locked && pricing.savings > 0 && (
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "#D4F0E0", color: "#1F7A4D" }}
        >
          {interpolate(t.loyalty.youSave, {
            amount: pricing.savings,
            tier: tierLabel,
          })}
        </span>
      )}

      {pricing.locked && !isLoggedIn && (
        onSignUp ? (
          <button
            type="button"
            onClick={onSignUp}
            className="text-xs font-semibold underline underline-offset-2"
            style={{ color: PALETTE.azure }}
          >
            {t.loyalty.signUpToUnlock}
          </button>
        ) : (
          <Link
            href="/auth/register"
            className="text-xs font-semibold underline underline-offset-2"
            style={{ color: PALETTE.azure }}
          >
            {t.loyalty.signUpToUnlock}
          </Link>
        )
      )}

      {pricing.locked && isLoggedIn && loyaltyTier === 0 && (
        <p className="text-xs text-right max-w-[200px]" style={{ color: "#5C7E92" }}>
          {t.loyalty.firstBookingUnlock}
        </p>
      )}
    </div>
  );
}

interface LoyaltyProgressTeaseProps {
  loyaltyTier: LoyaltyTier;
  completedBookings?: number;
}

export function LoyaltyProgressTease({
  loyaltyTier,
  completedBookings = 0,
}: LoyaltyProgressTeaseProps) {
  const { t } = useLocale();

  if (loyaltyTier >= 3) return null;

  const nextTier = (loyaltyTier + 1) as LoyaltyTier;
  const threshold = LOYALTY_TIERS[nextTier].bookingsToReach;
  const remaining = Math.max(0, threshold - completedBookings);
  const nextLabel =
    nextTier === 1
      ? t.loyalty.tierAzur
      : nextTier === 2
        ? t.loyalty.tierCote
        : t.loyalty.tierPrestige;

  if (remaining === 0) return null;

  const message =
    remaining === 1
      ? interpolate(t.loyalty.progressTeaseOne, { tier: nextLabel })
      : interpolate(t.loyalty.progressTease, { count: remaining, tier: nextLabel });

  return (
    <p
      className="reveal reveal-d2 text-xs mb-4 px-3 py-2 rounded-xl inline-block"
      style={{ background: PALETTE.amberSoft, color: "#7A5212", fontWeight: 500 }}
    >
      {message}
    </p>
  );
}
