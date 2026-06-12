"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { acceptQuoteClient, classifyRequestClient, dispatchJobClient } from "@/lib/api-client";
import {
  displayNameFromUser,
  initialFromName,
  syncProfileFromAuth,
} from "@/lib/auth/profile-sync";
import {
  BASE_PRICE,
  DEMO_MERCHANTS,
} from "@/lib/constants";
import { sortQuotesRecommended } from "@/lib/quote-filters";
import { normalizeLoyaltyTier } from "@/lib/loyalty";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  Category,
  JobClassification,
  LoyaltyTier,
  PendingRequest,
  PendingSession,
  Quote,
  View,
} from "@/lib/types";
import { AmbientBackground } from "./AmbientBackground";
import { DispatchView } from "./DispatchView";
import { Header } from "./Header";
import { HomeView } from "./HomeView";

export function RivlyApp() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<View>("home");
  const [text, setText] = useState("");
  const [location, setLocation] = useState("Cannes");
  const [placeholder, setPlaceholder] = useState<string>(t.examples[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<JobClassification | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [accepted, setAccepted] = useState<Quote | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState<string | null>(null);
  const [loyaltyTier, setLoyaltyTier] = useState<LoyaltyTier>(1);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null);
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null);
  const [merchantCount, setMerchantCount] = useState(0);
  const isAnonymousSession = isSupabaseConfigured() && !userEmail;
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const channelCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % t.examples.length;
      setPlaceholder(t.examples[i]);
    }, 3200);
    return () => clearInterval(id);
  }, [t.examples]);

  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  useEffect(
    () => () => {
      channelCleanup.current?.();
      channelCleanup.current = null;
    },
    [],
  );

  const refreshUserProfile = async () => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      setUserEmail(null);
      setUserDisplayName(null);
      setUserInitial(null);
      setLoyaltyTier(1);
      return;
    }

    setUserEmail(user.email ?? null);

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, preferred_language, loyalty_tier")
      .eq("id", user.id)
      .single();

    const preferred = await syncProfileFromAuth(supabase, user);
    if (preferred) {
      localStorage.setItem("myfr-locale", preferred);
    }

    const name = displayNameFromUser(user, profile);
    setUserDisplayName(name);
    setUserInitial(initialFromName(name));
    setLoyaltyTier(normalizeLoyaltyTier(profile?.loyalty_tier ?? 1));
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    refreshUserProfile();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshUserProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const resume = searchParams.get("resume");
    if (resume !== "dispatch") return;

    const stored = sessionStorage.getItem("myfr-pending");
    if (!stored) return;

    const run = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      let session: PendingSession;
      try {
        const parsed = JSON.parse(stored) as PendingSession | PendingRequest;
        session =
          "request" in parsed && parsed.request?.classification
            ? parsed
            : { request: parsed as PendingRequest };
      } catch {
        return;
      }

      sessionStorage.removeItem("myfr-pending");
      await completeDispatch(session.request);
      router.replace("/");
    };
    run();
  }, [searchParams]);

  useEffect(() => {
    const jobParam = searchParams.get("job");
    if (!jobParam || searchParams.get("resume") === "dispatch") return;

    const run = async () => {
      if (!isSupabaseConfigured()) return;

      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.push(
          `/auth/login?next=${encodeURIComponent(`/?job=${jobParam}`)}`,
        );
        return;
      }

      try {
        const res = await fetch(`/api/jobs?jobId=${jobParam}`);
        if (!res.ok) return;

        const data = (await res.json()) as {
          job: {
            category: Category;
            title: string;
            summary: string;
            location: string;
            urgency: JobClassification["urgency"];
            budget_estimate_eur: number | null;
            clarifying_question: string | null;
            status: string;
            accepted_quote_id: string | null;
          };
          quotes: ApiQuote[];
        };

        if (!data.job) return;

        clearTimeouts();
        channelCleanup.current?.();

        const classification: JobClassification = {
          category: data.job.category,
          title: data.job.title,
          summary: data.job.summary,
          location: data.job.location,
          urgency: data.job.urgency,
          budget_estimate_eur: data.job.budget_estimate_eur,
          clarifying_question: data.job.clarifying_question,
        };

        setJob(classification);
        setJobId(jobParam);
        setView("dispatch");
        setQuotes(sortQuotesRecommended(data.quotes.map(mapApiQuote)));
        setMerchantCount(data.quotes.length);
        setError(null);

        if (data.job.status === "accepted" && data.job.accepted_quote_id) {
          const acceptedQuote = data.quotes.find(
            (q) => q.id === data.job.accepted_quote_id,
          );
          if (acceptedQuote) {
            setAccepted(mapApiQuote(acceptedQuote));
          }
        } else {
          setAccepted(null);
        }

        channelCleanup.current = subscribeToQuotes(jobParam) ?? null;
        router.replace("/");
      } catch {
        /* ignore — stay on home */
      }
    };

    run();
  }, [searchParams]);

  const clearTimeouts = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  type ApiQuote = {
    id: string;
    price_eur: number | null;
    message: string | null;
    status: string;
    merchant: {
      id: string;
      business_name: string;
      rating: number;
      jobs_completed: number;
      is_promoted?: boolean;
      promotion_rank?: number;
      promotion_expires_at?: string | null;
    };
  };

  const mapApiQuote = (q: ApiQuote): Quote => {
    const promotedActive =
      Boolean(q.merchant.is_promoted) &&
      (!q.merchant.promotion_expires_at ||
        new Date(q.merchant.promotion_expires_at) > new Date());

    return {
      id: q.id,
      price: q.price_eur ? Number(q.price_eur) : 0,
      message: q.message,
      status: q.status,
      merchant: {
        id: q.merchant.id,
        name: q.merchant.business_name,
        rating: Number(q.merchant.rating),
        jobs: q.merchant.jobs_completed,
        eta: q.status === "pending" ? "Awaiting quote" : "Quoted",
        isPromoted: promotedActive,
        promotionRank: q.merchant.promotion_rank ?? 0,
      },
    };
  };

  const simulateDemoQuotes = (parsed: JobClassification) => {
    const base = parsed.budget_estimate_eur || BASE_PRICE[parsed.category];
    const merchants = sortQuotesRecommended(
      DEMO_MERCHANTS[parsed.category].map((m) => ({
        merchant: m,
        price: 0,
      })),
    ).map((q) => q.merchant);

    setMerchantCount(merchants.length);
    setQuotes(
      merchants.map((m) => ({
        merchant: m,
        price: 0,
      })),
    );

    merchants.forEach((m, idx) => {
      const delay = 1200 + idx * 900;
      const variance = 0.88 + (idx % 5) * 0.04;
      const tId = setTimeout(() => {
        setQuotes((prev) => {
          const next = [...prev];
          if (next[idx]) {
            next[idx] = {
              ...next[idx],
              price: Math.round(base * variance),
            };
          }
          return next;
        });
      }, delay);
      timeouts.current.push(tId);
    });
  };

  const subscribeToQuotes = (id: string) => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
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
          const res = await fetch(`/api/jobs?jobId=${id}`);
          if (!res.ok) return;
          const data = (await res.json()) as { quotes: ApiQuote[] };

          setMerchantCount(data.quotes.length);
          setQuotes(sortQuotesRecommended(data.quotes.map(mapApiQuote)));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const completeDispatch = async (req: PendingRequest) => {
    setPendingRequest(req);
    setJob(req.classification);
    setQuotes([]);
    setAccepted(null);
    setView("dispatch");

    if (isSupabaseConfigured()) {
      try {
        const { jobId: id, dispatched } = await dispatchJobClient({
          rawRequest: req.text,
          classification: req.classification,
        });
        setJobId(id);

        if (dispatched === 0) {
          setQuotes([]);
          setMerchantCount(0);
          return;
        }

        setMerchantCount(dispatched);

        channelCleanup.current?.();
        channelCleanup.current = subscribeToQuotes(id) ?? null;
        const res = await fetch(`/api/jobs?jobId=${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.quotes?.length) {
            setQuotes(sortQuotesRecommended(data.quotes.map(mapApiQuote)));
          }
        }
      } catch {
        simulateDemoQuotes(req.classification);
      }
    } else {
      simulateDemoQuotes(req.classification);
    }
  };

  const startAnonymousDispatch = (req: PendingRequest) => {
    clearTimeouts();
    channelCleanup.current?.();
    channelCleanup.current = null;
    setPendingRequest(req);
    setJob(req.classification);
    setQuotes([]);
    setAccepted(null);
    setJobId(null);
    setView("dispatch");
    simulateDemoQuotes(req.classification);
  };

  const savePendingAndNavigate = (
    path: "/auth/register" | "/auth/login",
    quote?: Quote,
  ) => {
    if (!pendingRequest) return;

    const payload: PendingSession = {
      request: pendingRequest,
      ...(quote ? { quote } : {}),
    };
    sessionStorage.setItem("myfr-pending", JSON.stringify(payload));
    router.push(
      `${path}?next=${encodeURIComponent("/?resume=dispatch")}`,
    );
  };

  const submit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const parsed = await classifyRequestClient(text.trim(), location);
      const req: PendingRequest = {
        text: text.trim(),
        location,
        classification: parsed,
      };

      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();

        if (!data.user) {
          startAnonymousDispatch(req);
          return;
        }

        await completeDispatch(req);
      } else {
        await completeDispatch(req);
      }
    } catch {
      setError(t.home.dispatchError);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    clearTimeouts();
    channelCleanup.current?.();
    channelCleanup.current = null;
    setView("home");
    setText("");
    setJob(null);
    setJobId(null);
    setPendingRequest(null);
    setQuotes([]);
    setAccepted(null);
    setError(null);
  };

  const handleCategoryClick = (category: Category) => {
    setText(t.categoryExamples[category]);
    setError(null);
  };

  const handleAcceptQuote = async (quote: Quote) => {
    if (isAnonymousSession && pendingRequest) {
      savePendingAndNavigate("/auth/register", quote);
      return;
    }

    if (!quote.id || !jobId) {
      setAccepted(quote);
      return;
    }

    setAcceptingQuoteId(quote.id);
    try {
      await acceptQuoteClient({ jobId, quoteId: quote.id });
      setAccepted(quote);
    } catch {
      setError(t.dispatch.acceptQuoteError);
    } finally {
      setAcceptingQuoteId(null);
    }
  };

  const handleLogout = async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserEmail(null);
    setUserDisplayName(null);
    setUserInitial(null);
    setLoyaltyTier(1);
  };

  return (
    <div className="rivly-shell relative">
      <AmbientBackground />

      <div className="relative z-10">
        <Header
          onReset={reset}
          userEmail={userEmail}
          userDisplayName={userDisplayName}
          userInitial={userInitial}
          loyaltyTier={loyaltyTier}
          onLogout={handleLogout}
        />

        {view === "home" && (
        <HomeView
          text={text}
          location={location}
          placeholder={placeholder}
          loading={loading}
          error={error}
          onTextChange={setText}
          onLocationChange={setLocation}
          onSubmit={submit}
          onCategoryClick={handleCategoryClick}
        />
      )}

        {view === "dispatch" && job && (
          <DispatchView
            job={job}
            jobId={jobId}
            quotes={quotes}
            accepted={accepted}
            merchantCount={merchantCount}
            onReset={reset}
            onAccept={handleAcceptQuote}
            acceptingQuoteId={acceptingQuoteId}
            showAuthBanner={
              isAnonymousSession && quotes.some((q) => q.price > 0)
            }
            onAuthRegister={() => savePendingAndNavigate("/auth/register")}
            onAuthSignIn={() => savePendingAndNavigate("/auth/login")}
            loyaltyTier={loyaltyTier}
            isLoggedIn={!!userEmail}
          />
        )}
      </div>
    </div>
  );
}
