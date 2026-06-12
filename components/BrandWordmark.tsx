import { BRAND } from "@/lib/constants";

/** Official French tricolor — distinct from Mediterranean app chrome */
export const TRICOLOR = {
  blue: "#002395",
  white: "#FFFFFF",
  red: "#ED2939",
} as const;

type BrandWordmarkSize = "sm" | "md" | "lg";

const SIZE_STYLES: Record<
  BrandWordmarkSize,
  { fontSize: number; frStroke: number }
> = {
  sm: { fontSize: 26, frStroke: 1.25 },
  md: { fontSize: 32, frStroke: 1.5 },
  lg: { fontSize: 42, frStroke: 2 },
};

interface BrandWordmarkProps {
  size?: BrandWordmarkSize;
  className?: string;
  animate?: boolean;
}

export function BrandWordmark({
  size = "md",
  className = "",
  animate = false,
}: BrandWordmarkProps) {
  const { fontSize, frStroke } = SIZE_STYLES[size];

  return (
    <span
      className={`brand-wordmark ${animate ? "brand-wordmark-animated" : ""} ${className}`.trim()}
      style={{
        fontFamily: "var(--font-fraunces), serif",
        fontSize,
        fontWeight: 600,
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
      aria-label={BRAND}
    >
      <span className="brand-segment brand-my">my</span>
      <span
        className="brand-segment brand-fr"
        style={{ WebkitTextStroke: `${frStroke}px ${TRICOLOR.blue}` }}
      >
        fr
      </span>
      <span className="brand-segment brand-ai">.ai</span>
    </span>
  );
}
