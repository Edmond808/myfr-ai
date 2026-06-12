import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  acceptQuoteClient,
  classifyRequestClient,
  dispatchJobClient,
  fetchJobQuotes,
} from "@/lib/api-client";
import { buildDemoQuotes } from "@/lib/demo-quotes";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type {
  JobClassification,
  PendingRequest,
  Quote,
} from "@/lib/types";

interface AppContextValue {
  user: User | null;
  session: Session | null;
  supabaseReady: boolean;
  pendingRequest: PendingRequest | null;
  job: JobClassification | null;
  jobId: string | null;
  quotes: Quote[];
  accepted: Quote | null;
  merchantCount: number;
  loading: boolean;
  error: string | null;
  isAnonymous: boolean;
  submitRequest: (text: string, location: string) => Promise<void>;
  resetDispatch: () => void;
  acceptQuote: (quote: Quote) => Promise<void>;
  loadJob: (jobId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseReady, setSupabaseReady] = useState(!isSupabaseConfigured());
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(
    null,
  );
  const [job, setJob] = useState<JobClassification | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [accepted, setAccepted] = useState<Quote | null>(null);
  const [merchantCount, setMerchantCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const demoCleanup = useRef<(() => void) | null>(null);
  const channelCleanup = useRef<(() => void) | null>(null);

  const clearDemo = useCallback(() => {
    demoCleanup.current?.();
    demoCleanup.current = null;
  }, []);

  const clearChannel = useCallback(() => {
    channelCleanup.current?.();
    channelCleanup.current = null;
  }, []);

  const refreshSession = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSupabaseReady(true);
      return;
    }
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
    setSupabaseReady(true);
  }, []);

  useEffect(() => {
    refreshSession();
    if (!isSupabaseConfigured()) return;

    const supabase = getSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setUser(next?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshSession]);

  const startDemoQuotes = useCallback((classification: JobClassification) => {
    clearDemo();
    const { merchants, scheduleUpdates } = buildDemoQuotes(classification);
    setMerchantCount(merchants.length);
    setQuotes(merchants);
    demoCleanup.current = scheduleUpdates((next) => {
      setQuotes(next);
    });
  }, [clearDemo]);

  const subscribeToQuotes = useCallback(
    (id: string) => {
      if (!isSupabaseConfigured()) return;
      clearChannel();
      const supabase = getSupabase();
      const channel = supabase
        .channel(`quotes-${id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "quotes",
            filter: `job_id=eq.${id}`,
          },
          async () => {
            try {
              const data = await fetchJobQuotes(id);
              setMerchantCount(data.quotes.length);
              setQuotes(data.quotes);
            } catch {
              /* ignore transient errors */
            }
          },
        )
        .subscribe();

      channelCleanup.current = () => {
        supabase.removeChannel(channel);
      };
    },
    [clearChannel],
  );

  const completeDispatch = useCallback(
    async (req: PendingRequest) => {
      setPendingRequest(req);
      setJob(req.classification);
      setQuotes([]);
      setAccepted(null);
      setError(null);

      if (isSupabaseConfigured()) {
        const { jobId: id, dispatched } = await dispatchJobClient({
          rawRequest: req.text,
          classification: req.classification,
        });
        setJobId(id);

        if (dispatched === 0) {
          setMerchantCount(0);
          return;
        }

        setMerchantCount(dispatched);
        subscribeToQuotes(id);
        const data = await fetchJobQuotes(id);
        if (data.quotes.length) setQuotes(data.quotes);
      } else {
        setJobId(null);
        startDemoQuotes(req.classification);
      }
    },
    [startDemoQuotes, subscribeToQuotes],
  );

  const submitRequest = useCallback(
    async (text: string, location: string) => {
      setLoading(true);
      setError(null);
      clearDemo();
      clearChannel();

      try {
        const parsed = await classifyRequestClient(text.trim(), location);
        const req: PendingRequest = {
          text: text.trim(),
          location,
          classification: parsed,
        };

        if (isSupabaseConfigured() && !user) {
          setPendingRequest(req);
          setJob(parsed);
          setQuotes([]);
          setAccepted(null);
          setJobId(null);
          startDemoQuotes(parsed);
          return;
        }

        await completeDispatch(req);
      } catch {
        setError("dispatch");
        throw new Error("dispatch");
      } finally {
        setLoading(false);
      }
    },
    [clearChannel, clearDemo, completeDispatch, startDemoQuotes, user],
  );

  const resetDispatch = useCallback(() => {
    clearDemo();
    clearChannel();
    setPendingRequest(null);
    setJob(null);
    setJobId(null);
    setQuotes([]);
    setAccepted(null);
    setMerchantCount(0);
    setError(null);
  }, [clearChannel, clearDemo]);

  const acceptQuote = useCallback(
    async (quote: Quote) => {
      if (!quote.id || !jobId) {
        setAccepted(quote);
        return;
      }
      await acceptQuoteClient({ jobId, quoteId: quote.id });
      setAccepted(quote);
    },
    [jobId],
  );

  const loadJob = useCallback(
    async (id: string) => {
      const data = await fetchJobQuotes(id);
      setJobId(id);
      setJob({
        category: data.job.category,
        title: data.job.title,
        summary: data.job.summary,
        location: data.job.location,
        urgency: data.job.urgency,
        budget_estimate_eur: data.job.budget_estimate_eur,
        clarifying_question: data.job.clarifying_question,
      });
      setQuotes(data.quotes);
      setMerchantCount(data.quotes.length);
      subscribeToQuotes(id);

      if (data.job.status === "accepted" && data.job.accepted_quote_id) {
        const found = data.quotes.find((q) => q.id === data.job.accepted_quote_id);
        if (found) setAccepted(found);
      } else {
        setAccepted(null);
      }
    },
    [subscribeToQuotes],
  );

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    await getSupabase().auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      supabaseReady,
      pendingRequest,
      job,
      jobId,
      quotes,
      accepted,
      merchantCount,
      loading,
      error,
      isAnonymous: isSupabaseConfigured() && !user,
      submitRequest,
      resetDispatch,
      acceptQuote,
      loadJob,
      refreshSession,
      signOut,
    }),
    [
      user,
      session,
      supabaseReady,
      pendingRequest,
      job,
      jobId,
      quotes,
      accepted,
      merchantCount,
      loading,
      error,
      submitRequest,
      resetDispatch,
      acceptQuote,
      loadJob,
      refreshSession,
      signOut,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// Re-export for convenience
export { mapApiQuote, type ApiQuote } from "@/lib/api-client";
