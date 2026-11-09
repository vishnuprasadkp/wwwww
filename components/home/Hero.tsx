import HeroFilm from "./HeroFilm";
import HeroInk from "./HeroInk";
import { SCHEMES, inkPalette } from "@/lib/painting";
import type { InkPalette } from "./HeroInk";

// the same dark grey painting as at the foot of the home page
const HERO_INK: InkPalette = inkPalette(SCHEMES.charcoal);
import LogoMarquee from "./LogoMarquee";

/**
 * The first screen: the painted film right under the header, full width; the introduction at the foot of the screen; the
 * client logos below it all.
 */
export default function Hero() {
  return (
    <section className="overflow-x-clip">
      <div className="flex min-h-[max(560px,calc(100svh-57px))] flex-col">
        <div className="relative" style={{ height: "clamp(240px, 21.7vw, 460px)", background: "#545454" }}>
          {/* the dark grey painting from the foot of the home page; the beetle film is drawn over it */}
          <HeroInk palette={HERO_INK} spread={false} refHeight={900} speed={1.6} />
          <HeroFilm />
        </div>
        <div className="flex flex-1 flex-col justify-end px-5 pb-10 pt-16 md:px-8">
          <div>
            <h1 className="font-serif text-[1.875rem] leading-[40px] md:text-[2.5rem] md:leading-[1.35]">I’m Vishnu</h1>
            <p className="mt-2 max-w-[35rem] text-[17px] leading-[26px] md:text-lg md:leading-[1.5]">
              A Product Designer with over 5 years of experience. I design experiences for the complex systems that run real work.
            </p>
          </div>
        </div>
      </div>
      <LogoMarquee />
    </section>
  );
}
