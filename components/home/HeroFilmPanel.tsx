"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HeroFilm from "./HeroFilm";
import HeroInk from "./HeroInk";
import FilmShade from "./FilmShade";
import NyrroStory from "./NyrroStory";
import { HERO_INK } from "@/lib/painting";

const EASE = "cubic-bezier(0.76, 0, 0.24, 1)"; // slow away, quick through the middle, slow to settle
const GROW_MS = 1150;

type State = "closed" | "opening" | "open" | "closing";

// while the film fills the screen, wheel, touch and the scrolling keys do nothing to the page behind it
const block = (e: Event) => {
  if (e instanceof KeyboardEvent && !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) return;
  e.preventDefault();
};

/**
 * The beetle film in the hero. Click it and the very same film (it never stops or restarts) opens out from its place on the
 * page until it fills the screen, the beetle flying on through it; then Nyrro's story rises in at the foot. Back (the
 * button, the browser's back, or Escape) and the story sinks away and the film closes back into its place.
 */
export default function HeroFilmPanel({ height }: { height: string }) {
  const slot = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("closed");
  const stateRef = useRef<State>(state);
  stateRef.current = state;
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  // the page stays still behind the film (its scrollbar is left as it is, so nothing on the page reflows): wheel, touch and
  // the scrolling keys do nothing while the film fills the screen
  const lock = (on: boolean) => {
    const opts = { passive: false, capture: true } as AddEventListenerOptions;
    for (const type of ["wheel", "touchmove", "keydown"]) {
      if (on) window.addEventListener(type, block, opts);
      else window.removeEventListener(type, block, opts);
    }
    document.documentElement.classList.toggle("film-full", on); // (the smooth scrolling holds still while this is on)
  };
  const place = (el: HTMLElement, r: { top: number; left: number; width: number; height: number }) => {
    el.style.top = `${r.top}px`;
    el.style.left = `${r.left}px`;
    el.style.width = `${r.width}px`;
    el.style.height = `${r.height}px`;
  };
  const glide = (el: HTMLElement) => {
    el.style.transition = ["top", "left", "width", "height"].map((p) => `${p} ${GROW_MS}ms ${EASE}`).join(", ");
  };

  const open = () => {
    const el = film.current;
    const box = slot.current;
    if (!el || !box || stateRef.current !== "closed") return;
    // lifted out of the page exactly where it is, then opened out to the whole screen
    el.style.transition = "none";
    el.style.position = "fixed";
    el.style.right = "auto";
    el.style.bottom = "auto";
    el.style.zIndex = "70";
    place(el, box.getBoundingClientRect());
    void el.offsetWidth;
    glide(el);
    place(el, { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight });
    lock(true);
    window.history.pushState(window.history.state, "", "#nyrro");
    setState("opening");
    later(() => {
      if (stateRef.current !== "opening") return;
      el.style.transition = "none";
      el.style.width = "100vw";
      el.style.height = "100dvh";
      setState("open");
    }, GROW_MS);
  };

  const close = useCallback(() => {
    const el = film.current;
    const box = slot.current;
    if (!el || !box || (stateRef.current !== "open" && stateRef.current !== "opening")) return;
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setState("closing");
    // the story sinks away first, then the film closes back into its place on the page
    later(() => {
      el.style.width = `${el.getBoundingClientRect().width}px`;
      el.style.height = `${el.getBoundingClientRect().height}px`;
      void el.offsetWidth;
      glide(el);
      place(el, box.getBoundingClientRect());
      later(() => {
        el.style.transition = "";
        for (const p of ["position", "top", "left", "right", "bottom", "width", "height", "zIndex"] as const) el.style[p] = "";
        lock(false);
        setState("closed");
      }, GROW_MS);
    }, 380);
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
      timers.current.forEach((id) => window.clearTimeout(id));
      if (stateRef.current !== "closed") lock(false);
    };
  }, [close]);

  const wide = state === "opening" || state === "open";
  return (
    <div ref={slot} className="relative" style={{ height }}>
      <div
        ref={film}
        role={state === "closed" ? "link" : undefined}
        tabIndex={state === "closed" ? 0 : -1}
        aria-label={state === "closed" ? "Open the Nyrro film" : "Nyrro film"}
        data-cursor={state === "closed" ? "view" : undefined}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        className={`absolute inset-0 overflow-hidden ${state === "closed" ? "cursor-pointer" : ""}`}
        style={{ background: "#3e3e3e" }}
      >
        {/* the grey painting; the beetle film is drawn over it */}
        <HeroInk palette={HERO_INK} spread={false} refHeight={520} speed={3} grain={1} />
        <div className="absolute inset-0" style={{ opacity: wide ? 0.8 : 0.75, transition: "opacity 1s ease" }}>
          <HeroFilm place="top" from="right" wide={wide} />
        </div>
        <FilmShade />

        {/* opened out: the way back, and Nyrro's story rising in at the foot */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            window.history.back();
          }}
          tabIndex={state === "open" ? 0 : -1}
          className="absolute left-5 top-5 z-10 flex items-center gap-2 font-mono text-[15px] leading-[19px] text-white/80 hover:text-white md:left-8 md:top-8"
          style={{ opacity: state === "open" ? 1 : 0, pointerEvents: state === "open" ? "auto" : "none", transition: "opacity 0.6s ease" }}
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
