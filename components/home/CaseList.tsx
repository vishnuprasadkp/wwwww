import Link from "next/link";
import Pic from "@/components/ui/Pic";
import type { CaseMeta } from "@/lib/cases";

// Home-page thumbnails (1654px wide), keyed by case slug.
const THUMBS: Record<string, { src: string; w: number; h: number }> = {
  "enterprise-search": { src: "/images/home/search.png", w: 1654, h: 1286 },
  adeo: { src: "/images/home/adeo.png", w: 1654, h: 1600 },
  "ai-agent": { src: "/images/home/ai-agent.png", w: 1654, h: 1382 },
  hdfc: { src: "/images/home/hdfc.png", w: 1654, h: 1600 },
  sony: { src: "/images/home/sony.png", w: 1654, h: 1600 },
};

const rows = <T,>(a: T[]) => a.reduce<T[][]>((out, x, i) => (i % 2 ? out[out.length - 1].push(x) : out.push([x]), out), []);

/** Two-column case grid: thumbnail, title, then the tags in mono. */
export default function CaseList({ cases }: { cases: CaseMeta[] }) {
  return (
    <section className="pt-[120px] md:pt-[160px] lg:pt-[200px]">
      <h2 id="cases" className="border-b border-rule px-5 pb-5 pt-[21px] font-serif text-[1.625rem] leading-[34px] md:pb-[23px] md:pt-8 md:px-8 md:text-4xl md:leading-[46px]">Cases</h2>
      {/* the cases two to a row, with a line across the page between the rows (one to a row, and a line between each, on a phone) */}
      <ul className="mt-[19px] md:mt-[31px]">
        {rows(cases).map((row, r) => (
          <li key={r} className={r ? "border-t border-rule pt-12 md:pt-[44px]" : ""}>
            <ul className="grid items-start gap-x-4 px-5 md:grid-cols-2 md:px-8">
              {row.map((c, i) => {
                const t = THUMBS[c.slug];
                return (
                  <li key={c.slug} data-card className={`pb-12 md:pb-[44px] ${i ? "max-md:border-t max-md:border-rule max-md:pt-12" : ""}`}>
                    <Link href={`/work/${c.slug}`} data-cursor="view" className="group block">
                      {t && <Pic file={t.src} sizes="(min-width: 768px) calc(50vw - 24px), 100vw" className="h-auto w-full" />}
                      <h3 data-card-title className="mt-4 text-[17px] leading-[26px] md:text-lg md:leading-[1.5]">{c.title}</h3>
                      <p data-card-meta className="mt-1 font-mono text-sm leading-[22px] text-pigment-soft">{c.cardTags.join(" / ")}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
