import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/classify";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ jobs: [] });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data: merchant, error: merchantError } = await supabase
    .from("merchants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (merchantError) {
    return NextResponse.json({ error: merchantError.message }, { status: 500 });
  }

  if (!merchant) {
    return NextResponse.json({ error: "Merchant profile not found" }, { status: 404 });
  }

  const { data: jobs, error } = await supabase
    .from("merchant_job_feed")
    .select("*")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ jobs: jobs ?? [] });
}
