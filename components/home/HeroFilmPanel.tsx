"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import HeroFilm, { type FilmFrame } from "./HeroFilm";
import HeroInk from "./HeroInk";
import NyrroStory from "./NyrroStory";
import { HERO_INK } from "@/lib/painting";

const OPEN_MS = 1400;
// slow away, sweeping through the middle, slow to settle
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

type State = "closed" | "opening" | "open" | "closing";
type Rect = { left: number; top: number; width: number; height: number };

// while the film fills the screen, wheel, touch and the scrolling keys do nothing to the page behind it
const block = (e: Event) => {
  if (e instanceof KeyboardEvent && !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) return;
  e.preventDefault();
};

/**
 * The beetle film in the hero. The film is really as large as the screen, laid over the top of the page, and you see it
 * through a window: the box in the hero. Click it and that window opens out until it is the whole screen. Nothing in the
 * film moves or restarts as it does: the colour and the beetle stay exactly where they are on your screen, and more and
 * more of the film comes into view around them. Then
 * Nyrro's story rises in at the foot. Back (the button, the browser's back, or Escape): the story sinks away and the
 * window closes down onto the box again.
 */
export default function HeroFilmPanel({ height }: { height: string }) {
  const slot = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const frameRef = useRef<FilmFrame>({ x0: -1, x1: 1, y0: -1, y1: 1 });
  const [size, setSize] = useState<{ W: number; H: number; w: number; h: number } | null>(null);
  const [state, setState] = useState<State>("closed");
  const stateRef = useRef<State>(state);
  stateRef.current = state;
  const prog = useRef(0); // 0: the box; 1: the whole screen
  const anim = useRef(0);

  // the box, and the screen, in the page
  const measure = () => {
    const el = slot.current!;
    const r = el.getBoundingClientRect();
    const W = document.documentElement.clientWidth;
    const H = window.innerHeight;
    return { W, H, box: { left: r.left + window.scrollX, top: r.top + window.scrollY, width: r.width, height: r.height } as Rect };
  };

  // lays the film over the top of the page (or over the screen, open), with its window between the box and the screen
  const apply = useCallback(() => {
    const st = stage.current;
    const el = slot.current;
    if (!st || !el) return;
    const { W, H, box } = measure();
    const p = ease(prog.current);
    const fixed = stateRef.current !== "closed";
    st.style.position = fixed ? "fixed" : "absolute";
    // closed, it sits at the top of the page, which scrolls with it; open, at the top of the screen (the page is at its top)
    st.style.left = fixed ? "0px" : `${-box.left}px`;
    st.style.top = fixed ? "0px" : `${-box.top}px`;
    st.style.width = `${W}px`;
    st.style.height = `${H}px`;
    st.style.zIndex = fixed ? "70" : "0";
    st.style.pointerEvents = stateRef.current === "open" ? "auto" : "none";
    const top = box.top * (1 - p);
    const left = box.left * (1 - p);
    const right = (W - box.left - box.width) * (1 - p);
    const bottom = (H - box.top - box.height) * (1 - p);
    const round = Math.sin(Math.PI * p) * 18; // its corners soften as it opens, and square up again at the edges of the screen
    st.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${round}px)`;
    frameRef.current = { x0: (left / W) * 2 - 1, x1: 1 - (right / W) * 2, y1: 1 - (top / H) * 2, y0: (bottom / H) * 2 - 1, hh0: box.height / H };
    if (dim.current) dim.current.style.opacity = String(p);
  }, []);

  // measured once it is on the page: the film is made for this screen, and drawn as large as in a film the box's size
  useLayoutEffect(() => {
    const { W, H, box } = measure();
    setSize({ W, H, w: box.width, h: box.height });
  }, []);
  useLayoutEffect(() => {
    apply();
  }, [size, state, apply]);
  useEffect(() => {
    const ro = new ResizeObserver(() => apply());
    if (slot.current) ro.observe(slot.current);
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, [apply]);

  const lock = (on: boolean) => {
    const opts = { passive: false, capture: true } as AddEventListenerOptions;
    for (const type of ["wheel", "touchmove", "keydown"]) {
      if (on) window.addEventListener(type, block, opts);
      else window.removeEventListener(type, block, opts);
    }
    document.documentElement.classList.toggle("film-full", on); // (the smooth scrolling holds still while this is on)
  };

  const run = (to: 0 | 1, done: () => void) => {
    cancelAnimationFrame(anim.current);
    const from = prog.current;
    const t0 = performance.now();
    const dur = OPEN_MS * Math.abs(to - from);
    const tick = (now: number) => {
      const u = dur ? Math.min(1, (now - t0) / dur) : 1;
      prog.current = from + (to - from) * u;
      apply();
      if (u < 1) anim.current = requestAnimationFrame(tick);
      else done();
    };
    anim.current = requestAnimationFrame(tick);
  };

  const open = () => {
    if (stateRef.current !== "closed") return;
    const go = () => {
      lock(true);
      window.history.pushState(window.history.state, "", "#nyrro");
      stateRef.current = "opening";
      setState("opening");
      run(1, () => {
        stateRef.current = "open";
        setState("open");
      });
    };
    // from the top of the page (where the film is), so it opens from just where you see it
    if (window.scrollY > 1 && window.__lenis) window.__lenis.scrollTo(0, { duration: 0.6, onComplete: go });
    else go();
  };

  const close = useCallback(() => {
    if (stateRef.current !== "open" && stateRef.current !== "opening") return;
    const wasOpen = stateRef.current === "open";
    stateRef.current = "closing";
    setState("closing");
    // the story sinks away first, then the window closes down onto the box
    window.setTimeout(
      () =>
        run(0, () => {
          stateRef.current = "closed";
          setState("closed");
          lock(false);
        }),
      wasOpen ? 420 : 0,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onPop = () => {
      if (location.hash !== "#nyrro") close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stateRef.current === "open") window.history.back();
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(anim.current);
      if (stateRef.current !== "closed") lock(false);
    };
  }, [close]);

  const wide = state === "opening" || state === "open";
  // the wash's shapes at the size they have in the box, on the whole screen
  const inkScale = size ? Math.min(1, Math.max(0.2, size.h / 520)) * (size.H / Math.max(1, size.h)) : 1;
  return (
    <div
      ref={slot}
      role="link"
      tabIndex={0}
      aria-label="Open the Nyrro film"
      data-cursor={state === "closed" ? "view" : undefined}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className="relative"
      style={{ height, background: "#3e3e3e" }}
    >
      {/* the page darkens to the film's colour behind it as it opens */}
      <div ref={dim} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[69]" style={{ background: "#3e3e3e", opacity: 0, display: state === "closed" ? "none" : "block" }} />
      <div ref={stage} className="overflow-hidden" style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, pointerEvents: "none", background: "#3e3e3e" }} onClick={(e) => e.stopPropagation()}>
        {size && (
          <>
            {/* the grey painting; the beetle film is drawn over it */}
            <HeroInk palette={HERO_INK} spread={false} speed={3} grain={1} fixedScale={inkScale} />
            <div className="absolute inset-0" style={{ opacity: 0.75 }}>
              <HeroFilm place="top" from="right" wide={wide} frameRef={frameRef} box={{ w: size.w, h: size.h }} />
            </div>
          </>
        )}

        {/* opened out: the way back, and Nyrro's story rising in at the foot */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            window.history.back();
          }}
          tabIndex={state === "open" ? 0 : -1}
          className="absolute left-5 top-5 z-10 flex items-center gap-2 font-mono text-[15px] leading-[19px] text-white/80 hover:text-white md:left-8 md:top-8"
          style={{ opacity: state === "open" ? 1 : 0, transform: state === "open" ? "none" : "translateY(-6px)", pointerEvents: state === "open" ? "auto" : "none", transition: "opacity 0.6s ease 0.3s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          Back
        </button>
        <NyrroStory shown={state === "open"} heading="h2" />
      </div>
    </div>
  );
}
