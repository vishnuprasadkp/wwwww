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
  settle?: number; // 0 … 1: eases every living movement away, into the icon's resting pose (the loader, as it lands)
};
export type Beetle3D = { pose: (p: BeetlePose) => void; dispose: () => void; canvas: HTMLCanvasElement; still: () => string };

/** One drawing everywhere (loader, header icon, assistant): the weight of its pen, for a beetle 64 px tall. A smaller
 * beetle is drawn with a pen in proportion, so it is the same drawing, only smaller. */
export const BEETLE_LINE = 2.1;
const penFor = (size: number) => BEETLE_LINE * (size / 64);

type P2 = [number, number];
/** Points along a smooth curve through `pts` (Catmull-Rom). */
const through = (pts: P2[], n = 36): P2[] => {
  const out: P2[] = [];
  for (let i = 0; i < n; i++) {
    const f = (i / (n - 1)) * (pts.length - 1);
    const k = Math.min(pts.length - 2, Math.floor(f));
    const t = f - k;
    const p0 = pts[Math.max(0, k - 1)];
    const p1 = pts[k];
    const p2 = pts[k + 1];
    const p3 = pts[Math.min(pts.length - 1, k + 2)];
    const c = (a: number, b: number, cc: number, d: number) => 0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t * t + (-a + 3 * b - 3 * cc + d) * t * t * t);
    out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
};

/**
 * The wing, sketched: its outline and a few veins, each a pen stroke that swells in the middle and tapers to a point at
 * each end, as in the loader's drawing. Laid out as the film's wing picture is (root at the left, the leading edge at the
 * top), so it sits on the same wing.
 */
function sketchedWing(THREE: typeof THREE_NS, rgb: [number, number, number], size: number) {
  // drawn at twice the size the wing shows at in flight, so its pen comes out the same weight as the body's lines
  const W = Math.max(96, Math.round(size * 3.7));
  const H = Math.round((W * 766) / 1282);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.strokeStyle = `rgb(${Math.round(rgb[0] * 255)},${Math.round(rgb[1] * 255)},${Math.round(rgb[2] * 255)})`;
  g.lineCap = "round";
  g.lineJoin = "round";
  const pen = 2 * 1.15 * penFor(size); // the pen's full width at the middle of a stroke (2× for the drawing's scale)
  const stroke = (pts: P2[], weight: number, seed: number) => {
    const q = through(pts.map(([u, v]) => [u * W, v * H] as P2));
    for (let i = 0; i < q.length - 1; i++) {
      const t = i / (q.length - 2);
      // pressure: light at the start, full in the middle, lifting off at the end, a little unsteady
      const pr = Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.96 + 0.02)), 0.55) * (0.85 + 0.15 * Math.sin(t * 9 + seed));
      g.lineWidth = Math.max(0.6, pen * weight * (0.2 + 0.8 * pr));
      g.beginPath();
      g.moveTo(q[i][0], q[i][1]);
      g.lineTo(q[i + 1][0], q[i + 1][1]);
      g.stroke();
    }
  };
  // the outline: the leading edge, then round the tip and back along the trailing edge
  stroke([[0.08, 0.45], [0.3, 0.31], [0.55, 0.245], [0.8, 0.245], [0.95, 0.32], [0.975, 0.42]], 1, 1);
  stroke([[0.975, 0.4], [0.93, 0.56], [0.79, 0.68], [0.58, 0.745], [0.38, 0.725], [0.2, 0.61], [0.09, 0.5]], 1, 2.3);
  // a few veins, fanning out from the root
  stroke([[0.1, 0.45], [0.35, 0.345], [0.62, 0.295], [0.87, 0.3]], 0.75, 3.1);
  stroke([[0.11, 0.47], [0.4, 0.425], [0.66, 0.435], [0.9, 0.475]], 0.65, 4.7);
  stroke([[0.12, 0.49], [0.36, 0.535], [0.6, 0.605], [0.77, 0.665]], 0.6, 5.2);
  stroke([[0.13, 0.505], [0.27, 0.585], [0.42, 0.69]], 0.55, 6.6);
  // and two short cross-veins
  stroke([[0.63, 0.3], [0.61, 0.43]], 0.45, 7.4);
  stroke([[0.5, 0.43], [0.47, 0.575]], 0.4, 8.9);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 4;
  return t;
}
/** The canvas round a beetle of `size`: square, centred on its box, with room for its wings. */
export const beetleCanvas = (size: number) => Math.round(size * 4.6);

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
export async function mountBeetle3D(box: HTMLElement, opts: { size: number; ink: string; pr?: number }): Promise<Beetle3D | null> {
  const [THREE, film] = await Promise.all([import("three"), import("@/components/home/HeroFilm")]);
  const { buildBeetle, stippledWing, WING, BODY } = film;

  const img = await new Promise<HTMLImageElement | null>((res) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = WING;
  });
  if (!img) return null;

  // the canvas is larger than the beetle's box, so its wings and dust have room round it
  const C = beetleCanvas(opts.size);
  const pr = opts.pr ?? Math.min(window.devicePixelRatio || 1, 2);
  let renderer: THREE_NS.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: !!opts.pr });
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

  // drawn with the film's pen: each line swells and tapers, as a sketch; the swell belongs to the beetle (objPress), so
  // as it flies its lines hold their shape instead of shimmering, and the wings stay drawn as they turn (edge)
  const sk = { time: { value: 0 }, fogNear: { value: 60 }, fogFar: { value: 90 }, px: { value: pr * penFor(opts.size) }, ink: { value: new THREE.Vector3(...ink) }, even: { value: 0 }, objPress: { value: 1 }, edge: { value: new THREE.Vector2(0.0, 0.06) }, meridAng: { value: 1 }, backLines: { value: 0 } };
  // the film's dust is sized for a beetle five times this one (its model drawn at scale 5): scaled to match, so each mote is
  // as fine against its body as in the film
  const proj = (C * pr) / (2 * Math.tan(((FOV / 2) * Math.PI) / 180)) / 5;
  const b = buildBeetle(
    // the wings, sketched: an outline and a few veins, in the same pen
    sketchedWing(THREE, ink, opts.size),
    stippledWing(img, 4.4, 1),
    sk,
    proj,
    1,
    { ink, dust: ink, dots: 0, wingK: 0.24 },
  );
  // no dust and no bubbles: only the drawing. The belly gets a few more bands, so with its cases lifted its body still
  // reads as a body, not an empty outline
  b.root.traverse((o) => {
    if ((o as THREE_NS.Points).isPoints) o.visible = false;
    const m = (o as THREE_NS.Mesh).material as THREE_NS.ShaderMaterial | undefined;
    if (m && m.isShaderMaterial && m.uniforms?.rings && m.uniforms.rings.value === 3) m.uniforms.rings.value = 5;
  });
  const shellMat = ((b.cases[0].children[0] as THREE_NS.Mesh).material as THREE_NS.ShaderMaterial);
  const shellWeight = shellMat.uniforms.weight.value as number;
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
    pivot.rotation.x = -0.18 * air * (1 - clamp(p.settle ?? 0, 0, 1));

    // in flight a beetle holds its cases up and a little apart, close over its body: so their grooved outsides stay in view
    // and the body is never two empty shells
    b.cases.forEach((c, i) => {
      const s = i === 0 ? 1 : -1;
      c.rotation.set(0.32 * open, s * 0.12 * open, -s * 0.42 * open);
    });
    shellMat.uniforms.weight.value = shellWeight * (1 - 0.15 * ease(open / 0.6));
    shellMat.uniforms.stripes.value = 1;
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
    const live = 1 - clamp(p.settle ?? 0, 0, 1); // how much of its living movement is left
    // at rest it is alive: every few seconds it grooms (lifts its front legs and rubs them together), now and then its
    // feelers twitch, and its other legs shift a little
    const still = (1 - air) * (p.walking ? 0 : 1) * live;
    const cyc = (k % 5.2) / 5.2;
    const groom = still * Math.pow(Math.sin(Math.PI * clamp((cyc - 0.55) / 0.35, 0, 1)), 0.6);
    const twitch = still * Math.exp(-Math.pow(((k + 1.7) % 3.1) - 0.15, 2) * 60);
    b.antennae.forEach((a, i) => {
      const sd = i === 0 ? 1 : -1;
      const w = p.walking ? 2.6 : 1.4;
      a.rotation.y = sd * (0.35 + (0.2 * Math.sin(k * w + i * 1.3) + 0.25 * air) * live + 0.22 * twitch * Math.sin(k * 40 + i));
      a.rotation.x = -0.35 + (0.15 * Math.sin(k * w * 0.8 + i * 2) + 0.35 * air) * live - 0.2 * groom;
      (a.userData.joints as THREE_NS.Group[]).forEach((j, n) => {
        const ph = k * w * 1.1 - n * 0.7 + i * 2.1;
        j.rotation.y = n === 0 ? 0 : sd * (0.12 + 0.12 * Math.sin(ph) * live);
        j.rotation.x = n === 0 ? 0 : 0.1 + (0.1 * Math.sin(ph * 0.8 + 1.3) - 0.08 * air) * live;
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
      const paddle = Math.sin(k * 1.6 + L.row * 1.1 + (L.side > 0 ? 0 : 0.6)) * air * live;
      // grooming: the front legs reach in and up to the head and rub; the others shift their footing a little
      const front = L.row === 0 ? groom : 0;
      const shift = L.row === 0 ? 0 : still * 0.08 * Math.sin(k * 0.9 + L.row * 2.3 + (L.side > 0 ? 0 : 1.7));
      const rub = front * Math.sin(k * 16 + (L.side > 0 ? 0 : Math.PI));
      L.root.rotation.y = L.yawBase + sd * (0.45 * swing + 0.18 * paddle + 0.6 * front + 0.12 * rub + shift);
      L.hip.rotation.z = 0.35 + 0.42 * up + (-0.4 * air + 0.12 * paddle) * live + 0.75 * front;
      L.knee.rotation.z = -1.85 - 0.3 * up + (0.35 * air + 0.15 * paddle) * live + 0.55 * front + 0.15 * rub;
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
  const still = () => cv.toDataURL("image/png");
  return { pose, dispose, canvas: cv, still };
}
