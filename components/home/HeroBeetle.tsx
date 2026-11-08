"use client";

import { useEffect, useRef } from "react";

/**
 * The painting on the right of the home hero. It is made, live, from the bare paper, every visit, the way a
 * watercolourist would make it.
 *
 *  1. The washes: slate-grey and orange paint opens at random places on the paper and spreads, one wash after another,
 *     with splatter flicked in and drips running down. They are generated from noise at run time (pigment that pools
 *     darker at the edge, thins where it is wet, leaves bare paper, has the grain of the paper in it), different every time.
 *  2. The beetle: a painted beetle (public/images/site/hero-beetle-v6-*.webp), taken apart into its wings, wing cases,
 *     head, six legs and two feelers. Each part is painted in by its own brush stroke, one after another.
 *  3. Then it lifts off the paper and flies: its wings beat, its legs and feelers swing, its body tilts and bobs, and it
 *     wanders over the painting on a random path, leaving faint stains that dry away. Nothing repeats.
 *
 * Nothing starts until the opening loader has gone; with reduced motion the finished painting is drawn still.
 */

type Pt = [number, number];
type Rgb = [number, number, number];
const W = 1200;
const H = 900;
const CX = W * 0.56; // where the painting is centred
const CY = H * 0.5;

const ORANGE: Rgb[] = [[246, 166, 70], [240, 140, 52], [232, 115, 32], [226, 104, 28], [214, 92, 24]];
const SLATE: Rgb[] = [[112, 124, 138], [98, 108, 122], [88, 98, 110], [70, 78, 90]];
const str = (c: Rgb) => `${c[0]},${c[1]},${c[2]}`;

const SRC = { core: "/images/site/hero-beetle-v6-core.webp", limbs: "/images/site/hero-beetle-v6-limbs.webp", wing: "/images/site/hero-beetle-v6-wing.webp" };
/** The beetle's own coordinates are those of its painting (a 1024 px square, its middle at 512, 460). */
const BODY_C: Pt = [512, 460];
const SHOULDER: [Pt, Pt] = [[405, 395], [618, 395]];
const KB = 0.62; // painting px -> stage px
const WING_U = 640; // a wing is this long, in painting px
const WING_ASPECT = 1282 / 766;
const WING_BASE: Pt = [0.0603, 0.4627]; // where a wing joins the body, as a fraction of the wing picture
const TILT = -0.16;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 0.85;
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

export default function HeroBeetle() {
  const cvRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    let alive = true;
    let raf = 0;
    const cleanup: (() => void)[] = [];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d")!;
    const seed = Math.floor(Math.random() * 9999);

    const build = ([core, limbs, wingImg]: HTMLImageElement[]) => {
      if (!alive) return;
      const orange = () => pick(ORANGE);
      const slate = () => pick(SLATE);

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
      type Wash = { sp: Sprite; brush: Brush };
      const washes: Wash[] = [];
      const setup: { x: number; y: number; r: number; pig: [Rgb, Rgb]; a: number; from: number; dur: number }[] = [];
      const kinds: { pig: [Rgb, Rgb]; a: number }[] = [
        { pig: [SLATE[0], SLATE[3]], a: 0.5 },
        { pig: [ORANGE[1], ORANGE[3]], a: 0.55 },
        { pig: [SLATE[1], SLATE[2]], a: 0.45 },
        { pig: [ORANGE[0], ORANGE[2]], a: 0.5 },
        { pig: [SLATE[0], SLATE[2]], a: 0.5 },
        { pig: [ORANGE[2], ORANGE[4]], a: 0.42 },
        { pig: [SLATE[3], SLATE[2]], a: 0.38 },
        { pig: [ORANGE[0], ORANGE[1]], a: 0.4 },
        { pig: [SLATE[1], SLATE[0]], a: 0.34 },
      ];
      let at = 0.2;
      kinds.forEach((k) => {
        const ang = Math.random() * 6.283;
        const dist = rnd(0.04, 0.4);
        setup.push({ x: CX + Math.cos(ang) * dist * W * 0.6, y: CY + Math.sin(ang) * dist * H * 0.6, r: rnd(190, 340), pig: k.pig, a: k.a * 1.3, from: at, dur: rnd(2.2, 3.4) });
        at += rnd(0.3, 0.7);
      });
      const WS = 0.5;
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
            const f = fbm((x + wx) / cell, (y + wy) / cell, sd) * 1.35 - 0.3 - rr * 0.95;
            const e = smooth(0, 0.06, f);
            if (e <= 0) continue;
            const dens = smooth(0, 0.55, f);
            const rim = Math.exp(-Math.pow(f / 0.045, 2)); // the darker line where the paint pooled and dried
            const n2 = fbm(x / (cell * 0.45) + 20, y / (cell * 0.45), sd + 5);
            const n3 = fbm(x / (cell * 1.3) + 40, y / (cell * 1.3), sd + 6);
            const t = smooth(0.25, 0.75, n3);
            const i = (y * px + x) * 4;
            const dark = 1 - 0.34 * rim;
            d[i] = (s.pig[0][0] + (s.pig[1][0] - s.pig[0][0]) * t) * dark;
            d[i + 1] = (s.pig[0][1] + (s.pig[1][1] - s.pig[0][1]) * t) * dark;
            d[i + 2] = (s.pig[0][2] + (s.pig[1][2] - s.pig[0][2]) * t) * dark;
            const gr = hash(x, y, sd + 3);
            let a = s.a * e * (0.3 + 0.7 * dens) * (0.62 + 0.38 * n2) + rim * 0.26 * e;
            a *= 1 - 0.25 * gr * gr; // the grain of the paper
            // the left of the picture fades into the page, where the words are
            const sx = ox + x / WS;
            a *= smooth(W * 0.12, W * 0.42, sx);
            d[i + 3] = clamp01(a) * 255;
          }
        }
        const c = make(px, px);
        c.getContext("2d")!.putImageData(data, 0, 0);
        const sp: Sprite = { c, ox, oy, w: box, h: box };
        const guide: Pt[] = Array.from({ length: 40 }, (_, i) => {
          const a = Math.random() * 6.283;
          const dd = R * 1.2 * Math.sqrt((i + 1) / 40);
          return [s.x + Math.cos(a) * dd, s.y + Math.sin(a) * dd * 0.9] as Pt;
        });
        washes.push({ sp, brush: new Brush(sp, guide, s.from, s.from + s.dur, R * 0.55, 56) });
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
      const flyFrom = t0 + 7; // and it lifts off the paper

      /* ---------------- the stage ---------------- */
      const bg = make(W, H); // splatter and drips, once they have landed
      const bgg = bg.getContext("2d")!;
      const trail = make(W, H); // faint stains the beetle leaves as it flies; they dry away
      const trg = trail.getContext("2d")!;
      const stage = make(W, H);
      const sg = stage.getContext("2d")!;

      type Drop = { x: number; y: number; vx: number; vy: number; r: number; rgb: string; born: number; life: number };
      const drops: Drop[] = [];
      type Drip = { x: number; y: number; len: number; max: number; speed: number; rgb: string; w: number; from: number };
      const drips: Drip[] = [];
      const flick = (x: number, y: number, n: number, t: number, speed = 1) => {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * 6.283;
          const v = rnd(120, 520) * speed;
          drops.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, r: rnd(2, 8), rgb: str(Math.random() < 0.55 ? slate() : orange()), born: t, life: rnd(0.35, 0.9) });
        }
      };
      // splatter is flicked in as each wash goes down, and a few drips start to run
      const flickAt = setup.map((s) => ({ t: s.from + s.dur * 0.6, x: s.x, y: s.y, done: false }));
      setup.forEach((s, i) => {
        if (i % 2 === 0) drips.push({ x: s.x + rnd(-s.r * 0.5, s.r * 0.5), y: s.y + s.r * 0.7, len: 0, max: rnd(30, 110), speed: rnd(12, 28), rgb: str(s.pig[0]), w: rnd(1.2, 2.4), from: s.from + s.dur });
      });

      const nY = wander();
      const nRot = wander();
      const nFreq = wander();
      const nAmp = wander();
      const nFeel = [wander(), wander()];
      const nLeg = Array.from({ length: 6 }, () => wander());
      const nScale = wander();
      const nSkew = wander();

      const pose = { x: CX, y: CY, vx: 0, vy: 0, tx: CX, ty: CY, nextTarget: 0 };
      let phase = Math.random() * 6.283;
      let tLast = 0;
      let t0clock = 0;
      let visible = true;
      let stain = 0;

      /* ---------------- drawing the beetle for a moment ---------------- */
      const put = (g: CanvasRenderingContext2D, sp: Sprite, src: HTMLCanvasElement | null) => {
        if (src) g.drawImage(src, sp.ox, sp.oy, sp.w, sp.h);
      };
      const swing = (g: CanvasRenderingContext2D, sp: Sprite, src: HTMLCanvasElement | null, pivot: Pt, deg: number) => {
        if (!src) return;
        g.save();
        g.translate(pivot[0], pivot[1]);
        g.rotate((deg * Math.PI) / 180);
        g.translate(-pivot[0], -pivot[1]);
        put(g, sp, src);
        g.restore();
      };
      type Moment = { wingFold: [number, number]; wingDeg: [number, number]; legDeg: number[]; feelDeg: number[] };
      const drawBeetle = (g: CanvasRenderingContext2D, t: number, o: Moment) => {
        // wings first, under the shoulders
        for (let side = 0; side < 2; side++) {
          const src = bWing[side].get(t);
          if (!src) continue;
          const s = side === 0 ? -1 : 1;
          g.save();
          g.translate(SHOULDER[side][0], SHOULDER[side][1]);
          g.scale(s, 1);
          g.rotate(((6 + o.wingDeg[side]) * Math.PI) / 180);
          g.scale(Math.max(0.05, o.wingFold[side]), 1);
          put(g, wing, src);
          g.restore();
        }
        // legs, tucked under the body
        legs.forEach((l, i) => swing(g, l.sp, bLegs[i].get(t), l.pivot, o.legDeg[i]));
        // the body: wing cases and head
        put(g, elyL, bElyL.get(t));
        put(g, elyR, bElyR.get(t));
        put(g, head, bHead.get(t));
        feelers.forEach((l, i) => swing(g, l.sp, bFeel[i].get(t), l.pivot, o.feelDeg[i]));
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
        brushes.forEach((b) => b.update(t));

        // splatter is flicked in, drips run
        for (const f of flickAt) {
          if (!f.done && t >= f.t) {
            f.done = true;
            flick(f.x + rnd(-40, 40), f.y + rnd(-40, 40), Math.floor(rnd(16, 32)), t);
          }
        }
        for (let i = drops.length - 1; i >= 0; i--) {
          const dr = drops[i];
          if (t - dr.born >= dr.life) {
            if (dr.born < flyFrom) {
              // it lands: a small round of paint with a darker rim stays on the paper
              const lx = dr.x + dr.vx * dr.life;
              const ly = dr.y + dr.vy * dr.life + 130 * dr.life * dr.life;
              bgg.fillStyle = `rgba(${dr.rgb},0.5)`;
              bgg.beginPath();
              bgg.arc(lx, ly, dr.r, 0, 6.283);
              bgg.fill();
              bgg.strokeStyle = `rgba(${dr.rgb},0.4)`;
              bgg.lineWidth = 1;
              bgg.stroke();
            }
            drops.splice(i, 1);
          }
        }
        for (const dp of drips) {
          if (t < dp.from || dp.len >= dp.max) continue;
          const step = dp.speed * dt * (1 - (dp.len / dp.max) * 0.7);
          bgg.strokeStyle = `rgba(${dp.rgb},0.3)`;
          bgg.lineWidth = dp.w * (1 - (dp.len / dp.max) * 0.5);
          bgg.lineCap = "round";
          bgg.beginPath();
          bgg.moveTo(dp.x, dp.y + dp.len);
          bgg.lineTo(dp.x + gauss() * 0.3, dp.y + dp.len + step);
          bgg.stroke();
          dp.len += step;
        }

        // the beetle sits where it was painted, then lifts off and flies
        const lift = easeInOut(clamp01((t - flyFrom) / 2.8));
        phase += dt * 6.283 * (1.05 + 0.4 * nFreq(t * 0.2)) * (0.35 + 0.65 * lift);
        const depth = (0.5 + 0.5 * (0.5 + 0.5 * nAmp(t * 0.12))) * lift;
        const s = Math.sin(phase) + 0.2 * Math.sin(2 * phase + 0.7);
        if (t > pose.nextTarget && lift > 0) {
          pose.tx = CX + rnd(-80, 80) + gauss() * 24;
          pose.ty = CY + rnd(-60, 60);
          pose.nextTarget = t + rnd(2.2, 4.6);
        }
        // steer towards the target with a soft spring, so it drifts and turns instead of jumping
        pose.vx += ((pose.tx - pose.x) * 0.9 - pose.vx * 1.6) * dt;
        pose.vy += ((pose.ty - pose.y) * 0.9 - pose.vy * 1.6) * dt;
        pose.x += pose.vx * dt * lift;
        pose.y += pose.vy * dt * lift;
        const bobY = 7 * s * depth + 10 * nY(t * 0.5) * lift;
        const heading = TILT + 0.0014 * pose.vx * lift + 0.11 * nRot(t * 0.45) * lift + 0.04 * s * depth;
        const k = KB * (1 + 0.07 * nScale(t * 0.2) * lift);

        // wing beat: speed, depth and each side's timing wander
        const beat = (ph: number): [number, number] => {
          const v = Math.sin(phase + ph) + 0.2 * Math.sin(2 * (phase + ph) + 0.7);
          return [v * 9 * depth, 1 - 0.4 * (0.5 + 0.5 * v) * depth];
        };
        const bl = beat(0.3 * nSkew(t * 0.3));
        const br = beat(-0.2 * nSkew(t * 0.27 + 2));
        const moment: Moment = {
          wingFold: [bl[1], br[1]],
          wingDeg: [bl[0], br[0]],
          legDeg: nLeg.map((n, i) => (6 * n(t * 1.1 + i) + 3.5 * Math.sin(phase * 0.5 + i)) * lift),
          feelDeg: nFeel.map((n, i) => 9 * n(t * 1.5 + i * 3) + 2 * s * depth),
        };

        // faint stains left on the paper as it flies, which dry away
        trg.globalCompositeOperation = "destination-out";
        trg.fillStyle = "rgba(0,0,0,0.012)";
        trg.fillRect(0, 0, W, H);
        trg.globalCompositeOperation = "source-over";
        if (lift > 0.3 && t - stain > 0.1) {
          stain = t;
          const px = pose.x + gauss() * 20;
          const py = pose.y + bobY + gauss() * 20;
          const gr = trg.createRadialGradient(px, py, 0, px, py, 40);
          const c = str(Math.random() < 0.5 ? slate() : orange());
          gr.addColorStop(0, `rgba(${c},0.08)`);
          gr.addColorStop(1, `rgba(${c},0)`);
          trg.fillStyle = gr;
          trg.beginPath();
          trg.arc(px, py, 40, 0, 6.283);
          trg.fill();
        }
        // a flick of paint off the wings now and then
        if (lift > 0.5 && Math.random() < 0.02) flick(pose.x + gauss() * 80, pose.y + gauss() * 40, Math.floor(rnd(2, 6)), t, 0.4);

        // compose
        sg.clearRect(0, 0, W, H);
        washes.forEach((w) => {
          const src = w.brush.get(t);
          if (src) sg.drawImage(src, w.sp.ox, w.sp.oy, w.sp.w, w.sp.h);
        });
        sg.drawImage(bg, 0, 0);
        sg.drawImage(trail, 0, 0);
        sg.save();
        sg.translate(pose.x, pose.y + bobY);
        sg.rotate(heading);
        sg.scale(k, k);
        sg.translate(-BODY_C[0], -BODY_C[1]);
        drawBeetle(sg, t, moment);
        sg.restore();
        // droplets in the air
        for (const dr of drops) {
          const age = t - dr.born;
          sg.fillStyle = `rgba(${dr.rgb},${0.65 * (1 - age / dr.life)})`;
          sg.beginPath();
          sg.arc(dr.x + dr.vx * age, dr.y + dr.vy * age + 130 * age * age, dr.r, 0, 6.283);
          sg.fill();
        }
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(stage, 0, 0);
      };

      const begin = () => {
        if (!alive) return;
        if (still) {
          washes.forEach((w) => w.brush.update(1e6));
          brushes.forEach((b) => b.update(1e6));
          sg.clearRect(0, 0, W, H);
          washes.forEach((w) => sg.drawImage(w.sp.c, w.sp.ox, w.sp.oy, w.sp.w, w.sp.h));
          sg.save();
          sg.translate(CX, CY);
          sg.rotate(TILT);
          sg.scale(KB, KB);
          sg.translate(-BODY_C[0], -BODY_C[1]);
          drawBeetle(sg, 1e6, { wingFold: [0.85, 0.85], wingDeg: [0, 0], legDeg: [0, 0, 0, 0, 0, 0], feelDeg: [0, 0] });
          sg.restore();
          ctx.drawImage(stage, 0, 0);
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
  }, []);

  return (
    <div className="hb" aria-hidden="true">
      <canvas ref={cvRef} />
    </div>
  );
}
