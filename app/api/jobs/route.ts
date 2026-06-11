import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/classify";
import type { JobClassification } from "@/lib/types";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { rawRequest, classification } = (await request.json()) as {
      rawRequest: string;
      classification: JobClassification;
    };

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        customer_id: user.id,
        raw_request: rawRequest,
        category: classification.category,
        title: classification.title,
        summary: classification.summary,
        location: classification.location,
        urgency: classification.urgency,
        budget_estimate_eur: classification.budget_estimate_eur,
        clarifying_question: classification.clarifying_question,
        status: "classified",
      })
      .select("id")
      .single();

    if (jobError || !job) {
      throw new Error(jobError?.message ?? "Failed to create job");
    }

    const { data: dispatched, error: dispatchError } = await supabase.rpc(
      "dispatch_job",
      { p_job_id: job.id },
    );

    if (dispatchError) {
      throw new Error(dispatchError.message);
    }

    return NextResponse.json({
      jobId: job.id,
      dispatched: dispatched ?? 0,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Dispatch failed" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ quotes: [] });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const jobId = new URL(request.url).searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  const { data: quotes, error } = await supabase
    .from("quotes")
    .select(
      `
      id,
      price_eur,
      message,
      status,
      merchant:merchants (
        id,
        business_name,
        rating,
        jobs_completed
      )
    `,
    )
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ quotes: quotes ?? [] });
}
