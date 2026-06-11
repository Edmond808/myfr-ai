import { BRAND, PALETTE } from "../lib/constants";

export function Header({ onReset }: { onReset: () => void }) {
  return (
    <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
      <button
        onClick={onReset}
        className="flex items-center gap-2"
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 99,
            background: PALETTE.amber,
            display: "inline-block",
          }}
        />
        {BRAND}
      </button>
      <span
        className="text-sm"
        style={{ color: PALETTE.azure, fontWeight: 500 }}
      >
        French Riviera · prototype
      </span>
    </header>
  );
}
