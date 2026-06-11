"use client";

import { useState } from "react";
import { ChevronRight, MapPin } from "lucide-react";
import VoiceInput from "@/components/VoiceInput";
import { CATEGORY_ICONS, LOCATIONS, PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Category } from "@/lib/types";

interface HomeViewProps {
  text: string;
  location: string;
  placeholder: string;
  loading: boolean;
  error: string | null;
  onTextChange: (text: string) => void;
  onLocationChange: (location: string) => void;
  onSubmit: () => void;
  onCategoryClick: (category: Category) => void;
}

export function HomeView({
  text,
  location,
  placeholder,
  loading,
  error,
  onTextChange,
  onLocationChange,
  onSubmit,
  onCategoryClick,
}: HomeViewProps) {
  const { t, locale } = useLocale();
  const [interim, setInterim] = useState("");

  const appendTranscript = (finalText: string) => {
    onTextChange(text ? `${text} ${finalText}` : finalText);
    setInterim("");
  };

  return (
    <main className="max-w-3xl mx-auto px-6 pt-10 pb-20">
      <h1
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: "clamp(34px, 6vw, 56px)",
          lineHeight: 1.08,
          fontWeight: 500,
        }}
      >
        {t.home.title1}
        <br />
        {t.home.title2}
      </h1>
      <p className="mt-4 text-lg" style={{ color: "#3D6075", maxWidth: 520 }}>
        {t.home.subtitle}
      </p>

      <div
        className="mt-8 rounded-2xl p-2"
        style={{
          background: PALETTE.white,
          border: `1px solid ${PALETTE.line}`,
          boxShadow: "0 8px 32px rgba(16,50,74,0.08)",
        }}
      >
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full resize-none rounded-xl p-4 text-base outline-none"
          style={{ background: "transparent", color: PALETTE.navy }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit();
          }}
        />
        {interim && (
          <p
            className="px-4 pb-2 text-base italic"
            style={{ color: "#8AA8B8" }}
            aria-live="polite"
          >
            {interim}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <MapPin size={16} style={{ color: PALETTE.azure }} />
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => onLocationChange(loc)}
                className="text-sm px-3 py-1 rounded-full"
                style={
                  loc === location
                    ? {
                        background: PALETTE.navy,
                        color: PALETTE.white,
                        fontWeight: 500,
                      }
                    : { background: PALETTE.azureSoft, color: PALETTE.navy }
                }
              >
                {loc}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <VoiceInput
              language={locale}
              onTranscript={appendTranscript}
              onInterim={setInterim}
            />
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading || !text.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-base"
              style={{
                background: loading || !text.trim() ? "#9DBED1" : PALETTE.azure,
                color: PALETTE.white,
                fontWeight: 600,
                cursor: loading || !text.trim() ? "default" : "pointer",
              }}
            >
              {loading ? t.home.dispatching : t.home.sendRequest}
              {!loading && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p
          className="mt-4 text-sm px-4 py-3 rounded-xl"
          style={{ background: "#FBE9E7", color: "#8C3A2B" }}
        >
          {error}
        </p>
      )}

      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(CATEGORY_ICONS) as Category[]).map((key) => {
          const Icon = CATEGORY_ICONS[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onCategoryClick(key)}
              className="rounded-xl px-4 py-3 flex items-center gap-3 text-left transition-shadow hover:shadow-md"
              style={{
                background: PALETTE.white,
                border: `1px solid ${PALETTE.line}`,
              }}
            >
              <Icon size={18} style={{ color: PALETTE.azure }} />
              <span className="text-sm" style={{ fontWeight: 500 }}>
                {t.categories[key]}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-10 text-sm" style={{ color: "#5C7E92" }}>
        {t.home.howItWorks}
      </p>
      <p className="mt-2 text-xs" style={{ color: "#8AA8B8" }}>
        {t.home.tip}
      </p>
    </main>
  );
}
