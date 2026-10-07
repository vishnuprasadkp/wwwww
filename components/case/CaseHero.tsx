import Img from "@/components/ui/Img";
import type { CaseMeta } from "@/lib/cases";

export default function CaseHero({ meta }: { meta: CaseMeta }) {
  const rows = [
    ["Client", meta.client],
    ["Platform", meta.platform],
    ["Timeline", meta.timeline],
    ["My role", meta.role],
  ];

  return (
    <header>
      <div className="grid gap-4 border-b border-rule px-5 pb-[27px] pt-[74px] md:grid-cols-2 md:px-8">
        <div>
          <p className="font-mono text-base leading-[26px] text-pigment-soft md:max-w-[40rem]">{meta.tags.join(" / ")}</p>
          <h1 className="mt-2.5 font-serif text-[2.5rem] leading-[54px] md:max-w-[40rem]">{meta.title}</h1>
        </div>
        <p className="text-base leading-[26px] md:mt-[60px] md:max-w-[40rem]">{meta.summary}</p>
      </div>

      <figure className="mt-8 px-5 md:px-8">
        <Img id={meta.hero} priority />
      </figure>

      <dl className="mt-8 grid px-5 md:-mb-[43px] md:pl-8 md:pr-0 grid-cols-2 gap-y-8 md:grid-cols-4">
        {rows.map(([k, v]) => (
          <div key={k} className="pr-4">
            <dt className="font-mono text-base leading-[26px] text-pigment-soft">{k}</dt>
            <dd className="mt-1 whitespace-pre-line text-base leading-[26px]">{v}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
