"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The paint behind the beetle: slate-grey and orange ink dropped into water, run live as a fluid simulation on the
 * graphics card (a stable-fluids solver: advection, vorticity, pressure). Drops fall and open into billowing plumes
 * with dense cores and thin curling filaments, the colours run into each other, and it never stops: new drops keep
 * arriving and the water is stirred. Nothing is a picture, nothing repeats.
 *
 * Nothing starts until the opening loader has gone; with reduced motion a few seconds are simulated and left still.
 */

const VS = `#version 300 es
in vec2 aPos;
out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
uniform vec2 texel;
void main(){
  vUv = aPos * 0.5 + 0.5;
  vL = vUv - vec2(texel.x, 0.0); vR = vUv + vec2(texel.x, 0.0);
  vT = vUv + vec2(0.0, texel.y); vB = vUv - vec2(0.0, texel.y);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const HEAD = `#version 300 es
precision highp float; precision highp sampler2D;
in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
out vec4 o;
`;

const FS = {
  splat: `${HEAD}
uniform sampler2D uTarget; uniform float aspect; uniform vec3 color; uniform vec2 point; uniform float radius;
void main(){
  vec2 p = vUv - point; p.x *= aspect;
  vec3 s = exp(-dot(p, p) / radius) * color;
  o = vec4(texture(uTarget, vUv).xyz + s, 1.0);
}`,
  advect: `${HEAD}
uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texel; uniform float dt; uniform float dissipation;
void main(){
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texel;
  o = texture(uSource, coord) / (1.0 + dissipation * dt);
}`,
  divergence: `${HEAD}
uniform sampler2D uVelocity;
void main(){
  float L = texture(uVelocity, vL).x; float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y; float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x; if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
  o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`,
  curl: `${HEAD}
uniform sampler2D uVelocity;
void main(){
  float L = texture(uVelocity, vL).y; float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x; float B = texture(uVelocity, vB).x;
  o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`,
  vorticity: `${HEAD}
uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
void main(){
  float L = texture(uCurl, vL).x; float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x; float B = texture(uCurl, vB).x; float C = texture(uCurl, vUv).x;
  vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  f /= length(f) + 0.0001; f *= curl * C; f.y *= -1.0;
  vec2 v = texture(uVelocity, vUv).xy + f * dt;
  o = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
}`,
  pressure: `${HEAD}
uniform sampler2D uPressure; uniform sampler2D uDivergence;
void main(){
  float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
  float d = texture(uDivergence, vUv).x;
  o = vec4((L + R + B + T - d) * 0.25, 0.0, 0.0, 1.0);
}`,
  gradient: `${HEAD}
uniform sampler2D uPressure; uniform sampler2D uVelocity;
void main(){
  float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
  vec2 v = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
  o = vec4(v, 0.0, 1.0);
}`,
  clear: `${HEAD}
uniform sampler2D uTexture; uniform float value;
void main(){ o = value * texture(uTexture, vUv); }`,
  display: `${HEAD}
uniform sampler2D uDye; uniform vec2 res;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
void main(){
  vec3 d = texture(uDye, vUv).rgb;
  float dl = dot(texture(uDye, vL).rg, vec2(1.0)); float dr = dot(texture(uDye, vR).rg, vec2(1.0));
  float dt = dot(texture(uDye, vT).rg, vec2(1.0)); float db = dot(texture(uDye, vB).rg, vec2(1.0));
  vec2 g = vec2(dr - dl, dt - db);
  // ink absorbs light: slate takes most from the reds, orange takes the blues
  vec3 As = vec3(1.25, 1.1, 0.9);
  vec3 Ao = vec3(0.1, 0.85, 2.3);
  vec3 T = exp(-(d.r * As + d.g * Ao));
  vec3 paper = vec3(0.915, 0.905, 0.885);
  vec2 px = gl_FragCoord.xy;
  float grain = (hash(px) - 0.5) * 0.028 + (noise(px * 0.6) - 0.5) * 0.03 + (noise(px * 0.06) - 0.5) * 0.02;
  vec3 col = paper * T;
  // the edge of a plume is a little darker, where the pigment is folded over itself
  col *= 1.0 - 0.3 * clamp(length(g) * 5.0, 0.0, 1.0);
  col += grain * (0.4 + 0.6 * T);
  o = vec4(col, 1.0);
}`,
};

type Tex = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
type Dbl = { r: Tex; w: Tex; swap: () => void };

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

    const gl = cv.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false });
    if (!gl || !(gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float"))) {
      return () => cleanup.forEach((f) => f());
    }
    gl.getExtension("OES_texture_float_linear");

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VS);
    const prog = (fs: string) => {
      const p = gl.createProgram()!;
      gl.attachShader(p, vs);
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, "aPos");
      gl.linkProgram(p);
      const u: Record<string, WebGLUniformLocation | null> = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const name = gl.getActiveUniform(p, i)!.name;
        u[name] = gl.getUniformLocation(p, name);
      }
      return { p, u };
    };
    const P = {
      splat: prog(FS.splat),
      advect: prog(FS.advect),
      divergence: prog(FS.divergence),
      curl: prog(FS.curl),
      vorticity: prog(FS.vorticity),
      pressure: prog(FS.pressure),
      gradient: prog(FS.gradient),
      clear: prog(FS.clear),
      display: prog(FS.display),
    };

    const quad = gl.createVertexArray();
    gl.bindVertexArray(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const simW = 288;
    const simH = Math.max(48, Math.round((simW * H) / W));
    const dyeW = Math.min(1600, Math.max(800, Math.round(W)));
    const dyeH = Math.max(200, Math.round((dyeW * H) / W));

    const mk = (w: number, h: number): Tex => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex, fbo, w, h };
    };
    const dbl = (w: number, h: number): Dbl => {
      const d = { r: mk(w, h), w: mk(w, h), swap() { const t = d.r; d.r = d.w; d.w = t; } };
      return d;
    };
    const vel = dbl(simW, simH);
    const dye = dbl(dyeW, dyeH);
    const pres = dbl(simW, simH);
    const div = mk(simW, simH);
    const curlT = mk(simW, simH);

    const bind = (t: Tex, unit: number, loc: WebGLUniformLocation | null) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.uniform1i(loc, unit);
    };
    const target = (t: Tex | null) => {
      if (t) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
        gl.viewport(0, 0, t.w, t.h);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, cv.width, cv.height);
      }
    };
    const draw = () => gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    const simTexel = [1 / simW, 1 / simH] as const;
    const dyeTexel = [1 / dyeW, 1 / dyeH] as const;
    const aspect = W / H;

    const splat = (d: Dbl, x: number, y: number, c: [number, number, number], radius: number) => {
      gl.useProgram(P.splat.p);
      const t = d.r;
      gl.uniform2f(P.splat.u.texel, 1 / t.w, 1 / t.h);
      bind(t, 0, P.splat.u.uTarget);
      gl.uniform1f(P.splat.u.aspect, aspect);
      gl.uniform2f(P.splat.u.point, x, y);
      gl.uniform3f(P.splat.u.color, c[0], c[1], c[2]);
      gl.uniform1f(P.splat.u.radius, radius);
      target(d.w);
      draw();
      d.swap();
    };

    const step = (dt: number) => {
      gl.disable(gl.BLEND);
      gl.useProgram(P.curl.p);
      gl.uniform2f(P.curl.u.texel, ...simTexel);
      bind(vel.r, 0, P.curl.u.uVelocity);
      target(curlT);
      draw();

      gl.useProgram(P.vorticity.p);
      gl.uniform2f(P.vorticity.u.texel, ...simTexel);
      bind(vel.r, 0, P.vorticity.u.uVelocity);
      bind(curlT, 1, P.vorticity.u.uCurl);
      gl.uniform1f(P.vorticity.u.curl, 26);
      gl.uniform1f(P.vorticity.u.dt, dt);
      target(vel.w);
      draw();
      vel.swap();

      gl.useProgram(P.divergence.p);
      gl.uniform2f(P.divergence.u.texel, ...simTexel);
      bind(vel.r, 0, P.divergence.u.uVelocity);
      target(div);
      draw();

      gl.useProgram(P.clear.p);
      gl.uniform2f(P.clear.u.texel, ...simTexel);
      bind(pres.r, 0, P.clear.u.uTexture);
      gl.uniform1f(P.clear.u.value, 0.8);
      target(pres.w);
      draw();
      pres.swap();

      gl.useProgram(P.pressure.p);
      gl.uniform2f(P.pressure.u.texel, ...simTexel);
      bind(div, 0, P.pressure.u.uDivergence);
      for (let i = 0; i < 20; i++) {
        bind(pres.r, 1, P.pressure.u.uPressure);
        target(pres.w);
        draw();
        pres.swap();
      }

      gl.useProgram(P.gradient.p);
      gl.uniform2f(P.gradient.u.texel, ...simTexel);
      bind(pres.r, 0, P.gradient.u.uPressure);
      bind(vel.r, 1, P.gradient.u.uVelocity);
      target(vel.w);
      draw();
      vel.swap();

      gl.useProgram(P.advect.p);
      gl.uniform2f(P.advect.u.texel, ...simTexel);
      gl.uniform1f(P.advect.u.dt, dt);
      bind(vel.r, 0, P.advect.u.uVelocity);
      bind(vel.r, 1, P.advect.u.uSource);
      gl.uniform1f(P.advect.u.dissipation, 0.25);
      target(vel.w);
      draw();
      vel.swap();

      bind(vel.r, 0, P.advect.u.uVelocity);
      bind(dye.r, 1, P.advect.u.uSource);
      gl.uniform1f(P.advect.u.dissipation, 0.1); // the water slowly takes the colour away
      target(dye.w);
      draw();
      dye.swap();
    };

    const show = () => {
      gl.useProgram(P.display.p);
      gl.uniform2f(P.display.u.texel, ...dyeTexel);
      bind(dye.r, 0, P.display.u.uDye);
      target(null);
      draw();
    };

    /* the drops: ink falls in at the top and opens into a plume; the water is stirred now and then */
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    let colourFlip = Math.random() < 0.5;
    const drop = (slate: boolean, x = rnd(0.06, 0.94)) => {
      const y = rnd(0.62, 0.92);
      const amt = rnd(1.1, 2);
      const c: [number, number, number] = slate ? [amt, 0, 0] : [0, amt, 0];
      const r = rnd(0.012, 0.03);
      const vx = rnd(-90, 90);
      const vy = -rnd(260, 480); // falling
      splat(vel, x, y, [vx, vy, 0], r * 1.6);
      splat(dye, x, y, c, r);
      // a smaller trailing drop, so the plume has a tail of filaments
      splat(dye, x + rnd(-0.01, 0.01), y + rnd(0.05, 0.2), c.map((v) => v * 0.6) as [number, number, number], r * 0.5);
    };
    const stir = () => {
      const x = rnd(0.04, 0.96);
      const y = rnd(0.2, 0.9);
      const a = rnd(0, 6.283);
      const s = rnd(80, 200);
      splat(vel, x, y, [Math.cos(a) * s, Math.sin(a) * s, 0], rnd(0.006, 0.02));
    };

    let raf = 0;
    let alive = true;
    let visible = true;
    let tPrev = 0;
    let clock = 0;
    let nextDrop = 0;
    let nextStir = 0;
    // the first drops go in across the whole box, so the colour opens everywhere
    const opening = Array.from({ length: 10 }, (_, i) => ({ t: 0.1 + i * 0.5 + rnd(0, 0.3), x: (i + 0.5) / 10 + rnd(-0.04, 0.04), slate: i % 2 === 0, done: false }));
    if (Math.random() < 0.5) opening.forEach((o) => (o.slate = !o.slate));

    const advance = (dt: number) => {
      clock += dt;
      for (const o of opening) {
        if (!o.done && clock >= o.t) {
          o.done = true;
          drop(o.slate, o.x);
        }
      }
      if (clock > 4.5 && clock >= nextDrop) {
        colourFlip = !colourFlip;
        drop(colourFlip);
        nextDrop = clock + rnd(1.5, 2.6);
      }
      if (clock >= nextStir) {
        stir();
        nextStir = clock + rnd(0.5, 1.1);
      }
      step(dt);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) {
        tPrev = now;
        return;
      }
      if (!tPrev) tPrev = now;
      const dt = Math.min(0.033, (now - tPrev) / 1000);
      tPrev = now;
      advance(dt);
      show();
    };

    const begin = () => {
      if (!alive) return;
      if (still) {
        for (let i = 0; i < 300; i++) advance(1 / 30);
        show();
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
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [key]);

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <canvas ref={cvRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
