import { redirect } from "next/navigation";
import { ProAuthGate } from "@/components/pro/ProAuthGate";
import { ProSignupPage } from "@/components/pro/ProSignupPage";
import { ProLayout } from "@/components/pro/ProLayout";
import { isSupabaseConfigured } from "@/lib/classify";
import { PALETTE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export default async function ProPage() {
  if (!isSupabaseConfigured()) {
    return (
      <ProLayout
        title="Join as a Riviera pro"
        subtitle="Configure Supabase env vars to enable merchant signup."
      >
        <p
          className="text-sm px-4 py-3 rounded-xl"
          style={{ background: PALETTE.amberSoft, color: PALETTE.navy }}
        >
          Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
        </p>
      </ProLayout>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <ProAuthGate />;
  }

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (merchant) {
    redirect("/pro/dashboard");
  }

  return <ProSignupPage />;
}
