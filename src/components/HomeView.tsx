import { ChevronRight, MapPin } from "lucide-react";
import {
  CATEGORY_EXAMPLES,
  CATEGORY_META,
  EXAMPLES,
  LOCATIONS,
  PALETTE,
} from "../lib/constants";
import type { Category } from "../lib/types";

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
  return (
    <main className="max-w-3xl mx-auto px-6 pt-10 pb-20">
      <h1
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "clamp(34px, 6vw, 56px)",
          lineHeight: 1.08,
          fontWeight: 500,
        }}
      >
        What do you need
        <br />
        on the Côte d'Azur?
      </h1>
      <p className="mt-4 text-lg" style={{ color: "#3D6075", maxWidth: 520 }}>
        Describe it in your own words. Our AI sends it to verified local
        professionals — you only pay when the job is done.
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
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <MapPin size={16} style={{ color: PALETTE.azure }} />
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
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
          <button
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
            {loading ? "Dispatching…" : "Send request"}
            {!loading && <ChevronRight size={18} />}
          </button>
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
        {(Object.entries(CATEGORY_META) as [Category, (typeof CATEGORY_META)[Category]][]).map(
          ([key, meta]) => {
            const Icon = meta.icon;
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
                  {meta.label}
                </span>
              </button>
            );
          },
        )}
      </div>

      <p className="mt-10 text-sm" style={{ color: "#5C7E92" }}>
        How it works: you describe → AI matches verified pros → you compare
        quotes → pay securely, money released on completion.
      </p>
      <p className="mt-2 text-xs" style={{ color: "#8AA8B8" }}>
        Tip: click a category to pre-fill an example, or press ⌘+Enter to send.
      </p>
    </main>
  );
}

// Re-export for type usage in parent
export { EXAMPLES, CATEGORY_EXAMPLES };
