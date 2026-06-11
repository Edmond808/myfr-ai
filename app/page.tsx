import { Suspense } from "react";
import { RivlyApp } from "@/components/RivlyApp";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <RivlyApp />
    </Suspense>
  );
}
