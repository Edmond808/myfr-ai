"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { MerchantJobFeedItem, MerchantRecord } from "@/lib/types";
import { ProLayout } from "./ProLayout";

function statusLabel(status: MerchantRecord["status"], t: ReturnType<typeof useLocale>["t"]) {
  switch (status) {
    case "verified":
      return t.pro.statusVerified;
    case "suspended":
      return t.pro.statusSuspended;
    case "under_review":
      return t.pro.statusUnderReview;
    default:
      return t.pro.statusApplied;
  }
}

function statusColor(status: MerchantRecord["status"]) {
  switch (status) {
    case "verified":
      return { bg: "#E8F5E9", color: "#1F7A4D" };
    case "suspended":
      return { bg: "#FBE9E7", color: "#8C3A2B" };
    default:
      return { bg: PALETTE.amberSoft, color: PALETTE.navy };
  }
}

function JobCard({
  job,
  onQuoteSubmitted,
}: {
  job: MerchantJobFeedItem;
  onQuoteSubmitted: () => void;
}) {
  const { t } = useLocale();
  const Icon = CATEGORY_ICONS[job.category];
  const [price, setPrice] = useState(
    job.budget_estimate_eur ? String(job.budget_estimate_eur) : "",
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(job.quote_status === "submitted");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/merchants/quotes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quote_id: job.quote_id,
        price_eur: Number(price),
        message,
      }),
    });

    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      setError(data.error ?? t.pro.quoteError);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
    onQuoteSubmitted();
  };

  return (
    <article
      className="rounded-2xl p-5"
      style={{ background: PALETTE.white, border: `1px solid ${PALETTE.line}` }}
    >
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-xl shrink-0"
          style={{ background: PALETTE.azureSoft, color: PALETTE.azure }}
        >
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="font-semibold"
              style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 20 }}
            >
              {job.title}
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: submitted ? "#E8F5E9" : PALETTE.amberSoft,
                color: submitted ? "#1F7A4D" : PALETTE.navy,
              }}
            >
              {submitted ? t.pro.submittedQuote : t.pro.pendingQuote}
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: "#3D6075" }}>
            {job.summary}
          </p>
          <div className="flex flex-wrap gap-3 mt-2 text-sm" style={{ color: "#5C7E92" }}>
            <span>{job.location}</span>
            <span>{t.urgency[job.urgency]}</span>
            {job.budget_estimate_eur != null && (
              <span>
                {t.pro.jobBudget}: €{job.budget_estimate_eur}
              </span>
            )}
            {job.expires_at && (
              <span>
                {t.pro.expiresAt}: {new Date(job.expires_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {!submitted && job.quote_status === "pending" && (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 space-y-3" style={{ borderTop: `1px solid ${PALETTE.line}` }}>
          <p className="text-sm font-medium">{t.pro.quoteForm}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={`quote-price-${job.quote_id}`} className="block text-sm mb-1">{t.pro.priceEur}</label>
              <input
                id={`quote-price-${job.quote_id}`}
                type="number"
                required
                min={1}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 border outline-none"
                style={{ borderColor: PALETTE.line, color: PALETTE.navy }}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={`quote-message-${job.quote_id}`} className="block text-sm mb-1">{t.pro.message}</label>
              <textarea
                id={`quote-message-${job.quote_id}`}
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 border outline-none resize-y"
                style={{ borderColor: PALETTE.line, color: PALETTE.navy }}
              />
            </div>
          </div>
          {error && (
            <p
              className="text-sm px-4 py-3 rounded-xl"
              style={{ background: "#FBE9E7", color: "#8C3A2B" }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold"
            style={{ background: PALETTE.azure, color: PALETTE.white }}
          >
            {t.pro.submitQuote}
          </button>
        </form>
      )}
    </article>
  );
}

export function MerchantDashboard({
  merchant,
  initialJobs,
}: {
  merchant: MerchantRecord;
  initialJobs: MerchantJobFeedItem[];
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const badge = statusColor(merchant.status);

  const refreshFeed = async () => {
    const res = await fetch("/api/merchants/feed");
    if (res.ok) {
      const data = (await res.json()) as { jobs: MerchantJobFeedItem[] };
      setJobs(data.jobs);
    }
    router.refresh();
  };

  return (
    <ProLayout title={t.pro.dashboardTitle} subtitle={t.pro.dashboardSubtitle}>
      <div
        className="rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3"
        style={{ background: PALETTE.white, border: `1px solid ${PALETTE.line}` }}
      >
        <div>
          <p className="font-semibold">{merchant.business_name}</p>
          <p className="text-sm" style={{ color: "#5C7E92" }}>
            {merchant.email}
          </p>
        </div>
        <span
          className="text-sm px-3 py-1 rounded-full font-medium"
          style={{ background: badge.bg, color: badge.color }}
        >
          {statusLabel(merchant.status, t)}
        </span>
      </div>

      {merchant.status !== "verified" && (
        <p
          className="text-sm px-4 py-3 rounded-xl mb-6"
          style={{ background: PALETTE.amberSoft, color: PALETTE.navy }}
        >
          {t.pro.pendingVerification}
        </p>
      )}

      <p className="text-xs mb-4" style={{ color: "#5C7E92" }}>
        {t.pro.notificationsTodo}
      </p>

      {jobs.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: PALETTE.white, border: `1px solid ${PALETTE.line}` }}
        >
          <p className="font-medium">{t.pro.noJobs}</p>
          <p className="text-sm mt-2" style={{ color: "#5C7E92" }}>
            {t.pro.noJobsHint}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.quote_id} job={job} onQuoteSubmitted={refreshFeed} />
          ))}
        </div>
      )}

      <Link
        href="/"
        className="inline-block mt-8 text-sm underline"
        style={{ color: PALETTE.azure }}
      >
        {t.pro.backToHome}
      </Link>
    </ProLayout>
  );
}
