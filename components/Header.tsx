"use client";

import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PALETTE } from "@/lib/constants";
import { BrandWordmark } from "./BrandWordmark";

import type { LoyaltyTier } from "@/lib/types";

interface HeaderProps {
  onReset: () => void;
  userEmail?: string | null;
  userDisplayName?: string | null;
  userInitial?: string | null;
  loyaltyTier?: LoyaltyTier;
  onLogout?: () => void;
}

export function Header({
  onReset,
  userEmail,
  userDisplayName,
  userInitial,
  loyaltyTier = 0,
  onLogout,
}: HeaderProps) {
  const { t } = useLocale();

  return (
    <header className="glass-rivly-strong sticky top-0 z-40 flex items-center justify-between gap-4 px-6 py-5 max-w-5xl mx-auto flex-wrap border-b border-white/50">
      <button onClick={onReset} className="flex items-center" aria-label={t.brand}>
        <BrandWordmark size="sm" />
      </button>

      <div className="flex items-center gap-3 flex-wrap">
        <LanguageSwitcher />
        <span className="text-sm hidden sm:inline" style={{ color: PALETTE.azure, fontWeight: 500 }}>
          {t.tagline}
        </span>
        {userEmail && userDisplayName && userInitial ? (
          <UserMenu
            displayName={userDisplayName}
            initial={userInitial}
            email={userEmail}
            loyaltyTier={loyaltyTier}
            onLogout={onLogout}
          />
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Link href="/pro" style={{ color: PALETTE.azure, fontWeight: 500 }}>
              {t.pro.forPros}
            </Link>
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
