"use client";

import { useEffect, useState } from "react";
import { LoadingSplash } from "./LoadingSplash";
import { RivlyApp } from "./RivlyApp";

const SPLASH_SESSION_KEY = "myfr-splash-seen";

type SplashState = "checking" | "show" | "done";

export function AppWithSplash() {
  const [splashState, setSplashState] = useState<SplashState>("checking");

  useEffect(() => {
    setSplashState(sessionStorage.getItem(SPLASH_SESSION_KEY) ? "done" : "show");
  }, []);

  const showSplash = splashState === "show";
  const showApp = splashState !== "checking";

  const handleSplashComplete = () => {
    sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
    setSplashState("done");
  };

  return (
    <>
      {showApp && <RivlyApp />}
      {showSplash && <LoadingSplash onComplete={handleSplashComplete} />}
    </>
  );
}
