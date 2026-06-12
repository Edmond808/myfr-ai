"use client";

import { Sparkles } from "lucide-react";
import { tierBadgeColors, tierBadgeLabel, type LoyaltyTier } from "@/lib/loyalty";

interface LoyaltyBadgeProps {
  tier: LoyaltyTier;
  size?: "sm" | "md";
  showClub?: boolean;
}

export function LoyaltyBadge({ tier, size = "md", showClub = false }: LoyaltyBadgeProps) {
  const label = tierBadgeLabel(tier);
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
      {showClub ? `Riviera Club · ${label}` : label}
    </span>
  );
}
