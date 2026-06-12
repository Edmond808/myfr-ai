import type { QuoteFilterState } from "./quote-filters";
import type { JobClassification } from "./types";

export async function classifyRequestClient(
  text: string,
  location: string,
): Promise<JobClassification> {
  const response = await fetch("/api/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, location }),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Classification failed");
  }

  return response.json() as Promise<JobClassification>;
}

export async function dispatchJobClient(payload: {
  rawRequest: string;
  classification: JobClassification;
}): Promise<{ jobId: string; dispatched: number }> {
  const response = await fetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Dispatch failed");
  }

  return response.json() as Promise<{ jobId: string; dispatched: number }>;
}

export async function logQuoteFiltersClient(payload: {
  jobId?: string | null;
  sessionId: string;
  sortBy: QuoteFilterState["sortBy"];
  filters: QuoteFilterState["filters"];
}): Promise<void> {
  await fetch("/api/analytics/quote-filters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function acceptQuoteClient(payload: {
  jobId: string;
  quoteId: string;
}): Promise<void> {
  const response = await fetch("/api/jobs", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Accept quote failed");
  }
}
