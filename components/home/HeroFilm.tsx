"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

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

const CORE = "/images/site/hero-beetle-v7-core.webp";
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

/* ---------------- the wash behind everything (the same as the painted box) ---------------- */
const WASH_FS = `
varying vec2 vUv;
uniform float time;
uniform float appear;
uniform float aspect;
uniform vec2 seed;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){ float s = 0.0; float a = 0.5; for (int i = 0; i < 3; i++) { s += a * noise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; } return s / 0.875; }
void main(){
  vec2 p = vec2(vUv.x * aspect, vUv.y) * 0.85 + seed;
  float t = time * 0.022;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
  vec2 r = vec2(fbm(p + 1.9 * q + vec2(1.7, 9.2) + t * 0.6), fbm(p + 1.9 * q + vec2(8.3, 2.8) - t * 0.5));
  float f = clamp((fbm(p + 2.1 * r + vec2(t * 0.3, -t * 0.2)) - 0.5) * 1.4 + 0.5, 0.0, 1.0);
  vec3 col = vec3(0.80, 0.63, 0.50);
  col = mix(col, vec3(0.74, 0.52, 0.38), smoothstep(0.22, 0.42, f));
  col = mix(col, vec3(0.66, 0.39, 0.25), smoothstep(0.40, 0.58, f));
  col = mix(col, vec3(0.56, 0.30, 0.19), smoothstep(0.58, 0.8, f + 0.25 * (r.x - 0.5)));
  // light glowing from behind the smoke, low in the middle
  float glow = exp(-pow((vUv.x - 0.5) * aspect * 0.55, 2.0) - pow((vUv.y - 0.42) * 2.2, 2.0));
  col = mix(col, vec3(1.0, 0.86, 0.7), glow * 0.45);
  // the colour blooms in from the paper, everywhere at once, unevenly
  vec3 paper = vec3(0.935, 0.918, 0.89);
  float m = smoothstep(0.0, 0.35, appear * 1.35 - fbm(p * 1.3 + 4.0) * 0.35);
  col = mix(paper, col, m);
  vec2 g = gl_FragCoord.xy;
  float gran = noise(g * 0.45) * 0.6 + noise(g * 0.9 + 7.0) * 0.4;
  col *= 1.0 + (gran - 0.5) * 0.12 * m;
  gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);
}`;

/**
 * Turns every frame into a watercolour: the colour is gathered into brush-shaped patches (a small Kuwahara filter), the
 * edges wobble as if painted by hand, pigment pools darker where one colour meets another, the paper's grain shows
 * through, and the colour granulates and bleeds a little.
 */
const WATERCOLOUR = {
  uniforms: { tDiffuse: { value: null as THREE.Texture | null }, res: { value: new THREE.Vector2(1, 1) }, time: { value: 0 } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: `
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform vec2 res;
uniform float time;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){ float s = 0.0; float a = 0.5; for (int i = 0; i < 3; i++) { s += a * noise(p); p *= 2.07; a *= 0.5; } return s / 0.875; }
vec3 tex(vec2 uv){ return texture2D(tDiffuse, uv).rgb; }
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
void main(){
  vec2 px = 1.0 / res;
  // a hand-painted wobble: the picture is nudged by slow noise, a few pixels
  vec2 uv = vUv + (vec2(fbm(vUv * vec2(9.0, 5.0) + time * 0.03), fbm(vUv * vec2(9.0, 5.0) + 7.3 - time * 0.03)) - 0.5) * px * 10.0;
  // brush patches: of the four corners around each pixel, keep the calmest one's average colour
  vec3 m[4]; vec3 s[4];
  for (int k = 0; k < 4; k++) { m[k] = vec3(0.0); s[k] = vec3(0.0); }
  const int R = 4;
  for (int j = -R; j <= R; j++) {
    for (int i = -R; i <= R; i++) {
      vec3 c = tex(uv + vec2(float(i), float(j)) * px * 1.6);
      vec3 c2 = c * c;
      if (i <= 0 && j <= 0) { m[0] += c; s[0] += c2; }
      if (i >= 0 && j <= 0) { m[1] += c; s[1] += c2; }
      if (i <= 0 && j >= 0) { m[2] += c; s[2] += c2; }
      if (i >= 0 && j >= 0) { m[3] += c; s[3] += c2; }
    }
  }
  float n = float((R + 1) * (R + 1));
  vec3 col = vec3(0.0);
  float best = 1e9;
  for (int k = 0; k < 4; k++) {
    vec3 mu = m[k] / n;
    vec3 v = abs(s[k] / n - mu * mu);
    float sv = v.r + v.g + v.b;
    if (sv < best) { best = sv; col = mu; }
  }
  // pigment pools darker along the edges where colours meet
  float l = lum(col);
  float lx = lum(tex(uv + vec2(px.x * 3.0, 0.0))) - lum(tex(uv - vec2(px.x * 3.0, 0.0)));
  float ly = lum(tex(uv + vec2(0.0, px.y * 3.0))) - lum(tex(uv - vec2(0.0, px.y * 3.0)));
  float edge = smoothstep(0.02, 0.18, length(vec2(lx, ly)));
  col *= 1.0 - 0.36 * edge * (0.6 + 0.4 * noise(gl_FragCoord.xy * 0.2));
  // a little bleeding into the paper: soft, uneven
  vec3 soft = (tex(uv + vec2(4.0, 1.0) * px) + tex(uv - vec2(3.0, 2.0) * px) + tex(uv + vec2(-1.0, 4.0) * px) + tex(uv + vec2(2.0, -4.0) * px)) * 0.25;
  col = mix(col, soft, 0.25 * fbm(gl_FragCoord.xy * 0.01 + 3.0));
  // granulation and the grain of the paper
  vec2 g = gl_FragCoord.xy;
  float gran = noise(g * 0.5) * 0.6 + noise(g * 1.1 + 5.0) * 0.4;
  col *= 1.0 + (gran - 0.5) * 0.16 * (1.0 - l);
  col += (hash(g) - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}`,
};

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

/** A small soft dot of light for the motes. */
function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.35, "rgba(255,240,220,0.5)");
  gr.addColorStop(1, "rgba(255,230,200,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* ---------------- the beetle ---------------- */
/** Its own units: about 1 long, head towards +z, back up +y. Painted from above with the top-view watercolour. */
function buildBeetle(coreTex: THREE.Texture, wingTex: THREE.Texture) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  body.position.y = 0.16;
  root.add(body);

  const shell = new THREE.MeshPhysicalMaterial({ map: coreTex, roughness: 0.5, clearcoat: 0.45, clearcoatRoughness: 0.3, side: THREE.DoubleSide });
  const black = new THREE.MeshPhysicalMaterial({ color: lin(0.2, 0.21, 0.25), roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const front = new THREE.MeshPhysicalMaterial({ map: coreTex, roughness: 0.5, clearcoat: 0.4, clearcoatRoughness: 0.3 });
  const cream = new THREE.MeshStandardMaterial({ color: lin(0.93, 0.86, 0.72), roughness: 0.55 });
  const legMat = new THREE.MeshStandardMaterial({ color: lin(0.3, 0.29, 0.32), roughness: 0.7 });
  const amber = new THREE.MeshStandardMaterial({ color: lin(0.62, 0.32, 0.16), roughness: 0.5 });

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
  const belly = new THREE.Mesh(bellyG, new THREE.MeshStandardMaterial({ map: coreTex, color: lin(0.62, 0.5, 0.45), roughness: 0.7 }));
  belly.scale.set(0.3, 0.09, 0.42);
  belly.position.set(0, -0.02, -0.06);
  belly.castShadow = true;
  body.add(belly);

  // wing cases: two half domes hinged at the front of the seam
  const cases: THREE.Group[] = [];
  for (const side of [1, -1]) {
    const g = new THREE.SphereGeometry(1, 48, 28, side > 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI, 0, Math.PI / 2);
    g.scale(0.42, 0.34, 0.5);
    g.translate(0, 0.0, -0.08);
    mapTop(g, 0.42, -0.58, 0.42, 381, 794);
    const hinge = new THREE.Group();
    hinge.position.set(0, 0.16, 0.38);
    g.translate(0, -0.16, -0.38);
    const m = new THREE.Mesh(g, shell);
    m.castShadow = true;
    hinge.add(m);
    body.add(hinge);
    cases.push(hinge);
  }

  // the shield, black and glossy with two cream patches
  const shieldG = new THREE.SphereGeometry(1, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2);
  shieldG.scale(0.34, 0.2, 0.17);
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
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.062, 24, 16), black);
    eye.position.set(s * 0.12, 0.02, 0.05);
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

  // antennae: little chains of beads, the last ones amber
  const antennae: THREE.Group[] = [];
  for (const s of [1, -1]) {
    const a = new THREE.Group();
    a.position.set(s * 0.06, 0.05, 0.1);
    for (let i = 0; i < 9; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(i > 5 ? 0.02 : 0.013, 10, 8), i > 5 ? amber : legMat);
      b.position.set(s * (0.02 * i + 0.002 * i * i), 0.012 * i - 0.0012 * i * i, 0.03 * i);
      a.add(b);
    }
    head.add(a);
    antennae.push(a);
  }

  // six legs: thigh, shin and foot, jointed
  type Leg = { yawBase: number; hip: THREE.Group; root: THREE.Group; side: number; phase: number };
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
      hip.add(seg(0.26, 0.02));
      const knee = new THREE.Group();
      knee.position.x = 0.26;
      knee.rotation.z = -1.85;
      hip.add(knee);
      knee.add(seg(0.3, 0.013));
      const ankle = new THREE.Group();
      ankle.position.x = 0.3;
      ankle.rotation.z = 0.95;
      knee.add(ankle);
      ankle.add(seg(0.1, 0.012, amber));
      body.add(root);
      legs.push({ yawBase, hip, root, side, phase: (i % 2 === 0) === side > 0 ? 0 : Math.PI });
    }
  });

  // wings: the beetle's own painted wings, folded under the cases until it flies
  const WL = 1.55;
  const wg = new THREE.PlaneGeometry(WL, WL * WING_ASPECT);
  wg.translate(-(WING_BASE[0] - 0.5) * WL, -(0.5 - WING_BASE[1]) * WL * WING_ASPECT, 0);
  wg.rotateX(Math.PI / 2); // flat, the front edge forwards (+z)
  const wingMat = new THREE.MeshStandardMaterial({ map: wingTex, transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: 0.3, emissive: lin(0.25, 0.18, 0.12), emissiveMap: wingTex });
  const wings: THREE.Group[] = [];
  for (const side of [1, -1]) {
    const w = new THREE.Group();
    w.position.set(side * 0.1, 0.17, 0.28);
    w.rotation.order = "YXZ";
    const m = new THREE.Mesh(wg, wingMat);
    m.scale.x = side;
    m.renderOrder = 3;
    w.add(m);
    body.add(w);
    wings.push(w);
  }

  return { root, body, cases, wings, legs, antennae, head };
}

export default function HeroFilm() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const box = host.getBoundingClientRect();
    const PW = Math.max(300, Math.round(box.width));
    const PH = Math.max(200, Math.round(box.height));
    const aspect = PW / PH;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true;
    let raf = 0;
    const cleanup: (() => void)[] = [];

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    const pr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(pr);
    renderer.setSize(PW, PH);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    const FOG = lin(0.78, 0.6, 0.48);
    scene.fog = new THREE.Fog(FOG, 5, 19);
    const camera = new THREE.PerspectiveCamera(24, aspect, 0.05, 80);
    const CAM = new THREE.Vector3(0, 0.42, 6);
    camera.position.copy(CAM);
    camera.lookAt(0, 0.3, 0);
    scene.add(camera);

    // the wash, hung far behind and moving with the camera so it always fills the view
    const washMat = new THREE.ShaderMaterial({
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: WASH_FS,
      uniforms: { time: { value: 0 }, appear: { value: 0 }, aspect: { value: aspect }, seed: { value: new THREE.Vector2(Math.random() * 40, Math.random() * 40) } },
      depthWrite: false,
      fog: false,
    });
    const WD = 40;
    const wh = 2 * WD * Math.tan(((24 / 2) * Math.PI) / 180) * 1.12;
    const wash = new THREE.Mesh(new THREE.PlaneGeometry(wh * aspect, wh), washMat);
    wash.position.set(0, 0, -WD);
    wash.renderOrder = -10;
    camera.add(wash);

    scene.add(new THREE.HemisphereLight(lin(1, 0.93, 0.85), lin(0.45, 0.28, 0.2), 1.1));
    const key1 = new THREE.DirectionalLight(lin(1, 0.95, 0.88), 2.2);
    key1.position.set(-3, 6, 5);
    key1.castShadow = true;
    key1.shadow.mapSize.set(1024, 1024);
    key1.shadow.radius = 6;
    key1.shadow.bias = -0.0005;
    const sc = key1.shadow.camera as THREE.OrthographicCamera;
    sc.left = -2;
    sc.right = 2;
    sc.top = 2;
    sc.bottom = -2;
    sc.near = 0.5;
    sc.far = 20;
    scene.add(key1);
    scene.add(key1.target);
    // the stage light behind it: it rims the shell and glows through the smoke
    const back = new THREE.DirectionalLight(lin(1, 0.78, 0.55), 2.6);
    back.position.set(1.5, 3, -8);
    scene.add(back);
    const front = new THREE.PointLight(lin(1, 0.85, 0.7), 4, 6, 1.5);
    front.position.set(0, 1.2, 4);
    scene.add(front);

    // the floor only shows the beetle's shadow, so the wash stays the floor and the sky
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.32, color: lin(0.25, 0.12, 0.06) }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    /* ---------------- smoke and motes ---------------- */
    const smokeTex = smokeTexture();
    type Puff = { s: THREE.Sprite; base: THREE.Vector3; drift: number; spin: number; size: number; phase: number };
    const puffs: Puff[] = [];
    for (let i = 0; i < 70; i++) {
      const mat = new THREE.SpriteMaterial({ map: smokeTex, color: lin(1, 0.9, 0.8), transparent: true, opacity: 0, depthWrite: false, fog: false });
      const s = new THREE.Sprite(mat);
      const base = new THREE.Vector3(rnd(-7, 7), rnd(0.05, i < 50 ? 0.7 : 2.2), rnd(-14, 3.5));
      const size = rnd(1.6, 4.2) * (i < 50 ? 1 : 1.5);
      s.scale.set(size * 1.6, size, 1);
      s.position.copy(base);
      s.renderOrder = 5;
      scene.add(s);
      puffs.push({ s, base, drift: rnd(0.08, 0.25) * (Math.random() < 0.5 ? -1 : 1), spin: rnd(-0.05, 0.05), size, phase: rnd(0, 6.28) });
    }
    const N = 260;
    const motePos = new Float32Array(N * 3);
    const moteSeed = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      moteSeed[i * 3] = rnd(-6, 6);
      moteSeed[i * 3 + 1] = rnd(0, 2.6);
      moteSeed[i * 3 + 2] = rnd(-12, 4.5);
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
    const moteMat = new THREE.PointsMaterial({ map: dotTexture(), color: lin(1, 0.9, 0.75), size: 0.06, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const motes = new THREE.Points(moteGeo, moteMat);
    scene.add(motes);

    /* ---------------- post: a lens with a shallow depth of field and a soft glow ---------------- */
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(pr);
    composer.setSize(PW, PH);
    composer.addPass(new RenderPass(scene, camera));
    const bokeh = new BokehPass(scene, camera, { focus: 6, aperture: 0.0035, maxblur: 0.009 });
    composer.addPass(bokeh);
    const paintPass = new ShaderPass(WATERCOLOUR);
    paintPass.uniforms.res.value.set(PW * pr, PH * pr);
    composer.addPass(paintPass);
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(PW, PH), 0.22, 0.8, 0.82));
    composer.addPass(new OutputPass());
    const bokehU = bokeh.uniforms as unknown as { focus: { value: number }; aperture: { value: number } };

    /* ---------------- the film ---------------- */
    const loader = new THREE.TextureLoader();
    let beetle: ReturnType<typeof buildBeetle> | null = null;
    const tex = (src: string) =>
      new Promise<THREE.Texture>((res) =>
        loader.load(src, (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 8;
          res(t);
        }),
      );

    const WALK_FROM = -11; // far back in the smoke
    const WALK_TO = 3.5; // close in front of you
    const T_COLOUR = 2.6;
    const T_WALK0 = 2.2;
    const WALK_SPEED = 1.15;
    const T_STOP = T_WALK0 + (WALK_TO - WALK_FROM) / WALK_SPEED;
    const T_OPEN = T_STOP + 1.2;
    const T_LIFT = T_OPEN + 1.5;
    const T_GONE = T_LIFT + 8.5;
    const T_LOOP = T_GONE + 5;
    let loopStart = 0; // the walk restarts here on later loops
    let xLane = 0;

    const pose = (t: number) => {
      if (!beetle) return;
      const b = beetle;
      // the film loops from the walk once the colour is in
      let k = t - loopStart;
      if (k > T_LOOP) {
        loopStart = t - T_WALK0;
        k = T_WALK0;
        xLane = rnd(-0.6, 0.6);
      }
      // walking towards you
      const walkT = clamp(k - T_WALK0, 0, T_STOP - T_WALK0);
      const walking = k > T_WALK0 && k < T_STOP;
      const slow = smooth(T_STOP - 1.4, T_STOP, k); // it slows as it arrives
      const zWalk = WALK_FROM + walkT * WALK_SPEED - slow * 0.25;
      const meander = Math.sin(walkT * 0.55) * 0.35 * (1 - slow);
      // opening and lifting off
      const open = smooth(T_OPEN, T_OPEN + 1.0, k);
      const unfold = smooth(T_OPEN + 0.5, T_OPEN + 1.4, k);
      // it rises just to your eye level and hovers there facing you, wings spread; then it turns and flies off into the smoke
      const lift = smooth(T_LIFT, T_LIFT + 1.6, k);
      const turn = smooth(T_LIFT + 3.0, T_LIFT + 4.6, k);
      const away = smooth(T_LIFT + 3.8, T_LIFT + 8.5, k);
      const hover = lift * (1 - away);
      b.root.position.set(
        xLane + meander + 0.06 * Math.sin(k * 1.3) * hover + away * 1.6,
        0.14 * lift + 0.035 * Math.sin(k * 2.1) * hover + away * away * 1.9,
        zWalk - away * 15,
      );
      b.root.rotation.set(0.22 * lift * (1 - turn), Math.cos(walkT * 0.55) * 0.25 * (1 - slow) + Math.PI * turn, 0.08 * Math.sin(k * 1.7) * hover);
      b.root.visible = k > T_WALK0 - 0.1 && k < T_GONE + 1;

      // body sway with each step
      const gait = walkT * 6.283 * 1.35;
      b.body.position.y = 0.16 + (walking ? 0.008 * Math.sin(gait * 2) : 0);
      b.body.rotation.z = walking ? 0.03 * Math.sin(gait) : 0;
      b.head.rotation.y = 0.12 * Math.sin(k * 0.7) * (1 - open);
      b.head.rotation.x = -0.1 * smooth(T_STOP, T_STOP + 0.6, k) * (1 - open); // it looks up at you
      b.antennae.forEach((a, i) => {
        a.rotation.y = (i === 0 ? 1 : -1) * (0.15 + 0.12 * Math.sin(k * 3.1 + i));
        a.rotation.x = -0.15 + 0.1 * Math.sin(k * 2.3 + i * 2);
      });
      for (const L of b.legs) {
        const g = gait + L.phase;
        const st = walking ? 1 - slow * 0.8 : 0;
        L.root.rotation.y = L.yawBase + (L.side > 0 ? -1 : 1) * 0.32 * Math.sin(g) * st;
        L.hip.rotation.z = 0.35 + 0.28 * Math.max(0, Math.cos(g)) * st - 0.35 * lift; // in the air the legs hang softly
      }
      // wing cases lift and part; wings unfold from under them and beat
      b.cases.forEach((c, i) => {
        const s = i === 0 ? 1 : -1;
        c.rotation.set(0.55 * open, s * 0.45 * open, -s * 0.75 * open);
      });
      const beat = Math.sin(k * 6.283 * 3.2) * unfold; // slow, wide beats
      b.wings.forEach((w, i) => {
        const s = i === 0 ? 1 : -1;
        const fold = 1 - unfold;
        w.rotation.y = s * 1.62 * fold; // folded: swung back along the body
        w.rotation.z = s * (0.55 + 0.42 * beat) * unfold; // held up in a V, beating slowly
        w.position.y = 0.17 - 0.06 * fold;
        w.scale.setScalar(0.5 + 0.5 * unfold);
        w.visible = unfold > 0.02;
      });

      // the lens follows it
      const wp = new THREE.Vector3();
      b.root.getWorldPosition(wp);
      bokehU.focus.value = camera.position.distanceTo(wp);
      key1.position.set(wp.x - 3, 6, wp.z + 5);
      key1.target.position.copy(wp);
    };

    const step = (t: number) => {
      const appear = smooth(0, T_COLOUR, t);
      washMat.uniforms.time.value = t + 20;
      washMat.uniforms.appear.value = appear;
      // smoke rolls in after the colour, then keeps drifting
      const smokeIn = smooth(0.8, 4.5, t);
      for (const p of puffs) {
        p.s.position.set(p.base.x + Math.sin(t * 0.05 + p.phase) * 1.2 + t * p.drift * 0.3, p.base.y + Math.sin(t * 0.13 + p.phase) * 0.08, p.base.z);
        if (p.s.position.x > 8) p.base.x -= 16;
        if (p.s.position.x < -8) p.base.x += 16;
        p.s.material.rotation = p.phase + t * p.spin;
        const near = clamp((p.base.z + 14) / 17, 0, 1);
        p.s.material.opacity = smokeIn * (0.18 + 0.2 * (1 - near)) * (0.75 + 0.25 * Math.sin(t * 0.3 + p.phase));
      }
      for (let i = 0; i < N; i++) {
        const sx = moteSeed[i * 3];
        const sy = moteSeed[i * 3 + 1];
        const sz = moteSeed[i * 3 + 2];
        motePos[i * 3] = sx + Math.sin(t * 0.21 + i) * 0.3;
        motePos[i * 3 + 1] = sy + ((t * 0.05 + i * 0.37) % 2.6) * 0.15 + Math.sin(t * 0.4 + i * 1.7) * 0.06;
        motePos[i * 3 + 2] = sz + Math.cos(t * 0.17 + i) * 0.3;
      }
      moteGeo.attributes.position.needsUpdate = true;
      moteMat.opacity = smooth(1.5, 4, t) * (0.65 + 0.15 * Math.sin(t * 1.3));
      // a slow, breathing camera, as if held
      camera.position.set(CAM.x + Math.sin(t * 0.21) * 0.06, CAM.y + Math.sin(t * 0.17) * 0.03, CAM.z);
      camera.lookAt(0, 0.3, 0);
      pose(t);
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
      paintPass.uniforms.time.value = clock;
      composer.render();
    };

    Promise.all([tex(CORE), tex(WING)]).then(([core, wing]) => {
      if (!alive) return;
      beetle = buildBeetle(core, wing);
      beetle.root.visible = false;
      scene.add(beetle.root);
      // first frame: the paper, before anything
      step(0);
      composer.render();
      const begin = () => {
        if (!alive) return;
        if (still) {
          step(T_STOP + 0.8);
          composer.render();
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
