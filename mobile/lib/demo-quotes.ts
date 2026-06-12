import { BASE_PRICE, DEMO_MERCHANTS } from "./constants";
import type { JobClassification, Quote } from "./types";

/** Simulates staggered demo quotes (anonymous / no Supabase). */
export function buildDemoQuotes(classification: JobClassification): {
  merchants: Quote[];
  scheduleUpdates: (onUpdate: (quotes: Quote[]) => void) => () => void;
} {
  const base = classification.budget_estimate_eur || BASE_PRICE[classification.category];
  const merchants = DEMO_MERCHANTS[classification.category].map((m) => ({
    merchant: m,
    price: 0,
  }));

  const scheduleUpdates = (onUpdate: (quotes: Quote[]) => void) => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    merchants.forEach((_, idx) => {
      const delay = 1200 + idx * 900;
      const variance = 0.88 + (idx % 5) * 0.04;
      const timer = setTimeout(() => {
        onUpdate(
          merchants.map((q, i) =>
            i === idx ? { ...q, price: Math.round(base * variance) } : q,
          ),
        );
      }, delay);
      timers.push(timer);
    });
    return () => timers.forEach(clearTimeout);
  };

  return { merchants, scheduleUpdates };
}
