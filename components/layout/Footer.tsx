"use client";

import HeroInk from "@/components/home/HeroInk";
import HeroFilm from "@/components/home/HeroFilm";
import FilmShade from "@/components/home/FilmShade";
import NyrroNote from "@/components/layout/NyrroNote";
import { SCHEMES, inkPalette, scheme, type Scheme } from "@/lib/painting";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

// Home and About: the right half is a lighter grey than the film beside it
const STONE: Scheme = scheme("stone", "#727272", "#fafafa", "#585858", "#9c9c9c");
// every case study: the right half in the Enterprise Search blue-grey, a little deeper
const CASE_PANEL: Scheme = scheme("mistDeep", "#7d919a", "#f7f9fa", "#4e5f65", "#c4d3d9");

/**
 * Every page ends on two halves: the beetle film on the left (the grey painting, the beetle flying through it) and a painted
 * panel on the right with the contact line at its top and the copyright at its foot. On Home and About the panel is grey;
 * on a case study it is painted in that case's colour. On the home page the beetle flies in from the top right corner, as if
 * it had carried on from the film at the top of the page.
 */
export default function Footer() {
  const pathname = usePathname();
  const panel = pathname.startsWith("/work/") ? CASE_PANEL : STONE;
  const art = pathname === "/" || pathname === "/about";
  return (
    <footer className={art ? "mt-24 md:mt-40 lg:mt-60" : "mt-14 md:mt-[90px] lg:mt-[140px]"}>
      {/* as tall as the film at the top of the home page */}
      <div className="grid md:grid-cols-2 md:[height:clamp(260px,23vw,480px)]">
        <div className="relative h-[260px] overflow-hidden md:h-auto" style={{ background: "#474747" }}>
          <HeroInk palette={inkPalette(SCHEMES.film, 1.7)} spread={false} refHeight={900} speed={4} grain={1} />
          <HeroFilm from={pathname === "/" ? "top-right" : undefined} />
          <FilmShade />
          {art && <NyrroNote />}
        </div>
        <div className="relative flex min-h-[220px] flex-col justify-between overflow-hidden p-5 font-mono text-[15px] leading-[24px] text-white md:p-8" style={{ background: panel.bg }}>
          <HeroInk key={panel.name} palette={inkPalette(panel, 1.7)} spread={false} refHeight={900} speed={4} grain={1} /> {/* the colours visibly flow and spread */}
          <p className="relative">
            Lets Connect{" "}
            <a href={site.gmail} target="_blank" rel="noopener noreferrer" className="break-all underline-offset-4 hover:underline">
              {site.email}
            </a>
          </p>
          <p className="relative self-end text-right">ⓒ {new Date().getFullYear()} Vishnu Prasad K P</p>
        </div>
      </div>
    </footer>
  );
}
