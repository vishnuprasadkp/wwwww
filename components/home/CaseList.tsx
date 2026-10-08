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

/** Two-column case grid: thumbnail, title, then the tags in mono. */
export default function CaseList({ cases }: { cases: CaseMeta[] }) {
  return (
    <section className="pt-[120px] md:pt-[160px] lg:pt-[200px]">
      <h2 id="cases" className="border-b border-rule px-5 pb-5 pt-[21px] font-serif text-[1.625rem] leading-[34px] md:pb-[23px] md:pt-8 md:px-8 md:text-4xl md:leading-[46px]">Cases</h2>
      <ul className="grid items-start gap-x-4 mt-[31px] gap-y-12 px-5 md:grid-cols-2 md:gap-y-[85px] md:px-8">
        {cases.map((c) => {
          const t = THUMBS[c.slug];
          return (
            <li key={c.slug}>
              <Link href={`/work/${c.slug}`} data-cursor="view" className="group block">
                {t && (
                  <Pic file={t.src} sizes="(min-width: 768px) calc(50vw - 24px), 100vw" className="h-auto w-full" />
                )}
                <h3 className="mt-4 text-lg leading-[28px] md:text-xl md:leading-[1.5]">{c.title}</h3>
                <p className="mt-1 font-mono text-base leading-[1.625] text-pigment-soft md:mt-0">{c.cardTags.join(" / ")}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
