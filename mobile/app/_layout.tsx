import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { LoadingSplash } from "@/components/LoadingSplash";
import { AppProvider } from "@/context/AppContext";
import { LocaleProvider } from "@/lib/i18n";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showBrandSplash, setShowBrandSplash] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const onSplashComplete = useCallback(() => {
    setShowBrandSplash(false);
  }, []);

  return (
    <SafeAreaProvider>
      <LocaleProvider>
        <AppProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="dispatch" />
            <Stack.Screen name="auth" />
          </Stack>
          {showBrandSplash && <LoadingSplash onComplete={onSplashComplete} />}
        </AppProvider>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}
