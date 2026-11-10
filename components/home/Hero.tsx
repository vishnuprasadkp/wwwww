import HeroFilm from "./HeroFilm";
import HeroInk from "./HeroInk";
import FilmShade from "./FilmShade";
import { SCHEMES, inkPalette } from "@/lib/painting";
import type { InkPalette } from "./HeroInk";
import LogoMarquee from "./LogoMarquee";

// the same grey painting as at the foot of the home page
const HERO_INK: InkPalette = inkPalette(SCHEMES.filmHero, 1.7);
// the film's height: on wide screens it fills the right half of its row
const FILM_H = "clamp(260px, 23vw, 480px)";

/**
 * The first screen, filled exactly: the name at the top left and the short description at the foot of the right half; a line;
 * then the longer line of text on the left and the beetle film filling the right half; and the client logos at the very foot
 * of the first view. The beetle flies into the film from the right.
 */
export default function Hero() {
  return (
    <section className="overflow-x-clip">
      <div
        className="flex flex-col justify-between px-5 pt-[72px] md:grid md:grid-cols-2 md:px-0"
        style={{ minHeight: `max(240px, calc(100svh - 57px - ${FILM_H} - 100px))`, paddingBottom: 57 }}
      >
        <h1 className="font-serif text-[1.875rem] leading-[40px] md:px-8 md:text-[2.5rem] md:leading-[1.35]">I’m Vishnu</h1>
        <p className="mt-10 max-w-[35rem] text-[17px] leading-[26px] md:col-start-2 md:mt-0 md:self-end md:pr-8 md:text-lg md:leading-[1.5]">
          A Product Designer with over 5 years of experience.
        </p>
      </div>
      <div className="grid border-t border-rule md:grid-cols-2">
        <p className="px-5 pb-8 pt-[56px] text-[17px] leading-[26px] md:px-8 md:text-lg md:leading-[1.5]">
          I design experiences for the complex systems that run real work.
        </p>
        <div className="relative h-[260px] md:h-auto" style={{ background: "#525252" }}>
          <div className="hidden md:block" style={{ height: FILM_H }} />
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
