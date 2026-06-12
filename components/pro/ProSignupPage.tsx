"use client";

import Link from "next/link";
import { MerchantSignupForm } from "@/components/pro/MerchantSignupForm";
import { ProLayout } from "@/components/pro/ProLayout";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function ProSignupPage() {
  const { t } = useLocale();

  return (
    <ProLayout title={t.pro.signupTitle} subtitle={t.pro.signupSubtitle}>
      <MerchantSignupForm />
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
