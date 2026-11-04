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
// a picture is only uncovered once it is loaded and decoded, so it never pops in half-drawn
const ready = (img: HTMLImageElement) => (img.complete && img.naturalWidth ? img.decode() : new Promise<void>((r) => (img.onload = () => r()))).catch(() => undefined);
// a picture eases up into place while it fades in; there is no mask, so its edges are never cut
const COVERED = { opacity: 0, y: 56 };
const REVEAL = { opacity: 1, y: 0, duration: 1.5, ease: "expo.out", clearProps: "transform" };

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
    // lenis.dev's own setting: the library's defaults (lerp 0.1), nothing exaggerated
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true });
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
      const heads = uniq(Array.from(main.querySelectorAll<HTMLElement>(HEADINGS))).filter((el) => !el.closest("[data-no-motion]") && !el.closest("[data-card]") && el.textContent?.trim());
      heads.forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, { yPercent: 100, duration: 1.2, ease: "expo.out", stagger: 0.2, scrollTrigger: { trigger: el, start: "top 92%", once: true } }),
        });
        el.style.visibility = "visible";
      });

      // text: rises and fades in, a few at a time, as it comes up the screen
      const headSet = new Set(heads);
      const all = Array.from(main.querySelectorAll<HTMLElement>(BLOCKS)).filter((el) => !headSet.has(el) && !el.closest(HEADINGS) && !el.closest("[data-no-motion]") && !el.closest("[data-card]") && el.textContent?.trim());
      const outer = all.filter((el) => !all.some((o) => o !== el && o.contains(el)));
      // everything held back by the stylesheet that is not itself going to move (inside one that is moving, or with no text: a row of logos) is shown now
      Array.from(main.querySelectorAll<HTMLElement>(BLOCKS)).filter((el) => !outer.includes(el) && !el.hasAttribute("data-card-meta")).forEach((el) => (el.style.opacity = "1"));
      Array.from(main.querySelectorAll<HTMLElement>(HEADINGS)).filter((el) => !heads.includes(el)).forEach((el) => (el.style.visibility = "visible"));
      gsap.set(outer, { opacity: 0, y: 28 });
      ScrollTrigger.batch(outer, {
        start: "top 94%",
        once: true,
        batchMax: 8,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.1, overwrite: true, clearProps: "transform" }),
      });

      // cards (the case list, the next projects): the picture, the title and the tag line arrive as one piece, a beat apart,
      // once the picture is in hand
      Array.from(main.querySelectorAll<HTMLElement>("[data-card]")).forEach((card) => {
        const img = card.querySelector<HTMLImageElement>("img");
        const title = card.querySelector<HTMLElement>("[data-card-title]");
        const meta = card.querySelector<HTMLElement>("[data-card-meta]");
        const parts: gsap.core.Tween[] = [];
        let go = false;
        const play = () => {
          go = true;
          parts.forEach((t) => t.play());
        };
        if (img) parts.push(gsap.fromTo(img, COVERED, { ...REVEAL, paused: true }));
        const lines = (el: HTMLElement, delay: number) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit: (self) => {
              const t = gsap.from(self.lines, { yPercent: 100, duration: 1.2, ease: "expo.out", stagger: 0.2, delay, paused: !go });
              parts.push(t);
              return t;
            },
          });
          el.style.visibility = "visible";
          el.style.opacity = "1";
        };
        if (title) lines(title, 0.4);
        if (meta) lines(meta, 0.65);
        ScrollTrigger.create({ trigger: card, start: "top 88%", once: true, onEnter: () => void (img ? ready(img).then(play) : play()) });
      });

      // pictures: uncovered from the top down as they arrive (small ones, logos and the moving strip, are left alone)
      Array.from(main.querySelectorAll<HTMLImageElement>("img")).forEach((img) => {
        const big = img.clientWidth > 240 && img.clientHeight > 120 && !img.closest('[class*="animate-marquee"]') && !img.closest("[data-no-motion]");
        if (img.closest("[data-card]")) return; // arrives with its card
        if (!big) {
          img.style.opacity = "1";
          return;
        }
        const drift = getComputedStyle(img).position !== "absolute"; // pictures that fill a clipped frame stay put
        const tw = gsap.fromTo(img, COVERED, {
          ...REVEAL,
          paused: true,
          onComplete: () => {
            if (drift) gsap.fromTo(img, { y: 12 }, { y: -12, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: 0.6 } });
          },
        });
        ScrollTrigger.create({ trigger: img, start: "top 92%", once: true, onEnter: () => void ready(img).then(() => tw.play()) });
      });
    };

    const run = () => {
      if (cancelled) return;
      try {
        window.__lenis?.scrollTo(0, { immediate: true, force: true });
        ctx = gsap.context(build);
        html().setAttribute("data-motion-ready", "");
        ScrollTrigger.refresh();
        // pictures that arrive late push the page down: measure again so each trigger sits where its card really is
        const again = () => ScrollTrigger.refresh();
        window.addEventListener("load", again);
        const t = window.setTimeout(again, 1200);
        cleanups.push(() => {
          window.removeEventListener("load", again);
          window.clearTimeout(t);
        });
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
