"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The paint behind the beetle: large, soft fields of orange, dark orange and a little white that flow slowly into each
 * other, like wet colour moving on paper. It is drawn live by a small shader on the graphics card: noise bent by more
 * noise (domain warping), moving slowly, so the shapes stretch, fold and drift and never repeat.
 *
 * It starts as bare paper; the colour comes in once, spreading out from a few places until it fills the box, and then it
 * keeps moving. Nothing starts until the opening loader has gone; with reduced motion one still frame is drawn.
 */

const VS = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FS = `
precision highp float;
varying vec2 vUv;
uniform float time;
uniform float reveal;
uniform float aspect;
uniform vec2 seed;
uniform float scale;
uniform float speed;
uniform vec3 uPale; uniform vec3 uLight; uniform vec3 uMid; uniform vec3 uDeep; uniform vec3 uGrey;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float s = 0.0; float a = 0.5;
  for (int i = 0; i < 3; i++) { s += a * noise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; }
  return s / 0.875;
}

void main(){
  vec2 p = vec2(vUv.x * aspect, vUv.y) * 0.85 * scale + seed;
  float t = time * 0.022 * speed; // slow
  // the flow: noise, bent by noise, bent again, all drifting slowly
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
  vec2 r = vec2(fbm(p + 1.9 * q + vec2(1.7, 9.2) + t * 0.6), fbm(p + 1.9 * q + vec2(8.3, 2.8) - t * 0.5));
  float f = fbm(p + 2.1 * r + vec2(t * 0.3, -t * 0.2));
  f = clamp((f - 0.5) * 1.4 + 0.5, 0.0, 1.0);

  // a full, rich wash of burnt orange: deep in places, lighter where the water thinned it, a touch of grey
  vec3 paper = vec3(0.935, 0.918, 0.89);
  vec3 pale = uPale; vec3 light = uLight; vec3 mid = uMid; vec3 deep = uDeep; vec3 grey = uGrey;

  vec3 col = pale;
  col = mix(col, light, smoothstep(0.22, 0.42, f));
  col = mix(col, mid, smoothstep(0.40, 0.58, f));
  col = mix(col, deep, smoothstep(0.58, 0.8, f + 0.25 * (r.x - 0.5)));
  col = mix(col, grey, smoothstep(0.6, 0.85, r.y) * smoothstep(0.7, 0.4, f) * 0.35);

  // the pigment settles into the grain of the paper: a fine mottle, stronger where the paint is thin
  vec2 gp = gl_FragCoord.xy;
  float gran = noise(gp * 0.45) * 0.6 + noise(gp * 0.9 + 7.0) * 0.4;
  col *= 1.0 + (gran - 0.5) * (0.16 + 0.08 * (1.0 - f));

  // the colour comes in once, as a soft wet front that flows across from the left and fills the box
  vec2 a = vUv * vec2(aspect, 1.0);
  float front = reveal * (aspect + 1.6) - 0.8 - a.x + 0.35 * (vUv.y - 0.5) * (vUv.y - 0.5);
  front += 0.55 * (fbm(a * 1.6 + seed * 1.3 + vec2(0.0, t * 4.0)) - 0.5);
  col = mix(paper, col, smoothstep(0.0, 0.7, front));

  // the grain of the paper
  vec2 g = gl_FragCoord.xy;
  col += (hash(g) - 0.5) * 0.022 + (noise(g * 0.5) - 0.5) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}`;

type Rgb = [number, number, number];
/** The five tones of a wash, palest to deepest, plus a grey that drifts through, each as 0..1 RGB. */
export type InkPalette = { pale: Rgb; light: Rgb; mid: Rgb; deep: Rgb; grey: Rgb };

/** The home hero's burnt orange. */
export const TERRACOTTA: InkPalette = {
  pale: [0.8, 0.63, 0.5],
  light: [0.74, 0.52, 0.38],
  mid: [0.66, 0.39, 0.25],
  deep: [0.56, 0.3, 0.19],
  grey: [0.58, 0.5, 0.46],
};

/**
 * `spread`: the colour first spreads in over bare paper (the home hero); without it the wash is there from the start
 * and only moves (the paintings at the foot of the pages).
 */
/**
 * `refHeight`: draw the shapes at the size they have in a box this many pixels tall, so a shorter box shows the same
 * painting (the home hero shows the AI agent case study's 900px painting, at its size).
 */
export default function HeroInk({ palette = TERRACOTTA, spread = true, refHeight, speed = 1 }: { palette?: InkPalette; spread?: boolean; refHeight?: number; speed?: number }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const host = cv.parentElement as HTMLElement;
    const hb = host.getBoundingClientRect();
    const W = Math.max(300, Math.round(hb.width));
    const H = Math.max(240, Math.round(hb.height));
    // drawn sharp enough for the grain of the paper to show
    const ps = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.round(W * ps);
    cv.height = Math.round(H * ps);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cleanup: (() => void)[] = [];
    const ro = new ResizeObserver(() => {
      const r = host.getBoundingClientRect();
      if (Math.abs(r.width - W) / W > 0.25 || Math.abs(r.height - H) / H > 0.3) setKey((k) => k + 1);
    });
    ro.observe(host);
    cleanup.push(() => ro.disconnect());

    const gl = cv.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false });
    if (!gl) return () => cleanup.forEach((f) => f());
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
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.bindAttribLocation(prog, 0, "aPos");
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uTime = u("time");
    const uReveal = u("reveal");
    gl.uniform1f(u("aspect"), W / H);
    gl.uniform1f(u("speed"), speed);
    gl.uniform1f(u("scale"), refHeight ? Math.min(1, Math.max(0.2, H / refHeight)) : 1);
    gl.uniform2f(u("seed"), Math.random() * 50, Math.random() * 50);
    gl.uniform3f(u("uPale"), ...palette.pale);
    gl.uniform3f(u("uLight"), ...palette.light);
    gl.uniform3f(u("uMid"), ...palette.mid);
    gl.uniform3f(u("uDeep"), ...palette.deep);
    gl.uniform3f(u("uGrey"), ...palette.grey);
    gl.viewport(0, 0, cv.width, cv.height);

    const draw = (t: number) => {
      // the colour spreads in over the first seven seconds, slowing as it reaches the edges
      const k = spread ? Math.min(1, t / 7) : 1;
      gl.uniform1f(uTime, t + 20);
      gl.uniform1f(uReveal, k * k * (3 - 2 * k)); // eases in and out
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    let raf = 0;
    let alive = true;
    let visible = true;
    let clock = 0;
    let tPrev = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) {
        tPrev = now;
        return;
      }
      if (!tPrev) tPrev = now;
      clock += Math.min(0.05, (now - tPrev) / 1000);
      tPrev = now;
      draw(clock);
    };
    draw(0);

    const begin = () => {
      if (!alive) return;
      if (still) {
        draw(30);
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

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      cleanup.forEach((f) => f());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <canvas key={key} ref={cvRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
