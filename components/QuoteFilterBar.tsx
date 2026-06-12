"use client";

import { X } from "lucide-react";
import {
  DEFAULT_QUOTE_FILTERS,
  MAX_PRICE_BUCKETS,
  type MinRatingFilter,
  type QuoteFilterState,
  type QuoteSortBy,
} from "@/lib/quote-filters";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface QuoteFilterBarProps {
  state: QuoteFilterState;
  onChange: (state: QuoteFilterState) => void;
  onClear: () => void;
}

export function QuoteFilterBar({ state, onChange, onClear }: QuoteFilterBarProps) {
  const { t } = useLocale();
  const { sortBy, filters } = state;

  const sortOptions: { value: QuoteSortBy; label: string }[] = [
    { value: "recommended", label: t.dispatch.sortRecommended },
    { value: "price_asc", label: t.dispatch.sortPriceLow },
    { value: "price_desc", label: t.dispatch.sortPriceHigh },
    { value: "rating", label: t.dispatch.sortRating },
    { value: "fastest", label: t.dispatch.sortFastest },
  ];

  const ratingOptions: { value: MinRatingFilter; label: string }[] = [
    { value: 0, label: t.dispatch.ratingAny },
    { value: 4, label: t.dispatch.rating4Plus },
    { value: 4.5, label: t.dispatch.rating45Plus },
  ];

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];

  if (sortBy !== DEFAULT_QUOTE_FILTERS.sortBy) {
    const sortLabel = sortOptions.find((o) => o.value === sortBy)?.label ?? sortBy;
    activeChips.push({
      key: "sort",
      label: sortLabel,
      onRemove: () => onChange({ ...state, sortBy: DEFAULT_QUOTE_FILTERS.sortBy }),
    });
  }

  if (filters.minRating > 0) {
    const ratingLabel =
      ratingOptions.find((o) => o.value === filters.minRating)?.label ??
      `${filters.minRating}+`;
    activeChips.push({
      key: "rating",
      label: ratingLabel,
      onRemove: () =>
        onChange({
          ...state,
          filters: { ...filters, minRating: 0 },
        }),
    });
  }

  if (filters.maxPrice != null) {
    activeChips.push({
      key: "price",
      label: t.dispatch.maxPriceChip.replace("{price}", String(filters.maxPrice)),
      onRemove: () =>
        onChange({
          ...state,
          filters: { ...filters, maxPrice: null },
        }),
    });
  }

  return (
    <div
      className="reveal reveal-d2 mb-4 rounded-2xl p-4 space-y-3"
      style={{ background: PALETTE.white, border: `1px solid ${PALETTE.line}` }}
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs" style={{ color: "#5C7E92" }}>
          {t.dispatch.sortLabel}
          <select
            value={sortBy}
            onChange={(e) =>
              onChange({ ...state, sortBy: e.target.value as QuoteSortBy })
            }
            className="rounded-xl px-3 py-2 text-sm min-w-[160px]"
            style={{
              border: `1px solid ${PALETTE.line}`,
              color: PALETTE.navy,
              background: PALETTE.bg,
            }}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs" style={{ color: "#5C7E92" }}>
          {t.dispatch.minRatingLabel}
          <select
            value={filters.minRating}
            onChange={(e) =>
              onChange({
                ...state,
                filters: {
                  ...filters,
                  minRating: Number(e.target.value) as MinRatingFilter,
                },
              })
            }
            className="rounded-xl px-3 py-2 text-sm min-w-[120px]"
            style={{
              border: `1px solid ${PALETTE.line}`,
              color: PALETTE.navy,
              background: PALETTE.bg,
            }}
          >
            {ratingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs" style={{ color: "#5C7E92" }}>
          {t.dispatch.maxPriceLabel}
          <select
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onChange({
                ...state,
                filters: {
                  ...filters,
                  maxPrice: e.target.value ? Number(e.target.value) : null,
                },
              })
            }
            className="rounded-xl px-3 py-2 text-sm min-w-[120px]"
            style={{
              border: `1px solid ${PALETTE.line}`,
              color: PALETTE.navy,
              background: PALETTE.bg,
            }}
          >
            <option value="">{t.dispatch.priceAny}</option>
            {MAX_PRICE_BUCKETS.map((bucket) => (
              <option key={bucket} value={bucket}>
                €{bucket}
              </option>
            ))}
          </select>
        </label>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs"
              style={{
                background: PALETTE.azureSoft,
                color: PALETTE.navy,
                fontWeight: 500,
              }}
            >
              {chip.label}
              <X size={12} />
            </button>
          ))}
          <button
            type="button"
            onClick={onClear}
            className="text-xs underline"
            style={{ color: PALETTE.azure }}
          >
            {t.dispatch.clearFilters}
          </button>
        </div>
      )}
    </div>
  );
}
