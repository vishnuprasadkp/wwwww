"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Item = { title: string; el: HTMLElement; target: HTMLElement };

/**
 * "On this page" rail for case studies and About. At rest it is a column of thin lines on the right
 * edge (the bright one is where you are). Hover or focus it and the lines melt into the section titles.
 */
export default function TocRail() {
  const pathname = usePathname();
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(0);
  const raf = useRef(0);

  // Collect the page's sections (marked with data-toc) after every navigation.
  useEffect(() => {
    setItems([]);
    setActive(0);
    if (!pathname.startsWith("/work/") && pathname !== "/about") return;
    const scan = () => {
      const found: Item[] = [...document.querySelectorAll<HTMLElement>("main [data-toc]")]
        .map((el) => {
          const title = (el.getAttribute("data-toc") || "").trim();
          const target = (el.querySelector("h1, h2, p, div") as HTMLElement) || el;
          return { title, el, target };
        })
        .filter((i) => i.title);
      setItems(found.length > 1 ? found : []);
    };
    const t = setTimeout(scan, 250);
    return () => clearTimeout(t);
  }, [pathname]);

  // Which section is in view (the last one whose heading has passed 40% of the viewport).
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

  if (items.length < 2) return null;

  const go = (it: Item) => {
    const y = it.target.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  };

  return (
    <nav
      aria-label="On this page"
      className="group fixed top-1/2 z-30 hidden -translate-y-1/2 lg:block"
      style={{ right: "calc(var(--rangaa, 0px) + 14px)", transition: "right 0.4s cubic-bezier(0.2,0.8,0.2,1)" }}
    >
      <ul className="flex flex-col items-end border border-transparent px-3 py-3 transition-[background-color,border-color,backdrop-filter] duration-300 ease-out group-hover:border-rule group-hover:bg-[#efedeb]/95 group-hover:backdrop-blur-sm group-focus-within:border-rule group-focus-within:bg-[#efedeb]/95">
        {items.map((it, i) => {
          const on = i === active;
          return (
            <li key={it.title + i} className="w-full">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  go(it);
                }}
                aria-current={on ? "location" : undefined}
                className="flex items-center justify-end py-[7px]"
              >
                {/* the thin line (collapsed) turns into a bullet (expanded) */}
                <span
                  aria-hidden
                  className={`block shrink-0 rounded-full transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] h-[2px] ${on ? "w-7 bg-pigment" : "w-5 bg-pigment/25"} group-hover:h-[6px] group-hover:w-[6px] group-focus-within:h-[6px] group-focus-within:w-[6px] ${on ? "group-hover:bg-[#C44419] group-focus-within:bg-[#C44419]" : "group-hover:bg-transparent group-focus-within:bg-transparent"}`}
                />
                <span
                  className={`block w-0 truncate text-left text-[15px] leading-[22px] opacity-0 transition-[width,opacity,margin,color] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:ml-3 group-hover:w-[230px] group-hover:opacity-100 group-focus-within:ml-3 group-focus-within:w-[230px] group-focus-within:opacity-100 ${on ? "text-[#C44419]" : "text-pigment-soft hover:text-pigment"}`}
                >
                  {it.title}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
