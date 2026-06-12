import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobClassification } from "./types";

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

export const DISPATCH_SCHEMA_HINT =
  "Database schema out of date — run supabase/migrations/004_promoted_and_analytics.sql in the Supabase SQL editor.";
