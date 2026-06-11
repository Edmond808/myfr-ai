"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PALETTE } from "@/lib/constants";
import type { Locale } from "@/lib/types";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="flex items-center gap-1 rounded-full p-0.5" style={{ background: PALETTE.azureSoft }}>
      {(["en", "fr"] as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className="text-xs px-2.5 py-1 rounded-full uppercase tracking-wide"
          style={
            locale === code
              ? { background: PALETTE.navy, color: PALETTE.white, fontWeight: 600 }
              : { color: PALETTE.navy, fontWeight: 500 }
          }
          aria-label={code === "en" ? "English" : "Français"}
        >
          {code}
        </button>
      ))}
      <span className="sr-only">{t.auth.language}</span>
    </div>
  );
}
