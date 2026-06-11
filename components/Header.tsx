"use client";

import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PALETTE } from "@/lib/constants";

interface HeaderProps {
  onReset: () => void;
  userEmail?: string | null;
  onLogout?: () => void;
}

export function Header({ onReset, userEmail, onLogout }: HeaderProps) {
  const { t } = useLocale();

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5 max-w-5xl mx-auto flex-wrap">
      <button
        onClick={onReset}
        className="flex items-center gap-2"
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 99,
            background: PALETTE.amber,
            display: "inline-block",
          }}
        />
        {t.brand}
      </button>

      <div className="flex items-center gap-3 flex-wrap">
        <LanguageSwitcher />
        <span className="text-sm hidden sm:inline" style={{ color: PALETTE.azure, fontWeight: 500 }}>
          {t.tagline}
        </span>
        {userEmail ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: PALETTE.navy }}>
            <span className="max-w-[140px] truncate">{userEmail}</span>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="underline"
                style={{ color: PALETTE.azure }}
              >
                {t.auth.logout}
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Link href="/auth/login" style={{ color: PALETTE.azure, fontWeight: 500 }}>
              {t.auth.login}
            </Link>
            <Link
              href="/auth/register"
              className="px-3 py-1 rounded-full"
              style={{ background: PALETTE.navy, color: PALETTE.white, fontWeight: 600 }}
            >
              {t.auth.register}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
