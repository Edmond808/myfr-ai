"use client";

import { useState } from "react";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { createClient } from "@/lib/supabase/client";

type Provider = "google" | "apple";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92a8.78 8.78 0 0 0 2.68-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.29-1.71V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.94 9.54c-.03-2.05 1.67-3.03 1.74-3.08-0.95-1.39-2.43-1.58-2.95-1.6-1.26-.13-2.46.74-3.1.74-.64 0-1.63-.72-2.68-.7-1.38.02-2.65.8-3.36 2.03-1.43 2.48-.37 6.15 1.03 8.17.68.99 1.49 2.1 2.56 2.06 1.03-.04 1.42-.67 2.67-.67 1.25 0 1.6.67 2.68.65 1.11-.02 1.81-.99 2.48-1.98.78-1.14 1.1-2.25 1.12-2.31-.02-.01-2.15-.83-2.17-3.28zM12.38 2.87c.57-.69.95-1.65.84-2.61-.82.03-1.81.55-2.4 1.24-.53.61-.99 1.59-.87 2.53.92.07 1.86-.47 2.43-1.16z"
      />
    </svg>
  );
}

export function OAuthButtons({ next }: { next: string }) {
  const { t } = useLocale();
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (provider: Provider) => {
    setError(null);
    setLoading(provider);

    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (oauthError) {
      setError(t.auth.oauthError);
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => signIn("google")}
        className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-opacity disabled:opacity-60"
        style={{
          background: PALETTE.white,
          color: PALETTE.navy,
          border: `1px solid ${PALETTE.line}`,
        }}
      >
        <GoogleIcon />
        {loading === "google" ? t.auth.oauthRedirecting : t.auth.continueWithGoogle}
      </button>

      <button
        type="button"
        disabled={loading !== null}
        onClick={() => signIn("apple")}
        className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-opacity disabled:opacity-60"
        style={{
          background: PALETTE.navy,
          color: PALETTE.white,
        }}
      >
        <AppleIcon />
        {loading === "apple" ? t.auth.oauthRedirecting : t.auth.continueWithApple}
      </button>

      {error && (
        <p
          className="text-sm px-4 py-3 rounded-xl"
          style={{ background: "#FBE9E7", color: "#8C3A2B" }}
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <div className="flex-1 h-px" style={{ background: PALETTE.line }} />
        <span className="text-xs" style={{ color: "#5C7E92" }}>
          {t.auth.orEmail}
        </span>
        <div className="flex-1 h-px" style={{ background: PALETTE.line }} />
      </div>
    </div>
  );
}
