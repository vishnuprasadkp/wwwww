"use client";

import { useEffect, useRef } from "react";

/**
 * The beetle on the right of the home hero: a watercolour of a beetle in flight seen from the side, in orange and slate grey.
 *
 * Two things are generated live so they never repeat:
 *  - the paint: a big painted wash (public/images/site/hero-beetle-side-wash.webp) is laid down by soft "brush dabs" that
 *    open in random places, starting near the middle and spreading outwards, like wet paint blooming on paper;
 *  - the movement: wing beat, body sway, legs and feelers are driven by smooth random noise (each visit is different).
 * The beetle fades in once the paint is well under way. Nothing starts until the opening loader has gone, and with
 * reduced motion the finished painting is shown still.
 */

const WASH = "/images/site/hero-beetle-side-wash.webp";

/** Smooth, never-repeating wander in about -1..1: three sines at unrelated speeds, each with its own random start. */
const wander = (seed: number[]) => (t: number) => (Math.sin(t * 0.91 + seed[0]) + 0.7 * Math.sin(t * 1.73 + seed[1]) + 0.4 * Math.sin(t * 2.89 + seed[2])) / 2.1;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export default function HeroBeetle() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = root.current;
    const cv = canvas.current;
    if (!host || !cv) return;
    const q = (s: string) => host.querySelector<HTMLElement>(s)!;
    const wash = q(".hb-wash");
    const fly = q(".hb-fly");
    const body = q(".hb-body");
    const wingN = q(".hb-wing-n .hb-wing-in");
    const wingF = q(".hb-wing-f .hb-wing-in");
    const legs = q(".hb-leg");
    const ants = q(".hb-ant");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- the paint -------------------------------------------------------------------------------------------
    const W = 1024;
    const H = 768;
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d")!;
    const mask = document.createElement("canvas");
    mask.width = 256;
    mask.height = 192;
    const mctx = mask.getContext("2d")!;
    const painted = document.createElement("canvas"); // the wash with its edges dissolved, ready to be uncovered
    painted.width = W;
    painted.height = H;
    const img = new Image();
    let spots: [number, number][] = [];
    type Dab = { x: number; y: number; r: number; t0: number; dur: number };
    const dabs: Dab[] = [];
    let washReady = false;
    let paintDone = false;

    const prepare = () => {
      const p = painted.getContext("2d")!;
      p.drawImage(img, 0, 0, W, H);
      // the edges of the picture dissolve into the page, and more so on the left, where the words are
      p.globalCompositeOperation = "destination-in";
      const g = p.createRadialGradient(W * 0.56, H * 0.5, W * 0.1, W * 0.56, H * 0.5, W * 0.5);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.55, "rgba(0,0,0,0.7)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      p.fillStyle = g;
      p.fillRect(0, 0, W, H);
      const l = p.createLinearGradient(0, 0, W * 0.5, 0);
      l.addColorStop(0, "rgba(0,0,0,0)");
      l.addColorStop(1, "rgba(0,0,0,1)");
      p.fillStyle = l;
      p.fillRect(0, 0, W, H);
      p.globalCompositeOperation = "source-over";
      // where there is paint to uncover
      const sm = document.createElement("canvas");
      sm.width = 64;
      sm.height = 48;
      const s = sm.getContext("2d")!;
      s.drawImage(painted, 0, 0, 64, 48);
      const d = s.getImageData(0, 0, 64, 48).data;
      for (let y = 0; y < 48; y++) for (let x = 0; x < 64; x++) if (d[(y * 64 + x) * 4 + 3] > 40) spots.push([(x + 0.5) / 64, (y + 0.5) / 48]);
      washReady = true;
    };

    const draw = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(painted, 0, 0);
      ctx.globalCompositeOperation = "destination-in";
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(mask, 0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    };

    // ---- the movement ----------------------------------------------------------------------------------------
    const rnd = () => Math.random() * 6.283;
    const nX = wander([rnd(), rnd(), rnd()]);
    const nY = wander([rnd(), rnd(), rnd()]);
    const nPitch = wander([rnd(), rnd(), rnd()]);
    const nFreq = wander([rnd(), rnd(), rnd()]);
    const nAmp = wander([rnd(), rnd(), rnd()]);
    const nLeg = wander([rnd(), rnd(), rnd()]);
    const nAnt = wander([rnd(), rnd(), rnd()]);
    const nWash = wander([rnd(), rnd(), rnd()]);

    let raf = 0;
    let started = false;
    let t0 = 0;
    let last = 0;
    let phase = Math.random() * 6.283;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!t0) t0 = last = now;
      const t = (now - t0) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // paint: dabs open one after another, near the middle first and then further out
      if (washReady && !paintDone) {
        const spawn = Math.min(240, Math.floor(Math.pow(t / 8.5, 1.1) * 240));
        while (dabs.length < spawn && spots.length) {
          const reach = 0.25 + 0.75 * clamp01(t / 7);
          let pick = spots[Math.floor(Math.random() * spots.length)];
          for (let k = 0; k < 6; k++) {
            const c = spots[Math.floor(Math.random() * spots.length)];
            const dist = Math.hypot((c[0] - 0.6) * 1.33, c[1] - 0.5) / 0.7;
            if (dist <= reach) {
              pick = c;
              break;
            }
          }
          dabs.push({ x: pick[0], y: pick[1], r: 9 + Math.random() * 21, t0: t, dur: 1.4 + Math.random() * 2.2 });
        }
        let live = false;
        for (const b of dabs) {
          const k = clamp01((t - b.t0) / b.dur);
          if (k >= 1) continue;
          live = true;
          const r = Math.max(1, easeOut(k) * b.r);
          const cx = b.x * 256;
          const cy = b.y * 192;
          const g = mctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          g.addColorStop(0, "rgba(255,255,255,0.36)");
          g.addColorStop(0.55, "rgba(255,255,255,0.24)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          mctx.fillStyle = g;
          mctx.beginPath();
          mctx.arc(cx, cy, r, 0, 6.283);
          mctx.fill();
        }
        draw();
        if (!live && dabs.length >= 240) {
          mctx.fillStyle = "#fff";
          mctx.fillRect(0, 0, 256, 192);
          draw();
          paintDone = true;
        }
      }

      // the beetle fades in once the paint is well under way, and the wings open a little later
      const appear = easeOut(clamp01((t - 3.6) / 5.5));
      const wings = easeOut(clamp01((t - 5.6) / 3.4));
      fly.style.opacity = String(appear);

      // wing beat: speed, depth and rests wander, so no two beats are the same
      phase += dt * 6.283 * (1.25 + 0.5 * nFreq(t * 0.22));
      const depth = 0.55 + 0.45 * (0.5 + 0.5 * nAmp(t * 0.13));
      const s = Math.sin(phase) + 0.22 * Math.sin(2 * phase + 0.6);
      const near = -36 + 30 * s * depth * wings - (1 - wings) * -60;
      const far = -31 + 28 * Math.sin(phase - 0.55) * depth * wings - (1 - wings) * -60;
      wingN.style.transform = `rotate(${near}deg)`;
      wingF.style.transform = `rotate(${far}deg)`;
      wingN.style.opacity = wingF.style.opacity = String(wings);

      // the body hovers and sways; it drops a little on each upstroke
      const bx = 2.4 * nX(t * 0.5);
      const by = 2.8 * nY(t * 0.42) + 1.1 * s * depth * appear;
      const pitch = 3.2 * nPitch(t * 0.6) + 1.2 * s * depth;
      body.style.transform = `translate(${bx}%, ${by}%) rotate(${pitch}deg)`;
      legs.style.transform = `rotate(${2.6 * nLeg(t * 1.3) + 1.2 * Math.sin(phase + 1)}deg)`;
      ants.style.transform = `rotate(${4.2 * nAnt(t * 1.7)}deg)`;
      wash.style.transform = `scale(${1 + 0.018 * nWash(t * 0.35)}) translate(${0.8 * nWash(t * 0.21 + 3)}%, ${0.8 * nWash(t * 0.17 + 5)}%)`;
      // the wings follow the body
      const follow = `translate(${bx}%, ${by}%) rotate(${pitch}deg)`;
      wingN.parentElement!.style.transform = `${follow} scaleX(-1)`;
      wingF.parentElement!.style.transform = `${follow} translate(0.8%, -1%) scaleX(-1)`;
    };

    const begin = () => {
      if (started) return;
      started = true;
      if (still) {
        mctx.fillStyle = "#fff";
        mctx.fillRect(0, 0, 256, 192);
        draw();
        fly.style.opacity = "1";
        wingN.style.opacity = wingF.style.opacity = "1";
        wingN.style.transform = "rotate(-36deg)";
        wingF.style.transform = "rotate(-31deg)";
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    img.onload = () => {
      prepare();
      if (still) {
        draw();
      }
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
    const cleanup: (() => void)[] = [];
    img.src = WASH;
    return () => {
      cancelAnimationFrame(raf);
      cleanup.forEach((f) => f());
    };
  }, []);

  return (
    <div ref={root} className="hb" aria-hidden="true">
      <div className="hb-wash">
        <canvas ref={canvas} />
      </div>
      <div className="hb-fly">
        <div className="hb-wing hb-wing-f">
          <div className="hb-wing-in" />
        </div>
        <div className="hb-wing hb-wing-n">
          <div className="hb-wing-in" />
        </div>
        <div className="hb-body">
          <div className="hb-part hb-core" />
          <div className="hb-part hb-ant" />
          <div className="hb-part hb-leg" />
        </div>
      </div>
    </div>
  );
}
