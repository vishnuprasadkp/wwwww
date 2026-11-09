import HeroFilm from "./HeroFilm";
import HeroInk from "./HeroInk";
import { SCHEMES, inkPalette } from "@/lib/painting";
import type { InkPalette } from "./HeroInk";

// the same dark grey painting as at the foot of the home page
const HERO_INK: InkPalette = inkPalette(SCHEMES.charcoal);
import LogoMarquee from "./LogoMarquee";

/**
 * The first screen, filled exactly: the name at the top, the description below with open space between, the painted film,
 * and the client logos sitting at the very foot of the first view.
 */
export default function Hero() {
  return (
    // the film is as tall as the one at the foot of the page (so the beetle is framed exactly as there), as far as the
    // screen allows while still leaving room for the introduction above and the logos below
    <section className="overflow-x-clip" style={{ ["--film" as string]: "min(clamp(420px, 36vw, 680px), max(260px, calc(100svh - 57px - 100px - 210px)))" }}>
      <div className="flex flex-col justify-between px-5 pt-12 md:px-8" style={{ minHeight: "max(210px, calc(100svh - 57px - var(--film) - 100px))", paddingBottom: 36 }}>
        <h1 className="font-serif text-[1.875rem] leading-[40px] md:text-[2.5rem] md:leading-[1.35]">I’m Vishnu</h1>
        <p className="mt-10 max-w-[35rem] text-[17px] leading-[26px] md:text-lg md:leading-[1.5]">
          A Product Designer with over 5 years of experience. I design experiences for the complex systems that run real work.
        </p>
      </div>
      <div className="relative" style={{ height: "var(--film)", background: "#545454" }}>
        {/* the dark grey painting from the foot of the home page; the beetle film is drawn over it */}
        <HeroInk palette={HERO_INK} spread={false} refHeight={900} speed={1.6} grain={1} />
        <HeroFilm />
      </div>
      <LogoMarquee />
    </section>
  );
}
