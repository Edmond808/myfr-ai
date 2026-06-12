"use client";

import { AccountLayout } from "./AccountLayout";
import { CustomerRequestsList } from "./CustomerRequestsList";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CustomerJobListItem } from "@/lib/types";

export function CustomerRequestsView({
  jobs,
  loadError,
}: {
  jobs: CustomerJobListItem[];
  loadError?: string;
}) {
  const { t } = useLocale();

  return (
    <AccountLayout title={t.requests.title} subtitle={t.requests.subtitle}>
      {loadError && (
        <p className="mb-4 text-sm rounded-xl px-4 py-3" style={{ background: "#FEE2E2", color: "#991B1B" }}>
          {t.requests.loadError}
        </p>
      )}
      <CustomerRequestsList jobs={jobs} />
    </AccountLayout>
  );
}
