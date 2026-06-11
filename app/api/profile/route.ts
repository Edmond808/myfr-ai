import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ profile: null });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, preferred_language, default_location")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ profile, user: { id: user.id, email: user.email } });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    full_name?: string;
    preferred_language?: string;
    default_location?: string;
  };

  const { data, error } = await supabase
    .from("profiles")
    .update(body)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
