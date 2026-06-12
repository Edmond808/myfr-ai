import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";

import { Screen } from "@/components/Screen";
import { useApp } from "@/context/AppContext";
import { LOCATIONS, PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export default function RegisterScreen() {
  const { t, locale, setLocale } = useLocale();
  const router = useRouter();
  const { refreshSession } = useApp();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [location, setLocation] = useState<string>(LOCATIONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isSupabaseConfigured()) return;
    if (password !== confirm) {
      setError(t.auth.passwordMismatch);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: signUpError } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          preferred_language: locale,
          default_location: location,
        },
      },
    });

    if (signUpError) {
      setError(t.auth.registerError);
      setLoading(false);
      return;
    }

    await refreshSession();
    setSuccess(t.auth.registerSuccess);
    setLoading(false);
    router.replace("/(tabs)/account");
  };

  return (
    <Screen>
      <Text style={styles.title}>{t.auth.registerTitle}</Text>
      <Text style={styles.subtitle}>{t.auth.registerSubtitle}</Text>

      <Text style={styles.label}>{t.auth.fullName}</Text>
      <TextInput value={fullName} onChangeText={setFullName} style={styles.input} />

      <Text style={styles.label}>{t.auth.email}</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <Text style={styles.label}>{t.auth.password}</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Text style={styles.label}>{t.auth.confirmPassword}</Text>
      <TextInput
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        style={styles.input}
      />

      <Text style={styles.label}>{t.auth.defaultLocation}</Text>
      <Text style={styles.locationValue}>{location}</Text>
      <Text style={styles.hint}>
        {LOCATIONS.join(" · ")} (default: Cannes — full picker in Phase 2)
      </Text>

      <Pressable onPress={() => setLocale(locale === "en" ? "fr" : "en")}>
        <Text style={styles.lang}>
          {t.auth.language}: {locale === "en" ? "English" : "Français"}
        </Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}
      {success && <Text style={styles.success}>{success}</Text>}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color={PALETTE.white} />
        ) : (
          <Text style={styles.buttonText}>{t.auth.register}</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push("/auth/login")}>
        <Text style={styles.link}>{t.auth.hasAccount}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700", color: PALETTE.navy },
  subtitle: { marginTop: 8, color: "#4a7088", marginBottom: 16 },
  label: { fontWeight: "600", color: PALETTE.navy, marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: PALETTE.line,
    borderRadius: 12,
    padding: 12,
    backgroundColor: PALETTE.white,
    color: PALETTE.navy,
  },
  locationValue: { fontWeight: "600", color: PALETTE.azure },
  hint: { fontSize: 12, color: "#6B8FA3", marginTop: 4 },
  lang: { marginTop: 12, color: PALETTE.azure, fontWeight: "600" },
  error: { color: "#B42318", marginTop: 12 },
  success: { color: "#027A48", marginTop: 12 },
  button: {
    marginTop: 20,
    backgroundColor: PALETTE.amber,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: PALETTE.white, fontWeight: "700" },
  link: {
    marginTop: 16,
    textAlign: "center",
    color: PALETTE.azure,
    fontWeight: "600",
  },
});
