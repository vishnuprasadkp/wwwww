"use client";

import { useEffect, useRef, useState } from "react";
import { MothIcon, setMothOpen } from "@/components/copilot/Moth";

// milliseconds. The page is hidden behind its own paper, and there is a fine line standing on it, near the left edge. A beetle
// flies in, lands with its head to the line, and shoves it a good way across. Then it takes off, flies round, lands again at
// another height and shoves again; three times, the last pushing the line off the far side of the screen. Only then does the page
// appear, and the beetle flies up to the assistant in the header and lands beside the word "Nyrro".
const SIZE = 52; // beetle height
const LINE_AT = [0.08, 0.37, 0.67, 1.03]; // where the line stands, as a share of the width, before and after each shove
const HEIGHTS = [0.4, 0.66, 0.36]; // how high up the screen it lands for each shove
const COME = 950; // flying in to the first shove
const PUSH = 900; // each shove
const HOP = 950; // flying round to land again
const START = 250;
const SEG = (() => {
  // the schedule: arrive, shove, hop, shove, hop, shove
  const rows: { kind: "arrive" | "push" | "hop"; i: number; at: number; d: number }[] = [];
  let at = START;
  rows.push({ kind: "arrive", i: 0, at, d: COME });
  at += COME;
  for (let i = 0; i < 3; i++) {
    rows.push({ kind: "push", i, at, d: PUSH });
    at += PUSH;
    if (i < 2) {
      rows.push({ kind: "hop", i: i + 1, at, d: HOP });
      at += HOP;
    }
  }
  return { rows, end: at };
})();
const OPEN_AT = SEG.end - 80; // the line is gone: the page comes up
const OPEN = 800;
const FLY_AT = SEG.end + 120; // and the beetle leaves for the assistant
const FLY = 1500;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => t * t * (3 - 2 * t);
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * The opening: a beetle flies in, pushes a fine line across the screen in three shoves, flying round between them. When the line
 * has been pushed off, the page appears, and the beetle flies up to the assistant in the header, comes in beside the word
 * "Nyrro" on its left, folds its wings and becomes the assistant's icon; the word eases a little to the right to make room.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const line = useRef<SVGPathElement>(null);
  const mothEl = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = root.current;
    const html = document.documentElement;
    if (!el) return;
    if (!html.hasAttribute("data-loading")) return; // not playing (reduced motion, or no script ran first)
    const moth = mothEl.current!;
    const veil = bg.current!;
    const wire = line.current!;
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
    const front = SIZE * 0.36; // how far its head is ahead of its middle
    let to: { x: number; y: number; h: number } | null = null;
    let from = { x: 0, y: 0 };
    let landing = false;
    let ended = false;

    const place = (x: number, y: number, rot: number, scale: number, opacity: number) => {
      moth.style.opacity = String(opacity);
      moth.style.transform = `translate3d(${(x - W / 2).toFixed(2)}px, ${(y - SIZE / 2).toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
    };

    /** A flight from one point to another along an arc: where it is, and which way it is heading (degrees, 0 is up). */
    const arc = (a: { x: number; y: number }, b: { x: number; y: number }, u: number, lift: number) => {
      const e = easeIO(u);
      const ctrl = { x: (a.x + b.x) / 2 - lift * 0.35, y: Math.min(a.y, b.y) - lift };
      const p = (1 - e) * (1 - e);
      const q = 2 * (1 - e) * e;
      const r = e * e;
      const x = p * a.x + q * ctrl.x + r * b.x;
      const y = p * a.y + q * ctrl.y + r * b.y;
      const vx = 2 * (1 - e) * (ctrl.x - a.x) + 2 * e * (b.x - ctrl.x);
      const vy = 2 * (1 - e) * (ctrl.y - a.y) + 2 * e * (b.y - ctrl.y);
      return { x, y, heading: (Math.atan2(vx, -vy) * 180) / Math.PI };
    };

    // the line: a long thin stroke a little unsteady, pressed forward where the beetle leans on it
    const drawLine = (X: number, yc: number, bulge: number, opacity: number, h: number) => {
      let d = "";
      for (let y = -12; y <= h + 12; y += 14) {
        const g = Math.exp(-(((y - yc) / 150) ** 2));
        const x = X + bulge * g + Math.sin(y * 0.045 + 1.3) * 0.9 + Math.sin(y * 0.13) * 0.4;
        d += (d ? "L" : "M") + x.toFixed(1) + " " + y;
      }
      wire.setAttribute("d", d);
      wire.style.opacity = String(opacity);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const t = now - t0;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = t / 1000;

      // where the line stands, how hard it is being pushed, and what the beetle is doing
      let X = LINE_AT[0] * w;
      let yc = HEIGHTS[0] * h;
      let bulge = 0;
      let wings = 0;
      let bx = 0;
      let by = 0;
      let rot = 90;
      let scale = 1;
      let shown = 0;

      const rowAt = SEG.rows.find((r) => t >= r.at && t < r.at + r.d);
      const pushIdx = rowAt && rowAt.kind === "push" ? rowAt.i : -1;
      // the line has been moved by every shove already finished
      for (const r of SEG.rows) {
        if (r.kind !== "push") continue;
        if (t >= r.at + r.d) X = LINE_AT[r.i + 1] * w;
        else if (t >= r.at) {
          const q = (t - r.at) / r.d;
          // a shove gives a little, then goes, then slows against the weight
          const k = clamp(easeIO(q) + 0.02 * Math.sin(q * 34) * Math.sin(Math.PI * q));
          X = (LINE_AT[r.i] + (LINE_AT[r.i + 1] - LINE_AT[r.i]) * k) * w;
        }
      }
      shown = t >= SEG.end ? 0 : 1;

      if (t < START) {
        place(-200, -200, 90, 1, 0);
      } else if (t < FLY_AT) {
        if (!rowAt) {
          // after the last shove: it stands at the right edge, panting, wings coming open
          yc = HEIGHTS[2] * h;
          const prep = ease(clamp((t - SEG.end) / (FLY_AT - SEG.end)));
          wings = 0.1 + 0.78 * prep;
          bx = Math.min(w - front - 4, LINE_AT[3] * w - front - 4);
          by = yc;
          rot = 90;
        } else if (rowAt.kind === "arrive") {
          // down out of the top left of the screen, wings beating, to the line, head first
          const u = clamp((t - rowAt.at) / rowAt.d);
          const a = { x: w * 0.04, y: -60 };
          const b = { x: LINE_AT[0] * w - front - 3, y: HEIGHTS[0] * h };
          yc = HEIGHTS[0] * h;
          const f = arc(a, b, u, 90);
          const turn = Math.pow(Math.sin(Math.PI * u), 0.7);
          bx = f.x;
          by = f.y;
          rot = 90 + (clamp(f.heading, -40, 160) - 90) * turn;
          wings = (0.88 - 0.78 * ease(clamp((u - 0.7) / 0.3))) * (0.9 + 0.1 * Math.sin(s * 26)) + 0.1 * ease(clamp((u - 0.7) / 0.3));
          scale = 1 + 0.14 * Math.sin(Math.PI * u);
        } else if (rowAt.kind === "push") {
          // head to the line, legs braced, shaking with the effort; the line bows round where it leans
          const i = rowAt.i;
          const q = (t - rowAt.at) / rowAt.d;
          const effort = Math.sin(Math.PI * Math.min(1, q * 1.05));
          yc = HEIGHTS[i] * h;
          bulge = 9 * effort;
          bx = X + bulge - front - 3 + Math.sin(s * 14) * effort * 1.4;
          by = yc + Math.sin(s * 46) * effort * 1.1;
          rot = 90 + 2.5 * effort + Math.sin(s * 9) * effort * 1.2;
          wings = 0.1;
        } else {
          // between shoves: it lifts off, flies round, and lands again at another height
          const i = rowAt.i; // the shove it is about to make
          const u = clamp((t - rowAt.at) / rowAt.d);
          const a = { x: LINE_AT[i] * w - front - 3 - 2, y: HEIGHTS[i - 1] * h };
          const b = { x: LINE_AT[i] * w - front - 3, y: HEIGHTS[i] * h };
          yc = HEIGHTS[i] * h;
          const f = arc(a, b, u, 110);
          const turn = Math.pow(Math.sin(Math.PI * u), 0.7);
          bx = f.x;
          by = f.y;
          rot = 90 + (clamp(f.heading, -70, 200) - 90) * turn;
          const up = ease(clamp(u / 0.18));
          const down = ease(clamp((u - 0.78) / 0.22));
          wings = (0.1 + 0.78 * up) * (1 - down) + 0.1 * down + 0.1 * Math.sin(s * 28) * up * (1 - down);
          scale = 1 + 0.16 * Math.sin(Math.PI * u);
        }
        drawLine(X, yc, bulge, shown * clamp(t / 300), h);
        setMothOpen(svg, clamp(wings, 0, 1));
        if (t >= START) place(bx, by, rot, scale, 1);
        void pushIdx;
      } else {
        // the page is up; it flies to the assistant
        if (!to) {
          to = target();
          from = { x: Math.min(w - front - 4, LINE_AT[3] * w - front - 4), y: HEIGHTS[2] * h };
        }
        const dest = to ?? { x: w * 0.9, y: 30, h: 24 };
        const u = clamp((t - FLY_AT) / FLY);
        const e = easeIO(u);
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
        const vx = 2 * (1 - e) * (ctrl.x - from.x) + 2 * e * (dest.x - ctrl.x);
        const vy = 2 * (1 - e) * (ctrl.y - from.y) + 2 * e * (dest.y - ctrl.y);
        const heading = (Math.atan2(vx, -vy) * 180) / Math.PI;
        const turned = 90 + (clamp(heading, -80, 80) - 90) * ease(clamp(u * 3.2));
        const r = turned * (1 - ease(clamp((u - 0.72) / 0.28)));
        const sc = 1.04 + (((dest.h || 24) / SIZE) - 1.04) * ease(clamp((u - 0.05) / 0.9));
        const beat = 0.86 + 0.12 * Math.sin(s * 22);
        const fold = ease(clamp((u - 0.72) / 0.28));
        setMothOpen(svg, clamp(beat * (1 - fold) * (1 - 0.35 * ease(clamp((u - 0.5) / 0.3))), 0, 1));
        place(x, y, r, sc, 1);
        drawLine(w + 40, h / 2, 0, 0, h);

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

      // the line is off the screen: the paper lifts, and the page is there
      veil.style.opacity = String(1 - ease(clamp((t - OPEN_AT) / OPEN)));
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
      <div ref={bg} className="loader-bg" />
      <svg className="loader-line" width="100%" height="100%" style={{ position: "fixed", inset: 0, overflow: "visible", pointerEvents: "none" }}>
        <path ref={line} d="" fill="none" stroke="#1c1a1a" strokeWidth="2.2" strokeLinecap="round" style={{ opacity: 0 }} />
      </svg>
      <div ref={mothEl} className="loader-moth" style={{ width: SIZE * 1.4, height: SIZE }}>
        <MothIcon size={SIZE} star={false} />
      </div>
    </div>
  );
}
