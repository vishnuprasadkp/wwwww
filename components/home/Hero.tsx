import HeroFilmPanel from "./HeroFilmPanel";
import LogoMarquee from "./LogoMarquee";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { resumePdf } from "@/lib/site";

// the same grey painting as at the foot of the home page

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
        <h1 className="text-[17px] leading-[26px]">I&apos;m Vishnu, a Senior Product Designer.</h1>
      </div>
      <div className="grid gap-y-8 border-t border-rule px-5 pb-8 pt-8 md:grid-cols-2 md:gap-x-8 md:px-8">
        <div>
          <p className="max-w-[560px] font-serif text-[1.75rem] leading-[38px] md:text-[2rem] md:leading-[44px]">
            I design experiences for the complex systems that run real work.
          </p>
          <p className="mt-4 max-w-[560px] text-[17px] leading-[26px] text-pigment-soft">
            For the last five years I&apos;ve designed products for banks, governments and media companies, taking them from the first brief to something people use every day.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-10 gap-y-1">
            <ArrowLink href="/#cases" down>View work</ArrowLink>
            <ArrowLink href={resumePdf} download="Vishnu_Prasad_Resume_2026.pdf">Resume (PDF)</ArrowLink>
          </div>
        </div>
        {/* the film: click it and it opens out to fill the screen, with Nyrro's story */}
        <HeroFilmPanel height={FILM_H} />
      </div>
      <LogoMarquee />
    </section>
  );
}
