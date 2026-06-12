import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandWordmark } from "@/components/BrandWordmark";
import { Screen } from "@/components/Screen";
import Constants from "expo-constants";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n";

function webBaseUrl(): string {
  return (
    process.env.EXPO_PUBLIC_API_URL ??
    (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export default function ProScreen() {
  const { t } = useLocale();

  const openProDashboard = () => {
    WebBrowser.openBrowserAsync(`${webBaseUrl()}/pro`);
  };

  return (
    <Screen scroll={false}>
      <BrandWordmark size="md" />
      <Text style={styles.title}>{t.pro.signupTitle}</Text>
      <Text style={styles.subtitle}>{t.pro.signupSubtitle}</Text>

      <View style={styles.stubCard}>
        <Text style={styles.stubLabel}>Phase 1 stub</Text>
        <Text style={styles.stubBody}>
          Full merchant signup and quote dashboard live on the web app for now.
          Tap below to open the pro portal in your browser.
        </Text>
        <Pressable onPress={openProDashboard} style={styles.button}>
          <Text style={styles.buttonText}>{t.pro.goToDashboard}</Text>
        </Pressable>
      </View>

      <Text style={styles.note}>{t.pro.notificationsTodo}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "700",
    color: PALETTE.navy,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#4a7088",
  },
  stubCard: {
    marginTop: 24,
    backgroundColor: PALETTE.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: PALETTE.line,
  },
  stubLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: PALETTE.amber,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stubBody: {
    marginTop: 10,
    color: PALETTE.navy,
    lineHeight: 22,
  },
  button: {
    marginTop: 16,
    backgroundColor: PALETTE.navy,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: PALETTE.white, fontWeight: "700" },
  note: {
    marginTop: 20,
    fontSize: 13,
    color: "#6B8FA3",
    fontStyle: "italic",
  },
});
