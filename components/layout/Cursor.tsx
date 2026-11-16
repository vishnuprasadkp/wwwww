"use client";

import { useEffect, useRef, useState } from "react";

const CLICKABLE = "a, button, [role='button'], [role='link'], [data-cursor='view'], label, select, summary";

/**
 * The pointer. Over the page: a small dot, drawn white and inverting what is under it, so it is dark over the light page
 * and light over the dark films. Over anything you can press (links, buttons, the projects, the film): a Figma-style
 * arrow in place of the dot, its tip exactly at the pointer. The system's own pointer is never shown. Mouse/trackpad only.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const arrow = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [press, setPress] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const t = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (dot.current) dot.current.style.transform = `${t} translate(-50%, -50%)`;
      if (arrow.current) arrow.current.style.transform = t;
      setShown(true);
      const el = e.target as Element | null;
      // (text fields keep the dot)
      setPress(!!el?.closest?.(CLICKABLE) && !el?.closest?.("input, textarea, [contenteditable='true']"));
    };
    const leave = () => setShown(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  const only = "pointer-events-none fixed left-0 top-0 z-[200] hidden [@media(hover:hover)_and_(pointer:fine)]:block";
  return (
    <>
      {/* the dot: white, inverting what is under it */}
      <div ref={dot} aria-hidden className={`${only} h-3 w-3 mix-blend-difference`} style={{ opacity: shown && !press ? 1 : 0, transition: "opacity 0.18s", willChange: "transform" }}>
        <span
          className="block h-3 w-3 rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
          style={{ transform: press ? "scale(0.3)" : "scale(1)" }}
        />
      </div>
      {/* the arrow, Figma's pointer: a pale, bevelled arrowhead with a soft shadow, its tip at the pointer */}
      <div ref={arrow} aria-hidden className={only} style={{ opacity: shown && press ? 1 : 0, transition: "opacity 0.18s", willChange: "transform" }}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
          style={{ transform: `translate(-3px, -2px) ${press ? "scale(1)" : "scale(0.6)"}`, transformOrigin: "3px 2px", filter: "drop-shadow(0 1.5px 2px rgba(0,0,0,0.35))" }}
        >
          <defs>
            <linearGradient id="cursor-face" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#dfe2e8" />
            </linearGradient>
          </defs>
          <path d="M3 2 L21 10.6 L12.6 12.6 L9.2 21 Z" fill="url(#cursor-face)" stroke="#a9adb5" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M4.4 4.3 L18 10.8 L11.8 12.1" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeLinejoin="round" opacity="0.9" />
        </svg>
      </div>
    </>
  );
}
