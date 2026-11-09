import Link from "next/link";
import Pic from "@/components/ui/Pic";
import type { CaseMeta } from "@/lib/cases";
import HeroInk from "@/components/home/HeroInk";
import HeroFilm from "@/components/home/HeroFilm";
import FilmShade from "@/components/home/FilmShade";
import { schemeForClosing, inkPalette } from "@/lib/painting";

/**
 * The end of a case study: the beetle film, as on the home page, painted in this case's own colours, where the closing
 * painting used to be; and below it the next projects.
 */
export default function NextProjects({ closing, next }: { closing: string; next: CaseMeta[] }) {
  const palette = inkPalette(schemeForClosing(closing));
  return (
    <div className="mt-16 md:mt-[160px] lg:mt-[292px]">
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(420px, 36vw, 680px)", background: `rgb(${palette.mid.map((v) => Math.round(v * 255)).join(",")})` }}>
        <HeroInk palette={palette} spread={false} refHeight={900} speed={1.6} grain={1} />
        <HeroFilm palette={palette} />
        <FilmShade />
      </div>
      <section className="mt-16 md:mt-[100px] lg:mt-[140px]">
        <div className="border-b border-rule px-5 pb-[22px] pt-[21px] md:px-8">
          <h2 className="font-serif text-[1.625rem] leading-[34px] md:text-[2rem] md:leading-[42px]">Next project</h2>
        </div>
        <ul className="mt-5 grid md:mt-8 gap-x-4 gap-y-12 px-5 lg:grid-cols-2 md:px-8">
          {next.map((c, i) => (
            <li key={c.slug} data-card className={i > 0 ? "hidden lg:block" : ""}>
              <Link href={`/work/${c.slug}`} data-cursor="view" className="group block">
                <div className="relative aspect-[680/411] w-full overflow-hidden">
                  <Pic file={`/images/next/${c.slug}.png`} sizes="(min-width: 1024px) calc(50vw - 24px), 100vw" fill />
                </div>
                <p data-card-title className="mt-4 text-[17px] leading-[26px] md:text-lg md:leading-[30px]">{c.title.replace(/\.$/, "")}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
