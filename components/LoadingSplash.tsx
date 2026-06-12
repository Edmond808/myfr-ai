"use client";

import { useEffect, useState } from "react";
import { BrandWordmark } from "./BrandWordmark";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const SPLASH_HOLD_MS = 1600;
const SPLASH_FADE_MS = 450;
const LETTER_ENTER_MS = 650;

interface LoadingSplashProps {
  onComplete: () => void;
}

export function LoadingSplash({ onComplete }: LoadingSplashProps) {
  const { t } = useLocale();
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const enterMs = mq.matches ? 0 : LETTER_ENTER_MS;
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
      <div className="splash-brand">
        <BrandWordmark size="lg" animate={!reducedMotion} className="splash-wordmark-size" />
        <p className="splash-tagline" style={{ color: PALETTE.navy }}>
          {t.tagline}
        </p>
      </div>
    </div>
  );
}
