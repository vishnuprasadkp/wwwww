"use client";

import { useEffect, useRef, useState } from "react";
import { MothIcon, setMothOpen } from "@/components/copilot/Moth";

// milliseconds. The page is hidden behind a dark panel. A beetle, off the left edge of the screen, leans on the edge of that panel
// and pushes it: three shoves, with a rest between each, in which it backs off a little to gather itself. The page comes out from
// behind the edge as it goes. After the third it opens its wings, flies to the assistant in the header and lands, and the rest
// of the dark is pushed aside, so the page is open.
const PUSHES: [number, number, number][] = [
  // from, to (as a share of the width of the screen), and how long it takes
  [0, 0.3, 1000],
  [0.3, 0.62, 950],
  [0.62, 0.86, 850],
];
const START = 300;
const REST = 420; // between shoves
const SIZE = 56; // beetle height; it is a little smaller than it was

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => t * t * (3 - 2 * t);
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

// when each shove starts, and so when the last one ends
const SCHEDULE = (() => {
  let at = START;
  return PUSHES.map(([a, b, d]) => {
    const row = { a, b, d, at };
    at += d + REST;
    return row;
  });
})();
const LAST_END = SCHEDULE[SCHEDULE.length - 1].at + SCHEDULE[SCHEDULE.length - 1].d;
const PREP_AT = LAST_END + 120; // it stops, and its wing cases begin to open
const FLY_AT = PREP_AT + 650; // and it leaves for the assistant
const FLY = 1500;
const SWEEP_AT = PREP_AT + 150; // the rest of the dark slides away while it flies
const SWEEP = 1100;

/**
 * The opening: the page is under a dark panel, and a beetle pushes the edge of it across the screen, in three shoves. Then it
 * flies up to the assistant in the header, comes in beside the word "Nyrro" on its left, folds its wings and becomes the
 * assistant's icon as the page is left open; the word eases a little to the right to make room.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const dark = useRef<HTMLDivElement>(null);
  const edge = useRef<HTMLDivElement>(null);
  const mothEl = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = root.current;
    const html = document.documentElement;
    if (!el) return;
    if (!html.hasAttribute("data-loading")) return; // not playing (reduced motion, or no script ran first)
    const moth = mothEl.current!;
    const panel = dark.current!;
    const shadow = edge.current!;
    const svg = moth.querySelector<SVGSVGElement>("svg")!;
    const timers: number[] = [];
    let raf = 0;
    let dead = false;

    const finish = () => {
      if (dead) return;
      dead = true;
      html.removeAttribute("data-loading");
      html.removeAttribute("data-landing");
      setDone(true); // React takes it out of the page (it is never removed by hand)
    };

    // where the assistant's icon is in the header: its centre, and how big it is
    const target = () => {
      const t = document.querySelector<HTMLElement>('button[aria-label="Ask Nyrro"] > span');
      if (!t) return null;
      const r = t.getBoundingClientRect();
      if (!r.width) return null;
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height };
    };

    const W = SIZE * 1.4;
    const t0 = performance.now();
    let from = { x: 0, y: 0 };
    let to: { x: number; y: number; h: number } | null = null;
    let landing = false;
    let ended = false;

    const place = (x: number, y: number, rot: number, scale: number, opacity: number) => {
      moth.style.opacity = String(opacity);
      moth.style.transform = `translate3d(${(x - W / 2).toFixed(2)}px, ${(y - SIZE / 2).toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
    };

    // where the edge of the dark is, and how hard the beetle is working, at a moment
    const state = (t: number, w: number) => {
      let x = 0;
      let effort = 0; // 1 while it is shoving
      let back = 0; // how far it has drawn back, in px, while it rests
      for (let i = 0; i < SCHEDULE.length; i++) {
        const p = SCHEDULE[i];
        const next = SCHEDULE[i + 1];
        const endAt = p.at + p.d;
        if (t < p.at) {
          x = p.a * w;
          break;
        }
        if (t <= endAt) {
          const q = (t - p.at) / p.d;
          // a shove is not even: it gives a little, then goes, then slows against the weight
          const k = clamp(easeIO(q) + 0.025 * Math.sin(q * 38) * Math.sin(Math.PI * q));
          x = (p.a + (p.b - p.a) * k) * w;
          effort = Math.sin(Math.PI * Math.min(1, q * 1.05));
          break;
        }
        x = p.b * w;
        if (next && t < next.at) {
          // it draws back (slowly), holds, and comes forward again just before the next shove
          const q = (t - endAt) / (next.at - endAt);
          back = 20 * (q < 0.5 ? ease(q / 0.5) : 1 - ease((q - 0.5) / 0.5) * 0.0) * (q > 0.82 ? 1 - ease((q - 0.82) / 0.18) : 1);
          break;
        }
      }
      return { x, effort, back };
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const t = now - t0;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = t / 1000;
      const front = SIZE * 0.36; // how far its head is ahead of its middle

      const st = state(t, w);
      // after the last shove the rest of the dark is pushed away
      const sweep = easeIO(clamp((t - SWEEP_AT) / SWEEP));
      const X = t < SWEEP_AT ? st.x : st.x + (w + 40 - st.x) * sweep;
      panel.style.clipPath = `inset(0 0 0 ${X.toFixed(1)}px)`;
      shadow.style.transform = `translate3d(${X.toFixed(1)}px, 0, 0)`;
      shadow.style.opacity = String(clamp(X / 40) * (1 - clamp((X - w) / 40)));

      if (t < FLY_AT) {
        // standing at the edge, head to it, shoving; its wing cases shut until it is ready to go
        const prep = ease(clamp((t - PREP_AT) / (FLY_AT - PREP_AT)));
        const shake = Math.sin(s * 44) * st.effort;
        const rock = Math.sin(s * 9) * st.effort;
        const breathe = Math.sin(s * 3.1) * (1 - st.effort) * 0.8;
        const wings = 0.1 + 0.78 * prep + 0.05 * Math.sin(s * 30) * prep * (1 - prep);
        setMothOpen(svg, clamp(wings, 0, 1));
        const lean = 2.5 * st.effort; // it leans into it
        const x = X - front - 3 - st.back + st.effort * 2.5 * Math.sin(s * 13) - prep * 6;
        const y = h * 0.56 + shake * 1.1 + breathe;
        const appear = easeOut(clamp(t / 250));
        place(x, y, 90 + lean + rock * 1.2, 1 + 0.03 * prep, appear);
      } else {
        if (!to) {
          to = target();
          from = { x: X - front - 3 - 6, y: h * 0.56 };
        }
        const dest = to ?? { x: w * 0.9, y: 30, h: 24 };
        const u = clamp((t - FLY_AT) / FLY);
        const e = easeIO(u);
        // an arc: it lifts and swings out before it comes in to the icon
        const dx = dest.x - from.x;
        const dy = dest.y - from.y;
        const dist = Math.hypot(dx, dy) || 1;
        const bend = Math.min(160, dist * 0.25);
        const ctrl = { x: from.x + dx * 0.35 + (dy / dist) * bend * -1, y: from.y + dy * 0.35 + (dx / dist) * bend - 40 };
        const a = (1 - e) * (1 - e);
        const b = 2 * (1 - e) * e;
        const c = e * e;
        const x = a * from.x + b * ctrl.x + c * dest.x;
        const y = a * from.y + b * ctrl.y + c * dest.y;
        // it turns from facing the edge to facing where it is going, then straightens up as it comes in
        const vx = 2 * (1 - e) * (ctrl.x - from.x) + 2 * e * (dest.x - ctrl.x);
        const vy = 2 * (1 - e) * (ctrl.y - from.y) + 2 * e * (dest.y - ctrl.y);
        const heading = (Math.atan2(vx, -vy) * 180) / Math.PI;
        const turned = 90 + (clamp(heading, -80, 80) - 90) * ease(clamp(u * 3.2));
        const rot = turned * (1 - ease(clamp((u - 0.72) / 0.28)));
        const scale = 1.04 + (((dest.h || 24) / SIZE) - 1.04) * ease(clamp((u - 0.05) / 0.9));
        // wings beat while it travels, slow as it comes in, and fold as it settles
        const beat = 0.86 + 0.12 * Math.sin(s * 22);
        const fold = ease(clamp((u - 0.72) / 0.28));
        setMothOpen(svg, clamp(beat * (1 - fold) * (1 - 0.35 * ease(clamp((u - 0.5) / 0.3))), 0, 1));
        place(x, y, rot, scale, 1);

        if (!landing && u > 0.7) {
          landing = true;
          html.setAttribute("data-landing", ""); // the word "Nyrro" starts to ease to the right
        }
        if (u >= 1 && !ended) {
          ended = true;
          // it has landed exactly on the header's icon: the icon is shown and the flying beetle taken away in the same instant, so
          // the beetle is not seen to fade or change; it simply stays where it sat down
          html.setAttribute("data-landed", "");
          cancelAnimationFrame(raf);
          finish();
          timers.push(window.setTimeout(() => html.removeAttribute("data-landed"), 400));
        }
      }
    };

    raf = requestAnimationFrame(frame);
    // a page that was opened in a background tab must still get its page back
    timers.push(window.setTimeout(finish, 20000));

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (done) return null;

  return (
    <div ref={root} className="loader" aria-hidden>
      <div ref={dark} className="loader-dark" style={{ clipPath: "inset(0 0 0 0)" }} />
      <div ref={edge} className="loader-edge" />
      <div ref={mothEl} className="loader-moth" style={{ width: SIZE * 1.4, height: SIZE }}>
        <MothIcon size={SIZE} star={false} />
      </div>
    </div>
  );
}
