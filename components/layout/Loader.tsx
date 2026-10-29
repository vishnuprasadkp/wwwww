"use client";

import { useEffect, useRef, useState } from "react";
import { MothIcon, MOTH_COLORS, setMothOpen, type MothColors } from "@/components/copilot/Moth";

// The moth that arrives is darker than the one in the nav; its wing pattern is white, then takes each colour in turn
const ARRIVING: MothColors = { grey: "#4c3d38", hind: "#8d7168", deep: "#4c3d38", vein: "#f1efee" };
const VEINS = ["#f1efee", "#8db4d6", "#7da98a", "#c9935a"]; // white, blue, green, orange

// milliseconds
const MOTH_IN = 500; // the moth comes up out of the paper
const RISE = 1700; // …and its wings open slowly
const COLOUR_AT = [2500, 3500, 4500]; // the pattern turns blue, green, orange
const STAND_AT = 5300; // it settles and stands still, wings folded
const PREP_AT = 6300; // then its wing cases begin to lift, slowly, as it gets ready
const FLY_AT = 7500; // and only then does it leave for the assistant
const FLY = 2800;
const SIZE = 46;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => t * t * (3 - 2 * t);
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * The opening: a moth comes up on the bare paper and hovers while its white wing pattern takes the colours of the site one
 * after another. Then it flies up to the assistant in the header, comes in beside the word "Nyrro" on its left, folds its
 * wings and becomes the assistant's icon as the page is uncovered; the word eases a little to the right to make room.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const mothEl = useRef<HTMLDivElement>(null);
  const [vein, setVein] = useState(0);
  const [landed, setLanded] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = root.current;
    const html = document.documentElement;
    if (!el) return;
    if (!html.hasAttribute("data-loading")) return; // not playing (reduced motion, or no script ran first)
    const moth = mothEl.current!;
    const veil = bg.current!;
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
    let coloured = false;
    let landing = false;
    let ended = false;

    const place = (x: number, y: number, rot: number, scale: number, opacity: number) => {
      moth.style.opacity = String(opacity);
      moth.style.transform = `translate3d(${(x - W / 2).toFixed(2)}px, ${(y - SIZE / 2).toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const t = now - t0;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const s = t / 1000;

      // the moth: rises into place with its wings opening, then hovers
      const arrive = easeOut(clamp((t - MOTH_IN) / RISE));
      const wake = ease(clamp((t - MOTH_IN - 250) / RISE));
      const hover = t < FLY_AT ? 1 : 0;
      // it stops hovering and stands: the bob and sway die away, the wing cases close
      const stand = ease(clamp((t - STAND_AT) / 800));
      const bob = Math.sin(s * 1.9) * 3.4 * arrive * hover * (1 - stand);
      const sway = Math.sin(s * 1.3 + 0.6) * 3.6 * arrive * hover * (1 - stand);
      // …and gets ready: the cases lift a little at a time, it rises on its legs, a small tremble, then it goes
      const prep = ease(clamp((t - PREP_AT) / (FLY_AT - PREP_AT)));

      if (t < FLY_AT) {
        const flutter = (0.1 * Math.sin(s * 11) + 0.05 * Math.sin(s * 4.7)) * wake * (1 - stand);
        const hoverWings = 0.1 + 0.68 * wake + flutter;
        const wings = hoverWings + (0.1 - hoverWings) * stand + (0.88 - 0.1) * prep + 0.05 * Math.sin(s * 30) * prep * (1 - prep);
        setMothOpen(svg, clamp(wings, 0, 1));
        place(cx, cy + (1 - arrive) * 22 + bob - 5 * prep, sway, (0.8 + 0.2 * arrive) * (1 + 0.04 * prep), arrive);
      } else {
        if (!to) {
          to = target();
          from = { x: cx, y: cy - 5 };
        }
        const dest = to ?? { x: cx, y: cy - 200, h: 24 };
        const u = clamp((t - FLY_AT) / FLY);
        const e = easeIO(u);
        // an arc: it lifts and swings out before it comes in to the icon
        const dx = dest.x - from.x;
        const dy = dest.y - from.y;
        const dist = Math.hypot(dx, dy) || 1;
        const bend = Math.min(200, dist * 0.3);
        const ctrl = { x: from.x + dx * 0.4 + (dy / dist) * bend * -1, y: from.y + dy * 0.4 + (dx / dist) * bend - 70 };
        const a = (1 - e) * (1 - e);
        const b = 2 * (1 - e) * e;
        const c = e * e;
        const x = a * from.x + b * ctrl.x + c * dest.x;
        const y = a * from.y + b * ctrl.y + c * dest.y;
        // it points the way it is going, then straightens up as it comes in
        const vx = 2 * (1 - e) * (ctrl.x - from.x) + 2 * e * (dest.x - ctrl.x);
        const vy = 2 * (1 - e) * (ctrl.y - from.y) + 2 * e * (dest.y - ctrl.y);
        const heading = (Math.atan2(vx, -vy) * 180) / Math.PI;
        const lean = clamp(heading, -62, 62) * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05)), 0.7);
        const scale = 1.04 + (((dest.h || 24) / SIZE) - 1.04) * ease(clamp((u - 0.05) / 0.9));
        // wings beat while it travels, slow as it comes in, and fold as it settles
        const beat = 0.86 + 0.12 * Math.sin(s * 22);
        const fold = ease(clamp((u - 0.72) / 0.28));
        setMothOpen(svg, clamp(beat * (1 - fold) * (1 - 0.35 * ease(clamp((u - 0.5) / 0.3))), 0, 1));
        place(x, y, lean * (1 - ease(clamp((u - 0.78) / 0.22))), scale, 1);

        // the page is uncovered as it goes
        veil.style.opacity = String(1 - ease(clamp((t - FLY_AT - 300) / 1400)));
        if (!coloured && u > 0.5) {
          coloured = true;
          setLanded(true); // its colours become the assistant's
        }
        if (!landing && u > 0.7) {
          landing = true;
          html.setAttribute("data-landing", ""); // the word "Nyrro" starts to ease to the right
        }
        if (u >= 1 && !ended) {
          ended = true;
          // it has landed exactly on the header's icon: the icon is shown and the flying moth taken away in the same instant, so
          // the moth is not seen to fade or change; it simply stays where it sat down
          html.setAttribute("data-landed", "");
          cancelAnimationFrame(raf);
          finish();
          timers.push(window.setTimeout(() => html.removeAttribute("data-landed"), 400));
        }
      }
    };

    // the pattern changes colour while it hovers
    COLOUR_AT.forEach((at, i) => timers.push(window.setTimeout(() => setVein(i + 1), at)));
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

  const colors: MothColors = landed ? MOTH_COLORS : { ...ARRIVING, vein: VEINS[vein] };

  return (
    <div ref={root} className="loader" aria-hidden>
      <div ref={bg} className="loader-bg" />
      <div ref={mothEl} className="loader-moth" style={{ width: SIZE * 1.4, height: SIZE }}>
        <MothIcon size={SIZE} star={false} colors={colors} />
      </div>
    </div>
  );
}
