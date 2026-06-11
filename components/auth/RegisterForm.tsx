"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LOCATIONS, PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/types";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function RegisterForm() {
  const { t, locale, setLocale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<Locale>(locale);
  const [defaultLocation, setDefaultLocation] = useState("Cannes");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (signUpError) {
      setError(t.auth.registerError);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        preferred_language: preferredLanguage,
        default_location: defaultLocation,
      });
      setLocale(preferredLanguage);
    }

    if (data.session) {
      router.push(next);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: PALETTE.white, border: `1px solid ${PALETTE.line}` }}>
        <p style={{ color: "#1F7A4D", fontWeight: 600 }}>{t.auth.registerSuccess}</p>
        <Link href={`/auth/login?next=${encodeURIComponent(next)}`} className="mt-4 inline-block underline" style={{ color: PALETTE.azure }}>
          {t.auth.login}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium">{t.auth.fullName}</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 border outline-none"
          style={{ borderColor: PALETTE.line, color: PALETTE.navy }}
        />
      </div>

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
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 border outline-none"
          style={{ borderColor: PALETTE.line, color: PALETTE.navy }}
        />
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium">{t.auth.confirmPassword}</label>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 border outline-none"
          style={{ borderColor: PALETTE.line, color: PALETTE.navy }}
        />
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium">{t.auth.language}</label>
        <select
          value={preferredLanguage}
          onChange={(e) => setPreferredLanguage(e.target.value as Locale)}
          className="w-full rounded-xl px-4 py-2.5 border outline-none"
          style={{ borderColor: PALETTE.line, color: PALETTE.navy }}
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium">{t.auth.defaultLocation}</label>
        <select
          value={defaultLocation}
          onChange={(e) => setDefaultLocation(e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 border outline-none"
          style={{ borderColor: PALETTE.line, color: PALETTE.navy }}
        >
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
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
        {t.auth.register}
      </button>

      <p className="text-sm text-center" style={{ color: "#5C7E92" }}>
        {t.auth.hasAccount}{" "}
        <Link href={`/auth/login?next=${encodeURIComponent(next)}`} style={{ color: PALETTE.azure, fontWeight: 600 }}>
          {t.auth.login}
        </Link>
      </p>
    </form>
  );
}
