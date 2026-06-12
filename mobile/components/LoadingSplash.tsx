import { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { BrandWordmark } from "./BrandWordmark";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n";

const HOLD_MS = 1600;
const FADE_MS = 450;

interface LoadingSplashProps {
  onComplete: () => void;
}

export function LoadingSplash({ onComplete }: LoadingSplashProps) {
  const { t } = useLocale();
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(onComplete);
    }, HOLD_MS);

    return () => clearTimeout(fadeTimer);
  }, [onComplete, opacity]);

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <BrandWordmark size="lg" />
      <Text style={styles.tagline}>{t.tagline}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: PALETTE.bg,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  tagline: {
    marginTop: 16,
    fontSize: 16,
    color: PALETTE.navy,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
