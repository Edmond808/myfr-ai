import { redirect } from "next/navigation";
import { MerchantDashboard } from "@/components/pro/MerchantDashboard";
import { ProAuthGate } from "@/components/pro/ProAuthGate";
import { isSupabaseConfigured } from "@/lib/classify";
import { createClient } from "@/lib/supabase/server";
import type { MerchantJobFeedItem, MerchantRecord } from "@/lib/types";

export default async function ProDashboardPage() {
  if (!isSupabaseConfigured()) {
    redirect("/pro");
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
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!merchant) {
    redirect("/pro");
  }

  const { data: jobs } = await supabase
    .from("merchant_job_feed")
    .select("*")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: false });

  return (
    <MerchantDashboard
      merchant={merchant as MerchantRecord}
      initialJobs={(jobs ?? []) as MerchantJobFeedItem[]}
    />
  );
}
