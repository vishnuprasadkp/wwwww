"use client";

import { useEffect, useRef } from "react";

/**
 * The painting on the right of the home hero: a loose watercolour of a beetle in flight, in slate grey and orange.
 *
 * Everything on it is generated live, the way paint would be laid down:
 *  - first the washes: soft "brush dabs" open at random places on the paper and spread outwards, so the colour flows;
 *  - then the beetle is painted in the same way, body first and then the wings reaching out from its shoulders;
 *  - when it is done the wings open and it hovers, its wings, body and feelers following smooth random noise, so the
 *    movement is never the same twice.
 * It is drawn on one canvas from four painted layers (public/images/site/hero-beetle-v5-*.webp, the paper turned into
 * transparency so it sits on the page's own paper). Nothing starts until the opening loader has gone; with reduced
 * motion the finished painting is shown still.
 */

const SRC = { wash: "/images/site/hero-beetle-v5-wash.webp", body: "/images/site/hero-beetle-v5-body.webp", wing: "/images/site/hero-beetle-v5-wing.webp" };

const W = 1200;
const H = 900;
const MW = 256; // the reveal masks are small and get scaled up, which keeps the edges of the paint soft
const MH = 192;
const BODY_K = 0.62; // body image (1024 square) scale
const BODY_C: [number, number] = [600, 500]; // where the body's centre (512, 460 in its image) sits on the canvas
const SHOULDER_L: [number, number] = [BODY_C[0] + (405 - 512) * BODY_K, BODY_C[1] + (395 - 460) * BODY_K];
const SHOULDER_R: [number, number] = [BODY_C[0] + (618 - 512) * BODY_K, BODY_C[1] + (395 - 460) * BODY_K];
const WING_W = 540;
const WING_H = WING_W / 1.674;
const WING_BASE: [number, number] = [0.0603 * WING_W, 0.4627 * WING_H];
const TILT = (-9 * Math.PI) / 180;

/** Smooth, never-repeating wander in about -1..1: three sines at unrelated speeds, each with its own random start. */
const wander = (seed: number[]) => (t: number) => (Math.sin(t * 0.91 + seed[0]) + 0.7 * Math.sin(t * 1.73 + seed[1]) + 0.4 * Math.sin(t * 2.89 + seed[2])) / 2.1;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const load = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
const make = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

type Dab = { x: number; y: number; r: number; t0: number; dur: number };
/** Opens soft dabs of "paint" on a small mask, one after another, between `from` and `to` seconds. */
class Painter {
  mask = make(MW, MH);
  g = this.mask.getContext("2d")!;
  dabs: Dab[] = [];
  done = false;
  constructor(private spots: [number, number][], private count: number, private from: number, private to: number, private rMin: number, private rMax: number, private centre: [number, number], private spread: number) {}
  update(t: number) {
    if (this.done || !this.spots.length) return;
    const k = clamp01((t - this.from) / (this.to - this.from));
    const want = Math.floor(Math.pow(k, 1.1) * this.count);
    while (this.dabs.length < want) {
      // early dabs stay near the middle, later ones reach further out
      const reach = 0.2 + 0.8 * clamp01((t - this.from) / ((this.to - this.from) * 0.85));
      let pick = this.spots[Math.floor(Math.random() * this.spots.length)];
      for (let n = 0; n < 8; n++) {
        const c = this.spots[Math.floor(Math.random() * this.spots.length)];
        if (Math.hypot((c[0] - this.centre[0]) * 1.33, c[1] - this.centre[1]) / this.spread <= reach) {
          pick = c;
          break;
        }
      }
      this.dabs.push({ x: pick[0], y: pick[1], r: this.rMin + Math.random() * (this.rMax - this.rMin), t0: t, dur: 1.4 + Math.random() * 2.2 });
    }
    let live = false;
    for (const b of this.dabs) {
      const u = clamp01((t - b.t0) / b.dur);
      if (u >= 1) continue;
      live = true;
      const r = Math.max(1, easeOut(u) * b.r);
      const cx = b.x * MW;
      const cy = b.y * MH;
      const gr = this.g.createRadialGradient(cx, cy, 0, cx, cy, r);
      gr.addColorStop(0, "rgba(255,255,255,0.36)");
      gr.addColorStop(0.55, "rgba(255,255,255,0.24)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      this.g.fillStyle = gr;
      this.g.beginPath();
      this.g.arc(cx, cy, r, 0, 6.283);
      this.g.fill();
    }
    if (!live && this.dabs.length >= this.count) this.finish();
  }
  finish() {
    this.g.fillStyle = "#fff";
    this.g.fillRect(0, 0, MW, MH);
    this.done = true;
  }
}

export default function HeroBeetle() {
  const cvRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    let alive = true;
    let raf = 0;
    const cleanup: (() => void)[] = [];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    Promise.all([load(SRC.wash), load(SRC.body), load(SRC.wing)]).then(([washImg, bodyImg, wingImg]) => {
      if (!alive) return;
      cv.width = W;
      cv.height = H;
      const ctx = cv.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";

      // the wash, with its edges dissolved into the page (more on the left, where the words are)
      const wash = make(W, H);
      {
        const p = wash.getContext("2d")!;
        p.drawImage(washImg, 0, 0, W, H);
        p.globalCompositeOperation = "destination-in";
        const g = p.createRadialGradient(W * 0.56, H * 0.5, W * 0.12, W * 0.56, H * 0.5, W * 0.56);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.6, "rgba(0,0,0,0.8)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        p.fillStyle = g;
        p.fillRect(0, 0, W, H);
        const l = p.createLinearGradient(0, 0, W * 0.4, 0);
        l.addColorStop(0, "rgba(0,0,0,0)");
        l.addColorStop(1, "rgba(0,0,0,1)");
        p.fillStyle = l;
        p.fillRect(0, 0, W, H);
      }

      // ---- the beetle, drawn from its parts for a given moment ----
      const bodyDraw = (g: CanvasRenderingContext2D, k: number) => g.drawImage(bodyImg, BODY_C[0] - 512 * k, BODY_C[1] - 460 * k, 1024 * k, 1024 * k);
      const drawWing = (g: CanvasRenderingContext2D, shoulder: [number, number], side: number, deg: number, fold: number, a: number) => {
        g.save();
        g.globalAlpha = a;
        g.translate(shoulder[0], shoulder[1]);
        g.scale(side, 1);
        g.rotate((deg * Math.PI) / 180);
        g.scale(fold, 1);
        g.drawImage(wingImg, -WING_BASE[0], -WING_BASE[1], WING_W, WING_H);
        g.restore();
      };
      const beetle = make(W, H);
      const bg = beetle.getContext("2d")!;
      const drawBeetle = (o: { dx: number; dy: number; rot: number; wingL: [number, number]; wingR: [number, number]; open: number; ant: number; k: number }) => {
        bg.clearRect(0, 0, W, H);
        bg.save();
        bg.translate(BODY_C[0] + o.dx, BODY_C[1] + o.dy);
        bg.rotate(TILT + o.rot);
        bg.scale(o.k, o.k);
        bg.translate(-BODY_C[0], -BODY_C[1]);
        // wings first (under the shoulders), folded and turned away until they open
        const lift = 58 * (1 - o.open);
        drawWing(bg, SHOULDER_L, -1, 9 + lift + o.wingL[0], Math.max(0.06, o.open * o.wingL[1]), 0.5 + 0.5 * o.open);
        drawWing(bg, SHOULDER_R, 1, 9 + lift + o.wingR[0], Math.max(0.06, o.open * o.wingR[1]), 0.5 + 0.5 * o.open);
        // body: head and feelers swing a little on their own
        bg.save();
        bg.beginPath();
        bg.rect(0, 0, W, BODY_C[1] + (215 - 460) * BODY_K);
        bg.clip();
        bg.translate(BODY_C[0], BODY_C[1] + (215 - 460) * BODY_K);
        bg.rotate(o.ant);
        bg.translate(-BODY_C[0], -(BODY_C[1] + (215 - 460) * BODY_K));
        bodyDraw(bg, BODY_K);
        bg.restore();
        bg.save();
        bg.beginPath();
        bg.rect(0, BODY_C[1] + (215 - 460) * BODY_K, W, H);
        bg.clip();
        bodyDraw(bg, BODY_K);
        bg.restore();
        bg.restore();
      };
      const rest = { dx: 0, dy: 0, rot: 0, wingL: [0, 1] as [number, number], wingR: [0, 1] as [number, number], open: 1, ant: 0, k: 1 };

      // where there is paint to uncover, for the washes and for the beetle
      const spotsOf = (src: HTMLCanvasElement, thr: number) => {
        const sm = make(64, 48);
        const s = sm.getContext("2d")!;
        s.drawImage(src, 0, 0, 64, 48);
        const d = s.getImageData(0, 0, 64, 48).data;
        const out: [number, number][] = [];
        for (let y = 0; y < 48; y++) for (let x = 0; x < 64; x++) if (d[(y * 64 + x) * 4 + 3] > thr) out.push([(x + 0.5) / 64, (y + 0.5) / 48]);
        return out;
      };
      drawBeetle(rest);
      const washSpots = spotsOf(wash, 40);
      const beetleSpots = spotsOf(beetle, 30);
      const washPaint = new Painter(washSpots, 230, 0.2, 7, 9, 28, [0.56, 0.5], 0.7);
      const beetlePaint = new Painter(beetleSpots, 190, 2.8, 8.2, 5, 16, [BODY_C[0] / W, BODY_C[1] / H], 0.62);
      const tmp = make(W, H);
      const tg = tmp.getContext("2d")!;
      tg.imageSmoothingQuality = "high";

      const layer = (src: HTMLCanvasElement, p: Painter, dx = 0, dy = 0) => {
        if (p.done) {
          ctx.drawImage(src, dx, dy);
          return;
        }
        tg.globalCompositeOperation = "source-over";
        tg.clearRect(0, 0, W, H);
        tg.drawImage(src, dx, dy);
        tg.globalCompositeOperation = "destination-in";
        tg.drawImage(p.mask, 0, 0, W, H);
        ctx.drawImage(tmp, 0, 0);
      };

      // ---- movement: smooth random noise, fresh each visit ----
      const rnd = () => Math.random() * 6.283;
      const nX = wander([rnd(), rnd(), rnd()]);
      const nY = wander([rnd(), rnd(), rnd()]);
      const nRot = wander([rnd(), rnd(), rnd()]);
      const nFreq = wander([rnd(), rnd(), rnd()]);
      const nAmp = wander([rnd(), rnd(), rnd()]);
      const nAnt = wander([rnd(), rnd(), rnd()]);
      const nSkew = wander([rnd(), rnd(), rnd()]);
      const nWash = wander([rnd(), rnd(), rnd()]);
      let phase = Math.random() * 6.283;
      let t0 = 0;
      let last = 0;
      let visible = true;

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible) {
          last = now;
          return;
        }
        if (!t0) t0 = last = now;
        const t = (now - t0) / 1000;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        washPaint.update(t);
        beetlePaint.update(t);

        // the wings open after the beetle is mostly painted; once open, the beat's speed, depth and shape wander
        const open = easeOut(clamp01((t - 6.6) / 3.6));
        phase += dt * 6.283 * (1.1 + 0.45 * nFreq(t * 0.2));
        const depth = 0.55 + 0.45 * (0.5 + 0.5 * nAmp(t * 0.12));
        const s = Math.sin(phase) + 0.2 * Math.sin(2 * phase + 0.7);
        const beat = (ph: number, shape: number): [number, number] => {
          const v = Math.sin(phase + ph) + 0.2 * Math.sin(2 * (phase + ph) + 0.7);
          return [shape * 9 * v * depth, 1 - 0.38 * (0.5 + 0.5 * v) * depth];
        };
        drawBeetle({
          dx: 14 * nX(t * 0.45),
          dy: 16 * nY(t * 0.38) + 6 * s * depth * open,
          rot: ((2.4 * nRot(t * 0.5) + 0.9 * s * depth * open) * Math.PI) / 180,
          wingL: beat(0.35 * nSkew(t * 0.3), 1),
          wingR: beat(-0.2 * nSkew(t * 0.27 + 2), 1),
          open,
          ant: (3.2 * nAnt(t * 1.6) * Math.PI) / 180,
          k: 1,
        });
        ctx.clearRect(0, 0, W, H);
        layer(wash, washPaint, 6 * nWash(t * 0.3), 5 * nWash(t * 0.23 + 4));
        layer(beetle, beetlePaint);
      };

      const begin = () => {
        if (!alive) return;
        if (still) {
          washPaint.finish();
          beetlePaint.finish();
          drawBeetle({ ...rest, wingL: [0, 0.8], wingR: [0, 0.8] });
          ctx.drawImage(wash, 0, 0);
          ctx.drawImage(beetle, 0, 0);
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
    });

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
