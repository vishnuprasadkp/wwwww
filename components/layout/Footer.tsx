"use client";

import Pic from "@/components/ui/Pic";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

// Home and About end on the painting; case studies end on the closing image + next projects.
const WITH_ART = ["/", "/about"];

export default function Footer() {
  const pathname = usePathname();
  const art = WITH_ART.includes(pathname);
  return (
    <footer className={art ? "mt-24 md:mt-40 lg:mt-60" : "mt-14 md:mt-[90px] lg:mt-[140px]"}>
      {art && (
        <div className="relative h-[420px] w-full md:h-[900px]">
          <Pic file="/images/site/footer-bg.png" sizes="100vw" fill />
        </div>
      )}
      <div className={`flex flex-col justify-between gap-1 md:flex-row ${pathname === "/" ? "" : "border-t border-rule"} px-5 pb-[27px] pt-[26px] font-mono text-base leading-[26px] text-pigment-soft sm:flex-row md:px-8`}>
        <p className="hidden md:block">
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
