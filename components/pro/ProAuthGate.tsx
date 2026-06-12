"use client";

import Link from "next/link";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ProLayout } from "./ProLayout";

export function ProAuthGate() {
  const { t } = useLocale();

  return (
    <ProLayout title={t.pro.signupTitle} subtitle={t.pro.loginRequired}>
      <div
        className="rounded-2xl p-6 text-center space-y-4"
        style={{ background: PALETTE.white, border: `1px solid ${PALETTE.line}` }}
      >
        <Link
          href="/auth/login?next=/pro"
          className="block w-full py-3 rounded-xl font-semibold"
          style={{ background: PALETTE.azure, color: PALETTE.white }}
        >
          {t.pro.signIn}
        </Link>
        <Link
          href="/auth/register?next=/pro"
          className="block w-full py-3 rounded-xl font-semibold"
          style={{ background: PALETTE.navy, color: PALETTE.white }}
        >
          {t.pro.createAccount}
        </Link>
      </div>
    </ProLayout>
  );
}
