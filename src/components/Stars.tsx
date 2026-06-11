import { Star } from "lucide-react";
import { PALETTE } from "../lib/constants";

export function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-sm"
      style={{ color: PALETTE.amber }}
    >
      <Star size={14} fill={PALETTE.amber} stroke="none" />
      <span style={{ color: PALETTE.navy, fontWeight: 600 }}>
        {rating.toFixed(1)}
      </span>
    </span>
  );
}
