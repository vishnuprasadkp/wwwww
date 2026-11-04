"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

// What moves. The same lists are in globals.css (the page holds these back until they are ready, so nothing flashes before it moves).
const HEADINGS = "h1, h2, h3, h4, .font-serif";
const BLOCKS = "p, dd, dt, li, figcaption, blockquote";

const html = () => document.documentElement;
const uniq = <T,>(a: T[]) => Array.from(new Set(a));

/**
 * The motion of the whole site, in one place, and nothing in it changes how anything looks once it has settled:
 *  - smooth, weighted scrolling (Lenis) wired into GSAP's ScrollTrigger;
 *  - headings come up line by line out of a mask, text and captions rise and fade in as they enter the screen, large pictures are
 *    uncovered from the top down as they arrive;
 *  - leaving a page the content eases out, and the next page's text and pictures move in.
 * It does nothing for visitors who ask for reduced motion (and the page is never held back for them), and if anything fails the page is let go.
 */
export default function Motion() {
  const pathname = usePathname();
  const router = useRouter();

  // the scrolling, and the way out of a page: once
  useEffect(() => {
    if (!html().hasAttribute("data-motion")) return;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1, anchors: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // not while the opening plays, nor while the full-screen assistant has the page
    const sync = () => {
      const h = html();
      if (h.hasAttribute("data-loading") || h.classList.contains("nivvi-full")) lenis.stop();
      else lenis.start();
    };
    sync();
    const watch = new MutationObserver(sync);
    watch.observe(html(), { attributes: true, attributeFilter: ["data-loading", "class"] });

    // leaving a page: the content eases out first, then the route changes
    let leaving = false;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || leaving) return;
      const a = (e.target as Element | null)?.closest("a");
      const href = a?.getAttribute("href");
      if (!a || !href || a.target === "_blank" || a.hasAttribute("download") || !href.startsWith("/") || href.startsWith("//")) return;
      const url = new URL(href, location.href);
      if (url.pathname === location.pathname) return; // the same page (an anchor): Lenis scrolls to it
      const main = document.querySelector("main");
      if (!main) return;
      e.preventDefault();
      leaving = true;
      gsap.to(main, {
        opacity: 0,
        y: -14,
        duration: 0.36,
        ease: "power2.in",
        onComplete: () => {
          router.push(href);
          window.setTimeout(() => {
            leaving = false;
            gsap.set(main, { clearProps: "opacity,transform" }); // in case the route never changed
          }, 2500);
        },
      });
    };
    document.addEventListener("click", onClick, true);

    // if the page was never set moving (something failed), let it go rather than leave it blank
    const guard = window.setTimeout(() => {
      if (!html().hasAttribute("data-motion-ready")) html().removeAttribute("data-motion");
    }, 14000);

    return () => {
      window.clearTimeout(guard);
      document.removeEventListener("click", onClick, true);
      watch.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.__lenis;
    };
  }, [router]);

  // each page: set its text and pictures moving as they come into view
  useEffect(() => {
    if (!html().hasAttribute("data-motion")) return;
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    const cleanups: (() => void)[] = [];

    const build = () => {
      const main = document.querySelector<HTMLElement>("main");
      if (!main) return;
      gsap.set(main, { clearProps: "opacity,transform" });

      // headings: line by line, up out of a mask
      const heads = uniq(Array.from(main.querySelectorAll<HTMLElement>(HEADINGS))).filter((el) => !el.closest("[data-no-motion]") && el.textContent?.trim());
      heads.forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, { yPercent: 115, duration: 1.1, ease: "power4.out", stagger: 0.09, scrollTrigger: { trigger: el, start: "top 92%", once: true } }),
        });
        el.style.visibility = "visible";
      });

      // text: rises and fades in, a few at a time, as it comes up the screen
      const headSet = new Set(heads);
      const all = Array.from(main.querySelectorAll<HTMLElement>(BLOCKS)).filter((el) => !headSet.has(el) && !el.closest(HEADINGS) && !el.closest("[data-no-motion]") && el.textContent?.trim());
      const outer = all.filter((el) => !all.some((o) => o !== el && o.contains(el)));
      // everything held back by the stylesheet that is not itself going to move (inside one that is moving, or with no text: a row of logos) is shown now
      Array.from(main.querySelectorAll<HTMLElement>(BLOCKS)).filter((el) => !outer.includes(el)).forEach((el) => (el.style.opacity = "1"));
      Array.from(main.querySelectorAll<HTMLElement>(HEADINGS)).filter((el) => !heads.includes(el)).forEach((el) => (el.style.visibility = "visible"));
      gsap.set(outer, { opacity: 0, y: 22 });
      ScrollTrigger.batch(outer, {
        start: "top 94%",
        once: true,
        batchMax: 8,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.95, ease: "power3.out", stagger: 0.07, overwrite: true }),
      });

      // pictures: uncovered from the top down as they arrive (small ones, logos and the moving strip, are left alone)
      Array.from(main.querySelectorAll<HTMLImageElement>("img")).forEach((img) => {
        const big = img.clientWidth > 240 && img.clientHeight > 120 && !img.closest('[class*="animate-marquee"]') && !img.closest("[data-no-motion]");
        if (!big) {
          img.style.opacity = "1";
          return;
        }
        gsap.fromTo(
          img,
          { clipPath: "inset(0% 0% 100% 0%)", opacity: 1, y: 36 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.3, ease: "power4.out", clearProps: "clipPath,transform", scrollTrigger: { trigger: img, start: "top 93%", once: true } },
        );
      });
    };

    const run = () => {
      if (cancelled) return;
      try {
        window.__lenis?.scrollTo(0, { immediate: true, force: true });
        ctx = gsap.context(build);
        html().setAttribute("data-motion-ready", "");
        ScrollTrigger.refresh();
      } catch {
        html().removeAttribute("data-motion"); // anything wrong: show the page as it is
      }
    };

    const h = html();
    if (h.hasAttribute("data-loading") && !h.hasAttribute("data-landing")) {
      // the opening is still playing: begin as the beetle comes in to land, so the page is written as it is uncovered
      const mo = new MutationObserver(() => {
        if (!h.hasAttribute("data-loading") || h.hasAttribute("data-landing")) {
          mo.disconnect();
          run();
        }
      });
      mo.observe(h, { attributes: true, attributeFilter: ["data-loading", "data-landing"] });
      cleanups.push(() => mo.disconnect());
    } else {
      const id = requestAnimationFrame(() => requestAnimationFrame(run));
      cleanups.push(() => cancelAnimationFrame(id));
    }

    return () => {
      cancelled = true;
      cleanups.forEach((f) => f());
      ctx?.revert();
    };
  }, [pathname]);

  return null;
}
