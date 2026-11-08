"use client";

import { useEffect, useRef } from "react";
import type { InkPalette } from "@/components/home/HeroInk";

/**
 * The moving watercolour behind a product image: the same wash as the painting at the foot of each case study, in that
 * case's own colours, drawn over the image's painted background only. The product screenshot is never touched: a mask
 * made beforehand (scripts/masks.py) says which part of the image is product, and there the wash is see-through.
 *
 * One small graphics context draws every image on the page in turn (a page has many images, and a browser allows only a
 * few contexts), each image only while it is on screen, and copies the result into that image's own canvas.
 */

const VS = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FS = `
precision highp float;
varying vec2 vUv;
uniform float time;
uniform float aspect;
uniform float scale;
uniform vec2 seed;
uniform vec4 crop; // the part of the image the box shows (object-cover): offset xy, size zw
uniform vec2 texel;
uniform sampler2D mask;
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
  // exactly the wash of the case study's closing painting (HeroInk), its shapes at the size they have there
  vec2 p = vec2(vUv.x * aspect, vUv.y) * 0.85 * scale + seed;
  float t = time * 0.022;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
  vec2 r = vec2(fbm(p + 1.9 * q + vec2(1.7, 9.2) + t * 0.6), fbm(p + 1.9 * q + vec2(8.3, 2.8) - t * 0.5));
  float f = fbm(p + 2.1 * r + vec2(t * 0.3, -t * 0.2));
  f = clamp((f - 0.5) * 1.4 + 0.5, 0.0, 1.0);
  vec3 col = uPale;
  col = mix(col, uLight, smoothstep(0.22, 0.42, f));
  col = mix(col, uMid, smoothstep(0.40, 0.58, f));
  col = mix(col, uDeep, smoothstep(0.58, 0.8, f + 0.25 * (r.x - 0.5)));
  col = mix(col, uGrey, smoothstep(0.6, 0.85, r.y) * smoothstep(0.7, 0.4, f) * 0.35);
  // the painted ground keeps its own grain; the wash only moves its light and colour, laid over it in soft light:
  // where the wash matches the ground nothing changes, where it is deeper or paler the ground darkens or lightens
  vec3 tint = clamp(0.5 + (col - uMid) * 1.35, 0.0, 1.0);
  // nowhere near the product: it is never touched, not its edge, its corners, its strokes or its shadow
  vec2 iu = crop.xy + vUv * crop.zw;
  float m = texture2D(mask, iu).r;
  float a = 1.0 - smoothstep(0.02, 0.45, m);
  gl_FragColor = vec4(tint * a, a);
}`;

type Item = {
  cv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  palette: InkPalette;
  seed: [number, number];
  fill: boolean;
  img: HTMLImageElement | null;
  tex: WebGLTexture | null;
  visible: boolean;
  shown: boolean;
};

const STILL = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The one shared context and its loop. */
const shared = (() => {
  let gl: WebGLRenderingContext | null = null;
  let glc: HTMLCanvasElement | null = null;
  let prog: WebGLProgram | null = null;
  const U: Record<string, WebGLUniformLocation | null> = {};
  const items = new Set<Item>();
  let raf = 0;
  let clock = 0;
  let last = 0;
  let acc = 0;
  let started = false;

  const init = () => {
    if (gl) return gl;
    glc = document.createElement("canvas");
    gl = glc.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: true });
    if (!gl) return null;
    const sh = (type: number, src: string) => {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    };
    prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.bindAttribLocation(prog, 0, "aPos");
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    for (const n of ["time", "aspect", "scale", "seed", "crop", "texel", "mask", "uPale", "uLight", "uMid", "uDeep", "uGrey"]) U[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(U.mask, 0);
    glc.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    });
    return gl;
  };

  const upload = (it: Item) => {
    if (!gl || !it.img || it.tex) return;
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, it.img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    it.tex = t;
  };

  const draw = (it: Item, t: number) => {
    if (!gl || !glc || !it.img) return;
    upload(it);
    const box = it.cv.getBoundingClientRect();
    if (!box.width || !box.height) return;
    // drawn at the screen's own sharpness, so the grain of the paint is as crisp as in the painted original
    const k = Math.min(1.5, window.devicePixelRatio || 1) * Math.min(1, 1500 / box.width);
    const W = Math.max(2, Math.round(box.width * k));
    const H = Math.max(2, Math.round(box.height * k));
    if (it.cv.width !== W || it.cv.height !== H) {
      it.cv.width = W;
      it.cv.height = H;
    }
    if (glc.width !== W || glc.height !== H) {
      glc.width = W;
      glc.height = H;
    }
    gl.viewport(0, 0, W, H);
    const boxA = box.width / box.height;
    const imgA = it.img.naturalWidth / it.img.naturalHeight;
    let crop: [number, number, number, number] = [0, 0, 1, 1];
    if (it.fill) {
      if (boxA > imgA) {
        const s = imgA / boxA;
        crop = [0, (1 - s) / 2, 1, s];
      } else {
        const s = boxA / imgA;
        crop = [(1 - s) / 2, 0, s, 1];
      }
    }
    gl.uniform1f(U.time, t + 20);
    gl.uniform1f(U.aspect, boxA);
    gl.uniform1f(U.scale, Math.min(1, Math.max(0.2, box.height / 900)));
    gl.uniform2f(U.seed, it.seed[0], it.seed[1]);
    gl.uniform4f(U.crop, ...crop);
    gl.uniform2f(U.texel, 1 / it.img.naturalWidth, 1 / it.img.naturalHeight);
    gl.uniform3f(U.uPale, ...it.palette.pale);
    gl.uniform3f(U.uLight, ...it.palette.light);
    gl.uniform3f(U.uMid, ...it.palette.mid);
    gl.uniform3f(U.uDeep, ...it.palette.deep);
    gl.uniform3f(U.uGrey, ...it.palette.grey);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, it.tex);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    it.ctx.clearRect(0, 0, W, H);
    it.ctx.drawImage(glc, 0, 0);
    if (!it.shown) {
      it.shown = true;
      it.cv.style.opacity = "1"; // it fades in over the painted original, so nothing jumps
    }
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!last) last = now;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    acc += dt;
    if (acc < 1 / 30) return; // the wash moves slowly: thirty frames a second is plenty
    acc = 0;
    for (const it of items) if (it.visible) draw(it, clock);
  };

  const start = () => {
    if (started) return;
    started = true;
    if (STILL) return;
    const go = () => (raf = requestAnimationFrame(frame));
    const html = document.documentElement;
    if (!html.hasAttribute("data-loading")) go();
    else {
      const mo = new MutationObserver(() => {
        if (!html.hasAttribute("data-loading")) {
          mo.disconnect();
          go();
        }
      });
      mo.observe(html, { attributes: true, attributeFilter: ["data-loading"] });
    }
  };

  return {
    add(it: Item) {
      if (!init()) return false;
      items.add(it);
      start();
      return true;
    },
    remove(it: Item) {
      items.delete(it);
      if (gl && it.tex) gl.deleteTexture(it.tex);
    },
    paintNow(it: Item) {
      draw(it, clock);
    },
  };
})();

export default function WashOverlay({ mask, palette, fill = false }: { mask: string; palette: InkPalette; fill?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const it: Item = { cv, ctx, palette, seed: [Math.random() * 50, Math.random() * 50], fill, img: null, tex: null, visible: false, shown: false };
    if (!shared.add(it)) return;
    const io = new IntersectionObserver(([e]) => (it.visible = e.isIntersecting), { rootMargin: "600px" });
    io.observe(cv);
    const img = new Image();
    img.onload = () => {
      it.img = img;
      shared.paintNow(it); // shown at once, before it starts moving
    };
    img.src = mask;
    return () => {
      io.disconnect();
      shared.remove(it);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mask]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity: 0, transition: "opacity 0.9s ease", mixBlendMode: "soft-light" }} />;
}
