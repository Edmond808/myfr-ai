"use client";

import { Sparkles } from "lucide-react";
import { tierBadgeColors, type LoyaltyTier } from "@/lib/loyalty";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface LoyaltyBadgeProps {
  tier: LoyaltyTier;
  size?: "sm" | "md";
  showClub?: boolean;
}

function tierLabel(tier: LoyaltyTier, t: ReturnType<typeof useLocale>["t"]): string | null {
  switch (tier) {
    case 1:
      return t.loyalty.tierAzur;
    case 2:
      return t.loyalty.tierCote;
    case 3:
      return t.loyalty.tierPrestige;
    default:
      return null;
  }
}

export function LoyaltyBadge({ tier, size = "md", showClub = false }: LoyaltyBadgeProps) {
  const { t } = useLocale();
  const label = tierLabel(tier, t);
  if (!label) return null;

  const colors = tierBadgeColors(tier);
  const isSm = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold shrink-0 ${
        isSm ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      }`}
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      <Sparkles size={isSm ? 10 : 12} style={{ opacity: 0.85 }} />
      {showClub ? `${t.loyalty.clubName} · ${label}` : label}
    </span>
  );
}
