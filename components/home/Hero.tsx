import HeroFilm from "./HeroFilm";
import HeroInk from "./HeroInk";
import FilmShade from "./FilmShade";
import { SCHEMES, inkPalette } from "@/lib/painting";
import type { InkPalette } from "./HeroInk";
import LogoMarquee from "./LogoMarquee";

// the same grey painting as at the foot of the home page
const HERO_INK: InkPalette = inkPalette(SCHEMES.filmHero, 1.7);
// the film's height: a wide band in the right half, inside the page's margin
const FILM_H = "clamp(220px, 17.5vw, 340px)";

/**
 * The first screen, filled exactly: the name, small, at the top left; open space; then the line of what Vishnu does, large,
 * on the left, with the beetle film beside it in the right half (its top level with the text); and the client logos at the
 * very foot of the first view. The beetle flies into the film from the right.
 */
export default function Hero() {
  return (
    <section className="flex flex-col overflow-x-clip" style={{ minHeight: "calc(100svh - 57px)" }}>
      <h1 className="px-5 pt-[72px] text-[17px] leading-[26px] md:px-8">I’m Vishnu</h1>
      <div className="flex-1" style={{ minHeight: 120 }} />
      <div className="grid gap-y-8 px-5 pb-8 md:grid-cols-2 md:gap-x-8 md:px-8">
        <p className="max-w-[440px] font-serif text-[1.75rem] leading-[36px] md:text-[2rem] md:leading-[40px]">
          I design experiences for the complex systems that run real work.
        </p>
        <div className="relative overflow-hidden" style={{ height: FILM_H, background: "#525252" }}>
          {/* the grey painting; the beetle film is drawn over it */}
          <HeroInk palette={HERO_INK} spread={false} refHeight={900} speed={4} grain={1} />
          <HeroFilm place="top" from="right" />
          <FilmShade />
        </div>
      </div>
      <LogoMarquee />
    </section>
  );
}
