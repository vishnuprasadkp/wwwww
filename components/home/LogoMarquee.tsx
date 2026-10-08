import Image from "next/image";
import { getAsset } from "@/lib/assets";

// Client logos at the exact sizes they have on the Framer site (width x height, px).
const LOGOS: [string, number, number][] = [
  ["logo-01", 142, 35], ["logo-02", 124, 36], ["logo-03", 155, 26], ["logo-04", 90, 35],
  ["logo-05", 148, 35], ["logo-06", 165, 36], ["logo-07", 36, 36], ["logo-08", 121, 36],
  ["logo-09", 102, 31], ["logo-10", 316, 36], ["logo-11", 70, 36],
];

/** Client logos in a 100px band, scrolling left at 120px/s on every screen size (40px gaps on phones, 80px above). */
export default function LogoMarquee() {
  const logo = ([id, w, h]: [string, number, number], dup = false) => {
    const a = getAsset(id);
    return (
      <li key={`${id}-${dup}`} className="shrink-0" aria-hidden={dup || undefined}>
        <Image src={a.file} width={w} height={h} alt={dup ? "" : a.alt} style={{ width: w, height: h }} className="max-w-none" />
      </li>
    );
  };

  return (
    <section aria-label="Clients" className="flex h-[100px] items-center overflow-hidden border-y border-rule">
      <ul className="flex w-max flex-nowrap items-center gap-x-10 pr-10 animate-[marquee_15.9s_linear_infinite] md:gap-x-20 md:pr-20 md:animate-[marquee_19.6s_linear_infinite]">
        {LOGOS.map((l) => logo(l))}
        {LOGOS.map((l) => logo(l, true))}
      </ul>
    </section>
  );
}
