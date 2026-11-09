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
// a picture eases up into place while it fades in, the same way every time: no mask, no drift while it is scrolled
const COVERED = { opacity: 0, y: 40 };
const REVEAL = { opacity: 1, y: 0, duration: 1.4, ease: "expo.out", clearProps: "transform" };

let pendingHash = ""; // an anchor on the page we are going to ("#cases"): the new page opens at its top, then glides there

const target = (hash: string) => (hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null);
// a gentle in-and-out glide, longer for a longer way (never abrupt at either end)
const glide = (el: HTMLElement) => {
  const lenis = window.__lenis;
  if (!lenis) return el.scrollIntoView({ behavior: "smooth" });
  const far = Math.abs(el.getBoundingClientRect().top);
  lenis.scrollTo(el, { duration: Math.min(2.4, Math.max(1.2, far / 1100)), easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2) });
};

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
    const lenis = new Lenis({ lerp: 0.14, smoothWheel: true, anchors: true });
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
      if (url.pathname === location.pathname) {
        // the same page: glide to the anchor (the router would jump there)
        const el = target(url.hash);
        if (el) {
          e.preventDefault();
          glide(el);
          history.pushState(null, "", url.pathname + url.search + url.hash);
        }
        return;
      }
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
          pendingHash = url.hash;
          router.push(url.pathname + url.search); // without the anchor, which the router would jump to; we glide to it when the page is up
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

      // the opening of every page (its h1 and the text in the first screen: label, title, description) arrives line by line, up out of a
      // mask, softly blurred, the title first and the rest a beat behind it. Text further down is simply there.
      const caseStudy = location.pathname.startsWith("/work/"); // there only the title is blurred; the rest of the opening just rises
      const about = location.pathname === "/about"; // there the right half (the description beside the title) is simply there
      const opening = (el: HTMLElement) =>
        !el.closest("[data-no-motion]") && !!el.textContent?.trim() && el.getBoundingClientRect().top < innerHeight * 0.9 && !(about && innerWidth >= 768 && el.getBoundingClientRect().left > innerWidth * 0.45);
      // on About only the main heading moves; the description (at every width) is simply there, no rise and no blur
      const heads = uniq(Array.from(main.querySelectorAll<HTMLElement>(HEADINGS))).filter((el) => el.matches("h1") ? !el.closest("[data-no-motion]") && !!el.textContent?.trim() : !about && opening(el));
      const blocks = about ? [] : Array.from(main.querySelectorAll<HTMLElement>(BLOCKS)).filter((el) => opening(el) && !el.closest(HEADINGS) && !el.querySelector(`${BLOCKS}, ${HEADINGS}, img`));
      [...heads, ...blocks]
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left)
        .forEach((el, i) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, { yPercent: 100, ...(!caseStudy || el.matches("h1") ? { filter: "blur(6px)", clearProps: "filter" } : {}), duration: 0.8, ease: "expo.out", stagger: 0.08, delay: Math.min(i, 4) * 0.12, scrollTrigger: { trigger: el, start: "top 98%", once: true }, onComplete: () => self.revert() }), // the text goes back to flowing freely (a panel opening, a resize) once it has arrived
          });
          el.style.visibility = "visible";
        });
      // whatever the stylesheet holds back that does not move is shown at once
      Array.from(main.querySelectorAll<HTMLElement>(`${HEADINGS}, ${BLOCKS}`)).filter((el) => !heads.includes(el) && !blocks.includes(el)).forEach((el) => (el.style.visibility = "visible"));

      // cards (the case list, the next projects): the picture arrives once it is in hand (the text under it does not move)
      Array.from(main.querySelectorAll<HTMLElement>("[data-card]")).forEach((card) => {
        const img = card.querySelector<HTMLImageElement>("img");
        const parts: gsap.core.Tween[] = [];
        const play = () => parts.forEach((t) => t.play());
        if (img) parts.push(gsap.fromTo(img, COVERED, { ...REVEAL, paused: true }));
        ScrollTrigger.create({ trigger: card, start: "top 88%", once: true, onEnter: () => void (img ? ready(img).then(play) : play()) });
      });

      // pictures: uncovered from the top down as they arrive (small ones, logos and anything in a moving strip, the painting ticker included, are left alone)
      Array.from(main.querySelectorAll<HTMLImageElement>("img")).forEach((img) => {
        const big = img.clientWidth > 240 && img.clientHeight > 120 && !img.closest('[class*="animate-"]') && !img.closest("[data-no-motion]");
        if (img.closest("[data-card]")) return; // arrives with its card
        if (!big) {
          img.style.opacity = "1";
          return;
        }
        const tw = gsap.fromTo(img, COVERED, { ...REVEAL, paused: true });
        ScrollTrigger.create({ trigger: img, start: "top 92%", once: true, onEnter: () => void ready(img).then(() => tw.play()) });
      });
    };

    const run = () => {
      if (cancelled) return;
      try {
        window.__lenis?.scrollTo(0, { immediate: true, force: true });
        ctx = gsap.context(build);
        html().setAttribute("data-motion-ready", "");
        if (pendingHash) {
          const hash = pendingHash;
          pendingHash = "";
          const t = window.setTimeout(() => {
            const el = target(hash);
            if (el) {
              glide(el);
              history.replaceState(null, "", location.pathname + location.search + hash);
            }
          }, 700);
          cleanups.push(() => window.clearTimeout(t));
        }
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
