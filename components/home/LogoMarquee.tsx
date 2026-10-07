import Image from "next/image";
import { getAsset } from "@/lib/assets";

const LOGOS = Array.from({ length: 11 }, (_, i) => `logo-${String(i + 1).padStart(2, "0")}`);

/** Client logos. Scrolling strip on desktop; a static wrapped grid on mobile. */
export default function LogoMarquee() {
  const logo = (id: string, hidden = false) => {
    const a = getAsset(id);
    return (
      <li key={`${id}-${hidden}`} className={`flex h-8 items-center md:h-10 ${hidden ? "hidden md:flex" : ""}`} aria-hidden={hidden || undefined}>
        <Image src={a.file} width={a.w} height={a.h} alt={hidden ? "" : a.alt} className="h-full w-auto opacity-60 grayscale" />
      </li>
    );
  };

  return (
    <section aria-label="Clients" className="border-y border-rule py-8 md:flex md:h-[100px] md:items-center md:overflow-hidden md:py-0">
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-6 px-6 md:w-max md:max-w-none md:flex-nowrap md:gap-x-16 md:px-0 md:pr-16 md:animate-marquee">
        {LOGOS.map((id) => logo(id))}
        {LOGOS.map((id) => logo(id, true))}
      </ul>
    </section>
  );
}
