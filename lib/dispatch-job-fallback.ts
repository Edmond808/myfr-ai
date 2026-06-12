import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, JobClassification } from "./types";
import { CATEGORIES } from "./types";

export function normalizeJobCategory(category: unknown): Category {
  return CATEGORIES.includes(category as Category)
    ? (category as Category)
    : "concierge";
}

/** Server-side dispatch when `dispatch_job` RPC references missing promotion columns. */
export async function inlineDispatchJob(
  supabase: SupabaseClient,
  jobId: string,
  classification: JobClassification,
): Promise<number> {
  const { data: merchants, error: merchantError } = await supabase
    .from("merchants")
    .select("id, rating, jobs_completed, categories, service_areas")
    .eq("status", "verified");

  if (merchantError) {
    throw new Error(merchantError.message);
  }

  const matches = (merchants ?? [])
    .filter(
      (merchant) =>
        merchant.categories?.includes(classification.category) &&
        merchant.service_areas?.includes(classification.location),
    )
    .sort((a, b) => {
      const ratingDiff = Number(b.rating) - Number(a.rating);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.jobs_completed ?? 0) - (a.jobs_completed ?? 0);
    });

  if (matches.length === 0) {
    return 0;
  }

  const expiresAt = new Date(Date.now() + 4 * 3_600_000).toISOString();
  const { error: quoteError } = await supabase.from("quotes").insert(
    matches.map((merchant) => ({
      job_id: jobId,
      merchant_id: merchant.id,
      status: "pending",
      expires_at: expiresAt,
    })),
  );

  if (quoteError) {
    throw new Error(quoteError.message);
  }

  const { error: statusError } = await supabase
    .from("jobs")
    .update({ status: "dispatched" })
    .eq("id", jobId);

  if (statusError) {
    throw new Error(statusError.message);
  }

  return matches.length;
}

export function isDispatchRpcSchemaError(message: string): boolean {
  return /is_promoted|promotion_rank|promotion_expires_at/i.test(message);
}

/** RPC/RLS failures where inline dispatch or client demo fallback should run. */
export function isDispatchRecoverableError(message: string): boolean {
  return (
    isDispatchRpcSchemaError(message) ||
    /infinite recursion detected in policy/i.test(message)
  );
}

export const DISPATCH_SCHEMA_HINT =
  "Database schema out of date — run supabase/migrations/008_fix_jobs_quotes_rls_recursion.sql in the Supabase SQL editor.";

/** Insert a classified job; use service role when customer RLS blocks the row. */
export async function persistClassifiedJob(
  userClient: SupabaseClient,
  payload: {
    jobId: string;
    userId: string;
    rawRequest: string;
    classification: JobClassification;
  },
  adminClient: SupabaseClient | null,
): Promise<void> {
  const { jobId, userId, rawRequest, classification } = payload;
  const row = {
    id: jobId,
    customer_id: userId,
    raw_request: rawRequest,
    category: classification.category,
    title: classification.title,
    summary: classification.summary,
    location: classification.location,
    urgency: classification.urgency,
    budget_estimate_eur: classification.budget_estimate_eur,
    clarifying_question: classification.clarifying_question,
    status: "classified" as const,
  };

  const { error } = await userClient.from("jobs").insert(row);
  if (!error) return;

  if (!isDispatchRecoverableError(error.message)) {
    throw new Error(error.message);
  }

  if (!adminClient) {
    throw new Error(DISPATCH_SCHEMA_HINT);
  }

  const { error: adminError } = await adminClient.from("jobs").insert(row);
  if (adminError) {
    throw new Error(adminError.message);
  }
}
