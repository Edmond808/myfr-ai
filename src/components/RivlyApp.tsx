import { useEffect, useRef, useState } from "react";
import { classifyRequest } from "../lib/classify";
import {
  BASE_PRICE,
  CATEGORY_EXAMPLES,
  EXAMPLES,
  MERCHANTS,
  PALETTE,
} from "../lib/constants";
import type { Category, JobClassification, Quote, View } from "../lib/types";
import { DispatchView } from "./DispatchView";
import { Header } from "./Header";
import { HomeView } from "./HomeView";

export function RivlyApp() {
  const [view, setView] = useState<View>("home");
  const [text, setText] = useState("");
  const [location, setLocation] = useState("Cannes");
  const [placeholder, setPlaceholder] = useState<string>(EXAMPLES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<JobClassification | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [accepted, setAccepted] = useState<Quote | null>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % EXAMPLES.length;
      setPlaceholder(EXAMPLES[i]);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  const clearTimeouts = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  const simulateQuotes = (parsed: JobClassification) => {
    const base = parsed.budget_estimate_eur || BASE_PRICE[parsed.category];
    const merchants = MERCHANTS[parsed.category];
    [1600, 3400, 5200].forEach((delay, idx) => {
      const t = setTimeout(() => {
        const variance = [1.0, 0.92, 1.08][idx];
        setQuotes((q) => [
          ...q,
          { merchant: merchants[idx], price: Math.round(base * variance) },
        ]);
      }, delay);
      timeouts.current.push(t);
    });
  };

  const submit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = await classifyRequest(text.trim(), location);
      setJob(parsed);
      setQuotes([]);
      setAccepted(null);
      setView("dispatch");
      simulateQuotes(parsed);
    } catch {
      setError("The dispatch engine didn't respond. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    clearTimeouts();
    setView("home");
    setText("");
    setJob(null);
    setQuotes([]);
    setAccepted(null);
    setError(null);
  };

  const handleCategoryClick = (category: Category) => {
    setText(CATEGORY_EXAMPLES[category]);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: PALETTE.bg,
        color: PALETTE.navy,
        fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <Header onReset={reset} />

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
          quotes={quotes}
          accepted={accepted}
          onReset={reset}
          onAccept={setAccepted}
        />
      )}
    </div>
  );
}
