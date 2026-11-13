"use client";

import { useEffect } from "react";
import Link from "next/link";
import HeroFilm from "./HeroFilm";
import HeroInk from "./HeroInk";
import NyrroStory from "./NyrroStory";
import { HERO_INK } from "@/lib/painting";

/**
 * The beetle film on its own: it fills the screen, whatever its size, with the moving colour of the hero's film and the one
 * beetle flying through all of it. Nyrro's story sits at the top right. The page does not scroll.
 */
export default function NyrroFilm() {
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    window.__lenis?.stop();
    return () => {
      html.style.overflow = before;
      window.__lenis?.start();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden" style={{ background: "#3e3e3e" }}>
      <HeroInk palette={HERO_INK} spread={false} refHeight={700} speed={3} grain={1} />
      <div className="absolute inset-0" style={{ opacity: 0.8 }}>
        <HeroFilm place="top" from="right" full />
      </div>

      <Link href="/" className="absolute left-5 top-5 z-10 flex items-center gap-2 font-mono text-[15px] leading-[19px] text-white/80 transition-colors hover:text-white md:left-8 md:top-8">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        Back
      </Link>

      <NyrroStory />
    </div>
  );
}
