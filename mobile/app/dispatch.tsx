import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Screen } from "@/components/Screen";
import { useApp } from "@/context/AppContext";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n";
import type { Quote } from "@/lib/types";

export default function DispatchScreen() {
  const { t } = useLocale();
  const router = useRouter();
  const {
    job,
    quotes,
    accepted,
    merchantCount,
    isAnonymous,
    acceptQuote,
    resetDispatch,
  } = useApp();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  if (!job) {
    return (
      <Screen scroll={false}>
        <Text style={styles.empty}>{t.home.sendRequest}</Text>
        <Pressable onPress={() => router.replace("/")} style={styles.linkBtn}>
          <Text style={styles.linkText}>{t.requests.backToHome}</Text>
        </Pressable>
      </Screen>
    );
  }

  const handleAccept = async (quote: Quote) => {
    if (isAnonymous) {
      router.push("/auth/register");
      return;
    }
    if (!quote.id) {
      await acceptQuote(quote);
      return;
    }
    setAcceptingId(quote.id);
    setAcceptError(null);
    try {
      await acceptQuote(quote);
    } catch {
      setAcceptError(t.dispatch.acceptQuoteError);
    } finally {
      setAcceptingId(null);
    }
  };

  const pricedQuotes = quotes.filter((q) => q.price > 0);
  const showAuthBanner = isAnonymous && pricedQuotes.length > 0;

  return (
    <Screen>
      <Pressable onPress={() => { resetDispatch(); router.back(); }}>
        <Text style={styles.back}>{t.dispatch.newRequest}</Text>
      </Pressable>

      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.summary}>{job.summary}</Text>
      <Text style={styles.meta}>
        {job.location} · {t.urgency[job.urgency]}
      </Text>

      {job.budget_estimate_eur != null && (
        <Text style={styles.estimate}>
          {t.dispatch.aiEstimate}: €{job.budget_estimate_eur}
        </Text>
      )}

      {isAnonymous && (
        <Text style={styles.demoBadge}>{t.dispatch.demoMode}</Text>
      )}

      <Text style={styles.sentTo}>
        {t.dispatch.sentTo} {merchantCount} {t.dispatch.verifiedPros}
      </Text>

      {showAuthBanner && (
        <View style={styles.authBanner}>
          <Text style={styles.authBannerTitle}>{t.dispatch.authBannerTitle}</Text>
          <View style={styles.authRow}>
            <Pressable
              onPress={() => router.push("/auth/register")}
              style={styles.authBtn}
            >
              <Text style={styles.authBtnText}>{t.dispatch.authBannerRegister}</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/auth/login")}>
              <Text style={styles.authLink}>{t.dispatch.authBannerSignIn}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {acceptError && <Text style={styles.error}>{acceptError}</Text>}

      {accepted ? (
        <View style={styles.acceptedCard}>
          <Text style={styles.acceptedTitle}>{t.dispatch.quoteAccepted}</Text>
          <Text style={styles.acceptedBody}>
            {accepted.merchant.name} — €{accepted.price}
          </Text>
          <Text style={styles.escrow}>{t.dispatch.escrowNote}</Text>
          <Pressable
            onPress={() => { resetDispatch(); router.replace("/"); }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>{t.dispatch.submitAnother}</Text>
          </Pressable>
        </View>
      ) : (
        quotes.map((quote, idx) => (
          <View key={quote.id ?? `${quote.merchant.name}-${idx}`} style={styles.quoteCard}>
            <View style={styles.quoteHeader}>
              <Text style={styles.merchantName}>{quote.merchant.name}</Text>
              {quote.merchant.isPromoted && (
                <Text style={styles.sponsored}>{t.dispatch.sponsored}</Text>
              )}
            </View>
            <Text style={styles.rating}>
              ★ {quote.merchant.rating.toFixed(1)} · {quote.merchant.jobs}{" "}
              {t.dispatch.jobs}
            </Text>
            <Text style={styles.price}>
              {quote.price > 0 ? `€${quote.price}` : t.dispatch.quoting}
            </Text>
            {quote.price > 0 && (
              <Pressable
                onPress={() => handleAccept(quote)}
                disabled={acceptingId === quote.id}
                style={styles.primaryBtn}
              >
                {acceptingId === quote.id ? (
                  <ActivityIndicator color={PALETTE.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>{t.dispatch.acceptQuote}</Text>
                )}
              </Pressable>
            )}
          </View>
        ))
      )}

      {merchantCount === 0 && (
        <Text style={styles.empty}>{t.dispatch.noMerchantsYet}</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    color: PALETTE.azure,
    fontWeight: "600",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: PALETTE.navy,
  },
  summary: {
    marginTop: 8,
    fontSize: 15,
    color: "#2a5068",
    lineHeight: 22,
  },
  meta: {
    marginTop: 8,
    color: "#6B8FA3",
    fontSize: 14,
  },
  estimate: {
    marginTop: 12,
    fontWeight: "600",
    color: PALETTE.navy,
  },
  demoBadge: {
    marginTop: 12,
    fontSize: 13,
    color: PALETTE.amber,
  },
  sentTo: {
    marginTop: 16,
    marginBottom: 12,
    fontWeight: "600",
    color: PALETTE.navy,
  },
  authBanner: {
    backgroundColor: PALETTE.amberSoft,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  authBannerTitle: {
    fontWeight: "600",
    color: PALETTE.navy,
    marginBottom: 10,
  },
  authRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  authBtn: {
    backgroundColor: PALETTE.amber,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  authBtnText: { color: PALETTE.white, fontWeight: "600" },
  authLink: { color: PALETTE.azure, fontWeight: "600" },
  quoteCard: {
    backgroundColor: PALETTE.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PALETTE.line,
  },
  quoteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  merchantName: {
    fontSize: 16,
    fontWeight: "700",
    color: PALETTE.navy,
    flex: 1,
  },
  sponsored: {
    fontSize: 11,
    color: PALETTE.amber,
    fontWeight: "600",
  },
  rating: { marginTop: 4, color: "#6B8FA3", fontSize: 13 },
  price: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "700",
    color: PALETTE.azure,
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: PALETTE.azure,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: PALETTE.white, fontWeight: "700" },
  acceptedCard: {
    backgroundColor: PALETTE.azureSoft,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  acceptedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: PALETTE.navy,
  },
  acceptedBody: { marginTop: 8, color: PALETTE.navy },
  escrow: { marginTop: 8, fontSize: 13, color: "#4a7088" },
  error: { color: "#B42318", marginBottom: 12 },
  empty: { color: "#6B8FA3", marginTop: 24, textAlign: "center" },
  linkBtn: { marginTop: 16, alignItems: "center" },
  linkText: { color: PALETTE.azure, fontWeight: "600" },
});
