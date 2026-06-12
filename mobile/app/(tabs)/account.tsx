import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandWordmark } from "@/components/BrandWordmark";
import { Screen } from "@/components/Screen";
import { useApp } from "@/context/AppContext";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function AccountScreen() {
  const { t, locale, setLocale } = useLocale();
  const router = useRouter();
  const { user, signOut } = useApp();

  if (!isSupabaseConfigured()) {
    return (
      <Screen scroll={false}>
        <Text style={styles.title}>{t.auth.login}</Text>
        <Text style={styles.hint}>
          Add Supabase keys to mobile/.env to enable sign-in.
        </Text>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen scroll={false}>
        <BrandWordmark size="md" />
        <Text style={styles.title}>{t.auth.loginTitle}</Text>
        <Text style={styles.subtitle}>{t.auth.loginSubtitle}</Text>

        <Pressable
          onPress={() => router.push("/auth/login")}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>{t.auth.login}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/auth/register")}
          style={styles.secondaryBtn}
        >
          <Text style={styles.secondaryBtnText}>{t.auth.register}</Text>
        </Pressable>

        <View style={styles.langRow}>
          <Text style={styles.langLabel}>{t.auth.language}</Text>
          <Pressable onPress={() => setLocale(locale === "en" ? "fr" : "en")}>
            <Text style={styles.langSwitch}>
              {locale === "en" ? "Français" : "English"}
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <BrandWordmark size="md" />
      <Text style={styles.title}>{user.email}</Text>
      <Text style={styles.subtitle}>{t.auth.loginSubtitle}</Text>

      <Pressable onPress={() => signOut()} style={styles.secondaryBtn}>
        <Text style={styles.secondaryBtnText}>{t.auth.logout}</Text>
      </Pressable>

      <View style={styles.langRow}>
        <Text style={styles.langLabel}>{t.auth.language}</Text>
        <Pressable onPress={() => setLocale(locale === "en" ? "fr" : "en")}>
          <Text style={styles.langSwitch}>
            {locale === "en" ? "Français" : "English"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "700",
    color: PALETTE.navy,
  },
  subtitle: {
    marginTop: 8,
    color: "#4a7088",
    lineHeight: 22,
  },
  hint: { marginTop: 12, color: "#6B8FA3" },
  primaryBtn: {
    marginTop: 24,
    backgroundColor: PALETTE.azure,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: PALETTE.white, fontWeight: "700", fontSize: 16 },
  secondaryBtn: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: PALETTE.line,
    backgroundColor: PALETTE.white,
  },
  secondaryBtnText: { color: PALETTE.navy, fontWeight: "600" },
  langRow: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  langLabel: { color: PALETTE.navy, fontWeight: "500" },
  langSwitch: { color: PALETTE.azure, fontWeight: "700" },
});
