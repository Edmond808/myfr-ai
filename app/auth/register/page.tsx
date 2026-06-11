"use client";

import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useLocale } from "@/lib/i18n/LocaleProvider";

function RegisterContent() {
  const { t } = useLocale();
  return (
    <AuthLayout title={t.auth.registerTitle} subtitle={t.auth.registerSubtitle}>
      <RegisterForm />
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
