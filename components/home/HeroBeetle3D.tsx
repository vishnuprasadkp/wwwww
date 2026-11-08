"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * The beetle in the home hero, as a real 3D model, so it can be seen from every side as it moves.
 *
 * It is built from simple solids painted with the beetle's own watercolour (public/images/site/hero-beetle-v7-core.webp,
 * projected from above onto the wing cases, the shield and the head) and its own painted wings (…-v7-wing.webp):
 * two domed wing cases that lift and part for flight, a shield, a head with big glossy eyes and two antennae, six jointed
 * legs and two pairs of clear wings. When it lands, the wings fold back and tuck in under the closed wing cases, the way
 * a beetle's do.
 *
 * It moves continuously: it starts face to face with you, hovering, then flies off in long curves, banking into its turns
 * so you see its sides, rising towards you and dropping back to the paper, now and then turning to face you again, and
 * sometimes landing to walk a little before it takes off again. Its shadow falls on the paper below it.
 *
 * Nothing starts until the opening loader has gone; with reduced motion it is drawn once, still.
 */

const CORE = "/images/site/hero-beetle-v7-core.webp";
const WING = "/images/site/hero-beetle-v7-wing.webp";
const WING_BASE = [0.0603, 0.4627]; // where the wing joins the body, as a fraction of the wing picture
const WING_ASPECT = 766 / 1282;

/** A point on the beetle's back, in its own units, to its place in the top-view painting (1024 px; 184 px a unit). */
const uvOf = (x: number, z: number): [number, number] => [(512 + x * 184) / 1024, 1 - (460 + z * 184) / 1024];

/** Gives a mesh's geometry texture coordinates by projecting the painting straight down onto it. */
function paintFromAbove(g: THREE.BufferGeometry) {
  const p = g.attributes.position;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const [u, v] = uvOf(p.getX(i), p.getZ(i));
    uv[i * 2] = u;
    uv[i * 2 + 1] = v;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const angDiff = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const ease = (cur: number, goal: number, rate: number, dt: number) => cur + (goal - cur) * Math.min(1, dt * rate);
/** Smooth, never-repeating wander in about -1..1. */
const wander = () => {
  const s = [Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28];
  return (t: number) => (Math.sin(t * 0.91 + s[0]) + 0.7 * Math.sin(t * 1.73 + s[1]) + 0.4 * Math.sin(t * 2.89 + s[2])) / 2.1;
};

export default function HeroBeetle3D() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const box = host.getBoundingClientRect();
    const PW = Math.max(300, Math.round(box.width));
    const PH = Math.max(200, Math.round(box.height));
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true;
    let raf = 0;
    const cleanup: (() => void)[] = [];

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(PW, PH);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 1.2s ease";
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

    /* ---------------- the stage: the paper is the plane z = 0, the camera looks down at it ---------------- */
    const VIEW_H = 10; // the box is 10 units tall on the paper
    const VIEW_W = (VIEW_H * PW) / PH;
    const FOV = 22;
    const CAM_Z = VIEW_H / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, PW / PH, 0.1, 200);
    camera.position.set(0, 0, CAM_Z);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xfff4e8, 0x6b4a3a, 1.25));
    const key1 = new THREE.DirectionalLight(0xffffff, 1.6);
    key1.position.set(-6, 8, 14);
    scene.add(key1);
    const rim = new THREE.DirectionalLight(0xffd9b8, 0.7);
    rim.position.set(8, -6, 6);
    scene.add(rim);

    const loader = new THREE.TextureLoader();
    const tex = (src: string) => {
      const t = loader.load(src);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    };
    const coreTex = tex(CORE);
    const wingTex = tex(WING);

    /* ---------------- the beetle (its own units: 1 = half the width of its wing cases; head towards -z, back up +y) ---------------- */
    const S = 1.8; // its size on the paper
    const root = new THREE.Group(); // placed and turned in the world
    const body = new THREE.Group(); // the beetle in its own units
    body.scale.setScalar(S);
    root.add(body);
    scene.add(root);

    const painted = new THREE.MeshStandardMaterial({ map: coreTex, roughness: 0.45, metalness: 0.0 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x2b2426, roughness: 0.55 });
    const glossy = new THREE.MeshStandardMaterial({ color: 0x0d0c10, roughness: 0.12, metalness: 0.1 });
    const cream = new THREE.MeshStandardMaterial({ color: 0xead9bd, roughness: 0.6 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2e2522, roughness: 0.6 });

    // the abdomen, under the wing cases
    const bellyG = new THREE.SphereGeometry(1, 32, 20);
    bellyG.scale(0.62, 0.26, 0.92);
    bellyG.translate(0, -0.04, 0.55);
    paintFromAbove(bellyG);
    // its segments show through the painted back as a darker, warmer brown
    const belly = new THREE.Mesh(bellyG, new THREE.MeshStandardMaterial({ map: coreTex, color: 0x8a5a40, roughness: 0.6 }));
    body.add(belly);

    // the wing cases: two half domes, hinged at the front where they meet, painted with the beetle's own back
    const elytra: THREE.Group[] = [];
    for (const side of [1, -1]) {
      const g = new THREE.SphereGeometry(1, 40, 20, side > 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI, 0, Math.PI / 2);
      g.scale(1.0, 0.62, 1.12);
      g.translate(0, 0.02, 0.69);
      paintFromAbove(g);
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: coreTex, roughness: 0.32, side: THREE.DoubleSide }));
      const hinge = new THREE.Group();
      hinge.position.set(0, 0.02, -0.43); // the front of the seam
      m.position.set(0, 0, 0.43);
      hinge.add(m);
      body.add(hinge);
      elytra.push(hinge);
    }

    // the shield behind the head, with its two pale patches
    const shieldG = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    shieldG.scale(0.74, 0.42, 0.4);
    shieldG.translate(0, 0, -0.78);
    paintFromAbove(shieldG);
    body.add(new THREE.Mesh(shieldG, painted));
    for (const s of [1, -1]) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), cream);
      p.scale.set(0.2, 0.12, 0.12);
      p.position.set(s * 0.44, 0.17, -1.04);
      body.add(p);
    }

    // the head, its eyes and its mouth parts
    const headG = new THREE.SphereGeometry(1, 24, 16);
    headG.scale(0.36, 0.3, 0.3);
    headG.translate(0, 0.02, -1.3);
    paintFromAbove(headG);
    body.add(new THREE.Mesh(headG, painted));
    for (const s of [1, -1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 14), glossy);
      eye.position.set(s * 0.25, 0.06, -1.42);
      body.add(eye);
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), cream);
      spot.position.set(s * 0.1, 0.18, -1.52);
      body.add(spot);
    }
    const mouth = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), dark);
    mouth.scale.set(0.14, 0.1, 0.1);
    mouth.position.set(0, -0.06, -1.6);
    body.add(mouth);

    // the antennae, each a bent stalk with a small club at the end
    const antennae: THREE.Group[] = [];
    for (const s of [1, -1]) {
      const a = new THREE.Group();
      a.position.set(s * 0.13, 0.12, -1.55);
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(s * 0.12, 0.1, -0.2), new THREE.Vector3(s * 0.3, 0.14, -0.42), new THREE.Vector3(s * 0.42, 0.1, -0.6)]);
      a.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.022, 6), dark));
      const club = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), dark);
      club.scale.set(0.05, 0.05, 0.1);
      club.position.copy(curve.getPoint(1));
      a.add(club);
      body.add(a);
      antennae.push(a);
    }

    // six legs, each a thigh, a shin and a foot, jointed so they can step
    type Leg = { root: THREE.Group; knee: THREE.Group; side: number; phase: number };
    const legs: Leg[] = [];
    const seg = (len: number, r: number) => {
      const g = new THREE.CylinderGeometry(r, r * 0.8, len, 8);
      g.rotateZ(-Math.PI / 2);
      g.translate(len / 2, 0, 0);
      return new THREE.Mesh(g, legMat);
    };
    [-0.82, -0.3, 0.22].forEach((z, i) => {
      for (const side of [1, -1]) {
        const r = new THREE.Group();
        r.position.set(side * 0.42, -0.14, z);
        r.scale.x = side;
        r.rotation.y = side * (i === 0 ? 0.55 : i === 1 ? 0 : -0.5); // front legs reach forward, back legs back
        const thigh = seg(0.55, 0.055);
        r.add(thigh);
        const knee = new THREE.Group();
        knee.position.set(0.55, 0, 0);
        const shin = seg(0.7, 0.04);
        knee.add(shin);
        const foot = seg(0.28, 0.026);
        foot.position.set(0.7, 0, 0);
        foot.rotation.z = -0.5;
        knee.add(foot);
        r.add(knee);
        body.add(r);
        // tripod gait: front and back on one side step with the middle on the other
        legs.push({ root: r, knee, side, phase: (i % 2 === 0) === side > 0 ? 0 : Math.PI });
      }
    });

    // the wings: the beetle's own painted wings on thin cards, hinged at the shoulders under the wing cases
    const WL = 2.9;
    const wingG = new THREE.PlaneGeometry(WL, WL * WING_ASPECT);
    wingG.translate(-(WING_BASE[0] - 0.5) * WL, -(0.5 - WING_BASE[1]) * WL * WING_ASPECT, 0);
    wingG.rotateX(-Math.PI / 2); // lie flat, the front edge forwards
    const wingMat = new THREE.MeshStandardMaterial({ map: wingTex, transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: 0.3, opacity: 1 });
    const wings: THREE.Group[] = [];
    for (const side of [1, -1]) {
      const w = new THREE.Group();
      w.position.set(side * 0.5, 0.26, -0.36);
      const m = new THREE.Mesh(wingG, wingMat);
      m.scale.x = side;
      m.renderOrder = 2;
      w.add(m);
      body.add(w);
      wings.push(w);
    }

    // its shadow on the paper
    const sc = document.createElement("canvas");
    sc.width = sc.height = 128;
    const sg = sc.getContext("2d")!;
    const grad = sg.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(60,32,20,0.55)");
    grad.addColorStop(0.5, "rgba(60,32,20,0.25)");
    grad.addColorStop(1, "rgba(60,32,20,0)");
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    shadow.position.z = 0.01;
    scene.add(shadow);

    /* ---------------- how it moves ---------------- */
    type Mode = "look" | "fly" | "land" | "walk";
    let mode: Mode = "look";
    let modeUntil = 3.6; // it looks at you first
    const pos = new THREE.Vector3(VIEW_W * 0.08, -0.6, 6.2);
    const vel = new THREE.Vector3();
    const target = new THREE.Vector3();
    let heading = -Math.PI / 2; // facing down the page, towards you
    let pitch = 1.3; // tipped up to face you
    let roll = 0;
    let open = 1; // wing cases lifted and wings out (1) or folded away (0)
    let flapPhase = 0;
    let gait = 0;
    let flights = 0;
    let nextPick = 0;
    const nA = [wander(), wander()];
    const nB = wander();
    const nC = wander();
    const halfW = VIEW_W / 2;
    const halfH = VIEW_H / 2;

    const pickFlight = (t: number) => {
      flights++;
      const r = Math.random();
      if (flights > 1 && r < 0.18) {
        // a look at you: come up close, face you, hover
        target.set(rnd(-halfW * 0.4, halfW * 0.4), rnd(-1, 0.5), 6.4);
        mode = "fly";
        lookNext = true;
      } else if (flights > 2 && r < 0.42) {
        // down onto the paper for a little walk
        target.set(rnd(-halfW * 0.7, halfW * 0.7), rnd(-halfH * 0.5, halfH * 0.5), 0.35);
        mode = "land";
      } else if (r < 0.52) {
        // off out of the box for a moment
        const side = Math.random() < 0.5 ? -1 : 1;
        target.set(side * (halfW + 6), rnd(-halfH, halfH), rnd(2, 4));
      } else {
        // somewhere else, well away from here
        for (let k = 0; k < 8; k++) {
          target.set(rnd(-halfW * 0.85, halfW * 0.85), rnd(-halfH * 0.7, halfH * 0.7), rnd(1.2, 4.8));
          if (target.distanceTo(pos) > VIEW_W * 0.3) break;
        }
      }
      nextPick = t + rnd(4, 6.5);
    };
    let lookNext = false;

    const basis = new THREE.Matrix4();
    const f = new THREE.Vector3();
    const u0 = new THREE.Vector3();
    const u = new THREE.Vector3();
    const r3 = new THREE.Vector3();
    const tmp = new THREE.Vector3();

    let tPrev = 0;
    let clock = 0;
    let visible = true;

    const step = (dt: number) => {
      clock += dt;
      const t = clock;

      /* -- where it goes -- */
      if (mode === "look") {
        // hover, facing you, drifting a little
        target.set(pos.x + nA[0](t * 0.5) * 0.02, pos.y + nA[1](t * 0.5) * 0.02, 6.2);
        if (t > modeUntil) pickFlight(t);
      } else if (mode === "walk") {
        if (t > nextPick) {
          const h = heading + rnd(-0.8, 0.8);
          const d = rnd(0.8, 1.6);
          target.set(clamp(pos.x + Math.cos(h) * d, -halfW * 0.85, halfW * 0.85), clamp(pos.y + Math.sin(h) * d, -halfH * 0.7, halfH * 0.7), 0.35);
          nextPick = t + rnd(2.5, 4);
        }
        if (t > modeUntil) {
          mode = "fly";
          target.set(pos.x + rnd(-3, 3), pos.y + rnd(-2, 2), 3.5);
          nextPick = t + 2.5;
        }
      } else {
        const near = pos.distanceTo(target) < 0.7;
        if (mode === "land" && near) {
          mode = "walk";
          modeUntil = t + rnd(6, 9);
          nextPick = t + 1.5;
        } else if (lookNext && near) {
          lookNext = false;
          mode = "look";
          modeUntil = t + rnd(2.5, 3.5);
        } else if ((near || t > nextPick) && mode === "fly") {
          // gone out of the box: come straight back in
          if (Math.abs(pos.x) > halfW + 3) target.set(Math.sign(pos.x) * halfW * rnd(0.2, 0.6), rnd(-halfH * 0.6, halfH * 0.6), rnd(1.5, 4));
          else pickFlight(t);
          nextPick = Math.max(nextPick, t + 3);
        }
      }

      /* -- moving there -- */
      const walking = mode === "walk";
      const speed = walking ? 0.55 : mode === "look" ? 0.4 : mode === "land" ? 2.4 : 3.4;
      tmp.copy(target).sub(pos);
      const dist = tmp.length();
      const want = tmp.normalize().multiplyScalar(speed * clamp(dist / (walking ? 0.6 : 2.2), 0, 1));
      vel.x = ease(vel.x, want.x, walking ? 3 : 1.1, dt);
      vel.y = ease(vel.y, want.y, walking ? 3 : 1.1, dt);
      vel.z = ease(vel.z, want.z, walking ? 3 : 1.4, dt);
      pos.addScaledVector(vel, dt);
      if (walking) pos.z = ease(pos.z, 0.35, 4, dt);

      /* -- which way it faces -- */
      const sxy = Math.hypot(vel.x, vel.y);
      let headGoal = heading;
      if (mode === "look") headGoal = -Math.PI / 2;
      else if (sxy > (walking ? 0.08 : 0.4)) headGoal = Math.atan2(vel.y, vel.x);
      const turn = angDiff(headGoal, heading) * Math.min(1, dt * (walking ? 2.2 : 1.6));
      heading += turn;
      const turnRate = turn / Math.max(dt, 1e-3);
      const pitchGoal = mode === "look" ? 1.3 + 0.06 * nB(t) : walking ? 0 : clamp(Math.atan2(vel.z, Math.max(sxy, 0.3)) * 0.9, -0.5, 0.7) + 0.1;
      const rollGoal = walking || mode === "look" ? 0.05 * nC(t) : clamp(turnRate * 0.55, -0.85, 0.85) + 0.12 * nC(t * 0.6);
      pitch = ease(pitch, pitchGoal, 1.8, dt);
      roll = ease(roll, rollGoal, 2, dt);

      /* -- its pose in the world: forward, then its back, then the roll about its length -- */
      const ch = Math.cos(heading);
      const shh = Math.sin(heading);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      f.set(cp * ch, cp * shh, sp);
      u0.set(-sp * ch, -sp * shh, cp);
      r3.crossVectors(f, u0);
      u.copy(u0).multiplyScalar(Math.cos(roll)).addScaledVector(r3, Math.sin(roll));
      r3.crossVectors(f, u); // right = forward x up
      // its own axes: x is its right, y its back, z its tail (so -z is forward)
      basis.makeBasis(r3, u, f.clone().negate());
      root.quaternion.setFromRotationMatrix(basis);
      const bob = walking ? 0 : 0.05 * Math.sin(flapPhase);
      root.position.set(pos.x, pos.y, pos.z + bob);

      /* -- wing cases and wings: open in the air, folded away under the cases on the ground -- */
      open = ease(open, walking || (mode === "land" && pos.z < 0.9) ? 0 : 1, 2.2, dt);
      for (let i = 0; i < 2; i++) {
        const s = i === 0 ? 1 : -1;
        elytra[i].rotation.set(-0.75 * open, s * 0.3 * open, s * -0.55 * open);
      }
      flapPhase += dt * 6.283 * (4.2 + 0.6 * nB(t * 0.3)) * open;
      const beat = Math.sin(flapPhase) + 0.2 * Math.sin(2 * flapPhase + 0.5);
      for (let i = 0; i < 2; i++) {
        const s = i === 0 ? 1 : -1;
        const w = wings[i];
        // spread out to the side when open; when folded, swung right back along the body and tucked down under the cases
        const fold = 1 - open;
        w.rotation.set(0, 0, 0);
        w.rotation.order = "YZX";
        w.rotation.y = s * (-1.75 * fold) + s * 0.18 * Math.cos(flapPhase) * open;
        w.rotation.z = s * (0.25 + 0.75 * beat) * open;
        w.position.y = 0.26 - 0.22 * fold;
        w.scale.setScalar(1 - 0.45 * fold);
        w.visible = open > 0.04;
      }

      /* -- legs: stepping when it walks, held in when it flies -- */
      gait += dt * 6.283 * (walking ? 1.5 * clamp(Math.hypot(vel.x, vel.y) / 0.4, 0.3, 1.2) : 0.3);
      for (const L of legs) {
        const g = gait + L.phase;
        const tuck = open;
        L.root.rotation.z = L.side * (-0.35 - 0.25 * Math.max(0, Math.cos(g)) * (1 - tuck) + 0.2 * tuck);
        L.root.rotation.x = 0;
        const swing = (walking ? 0.35 : 0.05) * Math.sin(g);
        L.root.rotation.y = L.root.userData.base ?? (L.root.userData.base = L.root.rotation.y);
        L.root.rotation.y = L.root.userData.base + L.side * swing;
        L.knee.rotation.z = -1.05 - 0.5 * tuck;
      }
      antennae.forEach((a, i) => {
        a.rotation.y = (i === 0 ? 1 : -1) * 0.15 * nA[i](t * 1.3);
        a.rotation.x = 0.12 * nA[1 - i](t * 1.1);
      });

      /* -- its shadow: sharper and darker the nearer it is to the paper, and pushed away from the light -- */
      const alt = Math.max(0, pos.z);
      const k = 1 + alt * 0.18;
      shadow.position.set(pos.x + alt * 0.35, pos.y - alt * 0.45, 0.01);
      shadow.scale.set(S * 2.6 * k * (0.6 + 0.4 * open), S * 2.8 * k, 1);
      shadow.rotation.z = heading + Math.PI / 2;
      (shadow.material as THREE.MeshBasicMaterial).opacity = 0.75 / (1 + alt * 0.35);
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
      step(dt);
      renderer.render(scene, camera);
    };

    const begin = () => {
      if (!alive) return;
      renderer.domElement.style.opacity = "0.88";
      if (still) {
        step(0.016);
        renderer.render(scene, camera);
        return;
      }
      raf = requestAnimationFrame(frame);
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(host);
      cleanup.push(() => io.disconnect());
    };

    const html = document.documentElement;
    const start = () => window.setTimeout(begin, 400);
    if (!html.hasAttribute("data-loading")) start();
    else {
      const mo = new MutationObserver(() => {
        if (!html.hasAttribute("data-loading")) {
          mo.disconnect();
          start();
        }
      });
      mo.observe(html, { attributes: true, attributeFilter: ["data-loading"] });
      cleanup.push(() => mo.disconnect());
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      cleanup.forEach((fn) => fn());
    };
  }, [key]);

  return <div key={key} ref={hostRef} aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }} />;
}
