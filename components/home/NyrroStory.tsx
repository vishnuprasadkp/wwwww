"use client";

import { useEffect, useState } from "react";

/**
 * Nyrro's story, over the film: in the right half of the screen, its left edge on the centre line, low down. Each line rises
 * softly into place, one after another; when `shown` goes false they sink away together.
 */
export default function NyrroStory({ shown = true, heading: H = "h1" }: { shown?: boolean; heading?: "h1" | "h2" }) {
  // on the Nyrro page itself it rises in once the page is there
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const on = shown && ready;
  const line = (i: number): React.CSSProperties => ({
    opacity: on ? 1 : 0,
    transform: on ? "translateY(0)" : "translateY(22px)",
    filter: on ? "blur(0)" : "blur(6px)",
    transition: on
      ? `opacity 0.9s ease ${0.12 * i}s, transform 1.1s cubic-bezier(0.22, 1, 0.36, 1) ${0.12 * i}s, filter 0.9s ease ${0.12 * i}s`
      : "opacity 0.35s ease, transform 0.45s ease, filter 0.35s ease",
  });
  return (
    <section aria-label="About Nyrro" aria-hidden={!shown} data-no-motion className="pointer-events-none absolute bottom-[8%] left-5 right-5 z-10 text-white md:bottom-[14%] md:left-1/2 md:right-8">
      <H className="font-serif text-[22px] leading-[30px] md:text-[26px] md:leading-[34px]" style={line(0)}>
        Nyrro: Nature in Colour
      </H>
      <p className="mt-4 text-[15px] leading-6 text-white/85" style={line(1)}>
        I&rsquo;d never really paid much attention to beetles before. But while working on this portfolio, one caught my eye and made me curious to explore their little world. The more I looked into them, the more I discovered some fascinating things about their natural defence mechanisms, from the oily droplets of oil beetles to the chemical spray of bombardier beetles, which can leave traces of their own.
      </p>
      <p className="mt-3 text-[15px] leading-6 text-white/85" style={line(2)}>
        That sparked an idea: what if a tiny creature left its own trail wherever it wandered, like a paintbrush moving across a canvas? That&rsquo;s how Nyrro came to life: part observation, part imagination, and a little expression of my love for nature, painting, and creative exploration.
      </p>
    </section>
  );
}
