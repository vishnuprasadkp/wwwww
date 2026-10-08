"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site";

const LOGO_PATH =
  "M 11.878 25.95 L 21.918 25.95 C 22.301 25.95 22.679 25.867 23.026 25.706 C 23.696 25.396 24.205 24.82 24.43 24.118 L 25.418 21.039 M 13.262 21.435 L 23.302 21.435 C 23.685 21.435 24.063 21.352 24.41 21.191 C 25.079 20.881 25.589 20.305 25.814 19.603 L 26.802 16.524 M 1.075 3.182 L 5.593 17.939 C 6.08 19.53 8.333 19.53 8.821 17.939 L 13.338 3.182 C 13.671 2.097 12.859 1 11.725 1 L 2.689 1 C 1.554 1 0.743 2.097 1.075 3.182 Z M 19.329 5.307 L 22.612 5.307 C 23 5.307 23.392 5.43 23.614 5.749 C 24.952 7.67 24.477 12.486 20.035 12.486 L 18.046 12.486 C 16.892 12.486 16.078 11.353 16.447 10.259 L 17.729 6.456 C 17.961 5.77 18.604 5.307 19.329 5.307 Z M 14.185 18.179 L 10.876 28.112 C 10.512 29.205 11.325 30.333 12.477 30.333 L 19.963 30.333 C 21.512 30.333 22.879 29.323 23.333 27.843 L 27.806 13.281 C 27.977 12.726 27.951 12.705 27.741 13.246 C 27.221 14.588 25.987 17.025 23.128 17.025 L 15.786 17.025 C 15.059 17.025 14.414 17.49 14.185 18.179 Z";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";
  const links = nav;

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header id="header" className="relative z-40 border-b border-rule">
      <nav
        aria-label="Main"
        className="grid h-[56px] grid-cols-2 pt-[3px] items-center gap-4 px-5 font-mono text-base leading-[19px] text-pigment-soft md:px-8"
      >
        {isHome ? (
          <Link href="/" aria-label="Home" className="justify-self-start transition-colors duration-300 hover:text-pigment">
            <svg width="29" height="32" viewBox="0 0 29 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" aria-hidden="true">
              <path d={LOGO_PATH} />
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
        <ul id="mobile-menu" className="border-t border-rule px-5 pb-6 font-mono md:hidden">
          {nav.map((item) => (
            <li key={item.label} className="border-b border-rule/60">
              <NavLink {...item} active={pathname === item.href} className="block py-4 text-base" />
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
