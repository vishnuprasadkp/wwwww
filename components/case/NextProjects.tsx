import Link from "next/link";
import Image from "next/image";
import { getAsset } from "@/lib/assets";
import type { CaseMeta } from "@/lib/cases";

export default function NextProjects({ closing, next }: { closing: string; next: CaseMeta[] }) {
  return (
    <div className="mt-24 md:mt-[292px]">
      <div className="relative h-[420px] w-full md:h-[900px]">
        <Image src={getAsset(closing).file} alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <section className="mt-24 md:mt-[140px]">
        <div className="border-b border-rule px-5 pb-[22px] pt-[21px] md:px-8">
          <h2 className="font-serif text-4xl leading-[46px]">Next project</h2>
        </div>
        <ul className="mt-8 grid gap-x-4 gap-y-12 px-5 md:grid-cols-2 md:px-8">
          {next.map((c) => (
            <li key={c.slug}>
              <Link href={`/work/${c.slug}`} data-cursor="view" className="group block">
                <div className="relative aspect-[680/411] w-full overflow-hidden">
                  <Image src={`/images/next/${c.slug}.png`} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <p className="mt-4 text-xl leading-[30px]">{c.title.replace(/\.$/, "")}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
