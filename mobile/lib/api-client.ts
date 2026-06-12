import Constants from "expo-constants";
import { getAccessToken } from "./supabase";
import type { CustomerJobListItem, JobClassification, Quote } from "./types";

function apiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const extra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (extra) return extra.replace(/\/$/, "");
  return "http://localhost:3000";
}

async function authHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = await getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function classifyRequestClient(
  text: string,
  location: string,
): Promise<JobClassification> {
  const response = await fetch(`${apiBaseUrl()}/api/classify`, {
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
  const response = await fetch(`${apiBaseUrl()}/api/jobs`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Dispatch failed");
  }

  return response.json() as Promise<{ jobId: string; dispatched: number }>;
}

export type ApiQuote = {
  id: string;
  price_eur: number | null;
  message: string | null;
  status: string;
  merchant: {
    id: string;
    business_name: string;
    rating: number;
    jobs_completed: number;
    is_promoted?: boolean;
    promotion_rank?: number;
    promotion_expires_at?: string | null;
  };
};

export function mapApiQuote(q: ApiQuote): Quote {
  const promotedActive =
    Boolean(q.merchant.is_promoted) &&
    (!q.merchant.promotion_expires_at ||
      new Date(q.merchant.promotion_expires_at) > new Date());

  return {
    id: q.id,
    price: q.price_eur ? Number(q.price_eur) : 0,
    message: q.message,
    status: q.status,
    merchant: {
      id: q.merchant.id,
      name: q.merchant.business_name,
      rating: Number(q.merchant.rating),
      jobs: q.merchant.jobs_completed,
      eta: q.status === "pending" ? "Awaiting quote" : "Quoted",
      isPromoted: promotedActive,
      promotionRank: q.merchant.promotion_rank ?? 0,
    },
  };
}

export async function fetchJobQuotes(jobId: string): Promise<{
  job: JobClassification & { status: string; accepted_quote_id: string | null };
  quotes: Quote[];
}> {
  const response = await fetch(`${apiBaseUrl()}/api/jobs?jobId=${jobId}`, {
    headers: await authHeaders(),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Failed to load quotes");
  }

  const data = (await response.json()) as { job: ApiJob; quotes: ApiQuote[] };
  return {
    job: {
      category: data.job.category,
      title: data.job.title,
      summary: data.job.summary,
      location: data.job.location,
      urgency: data.job.urgency,
      budget_estimate_eur: data.job.budget_estimate_eur,
      clarifying_question: data.job.clarifying_question,
      status: data.job.status,
      accepted_quote_id: data.job.accepted_quote_id,
    },
    quotes: data.quotes.map(mapApiQuote),
  };
}

type ApiJob = {
  category: JobClassification["category"];
  title: string;
  summary: string;
  location: string;
  urgency: JobClassification["urgency"];
  budget_estimate_eur: number | null;
  clarifying_question: string | null;
  status: string;
  accepted_quote_id: string | null;
};

export async function fetchMyJobs(): Promise<CustomerJobListItem[]> {
  const response = await fetch(`${apiBaseUrl()}/api/jobs?mine=1`, {
    headers: await authHeaders(),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Failed to load requests");
  }

  const data = (await response.json()) as { jobs: CustomerJobListItem[] };
  return data.jobs ?? [];
}

export async function acceptQuoteClient(payload: {
  jobId: string;
  quoteId: string;
}): Promise<void> {
  const response = await fetch(`${apiBaseUrl()}/api/jobs`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Accept quote failed");
  }
}
