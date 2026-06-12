import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Screen } from "@/components/Screen";
import { useApp } from "@/context/AppContext";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginScreen() {
  const { t } = useLocale();
  const router = useRouter();
  const { refreshSession } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    setError(null);

    const { error: signInError } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(t.auth.loginError);
      setLoading(false);
      return;
    }

    await refreshSession();
    setLoading(false);
    router.replace("/(tabs)/account");
  };

  return (
    <Screen>
      <Text style={styles.title}>{t.auth.loginTitle}</Text>
      <Text style={styles.subtitle}>{t.auth.loginSubtitle}</Text>

      <View style={styles.field}>
        <Text style={styles.label}>{t.auth.email}</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t.auth.password}</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color={PALETTE.white} />
        ) : (
          <Text style={styles.buttonText}>{t.auth.login}</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push("/auth/register")}>
        <Text style={styles.link}>{t.auth.noAccount}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700", color: PALETTE.navy },
  subtitle: { marginTop: 8, color: "#4a7088", marginBottom: 20 },
  field: { marginBottom: 14 },
  label: { fontWeight: "600", color: PALETTE.navy, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: PALETTE.line,
    borderRadius: 12,
    padding: 12,
    backgroundColor: PALETTE.white,
    color: PALETTE.navy,
  },
  error: { color: "#B42318", marginBottom: 12 },
  button: {
    backgroundColor: PALETTE.azure,
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
