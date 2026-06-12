import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/classify";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { quote_id, price_eur, message } = (await request.json()) as {
      quote_id: string;
      price_eur: number;
      message: string;
    };

    if (!quote_id || !price_eur || price_eur <= 0 || !message?.trim()) {
      return NextResponse.json({ error: "Invalid quote data" }, { status: 400 });
    }

    const { data: merchant } = await supabase
      .from("merchants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!merchant) {
      return NextResponse.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("id, job_id, merchant_id, status")
      .eq("id", quote_id)
      .eq("merchant_id", merchant.id)
      .maybeSingle();

    if (quoteError || !quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.status !== "pending") {
      return NextResponse.json({ error: "Quote already submitted" }, { status: 409 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("quotes")
      .update({
        price_eur,
        message: message.trim(),
        status: "submitted",
      })
      .eq("id", quote_id)
      .eq("merchant_id", merchant.id)
      .select("id, status, price_eur, message")
      .single();

    if (updateError || !updated) {
      throw new Error(updateError?.message ?? "Failed to submit quote");
    }

    await supabase
      .from("jobs")
      .update({ status: "quoted" })
      .eq("id", quote.job_id)
      .in("status", ["dispatched", "quoted"]);

    return NextResponse.json({ quote: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Quote submission failed" },
      { status: 500 },
    );
  }
}
