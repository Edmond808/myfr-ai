import { Suspense } from "react";
import { AppWithSplash } from "@/components/AppWithSplash";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <AppWithSplash />
    </Suspense>
  );
}
