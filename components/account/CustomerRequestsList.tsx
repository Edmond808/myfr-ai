"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CustomerJobListItem, JobStatus } from "@/lib/types";

function statusLabel(status: JobStatus, t: ReturnType<typeof useLocale>["t"]) {
  const map: Record<JobStatus, string> = {
    submitted: t.requests.statusSubmitted,
    classified: t.requests.statusClassified,
    dispatched: t.requests.statusDispatched,
    quoted: t.requests.statusQuoted,
    accepted: t.requests.statusAccepted,
    in_progress: t.requests.statusInProgress,
    completed: t.requests.statusCompleted,
    disputed: t.requests.statusDisputed,
    cancelled: t.requests.statusCancelled,
  };
  return map[status] ?? status;
}

function statusColor(status: JobStatus) {
  switch (status) {
    case "accepted":
    case "in_progress":
    case "completed":
      return { bg: "#E8F5E9", color: "#1F7A4D" };
    case "quoted":
    case "dispatched":
      return { bg: PALETTE.amberSoft, color: PALETTE.navy };
    case "cancelled":
    case "disputed":
      return { bg: "#FBE9E7", color: "#8C3A2B" };
    default:
      return { bg: "rgba(43,134,188,0.12)", color: PALETTE.azure };
  }
}

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function canViewQuotes(status: JobStatus) {
  return ["dispatched", "quoted", "accepted", "in_progress", "completed"].includes(
    status,
  );
}

function JobRow({ job }: { job: CustomerJobListItem }) {
  const { t, locale } = useLocale();
  const Icon = CATEGORY_ICONS[job.category];
  const badge = statusColor(job.status);
  const quotesLabel =
    job.quotes_submitted > 0
      ? t.requests.quotesCount.replace("{count}", String(job.quotes_submitted))
      : t.requests.quotesWaiting;

  const content = (
    <div className="glass-rivly lift-hover rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(43,134,188,0.12)", color: PALETTE.azure }}
          >
            <Icon size={20} />
          </span>
          <div className="min-w-0">
            <h2
              className="font-semibold truncate"
              style={{ color: PALETTE.navy, fontFamily: "var(--font-inter)" }}
            >
              {job.title}
            </h2>
            <p
              className="text-sm flex items-center gap-1 mt-1"
              style={{ color: "#3D6075" }}
            >
              <MapPin size={14} className="shrink-0" />
              {job.location}
            </p>
          </div>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
          style={{ background: badge.bg, color: badge.color }}
        >
          {statusLabel(job.status, t)}
        </span>
      </div>

      <div
        className="flex items-center justify-between gap-3 text-sm flex-wrap"
        style={{ color: "#5C7E92" }}
      >
        <span>
          {t.requests.created} · {formatDate(job.created_at, locale)}
        </span>
        <span style={{ color: PALETTE.azure, fontWeight: 500 }}>{quotesLabel}</span>
      </div>

      {canViewQuotes(job.status) && (
        <span
          className="text-sm font-semibold"
          style={{ color: PALETTE.azure }}
        >
          {t.requests.viewQuotes} →
        </span>
      )}
    </div>
  );

  if (canViewQuotes(job.status)) {
    return (
      <Link href={`/?job=${job.id}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export function CustomerRequestsList({ jobs }: { jobs: CustomerJobListItem[] }) {
  const { t } = useLocale();

  if (jobs.length === 0) {
    return (
      <div className="glass-rivly rounded-2xl p-8 text-center space-y-3">
        <p style={{ color: PALETTE.navy, fontWeight: 600 }}>{t.requests.empty}</p>
        <p className="text-sm" style={{ color: "#3D6075" }}>
          {t.requests.emptyHint}
        </p>
        <Link
          href="/"
          className="inline-block mt-2 px-5 py-2.5 rounded-xl font-semibold"
          style={{ background: PALETTE.navy, color: PALETTE.white }}
        >
          {t.requests.newRequest}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobRow key={job.id} job={job} />
      ))}
    </div>
  );
}
