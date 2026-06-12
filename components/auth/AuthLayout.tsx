"use client";

import Link from "next/link";
import { AmbientBackground } from "@/components/AmbientBackground";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PALETTE } from "@/lib/constants";

export function AuthLayout({
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
    <div className="rivly-shell relative min-h-screen">
      <AmbientBackground />

      <div className="relative z-10 px-6 py-10">
        <div className="max-w-md mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-8"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: 22,
              fontWeight: 600,
              color: PALETTE.navy,
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

          <div className="glass-rivly rounded-2xl p-6 sm:p-8">
            <h1
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: 32,
                fontWeight: 500,
                color: PALETTE.navy,
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
      </div>
    </div>
  );
}
