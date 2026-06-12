"use client";

import { useEffect, useState } from "react";
import { BRAND, BRAND_TAGLINE, PALETTE } from "@/lib/constants";

const SPLASH_HOLD_MS = 1200;
const SPLASH_FADE_MS = 450;
const STRIPE_ENTER_MS = 500;

interface LoadingSplashProps {
  onComplete: () => void;
}

export function LoadingSplash({ onComplete }: LoadingSplashProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const enterMs = mq.matches ? 0 : STRIPE_ENTER_MS;
    const holdMs = mq.matches ? 600 : SPLASH_HOLD_MS;

    const holdTimer = window.setTimeout(() => setPhase("hold"), enterMs);
    const exitTimer = window.setTimeout(() => setPhase("exit"), enterMs + holdMs);
    const doneTimer = window.setTimeout(onComplete, enterMs + holdMs + SPLASH_FADE_MS);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className="splash-overlay"
      data-phase={phase}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      aria-hidden={phase === "exit"}
      role="presentation"
    >
      <div className="splash-flag" aria-hidden>
        <div className="splash-stripe splash-stripe-blue" />
        <div className="splash-stripe splash-stripe-white" />
        <div className="splash-stripe splash-stripe-red" />
      </div>
      <div className="splash-brand">
        <p
          className="splash-wordmark"
          style={{ fontFamily: "var(--font-fraunces), serif", color: PALETTE.navy }}
        >
          {BRAND}
        </p>
        <p className="splash-tagline" style={{ color: PALETTE.azure }}>
          {BRAND_TAGLINE}
        </p>
      </div>
    </div>
  );
}
