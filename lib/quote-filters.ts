import type { Quote } from "./types";

export type QuoteSortBy =
  | "recommended"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "fastest";

export type MinRatingFilter = 0 | 4 | 4.5;

export interface QuoteFilters {
  minRating: MinRatingFilter;
  maxPrice: number | null;
}

export interface QuoteFilterState {
  sortBy: QuoteSortBy;
  filters: QuoteFilters;
}

export const DEFAULT_QUOTE_FILTERS: QuoteFilterState = {
  sortBy: "recommended",
  filters: {
    minRating: 0,
    maxPrice: null,
  },
};

export const MAX_PRICE_BUCKETS = [50, 100, 200, 500, 1000] as const;

function isPromotedActive(quote: Quote): boolean {
  return Boolean(quote.merchant.isPromoted);
}

function etaMinutes(quote: Quote): number {
  if (quote.merchant.responseMinutes != null) {
    return quote.merchant.responseMinutes;
  }
  const match = quote.merchant.eta?.match(/(\d+)/);
  return match ? Number(match[1]) : 999;
}

export function sortQuotesRecommended(quotes: Quote[]): Quote[] {
  return [...quotes].sort((a, b) => {
    const promoA = isPromotedActive(a) ? 1 : 0;
    const promoB = isPromotedActive(b) ? 1 : 0;
    if (promoA !== promoB) return promoB - promoA;

    const rankA = a.merchant.promotionRank ?? 0;
    const rankB = b.merchant.promotionRank ?? 0;
    if (rankA !== rankB) return rankB - rankA;

    if (a.merchant.rating !== b.merchant.rating) {
      return b.merchant.rating - a.merchant.rating;
    }

    return b.merchant.jobs - a.merchant.jobs;
  });
}

export function applyQuoteFilters(
  quotes: Quote[],
  state: QuoteFilterState,
): Quote[] {
  const { sortBy, filters } = state;

  let filtered = quotes.filter((quote) => {
    if (filters.minRating > 0 && quote.merchant.rating < filters.minRating) {
      return false;
    }
    if (
      filters.maxPrice != null &&
      quote.price > 0 &&
      quote.price > filters.maxPrice
    ) {
      return false;
    }
    return true;
  });

  switch (sortBy) {
    case "price_asc":
      filtered = [...filtered].sort((a, b) => {
        if (!a.price) return 1;
        if (!b.price) return -1;
        return a.price - b.price;
      });
      break;
    case "price_desc":
      filtered = [...filtered].sort((a, b) => {
        if (!a.price) return 1;
        if (!b.price) return -1;
        return b.price - a.price;
      });
      break;
    case "rating":
      filtered = [...filtered].sort(
        (a, b) => b.merchant.rating - a.merchant.rating,
      );
      break;
    case "fastest":
      filtered = [...filtered].sort((a, b) => {
        if (!a.price) return 1;
        if (!b.price) return -1;
        return etaMinutes(a) - etaMinutes(b);
      });
      break;
    default:
      filtered = sortQuotesRecommended(filtered);
  }

  return filtered;
}

export function hasActiveQuoteFilters(state: QuoteFilterState): boolean {
  return (
    state.sortBy !== DEFAULT_QUOTE_FILTERS.sortBy ||
    state.filters.minRating !== DEFAULT_QUOTE_FILTERS.filters.minRating ||
    state.filters.maxPrice !== DEFAULT_QUOTE_FILTERS.filters.maxPrice
  );
}
