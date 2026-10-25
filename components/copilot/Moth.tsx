"use client";

import { useEffect, useId, useRef } from "react";

export const INK = "#e4572e"; // the brand orange: the moth
const DEEP = "#c44419"; // the same orange, deeper: body, hind wings, antennae
const LIGHT = "#f3d9cd"; // markings: a pale tint that reads as cut-outs in the orange
const PAINT = "126,100,91"; // the paint: the logo brown-grey, thinned

const PIVOT = "20 13"; // shoulder
const FOLD = 52; // degrees a forewing swings from spread to folded
const WIDE = 1.2; // the moth is drawn this much wider than tall

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Poses the top-view moth. `p` 0 is at rest (wings folded into a triangle: the app icon), about 0.55 is walking
 * (wings half open, hind wings showing) and 1 is in flight (wings spread). Each wing pivots on the shoulder, so
 * every value in between is a real in-between pose, with the same markings throughout.
 */
export function setMothOpen(svg: SVGSVGElement, p: number) {
  const a = FOLD * (1 - p);
  for (const g of svg.querySelectorAll<SVGGElement>("[data-fw]")) g.setAttribute("transform", `rotate(${a.toFixed(2)} ${PIVOT})`);
  const hind = clamp((p - 0.1) / 0.25, 0, 1);
  for (const g of svg.querySelectorAll<SVGGElement>("[data-hw]")) {
    g.setAttribute("transform", `rotate(${(a * 0.5).toFixed(2)} ${PIVOT})`);
    g.style.opacity = String(hind);
  }
}

/** Four-point sparkle: the AI mark, beside the moth. */
function Sparkle() {
  return <path className="moth-spark" d="M35.4 0.6C35.8 3.4 37.2 4.8 40 5.2C37.2 5.6 35.8 7 35.4 9.8C35 7 33.6 5.6 30.8 5.2C33.6 4.8 35 3.4 35.4 0.6Z" fill={INK} />;
}

export function MothIcon({ size = 28, open = 0, className = "" }: { size?: number; open?: number; className?: string }) {
  const id = "mc" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current) setMothOpen(ref.current, open);
  }, [open]);
  // wings are drawn for the right side, spread; the left side is the mirror image. Solid orange, pale markings.
  const wings = (
    <>
      <g data-hw>
        <path d="M21 19C26 17 33 18.8 35.4 24C32.6 29.2 26.4 29.8 21.4 27Z" fill={DEEP} />
        <circle cx="29.6" cy="24.2" r="1.5" fill={LIGHT} />
      </g>
      <g data-fw>
        <path d="M20.6 13.4C26.6 10.2 34 9.4 38.8 10.4C38 17 30 22.6 21.2 24Z" fill={INK} />
        <path d="M22.6 15.4C27.6 13.2 32.6 12.6 36 12.9" fill="none" stroke={LIGHT} strokeWidth="0.9" strokeLinecap="round" />
        <path d="M25.4 19.2C25.4 16.8 27.8 15.6 30.2 16.4C30 18.4 28 19.6 25.4 19.2Z" fill={LIGHT} />
      </g>
    </>
  );
  return (
    <svg ref={ref} width={size * WIDE} height={size} viewBox="0 0 40 40" preserveAspectRatio="none" aria-hidden="true" className={className} style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={id}>
          <rect x="20" y="-10" width="30" height="60" />
        </clipPath>
      </defs>
      <g fill="none" stroke={DEEP} strokeWidth="1.1" strokeLinecap="round">
        <path className="moth-ant" style={{ transformOrigin: "20px 8px" }} d="M20.8 7.4C22.4 4.6 25.4 2.6 29.6 2.2" />
        <path className="moth-ant moth-ant-l" style={{ transformOrigin: "20px 8px" }} d="M19.2 7.4C17.6 4.6 14.6 2.6 10.4 2.2" />
      </g>
      <ellipse cx="20" cy="20.5" rx="1.9" ry="10.6" fill={DEEP} />
      <g clipPath={`url(#${id})`}>{wings}</g>
      <g transform="translate(40 0) scale(-1 1)" clipPath={`url(#${id})`}>
        {wings}
      </g>
      <ellipse cx="20" cy="12" rx="3.6" ry="2.5" fill={LIGHT} />
      <ellipse cx="20" cy="12.4" rx="1.3" ry="2.5" fill={DEEP} />
      <path d="M18.9 18H21.1M18.9 21H21.1M19.1 24H20.9" stroke={LIGHT} strokeWidth="0.7" strokeLinecap="round" />
      <circle cx="20" cy="8.4" r="1.7" fill={DEEP} />
      <Sparkle />
    </svg>
  );
}

/**
 * The moth from the side, clinging to a wall on its left, head up: wings folded into a wedge along its back, legs
 * on the wall. (Mirrored for a wall on the right.)
 */
export const MothSideIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ overflow: "visible" }}>
    <path d="M16.2 14.4L11.6 15.8M16.8 18.4L11.6 20M17.4 22.4L12.2 24.4" fill="none" stroke={DEEP} strokeWidth="1.1" strokeLinecap="round" />
    <path className="moth-ant" style={{ transformOrigin: "16px 8px" }} d="M16.6 7.4C18.2 4.6 21.2 2.8 25.4 2.4" fill="none" stroke={DEEP} strokeWidth="1.1" strokeLinecap="round" />
    <path d="M17.4 13.2C22.6 15.2 27.2 23.8 27.8 31.8L19 31.2C17.6 25 16.6 18.6 17.4 13.2Z" fill={INK} />
    <path d="M19 16.4C22 18.6 24.6 23.6 25.2 29.4" fill="none" stroke={LIGHT} strokeWidth="0.9" strokeLinecap="round" />
    <ellipse cx="22" cy="25" rx="1.6" ry="2.4" fill={LIGHT} />
    <circle cx="16.8" cy="12" r="2.6" fill={LIGHT} />
    <circle cx="15.8" cy="8.4" r="1.7" fill={DEEP} />
    <Sparkle />
  </svg>
);

/* ------------------------------------------------------------------ roaming moth */

type Mode = "wake" | "aim" | "crouch" | "fly" | "settle" | "roll" | "walk" | "rest";
type Wall = "L" | "R" | null;
/** One touch of the brush. `k` are fixed random numbers so each touch keeps its character as it fades. */
type Dab = { x: number; y: number; r: number; k: number[]; t: number };
/** The top edge of something on the page that the moth can stand on: the input box, a reply, a question. */
type Ledge = { el: HTMLElement; kind: string; x0: number; x1: number; y: number };
type Spot = { x: number; y: number; wall: Wall; ledge?: Ledge };
export type MothSignal = { kind: "send" | "reply"; id: number };

const SIZE = 28; // moth height in px, the same as the icon it flies out of
const BOX_W = SIZE * WIDE;
const DAB_GAP = 1.6; // px between brush touches
const LIFE = 9; // seconds for a stroke to dilute away completely
const WALL_C = 7; // moth centre's distance from the wall it clings to
const LAND_C = 20; // …and from the wall where it lands before rolling onto it
const PERCH = 12; // how far above a ledge's top edge the moth's centre sits

/**
 * Watercolour: each touch lays a very thin wash of the brand brown-grey, a faint darker rim where pigment pools at
 * the edge, now and then a dry-brush bristle and a stray fleck. As it dilutes, the wash spreads and fades.
 */
function paintDab(ctx: CanvasRenderingContext2D, d: Dab, age: number) {
  const f = Math.max(0, 1 - age / LIFE);
  if (f <= 0) return;
  const { x, y, k } = d;
  const r = d.r * (1 + 0.45 * (1 - f)); // water carries the pigment outwards as it thins
  ctx.globalAlpha = f * f * 0.5 + f * 0.5;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.9);
  g.addColorStop(0, `rgba(${PAINT},0.085)`);
  g.addColorStop(0.55, `rgba(${PAINT},0.045)`);
  g.addColorStop(1, `rgba(${PAINT},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(92,70,63,0.04)";
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(x + (k[0] - 0.5) * 1.4, y + (k[1] - 0.5) * 1.4, r * 0.95, 0, Math.PI * 2);
  ctx.stroke();
  if (k[2] > 0.84) {
    ctx.strokeStyle = "rgba(100,78,70,0.12)";
    ctx.lineWidth = 0.7;
    const off = (k[3] - 0.5) * r * 1.8;
    ctx.beginPath();
    ctx.moveTo(x + off, y - 2.5);
    ctx.lineTo(x + off + (k[4] - 0.5) * 2, y + 2.5);
    ctx.stroke();
  }
  if (k[5] > 0.97) {
    ctx.fillStyle = "rgba(100,78,70,0.25)";
    ctx.beginPath();
    ctx.arc(x + (k[6] - 0.5) * r * 5, y + (k[7] - 0.5) * r * 5, 0.6 + k[8], 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * When the panel opens, the moth that is the icon in the panel header wakes up, turns to face where it is going and
 * hops to the middle of the assistant first, then on to other places: the top edge of the heading, a question or a
 * reply, the top edge of the input box, high up, or onto the left divider or right screen edge. When the user sends
 * a question it flies to the top of the input box and walks along it while Nivvi thinks; when the answer arrives it
 * flies to the top of the answer's text. Hops are wings beating, no paint. On a ledge or in the open it folds its
 * wings, turns to face its way and walks a short way, head first, painting. On a wall it comes down turning onto its
 * side as it lands, clings, and crawls upwards, painting. It only ever moves forwards, and every change of pose
 * eases from the one before: it turns on the spot, crouches, springs, and squashes a little as it lands. The paint
 * thins and fades by itself. `active` is true while the panel is open; each opening starts again. With reduced
 * motion it simply sits above the input box.
 */
export default function MothTrail({ active, busy = false, signal }: { active: boolean; busy?: boolean; signal?: MothSignal }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const mothEl = useRef<HTMLDivElement>(null);
  const turnEl = useRef<HTMLDivElement>(null);
  const sideFace = useRef<HTMLDivElement>(null);
  const busyRef = useRef(busy);
  busyRef.current = busy;
  const signalRef = useRef(signal);
  signalRef.current = signal;

  useEffect(() => {
    const cv = canvas.current;
    const el = mothEl.current;
    const turner = turnEl.current;
    const sface = sideFace.current;
    const topSvg = el?.querySelector<SVGSVGElement>("[data-top] svg");
    const host = cv?.closest("aside") as HTMLElement | null;
    if (!active || !cv || !el || !turner || !sface || !topSvg || !host) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    const fit = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.offsetWidth || r.width;
      h = host.offsetHeight || r.height;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const ease = (t: number) => t * t * (3 - 2 * t);
    const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
    // where the moth may go in the open: below the header, above the input box
    const form = () => host.querySelector("form") as HTMLElement | null;
    const topY = () => 57 + 36;
    const botY = () => (form()?.offsetTop ?? h - 90) - 16;
    // the moth keeps mostly to the open space above the text; the bottom strip is visited only now and then
    const calmY = () => topY() + (botY() - topY()) * 0.6;
    const clingX = (side: Exclude<Wall, null>) => (side === "L" ? WALL_C : w - WALL_C);
    const landX = (side: Exclude<Wall, null>) => (side === "L" ? LAND_C : w - LAND_C);

    /* ledges: the top edges of the page's own elements, tracked live so the moth rides along when the chat scrolls */
    const scroller = () => host.querySelector<HTMLElement>(".overflow-y-auto");
    const measure = (e: HTMLElement, kind: string): Ledge | null => {
      const hr = host.getBoundingClientRect();
      const r = e.getBoundingClientRect();
      if (kind !== "composer") {
        const sc = scroller()?.getBoundingClientRect();
        if (sc && (r.top < sc.top + 18 || r.top > sc.bottom - 24)) return null; // scrolled out of view
      }
      if (r.width < 70) return null;
      return { el: e, kind, x0: r.left - hr.left, x1: r.right - hr.left, y: r.top - hr.top - PERCH };
    };
    const last = (sel: string) => {
      const all = host.querySelectorAll<HTMLElement>(sel);
      return all.length ? all[all.length - 1] : null;
    };
    const findLedge = (kind: "composer" | "reply" | "question" | "hero"): Ledge | null => {
      const e =
        kind === "composer" ? last('[data-ledge="composer"]')
        : kind === "reply" ? last('[data-ledge="msg-a"]') ?? last('[data-ledge="msg-u"]') ?? last('[data-ledge="hero"]')
        : kind === "question" ? last('[data-ledge="msg-u"]')
        : last('[data-ledge="hero"]');
      return e ? measure(e, e.dataset.ledge === "composer" ? "composer" : "text") : null;
    };
    const spotOn = (l: Ledge): Spot => ({ x: rand(l.x0 + 28, Math.max(l.x0 + 29, l.x1 - 28)), y: l.y, wall: null, ledge: l });

    let firstHop = true;
    let pending: "composer" | "reply" | null = null; // the user sent a question / an answer arrived: go there next
    const pickSpot = (from: { x: number; y: number }): Spot => {
      const t = topY();
      const b = Math.max(t + 60, botY());
      const c = calmY();
      if (pending) {
        const l = findLedge(pending);
        pending = null;
        if (l) return spotOn(l);
      }
      const convo = !!host.querySelector('[data-ledge="msg-a"],[data-ledge="msg-u"]');
      if (firstHop) {
        firstHop = false; // the first stop is the middle of the assistant, never straight to the bottom
        if (convo) {
          const l = findLedge("reply");
          if (l) return spotOn(l);
        }
        return { x: w * 0.5 + rand(-24, 24), y: (t + b) / 2 + rand(-20, 20), wall: null };
      }
      for (let n = 0; n < 24; n++) {
        let s: Spot | null = null;
        if (convo) {
          // text fills the middle, so the moth stays on top of it, on the input box, or on a wall
          const z = rand(0, 10);
          if (z < 4) { const l = findLedge("reply"); s = l && spotOn(l); }
          else if (z < 5.5) { const l = findLedge("question"); s = l && spotOn(l); }
          else if (z < 7) { const l = findLedge("composer"); s = l && spotOn(l); }
          else if (z < 8.5) s = { x: clingX("L"), y: rand(t + 110, c), wall: "L" };
          else s = { x: clingX("R"), y: rand(t + 110, c), wall: "R" };
        } else {
          const zone = Math.floor(rand(0, 8));
          if (zone < 2) s = { x: clingX("L"), y: rand(t + 110, c), wall: "L" }; // the centre divider, above the text
          else if (zone < 4) s = { x: clingX("R"), y: rand(t + 110, c), wall: "R" }; // the right screen edge, above the text
          else if (zone === 4) s = { x: rand(w * 0.3, w * 0.8), y: rand(t, t + 70), wall: null }; // high up
          else if (zone === 5) s = { x: rand(40, w - 60), y: rand(t + 30, c), wall: null }; // the open middle
          else if (zone === 6) { const l = findLedge("hero"); s = l ? spotOn(l) : { x: rand(40, w - 60), y: rand(t + 20, c - 10), wall: null }; }
          else { const l = findLedge("composer"); s = l && spotOn(l); } // the top of the input box
        }
        if (s && Math.hypot(s.x - from.x, s.y - from.y) > 100) return s;
      }
      return { x: w * 0.5, y: (t + b) / 2, wall: null };
    };

    const mark = host.querySelector<HTMLElement>(".nivvi-mark");
    const pos = mark ? { x: mark.offsetLeft + mark.offsetWidth / 2, y: mark.offsetTop + mark.offsetHeight / 2 } : { x: 34, y: 28 };
    let mode: Mode = "wake";
    let heading = -Math.PI / 2; // head up, as the icon sits
    let p = 0; // wings, 0 folded … 1 spread
    let pt = 0; // where they are heading
    let roll = 0; // 0 top view … 1 on its side, clinging to a wall
    let wall: Wall = null; // the wall it is clinging to
    let rollSide: Exclude<Wall, null> = "R"; // …or last was, so the roll turns the right way while it peels off
    let ledge: Ledge | null = null; // the ledge it is standing on
    let timer = 0.7; // seconds until the next thing happens
    let strokeLen = 0;
    let sinceDab = 0;
    let dabIndex = 0;
    let scale = 1;
    let squash = 0; // a little squash as it lands
    let lift = 0; // 0 on the ground … 1 at the top of a hop: drives the shadow
    let clung = false; // on a wall: rest, then crawl, then rest, then leave
    let walkHeading = 0;
    let walkT = 0; // seconds into a walk
    let lowWalk = false; // this walk is in the strip above the input box
    let shiver = 0;
    let shiverAt = rand(1.5, 3);
    let handled = signalRef.current?.id;
    let t0 = performance.now();
    let raf = 0;
    const dabs: Dab[] = [];
    type Jump = { sx: number; sy: number; tx: number; ty: number; cx: number; cy: number; dur: number; t: number; to: Spot };
    let next: Jump | null = null; // the hop being prepared (the moth turns to face it first)
    let jump: Jump | null = null;

    host.setAttribute("data-moth-out", ""); // the header icon hides: the moth is standing in for it
    el.style.opacity = "1";

    const place = (now: number) => {
      const flap = mode === "fly" ? clamp((p - 0.5) / 0.3, 0, 1) * 0.22 * Math.sin((now / 1000) * Math.PI * 2 * 7) : 0;
      const breathe = mode === "walk" && !wall ? 0.04 * Math.sin(now / 320) : 0;
      const quiver = mode === "rest" && !wall ? 0.1 * shiver * Math.sin(now / 38) : 0;
      setMothOpen(topSvg, clamp(p + flap + breathe + quiver, 0, 1));
      // the roll turns it about its own body line: its back faces you at 0, its flank faces you at 1
      const dirn = rollSide === "L" ? 1 : -1;
      turner.style.transform = `rotateY(${90 * dirn * ease(roll)}deg)`;
      sface.style.transform = rollSide === "L" ? "rotateY(-90deg)" : "rotateY(90deg) scaleX(-1)";
      const sway = mode === "walk" && !wall ? Math.sin(now / 240) * 0.05 : 0;
      el.style.transform = `translate3d(${pos.x - BOX_W / 2}px, ${pos.y - SIZE / 2}px, 0) rotate(${heading + Math.PI / 2 + sway}rad) scale(${scale * (1 - 0.07 * squash)})`;
      el.style.filter = lift > 0.04 ? `drop-shadow(0 ${(lift * 9).toFixed(1)}px ${(lift * 5).toFixed(1)}px rgba(57,54,54,${(0.08 + 0.14 * lift).toFixed(2)}))` : "none";
    };

    if (reduced) {
      mode = "rest";
      const l = findLedge("composer");
      pos.x = l ? (l.x0 + l.x1) / 2 : w * 0.5;
      pos.y = l ? l.y : botY();
      heading = -Math.PI / 2;
      place(0);
      return () => {
        ro.disconnect();
        host.removeAttribute("data-moth-out");
        host.removeAttribute("data-moth-away");
      };
    }
    place(t0);

    const prepare = () => {
      const to = pickSpot(pos);
      const dx = to.x - pos.x;
      const dy = to.y - pos.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      const bend = (Math.random() < 0.5 ? -1 : 1) * len * 0.14;
      next = {
        sx: pos.x,
        sy: pos.y,
        tx: to.x,
        ty: to.y,
        cx: pos.x + dx / 2 + (-dy / len) * bend,
        cy: pos.y + dy / 2 + (dx / len) * bend - len * 0.1, // a hop, so the arc rises
        dur: 0.65 + len / 560,
        t: 0,
        to,
      };
      if (to.wall) rollSide = to.wall;
      mode = "aim";
      pt = 0.5; // wings begin to open as it turns
    };

    const beginWalk = () => {
      const t = topY() - 10;
      const b = pos.y > calmY() + 20 ? botY() + 6 : calmY(); // starts low: stays low; otherwise keeps to the open space
      let len = rand(50, 95);
      if (wall) {
        len = Math.min(len, pos.y - t); // climbs, so it is always going head first
        if (len < 25) {
          mode = "rest";
          timer = rand(1, 2);
          return;
        }
        strokeLen = len;
        walkT = 0;
        mode = "walk";
        return;
      }
      if (ledge) {
        // along the top edge, whichever way has more room
        const left = pos.x - (ledge.x0 + 16);
        const right = ledge.x1 - 16 - pos.x;
        const go = right >= left ? 1 : -1;
        len = Math.min(rand(60, 110), Math.max(left, right));
        if (len < 24) {
          mode = "rest";
          timer = rand(1, 1.6);
          return;
        }
        walkHeading = go > 0 ? 0 : Math.PI;
        strokeLen = len;
        lowWalk = false;
        pt = 0.55;
        mode = "settle";
        timer = 0;
        return;
      }
      let ang = rand(0, Math.PI * 2);
      for (let n = 0; n < 14; n++) {
        const a = rand(0, Math.PI * 2);
        const ex = pos.x + Math.cos(a) * len;
        const ey = pos.y + Math.sin(a) * len;
        if (ex > 22 && ex < w - 22 && ey > t && ey < b) {
          ang = a;
          break;
        }
        len *= 0.93;
      }
      walkHeading = ang;
      lowWalk = pos.y > calmY() + 20;
      strokeLen = len;
      pt = 0.55; // open the wings and turn to face the way it will walk; it sets off once both are done
      mode = "settle";
      timer = 0;
    };

    const dab = () => {
      const i = dabIndex++;
      const x = wall === "L" ? 5 : wall === "R" ? w - 5 : pos.x - Math.cos(heading) * 3;
      const y = wall ? pos.y : pos.y - Math.sin(heading) * 3;
      dabs.push({
        x,
        y,
        r: (wall ? 2.6 : 3) + 0.7 * Math.sin(i * 0.12) + 0.4 * Math.sin(i * 0.31 + 1) + Math.random() * 0.3,
        k: Array.from({ length: 9 }, Math.random),
        t: performance.now(),
      });
    };

    let lastDraw = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;

      p += (pt - p) * Math.min(1, dt * 5); // wings glide to their next pose
      squash = Math.max(0, squash - dt * 4.5);
      shiverAt -= dt;
      if (shiverAt <= 0) {
        shiver = 1;
        shiverAt = rand(1.8, 3.8);
      }
      shiver = Math.max(0, shiver - dt * 3.5);

      // the user sent a question, or the answer arrived: go to the input box / the answer next
      const sg = signalRef.current;
      if (sg && sg.id !== handled) {
        handled = sg.id;
        pending = sg.kind === "send" ? "composer" : "reply";
        if (mode === "walk") strokeLen = Math.min(strokeLen, 5);
        else if (mode === "settle" || mode === "rest") {
          strokeLen = 0;
          mode = "rest";
          timer = Math.min(timer, 0.25);
        } else if (mode === "wake") timer = Math.min(timer, 0.3);
      }

      // standing on a ledge: ride along with it if the chat scrolls or the text grows
      if (ledge && (mode === "settle" || mode === "walk" || mode === "rest")) {
        const L = measure(ledge.el, ledge.kind);
        if (!L) ledge = null;
        else {
          ledge = L;
          pos.y += (L.y - pos.y) * Math.min(1, dt * 8);
          pos.x = clamp(pos.x, L.x0 + 14, L.x1 - 14);
        }
      }

      if (mode === "wake") {
        timer -= dt;
        if (timer < 0.35) pt = 0.25; // a stretch of the wings before it goes
        if (timer <= 0) prepare();
      } else if (mode === "aim" && next) {
        // turn in place to face the way it will hop (and, from a wall, peel off it)
        const face = Math.atan2(next.cy - next.sy, next.cx - next.sx);
        heading += wrap(face - heading) * Math.min(1, dt * 5);
        if (wall) {
          roll = Math.max(0, roll - dt / 0.8);
          pos.x = landX(wall) + (clingX(wall) - landX(wall)) * ease(roll);
        }
        if (Math.abs(wrap(face - heading)) < 0.1 && roll <= 0 && p > 0.4) {
          wall = null;
          ledge = null;
          timer = 0.3;
          mode = "crouch";
        }
      } else if (mode === "crouch" && next) {
        // gathers itself, wings lifting, then springs
        timer -= dt;
        const k = ease(clamp(1 - timer / 0.3, 0, 1));
        scale = 1 - 0.1 * k;
        pt = 0.7;
        if (timer <= 0) {
          jump = next;
          next = null;
          pt = 0.85;
          mode = "fly";
        }
      } else if (mode === "fly" && jump) {
        if (jump.to.ledge) {
          const L = measure(jump.to.ledge.el, jump.to.ledge.kind);
          if (L) {
            jump.ty = L.y;
            jump.to.ledge = L;
          }
        }
        jump.t = Math.min(1, jump.t + dt / jump.dur);
        const t = jump.t;
        const u = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2; // gathers, leaps, settles
        const a = (1 - u) ** 2;
        const b = 2 * (1 - u) * u;
        const c = u * u;
        const flutter = Math.sin(t * Math.PI * 7) * 2 * Math.sin(Math.PI * t); // a moth's hop is never perfectly smooth
        const dx = 2 * (1 - u) * (jump.cx - jump.sx) + 2 * u * (jump.tx - jump.cx);
        const dy = 2 * (1 - u) * (jump.cy - jump.sy) + 2 * u * (jump.ty - jump.cy);
        const tangent = Math.atan2(dy, dx); // always facing the way it is going
        const len = Math.hypot(dx, dy) || 1;
        pos.x = a * jump.sx + b * jump.cx + c * jump.tx + (-dy / len) * flutter;
        pos.y = a * jump.sy + b * jump.cy + c * jump.ty + (dx / len) * flutter;
        lift = Math.sin(Math.PI * t);
        scale = 1 + 0.16 * lift - 0.1 * (1 - ease(clamp(t / 0.25, 0, 1))); // springs up out of the crouch
        if (jump.to.wall) {
          // coming down on a wall: it brings its head up and rolls onto its side as it lands
          const k = ease(clamp((t - 0.55) / 0.45, 0, 1));
          heading = tangent + wrap(-Math.PI / 2 - tangent) * k;
          roll = k;
          if (t > 0.5) pt = 0;
        } else {
          heading = tangent;
          if (t > 0.8) pt = 0;
        }
        if (t >= 1) {
          scale = 1;
          lift = 0;
          squash = 1;
          wall = jump.to.wall;
          ledge = jump.to.ledge ?? null;
          jump = null;
          pt = 0;
          if (wall) {
            roll = 1;
            heading = -Math.PI / 2;
            clung = false;
            mode = "rest";
            timer = rand(1, 1.6);
          } else {
            mode = "settle";
            timer = ledge ? rand(0.5, 0.9) : rand(0.9, 1.4);
          }
        }
      } else if (mode === "settle") {
        timer -= dt;
        if (timer <= 0 && strokeLen === 0) beginWalk();
        else if (strokeLen > 0) {
          // facing its way and wings open: only now does it set off
          heading += wrap(walkHeading - heading) * Math.min(1, dt * 4);
          if (Math.abs(wrap(walkHeading - heading)) < 0.08 && p > 0.45) {
            walkT = 0;
            mode = "walk";
          }
        }
      } else if (mode === "walk") {
        // ease into the walk and out of it: speed ramps up over the first moments and drops near the end
        walkT += dt;
        const go = clamp(walkT / 0.8, 0, 1) * clamp(strokeLen / 14, 0.15, 1);
        const step = (wall ? 13 : 16) * dt * go;
        const t = topY() - 10;
        const b = lowWalk ? botY() + 6 : calmY();
        if (wall) pos.y -= step;
        else if (ledge) pos.x += Math.cos(heading) * step; // along the top edge
        else {
          // a gentle curve; near an edge of its area it steers back inwards while still going forward
          const cx = w / 2;
          const cy = (t + b) / 2;
          const margin = 26;
          const near = pos.x < margin || pos.x > w - margin || pos.y < t + 8 || pos.y > b - 8;
          if (near) heading += wrap(Math.atan2(cy - pos.y, cx - pos.x) - heading) * Math.min(1, dt * 2.5);
          else heading += Math.sin(now / 1100) * 0.25 * dt;
          pos.x = clamp(pos.x + Math.cos(heading) * step, 16, w - 16);
          pos.y = clamp(pos.y + Math.sin(heading) * step, t, b);
        }
        sinceDab += step;
        strokeLen -= step;
        while (sinceDab >= DAB_GAP) {
          sinceDab -= DAB_GAP;
          dab();
        }
        if (strokeLen < 22) pt = 0; // wings begin to fold as it slows to a stop
        if (strokeLen <= 0) {
          strokeLen = 0;
          mode = "rest";
          pt = 0;
          // thinking: keeps pacing the input box; on a ledge: lingers; down by the text: not long
          timer = ledge?.kind === "composer" && busyRef.current ? rand(0.5, 0.9) : ledge ? rand(4.5, 7) : pos.y > calmY() + 20 ? rand(1, 1.8) : rand(3.5, 6);
        }
      } else {
        // rest
        timer -= dt;
        if (timer <= 0) {
          if (ledge?.kind === "composer" && busyRef.current && !pending) beginWalk(); // paces the input box while it thinks
          else if (wall && !clung && !pending) {
            clung = true;
            beginWalk();
          } else prepare();
        }
      }
      if (mode === "fly" || mode === "aim" || mode === "crouch") host.setAttribute("data-moth-away", ""); // the title slides left into the gap

      place(now);

      if (now - lastDraw > 33) {
        lastDraw = now;
        ctx.clearRect(0, 0, w, h);
        const tNow = performance.now();
        while (dabs.length && (tNow - dabs[0].t) / 1000 > LIFE) dabs.shift();
        for (const d of dabs) paintDab(ctx, d, (tNow - d.t) / 1000);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeAttribute("data-moth-out");
      host.removeAttribute("data-moth-away");
    };
  }, [active]);

  const face = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as const;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
      <div ref={mothEl} className="absolute left-0 top-0 will-change-transform" style={{ width: BOX_W, height: SIZE, opacity: 0, perspective: 200 }}>
        <div ref={turnEl} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          <div data-top className="absolute inset-0" style={face}>
            <MothIcon size={SIZE} />
          </div>
          <div ref={sideFace} className="absolute inset-0 grid place-items-center" style={face}>
            <MothSideIcon size={SIZE} />
          </div>
        </div>
      </div>
    </div>
  );
}
