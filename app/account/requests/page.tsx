import { AccountAuthGate } from "@/components/account/AccountAuthGate";
import { CustomerRequestsView } from "@/components/account/CustomerRequestsView";
import { isSupabaseConfigured } from "@/lib/classify";
import { createClient } from "@/lib/supabase/server";
import type { CustomerJobListItem } from "@/lib/types";

export default async function CustomerRequestsPage() {
  if (!isSupabaseConfigured()) {
    return <CustomerRequestsView jobs={[]} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <AccountAuthGate />;
  }

  const { data: rows } = await supabase
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

  const jobs: CustomerJobListItem[] = (rows ?? []).map((row) => {
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

  return <CustomerRequestsView jobs={jobs} />;
}
