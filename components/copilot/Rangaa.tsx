"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ state */

type Msg = { role: "user" | "assistant"; content: string; next?: string[] };
type Ctx = { open: boolean; toggle: () => void; close: () => void; show: () => void };
const RangaaCtx = createContext<Ctx>({ open: false, toggle: () => {}, close: () => {}, show: () => {} });
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
  const show = useCallback(() => setOpen(true), []);

  // Docked panel pushes the page over on wide screens (--rangaa is read by body padding in globals.css).
  useLayoutEffect(() => {
    const apply = () => {
      const wide = window.matchMedia("(min-width: 768px)").matches;
      document.documentElement.style.setProperty("--rangaa-dur", open ? "0.4s" : "0s"); // smooth in, instant out
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
    <RangaaCtx.Provider value={{ open, toggle, close, show }}>
      {children}
      <RangaaIntro />
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
      className={`flex items-center gap-2 font-mono text-base leading-[19px] text-pigment-soft transition-colors duration-300 hover:text-[#C44419] ${open ? "pointer-events-none invisible" : "visible"} ${className}`}
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

/* ------------------------------------------------------------------ intro */

/** Hello that appears under the header trigger on every fresh load, until it is closed or used. */
function RangaaIntro() {
  const { open, show } = useRangaa();
  const [gone, setGone] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setGone(false);
    const t = setTimeout(() => setReady(true), 1400);
    return () => clearTimeout(t);
  }, []);

  // Dismissal lives in memory only, so it comes back on the next load but not on every page change.
  const dismiss = useCallback(() => setGone(true), []);

  // Opening the copilot any other way counts as having seen it.
  useEffect(() => {
    if (open && !gone) dismiss();
  }, [open, gone, dismiss]);

  if (gone) return null;
  return (
    <div
      role="dialog"
      aria-label="Rangaa says hello"
      className={`fixed right-5 top-[68px] z-[45] w-[calc(100vw-40px)] max-w-[320px] border border-rule bg-[#efedeb] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] md:right-8 ${ready ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}`}
    >
      <span aria-hidden className="absolute -top-[7px] right-[106px] h-3 w-3 rotate-45 border-l border-t border-rule bg-[#efedeb] md:right-[42px]" />
      <button type="button" onClick={dismiss} aria-label="Close" className="absolute right-3 top-3 text-pigment-soft transition-colors hover:text-[#C44419]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
      </button>
      <p className="px-4 pb-4 pt-4 pr-10 text-[15px] leading-[24px] text-pigment">
        Hey! Rangaa here — Vishnu’s assistant and unofficial tour guide.
      </p>
      <button
        type="button"
        onClick={() => {
          dismiss();
          show();
        }}
        className="flex w-full items-center justify-between border-t border-rule px-4 py-3 font-mono text-base leading-[25px] text-pigment transition-colors hover:bg-black/[0.04] hover:text-[#C44419]"
      >
        <span className="flex items-center gap-2.5">
          <Sparkle size={15} />
          Show me around
        </span>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.73" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M 1.154 7.212 L 13.269 7.212 M 7.212 13.269 L 13.269 7.212 L 7.212 1.154" />
        </svg>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ panel */

type SR = {
  lang: string; interimResults: boolean; continuous: boolean;
  start: () => void; stop: () => void; abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null; onerror: ((e: unknown) => void) | null;
};

/** Live microphone loudness (0-1) sampled ~14x/second while `active`; drives the recording waveform. */
function useLevels(active: boolean, n = 44) {
  const [levels, setLevels] = useState<number[]>(() => Array(n).fill(0));
  useEffect(() => {
    if (!active) {
      setLevels(Array(n).fill(0));
      return;
    }
    let stream: MediaStream | undefined;
    let ctx: AudioContext | undefined;
    let raf = 0;
    let idle = 0;
    let stopped = false;
    const push = (v: number) => setLevels((l) => [...l.slice(1), v]);
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (stopped) return stream.getTracks().forEach((t) => t.stop());
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctx = new AC();
        await ctx.resume();
        const an = ctx.createAnalyser();
        an.fftSize = 512;
        ctx.createMediaStreamSource(stream).connect(an);
        const buf = new Uint8Array(an.fftSize);
        let last = 0;
        const tick = (t: number) => {
          raf = requestAnimationFrame(tick);
          if (t - last < 70) return;
          last = t;
          an.getByteTimeDomainData(buf);
          let sum = 0;
          for (const v of buf) sum += ((v - 128) / 128) ** 2;
          push(Math.min(1, Math.sqrt(sum / buf.length) * 9));
        };
        raf = requestAnimationFrame(tick);
      } catch {
        idle = window.setInterval(() => push(Math.random() * 0.35), 90); // mic level unavailable: gentle idle motion
      }
    })();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      clearInterval(idle);
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close();
    };
  }, [active, n]);
  return levels;
}

const plain = (t: string) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
const stopSpeaking = () => typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.cancel();

/** Best available natural-sounding voice: Indian English first, then other English voices. */
function pickVoice(): SpeechSynthesisVoice | undefined {
  const score = (v: SpeechSynthesisVoice) => {
    let n = 0;
    if (/en[-_]IN/i.test(v.lang)) n += 6;
    else if (/^en/i.test(v.lang)) n += 2;
    if (/rishi|ravi|male|prabhat|hemant/i.test(v.name)) n += 3;
    if (/google|natural|neural|premium|enhanced/i.test(v.name)) n += 2;
    if (v.localService) n += 1;
    return n;
  };
  return [...window.speechSynthesis.getVoices()].sort((a, b) => score(b) - score(a))[0];
}

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
  const byVoice = useRef(false);
  const mode = useRef<"send" | "keep" | "cancel">("keep");
  const speakRef = useRef<((i: number, t: string) => void) | null>(null);
  const levels = useLevels(listening);
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
    if (byVoice.current && finalText) {
      byVoice.current = false;
      speakRef.current?.(history.length, finalText);
    }
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
    // Speak sentence by sentence: long single utterances get cut off in Chrome.
    const parts = plain(text).split(/(?<=[.!?])\s+/).filter(Boolean);
    const voice = pickVoice();
    setSpeaking(i);
    parts.forEach((part, k) => {
      const u = new SpeechSynthesisUtterance(part);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      }
      u.rate = 0.98;
      u.onend = () => k === parts.length - 1 && setSpeaking((c) => (c === i ? null : c));
      u.onerror = () => setSpeaking(null);
      window.speechSynthesis.speak(u);
    });
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

  const stopRecording = (m: "send" | "keep" | "cancel") => {
    mode.current = m;
    if (m === "cancel") {
      heard.current = "";
      setDraft("");
      rec.current?.abort();
      setListening(false);
    } else rec.current?.stop();
  };

  const toggleMic = (seed = "") => {
    if (listening) return stopRecording("keep");
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = navigator.language || "en-US";
    r.interimResults = true;
    r.continuous = true;
    heard.current = seed;
    if (seed) setDraft(seed);
    cancelled.current = false;
    mode.current = "keep";
    r.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      t = (seed ? seed + " " : "") + t;
      heard.current = t;
      setDraft(t);
    };
    r.onend = () => {
      setListening(false);
      const t = heard.current.trim();
      if (mode.current === "send" && t) {
        byVoice.current = true;
        send(t);
      }
      else if (mode.current === "keep" && t) setDraft(t);
      else setDraft("");
    };
    r.onerror = () => setListening(false);
    rec.current = r;
    setListening(true);
    r.start();
  };

  speakRef.current = speak;

  const empty = messages.length === 0;
  const lastAssistant = messages.length ? messages[messages.length - 1] : null;

  return (
    <aside
      aria-label="Rangaa, Vishnu's AI assistant"
      aria-hidden={!open}
      className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-hidden border-l border-rule bg-white md:bg-transparent md:w-[min(29vw,440px)] ${open ? "translate-x-0 transition-transform duration-[400ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]" : "translate-x-full transition-none"}`}
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
                    <div className="-ml-2 mt-1 flex items-center text-pigment-soft">
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
        className={`relative shrink-0 px-5 pb-5 ${empty ? "pt-6" : "pt-8"}`}
      >
        {listening ? (
          <div className="border border-[#bcb6b3] bg-white/45 px-3 pb-3 pt-3">
            <p className="min-h-[24px] px-1 text-[15px] leading-[24px] text-pigment">
              {draft || <span className="text-pigment-soft/80">Listening…</span>}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button type="button" onClick={() => stopRecording("cancel")} aria-label="Cancel recording" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black/[0.07] text-pigment transition-colors hover:bg-black/[0.12]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
              <div className="flex h-10 min-w-0 flex-1 items-center justify-end gap-[3px] overflow-hidden px-1" aria-hidden="true">
                {levels.map((v, i) =>
                  v < 0.05 ? (
                    <span key={i} className="h-[3px] w-[3px] shrink-0 rounded-full bg-pigment/70" />
                  ) : (
                    <span key={i} className="w-[3px] shrink-0 rounded-full bg-pigment" style={{ height: 6 + v * 26 }} />
                  ),
                )}
              </div>
              <span className="shrink-0 font-mono text-xs tabular-nums text-pigment-soft" aria-live="off">
                {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
              </span>
              <button type="button" onClick={() => stopRecording("keep")} aria-label="Stop recording" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black/[0.07] text-pigment transition-colors hover:bg-black/[0.12]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
              </button>
              <button type="button" onClick={() => stopRecording("send")} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pigment text-white transition-colors hover:bg-black">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" /></svg>
              </button>
            </div>
          </div>
        ) : (
        <div className={`flex items-center gap-2 border bg-white/45 py-2 pl-2 pr-3 transition-colors ${listening ? "border-[#e4572e]" : "border-rule focus-within:border-pigment-soft"}`}>
          {canSpeak && (
            <button
              type="button"
              onClick={() => toggleMic()}
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
