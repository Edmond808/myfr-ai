import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Screen } from "@/components/Screen";
import { useApp } from "@/context/AppContext";
import { fetchMyJobs } from "@/lib/api-client";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { CustomerJobListItem, JobStatus } from "@/lib/types";

function statusLabel(
  status: JobStatus,
  t: ReturnType<typeof useLocale>["t"],
): string {
  const map: Record<JobStatus, string> = {
    submitted: t.requests.statusSubmitted,
    classified: t.requests.statusClassified,
    dispatched: t.requests.statusDispatched,
    quoted: t.requests.statusQuoted,
    accepted: t.requests.statusAccepted,
    in_progress: t.requests.statusInProgress,
    completed: t.requests.statusCompleted,
    disputed: t.requests.statusDisputed,
    cancelled: t.requests.statusCancelled,
  };
  return map[status];
}

export default function RequestsScreen() {
  const { t } = useLocale();
  const router = useRouter();
  const { user, loadJob } = useApp();
  const [jobs, setJobs] = useState<CustomerJobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setJobs([]);
      setLoading(false);
      return;
    }
    try {
      const rows = await fetchMyJobs();
      setJobs(rows);
      setError(null);
    } catch {
      setError(t.home.dispatchError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t.home.dispatchError, user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!isSupabaseConfigured() || !user) {
    return (
      <Screen scroll={false}>
        <Text style={styles.title}>{t.requests.title}</Text>
        <Text style={styles.subtitle}>{t.requests.loginRequired}</Text>
        <Pressable
          onPress={() => router.push("/auth/login")}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>{t.auth.login}</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      style={{ flexGrow: 1 }}
    >
      <Text style={styles.title}>{t.requests.title}</Text>
      <Text style={styles.subtitle}>{t.requests.subtitle}</Text>

      {loading ? (
        <ActivityIndicator color={PALETTE.azure} style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : jobs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t.requests.empty}</Text>
          <Text style={styles.emptyHint}>{t.requests.emptyHint}</Text>
        </View>
      ) : (
        jobs.map((job) => (
          <Pressable
            key={job.id}
            style={styles.card}
            onPress={async () => {
              await loadJob(job.id);
              router.push("/dispatch");
            }}
          >
            <Text style={styles.cardTitle}>{job.title}</Text>
            <Text style={styles.cardMeta}>
              {job.location} · {t.categories[job.category]}
            </Text>
            <Text style={styles.cardStatus}>{statusLabel(job.status, t)}</Text>
            <Text style={styles.cardQuotes}>
              {job.quotes_submitted > 0
                ? t.requests.quotesCount.replace(
                    "{count}",
                    String(job.quotes_submitted),
                  )
                : t.requests.quotesWaiting}
            </Text>
          </Pressable>
        ))
      )}

      <Pressable
        onPress={() => {
          setRefreshing(true);
          load();
        }}
        style={styles.refresh}
      >
        <Text style={styles.refreshText}>
          {refreshing ? "…" : t.errors.retry}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: PALETTE.navy,
  },
  subtitle: {
    marginTop: 8,
    color: "#4a7088",
    lineHeight: 22,
  },
  primaryBtn: {
    marginTop: 24,
    backgroundColor: PALETTE.azure,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: PALETTE.white, fontWeight: "700" },
  empty: { marginTop: 32, alignItems: "center" },
  emptyTitle: { fontWeight: "600", color: PALETTE.navy },
  emptyHint: { marginTop: 8, color: "#6B8FA3", textAlign: "center" },
  card: {
    marginTop: 12,
    backgroundColor: PALETTE.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: PALETTE.line,
  },
  cardTitle: { fontWeight: "700", color: PALETTE.navy, fontSize: 16 },
  cardMeta: { marginTop: 4, color: "#6B8FA3", fontSize: 13 },
  cardStatus: { marginTop: 8, fontWeight: "600", color: PALETTE.azure },
  cardQuotes: { marginTop: 4, fontSize: 13, color: "#4a7088" },
  error: { marginTop: 16, color: "#B42318" },
  refresh: { marginTop: 20, alignItems: "center" },
  refreshText: { color: PALETTE.azure, fontWeight: "600" },
});
