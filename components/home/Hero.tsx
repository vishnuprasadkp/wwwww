import HeroFilm from "./HeroFilm";
import HeroInk from "./HeroInk";
import { SCHEMES, inkPalette } from "@/lib/painting";
import type { InkPalette } from "./HeroInk";

// the AI agent case study's painting, a shade deeper: a darker orange behind the beetle
const deepen = (p: InkPalette, k: number): InkPalette => {
  const d = (c: [number, number, number]) => c.map((v) => v * k) as [number, number, number];
  return { pale: d(p.pale), light: d(p.light), mid: d(p.mid), deep: d(p.deep), grey: d(p.grey) };
};
const HERO_INK = deepen(inkPalette(SCHEMES.clay), 0.8);
import LogoMarquee from "./LogoMarquee";

export default function Hero() {
  return (
    <section className="flex min-h-[max(560px,calc(100svh-107px))] flex-col overflow-x-clip">
      <div className="flex flex-1 flex-col justify-end px-5 pb-10 pt-16 md:px-8">
        <div>
          <h1 className="font-serif text-[1.875rem] leading-[40px] md:text-[2.5rem] md:leading-[1.35]">I’m Vishnu.</h1>
          <p className="mt-2 max-w-[35rem] text-[17px] leading-[26px] md:text-lg md:leading-[1.5]">
            A Product Designer with over 5 years of experience. I design experiences for the complex systems that run real work.
          </p>
        </div>
      </div>
      <div className="relative" style={{ height: "clamp(260px, 24.5vw, 470px)", background: "#704833" }}>
        {/* the painting from the foot of the AI agent case study, exactly; the beetle film is drawn over it */}
        <HeroInk palette={HERO_INK} spread={false} refHeight={900} speed={1.6} />
        <HeroFilm />
      </div>
      <LogoMarquee />
    </section>
  );
}
