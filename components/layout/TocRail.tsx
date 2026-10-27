"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Item = { title: string; level: 1 | 2; target: HTMLElement };

/**
 * "On this page" rail for case studies and About, attached to the right edge.
 * At rest: a column of hairlines, one per main section (the dark one is where you are).
 * On hover/focus the lines open into a table of contents: numbered main headings with their
 * sub-headings nested underneath.
 */
export default function TocRail() {
  const pathname = usePathname();
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    setItems([]);
    setActive(0);
    if (!pathname.startsWith("/work/") && pathname !== "/about") return;
    const scan = () => {
      const found: Item[] = [...document.querySelectorAll<HTMLElement>("main [data-toc], main [data-toc-sub]")]
        .map((el) => {
          const main = el.hasAttribute("data-toc");
          const title = (el.getAttribute(main ? "data-toc" : "data-toc-sub") || "").trim();
          const target = (main ? (el.querySelector("h1, h2, p, div") as HTMLElement) : el) || el;
          return { title, level: (main ? 1 : 2) as 1 | 2, target };
        })
        .filter((i) => i.title);
      setItems(found.filter((i) => i.level === 1).length > 1 ? found : []);
    };
    const t = setTimeout(scan, 250);
    return () => clearTimeout(t);
  }, [pathname]);

  // The entry in view: the last one whose heading has passed 40% of the viewport.
  useEffect(() => {
    if (!items.length) return;
    const update = () => {
      let cur = 0;
      items.forEach((it, i) => {
        if (it.target.getBoundingClientRect().top < window.innerHeight * 0.4) cur = i;
      });
      setActive(cur);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, [items]);

  if (!items.length) return null;

  const go = (it: Item) => {
    const y = it.target.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  };

  // Which main section the active entry belongs to (drives the collapsed lines).
  let activeMain = 0;
  items.slice(0, active + 1).forEach((it, i) => it.level === 1 && (activeMain = i));

  let n = 0;
  const open = "group-hover:opacity-100 group-focus-within:opacity-100";
  return (
    <nav
      aria-label="On this page"
      className="group fixed top-1/2 z-30 hidden -translate-y-1/2 md:block"
      style={{ right: "var(--rangaa, 0px)", transition: "right 0.4s cubic-bezier(0.2,0.8,0.2,1)" }}
    >
      <ul className="flex max-h-[78vh] flex-col items-end overflow-hidden border-y border-l border-transparent py-3 pl-3 pr-0 transition-[background-color,border-color,padding] duration-300 ease-out group-hover:border-rule group-hover:bg-[#efedeb]/95 group-hover:px-4 group-hover:py-[9px] group-focus-within:border-rule group-focus-within:bg-[#efedeb]/95 group-focus-within:px-4 group-focus-within:py-[9px] hover:overflow-y-auto">
        {items.map((it, i) => {
          const on = i === active;
          if (it.level === 1) {
            n += 1;
            const here = i === activeMain;
            return (
              <li key={`${i}-${it.title}`} className="w-full">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    go(it);
                  }}
                  aria-current={on ? "location" : undefined}
                  className="flex items-center justify-end py-1 transition-[padding] duration-300 group-hover:py-[7px] group-focus-within:py-[7px]"
                >
                  {/* hairline at rest, bullet when open */}
                  <span
                    aria-hidden
                    className={`block shrink-0 rounded-full transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] h-[2px] w-4 ${here ? "bg-pigment" : "bg-pigment/25"} group-hover:h-[2px] group-hover:w-0 group-hover:opacity-0 group-focus-within:h-[2px] group-focus-within:w-0 group-focus-within:opacity-0`}
                  />
                  <span className={`flex h-0 w-0 items-baseline gap-2.5 overflow-hidden whitespace-nowrap opacity-0 transition-[width,height,opacity,margin,color] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:h-[22px] group-hover:w-[256px] ${open} group-focus-within:h-[22px] group-focus-within:w-[256px] ${on ? "text-[#C44419]" : "text-pigment hover:text-[#C44419]"}`}>
                    <span className="shrink-0 font-mono text-[12px] text-pigment-soft">{String(n).padStart(2, "0")}</span>
                    <span className="truncate text-[15px] leading-[22px]">{it.title}</span>
                  </span>
                </a>
              </li>
            );
          }
          return (
            <li key={`${i}-${it.title}`} className="h-0 w-0 overflow-hidden opacity-0 transition-[height,width,opacity] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:h-[28px] group-hover:w-[256px] group-hover:opacity-100 group-focus-within:h-[28px] group-focus-within:w-[256px] group-focus-within:opacity-100">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  go(it);
                }}
                aria-current={on ? "location" : undefined}
                tabIndex={-1}
                className={`flex w-[256px] items-center gap-2 py-[3px] pl-[26px] text-[15px] leading-[22px] transition-colors ${on ? "text-[#C44419]" : "text-pigment-soft hover:text-pigment"}`}
              >
                <span aria-hidden className="shrink-0">↳</span>
                <span className="block min-w-0 flex-1 truncate">{it.title}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
