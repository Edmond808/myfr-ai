import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/classify";
import type { QuoteFilterState } from "@/lib/quote-filters";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const body = (await request.json()) as {
      jobId?: string | null;
      sessionId?: string | null;
      sortBy?: QuoteFilterState["sortBy"];
      filters?: QuoteFilterState["filters"];
    };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("user_quote_preferences").insert({
      user_id: user?.id ?? null,
      session_id: body.sessionId ?? null,
      job_id: body.jobId ?? null,
      filters_json: body.filters ?? {},
      sort_by: body.sortBy ?? "recommended",
    });

    if (error) {
      if (/PGRST205|user_quote_preferences|schema cache/i.test(error.message)) {
        return NextResponse.json({ ok: true, skipped: true });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analytics failed" },
      { status: 500 },
    );
  }
}
