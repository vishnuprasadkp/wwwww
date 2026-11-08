"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The painting on the right of the home hero. It is made, live, from the bare paper, every visit, the way a
 * watercolourist would make it.
 *
 *  1. The washes: slate-grey and orange paint opens at random places on the paper and spreads, one wash after another.
 *     They are generated from noise at run time (pigment that pools darker at the edge, thins where it is wet, leaves
 *     bare paper and salt-speckles, has the grain of the paper in it), different every time. Splatter is flicked in
 *     with the paint's own colours: blobs with a darker rim, streaks where it was thrown fast, a fine mist, and drips.
 *  2. The beetle: a painted beetle (public/images/site/hero-beetle-v6-*.webp), taken apart into its wings, wing cases,
 *     head, six legs and two feelers. Each part is painted in by its own brush stroke, one after another.
 *  3. Then it lifts off the paper and flies, slowly. It is a small 3D puppet: every part is a card in space, turned by
 *     yaw, pitch and roll and drawn with a little perspective, so it banks into its turns, tips its nose, shows one side
 *     and then the other, and its wings really beat (up and down, not just shrinking). It drifts along a random path
 *     with a soft shadow on the paper and leaves faint stains that dry away. Nothing repeats.
 *
 * Nothing starts until the opening loader has gone; with reduced motion the finished painting is drawn still.
 */

type Pt = [number, number];
type V3 = [number, number, number];
type Rgb = [number, number, number];
// the size of the painting is the size of the hero section; these are set from it when the painting starts
let W = 1400;
let H = 900;
let CX = W * 0.6;
let CY = H * 0.5;
let SC = 1; // how big the pools of paint are, against a 1400 px wide stage

const ORANGE: Rgb[] = [[246, 166, 70], [240, 140, 52], [232, 115, 32], [226, 104, 28], [214, 92, 24]];
const SLATE: Rgb[] = [[112, 124, 138], [98, 108, 122], [88, 98, 110], [70, 78, 90]];
const str = (c: Rgb) => `${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])}`;
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const SRC = { core: "/images/site/hero-beetle-v6-core.webp", limbs: "/images/site/hero-beetle-v6-limbs.webp", wing: "/images/site/hero-beetle-v6-wing.webp" };
/** The beetle's own coordinates are those of its painting (a 1024 px square, its middle at 512, 460). */
const BODY_C: Pt = [512, 460];
const SHOULDER: [Pt, Pt] = [[405, 395], [618, 395]];
let KB = 0.4; // painting px -> stage px
const WING_U = 640; // a wing is this long, in painting px
const WING_ASPECT = 1282 / 766;
const WING_BASE: Pt = [0.0603, 0.4627]; // where a wing joins the body, as a fraction of the wing picture
const TILT = -0.16;
const D = 1000; // distance of the eye, for a little perspective

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const clamp01 = (x: number) => clamp(x, 0, 1);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 0.85;
const angDiff = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const make = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
};
const load = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
/** Smooth, never-repeating wander in about -1..1: three sines at unrelated speeds, each with its own random start. */
const wander = () => {
  const s = [Math.random() * 6.283, Math.random() * 6.283, Math.random() * 6.283];
  return (t: number) => (Math.sin(t * 0.91 + s[0]) + 0.7 * Math.sin(t * 1.73 + s[1]) + 0.4 * Math.sin(t * 2.89 + s[2])) / 2.1;
};

/* ------------------------------------------------------------------ noise: the pigment of the washes */

const hash = (x: number, y: number, seed: number) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const vnoise = (x: number, y: number, seed: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy, seed);
  const b = hash(ix + 1, iy, seed);
  const c = hash(ix, iy + 1, seed);
  const d = hash(ix + 1, iy + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
/** Layers of noise, big shapes and fine detail: about 0..1. */
const fbm = (x: number, y: number, seed: number, oct = 4) => {
  let s = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    s += a * vnoise(x * f, y * f, seed + i * 17);
    f *= 2;
    a *= 0.5;
  }
  return s / (1 - Math.pow(0.5, oct));
};

/* ------------------------------------------------------------------ sprites and the brush */

/** A painted part: a canvas, and where its top-left corner sits (ox, oy) and how big it is (w, h) in the units of the part's own drawing. */
type Sprite = { c: HTMLCanvasElement; ox: number; oy: number; w: number; h: number };

/** Uncovers a painted sprite with soft dabs travelling along `guide` between `from` and `to` seconds, like a brush stroke. */
class Brush {
  mask: HTMLCanvasElement;
  g: CanvasRenderingContext2D;
  tmp: HTMLCanvasElement;
  tg: CanvasRenderingContext2D;
  done = false;
  n = 0;
  private f = 0.25; // mask pixels per sprite pixel
  private scale: number; // sprite pixels per unit
  constructor(public sp: Sprite, private guide: Pt[], private from: number, private to: number, private rad: number, private dabs = 46) {
    this.scale = sp.c.width / sp.w;
    this.mask = make(sp.c.width * this.f, sp.c.height * this.f);
    this.g = this.mask.getContext("2d")!;
    this.tmp = make(sp.c.width, sp.c.height);
    this.tg = this.tmp.getContext("2d")!;
  }
  update(t: number) {
    if (this.done) return;
    const p = clamp01((t - this.from) / (this.to - this.from));
    const want = Math.floor(p * this.dabs);
    while (this.n < want) {
      const u = (this.n + 0.5) / this.dabs;
      const last = this.guide.length - 1;
      const i = Math.min(last - 1, Math.floor(u * last));
      const a = this.guide[i];
      const b = this.guide[i + 1];
      const k = u * last - i;
      const x = (a[0] + (b[0] - a[0]) * k - this.sp.ox) * this.scale * this.f + gauss() * 2;
      const y = (a[1] + (b[1] - a[1]) * k - this.sp.oy) * this.scale * this.f + gauss() * 2;
      const r = this.rad * this.scale * this.f * rnd(0.85, 1.2);
      const gr = this.g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, "rgba(255,255,255,0.9)");
      gr.addColorStop(0.6, "rgba(255,255,255,0.7)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      this.g.fillStyle = gr;
      this.g.beginPath();
      this.g.arc(x, y, r, 0, 6.283);
      this.g.fill();
      this.n++;
    }
    if (p >= 1) {
      this.g.fillStyle = "#fff";
      this.g.fillRect(0, 0, this.mask.width, this.mask.height);
      this.done = true;
    }
  }
  /** The sprite as far as it has been painted. */
  get(t: number): HTMLCanvasElement | null {
    if (this.done) return this.sp.c;
    if (t < this.from) return null;
    this.tg.globalCompositeOperation = "source-over";
    this.tg.clearRect(0, 0, this.tmp.width, this.tmp.height);
    this.tg.drawImage(this.sp.c, 0, 0);
    this.tg.globalCompositeOperation = "destination-in";
    this.tg.drawImage(this.mask, 0, 0, this.tmp.width, this.tmp.height);
    return this.tmp;
  }
}

/** Paint spreading from a point like ink dropped in water: several lobes grow outwards at their own pace, softly feathered, and the wash is uncovered behind the front. */
class Bloom {
  mask: HTMLCanvasElement;
  g: CanvasRenderingContext2D;
  tmp: HTMLCanvasElement;
  tg: CanvasRenderingContext2D;
  done = false;
  private f = 0.25;
  private scale: number;
  private lobes: { a: number; d: number; k: number }[];
  constructor(public sp: Sprite, private cx: number, private cy: number, private from: number, private to: number, private rmax: number) {
    this.scale = sp.c.width / sp.w;
    this.mask = make(sp.c.width * this.f, sp.c.height * this.f);
    this.g = this.mask.getContext("2d")!;
    this.tmp = make(sp.c.width, sp.c.height);
    this.tg = this.tmp.getContext("2d")!;
    this.lobes = Array.from({ length: 8 }, () => ({ a: rnd(0, 6.283), d: rnd(0, 0.4), k: rnd(0.7, 1.15) }));
  }
  update(t: number) {
    if (this.done) return;
    const p = clamp01((t - this.from) / (this.to - this.from));
    if (p <= 0) return;
    const g = this.g;
    if (p >= 1) {
      g.globalCompositeOperation = "source-over";
      g.fillStyle = "#fff";
      g.fillRect(0, 0, this.mask.width, this.mask.height);
      this.done = true;
      return;
    }
    const grow = Math.sqrt(p) * (1 - 0.25 * (1 - p)); // quick at first, then it slows as the water thins
    g.globalCompositeOperation = "source-over";
    g.clearRect(0, 0, this.mask.width, this.mask.height);
    g.globalCompositeOperation = "lighter";
    const k = this.scale * this.f;
    for (const l of this.lobes) {
      const x = (this.cx + Math.cos(l.a) * l.d * this.rmax * grow - this.sp.ox) * k;
      const y = (this.cy + Math.sin(l.a) * l.d * this.rmax * grow - this.sp.oy) * k;
      const r = this.rmax * l.k * grow * k;
      const gr = g.createRadialGradient(x, y, 0, x, y, Math.max(1, r));
      gr.addColorStop(0, "rgba(255,255,255,1)");
      gr.addColorStop(0.55, "rgba(255,255,255,0.85)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.beginPath();
      g.arc(x, y, Math.max(1, r), 0, 6.283);
      g.fill();
    }
  }
  get(t: number): HTMLCanvasElement | null {
    if (this.done) return this.sp.c;
    if (t < this.from) return null;
    this.tg.globalCompositeOperation = "source-over";
    this.tg.clearRect(0, 0, this.tmp.width, this.tmp.height);
    this.tg.drawImage(this.sp.c, 0, 0);
    this.tg.globalCompositeOperation = "destination-in";
    this.tg.drawImage(this.mask, 0, 0, this.tmp.width, this.tmp.height);
    return this.tmp;
  }
}

/** A piece cut out of a painting: the box (x0, y0)-(x1, y1), kept only inside `poly` if given. */
function cut(img: HTMLImageElement, x0: number, y0: number, x1: number, y1: number, poly?: Pt[]): Sprite {
  const c = make(x1 - x0, y1 - y0);
  const g = c.getContext("2d")!;
  g.drawImage(img, -x0, -y0);
  if (poly) {
    g.globalCompositeOperation = "destination-in";
    g.fillStyle = "#fff";
    g.beginPath();
    poly.forEach(([x, y], i) => (i ? g.lineTo(x - x0, y - y0) : g.moveTo(x - x0, y - y0)));
    g.closePath();
    g.fill();
  }
  return { c, ox: x0, oy: y0, w: x1 - x0, h: y1 - y0 };
}

/** Where, in the painting of the beetle, each limb is cut out and where it joins the body (its pivot). */
const LEGS: { box: [number, number, number, number]; pivot: Pt; guide: Pt[] }[] = [
  { box: [336, 268, 396, 366], pivot: [388, 352], guide: [[388, 352], [368, 318], [352, 285]] },
  { box: [292, 368, 384, 502], pivot: [380, 384], guide: [[380, 384], [340, 430], [308, 490]] },
  { box: [304, 508, 352, 680], pivot: [344, 520], guide: [[344, 520], [332, 590], [328, 668]] },
  { box: [628, 268, 690, 366], pivot: [636, 350], guide: [[636, 350], [656, 318], [674, 285]] },
  { box: [640, 368, 722, 502], pivot: [644, 384], guide: [[644, 384], [684, 430], [712, 490]] },
  { box: [670, 508, 716, 680], pivot: [676, 522], guide: [[676, 522], [690, 590], [694, 668]] },
];
const FEELERS: { box: [number, number, number, number]; pivot: Pt; guide: Pt[] }[] = [
  { box: [384, 112, 474, 176], pivot: [462, 178], guide: [[462, 178], [430, 150], [412, 122]] },
  { box: [550, 112, 640, 176], pivot: [562, 178], guide: [[562, 178], [594, 150], [612, 122]] },
];

/* ------------------------------------------------------------------ splatter that looks like paint */

/** A drop of paint that has landed: an uneven blob with a darker rim, and for the bigger ones a bare-paper glint and tiny satellites. */
function blob(g: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: Rgb) {
  const n = 9;
  const pts: Pt[] = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 6.283;
    const rr = r * (0.72 + Math.random() * 0.5);
    return [x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.92];
  });
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    if (i === 0) g.moveTo((pts[n - 1][0] + a[0]) / 2, (pts[n - 1][1] + a[1]) / 2);
    g.quadraticCurveTo(a[0], a[1], mx, my);
  }
  g.closePath();
  g.fillStyle = `rgba(${str(rgb)},${r > 3 ? 0.34 : 0.5})`;
  g.fill();
  g.lineWidth = Math.max(0.7, r * 0.13);
  g.strokeStyle = `rgba(${str(mix(rgb, [30, 30, 36], 0.35))},${r > 3 ? 0.55 : 0.5})`;
  g.stroke();
  if (r > 4.5) {
    g.fillStyle = "rgba(255,255,255,0.2)";
    g.beginPath();
    g.ellipse(x - r * 0.25, y - r * 0.28, r * 0.22, r * 0.14, -0.5, 0, 6.283);
    g.fill();
    for (let i = 0; i < 3; i++) {
      const a = Math.random() * 6.283;
      const d = r * rnd(1.5, 2.8);
      blob(g, x + Math.cos(a) * d, y + Math.sin(a) * d, r * rnd(0.12, 0.26), rgb);
    }
  }
}
/** Paint thrown fast: a teardrop with its tail trailing back along the way it came. */
function streak(g: CanvasRenderingContext2D, x: number, y: number, r: number, vx: number, vy: number, rgb: Rgb) {
  const sp = Math.hypot(vx, vy) || 1;
  const ux = vx / sp;
  const uy = vy / sp;
  const len = r * rnd(3, 6.5);
  const nx = -uy;
  const ny = ux;
  g.beginPath();
  g.moveTo(x + ux * r * 0.6, y + uy * r * 0.6);
  g.quadraticCurveTo(x + nx * r * 1.05, y + ny * r * 1.05, x - ux * len, y - uy * len);
  g.quadraticCurveTo(x - nx * r * 1.05, y - ny * r * 1.05, x + ux * r * 0.6, y + uy * r * 0.6);
  g.closePath();
  g.fillStyle = `rgba(${str(rgb)},0.4)`;
  g.fill();
  g.lineWidth = 0.7;
  g.strokeStyle = `rgba(${str(mix(rgb, [30, 30, 36], 0.3))},0.45)`;
  g.stroke();
  g.beginPath();
  g.arc(x + ux * r * 0.1, y + uy * r * 0.1, r * 0.95, 0, 6.283);
  g.fillStyle = `rgba(${str(rgb)},0.42)`;
  g.fill();
}

export default function HeroBeetle() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    let alive = true;
    let raf = 0;
    const cleanup: (() => void)[] = [];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // the painting fills the whole hero section behind the words
    const host = cv.parentElement as HTMLElement;
    const hb = host.getBoundingClientRect();
    W = Math.max(320, Math.round(hb.width));
    H = Math.max(360, Math.round(hb.height));
    CX = W * 0.5;
    CY = H * 0.5;
    SC = 1;
    KB = clamp(Math.min(W * 0.6, H * 1.5), 260, 760) / (WING_U * 2);
    const ps = clamp(Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1.8e6 / (W * H))), 0.75, 1.5);
    const builtW = W;
    const builtH = H;
    cv.width = Math.round(W * ps);
    cv.height = Math.round(H * ps);
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(ps, 0, 0, ps, 0, 0);
    const layer = () => {
      const c = make(W * ps, H * ps);
      const g = c.getContext("2d")!;
      g.setTransform(ps, 0, 0, ps, 0, 0);
      return [c, g] as const;
    };
    const ro = new ResizeObserver(() => {
      const r = host.getBoundingClientRect();
      if (Math.abs(r.width - builtW) / builtW > 0.25 || Math.abs(r.height - builtH) / builtH > 0.3) setKey((k) => k + 1);
    });
    ro.observe(host);
    cleanup.push(() => ro.disconnect());
    const seed = Math.floor(Math.random() * 9999);

    const build = ([core, limbs, wingImg]: HTMLImageElement[]) => {
      if (!alive) return;

      /* ---------------- the beetle, taken apart ---------------- */
      // the seam between the shield and the wing cases dips a little in the middle
      const cutY = (x: number) => 366 + 14 * clamp01(1 - Math.abs(x - 512) / 110);
      const upper: Pt[] = [[320, 170], [704, 170], [704, 366], [622, 366], [566, cutY(566)], [512, cutY(512)], [458, cutY(458)], [402, 366], [320, 366]];
      const lowerL: Pt[] = [[320, 366], [402, 366], [458, cutY(458)], [512, cutY(512)], [513, 812], [320, 812]];
      const lowerR: Pt[] = [[704, 366], [622, 366], [566, cutY(566)], [511, cutY(512)], [511, 812], [704, 812]];
      const head = cut(core, 320, 170, 704, 392, upper);
      const elyL = cut(core, 320, 350, 513, 812, lowerL);
      const elyR = cut(core, 511, 350, 704, 812, lowerR);
      const legs = LEGS.map((l) => ({ ...l, sp: cut(limbs, ...l.box) }));
      const feelers = FEELERS.map((l) => ({ ...l, sp: cut(limbs, ...l.box) }));
      // a wing is the whole wing picture, its base at (0, 0)
      const wc = make(wingImg.width, wingImg.height);
      wc.getContext("2d")!.drawImage(wingImg, 0, 0);
      const WING_H = WING_U / WING_ASPECT;
      const wing: Sprite = { c: wc, ox: -WING_BASE[0] * WING_U, oy: -WING_BASE[1] * WING_H, w: WING_U, h: WING_H };

      /* ---------------- the washes: random pools of slate and orange, each painted with its own brush ---------------- */
      type Wash = { sp: Sprite; brush: Bloom };
      const washes: Wash[] = [];
      type Setup = { x: number; y: number; r: number; pig: [Rgb, Rgb]; a: number; from: number; dur: number; veil?: boolean };
      const setup: Setup[] = [];
      // thin veils over the whole band first, then pools of pigment spread over it
      const VR = Math.max(W * 0.3, H * 1.2);
      setup.push({ x: W * 0.32, y: H * 0.5, r: VR, pig: [SLATE[0], SLATE[1]], a: 0.22, from: 0.1, dur: 4, veil: true });
      setup.push({ x: W * 0.7, y: H * 0.5, r: VR, pig: [ORANGE[0], ORANGE[1]], a: 0.22, from: 0.6, dur: 4, veil: true });
      const kinds: { pig: [Rgb, Rgb]; a: number }[] = [
        { pig: [SLATE[0], SLATE[3]], a: 0.6 },
        { pig: [ORANGE[1], ORANGE[3]], a: 0.62 },
        { pig: [SLATE[1], SLATE[2]], a: 0.55 },
        { pig: [ORANGE[0], ORANGE[2]], a: 0.58 },
        { pig: [SLATE[0], SLATE[2]], a: 0.56 },
        { pig: [ORANGE[2], ORANGE[4]], a: 0.5 },
        { pig: [SLATE[3], SLATE[2]], a: 0.5 },
        { pig: [ORANGE[0], ORANGE[1]], a: 0.5 },
        { pig: [SLATE[1], SLATE[0]], a: 0.44 },
        { pig: [ORANGE[3], ORANGE[1]], a: 0.46 },
        { pig: [SLATE[2], SLATE[0]], a: 0.5 },
        { pig: [ORANGE[1], ORANGE[2]], a: 0.5 },
        { pig: [SLATE[1], SLATE[3]], a: 0.5 },
        { pig: [ORANGE[0], ORANGE[3]], a: 0.46 },
      ];
      // places spread along the band, in a random order
      const cols = Math.max(5, Math.round(W / 300));
      const cells: Pt[] = [];
      for (let k = 0; k < kinds.length; k++) cells.push([((k % cols) + 0.5) / cols, k < cols ? 0.34 : 0.68]);
      cells.sort(() => Math.random() - 0.5);
      let at = 0.9;
      kinds.forEach((k, i) => {
        const c = cells[i % cells.length];
        setup.push({ x: W * (c[0] + rnd(-0.04, 0.04)), y: H * (c[1] + rnd(-0.1, 0.1)), r: clamp(H * rnd(0.7, 1.0), 200, 480), pig: k.pig, a: k.a, from: at, dur: rnd(3, 4.5) });
        at += rnd(0.3, 0.55);
      });
      const WS = 0.4;
      setup.forEach((s, wi) => {
        const R = s.r;
        const box = R * 3;
        const ox = s.x - box / 2;
        const oy = s.y - box / 2;
        const px = Math.ceil(box * WS);
        const data = new ImageData(px, px);
        const d = data.data;
        const cell = R * 0.62 * WS;
        const sd = seed + 40 + wi * 7;
        for (let y = 0; y < px; y++) {
          for (let x = 0; x < px; x++) {
            // the edge wanders (the noise is bent by more noise), and the paint thins towards it
            const wx = (fbm(x / (cell * 1.6), y / (cell * 1.6), sd + 1) - 0.5) * cell * 1.6;
            const wy = (fbm(x / (cell * 1.6) + 9, y / (cell * 1.6), sd + 2) - 0.5) * cell * 1.6;
            const dx = (x - px / 2) / (R * WS);
            const dy = (y - px / 2) / (R * WS);
            const rr = dx * dx * 0.9 + dy * dy * 1.1;
            // fingers of pigment creeping out from the middle, like ink opening in water
            const ang = Math.atan2(dy, dx);
            const dist = Math.sqrt(rr);
            const fing = fbm(Math.cos(ang) * 2.4 + 5, Math.sin(ang) * 2.4 + dist * 1.6, sd + 11, 3) - 0.5;
            const f = fbm((x + wx) / cell, (y + wy) / cell, sd) * 1.35 - 0.3 - rr * 0.95 + (s.veil ? 0 : 0.5 * fing * smooth(0.15, 0.75, dist));
            const e = smooth(0, s.veil ? 0.14 : 0.06, f);
            if (e <= 0) continue;
            const dens = smooth(0, 0.55, f);
            const rim = Math.exp(-Math.pow(f / 0.045, 2)); // the darker line where the paint pooled and dried
            const n2 = fbm(x / (cell * 0.45) + 20, y / (cell * 0.45), sd + 5);
            const n3 = fbm(x / (cell * 1.3) + 40, y / (cell * 1.3), sd + 6);
            const n4 = fbm(x / (cell * 0.2) + 70, y / (cell * 0.2), sd + 8, 2);
            const t = smooth(0.25, 0.75, n3);
            const i = (y * px + x) * 4;
            const dark = (1 - 0.34 * rim) * (1 - 0.26 * dens * n2 * (s.veil ? 0 : 1));
            d[i] = (s.pig[0][0] + (s.pig[1][0] - s.pig[0][0]) * t) * dark;
            d[i + 1] = (s.pig[0][1] + (s.pig[1][1] - s.pig[0][1]) * t) * dark;
            d[i + 2] = (s.pig[0][2] + (s.pig[1][2] - s.pig[0][2]) * t) * dark;
            const gr = hash(x, y, sd + 3);
            let a = s.a * e * (0.3 + 0.7 * dens) * (0.62 + 0.38 * n2) + (s.veil ? 0 : rim * 0.26 * e);
            if (n4 > 0.7 && !s.veil) a *= 0.5; // salt: little lights where the paint was pushed away
            a *= 1 - 0.25 * gr * gr; // the grain of the paper
            d[i + 3] = clamp01(a) * 255;
          }
        }
        const c = make(px, px);
        c.getContext("2d")!.putImageData(data, 0, 0);
        const sp: Sprite = { c, ox, oy, w: box, h: box };
        washes.push({ sp, brush: new Bloom(sp, s.x, s.y, s.from, s.from + s.dur, R * 1.25) });
      });
      const washEnd = Math.max(...setup.map((s) => s.from + s.dur));

      /* ---------------- the beetle's brushes: each part is painted along its own path ---------------- */
      const t0 = washEnd - 1.4; // the beetle starts to be painted while the last wash is still wet
      const stroke = (sp: Sprite, guide: Pt[], from: number, dur: number, rad: number, dabs: number) => new Brush(sp, guide, from, from + dur, rad, dabs);
      const wingGuide: Pt[] = [[0, 0], [120, -14], [260, -22], [400, -24], [520, -18], [620, -12]];
      const bWing = [stroke(wing, wingGuide, t0 + 0.2, 3, 90, 60), stroke(wing, wingGuide, t0 + 0.6, 3, 90, 60)];
      const bElyL = stroke(elyL, [[505, 392], [470, 430], [430, 520], [420, 620], [450, 720], [505, 790]], t0 + 1.6, 1.4, 120, 40);
      const bElyR = stroke(elyR, [[519, 392], [554, 430], [594, 520], [604, 620], [574, 720], [519, 790]], t0 + 1.9, 1.4, 120, 40);
      const bHead = stroke(head, [[420, 300], [512, 245], [600, 300], [512, 205]], t0 + 3.2, 0.9, 100, 30);
      const bLegs = legs.map((l, i) => stroke(l.sp, l.guide, t0 + 4 + i * 0.3, 0.6, 30, 14));
      const bFeel = feelers.map((l, i) => stroke(l.sp, l.guide, t0 + 5.8 + i * 0.25, 0.6, 32, 12));
      const brushes = [...bWing, bElyL, bElyR, bHead, ...bLegs, ...bFeel];
      brushes.forEach((b) => b.update(1e6)); // the beetle is already painted; it comes in from the side
      const flyFrom = washEnd - 1.5;

      /* ---------------- the stage ---------------- */
      const [bg, bgg] = layer(); // splatter and drips, once they have landed
      const [trail, trg] = layer(); // faint stains the beetle leaves as it flies; they dry away
      const [stage, sg] = layer();
      const [bl, blg] = layer(); // the beetle, drawn on its own so it can cast a shadow

      // paint flicked off a brush: it flies, then lands as a blob (or a streak, if it was fast), and a fine mist falls around
      type Drop = { x: number; y: number; vx: number; vy: number; r: number; rgb: Rgb; born: number; life: number; kind: "blob" | "mist" };
      const drops: Drop[] = [];
      const pigOf = (s: Setup) => mix(s.pig[0], s.pig[1], Math.random());
      const flick = (x: number, y: number, n: number, t: number, pig: [Rgb, Rgb], speed = 1) => {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * 6.283;
          const v = rnd(120, 560) * speed;
          const big = Math.random() < 0.18;
          drops.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, r: big ? rnd(5, 9) : rnd(1.6, 4.2) * rnd(0.6, 1.4), rgb: mix(pig[0], pig[1], Math.random()), born: t, life: rnd(0.35, 0.9), kind: "blob" });
        }
        for (let i = 0; i < n * 3; i++) {
          const a = Math.random() * 6.283;
          const v = rnd(60, 380) * speed;
          drops.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, r: rnd(0.5, 1.5), rgb: mix(pig[0], pig[1], Math.random()), born: t, life: rnd(0.3, 0.8), kind: "mist" });
        }
      };
      type Drip = { x: number; y: number; len: number; max: number; speed: number; rgb: Rgb; w: number; from: number; bead: boolean };
      const drips: Drip[] = [];
      const flickAt = setup.filter((s) => !s.veil).map((s) => ({ t: s.from + s.dur * 0.6, x: s.x, y: s.y, pig: s.pig, done: false }));
      setup.forEach((s, i) => {
        if (!s.veil && i % 2 === 0) drips.push({ x: s.x + rnd(-s.r * 0.5, s.r * 0.5), y: s.y + s.r * 0.7, len: 0, max: rnd(30, 110), speed: rnd(12, 28), rgb: pigOf(s), w: rnd(1.2, 2.4), from: s.from + s.dur, bead: false });
      });

      const nX = wander();
      const nY = wander();
      const nRoll = wander();
      const nYaw = wander();
      const nPitch = wander();
      const nFreq = wander();
      const nAmp = wander();
      const nFeel = [wander(), wander()];
      const nLeg = Array.from({ length: 6 }, () => wander());
      const nScale = wander();
      const nSkew = wander();

      // flight: a soft spring towards a wandering target; the beetle banks into its turns and tips with its speed
      const side = Math.random() < 0.5 ? 1 : -1; // it comes in from the right or from the left
      const pose = { x: side > 0 ? W + KB * WING_U * 1.1 : -KB * WING_U * 1.1, y: H * rnd(0.4, 0.6), vx: -80 * side, vy: rnd(-8, 8), ax: 0, ay: 0, tx: W * 0.5, ty: H * 0.5, next: 0, yaw: -0.9 * side, roll: 0, pitch: 0 };
      let gait = Math.random() * 6.283;
      let phase = Math.random() * 6.283;
      let tLast = 0;
      let t0clock = 0;
      let visible = true;
      let stain = 0;

      /* ---------------- the beetle as a puppet of cards in space ---------------- */
      type Mat = number[][];
      const turn = (yaw: number, pitch: number, roll: number): Mat => {
        const cz = Math.cos(yaw);
        const sz = Math.sin(yaw);
        const cx = Math.cos(pitch);
        const sx = Math.sin(pitch);
        const cy = Math.cos(roll);
        const sy = Math.sin(roll);
        // R = Rz(yaw) * Rx(pitch) * Ry(roll)
        const RxRy = [
          [cy, 0, sy],
          [sx * sy, cx, -sx * cy],
          [-cx * sy, sx, cx * cy],
        ];
        return [
          [cz * RxRy[0][0] - sz * RxRy[1][0], cz * RxRy[0][1] - sz * RxRy[1][1], cz * RxRy[0][2] - sz * RxRy[1][2]],
          [sz * RxRy[0][0] + cz * RxRy[1][0], sz * RxRy[0][1] + cz * RxRy[1][1], sz * RxRy[0][2] + cz * RxRy[1][2]],
          RxRy[2],
        ];
      };
      const apply = (R: Mat, v: V3): V3 => [R[0][0] * v[0] + R[0][1] * v[1] + R[0][2] * v[2], R[1][0] * v[0] + R[1][1] * v[1] + R[1][2] * v[2], R[2][0] * v[0] + R[2][1] * v[1] + R[2][2] * v[2]];

      type Card = { sp: Sprite; src: HTMLCanvasElement; pivot: Pt; p: V3; u: V3; v: V3; spin: number; alpha: number; reach: V3 };
      const cards: Card[] = [];
      const card = (sp: Sprite, brush: Brush, t: number, pivot: Pt, p: V3, u: V3, v: V3, spin: number, alpha = 1, reach: V3 = [0, 0, 0]) => {
        const src = brush.get(t);
        if (src) cards.push({ sp, src, pivot, p, u, v, spin, alpha, reach });
      };
      type Moment = { wingAlpha: [number, number]; wingSpin: [number, number]; wingTwist: [number, number]; legSpin: number[]; legZ: number[]; feelSpin: number[]; open: number };
      const drawBeetle = (g: CanvasRenderingContext2D, t: number, R: Mat, ox: number, oy: number, k: number, o: Moment) => {
        cards.length = 0;
        // wings: the plane of each wing swings up and down about the line of the body
        for (let side = 0; side < 2; side++) {
          const s = side === 0 ? -1 : 1;
          const a = o.wingAlpha[side];
          const sh = SHOULDER[side];
          card(wing, bWing[side], t, [0, 0], [sh[0] - BODY_C[0], sh[1] - BODY_C[1], 0], [s * Math.cos(a), 0, Math.sin(a)], [0, Math.cos(o.wingTwist[side]), Math.sin(o.wingTwist[side])], ((6 + o.wingSpin[side]) * Math.PI) / 180, 0.8 + 0.17 * Math.cos(a), [s * WING_U * 0.5 * Math.cos(a), 0, WING_U * 0.5 * Math.sin(a)]);
        }
        // legs hang a little below the body, feelers and head a little above
        legs.forEach((l, i) => card(l.sp, bLegs[i], t, l.pivot, [l.pivot[0] - BODY_C[0], l.pivot[1] - BODY_C[1], o.legZ[i]], [1, 0, 0], [0, 1, 0], (o.legSpin[i] * Math.PI) / 180));
        const lift = o.open;
        card(elyL, bElyL, t, [505, 392], [-7, -68, 10], [Math.cos(lift), 0, -Math.sin(lift)], [0, 1, 0], 0, 1, [-45, 120, 0]);
        card(elyR, bElyR, t, [519, 392], [7, -68, 10], [Math.cos(lift), 0, Math.sin(lift)], [0, 1, 0], 0, 1, [45, 120, 0]);
        card(head, bHead, t, [512, 300], [0, -160, 16], [1, 0, 0], [0, 1, 0], 0);
        feelers.forEach((l, i) => card(l.sp, bFeel[i], t, l.pivot, [l.pivot[0] - BODY_C[0], l.pivot[1] - BODY_C[1], 18], [1, 0, 0], [0, 1, 0], (o.feelSpin[i] * Math.PI) / 180));
        // far cards first
        const depth = (c: Card) => apply(R, [c.p[0] + c.reach[0], c.p[1] + c.reach[1], c.p[2] + c.reach[2]])[2] + apply(R, c.p)[2];
        cards.sort((a, b) => depth(a) - depth(b));
        for (const c of cards) {
          const P = apply(R, c.p);
          const f = 1 / (1 - P[2] / D);
          const U = apply(R, c.u);
          const V = apply(R, c.v);
          g.save();
          g.translate(ox + P[0] * k * f, oy + P[1] * k * f);
          g.transform(U[0] * k * f, U[1] * k * f, V[0] * k * f, V[1] * k * f, 0, 0);
          if (c.spin) g.rotate(c.spin);
          g.globalAlpha = c.alpha;
          g.drawImage(c.src, c.sp.ox - c.pivot[0], c.sp.oy - c.pivot[1], c.sp.w, c.sp.h);
          g.restore();
        }
      };

      /* ---------------- each frame ---------------- */
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible) {
          tLast = now;
          return;
        }
        if (!t0clock) t0clock = tLast = now;
        const t = (now - t0clock) / 1000;
        const dt = Math.min(0.05, (now - tLast) / 1000);
        tLast = now;

        washes.forEach((w) => w.brush.update(t));

        // splatter is flicked in as each wash goes down, drips run
        for (const f of flickAt) {
          if (!f.done && t >= f.t) {
            f.done = true;
            flick(f.x + rnd(-50, 50), f.y + rnd(-50, 50), Math.floor(rnd(10, 20)), t, f.pig);
          }
        }
        for (let i = drops.length - 1; i >= 0; i--) {
          const dr = drops[i];
          if (t - dr.born >= dr.life) {
            if (dr.born < flyFrom) {
              // it lands
              const lx = dr.x + dr.vx * dr.life;
              const ly = dr.y + dr.vy * dr.life + 130 * dr.life * dr.life;
              const vx = dr.vx;
              const vy = dr.vy + 260 * dr.life;
              if (dr.kind === "mist") {
                bgg.fillStyle = `rgba(${str(dr.rgb)},0.42)`;
                bgg.beginPath();
                bgg.arc(lx, ly, dr.r, 0, 6.283);
                bgg.fill();
              } else if (Math.hypot(vx, vy) > 330 && dr.r < 5) streak(bgg, lx, ly, dr.r, vx, vy, dr.rgb);
              else blob(bgg, lx, ly, dr.r, dr.rgb);
            }
            drops.splice(i, 1);
          }
        }
        for (const dp of drips) {
          if (t < dp.from || dp.len >= dp.max) continue;
          const step = dp.speed * dt * (1 - (dp.len / dp.max) * 0.7);
          bgg.strokeStyle = `rgba(${str(dp.rgb)},0.3)`;
          bgg.lineWidth = dp.w * (1 - (dp.len / dp.max) * 0.5);
          bgg.lineCap = "round";
          bgg.beginPath();
          bgg.moveTo(dp.x, dp.y + dp.len);
          bgg.lineTo(dp.x + gauss() * 0.3, dp.y + dp.len + step);
          bgg.stroke();
          dp.len += step;
          if (dp.len >= dp.max && !dp.bead) {
            dp.bead = true;
            blob(bgg, dp.x, dp.y + dp.len + 2, dp.w * 1.6, dp.rgb);
          }
        }

        // the beetle hovers in the middle of the box: it rises into view, then stays, swaying and tipping a little as it beats its wings
        const lift = smooth(flyFrom, flyFrom + 1.8, t);
        pose.x = CX + 14 * nX(t * 0.3) * lift;
        pose.y = CY + 8 * nY(t * 0.25) * lift;
        pose.yaw = 0.06 * nYaw(t * 0.22) * lift;
        pose.roll = 0.06 * nRoll(t * 0.3) * lift;
        pose.pitch = 0.04 * nPitch(t * 0.27) * lift; // seen from straight above, so a wing stroke shows as the wing closing and opening, not waving up the page

        // wing beat: slow and smooth; the speed and depth drift, and the outer wing works harder in a turn
        phase += dt * 6.283 * (0.9 + 0.1 * nFreq(t * 0.17)) * (0.3 + 0.7 * lift);
        const beatDepth = (0.9 + 0.1 * nAmp(t * 0.1)) * lift;
        const wave = (ph: number) => Math.sin(phase + ph) + 0.18 * Math.sin(2 * (phase + ph) + 0.6);
        const turnBias = 0;
        const wl = wave(0.05 * nSkew(t * 0.2));
        const wr = wave(-0.05 * nSkew(t * 0.23 + 2));
        const deg = Math.PI / 180;
        // the legs step slowly in two groups of three, like an insect walking
        gait += dt * 6.283 * 0.5 * (0.85 + 0.2 * nFreq(t * 0.1 + 5));
        const gph = nLeg.map((_, i) => gait + (i % 2) * Math.PI);
        const moment: Moment = {
          wingAlpha: [(6 * lift + 40 * beatDepth * wl) * deg, (6 * lift + 40 * beatDepth * wr) * deg],
          wingSpin: [0.6 * wl * beatDepth, 0.6 * wr * beatDepth],
          wingTwist: [0.2 * Math.cos(phase) * beatDepth, 0.2 * Math.cos(phase) * beatDepth],
          legSpin: nLeg.map((n, i) => ((i < 3 ? 1 : -1) * 12 * Math.sin(gph[i]) + 3 * n(t * 0.6 + i)) * lift),
          legZ: gph.map((g) => -16 + 18 * Math.max(0, Math.cos(g)) * lift),
          feelSpin: nFeel.map((n, i) => 8 * n(t * 1.1 + i * 3) * (0.4 + 0.6 * lift)),
          open: 0.12 * easeInOut(clamp01((t - flyFrom + 0.5) / 2.5)),
        };
        const bob = (9 * Math.cos(phase) * beatDepth) * lift;
        const kk = KB * (0.9 + 0.1 * lift) * (1 + 0.02 * nScale(t * 0.18) * lift);

        // faint stains left on the paper as it flies, which dry away
        trg.globalCompositeOperation = "destination-out";
        trg.fillStyle = "rgba(0,0,0,0.01)";
        trg.fillRect(0, 0, W, H);
        trg.globalCompositeOperation = "source-over";
        if (lift > 0.3 && t - stain > 0.14) {
          stain = t;
          const px = pose.x + gauss() * 24;
          const py = pose.y + bob + gauss() * 24;
          const gr = trg.createRadialGradient(px, py, 0, px, py, 46);
          const c = str(Math.random() < 0.5 ? SLATE[0] : ORANGE[1]);
          gr.addColorStop(0, `rgba(${c},0.07)`);
          gr.addColorStop(1, `rgba(${c},0)`);
          trg.fillStyle = gr;
          trg.beginPath();
          trg.arc(px, py, 46, 0, 6.283);
          trg.fill();
        }

        // compose
        sg.clearRect(0, 0, W, H);
        washes.forEach((w) => {
          const src = w.brush.get(t);
          if (src) sg.drawImage(src, w.sp.ox, w.sp.oy, w.sp.w, w.sp.h);
        });
        sg.drawImage(bg, 0, 0, W, H);
        sg.drawImage(trail, 0, 0, W, H);
        blg.clearRect(0, 0, W, H);
        if (t >= flyFrom) drawBeetle(blg, t, turn(pose.yaw, pose.pitch, pose.roll), pose.x, pose.y + bob, kk, moment);
        // it casts a soft shadow on the paper, further off and softer the higher it is
        sg.save();
        sg.shadowColor = `rgba(72,58,46,${0.2 * lift})`;
        sg.shadowBlur = (12 + 12 * lift) * ps;
        sg.shadowOffsetX = 10 * lift * ps;
        sg.shadowOffsetY = 18 * lift * ps;
        sg.globalAlpha = lift;
        sg.drawImage(bl, 0, 0, W, H);
        sg.restore();
        // paint in the air
        for (const dr of drops) {
          const age = t - dr.born;
          const x = dr.x + dr.vx * age;
          const y = dr.y + dr.vy * age + 130 * age * age;
          sg.fillStyle = `rgba(${str(dr.rgb)},${0.6 * (1 - age / dr.life)})`;
          sg.beginPath();
          if (dr.kind === "blob" && dr.r > 2) {
            const a = Math.atan2(dr.vy + 260 * age, dr.vx);
            sg.ellipse(x, y, dr.r * 1.8, dr.r * 0.8, a, 0, 6.283);
          } else sg.arc(x, y, dr.r, 0, 6.283);
          sg.fill();
        }
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(stage, 0, 0, W, H);
      };

      const begin = () => {
        if (!alive) return;
        if (still) {
          washes.forEach((w) => w.brush.update(1e6));
          brushes.forEach((b) => b.update(1e6));
          sg.clearRect(0, 0, W, H);
          washes.forEach((w) => sg.drawImage(w.sp.c, w.sp.ox, w.sp.oy, w.sp.w, w.sp.h));
          drawBeetle(sg, 1e6, turn(TILT, 0, 0), CX, CY, KB, { wingAlpha: [0.1, 0.1], wingSpin: [0, 0], wingTwist: [0, 0], legSpin: [0, 0, 0, 0, 0, 0], legZ: [-16, -16, -16, -16, -16, -16], feelSpin: [0, 0], open: 0 });
          ctx.drawImage(stage, 0, 0, W, H);
          return;
        }
        raf = requestAnimationFrame(frame);
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(cv);
        cleanup.push(() => io.disconnect());
      };

      const html = document.documentElement;
      if (!html.hasAttribute("data-loading")) begin();
      else {
        const mo = new MutationObserver(() => {
          if (!html.hasAttribute("data-loading")) {
            mo.disconnect();
            begin();
          }
        });
        mo.observe(html, { attributes: true, attributeFilter: ["data-loading"] });
        cleanup.push(() => mo.disconnect());
      }
    };

    // build once the pictures are in and the page has settled, so it never delays the first paint
    Promise.all([load(SRC.core), load(SRC.limbs), load(SRC.wing)]).then((imgs) => window.setTimeout(() => build(imgs), 60));
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      cleanup.forEach((f) => f());
    };
  }, [key]);

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <canvas ref={cvRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
