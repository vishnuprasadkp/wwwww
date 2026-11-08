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
  vec2 p = vec2(vUv.x * aspect, vUv.y) * 0.85 + seed;
  float t = time * 0.022; // slow
  // the flow: noise, bent by noise, bent again, all drifting slowly
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
  vec2 r = vec2(fbm(p + 1.9 * q + vec2(1.7, 9.2) + t * 0.6), fbm(p + 1.9 * q + vec2(8.3, 2.8) - t * 0.5));
  float f = fbm(p + 2.1 * r + vec2(t * 0.3, -t * 0.2));
  f = clamp((f - 0.5) * 1.4 + 0.5, 0.0, 1.0);

  // a full, rich wash of burnt orange: deep in places, lighter where the water thinned it, a touch of grey
  vec3 paper = vec3(0.935, 0.918, 0.89);
  vec3 pale = vec3(0.80, 0.63, 0.50);
  vec3 light = vec3(0.74, 0.52, 0.38);
  vec3 mid = vec3(0.66, 0.39, 0.25);
  vec3 deep = vec3(0.56, 0.30, 0.19);
  vec3 grey = vec3(0.58, 0.50, 0.46);

  vec3 col = pale;
  col = mix(col, light, smoothstep(0.22, 0.42, f));
  col = mix(col, mid, smoothstep(0.40, 0.58, f));
  col = mix(col, deep, smoothstep(0.58, 0.8, f + 0.25 * (r.x - 0.5)));
  col = mix(col, grey, smoothstep(0.6, 0.85, r.y) * smoothstep(0.7, 0.4, f) * 0.35);

  // the pigment settles into the grain of the paper: a fine mottle, stronger where the paint is thin
  vec2 gp = gl_FragCoord.xy;
  float gran = noise(gp * 0.45) * 0.6 + noise(gp * 0.9 + 7.0) * 0.4;
  col *= 1.0 + (gran - 0.5) * (0.16 + 0.08 * (1.0 - f));

  // the colour comes in once: it spreads out from a few places until the whole box is covered
  vec2 a = vUv * vec2(aspect, 1.0);
  float d = min(min(distance(a, vec2(aspect * 0.22, 0.45)), distance(a, vec2(aspect * 0.55, 0.6))), distance(a, vec2(aspect * 0.85, 0.4)));
  float edge = reveal * (aspect * 0.55 + 0.9) - d + 0.9 * (fbm(a * 2.2 + seed * 1.3) - 0.5) + 0.4 * (q.x - 0.5);
  col = mix(paper, col, smoothstep(0.0, 0.3, edge));

  // the grain of the paper
  vec2 g = gl_FragCoord.xy;
  col += (hash(g) - 0.5) * 0.022 + (noise(g * 0.5) - 0.5) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}`;

export default function HeroInk() {
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
    gl.uniform2f(u("seed"), Math.random() * 50, Math.random() * 50);
    gl.viewport(0, 0, cv.width, cv.height);

    const draw = (t: number) => {
      // the colour spreads in over the first seven seconds, slowing as it reaches the edges
      const k = Math.min(1, t / 7);
      gl.uniform1f(uTime, t + 20);
      gl.uniform1f(uReveal, 1 - Math.pow(1 - k, 2.2));
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
  }, [key]);

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <canvas key={key} ref={cvRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
