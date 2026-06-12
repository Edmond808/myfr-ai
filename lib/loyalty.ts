export type LoyaltyTier = 0 | 1 | 2 | 3;

// Platform commission. Loyalty discounts MUST stay below this so member
// pricing never inverts the margin (see docs/LOYALTY.md, economics).
export const PLATFORM_COMMISSION = 0.15;

export interface TierConfig {
  tier: LoyaltyTier;
  name: string;
  roman: string;
  discount: number;
  perkKey: "guest" | "azur" | "cote" | "prestige";
  bookingsToReach: number;
}

export const LOYALTY_TIERS: Record<LoyaltyTier, TierConfig> = {
  0: {
    tier: 0,
    name: "Guest",
    roman: "",
    discount: 0,
    perkKey: "guest",
    bookingsToReach: 0,
  },
  1: {
    tier: 1,
    name: "Azur",
    roman: "I",
    discount: 0.03,
    perkKey: "azur",
    bookingsToReach: 1,
  },
  2: {
    tier: 2,
    name: "Côte",
    roman: "II",
    discount: 0.05,
    perkKey: "cote",
    bookingsToReach: 4,
  },
  3: {
    tier: 3,
    name: "Prestige",
    roman: "III",
    discount: 0.08,
    perkKey: "prestige",
    bookingsToReach: 10,
  },
};

const maxDiscount = Math.max(
  ...Object.values(LOYALTY_TIERS).map((t) => t.discount),
);
if (maxDiscount >= PLATFORM_COMMISSION) {
  throw new Error(
    "Loyalty misconfigured: max tier discount must stay below platform commission",
  );
}

export const PREVIEW_TIER: LoyaltyTier = 1;

export function normalizeLoyaltyTier(value: unknown): LoyaltyTier {
  const n = typeof value === "number" ? value : Number(value);
  if (n >= 0 && n <= 3 && Number.isInteger(n)) return n as LoyaltyTier;
  return 1;
}

export function memberPrice(listPrice: number, tier: LoyaltyTier): number {
  const discount = LOYALTY_TIERS[tier].discount;
  return Math.round(listPrice * (1 - discount));
}

export function loyaltySavings(listPrice: number, tier: LoyaltyTier): number {
  return listPrice - memberPrice(listPrice, tier);
}

export interface LoyaltyPricing {
  listPrice: number;
  memberPrice: number;
  payPrice: number;
  savings: number;
  displayTier: LoyaltyTier;
  actualTier: LoyaltyTier;
  previewMode: boolean;
  locked: boolean;
}

export function computeLoyaltyPricing(
  listPrice: number,
  actualTier: LoyaltyTier,
  isLoggedIn: boolean,
): LoyaltyPricing {
  const previewMode = !isLoggedIn || actualTier === 0;
  const displayTier: LoyaltyTier = previewMode ? PREVIEW_TIER : actualTier;

  return {
    listPrice,
    memberPrice: memberPrice(listPrice, displayTier),
    payPrice: payPrice(listPrice, actualTier, isLoggedIn),
    savings: loyaltySavings(listPrice, displayTier),
    displayTier,
    actualTier,
    previewMode,
    locked: previewMode,
  };
}

export function payPrice(listPrice: number, actualTier: LoyaltyTier, isLoggedIn: boolean): number {
  if (!isLoggedIn || actualTier === 0) return listPrice;
  return memberPrice(listPrice, actualTier);
}

export function bookingsUntilNextTier(
  actualTier: LoyaltyTier,
  completedBookings: number,
): { remaining: number; nextTier: LoyaltyTier; nextName: string } | null {
  if (actualTier >= 3) return null;
  const nextTier = (actualTier + 1) as LoyaltyTier;
  const threshold = LOYALTY_TIERS[nextTier].bookingsToReach;
  const remaining = Math.max(0, threshold - completedBookings);
  return {
    remaining,
    nextTier,
    nextName: LOYALTY_TIERS[nextTier].name,
  };
}

export function tierBadgeLabel(tier: LoyaltyTier): string | null {
  if (tier === 0) return null;
  const config = LOYALTY_TIERS[tier];
  return `${config.name} ${config.roman}`;
}

export function tierBadgeColors(tier: LoyaltyTier): { bg: string; text: string; border: string } {
  switch (tier) {
    case 1:
      return { bg: "#DCEDF6", text: "#10324A", border: "#2B86BC" };
    case 2:
      return { bg: "#10324A", text: "#FFFFFF", border: "#2B86BC" };
    case 3:
      return { bg: "#E2992F", text: "#10324A", border: "#C47E1A" };
    default:
      return { bg: "#F1F7FA", text: "#5C7E92", border: "#D4E4ED" };
  }
}
