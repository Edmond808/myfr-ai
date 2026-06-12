"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BadgeCheck, Check, Clock, MapPin, Sparkles } from "lucide-react";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { BRAND, COMMISSION, PALETTE } from "@/lib/constants";
import { logQuoteFiltersClient } from "@/lib/api-client";
import { payPrice } from "@/lib/loyalty";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  applyQuoteFilters,
  DEFAULT_QUOTE_FILTERS,
  type QuoteFilterState,
} from "@/lib/quote-filters";
import { getOrCreateSessionId } from "@/lib/session";
import type { JobClassification, LoyaltyTier, Quote } from "@/lib/types";
import { LoyaltyBadge } from "./LoyaltyBadge";
import { LoyaltyProgressTease, QuoteLoyaltyPrice } from "./QuoteLoyaltyPrice";
import { QuoteFilterBar } from "./QuoteFilterBar";
import { Stars } from "./Stars";

interface DispatchViewProps {
  job: JobClassification;
  jobId?: string | null;
  quotes: Quote[];
  accepted: Quote | null;
  merchantCount: number;
  onReset: () => void;
  onAccept: (quote: Quote) => void;
  acceptingQuoteId?: string | null;
  showAuthBanner?: boolean;
  onAuthRegister?: () => void;
  onAuthSignIn?: () => void;
  loyaltyTier?: LoyaltyTier;
  isLoggedIn?: boolean;
  completedBookings?: number;
}

export function DispatchView({
  job,
  jobId,
  quotes,
  accepted,
  merchantCount,
  onReset,
  onAccept,
  acceptingQuoteId,
  showAuthBanner,
  onAuthRegister,
  onAuthSignIn,
  loyaltyTier = 1,
  isLoggedIn = false,
  completedBookings = 0,
}: DispatchViewProps) {
  const { t } = useLocale();
  const CatIcon = CATEGORY_ICONS[job.category];
  const effectiveTier = isLoggedIn ? loyaltyTier : 0;
  const acceptedPayPrice =
    accepted?.memberPrice ??
    (accepted ? payPrice(accepted.price, effectiveTier, isLoggedIn) : 0);

  const [filterState, setFilterState] = useState<QuoteFilterState>(
    DEFAULT_QUOTE_FILTERS,
  );
  const analyticsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredQuotes = useMemo(
    () => applyQuoteFilters(quotes, filterState),
    [quotes, filterState],
  );

  useEffect(() => {
    if (analyticsTimer.current) clearTimeout(analyticsTimer.current);

    analyticsTimer.current = setTimeout(() => {
      void logQuoteFiltersClient({
        jobId: jobId ?? null,
        sessionId: getOrCreateSessionId(),
        sortBy: filterState.sortBy,
        filters: filterState.filters,
      });
    }, 500);

    return () => {
      if (analyticsTimer.current) clearTimeout(analyticsTimer.current);
    };
  }, [filterState, jobId]);

  const handleAccept = (quote: Quote) => {
    const memberPrice = payPrice(quote.price, effectiveTier, isLoggedIn);
    onAccept({ ...quote, memberPrice });
  };

  const clearFilters = () => setFilterState(DEFAULT_QUOTE_FILTERS);

  return (
    <main className="max-w-3xl mx-auto px-6 pt-4 pb-20">
      <button
        type="button"
        onClick={onReset}
        className="reveal flex items-center gap-1 text-sm mb-6"
        style={{ color: PALETTE.azure, fontWeight: 500 }}
      >
        <ArrowLeft size={16} /> {t.dispatch.newRequest}
      </button>

      <div className="reveal reveal-d1 glass-rivly rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: PALETTE.azure, fontWeight: 600 }}
            >
              <CatIcon size={16} /> {t.categories[job.category]}
            </div>
            <h2
              className="mt-1"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: 28,
                fontWeight: 500,
              }}
            >
              {job.title}
            </h2>
          </div>
          <div className="text-right text-sm" style={{ color: "#3D6075" }}>
            <div className="flex items-center gap-1 justify-end">
              <MapPin size={14} /> {job.location}
            </div>
            <div className="flex items-center gap-1 justify-end mt-1">
              <Clock size={14} /> {t.urgency[job.urgency]}
            </div>
          </div>
        </div>
        <p className="mt-3" style={{ color: "#3D6075" }}>
          {job.summary}
        </p>
        {job.budget_estimate_eur && (
          <p
            className="mt-3 text-sm inline-block px-3 py-1 rounded-full"
            style={{
              background: PALETTE.amberSoft,
              color: "#7A5212",
              fontWeight: 500,
            }}
          >
            {t.dispatch.aiEstimate}: ~€{job.budget_estimate_eur}
          </p>
        )}
        {job.source === "demo" && (
          <p
            className="mt-2 text-xs inline-block px-2 py-0.5 rounded"
            style={{ background: PALETTE.azureSoft, color: PALETTE.navy }}
          >
            {t.dispatch.demoMode}
          </p>
        )}
        {job.clarifying_question && !accepted && (
          <p
            className="mt-3 text-sm px-4 py-3 rounded-xl"
            style={{ background: PALETTE.azureSoft }}
          >
            <strong>{t.dispatch.clarifyingPrefix}</strong>{" "}
            {job.clarifying_question}
          </p>
        )}
      </div>

      {!accepted && (
        <>
          <h3
            className="reveal reveal-d2 mt-8 mb-3"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            {t.dispatch.sentTo} {merchantCount} {t.dispatch.verifiedPros} ·{" "}
            {quotes.length} {t.dispatch.quotesIn}
          </h3>

          {merchantCount === 0 && (
            <p className="text-sm mb-4" style={{ color: "#5C7E92" }}>
              {t.dispatch.noMerchantsYet}
            </p>
          )}

          {isLoggedIn && (
            <LoyaltyProgressTease
              loyaltyTier={loyaltyTier}
              completedBookings={completedBookings}
            />
          )}

          {showAuthBanner && (
            <div
              className="reveal reveal-d2 mb-4 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
              style={{
                background: `linear-gradient(135deg, ${PALETTE.navy} 0%, #1a4a6e 100%)`,
                color: PALETTE.white,
              }}
            >
              <div className="flex items-start gap-3">
                <Sparkles size={20} style={{ color: PALETTE.amber, marginTop: 2 }} />
                <div>
                  <p className="text-sm font-semibold">{t.loyalty.unlockTeaser}</p>
                  <p className="text-xs mt-1 opacity-80">{t.dispatch.authBannerTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onAuthRegister}
                  className="px-4 py-2 rounded-xl text-sm"
                  style={{
                    background: PALETTE.amber,
                    color: PALETTE.navy,
                    fontWeight: 600,
                  }}
                >
                  {t.dispatch.authBannerRegister}
                </button>
                <button
                  type="button"
                  onClick={onAuthSignIn}
                  className="px-4 py-2 rounded-xl text-sm"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    color: PALETTE.white,
                    fontWeight: 600,
                  }}
                >
                  {t.dispatch.authBannerSignIn}
                </button>
              </div>
            </div>
          )}

          {quotes.length > 0 && (
            <>
              <QuoteFilterBar
                state={filterState}
                onChange={setFilterState}
                onClear={clearFilters}
              />

              {filteredQuotes.length < quotes.length && filteredQuotes.length > 0 && (
                <p className="text-xs mb-3" style={{ color: "#5C7E92" }}>
                  {t.dispatch.showingQuotes
                    .replace("{shown}", String(filteredQuotes.length))
                    .replace("{total}", String(quotes.length))}
                </p>
              )}
            </>
          )}

          {quotes.length > 0 && filteredQuotes.length === 0 && (
            <div
              className="rounded-2xl p-6 text-center text-sm mb-4"
              style={{ background: PALETTE.azureSoft, color: "#3D6075" }}
            >
              {t.dispatch.filtersEmpty}
              <button
                type="button"
                onClick={clearFilters}
                className="block mx-auto mt-3 underline"
                style={{ color: PALETTE.azure }}
              >
                {t.dispatch.clearFilters}
              </button>
            </div>
          )}

          <div className="max-h-[480px] overflow-y-auto space-y-3 pr-1">
            {filteredQuotes.map((q) => (
              <div
                key={q.id ?? q.merchant.name}
                className={`glass-rivly lift-hover rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap${q.price ? " pop-in" : ""}`}
                style={{
                  borderColor: q.merchant.isPromoted
                    ? "rgba(226, 153, 47, 0.45)"
                    : q.price
                      ? "rgba(43, 134, 188, 0.35)"
                      : undefined,
                }}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontWeight: 600 }}>{q.merchant.name}</span>
                    {q.merchant.isPromoted && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: PALETTE.amberSoft,
                          color: "#7A5212",
                          fontWeight: 600,
                        }}
                      >
                        {t.dispatch.sponsored}
                      </span>
                    )}
                    <BadgeCheck size={16} style={{ color: PALETTE.azure }} />
                  </div>
                  <div
                    className="flex items-center gap-3 mt-1 text-sm"
                    style={{ color: "#5C7E92" }}
                  >
                    <Stars rating={q.merchant.rating} />
                    <span>
                      {q.merchant.jobs} {t.dispatch.jobs}
                    </span>
                    {q.merchant.eta && <span>{q.merchant.eta}</span>}
                  </div>
                  {q.message && (
                    <p className="mt-2 text-sm" style={{ color: "#3D6075" }}>
                      {q.message}
                    </p>
                  )}
                </div>
                {q.price ? (
                  <div className="flex items-center gap-4 flex-wrap justify-end">
                    <QuoteLoyaltyPrice
                      listPrice={q.price}
                      loyaltyTier={effectiveTier}
                      isLoggedIn={isLoggedIn}
                      onSignUp={onAuthRegister}
                    />
                    <button
                      type="button"
                      onClick={() => handleAccept(q)}
                      disabled={acceptingQuoteId === q.id}
                      className="px-4 py-2 rounded-xl text-sm disabled:opacity-60 shrink-0"
                      style={{
                        background: PALETTE.navy,
                        color: PALETTE.white,
                        fontWeight: 600,
                      }}
                    >
                      {acceptingQuoteId === q.id
                        ? t.dispatch.acceptingQuote
                        : t.dispatch.acceptQuote}
                    </button>
                  </div>
                ) : (
                  <span
                    className="text-sm flex items-center gap-2"
                    style={{ color: PALETTE.azure }}
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full sonar-dot"
                      style={{ background: PALETTE.azure }}
                    />
                    {t.dispatch.quoting}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {accepted && (
        <div className="reveal glass-rivly mt-8 rounded-2xl p-6">
          <div
            className="flex items-center gap-2 flex-wrap"
            style={{ color: "#1F7A4D", fontWeight: 600 }}
          >
            <Check size={18} /> {t.dispatch.quoteAccepted}
            {loyaltyTier > 0 && isLoggedIn && (
              <LoyaltyBadge tier={loyaltyTier} size="sm" />
            )}
          </div>
          <p className="mt-2 text-sm" style={{ color: "#3D6075" }}>
            {accepted.merchant.name} {t.dispatch.confirmedFor} &quot;{job.title}
            &quot;. {t.dispatch.escrowNote}
          </p>
          {acceptedPayPrice < accepted.price && (
            <p className="mt-2 text-xs font-medium" style={{ color: "#1F7A4D" }}>
              {t.loyalty.savingsApplied} · {t.loyalty.escrowMemberNote}
            </p>
          )}
          <div
            className="mt-5 rounded-xl p-4 text-sm space-y-2"
            style={{ background: PALETTE.bg }}
          >
            {acceptedPayPrice < accepted.price && (
              <div className="flex justify-between" style={{ color: "#5C7E92" }}>
                <span>{t.loyalty.listPrice}</span>
                <span className="line-through">€{accepted.price}.00</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t.dispatch.customerPays}</span>
              <span style={{ fontWeight: 600 }}>€{acceptedPayPrice}.00</span>
            </div>
            <div className="flex justify-between" style={{ color: "#5C7E92" }}>
              <span>
                {BRAND} {t.dispatch.commission} ({Math.round(COMMISSION * 100)}%)
              </span>
              <span>€{(acceptedPayPrice * COMMISSION).toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: "#5C7E92" }}>
              <span>{t.dispatch.merchantReceives}</span>
              <span>€{(acceptedPayPrice * (1 - COMMISSION)).toFixed(2)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="mt-5 px-5 py-2.5 rounded-xl text-sm"
            style={{
              background: PALETTE.azure,
              color: PALETTE.white,
              fontWeight: 600,
            }}
          >
            {t.dispatch.submitAnother}
          </button>
        </div>
      )}
    </main>
  );
}
