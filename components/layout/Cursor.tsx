"use client";

import { useEffect, useRef, useState } from "react";

// the arrow is for the projects' cards and the hero film only; everywhere else, links and buttons included, the dot
const CLICKABLE = "[data-cursor='view']";

/**
 * The pointer. Over the page: a small plain black dot, links and buttons included. Over the projects' cards and the hero film: a Figma-style
 * arrow in place of the dot (flat, the site's near-black with a white outline and a soft shadow), its tip exactly at the pointer. The system's own pointer is never shown. Mouse/trackpad only.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const arrow = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [press, setPress] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    // the dot and the arrow glide after the pointer (a short, smooth catch-up) rather than jumping with it
    const to = { x: 0, y: 0 };
    const at = { x: 0, y: 0 };
    let raf = 0;
    let last = 0;
    let started = false;
    const place = () => {
      const t = `translate3d(${at.x}px, ${at.y}px, 0)`;
      if (dot.current) dot.current.style.transform = `${t} translate(-50%, -50%)`;
      if (arrow.current) arrow.current.style.transform = t;
    };
    const tick = (now: number) => {
      const dt = Math.min(64, now - (last || now));
      last = now;
      const k = 1 - Math.exp(-dt / 45); // ~45ms to close most of the gap, whatever the frame rate
      at.x += (to.x - at.x) * k;
      at.y += (to.y - at.y) * k;
      place();
      if (Math.abs(to.x - at.x) > 0.1 || Math.abs(to.y - at.y) > 0.1) raf = requestAnimationFrame(tick);
      else {
        at.x = to.x;
        at.y = to.y;
        place();
        raf = 0;
        last = 0;
      }
    };
    const move = (e: PointerEvent) => {
      to.x = e.clientX;
      to.y = e.clientY;
      if (!started) {
        started = true;
        at.x = to.x;
        at.y = to.y;
        place();
      } else if (!raf) raf = requestAnimationFrame(tick);
      setShown(true);
      const el = e.target as Element | null;
      // (text fields keep the dot)
      setPress(!!el?.closest?.(CLICKABLE));
    };
    const leave = () => setShown(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  const only = "pointer-events-none fixed left-0 top-0 z-[200] hidden [@media(hover:hover)_and_(pointer:fine)]:block";
  return (
    <>
      {/* the dot: plain black, everywhere */}
      <div ref={dot} aria-hidden className={`${only} h-[9px] w-[9px]`} style={{ opacity: shown && !press ? 1 : 0, transition: "opacity 0.18s", willChange: "transform" }}>
        <span
          className="block h-[9px] w-[9px] rounded-full bg-[#393636] transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
          style={{ transform: press ? "scale(0.3)" : "scale(1)" }}
        />
      </div>
      {/* the arrow: the site's near-black, a white outline round it and a soft shadow under it, so it reads on the light
          page and on the dark films alike; its tip at the pointer */}
      <div ref={arrow} aria-hidden className={only} style={{ opacity: shown && press ? 1 : 0, transition: "opacity 0.18s", willChange: "transform" }}>
        <svg
          width="28"
          height="28"
          viewBox="0 0 26 26"
          overflow="visible"
          className="transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
          style={{ transform: `translate(-2px, -2px) ${press ? "scale(1)" : "scale(0.6)"}`, transformOrigin: "2px 2px", filter: "drop-shadow(0 1.5px 2.5px rgb(57 54 54 / 0.28))" }}
        >
          <path d="M2 2 L24 11.6 L13.9 14.1 L10.3 24.4 Z" fill="#393636" stroke="#fff" strokeWidth="5" strokeLinejoin="round" paintOrder="stroke" />
        </svg>
      </div>
    </>
  );
}
