"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ state */

type Msg = { role: "user" | "assistant"; content: string; next?: string[] };
type Ctx = { open: boolean; toggle: () => void; close: () => void };
const RangaaCtx = createContext<Ctx>({ open: false, toggle: () => {}, close: () => {} });
export const useRangaa = () => useContext(RangaaCtx);

const ACCENT = "#e4572e";
const PROMPTS = ["Where should I start?", "What does Vishnu do?", "Is he open to roles?"];

/** Splits a streamed reply into the visible text and the trailing "NEXT: a | b | c" suggestions. */
function parseReply(raw: string) {
  const i = raw.lastIndexOf("NEXT:");
  if (i === -1) return { text: raw.trimEnd(), next: [] as string[] };
  return {
    text: raw.slice(0, i).trimEnd(),
    next: raw
      .slice(i + 5)
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3),
  };
}

export function RangaaProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);

  // Docked panel pushes the page over on wide screens (--rangaa is read by body padding in globals.css).
  useLayoutEffect(() => {
    const apply = () => {
      const wide = window.matchMedia("(min-width: 768px)").matches;
      document.documentElement.style.setProperty("--rangaa", open && wide ? "min(29vw, 440px)" : "0px");
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <RangaaCtx.Provider value={{ open, toggle, close }}>
      {children}
      <RangaaPanel />
    </RangaaCtx.Provider>
  );
}

/* ------------------------------------------------------------------ bits */

export function Sparkle({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={ACCENT} aria-hidden="true" className={className}>
      <path d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5Z" />
    </svg>
  );
}

/** Header trigger: orange sparkle + "Rangaa" in the nav's mono style. */
export function RangaaButton({ className = "" }: { className?: string }) {
  const { open, toggle } = useRangaa();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={open ? "Close Rangaa" : "Ask Rangaa"}
      aria-expanded={open}
      className={`flex items-center gap-2 font-mono text-base leading-[19px] text-pigment-soft transition-[color,opacity] duration-300 hover:text-[#C44419] ${open ? "pointer-events-none opacity-0" : "opacity-100"} ${className}`}
    >
      <Sparkle size={17} />
      <span>Rangaa</span>
    </button>
  );
}

/** Standard microphone icon; turns orange and pulses while listening. */
function MicIcon({ listening }: { listening: boolean }) {
  return (
    <span className="relative grid place-items-center">
      {listening && <span className="absolute h-8 w-8 rounded-full" style={{ background: "rgba(228,87,46,0.18)", animation: "rangaa-pulse 1.2s ease-out infinite" }} />}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={listening ? ACCENT : "currentColor"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="relative">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
      </svg>
    </span>
  );
}

/** Renders [label](/path) links and **bold**; everything else is plain text. */
function Rich({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          const [, label, href] = link;
          const external = /^https?:/.test(href);
          return external ? (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-pigment-soft">
              {label}
            </a>
          ) : (
            <Link key={i} href={href} onClick={onNavigate} className="underline underline-offset-4 hover:text-pigment-soft">
              {label}
            </Link>
          );
        }
        const bold = p.match(/^\*\*([^*]+)\*\*$/);
        return bold ? <strong key={i}>{bold[1]}</strong> : <span key={i}>{p}</span>;
      })}
    </>
  );
}

/* ------------------------------------------------------------------ panel */

type SR = {
  lang: string; interimResults: boolean; continuous: boolean;
  start: () => void; stop: () => void; abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null;
};

const plain = (t: string) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
const stopSpeaking = () => typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.cancel();

function RangaaPanel() {
  const { open, close } = useRangaa();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const cancelled = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  const rec = useRef<SR | null>(null);
  const heard = useRef("");

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    setCanSpeak(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus({ preventScroll: true }), 350);
    else {
      cancelled.current = true;
      rec.current?.abort();
      setListening(false);
      stopSpeaking();
    }
  }, [open]);

  // recording timer (m:ss)
  useEffect(() => {
    if (!listening) return;
    setSeconds(0);
    const t = setInterval(() => setSeconds((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [listening]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const ask = useCallback(async (history: Msg[]) => {
    stopSpeaking();
    setSpeaking(null);
    setMessages([...history, { role: "assistant", content: "" }]);
    setBusy(true);
    abort.current = new AbortController();
    let raw = "";
    try {
      const res = await fetch("/api/rangaa", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: abort.current.signal,
      });
      if (!res.ok || !res.body) throw new Error(await res.text());
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += dec.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: parseReply(raw).text }]);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") raw = raw || "I couldn't reach my brain just now — please try again in a moment.";
    }
    const { text: finalText, next } = parseReply(raw);
    setMessages([...history, { role: "assistant", content: finalText, next }]);
    setBusy(false);
  }, []);

  const send = useCallback(
    (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      setDraft("");
      ask([...messages, { role: "user", content: q }]);
    },
    [busy, messages, ask],
  );

  /** Re-asks the last question and replaces the answer. */
  const regenerate = () => {
    if (busy) return;
    const idx = messages.map((m) => m.role).lastIndexOf("user");
    if (idx >= 0) ask(messages.slice(0, idx + 1));
  };

  /** Reads an answer aloud (tap again to stop). */
  const speak = (i: number, text: string) => {
    if (!("speechSynthesis" in window)) return;
    if (speaking === i) {
      stopSpeaking();
      setSpeaking(null);
      return;
    }
    stopSpeaking();
    const u = new SpeechSynthesisUtterance(plain(text));
    u.lang = navigator.language || "en-US";
    u.onend = () => setSpeaking((c) => (c === i ? null : c));
    u.onerror = () => setSpeaking(null);
    setSpeaking(i);
    window.speechSynthesis.speak(u);
  };

  const reset = () => {
    abort.current?.abort();
    cancelled.current = true;
    rec.current?.abort();
    stopSpeaking();
    setSpeaking(null);
    setMessages([]);
    setDraft("");
    setBusy(false);
    setListening(false);
  };

  const cancelRecording = () => {
    cancelled.current = true;
    heard.current = "";
    rec.current?.abort();
    setListening(false);
    setDraft("");
  };

  const toggleMic = () => {
    if (listening) {
      rec.current?.stop();
      return;
    }
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = navigator.language || "en-US";
    r.interimResults = true;
    r.continuous = false;
    heard.current = "";
    cancelled.current = false;
    r.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      heard.current = t;
      setDraft(t);
    };
    r.onend = () => {
      setListening(false);
      const t = heard.current.trim();
      if (t && !cancelled.current) send(t);
      else setDraft("");
    };
    r.onerror = () => setListening(false);
    rec.current = r;
    setListening(true);
    r.start();
  };

  const empty = messages.length === 0;
  const lastAssistant = messages.length ? messages[messages.length - 1] : null;

  return (
    <aside
      aria-label="Rangaa, Vishnu's AI assistant"
      aria-hidden={!open}
      className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-hidden border-l border-rule bg-white transition-transform md:bg-transparent duration-[400ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] md:w-[min(29vw,440px)] ${open ? "translate-x-0" : "translate-x-full"}`}
    >
      <div aria-hidden className="rangaa-paper pointer-events-none md:hidden" />

      {/* header */}
      <div className="relative flex h-[57px] shrink-0 items-center justify-between border-b border-rule px-5 font-mono text-base leading-[19px] text-pigment-soft">
        <span className="flex items-center gap-2">
          <Sparkle size={17} />
          Rangaa
        </span>
        <span className="flex items-center gap-4 text-pigment-soft">
          <button type="button" onClick={reset} aria-label="Start over" className="transition-colors hover:text-pigment">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5" /><path d="M3.5 3.5v5h5" /></svg>
          </button>
          <button type="button" onClick={close} aria-label="Close" className="transition-colors hover:text-pigment">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
        </span>
      </div>

      {/* conversation */}
      <div ref={scroller} className="relative flex flex-1 flex-col overflow-y-auto px-5 pb-4 pt-6 [scrollbar-width:thin]">
        {empty ? (
          <div className="mt-auto">
            <p className="font-serif text-[1.625rem] leading-[34px]">Hey, ask away.</p>
            <p className="mt-2 text-[15px] leading-[24px] text-pigment">I&apos;m Rangaa, Vishnu&apos;s AI assistant. Type, or tap the mic and just say it.</p>
            <ul className="mt-6 space-y-3">
              {PROMPTS.map((p) => (
                <li key={p}>
                  <button type="button" onClick={() => send(p)} className="flex items-start gap-2 text-left text-[15px] leading-[22px] text-pigment-soft transition-colors hover:text-[#C44419]">
                    <span aria-hidden>↳</span>
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[85%] border border-rule bg-white/45 px-4 py-3 text-[15px] leading-[22px]">{m.content}</p>
                </div>
              ) : (
                <div key={i} className="text-[15px] leading-[24px]">
                  {m.content ? (
                    m.content.split(/\n{2,}/).map((para, j) => (
                      <p key={j} className={j ? "mt-3" : ""}>
                        <Rich text={para} onNavigate={() => window.matchMedia("(max-width: 767px)").matches && close()} />
                      </p>
                    ))
                  ) : (
                    <span className="inline-flex gap-1.5 py-2" aria-label="Rangaa is thinking">
                      {[0, 1, 2].map((d) => (
                        <span key={d} className="h-1.5 w-1.5 rounded-full bg-pigment-soft" style={{ animation: `rangaa-dot 1s ${d * 0.15}s ease-in-out infinite` }} />
                      ))}
                    </span>
                  )}
                  {m.content && !(busy && i === messages.length - 1) && (
                    <div className="mt-3 flex items-center gap-1 text-pigment-soft">
                      <button
                        type="button"
                        onClick={() => speak(i, m.content)}
                        aria-label={speaking === i ? "Stop reading" : "Read aloud"}
                        className="grid h-8 w-8 place-items-center transition-colors hover:text-[#C44419]"
                      >
                        {speaking === i ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="0.5" /><rect x="14" y="5" width="4" height="14" rx="0.5" /></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M7 4.5v15l12-7.5-12-7.5Z" /></svg>
                        )}
                      </button>
                      {i === messages.length - 1 && (
                        <button type="button" onClick={regenerate} aria-label="Regenerate answer" className="grid h-8 w-8 place-items-center transition-colors hover:text-[#C44419]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v5h-5" /></svg>
                        </button>
                      )}
                    </div>
                  )}
                  {i === messages.length - 1 && !busy && m.next && m.next.length > 0 && (
                    <div className="mt-5">
                      <ul className="space-y-3">
                        {m.next.map((n) => (
                          <li key={n}>
                            <button type="button" onClick={() => send(n)} className="flex items-start gap-2 text-left text-[14px] leading-[20px] text-pigment-soft transition-colors hover:text-[#C44419]">
                              <span aria-hidden>↳</span>
                              {n}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className={`relative shrink-0 px-5 pb-5 ${empty ? "pt-6" : "pt-0"}`}
      >
        {listening ? (
          <div className="flex items-center gap-3 border border-[#e4572e] bg-white/45 py-2 pl-2 pr-2">
            <button type="button" onClick={cancelRecording} aria-label="Cancel recording" className="grid h-9 w-9 shrink-0 place-items-center text-pigment-soft transition-colors hover:text-[#C44419]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            <div className="flex h-9 min-w-0 flex-1 items-center justify-center gap-[3px] overflow-hidden" aria-hidden="true">
              {Array.from({ length: 36 }).map((_, i) => (
                <span
                  key={i}
                  className="w-[2px] shrink-0 rounded-full bg-pigment-soft"
                  style={{ height: 22, animation: `rangaa-wave ${0.7 + ((i * 7) % 5) * 0.12}s ${((i * 13) % 9) * 0.08}s ease-in-out infinite` }}
                />
              ))}
            </div>
            <span className="shrink-0 font-mono text-sm tabular-nums text-pigment" aria-live="off">
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
            </span>
            <button type="button" onClick={toggleMic} aria-label="Finish and send" className="grid h-9 w-9 shrink-0 place-items-center bg-pigment text-white transition-colors hover:bg-[#C44419]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </button>
          </div>
        ) : (
        <div className={`flex items-center gap-2 border bg-white/45 py-2 pl-2 pr-3 transition-colors ${listening ? "border-[#e4572e]" : "border-rule focus-within:border-pigment-soft"}`}>
          {canSpeak && (
            <button
              type="button"
              onClick={toggleMic}
              aria-label={listening ? "Stop listening" : "Speak to Rangaa"}
              aria-pressed={listening}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-pigment transition-colors hover:bg-black/5"
            >
              <MicIcon listening={listening} />
            </button>
          )}
          <input
            ref={input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={listening ? "Listening…" : "Ask about Vishnu…"}
            aria-label="Ask Rangaa"
            maxLength={400}
            className="min-w-0 flex-1 bg-transparent py-1 text-[15px] outline-none placeholder:text-pigment-soft/80"
          />
          <button
            type="submit"
            disabled={!draft.trim() || busy}
            aria-label="Send"
            className="grid h-7 w-7 place-items-center text-pigment transition-opacity disabled:opacity-30"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" /></svg>
          </button>
        </div>
        )}
        {lastAssistant && <p className="sr-only" aria-live="polite">{lastAssistant.content}</p>}
      </form>
    </aside>
  );
}
