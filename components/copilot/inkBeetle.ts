/**
 * Nyrro, drawn in ink: the earlier hand-drawn beetle (traced from a striped beetle print), exactly as it was drawn — a small head
 * with two curved horns and eye dots, a dome-shaped shield, two rounded wing cases cut with long tapering stripes and a seam,
 * the banded abdomen that shows as the cases part, and six thin legs with a bulb at the hip and a club at the foot. Every line is
 * a brush stroke that swells and tapers, a little unsteady, as the original.
 *
 * Added in the same strokes: the flying wings, which unfold from under the cases and beat. And depth: the whole drawing turns in
 * real 3D (it pitches and banks as it flies, tilts as it walks), the wings flap in perspective, and against a wall it is seen
 * from the side (the earlier side drawing), so its body is never an empty outline.
 *
 * It keeps the shape of the old 3D beetle's interface (pose, dispose, the element, still), so the loader, the header icon and
 * the assistant draw it without change.
 */
type Pt = [number, number];

const PAPER = "#eae7e6"; // the page: the drawing is filled only with the paper's own colour
const PIVOT: Pt = [20, 13]; // the shoulder
const FOLD = 34; // degrees a wing case swings from closed to open
export const WIDE = 1.4; // the drawing is this much wider than tall

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (x: number) => {
  const t = clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};

const sample = (a: Pt, b: Pt, c: Pt, d: Pt, n = 14): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]] as Pt;
  });
/** A path along `pts` whose width follows `w(t)`; where it is 0 the end is a point. */
const ribbon = (pts: Pt[], w: (t: number) => number): string => {
  const n = pts.length - 1;
  const left: Pt[] = [];
  const right: Pt[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const h = w(i / n) / 2;
    left.push([p[0] - (dy / len) * h, p[1] + (dx / len) * h]);
    right.push([p[0] + (dy / len) * h, p[1] - (dx / len) * h]);
  });
  return "M" + [...left, ...right.reverse()].map((q) => `${q[0].toFixed(2)} ${q[1].toFixed(2)}`).join("L") + "Z";
};
/** One brush stroke: a ribbon along `pts`, its width following the pressure, the line itself a little unsteady. */
const stroke = (pts: Pt[], peak: number, seed: number, amp = 0.16): string => {
  const shaky = pts.map(([x, y], i) => [x + Math.sin(i * 1.9 + seed) * amp + Math.sin(i * 4.3 + seed * 2.1) * amp * 0.5, y + Math.cos(i * 2.3 + seed * 1.3) * amp + Math.cos(i * 5.1 + seed) * amp * 0.5] as Pt);
  return ribbon(shaky, (t) => peak * (0.22 + 0.78 * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, t * 0.94 + 0.03))), 0.5)) * (1 + 0.18 * Math.sin(t * 9 + seed)));
};
const curve = (a: Pt, b: Pt, c: Pt, d: Pt) => sample(a, b, c, d, 12);
const run2 = (...segs: [Pt, Pt, Pt, Pt][]): Pt[] => segs.flatMap((sg, i) => sample(sg[0], sg[1], sg[2], sg[3], 10).slice(i ? 1 : 0));
const limb = (l: Pt[], seed: number, base: number) =>
  ribbon(sample(l[0], l[1], l[1], l[2], 12).map(([x, y], i) => [x + Math.sin(i * 2.1 + seed) * 0.1, y + Math.cos(i * 1.7 + seed) * 0.1] as Pt), (t) => base * (0.4 + 0.6 * Math.pow(1 - t, 0.5)));

// traced from the print, in pixels, turned into the drawing's units
const fx = (px: number) => 20 + (px - 299) * 0.0607;
const fy = (py: number) => 3 + (py - 108) * 0.085;
const poly = (pts: [number, number][]): Pt[] => pts.map(([x, y]) => [fx(x), fy(y)] as Pt);
const smooth = (pts: Pt[], n = 6): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
const closedPath = (pts: Pt[]) => "M" + pts.map((q) => `${q[0].toFixed(2)} ${q[1].toFixed(2)}`).join("L") + "Z";
const mirrorPts = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [40 - x, y] as Pt);

// the right wing case (the left is its mirror)
const CASE_PTS = poly([[300, 243], [335, 237], [372, 244], [398, 266], [414, 305], [418, 350], [409, 405], [386, 448], [352, 477], [318, 487], [301, 486]]);
const FW = closedPath(smooth(CASE_PTS, 5));
const FW_EDGE = stroke(smooth(CASE_PTS, 5), 0.95, 3, 0.06);
const CASE_TOP = fy(243);
const CASE_H = fy(486) - fy(243);
const meridian = (d: number, t0: number, t1: number): Pt[] =>
  Array.from({ length: 12 }, (_, i) => {
    const t = t0 + ((t1 - t0) * i) / 11;
    return [20 + d * Math.pow(Math.sin(Math.PI * (0.04 + 0.92 * t)), 0.65), CASE_TOP + CASE_H * t] as Pt;
  });
const STRIPES = [
  [2.6, 0.09, 0.93, 1.0],
  [4.9, 0.12, 0.9, 1.0],
]
  .map((d, i) => stroke(meridian(d[0], d[1], d[2]), d[3], i * 2.7 + 1, 0.05))
  .join("");
const SEAM = stroke(smooth(poly([[299, 243], [300, 300], [298, 380], [300, 487]])), 0.9, 27, 0.05);
// the abdomen under the cases
const ABD = "M20 14.2C24.6 14.2 26.4 20 25.8 26.5C25.2 32 22.2 35.6 20 38.6C17.8 35.6 14.8 32 14.2 26.5C13.6 20 15.4 14.2 20 14.2Z";
const ABD_PTS: Pt[] = [[20, 14.2], [24.4, 15], [26, 20], [25.4, 25.6], [23.8, 30.4], [21.6, 33.6], [20, 35.2]];
const ABD_EDGE = stroke(smooth(ABD_PTS), 0.9, 61, 0.05);
const ABD_EDGE_L = stroke(smooth(mirrorPts(ABD_PTS)), 0.9, 63, 0.05);
const ABD_LINES = [
  stroke(curve([14.8, 22.8], [17.6, 24.4], [22.4, 24.4], [25.2, 22.8]), 0.9, 53, 0.05),
  stroke(curve([16.4, 29.2], [18.4, 30.6], [21.6, 30.6], [23.6, 29.2]), 0.85, 55, 0.05),
].join("");
// the shield
const SHIELD_PTS = poly([[222, 233], [226, 214], [242, 191], [270, 173], [300, 168], [333, 173], [362, 189], [386, 212], [392, 233]]);
const SHIELD = closedPath(smooth(SHIELD_PTS, 5));
const SHIELD_EDGE = stroke(smooth(SHIELD_PTS.slice(0, 4), 5), 1, 17, 0.05) + stroke(smooth(SHIELD_PTS.slice(5), 5), 1, 18, 0.05);
const SHIELD_BOT = stroke(smooth(poly([[222, 233], [255, 244], [300, 249], [345, 244], [392, 233]]), 5), 0.7, 19, 0.05);
// the head and its horns
const HEAD_PTS = poly([[279, 154], [281, 141], [298, 135], [332, 135], [347, 141], [350, 154], [345, 172], [331, 182], [299, 182], [284, 172], [279, 154]]);
const HEAD = closedPath(smooth(HEAD_PTS, 4));
const HEAD_EDGE = stroke(smooth(HEAD_PTS, 4), 0.8, 23, 0.04);
const HORN_L = ribbon(smooth(poly([[283, 141], [263, 131], [251, 116], [250, 106]])), (t) => 0.5 * (0.55 + 0.45 * Math.pow(1 - t * 0.6, 0.6)));
const HORN_R = ribbon(smooth(poly([[347, 138], [369, 129], [379, 116], [379, 107]])), (t) => 0.5 * (0.55 + 0.45 * Math.pow(1 - t * 0.6, 0.6)));
// the legs
const LEG_L: Pt[][] = [
  poly([[222, 214], [205, 196], [190, 172], [165, 153], [135, 148]]),
  poly([[190, 323], [165, 330], [150, 356], [125, 380], [95, 386]]),
  poly([[196, 418], [175, 428], [166, 462], [140, 488], [125, 497]]),
];
const LEG_ALL: Pt[][] = [...LEG_L, ...LEG_L.map(mirrorPts)];
const legInk = (l: Pt[], i: number) => ribbon(smooth(l, 5).map(([x, y], j) => [x + Math.sin(j * 1.9 + i) * 0.04, y + Math.cos(j * 2.3 + i) * 0.04] as Pt), (t) => 0.85 * (0.7 + 0.3 * (1 - t)));
const FOOT_TURN = [-12, 4, 28, 12, -4, -28];

// the flying wings, in the same brush strokes: a long rounded wing from the shoulder, its edge and three veins (right; the left
// is its mirror). Drawn spread, lying out from the body; they unfold from under the cases and beat.
const WING_PTS: Pt[] = [[21, 14.2], [25, 12.4], [30.5, 12.6], [35.5, 14.6], [38.6, 18.2], [38.4, 21.6], [35.4, 23.4], [30, 23.6], [25.4, 22], [22, 18.6], [21, 14.2]];
const WING_FILL = closedPath(smooth(WING_PTS, 5));
const WING_EDGE = stroke(smooth(WING_PTS, 5), 0.75, 71, 0.05);
const WING_VEINS = [
  stroke(curve([21.6, 15], [26, 14], [31, 14.2], [36.6, 16.4]), 0.5, 73, 0.04),
  stroke(curve([21.8, 15.8], [26, 17], [30.6, 18.4], [36.8, 20.6]), 0.45, 75, 0.04),
  stroke(curve([22, 16.6], [24.6, 19.2], [27.6, 21.2], [31.4, 22.8]), 0.4, 77, 0.04),
].join("");

// the side view (on a wall): head up, legs to its left
const DOME = "M17.2 12.4C28.4 11.4 33.4 19 32 27.4C31 32.6 25.8 36 20.4 36.4C17.2 29 16.2 19 17.2 12.4Z";
const DOME_EDGE = stroke(run2([[17.2, 12.4], [28.4, 11.4], [33.4, 19], [32, 27.4]], [[32, 27.4], [31, 32.6], [25.8, 36], [20.4, 36.4]]), 1.9, 31);
const DOME_BACK = stroke(curve([17.2, 12.6], [16.2, 19], [17.2, 29], [20.4, 36.4]), 1.3, 35);
const DOME_STRIPES = [
  stroke(curve([20.6, 15.4], [26, 16.6], [29.4, 22], [28.6, 29.4]), 0.9, 41, 0.08),
  stroke(curve([19.6, 19.6], [23.6, 21.4], [26.4, 25.6], [25.4, 32.6]), 0.9, 43, 0.08),
  stroke(curve([22.2, 14], [28.2, 14.2], [31.6, 20], [30.6, 26.6]), 0.8, 45, 0.08),
].join("");
const SIDE_LEG_PTS: Pt[][] = [
  [[16.4, 14], [13.6, 14.4], [12.4, 11.6]],
  [[16.8, 21.4], [15.2, 22], [13.6, 22.8]],
  [[17.4, 29], [15.8, 32], [14.6, 34.8]],
];
const SIDE_ANT = ribbon(sample([16.6, 6.2], [18, 3.8], [21.2, 2.2], [26.2, 1.6], 16), (t) => 1.15 * Math.pow(1 - t, 0.55));

const lum = (h: string) => {
  const n = parseInt(h.replace("#", ""), 16);
  return (0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) / 255;
};
const rot = (deg: number, [x, y]: Pt = PIVOT) => `rotate(${deg.toFixed(2)} ${x} ${y})`;

/** The top view as SVG markup: the body, the cases (data-fw), the flying wings (data-wing), the legs (data-legs). */
function topSvg(ink: string, paper: string, uid: string) {
  const under = `<g data-wing><path d="${WING_FILL}" fill="${paper}"/><path d="${WING_VEINS}" fill="${ink}"/><path d="${WING_EDGE}" fill="${ink}"/></g>`;
  const cases = `<g data-fw><g transform="${rot(-FOLD)}"><path d="${FW}" fill="${paper}"/><path d="${STRIPES}" fill="${ink}"/><path d="${FW_EDGE}" fill="${ink}"/><path d="${SEAM}" fill="${ink}"/></g></g>`;
  // each leg with its hip bulb and its club foot, in one group, so the foot moves with the leg
  const legs = LEG_ALL.map((l, i) => {
    const hip = l[0];
    const foot = l[l.length - 1];
    return `<g data-leg="${i}"><path d="${legInk(l, i)}" fill="${ink}"/><ellipse cx="${hip[0].toFixed(2)}" cy="${hip[1].toFixed(2)}" rx=".6" ry=".45" fill="${ink}"/><ellipse cx="${foot[0].toFixed(2)}" cy="${foot[1].toFixed(2)}" rx=".95" ry=".52" fill="${ink}" transform="rotate(${FOOT_TURN[i]} ${foot[0].toFixed(2)} ${foot[1].toFixed(2)})"/></g>`;
  }).join("");
  return `
<defs><clipPath id="${uid}"><rect x="20" y="-10" width="30" height="60"/></clipPath><clipPath id="${uid}w"><rect x="20.4" y="-10" width="30" height="60"/></clipPath></defs>
<g data-wings>
  <g data-wr clip-path="url(#${uid}w)">${under}</g>
  <g transform="translate(40 0) scale(-1 1)"><g data-wl clip-path="url(#${uid}w)">${under}</g></g>
</g>
<path d="${ABD}" fill="${paper}"/>
<path d="${ABD_LINES}" fill="${ink}"/><path d="${ABD_EDGE}" fill="${ink}"/><path d="${ABD_EDGE_L}" fill="${ink}"/>
<g clip-path="url(#${uid})">${cases}</g>
<g transform="translate(40 0) scale(-1 1)"><g clip-path="url(#${uid})">${cases}</g></g>
<g data-legs>${legs}</g>
<path d="${SHIELD}" fill="${paper}"/><path d="${SHIELD_BOT}" fill="${ink}"/><path d="${SHIELD_EDGE}" fill="${ink}"/>
<path d="${HEAD}" fill="${paper}"/><path d="${HEAD_EDGE}" fill="${ink}"/>
<g data-ant="l"><path d="${HORN_L}" fill="${ink}"/><ellipse cx="${fx(250).toFixed(2)}" cy="${fy(105).toFixed(2)}" rx=".5" ry=".42" fill="${ink}"/></g>
<g data-ant="r"><path d="${HORN_R}" fill="${ink}"/><ellipse cx="${fx(379).toFixed(2)}" cy="${fy(106).toFixed(2)}" rx=".5" ry=".42" fill="${ink}"/></g>
<ellipse cx="${fx(289).toFixed(2)}" cy="${fy(156).toFixed(2)}" rx=".5" ry=".58" fill="${ink}"/>
<ellipse cx="${fx(341).toFixed(2)}" cy="${fy(156).toFixed(2)}" rx=".5" ry=".58" fill="${ink}"/>`;
}
function sideSvg(ink: string, paper: string) {
  const legs = SIDE_LEG_PTS.map((l, i) => `<path d="${limb(l, i * 1.7 + 4, 2.3)}" fill="${ink}"/><ellipse cx="${l[2][0]}" cy="${l[2][1]}" rx="1.15" ry=".8" fill="${ink}"/>`).join("");
  return `${legs}<path d="${DOME}" fill="${paper}"/><path d="${DOME_STRIPES}" fill="${ink}"/><path d="${DOME_BACK}" fill="${ink}"/><path d="${DOME_EDGE}" fill="${ink}"/>
<ellipse cx="16.8" cy="12.4" rx="2.5" ry="3" fill="${ink}"/><ellipse cx="16.3" cy="11.5" rx=".7" ry=".9" fill="${paper}"/>
<path d="M14 8.8C13.8 6 17.2 6 17 8.8Z" fill="${ink}"/><g data-sant><path d="${SIDE_ANT}" fill="${ink}"/></g>`;
}

/** The SVG markup of the beetle at rest, at `size` (its height; it is WIDE times as wide), for a picture of the icon. */
export function inkBeetleMarkup(size: number, ink: string) {
  const paper = lum(ink) > 0.72 ? "none" : PAPER;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size * WIDE}" height="${size}" viewBox="0 0 40 40" preserveAspectRatio="none" style="overflow:visible">${topSvg(ink, paper, `nbm${Math.round(size * 10)}${ink.replace("#", "")}`) /* a fixed id: the same on the server and in the browser */}</svg>`;
}

export type InkPose = { t: number; open: number; roll: number; walking: boolean; flying: boolean; settle?: number };

/** Mounts the beetle in a square frame `frame` px across, centred on `box`. */
export function mountInkBeetle(box: HTMLElement, opts: { size: number; ink: string; frame: number }) {
  const { size, ink, frame: C } = opts;
  const paper = lum(ink) > 0.72 ? "none" : PAPER;
  const uid = "nb" + Math.random().toString(36).slice(2, 9);
  const W = size * WIDE;

  // the frame: square, centred on the box, with room for the wings; perspective for the turns
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = `position:absolute;left:50%;top:50%;width:${C}px;height:${C}px;margin:${-C / 2}px 0 0 ${-C / 2}px;pointer-events:none;perspective:${Math.round(size * 9)}px`;
  const body = document.createElement("div");
  body.style.cssText = `position:absolute;left:50%;top:50%;width:${W}px;height:${size}px;margin:${-size / 2}px 0 0 ${-W / 2}px;transform-style:preserve-3d;will-change:transform`;
  el.appendChild(body);
  const NS = "http://www.w3.org/2000/svg";
  const mk = (markup: string) => {
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 40 40");
    s.setAttribute("preserveAspectRatio", "none");
    s.setAttribute("width", String(W));
    s.setAttribute("height", String(size));
    s.style.cssText = "position:absolute;inset:0;overflow:visible;display:block";
    s.innerHTML = markup;
    body.appendChild(s);
    return s;
  };
  const top = mk(topSvg(ink, paper, uid));
  const side = mk(sideSvg(ink, paper));
  side.style.opacity = "0";
  box.appendChild(el);

  const q = <T extends Element>(s: string, root: Element = top) => Array.from(root.querySelectorAll<T>(s));
  const fws = q<SVGGElement>("[data-fw]");
  const wr = q<SVGGElement>("[data-wr]")[0];
  const wl = q<SVGGElement>("[data-wl]")[0];
  const wings = q<SVGGElement>("[data-wings]")[0];
  const legs = q<SVGGElement>("[data-leg]");
  const antL = q<SVGGElement>('[data-ant="l"]')[0];
  const antR = q<SVGGElement>('[data-ant="r"]')[0];
  const sant = q<SVGGElement>("[data-sant]", side)[0];

  let last = -1;
  let air = 0;
  let beat = 0;
  let gait = 0;
  const pose = (p: InkPose) => {
    const dt = last < 0 ? 0 : clamp(p.t - last, 0, 0.1);
    last = p.t;
    const live = 1 - clamp(p.settle ?? 0, 0, 1);
    air += ((p.flying ? 1 : 0) - air) * clamp(dt * 6, 0, 1);
    // the cases: shut at rest, parted a little walking, lifted wide in flight
    const open = Math.max(clamp(p.open, 0, 1), air);
    for (const g of fws) g.setAttribute("transform", rot(FOLD * (1 - Math.min(1, open * 0.75)) - 0));
    // the wings unfold from under the cases and beat; seen in perspective, a beat narrows and widens them
    const unfold = ease((open - 0.45) / 0.45);
    beat += dt * Math.PI * 2 * 5.5 * unfold;
    const flap = 0.72 + 0.28 * Math.cos(beat);
    const spread = 0.35 + 0.9 * unfold; // out past the cases, so the wings read clearly beside the body
    const wingT = `translate(${PIVOT[0]} ${PIVOT[1]}) rotate(${(-18 * (1 - unfold) + 8 * unfold).toFixed(2)}) scale(${(spread * flap).toFixed(3)} ${(0.85 + 0.15 * unfold).toFixed(3)}) translate(${-PIVOT[0]} ${-PIVOT[1]})`;
    wr.setAttribute("transform", wingT);
    wl.setAttribute("transform", wingT);
    wings.style.opacity = unfold.toFixed(3);
    // the legs: a tripod gait walking; tucked a little and paddling in the air; still at rest
    const walking = p.walking && !p.flying ? 1 : 0;
    gait += dt * 9 * walking;
    legs.forEach((g, i) => {
      const hip = LEG_ALL[i][0];
      const side = i < 3 ? 1 : -1;
      const phase = gait + (i % 2 ? Math.PI : 0) + (i >= 3 ? Math.PI : 0);
      const swing = Math.sin(phase) * 9 * walking + air * side * 10 + Math.sin(p.t * 1.6 + i) * 3 * air * live;
      g.setAttribute("transform", rot(swing, hip));
    });
    // the feelers: alive, swept back in flight
    const k = p.t;
    const twitch = Math.exp(-Math.pow(((k + 1.7) % 3.1) - 0.15, 2) * 60);
    const aL = (6 * Math.sin(k * 1.3) + 10 * twitch * Math.sin(k * 40)) * live - 14 * air;
    const aR = (6 * Math.sin(k * 1.3 + 1.1) + 10 * twitch * Math.sin(k * 40 + 1)) * live + 14 * air;
    antL.setAttribute("transform", rot(aL, [fx(283), fy(141)]));
    antR.setAttribute("transform", rot(aR, [fx(347), fy(138)]));
    sant.setAttribute("transform", rot((5 * Math.sin(k * 1.4)) * live, [16.6, 6.2]));

    // depth: against a wall it turns onto its side (the side drawing takes over half way, so the body is never empty); in the
    // air it pitches its head up a little and banks with its beat; walking it rocks gently from side to side
    const r = clamp(p.roll, -1, 1);
    const onSide = Math.abs(r) > 0.5;
    const turn = onSide ? (1 - Math.abs(r)) * 2 : Math.abs(r) * 2; // 0 face-on … 1 edge-on, then back as the other view
    top.style.opacity = onSide ? "0" : "1";
    side.style.opacity = onSide ? "1" : "0";
    side.style.transform = r > 0 ? "scaleX(-1)" : "";
    const yaw = Math.sign(r || 1) * turn * 70 * (onSide ? -1 : 1);
    const pitch = air * (14 + 4 * Math.sin(beat * 0.5)) + walking * 3 * Math.sin(gait * 2);
    const bank = air * 6 * Math.sin(p.t * 1.7) + walking * 2.5 * Math.sin(gait);
    const lift = air * -size * 0.04 * (1 + Math.sin(beat));
    body.style.transform = `translateY(${lift.toFixed(2)}px) rotateX(${pitch.toFixed(2)}deg) rotateY(${(yaw + bank).toFixed(2)}deg)`;
  };

  const dispose = () => el.remove();
  /** A still picture of the drawing as it is, as a data URL (for a PNG of the icon). */
  const still = () => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${C}" height="${C}" viewBox="0 0 ${C} ${C}"><g transform="translate(${(C - W) / 2} ${(C - size) / 2})">${new XMLSerializer().serializeToString(top)}</g></svg>`);
  return { pose, dispose, canvas: el, still };
}
