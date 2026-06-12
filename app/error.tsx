"use client";

import { useEffect } from "react";
import { PALETTE } from "@/lib/constants";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: PALETTE.bg, color: PALETTE.navy }}
    >
      <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm mb-6" style={{ color: "#5C7E92", maxWidth: "28rem" }}>
        The page hit an unexpected error. Try again, or refresh if the problem continues.
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-6 py-3 rounded-xl font-semibold"
        style={{ background: PALETTE.azure, color: PALETTE.white }}
      >
        Try again
      </button>
    </main>
  );
}
