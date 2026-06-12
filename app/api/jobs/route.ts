import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route-client";
import { isSupabaseConfigured } from "@/lib/classify";
import { CATEGORIES, URGENCIES, type JobClassification } from "@/lib/types";

const MAX_RAW_REQUEST = 2000;
const MAX_TITLE = 200;
const MAX_SUMMARY = 1000;
const MAX_LOCATION = 100;
const MAX_CLARIFYING = 500;
const JOBS_PER_HOUR = 5;

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );
  }

  const supabase = await createRouteClient(request);
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

    if (
      typeof rawRequest !== "string" ||
      rawRequest.length === 0 ||
      rawRequest.length > MAX_RAW_REQUEST
    ) {
      return NextResponse.json({ error: "Invalid request text" }, { status: 400 });
    }

    if (
      !classification ||
      !CATEGORIES.includes(classification.category) ||
      !URGENCIES.includes(classification.urgency) ||
      typeof classification.title !== "string" ||
      classification.title.length > MAX_TITLE ||
      typeof classification.summary !== "string" ||
      classification.summary.length > MAX_SUMMARY ||
      typeof classification.location !== "string" ||
      classification.location.length > MAX_LOCATION ||
      (classification.clarifying_question != null &&
        (typeof classification.clarifying_question !== "string" ||
          classification.clarifying_question.length > MAX_CLARIFYING))
    ) {
      return NextResponse.json({ error: "Invalid classification" }, { status: 400 });
    }

    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", user.id)
      .gte("created_at", since);

    if ((count ?? 0) >= JOBS_PER_HOUR) {
      return NextResponse.json({ error: "Rate limit" }, { status: 429 });
    }

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

const QUOTE_SELECT = `
  id,
  price_eur,
  message,
  status,
  merchant:merchants (
    id,
    business_name,
    rating,
    jobs_completed,
    is_promoted,
    promotion_rank,
    promotion_expires_at
  )
`;

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ quotes: [], jobs: [] });
  }

  const supabase = await createRouteClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;

  if (params.get("mine") === "1") {
    const { data: rows, error } = await supabase
      .from("jobs")
      .select(
        `
        id,
        title,
        location,
        category,
        status,
        created_at,
        quotes ( id, status )
      `,
      )
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const jobs = (rows ?? []).map((row) => {
      const quotes = (row.quotes ?? []) as { id: string; status: string }[];
      return {
        id: row.id,
        title: row.title,
        location: row.location,
        category: row.category,
        status: row.status,
        created_at: row.created_at,
        quotes_total: quotes.length,
        quotes_submitted: quotes.filter((q) => q.status === "submitted").length,
      };
    });

    return NextResponse.json({ jobs });
  }

  const jobId = params.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "jobId or mine=1 required" }, { status: 400 });
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      summary,
      location,
      category,
      urgency,
      budget_estimate_eur,
      clarifying_question,
      status,
      accepted_quote_id
    `,
    )
    .eq("id", jobId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 });
  }

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const { data: quotes, error } = await supabase
    .from("quotes")
    .select(QUOTE_SELECT)
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ job, quotes: quotes ?? [] });
}

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );
  }

  const supabase = await createRouteClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { jobId, quoteId } = (await request.json()) as {
      jobId: string;
      quoteId: string;
    };

    if (!jobId || !quoteId) {
      return NextResponse.json(
        { error: "jobId and quoteId required" },
        { status: 400 },
      );
    }

    const { error: acceptError } = await supabase.rpc("accept_quote", {
      p_job_id: jobId,
      p_quote_id: quoteId,
    });

    if (acceptError) {
      const msg = acceptError.message;
      if (msg.includes("job not acceptable") || msg.includes("quote not acceptable")) {
        return NextResponse.json({ error: msg }, { status: 400 });
      }
      throw new Error(msg);
    }

    return NextResponse.json({ ok: true, quoteId, jobId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Accept failed" },
      { status: 500 },
    );
  }
}
