import HeroFilm from "./HeroFilm";
import HeroInk from "./HeroInk";
import FilmShade from "./FilmShade";
import type { InkPalette } from "./HeroInk";
import LogoMarquee from "./LogoMarquee";

// the same grey painting as at the foot of the home page
// a deep charcoal wash with real movement in it: warm light grey and cool blue-grey shapes drifting through it, and deep
// shadow between them, so you feel the colour moving
const HERO_INK: InkPalette = {
  pale: [0.43, 0.415, 0.395], // warm light grey
  light: [0.325, 0.335, 0.35], // cool blue-grey
  mid: [0.243, 0.243, 0.247], // the ground
  deep: [0.135, 0.135, 0.142], // shadow
  grey: [0.31, 0.295, 0.28], // a warm grey that drifts through
};
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
      {/* the name, in the middle of the open space above the line */}
      <div className="flex flex-1 flex-col justify-center px-5 py-10 md:px-8" style={{ minHeight: 180 }}>
        <h1 className="text-[17px] leading-[26px]">I’m Vishnu</h1>
      </div>
      <div className="grid gap-y-8 border-t border-rule px-5 pb-8 pt-8 md:grid-cols-2 md:gap-x-8 md:px-8">
        <p className="max-w-[560px] font-serif text-[1.75rem] leading-[38px] md:text-[2rem] md:leading-[44px]">
          I design experiences for the complex systems that run real work.
        </p>
        <div className="relative overflow-hidden" style={{ height: FILM_H, background: "#3e3e3e" }}>
          {/* the grey painting; the beetle film is drawn over it */}
          <HeroInk palette={HERO_INK} spread={false} refHeight={520} speed={3} grain={1} /> {/* smaller shapes, flowing gently: the colour is seen to move */}
          {/* the beetle a little softer in the darker film */}
          <div className="absolute inset-0" style={{ opacity: 0.75 }}>
            <HeroFilm place="top" from="right" />
          </div>
          <FilmShade />
        </div>
      </div>
      <LogoMarquee />
    </section>
  );
}
