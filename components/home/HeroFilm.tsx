"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SCHEMES, inkPalette } from "@/lib/painting";
import type { InkPalette } from "./HeroInk";

/** The AI agent case study's terracotta: its closing painting's wash. */
const GREY = inkPalette(SCHEMES.charcoal); // the home page's dark grey: the ground, the smoke and the paint it leaves

/**
 * The home hero as a short film, like a car being revealed on a stage.
 *
 *  1. The colour blooms in: the warm watercolour wash behind everything.
 *  2. Smoke rolls in low across the floor, light glows through it from behind, motes drift and glint.
 *  3. Far back in the smoke the beetle appears, face to face with you, at your eye level, and walks towards you,
 *     coming out of the haze and into focus.
 *  4. Close in front of you it stops, lifts its wing cases, unfolds its wings and rises up and away over you.
 *  5. The smoke settles, and after a while it walks in again.
 *
 * The beetle is a 3D model painted with its own watercolour (hero-beetle-v7-core / -wing); the camera has a shallow
 * depth of field and a soft glow, like a lens. Nothing starts until the opening loader has gone; with reduced motion one
 * still frame of the beetle close up is drawn.
 */

const WING = "/images/site/hero-beetle-v7-wing.webp";
const WING_BASE = [0.0603, 0.4627];
const WING_ASPECT = 766 / 1282;

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const lin = (r: number, g: number, b: number) => new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace);

/** A soft, torn puff of smoke, drawn once into a canvas. */
function smokeTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const img = g.createImageData(256, 256);
  const h = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const vn = (x: number, y: number) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    return h(ix, iy) * (1 - u) * (1 - v) + h(ix + 1, iy) * u * (1 - v) + h(ix, iy + 1) * (1 - u) * v + h(ix + 1, iy + 1) * u * v;
  };
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const dx = (x - 128) / 128;
      const dy = (y - 128) / 128;
      const d = Math.sqrt(dx * dx + dy * dy);
      let n = 0;
      let a = 0.5;
      let f = 3;
      for (let o = 0; o < 4; o++) {
        n += a * vn(x / 256 * f + o * 7, y / 256 * f + o * 3);
        f *= 2;
        a *= 0.5;
      }
      const v = Math.max(0, 1 - d) ** 1.6 * (0.35 + 0.9 * n);
      const i = (y * 256 + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
      img.data[i + 3] = Math.min(255, v * 255);
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * The wing, drawn: no fill at all, only its outline and its veins, in fine white ink strokes taken from the beetle's own
 * painted wing.
 */
function drawnWing(img: HTMLImageElement) {
  const w = img.width;
  const h = img.height;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, w, h);
  const p = d.data;
  const a0 = new Float32Array(w * h);
  const l0 = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    a0[i] = p[i * 4 + 3] / 255;
    l0[i] = (p[i * 4] * 0.3 + p[i * 4 + 1] * 0.59 + p[i * 4 + 2] * 0.11) / 255;
  }
  // the same wing, blurred: a vein is a thin line darker than what is round it; a dark patch is not a vein
  const bc = document.createElement("canvas");
  bc.width = w;
  bc.height = h;
  const bg = bc.getContext("2d")!;
  bg.filter = `blur(${Math.max(3, Math.round(w / 220))}px)`;
  bg.drawImage(img, 0, 0);
  const bd = bg.getImageData(0, 0, w, h).data;
  const out = g.createImageData(w, h);
  const q = out.data;
  const root = (x: number) => {
    const u = (x / w - WING_BASE[0]) / 0.16;
    return u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u); // the wing fades in from where it meets the body
  };
  const ink = (o: number, a: number) => {
    a *= root(o % w);
    q[o * 4] = 246;
    q[o * 4 + 1] = 246;
    q[o * 4 + 2] = 246;
    q[o * 4 + 3] = Math.max(q[o * 4 + 3], Math.round(255 * a));
  };
  const st = Math.max(3, Math.round(w / 260));
  // a pressure that rises and falls along the edge, so the outline reads as a hand-drawn stroke
  const pressure = (x: number, y: number) => 0.55 + 0.45 * Math.sin(x * 0.011 + Math.sin(y * 0.017) * 2.2) * Math.sin(y * 0.009 + 1.3);
  for (let y = st; y < h - st; y++) {
    for (let x = st; x < w - st; x++) {
      const o = y * w + x;
      if (a0[o] < 0.08) continue;
      const pr = pressure(x, y);
      const k = Math.round(st * (0.5 + 0.7 * pr));
      if (a0[o - k] < 0.08 || a0[o + k] < 0.08 || a0[o - k * w] < 0.08 || a0[o + k * w] < 0.08) ink(o, 0.75 + 0.25 * pr);
      else if (a0[o] > 0.3) {
        // the veins: only thin dark lines, never a filled patch
        const bl = (bd[o * 4] * 0.3 + bd[o * 4 + 1] * 0.59 + bd[o * 4 + 2] * 0.11) / 255;
        const v = (bl - l0[o] - 0.05) * 7;
        if (v > 0) ink(o, Math.min(1, v) * (0.55 + 0.45 * pr));
      }
    }
  }
  g.putImageData(out, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace; // drawn as is, by its own shader
  t.anisotropy = 8;
  return t;
}

/**
 * The wing as a cloud of fine dots, like sand blown into the shape of a petal: dense along the veins and the edge, thin in
 * the membrane. Each dot is placed on the wing's own arched surface; the dots along its edge are marked, so they can drift
 * off and dissolve into the air.
 */
function stippledWing(img: HTMLImageElement, WL: number, N: number) {
  const W = 420;
  const H = Math.round((W * img.height) / img.width);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;
  g.clearRect(0, 0, W, H);
  g.filter = "blur(4px)";
  g.drawImage(img, 0, 0, W, H);
  const bd = g.getImageData(0, 0, W, H).data;
  const A = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : d[(y * W + x) * 4 + 3] / 255);
  const L = (o: number, src: Uint8ClampedArray) => (src[o * 4] * 0.3 + src[o * 4 + 1] * 0.59 + src[o * 4 + 2] * 0.11) / 255;
  const HW = WL * WING_ASPECT;
  const pos: number[] = [];
  const seed: number[] = [];
  const edge: number[] = [];
  let tries = 0;
  while (pos.length / 3 < N && tries < N * 60) {
    tries++;
    const x = Math.floor(Math.random() * W);
    const y = Math.floor(Math.random() * H);
    const a = A(x, y);
    if (a < 0.06) continue;
    const o = y * W + x;
    const u = x / W;
    if (u < WING_BASE[0] + 0.02) continue;
    const vein = Math.max(0, Math.min(1, (L(o, bd) - L(o, d) - 0.03) * 8));
    let e = 0;
    for (let k = 0; k < 8; k++) {
      const an = (k / 8) * Math.PI * 2;
      if (A(Math.round(x + Math.cos(an) * 7), Math.round(y + Math.sin(an) * 7)) < 0.06) e = 1;
    }
    // where it meets the body it is barely there; it thickens outwards
    const root = Math.min(1, (u - WING_BASE[0]) / 0.18);
    // thick along the rim, a light sprinkle across the wing itself
    const dens = (e ? 0.95 : 0.12) * root;
    if (Math.random() > dens) continue;
    const px = (u - WING_BASE[0]) * WL;
    const pz = (WING_BASE[1] - y / H) * HW;
    const cc = 1 - y / H;
    const xn = px / WL;
    const py = 0.07 * WL * Math.sin(Math.PI * cc) * Math.min(1, xn * 2.5) + 0.08 * WL * xn * xn + (Math.random() - 0.5) * 0.012 * WL;
    pos.push(px, py, pz);
    // outward from the middle of the wing, a little up: the way its loose dust drifts
    const ox = px - 0.45 * WL;
    const oz = pz;
    const ol = Math.hypot(ox, oz) || 1;
    seed.push(0.6 + Math.random() * (e ? 1.3 : 0.9), Math.random(), ox / ol + (Math.random() - 0.5) * 0.6, oz / ol + (Math.random() - 0.5) * 0.6);
    edge.push(!e ? 0.08 : Math.random() < 0.35 ? 0.15 : 0.55 + 0.45 * Math.random()); // the sprinkle stays; at the rim some hold, most drift off
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 4));
  geo.setAttribute("aEdge", new THREE.Float32BufferAttribute(edge, 1));
  return geo;
}

/* ---------------- the sketch: the beetle drawn in ink over white, like the drawings in the case studies ---------------- */
const SKETCH_VS = `
varying vec3 vN; varying vec3 vV; varying vec3 vObj; varying float vDepth;
void main(){
  vObj = position;
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vV = normalize(-mv.xyz);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const SKETCH_FS = `
varying vec3 vN; varying vec3 vV; varying vec3 vObj; varying float vDepth;
uniform vec3 ink;
uniform float fogNear; uniform float fogFar; uniform float time; uniform float px;
uniform float merid; uniform float rings; uniform float hatchAmt; uniform float weight;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
// a line along whole numbers of x, about wpx pixels wide whatever the size on screen
float lineAt(float x, float wpx){
  float d = abs(fract(x + 0.5) - 0.5);
  float fw = max(fwidth(x), 1e-5);
  return 1.0 - smoothstep(wpx * 0.5, wpx * 0.5 + 0.9, d / fw);
}
void main(){
  vec3 N = normalize(vN); vec3 V = normalize(vV);
  if (!gl_FrontFacing) N = -N;
  // the drawing boils a little, as if redrawn a few times a second
  float boil = floor(time * 5.0);
  vec2 fc = gl_FragCoord.xy / px;
  // the pressure of the pen rises and falls along each line, so it swells and tapers like the loader's strokes
  float pressure = 0.45 + 1.0 * noise(fc * 0.04 + boil * 3.1);
  // the outline: where the surface turns away from you
  float ndv = abs(dot(N, V));
  float fw = max(fwidth(ndv), 1e-4);
  float wpx = 1.7 * weight * pressure * px;
  float a = 1.0 - smoothstep(wpx, wpx + 1.0, ndv / fw);
  a *= 0.7 + 0.3 * smoothstep(0.15, 0.35, noise(fc * 0.025 + boil * 1.3 + 9.0));
  vec3 L = normalize(vec3(-0.45, 0.75, 0.55));
  float n = dot(N, L) * 0.5 + 0.5;
  float jit = (noise(vObj.xz * 7.0 + boil) - 0.5) * 0.1;
  // lines drawn across the form, so it reads round: along the wing cases (and the seam), around the body
  if (merid > 0.0) {
    a = max(a, lineAt(abs(vObj.x) * merid + jit, 1.2 * pressure * px) * smoothstep(0.03, 0.07, abs(vObj.x)) * (0.5 + 0.5 * n));
    a = max(a, lineAt(vObj.x + jit * 0.02, 1.6 * px));
  }
  if (rings > 0.0) a = max(a, lineAt(vObj.z * rings + jit, 1.1 * pressure * px) * (0.45 + 0.55 * n));
  // stippled light: fine dots of ink where the light falls, thicker where it is brightest, as in a stipple drawing
  if (hatchAmt > 0.0) {
    vec2 q = fc / 3.2;
    vec2 cell = floor(q);
    vec2 jit = vec2(hash(cell + 1.7), hash(cell + 8.3)) - 0.5;
    float dd = length(fract(q) - 0.5 - jit * 0.5);
    float dotv = 1.0 - smoothstep(0.16, 0.3, dd);
    float dens = smoothstep(0.5, 0.95, n) * 0.6 * hatchAmt;
    a = max(a, dotv * step(hash(cell + 3.1), dens) * 0.85);
  }
  // far back in the haze the drawing fades
  a *= 1.0 - smoothstep(fogNear, fogFar, vDepth);
  // nothing is filled: only the ink shows; the paper is left as it is
  a *= 0.8; // a fine outline, like the wing's; the dust carries the form
  gl_FragColor = vec4(ink * a, a);
}`;

type SketchU = { time: { value: number }; fogNear: { value: number }; fogFar: { value: number }; px: { value: number } };
type Lines = { merid?: number; rings?: number; hatch?: number; weight?: number };
const INK = new THREE.Vector3(0.96, 0.96, 0.96); // pure white ink, no warmth: white and grey only
function sketchMaterial(shared: SketchU, lines: Lines = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: SKETCH_VS,
    fragmentShader: SKETCH_FS,
    side: THREE.DoubleSide, // the inside of the shell is drawn too, so an open or turned shell never shows an empty hole
    uniforms: {
      ...shared,
      ink: { value: INK },
      merid: { value: lines.merid ?? 0 },
      rings: { value: lines.rings ?? 0 },
      hatchAmt: { value: lines.hatch ?? 0 },
      weight: { value: lines.weight ?? 1 },
    },
  });
}

/**
 * Fine dust on a body part's surface, like the wings: it gathers along the part's outline as you see it, thin across its
 * face, and the dust on the outline drifts off and fades, always renewed.
 */
const BODY_DUST_VS = `attribute vec3 aN; attribute vec4 aSeed;
  uniform float time; uniform float proj; uniform float fogNear; uniform float fogFar; uniform float amt;
  varying float vA;
  void main(){
    float life = fract(time * 0.2 + aSeed.y);
    vec3 n = normalize(aN);
    // most of the dust streams out from the body into the air round it, a wide soft cloud; the rest holds its outline
    vec3 dir = normalize(n + vec3(sin(aSeed.y * 51.0), cos(aSeed.y * 23.0), sin(aSeed.y * 13.0)) * 0.6);
    vec3 p = position + dir * life * (0.15 + 0.9 * aSeed.w) * aSeed.z;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    gl_PointSize = max(1.0, aSeed.x * 0.014 * proj / depth);
    float rim = 1.0 - abs(dot(normalize(normalMatrix * n), normalize(-mv.xyz)));
    float a = smoothstep(0.35, 0.95, rim) * 0.95 + 0.1;
    vA = mix(a, 0.55, aSeed.z * smoothstep(0.0, 0.25, life)) * mix(1.0, (1.0 - life) * (1.0 - life), aSeed.z) * (0.75 + 0.25 * sin(time * 2.1 + aSeed.y * 37.0)) * (1.0 - smoothstep(fogNear, fogFar, depth)) * amt;
  }`;
const BODY_DUST_FS = `varying float vA;
  void main(){ float r = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(0.95), vA * (1.0 - smoothstep(0.3, 0.5, r))); }`;
function surfaceDust(geo: THREE.BufferGeometry, n: number) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const pa = g.attributes.position;
  const tris = pa.count / 3;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const e1 = new THREE.Vector3();
  const e2 = new THREE.Vector3();
  const areas: number[] = [];
  let total = 0;
  for (let t = 0; t < tris; t++) {
    a.fromBufferAttribute(pa, t * 3);
    b.fromBufferAttribute(pa, t * 3 + 1);
    c.fromBufferAttribute(pa, t * 3 + 2);
    total += e1.subVectors(b, a).cross(e2.subVectors(c, a)).length() / 2;
    areas.push(total);
  }
  const pos: number[] = [];
  const nor: number[] = [];
  const seed: number[] = [];
  for (let i = 0; i < n; i++) {
    const r = Math.random() * total;
    let lo = 0;
    let hi = tris - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (areas[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    a.fromBufferAttribute(pa, lo * 3);
    b.fromBufferAttribute(pa, lo * 3 + 1);
    c.fromBufferAttribute(pa, lo * 3 + 2);
    let u = Math.random();
    let v = Math.random();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    const p = a.clone().addScaledVector(e1.subVectors(b, a), u).addScaledVector(e2.subVectors(c, a), v);
    const nn = new THREE.Vector3().crossVectors(e1, e2).normalize();
    pos.push(p.x, p.y, p.z);
    nor.push(nn.x, nn.y, nn.z);
    seed.push(0.45 + Math.random() * 0.9, Math.random(), Math.random() < 0.8 ? 1 : 0, Math.random() * (0.35 + 0.65 * Math.random())); // most stream out, many far, into a wide cloud round it
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute("aN", new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 4));
  return out;
}

/* ---------------- the beetle ---------------- */
// how big the body is against its wings, and so how high it stands: its legs reach 0.28 of its own units below its middle,
// so at this size its feet rest exactly on the floor, each on its own shadow
const BODY = 0.47;
const STAND = 0.28 * BODY;
/** Its own units: about 1 long, head towards +z, back up +y. Painted from above with the top-view watercolour. */
function buildBeetle(wingTex: THREE.Texture, wingDots: THREE.BufferGeometry, sk: SketchU, proj: number, size = 5) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  body.position.y = STAND; // standing tall on its feet: they just touch the floor
  root.add(body);

  // drawn, not painted: only lines of white ink, nothing filled
  // drawn as the wings are: only a fine outline, and the dust; nothing drawn across it
  const shell = sketchMaterial(sk, { weight: 0.8 });
  const front = sketchMaterial(sk, { weight: 0.75 });
  const black = sketchMaterial(sk, { weight: 0.9 }); // the eyes
  const cream = sketchMaterial(sk, { weight: 0.8 });
  const legMat = sketchMaterial(sk, { weight: 0.9 });
  const amber = legMat;
  const bellyMat = sketchMaterial(sk, { weight: 0.7 });

  const mapTop = (g: THREE.BufferGeometry, front: number, back: number, halfW: number, rowFront: number, rowBack: number) => {
    const p = g.attributes.position;
    const uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      const u = (512 + (p.getX(i) / halfW) * 184) / 1024;
      const k = (front - p.getZ(i)) / (front - back);
      const row = rowFront + k * (rowBack - rowFront);
      uv[i * 2] = u;
      uv[i * 2 + 1] = 1 - row / 1024;
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    return g;
  };

  // abdomen
  const bellyG = new THREE.SphereGeometry(1, 32, 20);
  mapTop(bellyG, 1, -1, 1, 420, 760);
  const belly = new THREE.Mesh(bellyG, bellyMat);
  belly.scale.set(0.32, 0.17, 0.44); // a full, rounded underside
  belly.position.set(0, 0.0, -0.08);
  belly.castShadow = true;
  body.add(belly);

  // wing cases: two half domes hinged at the front of the seam
  const cases: THREE.Group[] = [];
  for (const side of [1, -1]) {
    // a high, full oval: each case is one closed half of the round body, so from no side is there an open rim or a
    // glimpse of the parts inside; the underside is a flatter curve
    const g = new THREE.SphereGeometry(1, 48, 32, side > 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI, 0, Math.PI);
    {
      const pa = g.attributes.position;
      for (let i = 0; i < pa.count; i++) if (pa.getY(i) < 0) pa.setY(i, pa.getY(i) * 0.45);
      g.computeVertexNormals();
    }
    g.scale(0.42, 0.4, 0.5);
    g.translate(0, 0.0, -0.06);
    mapTop(g, 0.41, -0.53, 0.4, 381, 794);
    const hinge = new THREE.Group();
    hinge.position.set(0, 0.09, 0.37);
    g.translate(0, -0.09, -0.37);
    const m = new THREE.Mesh(g, shell);
    m.castShadow = true;
    hinge.add(m);
    body.add(hinge);
    cases.push(hinge);
  }

  // the shield, black and glossy with two cream patches
  const shieldG = new THREE.SphereGeometry(1, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2);
  shieldG.scale(0.33, 0.22, 0.17);
  mapTop(shieldG, 0.17, -0.17, 0.34 * 0.72, 250, 381);
  const shield = new THREE.Mesh(shieldG, front);
  shield.position.set(0, 0.0, 0.44);
  shield.castShadow = true;
  body.add(shield);
  for (const s of [1, -1]) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), cream);
    p.scale.set(0.11, 0.07, 0.08);
    p.position.set(s * 0.2, 0.08, 0.5);
    body.add(p);
  }

  // the head, its big glossy eyes, pale spots and the mouth
  const pupils: THREE.Mesh[] = [];
  const head = new THREE.Group();
  head.position.set(0, 0.0, 0.58);
  body.add(head);
  const skullG = new THREE.SphereGeometry(1, 28, 18);
  skullG.scale(0.17, 0.11, 0.11);
  mapTop(skullG, 0.11, -0.11, 0.17 * 0.5, 176, 250);
  const skull = new THREE.Mesh(skullG, front);
  skull.castShadow = true;
  head.add(skull);
  for (const s of [1, -1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), black);
    eye.position.set(s * 0.12, 0.02, 0.05);
    // its eyes, drawn like the rest: the eye a ring of ink, the pupil a single dot of ink on it, turning to look at you
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.019, 14, 10), new THREE.MeshBasicMaterial({ color: lin(0.95, 0.95, 0.95) }));
    pupil.position.set(0, 0, 0.07);
    eye.add(pupil);
    pupils.push(pupil);
    head.add(eye);
    const spot = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), cream);
    spot.scale.set(0.035, 0.025, 0.02);
    spot.position.set(s * 0.05, 0.06, 0.1);
    head.add(spot);
  }
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), legMat);
  mouth.scale.set(0.07, 0.04, 0.05);
  mouth.position.set(0, -0.06, 0.1);
  head.add(mouth);

  // antennae: each a slender line in five jointed pieces, ending in a small club; every joint bends, so they curl and feel the air
  const antennae: THREE.Group[] = [];
  const antSeg = (len: number, r0: number, r1: number) => {
    const g = new THREE.CylinderGeometry(r1, r0, len, 8);
    g.rotateX(Math.PI / 2);
    g.translate(0, 0, len / 2);
    return g;
  };
  for (const s of [1, -1]) {
    const a = new THREE.Group();
    a.position.set(s * 0.06, 0.05, 0.1);
    const joints: THREE.Group[] = [];
    let parent: THREE.Group = a;
    const lens = [0.07, 0.065, 0.06, 0.055, 0.05];
    lens.forEach((len, i) => {
      const j = new THREE.Group();
      if (i > 0) j.position.z = lens[i - 1];
      j.add(new THREE.Mesh(antSeg(len, 0.012 - i * 0.0012, 0.011 - i * 0.0012), legMat));
      parent.add(j);
      joints.push(j);
      parent = j;
    });
    const club = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), amber);
    club.scale.set(0.02, 0.016, 0.042);
    club.position.z = lens[lens.length - 1] + 0.03;
    parent.add(club);
    a.userData.joints = joints;
    head.add(a);
    antennae.push(a);
  }

  // six legs: thigh, shin and foot, jointed
  type Leg = { yawBase: number; hip: THREE.Group; knee: THREE.Group; root: THREE.Group; side: number; phase: number; row: number };
  const legs: Leg[] = [];
  const seg = (len: number, r: number, mat = legMat) => {
    const g = new THREE.CylinderGeometry(r * 0.8, r, len, 8);
    g.rotateZ(-Math.PI / 2);
    g.translate(len / 2, 0, 0);
    const m = new THREE.Mesh(g, mat);
    m.castShadow = true;
    return m;
  };
  [0.32, 0.1, -0.14].forEach((z, i) => {
    for (const side of [1, -1]) {
      const yaw = i === 0 ? 0.6 : i === 1 ? 0.05 : -0.5; // front legs reach forward, back legs back
      const root = new THREE.Group();
      root.position.set(side * 0.2, 0.0, z);
      const yawBase = side > 0 ? -yaw : Math.PI + yaw;
      root.rotation.y = yawBase;
      const hip = new THREE.Group();
      hip.rotation.z = 0.35;
      root.add(hip);
      hip.add(seg(0.24, 0.022));
      const knee = new THREE.Group();
      knee.position.x = 0.24;
      knee.rotation.z = -1.85;
      hip.add(knee);
      knee.add(seg(0.31, 0.015));
      const ankle = new THREE.Group();
      ankle.position.x = 0.31;
      ankle.rotation.z = 0.95;
      knee.add(ankle);
      ankle.add(seg(0.1, 0.012, amber));
      body.add(root);
      legs.push({ yawBase, hip, knee, root, side, phase: (i % 2 === 0) === side > 0 ? 0 : Math.PI, row: i });
    }
  });

  // wings: the beetle's own painted wings, folded under the cases until it flies
  const WL = 4.4; // large: the wings lead
  const wg = new THREE.PlaneGeometry(WL, WL * WING_ASPECT, 28, 14);
  wg.translate(-(WING_BASE[0] - 0.5) * WL, -(0.5 - WING_BASE[1]) * WL * WING_ASPECT, 0);
  wg.rotateX(Math.PI / 2); // flat, the front edge forwards (+z)
  // a real wing is not flat: it arches along its chord and its tip curls up a little, so it keeps its shape seen from the side
  {
    const pa = wg.attributes.position;
    const zs: number[] = [];
    for (let i = 0; i < pa.count; i++) zs.push(pa.getZ(i));
    const z0 = Math.min(...zs);
    const z1 = Math.max(...zs);
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i) / WL;
      const c = (pa.getZ(i) - z0) / (z1 - z0);
      pa.setY(i, 0.07 * WL * Math.sin(Math.PI * c) * Math.min(1, x * 2.5) + 0.08 * WL * x * x);
    }
    wg.computeVertexNormals();
  }
  // the wings: nothing but their drawn outline and veins
  // seen edge-on, or right up against the lens, a drawn wing becomes a fan of sharp streaks: there it softly fades away
  const wingMat = new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying float vD;
      void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D map; uniform float fogNear; uniform float fogFar; varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying float vD;
      void main(){
        vec4 c = texture2D(map, vUv);
        float facing = abs(dot(normalize(vN), normalize(vV)));
        float a = c.a * smoothstep(0.05, 0.28, facing) * smoothstep(2.4, 3.6, vD) * (1.0 - smoothstep(fogNear, fogFar, vD)); // the wing is drawn; the dust lives only round its edge
        gl_FragColor = vec4(c.rgb, a);
      }`,
    uniforms: { map: { value: wingTex }, fogNear: sk.fogNear, fogFar: sk.fogFar },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  // the wing itself: fine dust, held in its shape, its edges drifting off into the air
  const dustMat = new THREE.ShaderMaterial({
    vertexShader: `attribute vec4 aSeed; attribute float aEdge;
      uniform float time; uniform float proj; uniform float px; uniform float WL;
      varying float vA; varying float vT;
      void main(){
        vec3 p = position;
        float life = fract(time * 0.16 + aSeed.y);
        // the loose dust at the edge streams off and fades; it is always being replaced
        p += vec3(aSeed.z, 0.25, aSeed.w) * life * life * 0.16 * WL * aEdge;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float depth = -mv.z;
        gl_PointSize = max(1.0, aSeed.x * 0.0085 * WL * proj / depth);
        vec3 n = normalize(normalMatrix * vec3(0.0, 1.0, 0.0));
        float facing = abs(dot(n, normalize(-mv.xyz)));
        float tw = 0.75 + 0.25 * sin(time * 2.3 + aSeed.y * 40.0);
        vA = mix(1.0, 1.0 - life, aEdge) * tw * mix(0.4, 1.0, smoothstep(0.05, 0.3, facing)) * smoothstep(1.6, 3.0, depth);
        vT = aSeed.y;
      }`,
    fragmentShader: `uniform float open; uniform float fogNear; uniform float fogFar; varying float vA; varying float vT;
      void main(){
        float r = length(gl_PointCoord - 0.5);
        float a = (1.0 - smoothstep(0.3, 0.5, r)) * vA * open * 0.85;
        vec3 col = mix(vec3(0.97), vec3(0.74), step(0.7, vT)); // white, with some soft grey among it
        gl_FragColor = vec4(col, a);
      }`,
    uniforms: { time: sk.time, proj: { value: proj }, px: sk.px, WL: { value: WL }, open: { value: 0 }, fogNear: sk.fogNear, fogFar: sk.fogFar },
    transparent: true,
    depthWrite: false,
  });
  const wings: THREE.Group[] = [];
  for (const side of [1, -1]) {
    const w = new THREE.Group();
    w.position.set(side * 0.1, 0.12, 0.28);
    w.rotation.order = "YXZ";
    const m = new THREE.Mesh(wg, wingMat);
    m.scale.x = side;
    m.renderOrder = 22;
    w.add(m);
    const dots = new THREE.Points(wingDots, dustMat);
    dots.scale.x = side;
    dots.renderOrder = 23;
    dots.frustumCulled = false;
    w.add(dots);
    body.add(w);
    wings.push(w);
  }

  // a larger beetle overall, its body a touch smaller against its wings
  // the body smaller, the wings as large as before
  root.scale.setScalar(size);
  body.scale.setScalar(BODY);
  for (const w of wings) w.scale.setScalar(0.88 / BODY);
  // The drawing hides its own back lines, but must never blot out the smoke or haze behind it: each part is drawn twice,
  // first only into depth (after the smoke), then its ink, which lets everything behind show through its empty paper.
  const depthOnly = new THREE.MeshBasicMaterial({ colorWrite: false, transparent: true, side: THREE.DoubleSide });
  const dustBody = new THREE.ShaderMaterial({
    vertexShader: BODY_DUST_VS,
    fragmentShader: BODY_DUST_FS,
    uniforms: { time: sk.time, proj: { value: proj }, fogNear: sk.fogNear, fogFar: sk.fogFar, amt: { value: 1 } },
    transparent: true,
    depthWrite: false,
  });
  const parts: THREE.Mesh[] = [];
  root.traverse((o) => {
    if (o instanceof THREE.Mesh && o.material instanceof THREE.ShaderMaterial && o.material.fragmentShader === SKETCH_FS) parts.push(o);
  });
  for (const m of parts) {
    const mat = m.material as THREE.ShaderMaterial;
    mat.transparent = true;
    mat.depthWrite = false;
    mat.depthFunc = THREE.LessEqualDepth;
    mat.blending = THREE.CustomBlending;
    mat.blendSrc = THREE.OneFactor;
    mat.blendDst = THREE.OneMinusSrcAlphaFactor;
    m.renderOrder = 21;
    const d = new THREE.Mesh(m.geometry, depthOnly);
    d.renderOrder = 20;
    m.add(d);
  }
  // the dust: on the shell, the shield, the head and the underside
  for (const m of parts) {
    const g = m.geometry as THREE.BufferGeometry;
    if (!g.boundingSphere) g.computeBoundingSphere();
    const size = g.boundingSphere!.radius * Math.max(m.scale.x, m.scale.y, m.scale.z);
    if (!(g instanceof THREE.SphereGeometry) || size < 0.15) continue;
    const dots = new THREE.Points(surfaceDust(g, Math.round(13000 + 40000 * Math.min(1, size * 2))), dustBody);
    dots.renderOrder = 23;
    dots.frustumCulled = false;
    m.add(dots);
  }
  return { root, body, cases, wings, legs, antennae, head, WL, dustMat, dustBody, pupils };
}

export default function HeroFilm({ palette }: { palette?: InkPalette } = {}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const CLAY = palette ?? GREY; // the painting's own colours: its smoke and the paint the beetle leaves take them
    const box = host.getBoundingClientRect();
    const PW = Math.max(300, Math.round(box.width));
    const PH = Math.max(200, Math.round(box.height));
    const aspect = PW / PH;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true;
    let raf = 0;
    const cleanup: (() => void)[] = [];

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0); // see-through: the painting underneath is the very one from the case study
    const pr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(pr);
    renderer.setSize(PW, PH);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = false; // its shadow is a soft pool of shade, drawn below, not a hard cast shadow
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    host.appendChild(renderer.domElement);
    cleanup.push(() => {
      renderer.dispose();
      renderer.domElement.remove();
    });
    const ro = new ResizeObserver(() => {
      const r = host.getBoundingClientRect();
      if (Math.abs(r.width - PW) / PW > 0.2 || Math.abs(r.height - PH) / PH > 0.25) setKey((k) => k + 1);
    });
    ro.observe(host);
    cleanup.push(() => ro.disconnect());

    /* ---------------- stage, camera, light ---------------- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(24, aspect, 0.05, 80);
    const FLOOR = -3.4; // the ground far below the box, so it can dive out through the bottom as freely as anywhere
    const CAM = new THREE.Vector3(0, 1.4, 6); // a little above its flight, looking nearly level: it is seen from above and the side, low and high alike
    camera.position.copy(CAM);
    camera.lookAt(0, 0.3, 0);
    scene.add(camera);

    // the paint the beetle leaves on the painting: a small canvas it dabs into as it goes, shown as a faint dark grey
    // glaze far behind it, its edges ragged like wet paint; it slowly soaks away
    const PCW = 420;
    const PCH = Math.max(60, Math.round(PCW / aspect));
    const pc = document.createElement("canvas");
    pc.width = PCW;
    pc.height = PCH;
    const pg = pc.getContext("2d")!;
    const paintTex = new THREE.CanvasTexture(pc);
    paintTex.minFilter = paintTex.magFilter = THREE.LinearFilter;
    const glazeMat = new THREE.ShaderMaterial({
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `
varying vec2 vUv;
uniform sampler2D paint; uniform vec3 col; uniform float time;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }
void main(){
  vec2 w = (vec2(noise(vUv * 14.0 + time * 0.05), noise(vUv * 14.0 + 7.0 - time * 0.05)) - 0.5) * 0.03;
  float pv = texture2D(paint, vUv + w).a + (noise(vUv * 40.0) - 0.5) * 0.06;
  float body = smoothstep(0.05, 0.5, pv);
  float rim = smoothstep(0.05, 0.12, pv) * (1.0 - smoothstep(0.14, 0.32, pv));
  gl_FragColor = vec4(col, body * 0.11 + rim * 0.05); // faint: a breath of dark grey left where it went, never a stain
}`,
      uniforms: { paint: { value: paintTex }, col: { value: new THREE.Vector3(CLAY.deep[0] * 0.7, CLAY.deep[1] * 0.7, CLAY.deep[2] * 0.7) }, time: { value: 0 } },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const GD = 40;
    const gh = 2 * GD * Math.tan(((24 / 2) * Math.PI) / 180);
    const glaze = new THREE.Mesh(new THREE.PlaneGeometry(gh * aspect, gh), glazeMat);
    glaze.position.set(0, 0, -GD);
    glaze.renderOrder = -10;
    camera.add(glaze);
    let paintFade = 0;
    const ndc = new THREE.Vector3();
    const dab = (x: number, y: number, r: number, a: number) => {
      const gr = pg.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(255,255,255,${a})`);
      gr.addColorStop(0.6, `rgba(255,255,255,${a * 0.6})`);
      gr.addColorStop(1, "rgba(255,255,255,0)");
      pg.fillStyle = gr;
      pg.beginPath();
      pg.arc(x, y, r, 0, Math.PI * 2);
      pg.fill();
    };

    // the drawing's shared settings: the clock it boils to, and how it fades into the haze far back
    const sketchU = { time: { value: 0 }, fogNear: { value: 6.5 }, fogFar: { value: 20 }, px: { value: pr } };

    // one light, only for the beetle's soft shadow on the floor
    const key1 = new THREE.DirectionalLight(0xffffff, 1);
    key1.position.set(-3, 6, 5);
    key1.castShadow = true;
    key1.shadow.mapSize.set(2048, 2048);
    key1.shadow.radius = 3;
    key1.shadow.bias = -0.0005;
    const sc = key1.shadow.camera as THREE.OrthographicCamera;
    sc.left = -2.2;
    sc.right = 2.2;
    sc.top = 2.2;
    sc.bottom = -2.2;
    sc.near = 0.5;
    sc.far = 20;
    scene.add(key1);
    scene.add(key1.target);
    // its shadow: a soft, blurred pool of shade on the floor under it, wider and fainter the higher it flies, melting into
    // the painting rather than standing out against it
    const shadowTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const g = c.getContext("2d")!;
      const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      for (let k = 0; k <= 10; k++) {
        const x = k / 10;
        gr.addColorStop(x, `rgba(0,0,0,${Math.exp(-x * x * 4.5) * (1 - x)})`);
      }
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })();
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, color: lin(0.13, 0.13, 0.13), transparent: true, opacity: 0, depthWrite: false });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.renderOrder = -5;
    scene.add(shadow);
    let shadowAmt = 0;

    /* ---------------- smoke and motes ---------------- */
    const smokeTex = smokeTexture();
    type Puff = { s: THREE.Sprite; base: THREE.Vector3; drift: number; spin: number; size: number; phase: number };
    const puffs: Puff[] = [];
    for (let i = 0; i < 70; i++) {
      const mat = new THREE.SpriteMaterial({ map: smokeTex, color: lin(...CLAY.pale).multiplyScalar(1.25), transparent: true, opacity: 0, depthWrite: false, fog: false });
      const s = new THREE.Sprite(mat);
      const base = new THREE.Vector3(rnd(-7, 7), rnd(0.05, i < 50 ? 0.7 : 2.2), rnd(-14, 3.5));
      const size = rnd(1.6, 4.2) * (i < 50 ? 1 : 1.5);
      s.scale.set(size * 1.6, size, 1);
      s.position.copy(base);
      s.renderOrder = 5;
      scene.add(s);
      puffs.push({ s, base, drift: rnd(0.08, 0.25) * (Math.random() < 0.5 ? -1 : 1), spin: rnd(-0.05, 0.05), size, phase: rnd(0, 6.28) });
    }
    /* ---------------- strokes in the air: short pen marks instead of bubbles ---------------- */
    const strokeMat = new THREE.ShaderMaterial({
      vertexShader: "attribute float alpha; uniform float proj; varying float vA; void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = max(1.0, 0.022 * proj / -mv.z); }",
      fragmentShader: "varying float vA; void main(){ float r = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(0.9), vA * (1.0 - smoothstep(0.3, 0.5, r))); }",
      uniforms: { proj: { value: (PH * pr) / (2 * Math.tan((12 * Math.PI) / 180)) } },
      transparent: true,
      depthWrite: false,
    });
    const makeStrokes = (n: number) => {
      const pos = new Float32Array(n * 6);
      const alpha = new Float32Array(n * 2);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("alpha", new THREE.BufferAttribute(alpha, 1));
      const lines = new THREE.Points(geo, strokeMat); // fine dust, each mote a pair of dots
      lines.frustumCulled = false;
      lines.renderOrder = 24;
      scene.add(lines);
      return { pos, alpha, geo };
    };
    // drifting in the air all the time: a few short marks, like the quick strokes round a sketch
    const N = 0; // no dust hanging over the whole picture: only what the beetle itself gives off
    const air = makeStrokes(N);
    const airSeed = Array.from({ length: N }, () => ({ x: rnd(-6, 6), y: rnd(0, 2.4), z: rnd(-9, 3.5), len: rnd(0.04, 0.12), ang: rnd(-0.6, 0.6), ph: rnd(0, 6.28), a: rnd(0.25, 0.6) }));

    /* ---------------- the film ---------------- */
    let beetle: ReturnType<typeof buildBeetle> | null = null;

    const WALK_FROM = -6; // far back in the smoke
    const WALK_TO = 1.5; // in front of you, but not too close
    const T_WALK0 = 1.2;
    const WALK_SPEED = 1.25;
    const T_STOP = T_WALK0 + (WALK_TO - WALK_FROM) / WALK_SPEED;
    const T_OPEN = T_STOP + 0.8;
    const T_LIFT = T_OPEN + 1.3;

    // after the intro it flies freely about the box, slowly, for as long as you look
    const T_FREE = T_LIFT + 2.8;
    // not always the walk-in: half the time the film opens with the beetle already there, peeping in at you
    const skipIntro = true; // the walk-in is set aside for now: it opens already looking at you
    const fly = { on: false, p: new THREE.Vector3(), v: new THREE.Vector3(), target: new THREE.Vector3(), next: 0, yaw: 0, roll: 0, pts: [] as THREE.Vector3[], idx: 0, gone: 0, hidden: false, perch: false, face: false };
    const ndcNow = new THREE.Vector3();
    /* Its flight is a series of passes. It comes in from beyond one edge of the frame (a side, the top or the bottom), crosses
       the box on a diagonal through some point inside it, nearer or further, and goes out past another edge. Then it is gone
       for a moment, and comes back in from somewhere else. Now and then a pass ends not out of the frame but at the side it
       is heading for, where it settles and looks at you. */
    type Edge = "L" | "R" | "T" | "B";
    const edgePoint = (e: Edge, d0: number, out = new THREE.Vector3()) => {
      const d = d0;
      const [nx, ny] = e === "L" ? [-1.45, rnd(-0.9, -0.1)] : e === "R" ? [1.45, rnd(-0.9, -0.1)] : e === "T" ? [rnd(-0.8, 0.8), 1.6] : [rnd(-0.9, 0.9), -1.6];
      return onFrame(nx, ny, d, out);
    };
    let lastEdge: Edge = Math.random() < 0.5 ? "L" : "R";
    let lastPerchSide = 0;
    let introPending = false;
    /* Straight across, one side to the other: it flies across the box from where it is to beyond the far side (or down
       and out through the bottom), on a gentle downward slant, without turning. Out of sight it turns round and comes back
       across the other way, at another height and distance. Now and then, on its way across, it stops to look at you:
       it hangs in front of you, or it settles at the side it is flying towards; then it carries on the way it was going. */
    /* A beetle's wandering flight, one leg at a time. Each leg sets off on a heading turned a little from the one before,
       in any direction on screen (across, up, down, on a slant), for a stretch, nearer or further: so the path bends and
       curves like a living thing, never the same twice. When it drifts out of the frame it carries on a little, then turns
       back in. It only stops to look at you where it already is: at the side or corner it has come to, or right where it
       is hanging in the middle. */
    let dirX = 1;
    const wand = { h: -Math.PI / 2, d: 8.2, lastLook: 0 };
    const lift = (v: THREE.Vector3) => (v.y = Math.max(v.y, FLOOR + 0.35));
    const newPass = (t: number, fromHere: boolean, mayPerch = true) => {
      void fromHere;
      void dirX;
      ndcNow.copy(fly.p).project(camera);
      const nx = ndcNow.x;
      const ny = ndcNow.y;
      const out = Math.abs(nx) > 1.05 || Math.abs(ny) > 1.05;
      fly.perch = false;
      fly.face = false;
      // looking at you: only now and then, and only from where it already is
      if (mayPerch && !out && t - wand.lastLook > 12) {
        const headingToSide = Math.cos(wand.h) * Math.sign(nx) > 0.3;
        if (Math.abs(nx) > 0.55 && headingToSide && Math.random() < 0.85) {
          fly.perch = true;
          fs.perchSide = nx > 0 ? 1 : -1;
          const end = onFrame(fs.perchSide * 0.95, clamp(ny, -0.6, 0.45), clamp(camera.position.distanceTo(fly.p), 7, 8.5), new THREE.Vector3());
          fly.pts = [end];
          fly.idx = 0;
          fly.target.copy(end);
          wand.lastLook = t;
          return;
        }
        if (Math.abs(nx) < 0.55 && Math.abs(ny) < 0.75 && Math.random() < 0.45) {
          fly.face = true;
          const spot = fly.p.clone().addScaledVector(fly.v.clone().normalize(), 0.6);
          lift(spot);
          fly.pts = [spot];
          fly.idx = 0;
          fly.target.copy(spot);
          wand.lastLook = t;
          return;
        }
      }
      if (out) {
        // out of sight: it turns back towards the box, coming in somewhere near where it went out
        const back = Math.atan2(-Math.max(ny, -0.2) * 0.8 - 0.3, -nx);
        wand.h = back + rnd(-0.7, 0.7);
      } else {
        // a new heading, turned from the last: mostly a gentle bend, sometimes a sharp swerve
        wand.h += Math.random() < 0.75 ? rnd(-0.9, 0.9) : rnd(-2, 2);
        // like a heavy beetle it sinks more than it climbs: high up, it tends to turn down again
        if (Math.sin(wand.h) > 0.2 && ny > -0.2) wand.h = -wand.h + rnd(-0.3, 0.3);
      }
      const len = rnd(0.55, 1.1);
      wand.d = clamp(wand.d + rnd(-1.2, 1.2), 7, 10);
      // it keeps to the lower part of the box, where it is seen whole; if it has drifted up it turns down again
      if (ny > -0.05 && Math.sin(wand.h) > 0) wand.h = -wand.h;
      if (ny < -0.75 && Math.sin(wand.h) < 0) wand.h = -wand.h; // near the foot of the box it levels out and rises a little
      // mostly it stays in view; now and then it wanders out past a side (or below) for a moment and comes back
      const roam = Math.random() < 0.18;
      const tx = clamp(nx + Math.cos(wand.h) * len, roam ? -1.7 : -0.85, roam ? 1.7 : 0.85);
      const ty = clamp(ny + Math.sin(wand.h) * len * 0.75, roam ? -1.4 : -0.9, 0.05);
      if (Math.abs(tx) >= 0.85 && !roam) wand.h = Math.PI - wand.h; // at a side it turns along it instead of running into it
      const p = onFrame(tx, ty, wand.d, new THREE.Vector3());
      lift(p);
      fly.pts = [p];
      fly.idx = 0;
      fly.target.copy(p);
      fly.hidden = false;
    };
    const wp = new THREE.Vector3();
    const eyeTmp = new THREE.Vector3();
    const emitAt = new THREE.Vector3();
    let emitCarry = 0;
    let bodyCarry = 0;
    let backCarry = 0;
    const trail = new THREE.Vector3();

    /* after the intro: it flies, and now and then comes down to walk a little on the floor, or lands on the frame itself, on
       the glass between you, at an edge or a corner, and peeps in at you; then it takes off again */
    type Mode = "fly" | "land" | "face" | "perch" | "takeoff";
    const fs = {
      mode: "fly" as Mode,
      t0: 0,
      dur: 1,
      until: 0,
      after: "face" as "face" | "perch",
      fromFace: false,
      fromP: new THREE.Vector3(),
      toP: new THREE.Vector3(),
      fromQ: new THREE.Quaternion(),
      toQ: new THREE.Quaternion(),
      arc: 0,
      air: 1,
      walk: 0,
      gait: 0,
      yaw: 0,
      peek: 0,
      lastPerch: -1,
      perchSide: 1,
      heading: false,
    };
    const qTmp = new THREE.Quaternion();
    const eTmp = new THREE.Euler();
    const mTmp = new THREE.Matrix4();
    const vA = new THREE.Vector3();
    const vB = new THREE.Vector3();
    const vC = new THREE.Vector3();
    const fwd = new THREE.Vector3();
    const qFromEuler = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(eTmp.set(x, y, z));
    // a point on the frame, at depth d from you: n = where on the screen (-1..1)
    const onFrame = (nx: number, ny: number, d: number, out: THREE.Vector3) => {
      camera.getWorldDirection(fwd);
      vA.set(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize();
      return out.copy(camera.position).addScaledVector(vA, d / vA.dot(fwd));
    };
    const planLanding = (t: number, b: NonNullable<typeof beetle>) => {
      fs.fromP.copy(b.root.position);
      fs.fromQ.copy(b.root.quaternion);
      fs.t0 = t;
      fs.mode = "land";
      if (fs.after === "face") {
        // it comes round to face you, somewhere in the frame, and hangs there on its beating wings, looking at you
        // where it has flown to, turned square to you
        fs.toP.copy(fly.pts[fly.pts.length - 1]);
        fs.yaw = Math.atan2(camera.position.x - fs.toP.x, camera.position.z - fs.toP.z);
        fs.toQ.copy(qFromEuler(0.12, fs.yaw, 0)); // nearly level, so its wings spread out behind it rather than up out of the frame
        fs.arc = 0;
        fs.dur = 2.8;
      } else {
        // onto the frame: an edge or a corner, on the glass between you, its head turned in towards you
        // from the left or right side, where the body stays outside and only the face comes in (the frame is too short for that
        // at the top or bottom)
        // the side it has flown to, at about the height it is flying at
        ndcNow.copy(b.root.position).project(camera);
        const nx = fs.perchSide;
        const ny = clamp(ndcNow.y, -0.6, 0.45);
        const d = clamp(camera.position.distanceTo(b.root.position), 6.8, 8.5); // where it is: it does not swell towards you as it turns
        const P = onFrame(nx, ny, d, vB);
        const C = onFrame(0, 0, d, vC);
        camera.getWorldDirection(fwd);
        const inward = C.clone().sub(P);
        inward.addScaledVector(fwd, -inward.dot(fwd)).normalize();
        // its back away from you, its feet on the glass, its head pointing in from the edge
        // its back away from you and leaning out past the edge, so the shell stays outside the frame and only its face leans in
        const up = fwd.clone().multiplyScalar(Math.cos(1.0)).addScaledVector(inward, -Math.sin(1.0)).normalize();
        const zA0 = inward.clone().addScaledVector(up, -inward.dot(up)).normalize();
        const zA = zA0.applyAxisAngle(up, rnd(-0.3, 0.3));
        const xA = new THREE.Vector3().crossVectors(up, zA).normalize();
        mTmp.makeBasis(xA, up, zA);
        fs.toQ.setFromRotationMatrix(mTmp);
        // its body beyond the edge: only its face, whole, and its antennae come into the frame
        fs.toP.copy(P).addScaledVector(inward, -0.25);
        // then placed by where its face lands on screen: moved in or out until the whole face sits just inside the edge
        const S = b.root.scale.x;
        const headAt = new THREE.Vector3();
        const inset = (h: THREE.Vector3) => Math.min(nx !== 0 && Math.abs(nx) === 1 ? 1 - Math.abs(h.x) : 9, Math.abs(ny) === 1 ? 1 - Math.abs(h.y) : 9);
        const want = Math.abs(ny) === 1 ? 0.34 : 0.075; // the frame is wide and short: a little more room top and bottom
        for (let it = 0; it < 24; it++) {
          headAt.set(0, STAND * S, 0.62 * BODY * S).applyQuaternion(fs.toQ).add(fs.toP).project(camera);
          const err = want - inset(headAt);
          if (Math.abs(err) < 0.015) break;
          fs.toP.addScaledVector(inward, err * 1.2);
        }
        fs.arc = 0;
        fs.dur = 3.2;
      }
    };
    const planTakeoff = (t: number, b: NonNullable<typeof beetle>) => {
      fs.fromP.copy(b.root.position);
      fs.fromQ.copy(b.root.quaternion);
      fs.t0 = t;
      fs.dur = 2;
      fs.fromFace = fs.mode === "face";
      fs.mode = "takeoff";
      // up and away into the box, towards its middle
      const goal = onFrame(rnd(-0.6, 0.6), rnd(-0.85, -0.5), rnd(7.2, 9), new THREE.Vector3()); // out into the lower part of the box
      fs.toP.copy(fs.fromP).lerp(goal, 0.6);
      const dir = goal.clone().sub(fs.fromP);
      fs.yaw = Math.atan2(dir.x, dir.z);
      fs.toQ.copy(qFromEuler(0.4, fs.yaw, 0));
    };

    const pose = (t: number, dt: number) => {
      if (!beetle) return;
      const b = beetle;
      const k = t;
      // walking towards you
      const walkT = clamp(k - T_WALK0, 0, T_STOP - T_WALK0);
      const walking0 = k > T_WALK0 && k < T_STOP;
      const slow = smooth(T_STOP - 1.4, T_STOP, k); // it slows as it arrives
      const zWalk = WALK_FROM + walkT * WALK_SPEED - slow * 0.25;
      const meander = Math.sin(walkT * 0.55) * 0.35 * (1 - slow);
      // opening and lifting off
      let open = smooth(T_OPEN, T_OPEN + 1.0, k);
      let unfold = smooth(T_OPEN + 0.5, T_OPEN + 1.6, k);
      let lift = smooth(T_LIFT, T_LIFT + 2.2, k);
      let walking = walking0;
      let walkAmt = walking0 ? 1 - slow * 0.8 : 0;
      let gait = walkT * 6.283 * 1.35;
      let lookIn = smooth(T_STOP, T_STOP + 0.6, k) * (1 - open);

      if (k < T_FREE && !skipIntro) {
        // it rises to your eye level and hovers there facing you, wings spread
        b.root.position.set(meander + 0.05 * Math.sin(k * 0.9) * lift, 0.18 * lift + 0.03 * Math.sin(k * 1.4) * lift, zWalk - 2.6 * lift); // it drifts back as it rises, so its whole wings are in the frame
        b.root.rotation.set(0.55 * lift, Math.cos(walkT * 0.55) * 0.25 * (1 - slow) + 0.38 * Math.sin((k - T_LIFT) * 0.45) * lift, 0.06 * Math.sin(k * 1.1) * lift); // tipped up as beetles fly, turning slowly so the wings face you
      } else {
        if (!fly.on) {
          fly.on = true;
          fly.p.copy(b.root.position);
          fly.v.set(0, 0, 0);
          fly.yaw = b.root.rotation.y;
          newPass(t, false);
          fs.until = t + rnd(7, 10);
          fs.after = "perch";
          if (skipIntro) {
            // the opening: the box is empty for a moment, then it sweeps in from beyond a corner, any corner, on a long
            // diagonal, curving down through the lower part of the box
            fs.mode = "fly";
            fs.air = 1;
            fly.hidden = true;
            fly.gone = t + rnd(0.8, 1.4);
            introPending = true;
          }
        }
        if (fs.mode === "fly") {
          fs.air = 1;
          if (fly.hidden) {
            // out of sight for a moment; then it comes in
            b.root.position.copy(fly.p);
            if (t > fly.gone) {
              if (introPending) {
                // it opens coming down from above the frame, flying down into the box: you see it from above, its back
                // and its spread wings
                introPending = false;
                onFrame(rnd(-0.5, 0.5), 1.6, rnd(8, 9), fly.p);
                wand.h = -Math.PI / 2 + rnd(-0.35, 0.35);
                wand.lastLook = t;
              }
              newPass(t, true, false);
              fly.v.copy(fly.target).sub(fly.p).normalize().multiplyScalar(0.6);
              fly.yaw = Math.atan2(fly.v.x, fly.v.z);
              b.root.position.copy(fly.p);
            }
          } else {
            const want = fly.target.clone().sub(fly.p);
            const dist = want.length();
            want.normalize().multiplyScalar(0.6 * clamp(dist / 1.2, 0.6, 1)); // unhurried, never stalling at a turn
            fly.v.lerp(want, Math.min(1, dt * 0.7));
            fly.p.addScaledVector(fly.v, dt);
            const sp = Math.hypot(fly.v.x, fly.v.z);
            const yawGoal = sp > 0.05 ? Math.atan2(fly.v.x, fly.v.z) : fly.yaw;
            const dy = Math.atan2(Math.sin(yawGoal - fly.yaw), Math.cos(yawGoal - fly.yaw)) * Math.min(1, dt * 1.6); // it turns its whole body to the way it is going
            fly.yaw += dy;
            // it banks into its turns, and tips up as it climbs and down as it dives: its wings are seen from the side, from
            // above and from below as it goes
            fly.roll += (clamp((-dy / Math.max(dt, 1e-3)) * 1.3, -0.75, 0.75) - fly.roll) * Math.min(1, dt * 1.4);
            const climb = clamp(-fly.v.y * 1.8, -0.5, 0.75); // diving, it tips forward and you see its back from above
            b.root.position.set(fly.p.x, fly.p.y + 0.04 * Math.sin(t * 1.3), fly.p.z);
            b.root.quaternion.copy(qFromEuler(0.3 + climb + 0.06 * Math.sin(t * 0.6), fly.yaw, fly.roll));
            ndcNow.copy(fly.p).project(camera);
            const last = fly.idx === fly.pts.length - 1;
            if (last && fly.face && dist < 1.1) {
              fs.after = "face";
              planLanding(t, b); // in front of you now: it turns to face you and hangs there
            } else if (last && fly.perch && Math.abs(ndcNow.x) > 0.72) {
              fs.after = "perch";
              planLanding(t, b); // it has reached the side it was heading for: it settles there and looks at you
            } else if (last && !fly.perch) {
              // on to the next leg, from right here, so the path never breaks
              if (dist < 0.9) newPass(t, true);
            } else if (!last && dist < 0.9) {
              fly.idx++;
              fly.target.copy(fly.pts[fly.idx]);
            }
          }
        } else if (fs.mode === "land" || fs.mode === "takeoff") {
          const u = clamp((t - fs.t0) / fs.dur, 0, 1);
          const e = u * u * (3 - 2 * u);
          b.root.position.lerpVectors(fs.fromP, fs.toP, e);
          b.root.position.y += Math.sin(Math.PI * u) * fs.arc;
          qTmp.slerpQuaternions(fs.fromQ, fs.toQ, smooth(fs.mode === "land" ? 0.15 : 0, fs.mode === "land" ? 0.85 : 0.7, u));
          b.root.quaternion.copy(qTmp);
          // landing: the wings fold as it touches down; taking off: they open before it rises
          // (coming to hang in front of you, or leaving from there, it stays on the wing)
          fs.air = fs.mode === "land" ? (fs.after === "face" ? 1 : 1 - smooth(0.7, 1, u)) : fs.fromFace ? 1 : smooth(0, 0.3, u);
          if (u >= 1) {
            if (fs.mode === "land") {
              fs.mode = fs.after;
              fs.until = t + rnd(4.5, 6.5);
            } else {
              fs.mode = "fly";
              fly.p.copy(b.root.position);
              fly.v.copy(fs.toP).sub(fs.fromP).multiplyScalar(0.25);
              fly.yaw = fs.yaw;
              fly.roll = 0;
              ndcNow.copy(fly.p).project(camera);
              wand.h = Math.atan2(rnd(-0.6, 0.3), -Math.sign(ndcNow.x || 1)); // away from the edge it sat on, back into the box
              newPass(t, true, false);
              fs.until = t + rnd(14, 22);
              // back somewhere else, to look at you again: the other way from last time, more often than not
              fs.after = "perch"; // back to another place on the frame, to look at you again
            }
          }
        } else if (fs.mode === "face") {
          // hanging in the air in front of you, wings beating slowly, looking at you; it sways and breathes
          b.root.position.copy(fs.toP);
          b.root.position.x += Math.sin(t * 0.7) * 0.06;
          b.root.position.y += Math.sin(t * 1.1) * 0.05;
          b.root.quaternion.copy(qFromEuler(0.12 + 0.05 * Math.sin(t * 0.8), fs.yaw + 0.22 * Math.sin(t * 0.45), 0.05 * Math.sin(t * 0.9)));
          fs.air = 1;
          if (t > fs.until) planTakeoff(t, b);
        } else {
          // on the frame, peeping in at you; it breathes, its antennae feel the air
          fs.air = 0;
          if (t > fs.until) planTakeoff(t, b);
        }
        // a shadow only while it is flying about; looking at you, from the air or the frame, it casts none
        const shadowGoal = fs.mode === "fly" || fs.mode === "takeoff" || (fs.mode === "land" && fs.after !== "face") ? 0.38 : 0;
        shadowAmt += (shadowGoal - shadowAmt) * Math.min(1, dt * 1.5);
        // its wings and cases follow how much it is in the air; legs too
        open = smooth(0, 0.6, fs.air);
        unfold = smooth(0.25, 1, fs.air);
        lift = fs.air;
        walking = false;
        walkAmt = walking ? 1 - smooth(fs.until - 0.6, fs.until, t) : 0;
        gait = fs.gait;
        fs.peek += ((fs.mode === "perch" ? 1 : 0) - fs.peek) * Math.min(1, dt * 1.5);
        lookIn = fs.peek;
      }
      b.root.visible = k > T_WALK0 - 0.1;

      // body sway with each step
      b.body.position.y = STAND + (walking ? 0.004 * Math.sin(gait * 2) * walkAmt : 0);
      b.body.rotation.z = walking ? 0.03 * Math.sin(gait) * walkAmt : 0;
      b.head.rotation.y = (0.12 + 0.1 * fs.peek) * Math.sin(k * 0.7) * (1 - open);
      // it looks up at you; on the frame it turns its head right round to you
      b.head.rotation.x = (-0.1 * (1 - fs.peek) + 0.55 * fs.peek) * (k < T_FREE ? lookIn : 1) * (1 - open);
      // the antennae feel the air all the time: a slow searching sway, quicker while it walks, swept back in flight
      const airborne = lift;
      b.antennae.forEach((a, i) => {
        const sd = i === 0 ? 1 : -1;
        const w = walking ? 2.6 : 1.4;
        a.rotation.y = sd * (0.35 + 0.15 * Math.sin(k * w + i * 1.3) + 0.25 * airborne);
        a.rotation.x = -0.35 + 0.12 * Math.sin(k * w * 0.8 + i * 2) + 0.35 * airborne;
        // a wave runs along each antenna, joint by joint, so it curls and uncurls as it feels the air
        (a.userData.joints as THREE.Group[]).forEach((j, n) => {
          const ph = k * w * 1.1 - n * 0.7 + i * 2.1;
          j.rotation.y = n === 0 ? 0 : sd * (0.12 + 0.12 * Math.sin(ph));
          j.rotation.x = n === 0 ? 0 : 0.1 + 0.1 * Math.sin(ph * 0.8 + 1.3) - 0.08 * airborne;
        });
      });
      const st = walking ? walkAmt : 0;
      for (const L of b.legs) {
        const g = gait + L.phase;
        const sd = L.side > 0 ? -1 : 1;
        // walking: each leg swings forward lifted, then pushes back planted (a tripod gait)
        const swing = Math.sin(g) * st;
        const up = Math.max(0, Math.cos(g)) * st;
        // flying: the legs hang and paddle softly in the air, each a little out of time with the next
        const paddle = Math.sin(k * 1.6 + L.row * 1.1 + (L.side > 0 ? 0 : 0.6)) * airborne;
        L.root.rotation.y = L.yawBase + sd * (0.45 * swing + 0.18 * paddle);
        L.hip.rotation.z = 0.35 + 0.42 * up - 0.4 * airborne + 0.12 * paddle;
        L.knee.rotation.z = -1.85 - 0.3 * up + 0.35 * airborne + 0.15 * paddle;
      }
      // wing cases lift and part; wings unfold from under them and beat, slowly
      b.cases.forEach((c, i) => {
        const s = i === 0 ? 1 : -1;
        c.rotation.set(0.4 * open, s * 0.22 * open, -s * 0.85 * open); // lifted and swung well apart, so the wings come out clear of them
      });
      wingPhase += dt * 6.283 * 0.85 * unfold; // under one beat a second: slow and wide
      const beat = Math.sin(wingPhase) * unfold;
      b.dustMat.uniforms.open.value = unfold;
      b.wings.forEach((w, i) => {
        const s = i === 0 ? 1 : -1;
        const fold = 1 - unfold;
        w.rotation.y = s * (1.62 * fold + (0.8 - 0.16 * Math.cos(wingPhase)) * unfold); // swept back, so their faces catch the eye
        w.rotation.z = s * (0.14 + 0.32 * beat) * unfold; // a slow, wide beat that stays above level: the wings never dip towards the floor
        w.position.y = 0.12 + 0.22 * unfold; // the wings rise out between the parted cases, above the back, never through it
        w.scale.setScalar((0.5 + 0.5 * unfold) * (0.88 / BODY)); // as large as before, against the smaller body
        w.visible = unfold > 0.02;
      });

      // short pen strokes flick off the wings as they beat and drift away into the air
      emitCarry += dt * 260 * unfold;
      while (emitCarry >= 1) {
        emitCarry -= 1;
        const wi = Math.random() < 0.5 ? 0 : 1;
        const s = wi === 0 ? 1 : -1;
        const along = Math.random();
        emitAt.set(s * along * b.WL * 0.92, 0, rnd(-0.35, 0.15) * b.WL * 0.6 * (1 - along * 0.5));
        b.wings[wi].localToWorld(emitAt);
        spawn(emitAt, t);
      }
      // the same dust rises off its body wherever it goes, like smoke: thick as it comes walking out of the haze, a soft
      // trail after that, walking or flying
      if (b.root.visible) {
        bodyCarry += dt * (walking0 ? 260 : 180);
        b.root.getWorldPosition(wp);
        while (bodyCarry >= 1) {
          bodyCarry -= 1;
          const th = rnd(0, 6.283);
          const ph = rnd(-0.3, 1.3);
          emitAt.set(Math.cos(th) * 0.44 * Math.cos(ph * 0.6), 0.05 + Math.sin(ph) * 0.38, Math.sin(th) * 0.55);
          b.body.localToWorld(emitAt);
          spawn(emitAt, t, wp);
        }
        // in flight, dust pours off the humps of its back and streams out behind it, a long glittering wake
        if ((fs.mode === "fly" && !fly.hidden) || fs.mode === "takeoff" || fs.mode === "land") {
          backCarry += dt * 700 * fs.air;
          trail.copy(fly.v).multiplyScalar(-0.35);
          while (backCarry >= 1) {
            backCarry -= 1;
            emitAt.set(rnd(-0.38, 0.38), rnd(0.18, 0.46), rnd(-0.55, 0.15));
            b.body.localToWorld(emitAt);
            spawn(emitAt, t, wp, trail);
          }
        }
      }

      b.root.getWorldPosition(wp);
      // its pupils turn to you: each sits on the side of its eye that faces the camera
      for (const pu of b.pupils) {
        const eye = pu.parent!;
        eye.updateWorldMatrix(true, false);
        eyeTmp.copy(camera.position);
        eye.worldToLocal(eyeTmp);
        pu.position.copy(eyeTmp.normalize().multiplyScalar(0.078));
      }
      // the soft shade below it: it follows it across the floor, spreads and fades as it rises
      const hgt = Math.max(0, wp.y - FLOOR);
      const sz = b.root.scale.x * BODY * (1.9 + hgt * 0.9);
      shadow.position.set(wp.x, FLOOR + 0.004, wp.z);
      shadow.scale.set(sz * 1.25, sz, 1);
      shadow.rotation.z = -Math.atan2(Math.sin(b.root.rotation.y), Math.cos(b.root.rotation.y));
      shadowMat.opacity = (shadowAmt / 0.38) * 0.42 / (1 + hgt * 0.8);
    };

    /* ---------------- strokes off the wings ---------------- */
    const DN = 12000;
    const dust = makeStrokes(DN);
    const dustVel = new Float32Array(DN * 3);
    const dustDir = new Float32Array(DN * 3);
    const dustBorn = new Float32Array(DN).fill(-99);
    const dustLife = new Float32Array(DN).fill(1);
    const dustLen = new Float32Array(DN);
    let dustNext = 0;
    const spawn = (at: THREE.Vector3, t: number, smokeFrom?: THREE.Vector3, drift?: THREE.Vector3) => {
      const i = dustNext;
      dustNext = (dustNext + 1) % DN;
      dust.pos[i * 6] = at.x;
      dust.pos[i * 6 + 1] = at.y;
      dust.pos[i * 6 + 2] = at.z;
      dustVel[i * 3] = rnd(-0.1, 0.1);
      dustVel[i * 3 + 1] = rnd(-0.14, 0.03);
      dustVel[i * 3 + 2] = rnd(-0.1, 0.1);
      const a = rnd(0, 6.283);
      const e = rnd(-0.5, 0.5);
      dustDir[i * 3] = Math.cos(a) * Math.cos(e);
      dustDir[i * 3 + 1] = Math.sin(e);
      dustDir[i * 3 + 2] = Math.sin(a) * Math.cos(e);
      dustLen[i] = rnd(0.05, 0.16);
      dustBorn[i] = t;
      dustLife[i] = rnd(1.4, 3);
      if (smokeFrom) {
        // smoke: it drifts out from the body and rises slowly, spreading, and lingers
        const ox = at.x - smokeFrom.x;
        const oz = at.z - smokeFrom.z;
        const ol = Math.hypot(ox, oz) || 1;
        dustVel[i * 3] = (ox / ol) * rnd(0.04, 0.16) + rnd(-0.05, 0.05);
        dustVel[i * 3 + 1] = rnd(-0.1, 0.04);
        dustVel[i * 3 + 2] = (oz / ol) * rnd(0.04, 0.16) + rnd(-0.05, 0.05);
        dustLen[i] = rnd(0.03, 0.09);
        dustLife[i] = rnd(2.2, 4.5);
        if (drift) {
          // left behind as it flies on, spreading as it falls back
          dustVel[i * 3] = drift.x + rnd(-0.08, 0.08);
          dustVel[i * 3 + 1] = drift.y + rnd(-0.02, 0.1);
          dustVel[i * 3 + 2] = drift.z + rnd(-0.08, 0.08);
          dustLife[i] = rnd(1.6, 3.4);
        }
      }
    };
    const stepDust = (t: number, dt: number) => {
      for (let i = 0; i < DN; i++) {
        const age = t - dustBorn[i];
        const life = dustLife[i];
        const a = age < 0 || age > life ? 0 : Math.sin((age / life) * Math.PI) * 0.75;
        const o = i * 6;
        dust.pos[o] += dustVel[i * 3] * dt;
        dust.pos[o + 1] += dustVel[i * 3 + 1] * dt;
        dust.pos[o + 2] += dustVel[i * 3 + 2] * dt;
        // the stroke draws itself out, then shortens as it fades
        const len = dustLen[i] * Math.min(1, age * 3) * (0.4 + 0.6 * a);
        dust.pos[o + 3] = dust.pos[o] + dustDir[i * 3] * len;
        dust.pos[o + 4] = dust.pos[o + 1] + dustDir[i * 3 + 1] * len;
        dust.pos[o + 5] = dust.pos[o + 2] + dustDir[i * 3 + 2] * len;
        dust.alpha[i * 2] = a;
        dust.alpha[i * 2 + 1] = a * 0.35; // a stroke thins out towards its end
      }
      dust.geo.attributes.position.needsUpdate = true;
      dust.geo.attributes.alpha.needsUpdate = true;
    };
    let wingPhase = 0;

    let tLast = 0;
    const step = (t: number) => {
      const dt = clamp(t - tLast, 0, 0.1);
      tLast = t;
      // smoke rolls in for the entrance, then clears away completely, leaving the painting as it is
      const smokeIn = (skipIntro ? 0.35 : 1) * smooth(0.3, 2.8, t) * (1 - smooth(skipIntro ? 2 : T_STOP - 1, skipIntro ? 6 : T_STOP + 4, t));
      for (const p of puffs) {
        p.s.visible = smokeIn > 0.002;
        p.s.position.set(p.base.x + Math.sin(t * 0.05 + p.phase) * 1.2 + t * p.drift * 0.3, p.base.y + Math.sin(t * 0.13 + p.phase) * 0.08, p.base.z);
        if (p.s.position.x > 8) p.base.x -= 16;
        if (p.s.position.x < -8) p.base.x += 16;
        p.s.material.rotation = p.phase + t * p.spin;
        const near = clamp((p.base.z + 14) / 17, 0, 1);
        p.s.material.opacity = smokeIn * (0.18 + 0.2 * (1 - near)) * (0.75 + 0.25 * Math.sin(t * 0.3 + p.phase));
      }
      // the marks in the air drift slowly and come and go
      const airIn = smooth(0.8, 3, t);
      for (let i = 0; i < N; i++) {
        const m = airSeed[i];
        const x = m.x + Math.sin(t * 0.13 + m.ph) * 0.4 + t * 0.04;
        const wx = ((x + 6) % 12 + 12) % 12 - 6;
        const y = m.y + Math.sin(t * 0.21 + m.ph * 1.7) * 0.12;
        const z = m.z + Math.cos(t * 0.1 + m.ph) * 0.3;
        const an = m.ang + Math.sin(t * 0.3 + m.ph) * 0.3;
        const o = i * 6;
        air.pos[o] = wx;
        air.pos[o + 1] = y;
        air.pos[o + 2] = z;
        air.pos[o + 3] = wx + Math.cos(an) * m.len;
        air.pos[o + 4] = y + Math.sin(an) * m.len;
        air.pos[o + 5] = z;
        const fade = clamp((z + 9) / 4, 0, 1); // faint far back
        const tw = 0.5 + 0.5 * Math.sin(t * 0.5 + m.ph * 3);
        air.alpha[i * 2] = airIn * m.a * tw * fade;
        air.alpha[i * 2 + 1] = airIn * m.a * tw * fade * 0.3;
      }
      air.geo.attributes.position.needsUpdate = true;
      air.geo.attributes.alpha.needsUpdate = true;
      // a slow, breathing camera, as if held
      // for the walk-in it looks along the floor; once the beetle is up it tilts slowly up, so the beetle keeps to the lower
      // part of the frame and its wings have the whole sky above it
      const up = skipIntro ? 1 : smooth(T_LIFT, T_LIFT + 3.5, t);
      camera.position.set(CAM.x + Math.sin(t * 0.21) * 0.06, 0.42 + (CAM.y - 0.42) * up + Math.sin(t * 0.17) * 0.03, CAM.z);
      camera.lookAt(0, 0.3 + 0.25 * up, 0);
      pose(t, dt);
      stepDust(t, dt);
      sketchU.time.value = t;
      glazeMat.uniforms.time.value = t;
      // the beetle leaves a breath of dark grey on the painting as it goes; old paint slowly soaks away
      paintFade += dt;
      if (paintFade > 0.25) {
        paintFade = 0;
        pg.globalCompositeOperation = "destination-out";
        pg.fillStyle = "rgba(0,0,0,0.02)";
        pg.fillRect(0, 0, PCW, PCH);
        pg.globalCompositeOperation = "source-over";
      }
      if (beetle && beetle.root.visible && dt > 0) {
        ndc.copy(wp).project(camera);
        const x = (ndc.x * 0.5 + 0.5) * PCW;
        const y = (0.5 - ndc.y * 0.5) * PCH;
        const near = clamp(5.5 / Math.max(1, camera.position.distanceTo(wp)), 0.3, 1.6);
        const flying = t > T_LIFT ? 1 : 0;
        const n = Math.ceil(dt * 20);
        for (let i = 0; i < n; i++) {
          const spread = PCH * 0.22 * near * (0.4 + flying);
          dab(x + rnd(-1, 1) * spread * 1.4, y + rnd(-0.4, 0.8) * spread, PCH * rnd(0.05, 0.13) * near, 0.04);
        }
      }
      paintTex.needsUpdate = true;
    };

    let clock = 0;
    let tPrev = 0;
    let visible = true;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) {
        tPrev = now;
        return;
      }
      if (!tPrev) tPrev = now;
      clock += Math.min(0.05, (now - tPrev) / 1000);
      tPrev = now;
      step(clock);
      renderer.render(scene, camera);
    };


    const img = (src: string) =>
      new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = src;
      });
    img(WING).then((wingImg) => {
      if (!alive) return;
      // the same size on screen in every box: as large as it is in the tall painting at the foot of the page, so in the
      // shorter box at the top of the home page it is drawn larger to match
      const footH = Math.min(680, Math.max(420, window.innerWidth * 0.36));
      beetle = buildBeetle(drawnWing(wingImg), stippledWing(wingImg, 4.4, 30000), sketchU, (PH * pr) / (2 * Math.tan((12 * Math.PI) / 180)), 5 * Math.max(1, footH / PH));
      beetle.root.visible = false;
      scene.add(beetle.root);
      // first frame: the paper, before anything
      step(0);
      renderer.render(scene, camera);
      const begin = () => {
        if (!alive) return;
        if (still) {
          step(T_STOP + 0.8);
          renderer.render(scene, camera);
          return;
        }
        raf = requestAnimationFrame(frame);
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(host);
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

  return <div key={key} ref={hostRef} aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }} />;
}
