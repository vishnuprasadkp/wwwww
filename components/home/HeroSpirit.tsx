"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The beetle in the home hero, as a spirit of light and smoke over the moving wash.
 *
 * It is drawn by a shader from the shapes of the beetle's own painted wings and body (hero-beetle-v7-wing / -core):
 * the shapes are bent by drifting noise so their edges become wisps, smeared back along the way it is moving so smoke
 * trails behind it, softened into a glow, and coloured in warm cream and peach with a cool slate breath and a faint
 * rainbow at the thin edges, like light through a wing. Dust glints around it. The body is only hinted at; the large
 * wings carry it, opening and closing slowly, the rhythm changing as it goes.
 *
 * It forms out of the fog, drifts slowly through the box for a while, dissolves back into the fog and forms again
 * somewhere else: one long, continuous, never-repeating movement.
 *
 * Nothing starts until the opening loader has gone; with reduced motion one still frame is drawn.
 */

const VS = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FS = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uWing;
uniform sampler2D uCore;
uniform float time;
uniform float aspect;
uniform vec2 center;
uniform float size;
uniform float angle;
uniform float open;
uniform float sweep;
uniform float reveal;
uniform vec2 back;

const float WL = 4.6;          // wing length, in half-widths of the body
const float WASP = 0.5975;     // wing picture height / width
const vec2 WBASE = vec2(0.0603, 0.4627);
const float BS = 0.8;          // the body, a little smaller than in the painting

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float s = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; }
  return s / 0.9375;
}
vec2 rot(vec2 v, float a){ float c = cos(a); float s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }

// the two wings, in the beetle's own frame (x to its right, y towards its head)
float wings(vec2 q, float lod){
  float a = 0.0;
  for (int i = 0; i < 2; i++) {
    float s = i == 0 ? 1.0 : -1.0;
    vec2 w = q - vec2(s * 0.5 * BS, 0.32 * BS);
    w.x *= s;
    w = rot(w, sweep);
    w.x /= open;            // the wing turning towards or away from you as it beats
    vec2 uv = vec2(WBASE.x + w.x / WL, WBASE.y - w.y / (WL * WASP));
    if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) a = max(a, smoothstep(0.015, 0.22, textureLod(uWing, uv, lod).a));
  }
  return a;
}
float bodyShape(vec2 q, float lod){
  vec2 uv = vec2(0.5 + q.x * 0.1797 / BS, 0.449 - q.y * 0.1797 / BS);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  return smoothstep(0.05, 0.6, textureLod(uCore, uv, lod).a);
}

void main(){
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = time;
  vec2 q = rot((p - center) / size, -angle);

  // smoke: the shape is bent by slowly drifting noise, so its edges curl into wisps
  vec2 n1 = vec2(fbm(q * 1.4 + vec2(0.0, t * 0.15)), fbm(q * 1.4 + vec2(5.2, -t * 0.12))) - 0.5;
  vec2 qw = q + n1 * 0.75;

  // and it is smeared back along the way it is going, so smoke trails behind it
  vec2 bl = rot(back, -angle);
  float dens = 0.0;
  for (int k = 0; k < 7; k++) {
    float fk = float(k);
    float wgt = exp(-fk * 0.42) * (k == 0 ? 1.0 : 0.42);
    vec2 qk = qw + bl * fk * 0.32 * (0.5 + 0.9 * fbm(q * 2.0 + fk * 3.1 + t * 0.2)) + vec2(0.0, -0.06 * fk * fk * 0.1);
    dens += (wings(qk, 2.2 + fk * 0.6) * 0.9 + bodyShape(qk, 2.2 + fk * 0.6) * 0.3) * wgt;
  }
  float glow = wings(qw, 5.0) * 0.75 + bodyShape(qw, 5.0) * 0.35;

  // it forms out of the fog and dissolves back into it
  float fog = fbm(q * 0.9 + vec2(t * 0.05, -t * 0.04));
  float m = smoothstep(0.0, 0.35, reveal * 1.4 - fog);
  dens *= m;
  glow *= m;

  // the inside is not solid: soft veils of brighter and thinner smoke
  float wisp = fbm(qw * 3.6 - vec2(0.0, t * 0.25));
  dens *= 0.5 + 0.75 * wisp;

  vec3 cream = vec3(1.0, 0.95, 0.88);
  vec3 peach = vec3(1.0, 0.8, 0.62);
  vec3 slate = vec3(0.66, 0.75, 0.84);
  vec3 col = mix(cream, peach, smoothstep(0.3, 0.75, wisp));
  col = mix(col, slate, smoothstep(0.55, 0.85, fbm(q * 1.2 + 3.0 + t * 0.03)) * 0.55);
  // a faint rainbow where it is thin, like light through a wing
  float h = fbm(q * 2.4 + t * 0.08) * 6.283 + q.x * 1.5;
  vec3 irid = 0.55 + 0.45 * vec3(sin(h), sin(h + 2.1), sin(h + 4.2));
  col = mix(col, irid, 0.32 * (1.0 - smoothstep(0.0, 0.7, dens)) * smoothstep(0.02, 0.2, dens + glow));

  float a = clamp(dens * 0.5 + glow * 0.4, 0.0, 0.85);

  // dust glinting about it
  vec2 g = p * 85.0;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float r = hash(id);
  float tw = 0.5 + 0.5 * sin(t * (0.8 + r * 2.5) + r * 30.0);
  float sp = smoothstep(0.09, 0.0, length(f - (vec2(hash(id + 3.0), hash(id + 7.0)) - 0.5) * 0.6)) * step(0.9, r) * tw;
  a += sp * (glow * 2.2 + dens * 0.4) * m;

  // a breath of fog over everything
  float af = fbm(p * 1.8 + vec2(t * 0.025, -t * 0.018));
  a += smoothstep(0.58, 0.95, af) * 0.07;

  a = clamp(a, 0.0, 0.95);
  o = vec4(col * a, a);
}`;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** Smooth, never-repeating wander in about -1..1. */
const wander = () => {
  const s = [Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28];
  return (t: number) => (Math.sin(t * 0.91 + s[0]) + 0.7 * Math.sin(t * 1.73 + s[1]) + 0.4 * Math.sin(t * 2.89 + s[2])) / 2.1;
};

export default function HeroSpirit() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const host = cv.parentElement as HTMLElement;
    const hb = host.getBoundingClientRect();
    const W = Math.max(300, Math.round(hb.width));
    const H = Math.max(200, Math.round(hb.height));
    const ps = Math.min(window.devicePixelRatio || 1, 1.25);
    cv.width = Math.round(W * ps);
    cv.height = Math.round(H * ps);
    const aspect = W / H;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanup: (() => void)[] = [];
    let alive = true;
    let raf = 0;

    const ro = new ResizeObserver(() => {
      const r = host.getBoundingClientRect();
      if (Math.abs(r.width - W) / W > 0.25 || Math.abs(r.height - H) / H > 0.3) setKey((k) => k + 1);
    });
    ro.observe(host);
    cleanup.push(() => ro.disconnect());

    const gl = cv.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return () => cleanup.forEach((fn) => fn());
    const lost = (e: Event) => {
      e.preventDefault();
      setKey((k) => k + 1);
    };
    cv.addEventListener("webglcontextlost", lost);
    cleanup.push(() => cv.removeEventListener("webglcontextlost", lost));

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.bindAttribLocation(prog, 0, "aPos");
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindVertexArray(gl.createVertexArray());
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.uniform1f(u("aspect"), aspect);

    const texture = (img: HTMLImageElement, unit: number, name: string) => {
      const tx = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(u(name), unit);
    };

    /* ---------------- how it moves ---------------- */
    const nX = wander();
    const nY = wander();
    const nA = wander();
    const nF = wander();
    const nAmp = wander();
    const nS = wander();
    let phase = Math.random() * 6.28;
    let clock = 0;
    let tPrev = 0;
    let visible = true;
    // the cycle: it forms (5 s), stays a while, dissolves (4 s), is fog for a moment, forms again
    let cycleStart = 0;
    let stay = rnd(20, 28);
    let drift = Math.random() * 100; // where along its wandering path it is
    let prev = { x: 0, y: 0 };
    const backDir = { x: 0, y: -1 };

    const pose = (t: number, dt: number) => {
      const k = t - cycleStart;
      const formed = smooth(0, 5, k);
      const gone = smooth(5 + stay, 9 + stay, k);
      if (k > 11 + stay) {
        cycleStart = t;
        stay = rnd(20, 28);
        drift += rnd(15, 40); // it forms again somewhere else
      }
      const reveal = formed * (1 - gone);
      const d = drift + t;
      const x = aspect * (0.5 + 0.28 * nX(d * 0.04));
      const y = 0.5 + 0.18 * nY(d * 0.05);
      // which way the smoke streams: behind it, and a little downwards
      if (dt > 0) {
        const vx = (x - prev.x) / dt;
        const vy = (y - prev.y) / dt;
        const sp = Math.hypot(vx, vy);
        const bx = sp > 0.002 ? -vx / sp : 0;
        const by = sp > 0.002 ? -vy / sp : 0;
        backDir.x += (bx * 0.8 - backDir.x) * Math.min(1, dt * 1.5);
        backDir.y += (by * 0.8 - 0.5 - backDir.y) * Math.min(1, dt * 1.5);
      }
      prev = { x, y };
      const bl = Math.hypot(backDir.x, backDir.y) || 1;
      // the wings: slow, the pace and the depth of each beat drifting
      phase += dt * 6.283 * (0.26 + 0.08 * nF(t * 0.07));
      const depth = 0.35 + 0.3 * (0.5 + 0.5 * nAmp(t * 0.05));
      const open = 1 - depth * (0.5 - 0.5 * Math.cos(phase));
      const sweep = 0.1 + 0.07 * Math.sin(phase + 1.1);
      return {
        x,
        y,
        reveal,
        open: Math.max(0.2, open),
        sweep,
        angle: 0.22 * nA(t * 0.06),
        size: 0.27 * (1 + 0.06 * nS(t * 0.05)),
        bx: backDir.x / bl,
        by: backDir.y / bl,
      };
    };

    const draw = (t: number, dt: number) => {
      const P = pose(t, dt);
      gl.uniform1f(u("time"), t + 10);
      gl.uniform2f(u("center"), P.x, P.y);
      gl.uniform1f(u("size"), P.size);
      gl.uniform1f(u("angle"), P.angle);
      gl.uniform1f(u("open"), P.open);
      gl.uniform1f(u("sweep"), P.sweep);
      gl.uniform1f(u("reveal"), P.reveal);
      gl.uniform2f(u("back"), P.bx, P.by);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) {
        tPrev = now;
        return;
      }
      if (!tPrev) tPrev = now;
      const dt = Math.min(0.05, (now - tPrev) / 1000);
      tPrev = now;
      clock += dt;
      draw(clock, dt);
    };

    const load = (src: string) =>
      new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = src;
      });

    Promise.all([load("/images/site/hero-beetle-v7-wing.webp"), load("/images/site/hero-beetle-v7-core.webp")]).then(([wing, core]) => {
      if (!alive) return;
      texture(wing, 0, "uWing");
      texture(core, 1, "uCore");
      const begin = () => {
        if (!alive) return;
        if (still) {
          clock = 12;
          cycleStart = 0;
          draw(clock, 0);
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
      cleanup.forEach((fn) => fn());
    };
  }, [key]);

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <canvas key={key} ref={cvRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
