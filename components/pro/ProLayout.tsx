"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PALETTE } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function ProLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const { t } = useLocale();

  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{ background: PALETTE.bg, color: PALETTE.navy }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-2"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: PALETTE.amber,
                display: "inline-block",
              }}
            />
            {t.brand}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/pro" className="text-sm font-medium" style={{ color: PALETTE.azure }}>
              {t.pro.forPros}
            </Link>
          </div>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 32,
            fontWeight: 500,
          }}
        >
          {title}
        </h1>
        <p className="mt-2 mb-6" style={{ color: "#3D6075" }}>
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  );
}
