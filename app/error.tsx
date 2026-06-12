"use client";

import { useEffect } from "react";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: PALETTE.bg, color: PALETTE.navy }}
    >
      <h1 className="text-2xl font-semibold mb-2">{t.errors.title}</h1>
      <p className="text-sm mb-6" style={{ color: "#5C7E92", maxWidth: "28rem" }}>
        {t.errors.body}
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-6 py-3 rounded-xl font-semibold"
        style={{ background: PALETTE.azure, color: PALETTE.white }}
      >
        {t.errors.retry}
      </button>
    </main>
  );
}
