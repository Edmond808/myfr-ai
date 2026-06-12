import type { QuoteFilterState } from "./quote-filters";
import type { JobClassification } from "./types";

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

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
    throw new ApiClientError(err.error ?? "Classification failed", response.status);
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
    throw new ApiClientError(err.error ?? "Dispatch failed", response.status);
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
    throw new ApiClientError(err.error ?? "Accept quote failed", response.status);
  }
}
