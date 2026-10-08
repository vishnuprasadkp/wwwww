import Image from "next/image";
import { getAsset } from "@/lib/assets";

// Client logos at the exact sizes they have on the Framer site (width x height, px).
const LOGOS: [string, number, number][] = [
  ["logo-01", 142, 35], ["logo-02", 124, 36], ["logo-03", 155, 26], ["logo-04", 90, 35],
  ["logo-05", 148, 35], ["logo-06", 165, 36], ["logo-07", 36, 36], ["logo-08", 121, 36],
  ["logo-09", 102, 31], ["logo-10", 316, 36], ["logo-11", 70, 36],
];

/** Client logos: 80px apart, scrolling left on desktop; a wrapped grid on mobile. */
export default function LogoMarquee() {
  const logo = ([id, w, h]: [string, number, number], hidden = false) => {
    const a = getAsset(id);
    return (
      <li key={`${id}-${hidden}`} className={`shrink-0 ${hidden ? "hidden md:block" : ""}`} aria-hidden={hidden || undefined}>
        <Image src={a.file} width={w} height={h} alt={hidden ? "" : a.alt} style={{ width: w, height: h }} className="max-w-none" />
      </li>
    );
  };

  return (
    <section aria-label="Clients" className="border-y border-rule py-8 md:flex md:h-[100px] md:items-center md:overflow-hidden md:py-0">
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 px-5 md:w-max md:flex-nowrap md:gap-x-20 md:px-0 md:pr-20 md:animate-[marquee_19.6s_linear_infinite]">
        {LOGOS.map((l) => logo(l))}
        {LOGOS.map((l) => logo(l, true))}
      </ul>
    </section>
  );
}
