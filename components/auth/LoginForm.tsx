"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { syncProfileFromAuth } from "@/lib/auth/profile-sync";

export function LoginForm() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(t.auth.loginError);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const preferred = await syncProfileFromAuth(supabase, user);
      if (preferred) {
        localStorage.setItem("rivly-locale", preferred);
      }
    }

    router.push(next);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>

      <OAuthButtons next={next} />

      <div>
        <label className="block text-sm mb-1 font-medium">{t.auth.email}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 border outline-none"
          style={{ borderColor: PALETTE.line, color: PALETTE.navy }}
        />
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium">{t.auth.password}</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 border outline-none"
          style={{ borderColor: PALETTE.line, color: PALETTE.navy }}
        />
      </div>

      {error && (
        <p className="text-sm px-4 py-3 rounded-xl" style={{ background: "#FBE9E7", color: "#8C3A2B" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold"
        style={{ background: PALETTE.azure, color: PALETTE.white }}
      >
        {t.auth.login}
      </button>

      <p className="text-sm text-center" style={{ color: "#5C7E92" }}>
        {t.auth.noAccount}{" "}
        <Link href={`/auth/register?next=${encodeURIComponent(next)}`} style={{ color: PALETTE.azure, fontWeight: 600 }}>
          {t.auth.register}
        </Link>
      </p>
    </form>
  );
}
