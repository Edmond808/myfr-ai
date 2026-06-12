import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { BrandWordmark } from "@/components/BrandWordmark";
import { Screen } from "@/components/Screen";
import { useApp } from "@/context/AppContext";
import { LOCATIONS, PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n";
import type { Category } from "@/lib/types";

export default function HomeScreen() {
  const { t } = useLocale();
  const router = useRouter();
  const { submitRequest, loading, error } = useApp();
  const [text, setText] = useState("");
  const [location, setLocation] = useState<string>(LOCATIONS[0]);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % t.examples.length);
    }, 3200);
    return () => clearInterval(id);
  }, [t.examples.length]);

  const handleSubmit = async () => {
    if (!text.trim() || loading) return;
    try {
      await submitRequest(text.trim(), location);
      router.push("/dispatch");
    } catch {
      /* error surfaced via context */
    }
  };

  const handleCategory = (category: Category) => {
    setText(t.categoryExamples[category]);
  };

  return (
    <Screen>
      <BrandWordmark size="md" />
      <Text style={styles.title}>
        {t.home.title1}
        {"\n"}
        <Text style={styles.accent}>{t.home.title2}</Text>
      </Text>
      <Text style={styles.subtitle}>{t.home.subtitle}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t.home.requestLabel}</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t.examples[placeholderIdx]}
          placeholderTextColor="#8AA8B8"
          multiline
          numberOfLines={4}
          style={styles.input}
          accessibilityLabel={t.home.requestLabel}
        />

        <Text style={styles.label}>{t.auth.defaultLocation}</Text>
        <View style={styles.locationRow}>
          {LOCATIONS.map((city) => (
            <Pressable
              key={city}
              onPress={() => setLocation(city)}
              style={[
                styles.chip,
                location === city && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  location === city && styles.chipTextActive,
                ]}
              >
                {city}
              </Text>
            </Pressable>
          ))}
        </View>

        {error && (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {t.home.dispatchError}
          </Text>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={!text.trim() || loading}
          style={[styles.button, (!text.trim() || loading) && styles.buttonDisabled]}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color={PALETTE.white} />
          ) : (
            <Text style={styles.buttonText}>{t.home.sendRequest}</Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.howItWorks}>{t.home.howItWorks}</Text>

      <View style={styles.categories}>
        {(Object.keys(t.categories) as Category[]).map((cat) => (
          <Pressable
            key={cat}
            onPress={() => handleCategory(cat)}
            style={styles.categoryChip}
          >
            <Text style={styles.categoryText}>{t.categories[cat]}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: "700",
    color: PALETTE.navy,
    lineHeight: 34,
  },
  accent: { color: PALETTE.azure },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: "#2a5068",
  },
  card: {
    marginTop: 24,
    backgroundColor: PALETTE.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PALETTE.line,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: PALETTE.navy,
    marginBottom: 8,
  },
  input: {
    minHeight: 100,
    borderRadius: 12,
    padding: 12,
    backgroundColor: PALETTE.azureSoft,
    color: PALETTE.navy,
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: PALETTE.azureSoft,
  },
  chipActive: {
    backgroundColor: PALETTE.azure,
  },
  chipText: {
    color: PALETTE.navy,
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextActive: { color: PALETTE.white },
  button: {
    backgroundColor: PALETTE.amber,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: PALETTE.white,
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    color: "#B42318",
    marginBottom: 12,
    fontSize: 14,
  },
  howItWorks: {
    marginTop: 20,
    fontSize: 14,
    color: "#4a7088",
    lineHeight: 20,
  },
  categories: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: PALETTE.white,
    borderWidth: 1,
    borderColor: PALETTE.line,
  },
  categoryText: {
    fontSize: 12,
    color: PALETTE.navy,
  },
});
