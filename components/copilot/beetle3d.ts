/**
 * Nyrro in the assistant, drawn as the film's beetle: the same 3D model, the same sketched lines, ring eyes and dust, in
 * the assistant's dark ink and at the size of the icon. The roaming beetle (Moth.tsx) still decides where it goes, which
 * way it faces, when it rolls onto its side against a wall and when it opens its wings to fly; this only draws it.
 *
 * three.js and the film's model are loaded only when the assistant opens.
 */
import type * as THREE_NS from "three";

export type BeetlePose = {
  t: number; // seconds
  open: number; // 0 at rest … ~0.55 walking … 1 in flight (the roaming beetle's own scale)
  roll: number; // -1 … 1: on its side against a wall on the left (-) or right (+); 0 seen from above
  walking: boolean;
  flying: boolean;
};
export type Beetle3D = { pose: (p: BeetlePose) => void; dispose: () => void };

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const ease = (x: number) => {
  const t = clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};
const hexRgb = (h: string): [number, number, number] => {
  const n = parseInt(h.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/** Mounts the beetle as a canvas centred on `box` (the roaming beetle's own element, which turns it to its heading). */
export async function mountBeetle3D(box: HTMLElement, opts: { size: number; ink: string }): Promise<Beetle3D | null> {
  const [THREE, film] = await Promise.all([import("three"), import("@/components/home/HeroFilm")]);
  const { buildBeetle, drawnWing, stippledWing, WING, BODY } = film;

  const img = await new Promise<HTMLImageElement | null>((res) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = WING;
  });
  if (!img) return null;

  // the canvas is larger than the beetle's box, so its wings and dust have room round it
  const C = Math.round(opts.size * 4.6);
  const pr = Math.min(window.devicePixelRatio || 1, 2);
  let renderer: THREE_NS.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true });
  } catch {
    return null; // no WebGL: the drawn beetle stays
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(pr);
  renderer.setSize(C, C, false);
  const cv = renderer.domElement;
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = `position:absolute;left:50%;top:50%;width:${C}px;height:${C}px;margin:${-C / 2}px 0 0 ${-C / 2}px;pointer-events:none;display:block`;

  const ink = hexRgb(opts.ink);
  const scene = new THREE.Scene();
  const FOV = 20;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  // seen from above and a little behind, so it reads round, as in the film; its head is up the screen, like the icon
  const STAND = 0.28 * BODY;
  // its body (head to tail, about 0.6 of its units) fills as much of the box as the drawn beetle's body did
  const D = (0.4 / (0.8 * opts.size)) * C / (2 * Math.tan(((FOV / 2) * Math.PI) / 180));
  const TILT = (22 * Math.PI) / 180;
  camera.up.set(0, 0, 1);
  camera.position.set(0, STAND + D * Math.cos(TILT), -D * Math.sin(TILT));
  camera.lookAt(0, STAND, 0.03);

  const sk = { time: { value: 0 }, fogNear: { value: 60 }, fogFar: { value: 90 }, px: { value: pr * 0.8 }, ink: { value: new THREE.Vector3(...ink) } };
  // the film's dust is sized for a beetle five times this one (its model drawn at scale 5): scaled to match, so each mote is
  // as fine against its body as in the film
  const proj = (C * pr) / (2 * Math.tan(((FOV / 2) * Math.PI) / 180)) / 5;
  const b = buildBeetle(
    drawnWing(img, [Math.round(ink[0] * 255), Math.round(ink[1] * 255), Math.round(ink[2] * 255)]),
    stippledWing(img, 4.4, 5000),
    sk,
    proj,
    1,
    { ink, dust: ink, dots: 0.14, wingK: 0.24 },
  );
  b.dustMat.uniforms.proj.value = proj * b.wingK; // the wings are smaller against the body here: so is their dust
  // it rolls about its own body line, through its middle
  const pivot = new THREE.Group();
  pivot.position.y = STAND;
  b.root.position.y = -STAND;
  pivot.add(b.root);
  scene.add(pivot);

  box.appendChild(cv);

  let last = -1;
  let wingPhase = 0;
  let air = 0; // eases in and out of flight, so the wings never snap
  let gait = 0;
  const pose = (p: BeetlePose) => {
    const dt = last < 0 ? 0 : clamp(p.t - last, 0, 0.1);
    last = p.t;
    sk.time.value = p.t;
    air += ((p.flying ? 1 : 0) - air) * clamp(dt * 6, 0, 1);
    // walking and resting it keeps its cases shut, as a beetle does; it parts them and unfolds its wings only to fly
    const open = Math.max(ease((p.open - 0.62) / 0.3), air);
    const unfold = ease((open - 0.25) / 0.6);
    pivot.rotation.z = (Math.PI / 2) * clamp(p.roll, -1.1, 1.1);
    // a gentle lean as it flies
    pivot.rotation.x = -0.18 * air;

    b.cases.forEach((c, i) => {
      const s = i === 0 ? 1 : -1;
      c.rotation.set(0.4 * open, s * 0.22 * open, -s * 0.85 * open);
    });
    wingPhase += dt * Math.PI * 2 * 3.2 * unfold; // a small beetle beats its wings quicker than the film's slow, close one
    const beat = Math.sin(wingPhase) * unfold;
    b.dustMat.uniforms.open.value = unfold;
    b.wings.forEach((w, i) => {
      const s = i === 0 ? 1 : -1;
      const fold = 1 - unfold;
      w.rotation.y = s * (1.62 * fold + (0.8 - 0.16 * Math.cos(wingPhase)) * unfold);
      w.rotation.z = s * (0.14 + 0.32 * beat) * unfold;
      w.position.y = 0.12 + 0.22 * unfold;
      w.scale.setScalar((0.5 + 0.5 * unfold) * (0.88 / BODY) * b.wingK);
      w.visible = unfold > 0.02;
    });

    // the antennae feel the air all the time; swept back in flight
    const k = p.t;
    b.antennae.forEach((a, i) => {
      const sd = i === 0 ? 1 : -1;
      const w = p.walking ? 2.6 : 1.4;
      a.rotation.y = sd * (0.35 + 0.15 * Math.sin(k * w + i * 1.3) + 0.25 * air);
      a.rotation.x = -0.35 + 0.12 * Math.sin(k * w * 0.8 + i * 2) + 0.35 * air;
      (a.userData.joints as THREE_NS.Group[]).forEach((j, n) => {
        const ph = k * w * 1.1 - n * 0.7 + i * 2.1;
        j.rotation.y = n === 0 ? 0 : sd * (0.12 + 0.12 * Math.sin(ph));
        j.rotation.x = n === 0 ? 0 : 0.1 + 0.1 * Math.sin(ph * 0.8 + 1.3) - 0.08 * air;
      });
    });
    // a tripod gait while it walks; in the air the legs hang and paddle softly
    const st = p.walking && !p.flying ? 1 : 0;
    gait += dt * 11 * st;
    for (const L of b.legs) {
      const g = gait + L.phase;
      const sd = L.side > 0 ? -1 : 1;
      const swing = Math.sin(g) * st;
      const up = Math.max(0, Math.cos(g)) * st;
      const paddle = Math.sin(k * 1.6 + L.row * 1.1 + (L.side > 0 ? 0 : 0.6)) * air;
      L.root.rotation.y = L.yawBase + sd * (0.45 * swing + 0.18 * paddle);
      L.hip.rotation.z = 0.35 + 0.42 * up - 0.4 * air + 0.12 * paddle;
      L.knee.rotation.z = -1.85 - 0.3 * up + 0.35 * air + 0.15 * paddle;
    }
    // its pupils turn to you
    scene.updateMatrixWorld();
    const eyeTmp = new THREE.Vector3();
    for (const pu of b.pupils) {
      const eye = pu.parent!;
      eyeTmp.copy(camera.position);
      eye.worldToLocal(eyeTmp);
      pu.position.copy(eyeTmp.normalize().multiplyScalar(0.079));
      pu.lookAt(camera.position);
    }
    renderer.render(scene, camera);
  };

  const dispose = () => {
    scene.traverse((o) => {
      const m = o as THREE_NS.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE_NS.Material | THREE_NS.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose?.();
    });
    renderer.dispose();
    cv.remove();
  };
  return { pose, dispose };
}
