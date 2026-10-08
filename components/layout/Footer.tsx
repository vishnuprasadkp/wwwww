"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

// Home and About end on the painting; case studies end on the closing image + next projects.
const WITH_ART = ["/", "/about"];

export default function Footer() {
  const pathname = usePathname();
  const art = WITH_ART.includes(pathname);
  return (
    <footer className={art ? "mt-40 md:mt-60" : "mt-24 md:mt-[140px]"}>
      {art && (
        <div className="relative h-[420px] w-full md:h-[900px]">
          <Image src="/images/site/footer-bg.png" alt="" fill sizes="100vw" quality={90} className="object-cover" />
        </div>
      )}
      <div className={`flex flex-col justify-between gap-1 ${pathname === "/" ? "" : "border-t border-rule"} px-5 pb-[27px] pt-[26px] font-mono text-base leading-[26px] text-pigment-soft sm:flex-row md:px-8`}>
        <p>
          Lets Connect{" "}
          <a href={site.gmail} target="_blank" rel="noopener noreferrer" className="break-all hover:text-pigment">
            {site.email}
          </a>
        </p>
        <p>ⓒ {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
