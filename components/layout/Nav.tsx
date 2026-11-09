"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site";
import { NivviButton, useNivvi } from "@/components/copilot/Nivvi";
import { LOGO_D, LOGO_VIEWBOX } from "@/lib/logo";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";
  const links = nav;

  useEffect(() => setOpen(false), [pathname]);
  const nivvi = useNivvi();
  useEffect(() => {
    if (nivvi.open) setOpen(false); // the full-screen chat replaces the phone menu
  }, [nivvi.open]);

  return (
    <header id="header" className="relative z-40">
      <nav
        aria-label="Main"
        className="relative grid h-[57px] grid-cols-2 border-b border-rule pt-[3px] items-center gap-4 px-5 font-mono text-[15px] leading-[19px] text-pigment-soft md:px-8"
      >
        {isHome ? (
          <Link href="/" aria-label="Home" className="justify-self-start transition-colors duration-300 hover:text-pigment">
            {/* the "vp." signature, in the header's own colour */}
            <svg width="30" height="30" viewBox={LOGO_VIEWBOX} fill="currentColor" aria-hidden="true" className="block">
              <path d={LOGO_D} />
            </svg>
          </Link>
        ) : (
          <Link
            href="/"
            aria-label="Back to home"
            className="flex w-min items-center gap-[10px] justify-self-start px-0 transition-[gap,padding,color] duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] hover:gap-1 hover:px-[3px] hover:text-pigment"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M 14.25 9 L 3.75 9 M 9 14.25 L 3.75 9 L 9 3.75" />
            </svg>
            <span>Back</span>
          </Link>
        )}

        <div className="hidden items-center md:flex">
          <ul className="flex items-center gap-6">
            {links.map((item) => (
              <li key={item.label}>
                <NavLink {...item} active={pathname === item.href} />
              </li>
            ))}
          </ul>
        </div>

        <NivviButton className="absolute right-[84px] top-1/2 -translate-y-1/2 md:right-8" />

        <button
          type="button"
          className="justify-self-end md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open && (
        <ul id="mobile-menu" className="font-mono text-pigment-soft md:hidden">
          {nav.map((item) => (
            <li key={item.label} className="border-b border-rule">
              <NavLink {...item} active={pathname === item.href} className="block px-5 py-4 text-[15px]" />
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

function NavLink({
  label, href, external, active, className = "",
}: { label: string; href: string; external?: boolean; active?: boolean; className?: string }) {
  const cls = `${className} transition-colors duration-300 hover:text-pigment ${active ? "text-pigment" : ""}`;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{label}</a>
  ) : (
    <Link href={href} className={cls} aria-current={active ? "page" : undefined}>{label}</Link>
  );
}
