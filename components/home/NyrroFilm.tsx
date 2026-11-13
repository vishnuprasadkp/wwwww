"use client";

import { useEffect } from "react";
import Link from "next/link";
import HeroFilm from "./HeroFilm";
import HeroInk from "./HeroInk";
import { NYRRO_INK } from "@/lib/painting";

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
    <div className="fixed inset-0 z-[60] overflow-hidden" style={{ background: "#2b3531" }}>
      <HeroInk palette={NYRRO_INK} spread={false} refHeight={700} speed={3} grain={1} />
      <div className="absolute inset-0" style={{ opacity: 0.8 }}>
        <HeroFilm place="top" from="right" full />
      </div>

      <Link href="/" className="absolute left-5 top-5 z-10 flex items-center gap-2 font-mono text-[15px] leading-[19px] text-white/80 transition-colors hover:text-white md:left-8 md:top-8">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        Back
      </Link>

      {/* the story: in the right half, its left edge on the centre line (as the hero film is), in the lower part of the screen */}
      <section aria-label="About Nyrro" className="absolute bottom-[8%] left-5 right-5 z-10 text-white md:bottom-[14%] md:left-1/2 md:right-8">
        <h1 className="font-serif text-[22px] leading-[30px] md:text-[26px] md:leading-[34px]">Nyrro: Nature in Colour</h1>
        <p className="mt-4 text-[15px] leading-6 text-white/85">
          I&rsquo;d never really paid much attention to beetles before. But while working on this portfolio, one caught my eye and made me curious to explore their little world. The more I looked into them, the more I discovered some fascinating things about their natural defence mechanisms, from the oily droplets of oil beetles to the chemical spray of bombardier beetles, which can leave traces of their own.
        </p>
        <p className="mt-3 text-[15px] leading-6 text-white/85">
          That sparked an idea: what if a tiny creature left its own trail wherever it wandered, like a paintbrush moving across a canvas? That&rsquo;s how Nyrro came to life: part observation, part imagination, and a little expression of my love for nature, painting, and creative exploration.
        </p>
      </section>
    </div>
  );
}
