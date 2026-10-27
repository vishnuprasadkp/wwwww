"use client";

import { useEffect, useRef, useState } from "react";
import MothTrail from "@/components/copilot/Moth";
import type { Scheme } from "@/lib/painting";

/**
 * Two moths, laid over a painting that is already on the page. It adds nothing to the page's layout and does not touch the
 * painting: it fills the box the painting is in, and each moth wakes, hops between the edges and the inside, turns side-on on
 * the edges and walks and paints in watercolour, as in the assistant, a little larger. Press it and drag it, or press anywhere to send
 * it there. It runs only while it is on screen.
 */
export default function PaintingMoth({ scheme }: { scheme: Scheme }) {
  const ref = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  // where each moth starts and when it wakes is different on every page and every visit: two spots well apart, anywhere in the section
  const [starts] = useState(() => {
    const ax = 0.12 + Math.random() * 0.3;
    const bx = Math.min(0.88, ax + 0.3 + Math.random() * 0.3);
    return [
      { x: ax, y: 0.18 + Math.random() * 0.64, wake: Math.random() * 1.2 },
      { x: bx, y: 0.18 + Math.random() * 0.64, wake: 0.8 + Math.random() * 1.6 },
    ];
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-moth-host className="absolute inset-0 select-none" aria-hidden>
      {/* two moths share the painting: they keep out of each other's way, and a press goes to the nearer */}
      {starts.map((st, i) => (
        <MothTrail key={i} scene active={onScreen} colors={scheme.moth} paint={scheme.paint} paintGain={scheme.gain} star={false} startAt={st.x} startY={st.y} wakeDelay={st.wake} />
      ))}
    </div>
  );
}
