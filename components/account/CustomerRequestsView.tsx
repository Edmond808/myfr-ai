"use client";

import { AccountLayout } from "./AccountLayout";
import { CustomerRequestsList } from "./CustomerRequestsList";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CustomerJobListItem } from "@/lib/types";

export function CustomerRequestsView({ jobs }: { jobs: CustomerJobListItem[] }) {
  const { t } = useLocale();

  return (
    <AccountLayout title={t.requests.title} subtitle={t.requests.subtitle}>
      <CustomerRequestsList jobs={jobs} />
    </AccountLayout>
  );
}
