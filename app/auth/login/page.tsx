"use client";

import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useLocale } from "@/lib/i18n/LocaleProvider";

function LoginContent() {
  const { t } = useLocale();
  return (
    <AuthLayout title={t.auth.loginTitle} subtitle={t.auth.loginSubtitle}>
      <LoginForm />
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
