"use client";

import { ArrowLeft, BadgeCheck, Check, Clock, MapPin } from "lucide-react";
import {
  BRAND,
  CATEGORY_ICONS,
  COMMISSION,
  PALETTE,
} from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { JobClassification, Quote } from "@/lib/types";
import { Stars } from "./Stars";

interface DispatchViewProps {
  job: JobClassification;
  quotes: Quote[];
  accepted: Quote | null;
  merchantCount: number;
  onReset: () => void;
  onAccept: (quote: Quote) => void;
}

export function DispatchView({
  job,
  quotes,
  accepted,
  merchantCount,
  onReset,
  onAccept,
}: DispatchViewProps) {
  const { t } = useLocale();
  const CatIcon = CATEGORY_ICONS[job.category];

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

          <div className="space-y-3">
            {quotes.map((q) => (
              <div
                key={q.id ?? q.merchant.name}
                className={`glass-rivly lift-hover rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap${q.price ? " pop-in" : ""}`}
                style={{
                  borderColor: q.price ? "rgba(43, 134, 188, 0.35)" : undefined,
                }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 600 }}>{q.merchant.name}</span>
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
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        fontFamily: "var(--font-fraunces), serif",
                        fontSize: 24,
                        fontWeight: 600,
                      }}
                    >
                      €{q.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAccept(q)}
                      className="px-4 py-2 rounded-xl text-sm"
                      style={{
                        background: PALETTE.navy,
                        color: PALETTE.white,
                        fontWeight: 600,
                      }}
                    >
                      {t.dispatch.acceptQuote}
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
            className="flex items-center gap-2"
            style={{ color: "#1F7A4D", fontWeight: 600 }}
          >
            <Check size={18} /> {t.dispatch.quoteAccepted}
          </div>
          <p className="mt-2 text-sm" style={{ color: "#3D6075" }}>
            {accepted.merchant.name} {t.dispatch.confirmedFor} &quot;{job.title}
            &quot;. {t.dispatch.escrowNote}
          </p>
          <div
            className="mt-5 rounded-xl p-4 text-sm space-y-2"
            style={{ background: PALETTE.bg }}
          >
            <div className="flex justify-between">
              <span>{t.dispatch.customerPays}</span>
              <span style={{ fontWeight: 600 }}>€{accepted.price}.00</span>
            </div>
            <div className="flex justify-between" style={{ color: "#5C7E92" }}>
              <span>
                {BRAND} {t.dispatch.commission} ({Math.round(COMMISSION * 100)}%)
              </span>
              <span>€{(accepted.price * COMMISSION).toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: "#5C7E92" }}>
              <span>{t.dispatch.merchantReceives}</span>
              <span>€{(accepted.price * (1 - COMMISSION)).toFixed(2)}</span>
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
