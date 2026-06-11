"use client";

// Tap-to-talk transcription using the Web Speech API.
// No backend needed. Hides itself on unsupported browsers (Firefox).

import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Square } from "lucide-react";
import type { Locale } from "@/lib/types";

type Props = {
  language: Locale;
  onTranscript: (finalText: string) => void;
  onInterim?: (interimText: string) => void;
  className?: string;
};

const LANG_MAP: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-FR",
};

const LABELS = {
  en: {
    start: "Speak your request",
    stop: "Stop recording",
    denied:
      "Microphone blocked — allow access in your browser settings",
  },
  fr: {
    start: "Dictez votre demande",
    stop: "Arrêter",
    denied:
      "Micro bloqué — autorisez l'accès dans les réglages du navigateur",
  },
};

export default function VoiceInput({
  language,
  onTranscript,
  onInterim,
  className,
}: Props) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [denied, setDenied] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onInterimRef = useRef(onInterim);
  onTranscriptRef.current = onTranscript;
  onInterimRef.current = onInterim;

  useEffect(() => {
    const w = window as Window & {
      SpeechRecognition?: typeof SpeechRecognition;
      webkitSpeechRecognition?: typeof SpeechRecognition;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    setSupported(true);
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          const text = res[0]?.transcript.trim();
          if (text) onTranscriptRef.current(text);
        } else {
          interim += res[0]?.transcript ?? "";
        }
      }
      onInterimRef.current?.(interim);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        setDenied(true);
      }
      setRecording(false);
      onInterimRef.current?.("");
    };

    rec.onend = () => {
      setRecording(false);
      onInterimRef.current?.("");
    };

    recognitionRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {
        /* already stopped */
      }
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = LANG_MAP[language];
    }
  }, [language]);

  const toggle = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (recording) {
      rec.stop();
      setRecording(false);
    } else {
      setDenied(false);
      rec.lang = LANG_MAP[language];
      try {
        rec.start();
        setRecording(true);
      } catch {
        /* start() throws if already active */
      }
    }
  }, [recording, language]);

  if (!supported) return null;

  const labels = LABELS[language];

  return (
    <div className={className}>
      <button
        type="button"
        onClick={toggle}
        aria-label={recording ? labels.stop : labels.start}
        title={denied ? labels.denied : recording ? labels.stop : labels.start}
        className={
          "relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors " +
          (recording
            ? "bg-red-500 text-white"
            : denied
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#DCEDF6] text-[#10324A] hover:bg-[#c8e2f0]")
        }
        disabled={denied}
      >
        {recording ? (
          <>
            <Square size={16} fill="currentColor" />
            <span className="absolute inset-0 rounded-xl animate-ping bg-red-400 opacity-30" />
          </>
        ) : denied ? (
          <MicOff size={18} />
        ) : (
          <Mic size={18} />
        )}
      </button>
    </div>
  );
}
