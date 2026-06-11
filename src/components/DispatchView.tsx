import { ArrowLeft, BadgeCheck, Check, Clock, MapPin } from "lucide-react";
import {
  BRAND,
  CATEGORY_META,
  COMMISSION,
  MERCHANTS,
  PALETTE,
  URGENCY_LABEL,
} from "../lib/constants";
import type { JobClassification, Quote } from "../lib/types";
import { Stars } from "./Stars";

interface DispatchViewProps {
  job: JobClassification;
  quotes: Quote[];
  accepted: Quote | null;
  onReset: () => void;
  onAccept: (quote: Quote) => void;
}

export function DispatchView({
  job,
  quotes,
  accepted,
  onReset,
  onAccept,
}: DispatchViewProps) {
  const Cat = CATEGORY_META[job.category];

  return (
    <main className="max-w-3xl mx-auto px-6 pt-4 pb-20">
      <button
        onClick={onReset}
        className="flex items-center gap-1 text-sm mb-6"
        style={{ color: PALETTE.azure, fontWeight: 500 }}
      >
        <ArrowLeft size={16} /> New request
      </button>

      <div
        className="rounded-2xl p-6"
        style={{
          background: PALETTE.white,
          border: `1px solid ${PALETTE.line}`,
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: PALETTE.azure, fontWeight: 600 }}
            >
              <Cat.icon size={16} /> {Cat.label}
            </div>
            <h2
              className="mt-1"
              style={{
                fontFamily: "'Fraunces', serif",
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
              <Clock size={14} />{" "}
              {URGENCY_LABEL[job.urgency] || job.urgency}
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
            AI market estimate: ~€{job.budget_estimate_eur}
          </p>
        )}
        {job.source === "demo" && (
          <p
            className="mt-2 text-xs inline-block px-2 py-0.5 rounded"
            style={{ background: PALETTE.azureSoft, color: PALETTE.navy }}
          >
            Demo mode — set ANTHROPIC_API_KEY for live AI dispatch
          </p>
        )}
        {job.clarifying_question && !accepted && (
          <p
            className="mt-3 text-sm px-4 py-3 rounded-xl"
            style={{ background: PALETTE.azureSoft }}
          >
            <strong>To quote precisely, pros will ask:</strong>{" "}
            {job.clarifying_question}
          </p>
        )}
      </div>

      {!accepted && (
        <>
          <h3
            className="mt-8 mb-3"
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            Sent to {MERCHANTS[job.category].length} verified pros ·{" "}
            {quotes.length} quote{quotes.length === 1 ? "" : "s"} in
          </h3>
          <div className="space-y-3">
            {MERCHANTS[job.category].map((m) => {
              const quote = quotes.find((q) => q.merchant.name === m.name);
              return (
                <div
                  key={m.name}
                  className="rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
                  style={{
                    background: PALETTE.white,
                    border: `1px solid ${quote ? PALETTE.azure : PALETTE.line}`,
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      <BadgeCheck size={16} style={{ color: PALETTE.azure }} />
                    </div>
                    <div
                      className="flex items-center gap-3 mt-1 text-sm"
                      style={{ color: "#5C7E92" }}
                    >
                      <Stars rating={m.rating} />
                      <span>{m.jobs} jobs</span>
                      <span>{m.eta}</span>
                    </div>
                  </div>
                  {quote ? (
                    <div className="flex items-center gap-3">
                      <span
                        style={{
                          fontFamily: "'Fraunces', serif",
                          fontSize: 24,
                          fontWeight: 600,
                        }}
                      >
                        €{quote.price}
                      </span>
                      <button
                        onClick={() => onAccept(quote)}
                        className="px-4 py-2 rounded-xl text-sm"
                        style={{
                          background: PALETTE.navy,
                          color: PALETTE.white,
                          fontWeight: 600,
                        }}
                      >
                        Accept quote
                      </button>
                    </div>
                  ) : (
                    <span
                      className="text-sm flex items-center gap-2"
                      style={{ color: PALETTE.azure }}
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full animate-pulse"
                        style={{ background: PALETTE.azure }}
                      />
                      Quoting…
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {accepted && (
        <div
          className="mt-8 rounded-2xl p-6"
          style={{
            background: PALETTE.white,
            border: `1px solid ${PALETTE.line}`,
          }}
        >
          <div
            className="flex items-center gap-2"
            style={{ color: "#1F7A4D", fontWeight: 600 }}
          >
            <Check size={18} /> Quote accepted — payment held in escrow
          </div>
          <p className="mt-2 text-sm" style={{ color: "#3D6075" }}>
            {accepted.merchant.name} is confirmed for "{job.title}". Funds are
            released automatically when you mark the job complete.
          </p>
          <div
            className="mt-5 rounded-xl p-4 text-sm space-y-2"
            style={{ background: PALETTE.bg }}
          >
            <div className="flex justify-between">
              <span>Customer pays</span>
              <span style={{ fontWeight: 600 }}>€{accepted.price}.00</span>
            </div>
            <div className="flex justify-between" style={{ color: "#5C7E92" }}>
              <span>
                {BRAND} commission ({Math.round(COMMISSION * 100)}%)
              </span>
              <span>€{(accepted.price * COMMISSION).toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: "#5C7E92" }}>
              <span>Merchant receives</span>
              <span>
                €{(accepted.price * (1 - COMMISSION)).toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={onReset}
            className="mt-5 px-5 py-2.5 rounded-xl text-sm"
            style={{
              background: PALETTE.azure,
              color: PALETTE.white,
              fontWeight: 600,
            }}
          >
            Submit another request
          </button>
        </div>
      )}
    </main>
  );
}
