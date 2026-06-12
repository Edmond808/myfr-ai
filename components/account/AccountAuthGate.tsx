"use client";

import Link from "next/link";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { AccountLayout } from "./AccountLayout";

export function AccountAuthGate() {
  const { t } = useLocale();

  return (
    <AccountLayout title={t.requests.title} subtitle={t.requests.loginRequired}>
      <div className="glass-rivly rounded-2xl p-6 space-y-4">
        <OAuthButtons next="/account/requests" />

        <Link
          href="/auth/login?next=/account/requests"
          className="block w-full py-3 rounded-xl font-semibold text-center"
          style={{ background: PALETTE.azure, color: PALETTE.white }}
        >
          {t.auth.login}
        </Link>
        <Link
          href="/auth/register?next=/account/requests"
          className="block w-full py-3 rounded-xl font-semibold text-center"
          style={{ background: PALETTE.navy, color: PALETTE.white }}
        >
          {t.auth.register}
        </Link>
      </div>
    </AccountLayout>
  );
}
