"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HeroFilm from "./HeroFilm";
import HeroInk from "./HeroInk";
import NyrroStory from "./NyrroStory";
import SoundToggle from "./SoundToggle";
import { ambience } from "@/lib/ambience";
import { fullScreenHeight } from "@/lib/screen";
import { HERO_INK } from "@/lib/painting";

/**
 * The beetle film on its own: it fills the screen, whatever its size, with the moving colour of the hero's film and the one
 * beetle flying through all of it. Nyrro's story sits at the top right. The page does not scroll.
 */
export default function NyrroFilm() {
  // the hero's film, opened out: the wash's shapes at the size they have in the hero's box on this screen, and the
  // beetle at the size it comes to there once the film fills the screen
  const [hero, setHero] = useState<{ w: number; h: number; ink: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const W = document.documentElement.clientWidth;
    const H = window.innerHeight;
    const h = Math.min(340, Math.max(220, W * 0.175));
    const w = W >= 768 ? (W - 64 - 32) / 2 : W - 40;
    setHero({ w, h, ink: Math.min(1, Math.max(0.2, h / 520)) * (H / h) });
  }, []);
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    window.__lenis?.stop();
    // the film reaches the very foot of the screen (on a phone the page is drawn under the browser's bars)
    const fit = () => {
      if (box.current) box.current.style.height = `${fullScreenHeight()}px`;
    };
    fit();
    html.classList.add("film-full");
    window.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("resize", fit);
    // its sound: at once if you came here by a click, otherwise from your first touch or key
    const a = ambience();
    a.start();
    const off = a.resumeOnGesture();
    return () => {
      off();
      a.stop();
      html.classList.remove("film-full");
      window.removeEventListener("resize", fit);
      window.visualViewport?.removeEventListener("resize", fit);
      html.style.overflow = before;
      window.__lenis?.start();
    };
  }, []);

  return (
    <div ref={box} className="fixed left-0 right-0 top-0 z-[60] h-[100lvh] overflow-hidden" style={{ background: "#3e3e3e" }}>{/* (the full screen, a phone's browser bar hidden or not) */}
      {hero && (
        <>
          <HeroInk palette={HERO_INK} spread={false} speed={3} grain={1} fixedScale={hero.ink} />
          <div className="absolute inset-0" style={{ opacity: 0.75 }}>
            <HeroFilm place="top" from="right" full />
          </div>
        </>
      )}

      {/* the header's Back: the arrow and the word draw together as you point at it */}
      <Link href="/" className="absolute left-5 top-5 z-10 flex w-min items-center gap-[10px] px-0 font-mono text-[15px] leading-[19px] text-white/80 transition-[gap,padding,color] duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] hover:gap-1 hover:px-[3px] hover:text-white md:left-8 md:top-8">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M 14.25 9 L 3.75 9 M 9 14.25 L 3.75 9 L 9 3.75" />
        </svg>
        <span>Back</span>
      </Link>

      <SoundToggle />
      <NyrroStory />
    </div>
  );
}
