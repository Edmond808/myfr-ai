import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/classify";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export async function POST(request: Request) {
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

  const { data: existing } = await supabase
    .from("merchants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Merchant profile already exists" }, { status: 409 });
  }

  try {
    const body = (await request.json()) as {
      business_name: string;
      siret?: string | null;
      categories: Category[];
      service_areas: string[];
      whatsapp_phone: string;
      email: string;
    };

    if (
      !body.business_name?.trim() ||
      !Array.isArray(body.categories) ||
      body.categories.length === 0 ||
      !Array.isArray(body.service_areas) ||
      body.service_areas.length === 0 ||
      !body.whatsapp_phone?.trim() ||
      !body.email?.trim()
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: merchant, error } = await supabase
      .from("merchants")
      .insert({
        owner_id: user.id,
        business_name: body.business_name.trim(),
        siret: body.siret?.trim() || null,
        categories: body.categories,
        service_areas: body.service_areas,
        whatsapp_phone: body.whatsapp_phone.trim(),
        email: body.email.trim(),
        status: "applied",
      })
      .select("id, status")
      .single();

    if (error || !merchant) {
      throw new Error(error?.message ?? "Failed to create merchant");
    }

    return NextResponse.json({ merchant });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Application failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ merchant: null });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data: merchant, error } = await supabase
    .from("merchants")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ merchant });
}
