"use client";

import { useEffect, useState } from "react";
import { LoadingSplash } from "./LoadingSplash";
import { RivlyApp } from "./RivlyApp";

const SPLASH_SESSION_KEY = "myfr-splash-seen";

export function AppWithSplash() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(SPLASH_SESSION_KEY)) {
      setShowSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
    setShowSplash(false);
  };

  return (
    <>
      <RivlyApp />
      {showSplash && <LoadingSplash onComplete={handleSplashComplete} />}
    </>
  );
}
