"use client";

import { useEffect, useId, useRef } from "react";

export const INK = "#e4572e"; // the brand orange: only the AI star
const PAPER = "#eae7e6"; // its fill: the page background, so it is drawn like the logo, as a line
/** The three swatch colours the strokes use, one after another, as r,g,b (the moth itself stays the logo grey-brown). */
const PALETTE: [number, number, number][] = [
  [0x53, 0x66, 0x6f], // blue-grey
  [0x95, 0x62, 0x45], // terracotta
  [0x66, 0x7e, 0x66], // sage green
];
/** The moth's colours: it is solid, with a few fine lines of the `vein` colour cut into it for the wing pattern. */
export type MothColors = { grey: string; hind: string; deep: string; vein: string };
/** The assistant's moth: the logo's grey-brown. */
export const MOTH_COLORS: MothColors = {
  grey: "#6e564f", // fore wings: the logo's grey-brown, a little deeper
  hind: "#8d7168", // hind wings: a lighter tone of the same, so they stand clear of the fore wings
  deep: "#4c3d38", // body, head, antennae and legs
  vein: "#eae7e6", // the pattern: pale lines, the page colour
};

const PIVOT = "20 13"; // shoulder
const FOLD = 34; // degrees a forewing swings from spread to folded
const WIDE = 1.4; // the moth is drawn this much wider than tall

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Poses the top-view moth. `p` 0 is at rest (wings folded into a triangle: the app icon), about 0.55 is walking
 * (wings half open, hind wings showing) and 1 is in flight (wings spread). Each wing pivots on the shoulder, so
 * every value in between is a real in-between pose, with the same markings throughout.
 */
export function setMothOpen(svg: SVGSVGElement, p: number) {
  const a = FOLD * (1 - p);
  for (const g of svg.querySelectorAll<SVGGElement>("[data-fw]")) g.setAttribute("transform", `rotate(${a.toFixed(2)} ${PIVOT})`);
  const hind = clamp((p - 0.1) / 0.25, 0, 1);
  for (const g of svg.querySelectorAll<SVGGElement>("[data-hw]")) {
    g.setAttribute("transform", `rotate(${(a * 0.5).toFixed(2)} ${PIVOT})`);
    g.style.opacity = String(hind);
  }
}

/** Four-point sparkle: the AI mark, beside the moth. */
function Sparkle() {
  return <path className="moth-spark" d="M35.4 0.6C35.8 3.4 37.2 4.8 40 5.2C37.2 5.6 35.8 7 35.4 9.8C35 7 33.6 5.6 30.8 5.2C33.6 4.8 35 3.4 35.4 0.6Z" fill={INK} />;
}

/** The antennae and legs: thin dark lines that keep their width however the moth is scaled. */
const feelerOf = (c: MothColors) => ({ stroke: c.deep, strokeWidth: 1, strokeLinecap: "round" as const, vectorEffect: "non-scaling-stroke" as const });
/** The wing pattern and abdomen rings: fine pale lines cut into the solid shapes. */
const veinOf = (c: MothColors) => ({ stroke: c.vein, strokeWidth: 0.9, strokeLinecap: "round" as const, vectorEffect: "non-scaling-stroke" as const });

/** The AI star, drawn square (the moth is stretched wider than tall, the star must not be), at the moth's top right. */
function StarBadge({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="30.4 0.2 10 10" aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <Sparkle />
    </svg>
  );
}

export function MothIcon({ size = 28, open = 0, star = true, colors = MOTH_COLORS, className = "" }: { size?: number; open?: number; star?: boolean; colors?: MothColors; className?: string }) {
  const feeler = feelerOf(colors);
  const vein = veinOf(colors);
  const id = "mc" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current) setMothOpen(ref.current, open);
  }, [open]);
  // Drawn after a tiger moth and kept very simple: a broad drooping wing with one pale vein, a smaller hind wing, a plain
  // abdomen, two long thin antennae. Solid, with the pattern as one fine pale line per wing. Wings are drawn for the right side,
  // spread; the left side is the mirror image.
  const wings = (
    <>
      <g data-hw>
        <path d="M21 22.6C25 22.2 30 23.4 33.2 25.4C33.4 28.6 30 30.4 26.4 29.6C23.6 29 22 27 21 24.6Z" fill={colors.hind} />
      </g>
      <g data-fw>
        <path d="M20.8 12.2C26.4 14 33.6 17.2 39 21.6C38.6 24 36.2 25.4 33 25.4C28.6 24.6 24.4 24.4 21 24.6Z" fill={colors.grey} />
        <g fill="none" {...vein}>
          <path d="M22.8 16C27.8 18 32.4 20.8 35.6 23.4" />
        </g>
      </g>
    </>
  );
  const w = size * WIDE;
  return (
    <span className={className} style={{ position: "relative", display: "inline-block", width: w, height: size, lineHeight: 0 }}>
      <svg ref={ref} width={w} height={size} viewBox="0 0 40 40" preserveAspectRatio="none" aria-hidden="true" style={{ overflow: "visible", display: "block" }}>
        <defs>
          <clipPath id={id}>
            <rect x="20" y="-10" width="30" height="60" />
          </clipPath>
        </defs>
        <g fill="none" {...feeler}>
          <path className="moth-ant" style={{ transformOrigin: "20px 8px" }} d="M20.8 7.2C23 4.2 27 2.2 33.5 1.2" />
          <path className="moth-ant moth-ant-l" style={{ transformOrigin: "20px 8px" }} d="M19.2 7.2C17 4.2 13 2.2 6.5 1.2" />
        </g>
        <path d="M18.3 13C18 18 18.6 24 20 31.4C21.4 24 22 18 21.7 13Z" fill={colors.deep} />
        <g clipPath={`url(#${id})`}>{wings}</g>
        <g transform="translate(40 0) scale(-1 1)" clipPath={`url(#${id})`}>
          {wings}
        </g>
        <ellipse cx="20" cy="11.6" rx="2.7" ry="3.2" fill={colors.deep} />
        <circle cx="20" cy="7.6" r="1.6" fill={colors.deep} />
      </svg>
      {star && <MothStar size={size} />}
    </span>
  );
}

/** The AI star at a moth's top right: its own element, so there is only ever one, however the moth is turning. */
export function MothStar({ size = 28 }: { size?: number }) {
  return (
    <span style={{ position: "absolute", left: size * WIDE * 0.88, top: -size * 0.1, width: size * 0.32, height: size * 0.32, lineHeight: 0 }}>
      <StarBadge size={size * 0.32} />
    </span>
  );
}

/**
 * The moth from the side, head up, legs on its left: wings folded into a solid wedge along its back with a fine pale
 * vein. Clinging to a wall on its left as drawn (mirrored for a wall on the right); turned a quarter, it is standing on
 * a ledge, head along it. Same solid drawing as the top view.
 */
export function MothSideIcon({ size = 28, colors = MOTH_COLORS }: { size?: number; colors?: MothColors }) {
  const feeler = feelerOf(colors);
  const vein = veinOf(colors);
  return (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ overflow: "visible" }}>
    <g fill="none" {...feeler}>
      <path d="M15.6 13.4L12.8 12.8L10.8 15M15.9 17.4L12.9 17.2L10.8 19.6M16.5 21.6L13.6 22.2L11.4 24.6" />
      <path className="moth-ant" style={{ transformOrigin: "16px 8px" }} d="M16.4 7.4C17.8 4.4 21.2 2.4 26.4 1.8" />
    </g>
    <path d="M19.4 31.4L21 36L23.4 32Z" fill={colors.deep} />
    <path d="M17 12.6C25.2 14.4 32 22.8 31.8 33.4L18.6 32.2C16.8 25.4 15.8 18.4 17 12.6Z" fill={colors.grey} />
    <g fill="none" {...vein}>
      <path d="M19 15.8C24 18.4 28.2 23.8 29.4 31.4" />
    </g>
    <ellipse cx="16.4" cy="12.4" rx="2.2" ry="2.8" fill={colors.deep} />
    <circle cx="15.6" cy="8.4" r="1.6" fill={colors.deep} />
  </svg>
  );
}

/* ------------------------------------------------------------------ one drawing that turns from top view to side view */

type Pt = [number, number];
const cubic = (a: Pt, b: Pt, c: Pt, d: Pt, n: number, skipFirst = false): Pt[] => {
  const out: Pt[] = [];
  for (let i = skipFirst ? 1 : 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]);
  }
  return out;
};
// the top-view fore wing, the hind wing and the wing's vein, as the MothIcon draws them (spread pose, right wing)
const WING_PTS: Pt[] = [
  ...cubic([20.8, 12.2], [26.4, 14], [33.6, 17.2], [39, 21.6], 14),
  ...cubic([39, 21.6], [38.6, 24], [36.2, 25.4], [33, 25.4], 12, true),
  ...cubic([33, 25.4], [28.6, 24.6], [24.4, 24.4], [21, 24.6], 12, true),
];
const HIND_PTS: Pt[] = [...cubic([21, 22.6], [25, 22.2], [30, 23.4], [33.2, 25.4], 10), ...cubic([33.2, 25.4], [33.4, 28.6], [30, 30.4], [26.4, 29.6], 8, true), ...cubic([26.4, 29.6], [23.6, 29], [22, 27], [21, 24.6], 8, true)];
const VEIN_PTS: Pt[] = cubic([22.8, 16], [27.8, 18], [32.4, 20.8], [35.6, 23.4], 10);
// the two edges of the side-view wing (the wedge along the moth's back), as functions of height
const sortByY = (pts: Pt[]) => [...pts].sort((a, b) => a[1] - b[1]);
const WEDGE_RIGHT = sortByY(cubic([17, 12.6], [25.2, 14.4], [32, 22.8], [31.8, 33.4], 30));
const WEDGE_LEFT = sortByY(cubic([18.6, 32.2], [16.8, 25.4], [15.8, 18.4], [17, 12.6], 30));
const edgeX = (tab: Pt[], y: number) => {
  if (y <= tab[0][1]) return tab[0][0];
  for (let i = 1; i < tab.length; i++) {
    if (y <= tab[i][1]) {
      const [x0, y0] = tab[i - 1];
      const [x1, y1] = tab[i];
      return y1 === y0 ? x1 : x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
    }
  }
  return tab[tab.length - 1][0];
};
const clipRight = (poly: Pt[]): Pt[] => {
  // keep the part of a wing on its own side of the body line (x ≥ 20): the folded wing would otherwise cross it
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const ain = a[0] >= 20;
    const bin = b[0] >= 20;
    if (ain) out.push(a);
    if (ain !== bin) {
      const t = (20 - a[0]) / (b[0] - a[0]);
      out.push([20, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
};
const rotAbout = (pts: Pt[], deg: number): Pt[] => {
  const r = (deg * Math.PI) / 180;
  const cs = Math.cos(r);
  const sn = Math.sin(r);
  return pts.map(([x, y]) => [20 + (x - 20) * cs - (y - 13) * sn, 13 + (x - 20) * sn + (y - 13) * cs] as Pt);
};
const SIDE_ANT: Pt[] = [[16.4, 7.4], [17.8, 4.4], [21.2, 2.4], [26.4, 1.8]];
const TOP_ANT_R: Pt[] = [[20.8, 7.2], [23, 4.2], [27, 2.2], [33.5, 1.2]];
const TOP_ANT_L: Pt[] = [[19.2, 7.2], [17, 4.2], [13, 2.2], [6.5, 1.2]];
const antennaD = (a: Pt[], b: Pt[], t: number, k: number) => {
  const q = a.map((pt, i) => [20 + (pt[0] + (b[i][0] - pt[0]) * t - 20) * k, pt[1] + (b[i][1] - pt[1]) * t] as Pt); // k squeezes it to the drawing's width
  return `M${q[0][0].toFixed(2)} ${q[0][1].toFixed(2)}C${q[1][0].toFixed(2)} ${q[1][1].toFixed(2)} ${q[2][0].toFixed(2)} ${q[2][1].toFixed(2)} ${q[3][0].toFixed(2)} ${q[3][1].toFixed(2)}`;
};

/**
 * The moth turning from its back (top view, φ = 0) to its flank (side view, φ = 90°), drawn as one object: the wings fold
 * onto its back (they are already folded when it turns), every point of a wing swings from its place across the back to its
 * place along the wedge, the head and body shift to their side-view places, the other antenna slides behind the first, and
 * the legs come into view. The drawing is stretched WIDE across (as the top view is), so side-view widths are divided by it.
 */
function drawMorph(svg: SVGSVGElement, phi: number, wing: number, colors: MothColors) {
  void colors;
  const q = (name: string) => svg.querySelector<SVGElement>(`[data-m="${name}"]`)!;
  const cs = Math.cos(phi);
  const sn = Math.sin(phi);
  const fold = FOLD * (1 - clamp(wing, 0, 1));
  const squeeze = 1 / WIDE;
  const yMap = (y: number) => 13 + (y - 13) * (1 + 0.11 * sn); // the side-view wing is a little longer than the folded top-view wing
  const place = (pts: Pt[], side: number, withDepth: boolean): string => {
    const clipped = clipRight(pts);
    return clipped
      .map(([x, y]) => {
        const xr = x - 20;
        let xs = 20;
        if (withDepth) {
          const u = clamp(xr / (0.61 * (y - 12.6) + 0.6), 0, 1); // how far out across the back this point is
          xs = edgeX(WEDGE_LEFT, clamp(y, 12.6, 32.2)) + (edgeX(WEDGE_RIGHT, clamp(y, 12.6, 33.4)) - edgeX(WEDGE_LEFT, clamp(y, 12.6, 32.2))) * u;
        }
        return `${(20 + side * xr * cs + (xs - 20) * squeeze * sn).toFixed(2)},${yMap(y).toFixed(2)}`;
      })
      .join(" ");
  };
  const fore = rotAbout(WING_PTS, fold);
  q("wingR").setAttribute("points", place(fore, 1, true));
  q("wingL").setAttribute("points", place(fore, -1, true));
  const hindA = clamp((wing - 0.1) / 0.25, 0, 1) * clamp((0.66 - sn) / 0.2, 0, 1); // opaque until it is a sliver, then gone: never a ghost
  const hind = rotAbout(HIND_PTS, fold * 0.5);
  q("hindR").setAttribute("points", place(hind, 1, false));
  q("hindL").setAttribute("points", place(hind, -1, false));
  for (const n of ["hindR", "hindL"]) q(n).style.opacity = String(hindA);
  // the wing's vein, riding on the wing
  const veinPts = rotAbout(VEIN_PTS, fold);
  const veinD = (side: number) =>
    "M" +
    veinPts
      .map(([x, y]) => {
        const xr = x - 20;
        const u = clamp(xr / (0.61 * (y - 12.6) + 0.6), 0, 1);
        const xs = edgeX(WEDGE_LEFT, clamp(y, 12.6, 32.2)) + (edgeX(WEDGE_RIGHT, clamp(y, 12.6, 33.4)) - edgeX(WEDGE_LEFT, clamp(y, 12.6, 32.2))) * u;
        return `${(20 + side * xr * cs + (xs - 20) * squeeze * sn).toFixed(2)} ${yMap(y).toFixed(2)}`;
      })
      .join("L");
  q("veinR").setAttribute("d", veinD(1));
  q("veinL").setAttribute("d", veinD(-1));
  // body: thorax and head move to their side-view places; the long top-view abdomen gives way to the tip seen from the side
  const thorax = q("thorax");
  thorax.setAttribute("cx", (20 + (16.4 - 20) * squeeze * sn).toFixed(2));
  thorax.setAttribute("cy", (11.6 + 0.8 * sn).toFixed(2));
  thorax.setAttribute("rx", (2.7 + (2.2 * squeeze - 2.7) * sn).toFixed(2));
  thorax.setAttribute("ry", (3.2 - 0.4 * sn).toFixed(2));
  const head = q("head");
  head.setAttribute("cx", (20 + (15.6 - 20) * squeeze * sn).toFixed(2));
  head.setAttribute("cy", (7.6 + 0.8 * sn).toFixed(2));
  head.setAttribute("rx", (1.6 + (1.6 * squeeze - 1.6) * sn).toFixed(2));
  // the abdomen narrows as it rolls and stays solid; only when it is a sliver does the tip seen from the side take over
  q("abdomen").style.opacity = String(clamp((0.97 - sn) / 0.12, 0, 1));
  q("abdomen").setAttribute("transform", `translate(${((16.4 - 20) * squeeze * sn).toFixed(2)} 0) translate(20 0) scale(${(1 - 0.45 * sn).toFixed(3)} 1) translate(-20 0)`);
  q("tip").style.opacity = String(clamp((sn - 0.8) / 0.15, 0, 1));
  // antennae: both reach out in top view; seen from the side the far one hides behind the near one
  q("antR").setAttribute("d", antennaD(TOP_ANT_R, SIDE_ANT, sn, 1 + (squeeze - 1) * sn));
  q("antL").setAttribute("d", antennaD(TOP_ANT_L, SIDE_ANT, sn, 1 + (squeeze - 1) * sn));
  q("antL").style.opacity = String(Math.pow(cs, 1.5));
  q("legs").style.opacity = String(clamp((sn - 0.45) / 0.35, 0, 1));
}

/** The painting sections' moth, in all the positions between top view and side view. Drawn by `drawMorph`. */
function MothMorph({ size, colors }: { size: number; colors: MothColors }) {
  const feeler = feelerOf(colors);
  const vein = veinOf(colors);
  return (
    <svg data-morph width={size * WIDE} height={size} viewBox="0 0 40 40" preserveAspectRatio="none" aria-hidden="true" style={{ overflow: "visible", display: "block" }}>
      <g fill="none" {...feeler}>
        <path data-m="legs" transform="translate(20 0) scale(0.714 1) translate(-20 0)" d="M15.6 13.4L12.8 12.8L10.8 15M15.9 17.4L12.9 17.2L10.8 19.6M16.5 21.6L13.6 22.2L11.4 24.6" style={{ opacity: 0 }} />
        <path data-m="antR" d="M20.8 7.2C23 4.2 27 2.2 33.5 1.2" />
        <path data-m="antL" d="M19.2 7.2C17 4.2 13 2.2 6.5 1.2" />
      </g>
      <path data-m="abdomen" d="M18.3 13C18 18 18.6 24 20 31.4C21.4 24 22 18 21.7 13Z" fill={colors.deep} />
      <path data-m="tip" transform="translate(20 0) scale(0.714 1) translate(-20 0)" d="M19.4 31.4L21 36L23.4 32Z" fill={colors.deep} style={{ opacity: 0 }} />
      <polygon data-m="hindR" fill={colors.hind} style={{ opacity: 0 }} />
      <polygon data-m="hindL" fill={colors.hind} style={{ opacity: 0 }} />
      <polygon data-m="wingR" fill={colors.grey} />
      <polygon data-m="wingL" fill={colors.grey} />
      <g fill="none" {...vein}>
        <path data-m="veinR" />
        <path data-m="veinL" />
      </g>
      <ellipse data-m="thorax" cx="20" cy="11.6" rx="2.7" ry="3.2" fill={colors.deep} />
      <ellipse data-m="head" cx="20" cy="7.6" rx="1.6" ry="1.6" fill={colors.deep} />
    </svg>
  );
}

/* ------------------------------------------------------------------ roaming moth */

type Mode = "wake" | "aim" | "crouch" | "fly" | "settle" | "roll" | "walk" | "rest" | "grab";
type Wall = "L" | "R" | null;
/**
 * One stroke of watercolour: its own off-screen canvas, painted into as the moth walks and shown with a fade once it has
 * finished. A stroke is one colour (the moth uses the three swatches one after another); the wash varies only in how
 * much water and pigment is in it.
 */
type Wash = { id: number; cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; rgb: string; rgbDark: string; seed: number; gain: number; endT: number | null };
/** The top edge of something on the page that the moth can stand on: the input box, a reply, a question. */
type Ledge = { el: HTMLElement; kind: string; side: boolean; x0: number; x1: number; y: number };
type Spot = { x: number; y: number; wall: Wall; ledge?: Ledge; dir?: 1 | -1; user?: boolean };
export type MothSignal = { kind: "send" | "reply"; id: number };

const SIZE_BASE = 28; // moth height in px, the same as the icon it flies out of
const SIZE_SCENE = 32; // in a painting section the moth is 2px larger on every side
/** The moths in one painting section, so they keep out of each other's way and a press goes to the nearer one. */
type Mate = { pos: { x: number; y: number }; goal: () => { x: number; y: number } | null };
const swarm = new WeakMap<HTMLElement, Set<Mate>>();
const DAB_GAP = 2.2; // px of travel between touches of the wash
const HOLD = 6; // seconds a finished stroke keeps its colour…
const FADE = 10; // …and then it fades away over this long
const LIFE = HOLD + FADE;
const WALL_C0 = 7.4; // moth centre's distance from the wall it clings to: its leg tips (6.4px out from its middle) touch the edge
const LAND_C0 = 25; // …and from the wall where it lands before rolling onto it (its wings stay inside the panel)
const PERCH0 = 6.3; // how far from an edge the side-on moth's centre sits: its leg tips (6.4px out from its middle) touch it
const PERCH_TOP = 13; // …and the top-view moth's centre above the top of plain text

/** Smooth 1-D value noise in 0..1: the same seed and x always give the same value. */
function noise(seed: number, x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const hash = (n: number) => {
    const v = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const t = f * f * (3 - 2 * f);
  return hash(i) + (hash(i + 1) - hash(i)) * t;
}

/**
 * Lays one cross-section of watercolour wash at (cx, cy), across the line of travel (unit normal nx, ny), `half` wide.
 * Like real wash it is made of overlapping soft clouds of thin pigment, so the density wanders; the pigment pools a
 * little darker towards the wet edges and in the odd spot; the edge itself wanders; paper grain and "backruns" (pale
 * patches where water pushed the pigment away) lighten it here and there. `env` is 0 at either end of the stroke and 1
 * in the middle: the colour fades to nothing at both ends, so they merge into the page.
 */
function washBar(wc: CanvasRenderingContext2D, wash: Wash, cx: number, cy: number, nx: number, ny: number, half: number, env: number, travelled: number) {
  const envA = Math.pow(env, 1.1);
  if (envA < 0.02 || half < 0.5) return;
  const { rgb, rgbDark, seed } = wash;
  const h = half * (0.62 + 0.8 * noise(seed, travelled * 0.045)); // the wash swells and narrows
  const meander = (noise(seed + 3, travelled * 0.03) - 0.5) * h * 0.7; // …and its middle drifts from side to side
  const mx = cx + nx * meander;
  const my = cy + ny * meander;
  const dens = (0.45 + 0.9 * noise(seed + 7, travelled * 0.03)) * wash.gain; // thicker and thinner stretches
  const bias = noise(seed + 11, travelled * 0.035); // which side the pigment has drifted to
  const blob = (x: number, y: number, r: number, a: number, col: string) => {
    const g = wc.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${col},${a})`);
    g.addColorStop(1, `rgba(${col},0)`);
    wc.fillStyle = g;
    wc.beginPath();
    wc.arc(x, y, r, 0, Math.PI * 2);
    wc.fill();
  };
  // the body: overlapping soft clouds of thin pigment, leaning towards the side the pigment drifted to
  for (let i = 0; i < 7; i++) {
    const t = (Math.random() * 2 - 1) * h * 0.85 + (bias - 0.5) * h * 0.5;
    blob(mx + nx * t, my + ny * t, h * (0.3 + Math.random() * 0.9), (0.02 + Math.random() * 0.024) * dens * envA, rgb);
  }
  // the wet edges, where pigment collects, darker on the side it drifted to
  for (const side of [1, -1]) {
    const weight = side > 0 ? bias : 1 - bias;
    const t = side * h * (0.84 + 0.16 * noise(seed + side * 3, travelled * 0.1));
    blob(mx + nx * t, my + ny * t, Math.max(1.4, h * 0.2), 0.045 * dens * envA * (0.4 + 1.2 * weight), rgb);
  }
  // a feathered, blotchy bleed just beyond the edge, so the outline is never clean
  for (let i = 0; i < 3; i++) {
    const t = (Math.random() < 0.5 ? -1 : 1) * h * (1 + Math.random() * 0.35);
    blob(mx + nx * t, my + ny * t, 1.2 + Math.random() * 2.8, 0.02 * envA, rgb);
  }
  // here and there pigment has gathered in a darker spot
  if (half > 6 && Math.random() < 0.05) {
    const t = (Math.random() * 2 - 1) * h * 0.5;
    blob(mx + nx * t, my + ny * t, h * (0.15 + Math.random() * 0.15), 0.07 * envA, rgbDark);
  }
  // paper grain: tiny pale flecks where the paper's tooth refused the paint, and the odd dark one where it pooled
  wc.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 5; i++) {
    const t = (Math.random() * 2 - 1) * h;
    wc.globalAlpha = 0.3 * envA * Math.random();
    wc.fillStyle = "#000";
    wc.fillRect(mx + nx * t - 0.5, my + ny * t - 0.5, 0.5 + Math.random() * 0.9, 0.5 + Math.random() * 0.9);
  }
  wc.globalAlpha = 1;
  // a backrun: water pushed the pigment away, leaving a pale patch with a faint darker rim
  if (half > 6 && Math.random() < 0.05) {
    const t = (Math.random() * 2 - 1) * h * 0.5;
    const r = h * (0.35 + Math.random() * 0.4);
    blob(mx + nx * t, my + ny * t, r, 0.22 * envA, "0,0,0");
    wc.globalCompositeOperation = "source-over";
    wc.strokeStyle = `rgba(${rgb},${0.07 * envA})`;
    wc.lineWidth = 1.1;
    wc.beginPath();
    wc.arc(mx + nx * t, my + ny * t, r * 0.95, 0, Math.PI * 2);
    wc.stroke();
  }
  wc.globalCompositeOperation = "source-over";
  if (Math.random() < 0.25) {
    wc.fillStyle = `rgba(${rgbDark},${0.16 * envA})`;
    const t = (Math.random() * 2 - 1) * h * 0.9;
    wc.fillRect(mx + nx * t, my + ny * t, 0.5 + Math.random() * 0.7, 0.5 + Math.random() * 0.7);
  }
}

/**
 * When the panel opens, the moth that is the icon in the panel header wakes up, turns to face where it is going and
 * hops to the middle of the assistant first, then on to other places: the top edge of the heading, a question or a
 * reply, the top edge of the input box, high up, or onto the left divider or right screen edge. When the user sends
 * a question it flies to the top of the input box and walks along it while Nivvi thinks; when the answer arrives it
 * flies to the top of the answer's text. Hops are wings beating, no paint. On a ledge or in the open it folds its
 * wings, turns to face its way and walks a short way, head first, painting. On a wall it comes down turning onto its
 * side as it lands, clings, and crawls upwards, painting. It only ever moves forwards, and every change of pose
 * eases from the one before: it turns on the spot, crouches, springs, and squashes a little as it lands. The paint
 * thins and fades by itself. `active` is true while the panel is open; each opening starts again. With reduced
 * motion it simply sits above the input box.
 */
export default function MothTrail({
  active,
  busy = false,
  signal,
  scene = false,
  colors = MOTH_COLORS,
  paint,
  paintGain = 1,
  star: showStar = true,
  startAt = 0.5,
  startY = 0.5,
  wakeDelay = 0,
}: {
  active: boolean;
  busy?: boolean;
  signal?: MothSignal;
  /** A painting section instead of the assistant: the moth's world is the whole box, with its top and bottom edges as ledges. */
  scene?: boolean;
  colors?: MothColors;
  /** The one colour every stroke uses (r,g,b); the assistant uses the three swatches one after another. */
  paint?: [number, number, number];
  /** How strong the wash is: more for pale paint on a dark ground. */
  paintGain?: number;
  star?: boolean;
  /** In a scene: where across the section the moth starts (0–1), and how long after the others it wakes. */
  startAt?: number;
  startY?: number;
  wakeDelay?: number;
}) {
  // everything that depends on the moth's size is worked out from it here, so the assistant (the base size) is unchanged
  const SIZE = scene ? SIZE_SCENE : SIZE_BASE;
  const K = SIZE / SIZE_BASE;
  const BOX_W = SIZE * WIDE;
  const STAR = SIZE * 0.32; // the AI star above the moth: square
  const WALL_C = WALL_C0 * K;
  const LAND_C = LAND_C0 * K;
  const PERCH = PERCH0 * K;
  const canvas = useRef<HTMLCanvasElement>(null);
  const shadowEl = useRef<HTMLDivElement>(null);
  const starEl = useRef<HTMLDivElement>(null);
  const hitEl = useRef<HTMLDivElement>(null);
  const mothEl = useRef<HTMLDivElement>(null);
  const turnEl = useRef<HTMLDivElement>(null);
  const sideFace = useRef<HTMLDivElement>(null);
  const busyRef = useRef(busy);
  busyRef.current = busy;
  const signalRef = useRef(signal);
  signalRef.current = signal;

  useEffect(() => {
    const cv = canvas.current;
    const sh = shadowEl.current;
    const star = starEl.current;
    const hit = hitEl.current;
    const el = mothEl.current;
    const turner = turnEl.current;
    const sface = sideFace.current;
    const topSvg = el?.querySelector<SVGSVGElement>("[data-top] svg");
    const topFace = el?.querySelector<HTMLElement>("[data-top]");
    const morphSvg = sface?.querySelector<SVGSVGElement>("svg[data-morph]") ?? null;
    const morphWrap = sface?.querySelector<HTMLElement>("[data-morphwrap]") ?? null;
    const sideWrap = sface?.querySelector<HTMLElement>("[data-sidewrap]") ?? null;
    const host = cv?.closest("[data-moth-host]") as HTMLElement | null;
    if (!active || !cv || !sh || !star || !hit || !el || !turner || !sface || !topSvg || !topFace || !host) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const palette: [number, number, number][] = paint ? [paint] : PALETTE;
    if (!showStar) star.style.display = "none";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dprPx = 1; // the pixel ratio the canvases are drawn at
    const fit = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, scene ? 1.25 : 2); // a section is big: its canvases stay a sensible size
      w = host.offsetWidth || r.width;
      h = host.offsetHeight || r.height;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dprPx = dpr;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const ease = (t: number) => t * t * (3 - 2 * t);
    const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
    // where the moth may go in the open: below the header, above the input box
    const form = () => host.querySelector("form") as HTMLElement | null;
    const topY = () => (scene ? 26 * K : 57 + 36);
    const botY = () => (scene ? h - 26 * K : (form()?.offsetTop ?? h - 90) - 16);
    // the moth keeps mostly to the open space above the text; the bottom strip is visited only now and then
    const calmY = () => topY() + (botY() - topY()) * (scene ? 0.85 : 0.6);
    // against a wall the moth sits as close as its width allows: wide in top view, slim on its side, so as it rolls it
    // slides in towards the wall (or out from it as it comes off) only as fast as it narrows (or widens)
    const wallXFor = (side: Exclude<Wall, null>, rv: number) => {
      const th = (Math.PI / 2) * ease(clamp(rv, 0, 1));
      const need = Math.max(WALL_C, (BOX_W / 2) * Math.cos(th) + 5 * K);
      return side === "L" ? need : w - need;
    };
    // the same for an edge it stands on (the top of the input or a message box, or the top boundary): in top view it is as wide
    // as its wings, so it comes down beside the edge and slides in to it only as fast as it narrows onto its side
    const ledgeYFor = (L: Ledge, rv: number) => {
      const th = (Math.PI / 2) * ease(clamp(rv, 0, 1));
      const need = Math.max(PERCH, (BOX_W / 2) * Math.cos(th) + 5 * K);
      return L.kind === "ceiling" ? L.y - PERCH + need : L.y + PERCH - need;
    };
    const mates = () => (scene ? [...(swarm.get(host) ?? [])].filter((m) => m !== me) : []);
    const clingX = (side: Exclude<Wall, null>) => (side === "L" ? WALL_C : w - WALL_C);
    const landX = (side: Exclude<Wall, null>) => (side === "L" ? LAND_C : w - LAND_C);

    /* ledges: the top edges of the page's own elements, tracked live so the moth rides along when the chat scrolls */
    const scroller = () => host.querySelector<HTMLElement>(".overflow-y-auto");
    const measure = (e: HTMLElement, kind: string): Ledge | null => {
      if (scene) {
        // the section's own edges: it hangs from the top edge and stands on the bottom one
        if (kind === "ceiling") return { el: host, kind, side: true, x0: 0, x1: w, y: PERCH };
        if (kind === "composer") return { el: host, kind, side: true, x0: 0, x1: w, y: h - PERCH };
        return null;
      }
      const hr = host.getBoundingClientRect();
      const r = e.getBoundingClientRect();
      if (kind === "ceiling") return { el: e, kind, side: true, x0: 0, x1: hr.width, y: r.bottom - hr.top + PERCH }; // hangs from the header line
      if (kind !== "composer") {
        const sc = scroller()?.getBoundingClientRect();
        if (sc && (r.top < sc.top + 18 || r.top > sc.bottom - 24)) return null; // scrolled out of view
      }
      if (r.width < 70) return null;
      // boxes (the input, a question bubble) are stood on, side-on; plain text is not, so there it walks in top view
      const side = kind === "composer" || kind === "box";
      return { el: e, kind, side, x0: r.left - hr.left, x1: r.right - hr.left, y: r.top - hr.top - (side ? PERCH : PERCH_TOP) };
    };
    const last = (sel: string) => {
      const all = host.querySelectorAll<HTMLElement>(sel);
      return all.length ? all[all.length - 1] : null;
    };
    const findLedge = (kind: "composer" | "reply" | "question" | "ceiling"): Ledge | null => {
      if (scene) return kind === "ceiling" || kind === "composer" ? measure(host, kind) : null;
      const e =
        kind === "composer" ? last('[data-ledge="composer"]')
        : kind === "ceiling" ? last('[data-ledge="ceiling"]')
        : last('[data-ledge="msg-u"]'); // "reply" and "question": the top of your last question
      return e ? measure(e, e.dataset.ledge === "composer" ? "composer" : e.dataset.ledge === "ceiling" ? "ceiling" : "box") : null;
    };
    // a place on a ledge to land, facing along it with room to walk ahead (the way it arrives from)
    const spotOn = (l: Ledge, from: { x: number; y: number }): Spot => {
      let x = rand(l.x0 + 28, Math.max(l.x0 + 29, l.x1 - 28));
      let dir: 1 | -1 = x >= from.x ? 1 : -1;
      const room = dir > 0 ? l.x1 - 16 - x : x - (l.x0 + 16);
      if (room < 70) {
        x = dir > 0 ? rand(l.x0 + 28, l.x0 + (l.x1 - l.x0) * 0.5) : rand(l.x0 + (l.x1 - l.x0) * 0.5, l.x1 - 28);
        dir = x >= from.x ? 1 : -1;
      }
      return { x, y: l.y, wall: null, ledge: l, dir };
    };

    let firstHop = true;
    let lastZone = "";
    let userAt: { x: number; y: number } | null = null; // where the user last pressed: the moth goes there
    let banFirst = false; // set for the very first pick: no centre, no top boundary
    let pending: "composer" | "reply" | "centre" | "user" | null = null; // the user sent a question / an answer arrived: go there next
    // The moth lives mostly on the assistant's boundaries and boxes, side-on: the top boundary (hanging from the header
    // line), the left and right boundaries, the top of your last question, and the top of the input box. Now and then it
    // strolls through the middle, in top view. It does not stop at the same kind of place twice running.
    const pickSpot = (from: { x: number; y: number }): Spot => {
      const t = topY();
      const c = calmY();
      const b = Math.max(t + 60, botY());
      const midY = () => rand(t + (b - t) * 0.22, c); // the middle band: not hugging the top
      if (pending === "user" && !userAt) pending = null;
      if (pending === "user" && userAt) {
        // the user pressed somewhere: the moth goes to that spot, on whatever is there (a wall, a box edge, the top
        // boundary) or, in the open, lands and strolls
        const at = userAt;
        userAt = null;
        pending = null;
        lastZone = "user";
        const hr = host.getBoundingClientRect();
        if (at.x < 36) return { x: landX("L"), y: clamp(at.y, t + 60, Math.max(t + 80, b)), wall: "L", user: true };
        if (at.x > w - 36) return { x: landX("R"), y: clamp(at.y, t + 60, Math.max(t + 80, b)), wall: "R", user: true };
        for (const kind of ["composer", "question", "ceiling"] as const) {
          const l = findLedge(kind);
          if (!l) continue;
          // dropped on a box's edge, or anywhere inside the box (it stands on the top edge of the box it is dropped in)
          const er = l.el.getBoundingClientRect();
          const lineY = kind === "ceiling" ? l.y - PERCH : l.y + PERCH;
          const nearEdge = Math.abs(at.y - lineY) < 28;
          const inside = !scene && kind !== "ceiling" && at.y >= er.top - hr.top && at.y <= er.bottom - hr.top;
          if ((nearEdge || inside) && at.x > l.x0 - 12 && at.x < l.x1 + 12)
            return { x: clamp(at.x, l.x0 + 28, Math.max(l.x0 + 29, l.x1 - 28)), y: l.y, wall: null, ledge: l, dir: at.x >= from.x ? 1 : -1, user: true };
        }
        // in the open: exactly where it was dropped (a margin clear of the edges so it stays whole)
        return { x: clamp(at.x, 26, w - 26), y: clamp(at.y, 26, h - 26), wall: null, user: true };
      }
      if (pending === "centre" && scene) {
        // the answer arrived: it comes out into the middle of the chat and paints there, a few strokes
        pending = null;
        lastZone = "centre";
        return { x: clamp(w * 0.5 + rand(-w * 0.2, w * 0.2), 40, w - 40), y: midY(), wall: null };
      }
      if (pending && pending !== "user") {
        const l = findLedge(pending === "centre" || pending === "reply" ? "composer" : pending); // a question is sent: the input box; or back to your question
        pending = null;
        if (l) {
          lastZone = l.kind;
          return spotOn(l, from);
        }
      }
      const convo = !!host.querySelector('[data-ledge="msg-u"]');
      if (firstHop) {
        // out of the header it swoops to somewhere different each time (never the top boundary or the middle first): a
        // side boundary, or the input box, picked below like any other hop
        firstHop = false;
        lastZone = scene ? "" : "ceiling";
        banFirst = !scene; // …and not the middle either: the first stop is a side boundary or the input box (a section: anywhere)
      }
      for (let n = 0; n < 40; n++) {
        let s: Spot | null = null;
        let zone = "";
        const z = rand(0, 10);
        // every kind of place gets an equal share of its stops: in a chat the six are the top boundary, the left and right
        // boundaries, the input box, your last question's box and the open middle; without a chat, the same without the box
        if (convo) {
          // the assistant's moth keeps to the edges and the boxes: it never goes out into the open middle
          if (z < 2.5) { zone = "composer"; const l = findLedge("composer"); s = l && spotOn(l, from); } // above the input box
          else if (z < 5) { zone = "ceiling"; const l = findLedge("ceiling"); s = l && spotOn(l, from); } // the top boundary
          else if (z < 7.5) { zone = "L"; s = { x: landX("L"), y: midY(), wall: "L" }; } // the left boundary
          else { zone = "R"; s = { x: landX("R"), y: midY(), wall: "R" }; } // the right boundary
        } else if (scene) {
          // a painting section: the four edges together take about a third of its stops, the inside the rest, anywhere across it
          if (z < 0.875) { zone = "L"; s = { x: landX("L"), y: midY(), wall: "L" }; }
          else if (z < 1.75) { zone = "R"; s = { x: landX("R"), y: midY(), wall: "R" }; }
          else if (z < 2.625) { zone = "ceiling"; const l = findLedge("ceiling"); s = l && spotOn(l, from); }
          else if (z < 3.5) { zone = "composer"; const l = findLedge("composer"); s = l && spotOn(l, from); } // the bottom edge
          else { zone = "centre"; s = { x: rand(w * 0.1, w * 0.9), y: rand(topY() + (botY() - topY()) * 0.08, topY() + (botY() - topY()) * 0.92), wall: null }; } // inside
        } else {
          if (z < 2.5) { zone = "L"; s = { x: landX("L"), y: midY(), wall: "L" }; }
          else if (z < 5) { zone = "R"; s = { x: landX("R"), y: midY(), wall: "R" }; }
          else if (z < 7.5) { zone = "ceiling"; const l = findLedge("ceiling"); s = l && spotOn(l, from); }
          else { zone = "composer"; const l = findLedge("composer"); s = l && spotOn(l, from); }
        }
        if (banFirst && (zone === "centre" || zone === "ceiling")) continue;
        const crowded = scene && mates().some((m) => {
          const g = m.goal();
          return Math.hypot(s!.x - m.pos.x, s!.y - m.pos.y) < 130 || (!!g && Math.hypot(s!.x - g.x, s!.y - g.y) < 130);
        });
        if (s && !crowded && (zone !== lastZone || (scene && zone === "centre")) && Math.hypot(s.x - from.x, s.y - from.y) > 130) {
          lastZone = zone;
          banFirst = false;
          return s;
        }
      }
      const l = findLedge("ceiling");
      return l ? spotOn(l, from) : { x: w * 0.5, y: topY(), wall: null };
    };

    const mark = host.querySelector<HTMLElement>(".nivvi-mark");
    const pos = scene ? { x: w * startAt, y: h * startY } : mark ? { x: mark.offsetLeft + mark.offsetWidth / 2, y: mark.offsetTop + mark.offsetHeight / 2 } : { x: 34, y: 28 };
    const start = { x: pos.x, y: pos.y };
    let away = false; // the moth has left the header
    let mode: Mode = "wake";
    let heading = -Math.PI / 2; // head up, as the icon sits
    let p = 0; // wings, 0 folded … 1 spread
    let pt = 0; // where they are heading
    let pv = 0; // …and how fast they are moving: a spring, so they overshoot a touch and settle like real wings
    let roll = 0; // 0 top view … 1 on its side, clinging to a wall
    let rollVis = 0; // the roll as drawn: it follows `roll` on a lightly under-damped spring, so a landing settles with a small wobble
    let rollW = 0;
    let headV = 0; // how fast it is turning (rad/s)
    let wall: Wall = null; // the wall it is clinging to
    // In a section, the left and right walls use the one drawing that turns (MothMorph); the top and bottom edges use exactly
    // what the assistant does (the top-view icon rolls and cross-fades into the side-view icon). Chosen while it is in the air.
    let useMorph = false;
    let morphNext = false;
    let sideNext: Exclude<Wall, null> = "R"; // the side it will land on: taken up once it is in the air and in top view, so it never flips while it is still on its side
    let rollSide: Exclude<Wall, null> = "R"; // …or last was, so the roll turns the right way while it peels off
    let ledge: Ledge | null = null; // the ledge it is standing on
    let timer = scene ? 0.15 + wakeDelay * 0.3 : 1 + wakeDelay; // seconds until the next thing happens
    let first = true; // the first flight, out of the header: slow, with a clear lift-off
    let lostPerch = false; // its perch scrolled away or was removed: it takes off from mid-air
    let aimT = 0;
    let strokeLen = 0;
    let sinceDab = 0;
    let strokeTotal = 1; // length of the stroke in progress, for the pressure taper
    let dabIndex = 0;
    const markScale = mark ? clamp(mark.offsetHeight / SIZE, 0.5, 1) : 1; // it starts at the header icon's size
    let scale = markScale;
    let starX = 0;
    let starY = 0;
    let starSeen = false;
    let lastPlace = performance.now();
    let squash = 0; // a little squash as it lands
    let lift = 0; // 0 on the ground … 1 at the top of a hop: drives the shadow
    let clung = false; // on a wall: rest, then crawl, then rest, then leave
    let walkHeading = 0;
    let walkT = 0; // seconds into a walk
    let lowWalk = false; // this walk is in the strip above the input box
    let moreStrolls = 0; // after landing in the open middle: how many more strolls to take before leaving
    let shiver = 0;
    let shiverAt = rand(1.5, 3);
    let handled = signalRef.current?.id;
    // A press anywhere in the assistant that is not a button, link or the input sends the moth there, with a faint ripple.
    const ripples: { x: number; y: number; t: number }[] = [];
    let grabTo: { x: number; y: number } | null = null; // while the moth is held: where the pointer is
    let pressAt: { x: number; y: number } | null = null; // where the pointer went down, until it is let go
    const rel = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const k = r.width ? host.offsetWidth / r.width : 1; // a scene is drawn small and scaled up: back to its own pixels
      return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
    };
    // After the moth has been carried, the click that follows the release must not press a button under the pointer.
    const swallowClick = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    };
    /** Pick the moth up: it follows the pointer, wings beating. It makes no paint while it is carried. */
    const startGrab = (at: { x: number; y: number }) => {
      mode = "grab";
      grabTo = at;
      next = null;
      jump = null;
      wall = null;
      ledge = null;
      pending = null;
      userAt = null;
      pt = 0.85;
      host.style.userSelect = "none";
      strokeLen = 0;
      host.setAttribute("data-moth-away", "");
    };
    const onMove = (e: PointerEvent) => {
      const at = rel(e);
      if (mode === "grab") grabTo = at;
      else if (pressAt && Math.hypot(at.x - pressAt.x, at.y - pressAt.y) > 10) startGrab(at); // pressed anywhere and moved: it follows
    };
    const onUp = (e: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("selectstart", noSelect);
      window.removeEventListener("dragstart", noSelect);
      host.style.userSelect = "";
      pressAt = null;
      if (mode !== "grab") return;
      strokeLen = 0;
      // let go: it settles where it was dropped: on a wall or box edge if it was dropped there, else in the open
      userAt = rel(e);
      grabTo = null;
      ripples.push({ x: userAt.x, y: userAt.y, t: performance.now() });
      pending = "user";
      lostPerch = true; // it takes off from mid-air, no crouch
      mode = "rest";
      timer = 0;
      window.addEventListener("click", swallowClick, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener("click", swallowClick, true), 400);
    };
    const noSelect = (e: Event) => e.preventDefault();
    const listen = () => {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      window.addEventListener("selectstart", noSelect);
      window.addEventListener("dragstart", noSelect);
    };
    // the moth's own hit area (it follows the moth): a press here picks it up, with pointer capture so the drag keeps going
    // over everything else and, on touch screens, does not scroll the chat
    const onHitDown = (e: PointerEvent) => {
      if (e.button !== 0 || mode === "wake") return;
      e.stopPropagation();
      e.preventDefault();
      try {
        hit.setPointerCapture(e.pointerId);
      } catch {
        /* capture is a nicety */
      }
      listen();
      startGrab(rel(e));
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const at = rel(e);
      const onMoth = Math.hypot(at.x - pos.x, at.y - pos.y) < 30 && mode !== "wake";
      // a press on the moth always picks it up, even when it is over a button or the input; elsewhere, buttons, links and
      // the input keep their normal behaviour
      if (!onMoth && (e.target as HTMLElement | null)?.closest("button, a, textarea, input, select, [role='button']")) return;
      if (scene && !onMoth) {
        // two moths share the section: a press on an empty spot goes to the nearer one only
        const mine = Math.hypot(at.x - pos.x, at.y - pos.y);
        if (mates().some((m) => Math.hypot(at.x - m.pos.x, at.y - m.pos.y) < mine)) return;
      }
      listen();
      if (onMoth) {
        startGrab(at);
        e.preventDefault();
        return;
      }
      // pressed on an empty spot: the moth goes there; if the pointer then moves, the moth follows it, spraying
      pressAt = at;
      userAt = at;
      ripples.push({ x: at.x, y: at.y, t: performance.now() });
    };
    if (!reduced) {
      host.addEventListener("pointerdown", onDown);
      hit.addEventListener("pointerdown", onHitDown);
    }
    let t0 = performance.now();
    let raf = 0;
    const washes: Wash[] = [];
    let strokeCount = 0; // which swatch the next stroke uses: they come one after another
    let strokeId = 0;
    type Jump = { sx: number; sy: number; tx: number; ty: number; cx: number; cy: number; dur: number; t: number; to: Spot; first: boolean; air: boolean; lift0: number; scale0: number };
    let next: Jump | null = null; // the hop being prepared (the moth turns to face it first)
    let jump: Jump | null = null;
    // in a section there are two moths: each knows where the other is going, and a press goes to the nearer one
    const me: Mate = { pos, goal: () => (jump ? { x: jump.tx, y: jump.ty } : next ? { x: next.tx, y: next.ty } : null) };
    if (scene) {
      const set = swarm.get(host) ?? new Set<Mate>();
      set.add(me);
      swarm.set(host, set);
    }

    host.setAttribute("data-moth-out", ""); // the header icon hides: the moth is standing in for it
    el.style.opacity = "1";
    star.style.opacity = "1";

    // Turn towards `target`: a spring, so the moth eases into the turn, can swing a hair past and settles back, the way a
    // body turning on the spot does (omega is how brisk it is).
    const turn = (target: number, dt: number, omega: number) => {
      const k = omega * omega;
      const c = 2 * 0.78 * omega;
      for (let rem = dt; rem > 0; rem -= 0.016) {
        const hh = Math.min(rem, 0.016);
        headV += (wrap(target - heading) * k - headV * c) * hh;
        headV = clamp(headV, -9, 9);
        heading += headV * hh;
      }
    };

    const place = (now: number) => {
      const perched = !!wall || (!!ledge?.side && roll > 0.5); // on its side: on a wall, or standing on a box
      const flap = mode === "fly" || mode === "grab" ? clamp((p - 0.5) / 0.3, 0, 1) * 0.22 * Math.sin((now / 1000) * Math.PI * 2 * 7) : 0;
      const breathe = mode === "walk" && !perched ? 0.04 * Math.sin(now / 320) : 0;
      const quiver = mode === "rest" && !perched ? 0.1 * shiver * Math.sin(now / 38) : 0;
      // turning on the spot, the wings flutter a little for balance, more the faster it turns
      const turning = mode === "aim" || mode === "settle" ? Math.min(1, Math.abs(headV) / 2.5) * 0.09 * Math.sin(now / 45) : 0;
      const wingNow = clamp(p + flap + breathe + quiver + turning, 0, 1);
      setMothOpen(topSvg, wingNow);
      // the roll turns it about its own body line: its back faces you at 0, its flank faces you at 1
      const dirn = rollSide === "L" ? 1 : -1;
      // …and as it comes over it tilts towards you (rotateX) at the half-way point, like a body rolling, and the two views
      // cross-fade while they are both foreshortened, so there is no moment when it is a thin line or doubled
      const rv = clamp(rollVis, -0.08, 1.1);
      const frac = useMorph ? clamp(rv, 0, 1) : rv >= 0 && rv <= 1 ? ease(rv) : rv; // a section: the roll is already eased (in the hop, and by the spring), so it is not eased a third time
      const angle = 90 * dirn * frac;
      const deg = Math.abs(angle);
      if (morphWrap && sideWrap) {
        morphWrap.style.display = useMorph ? "" : "none";
        sideWrap.style.display = useMorph ? "none" : "";
      }
      el.style.perspective = useMorph ? "420px" : "200px";
      if (useMorph) {
        // a painting section: no swap between two drawings. Once it starts to turn, the one drawing (MothMorph) is shown, and it
        // goes from its back to its flank continuously; it is mirrored for the right-hand wall or a heading to the right
        // the first few degrees cross-fade the icon drawing into the morph (they are the same moth from above), so there is no pop
        const mix = ease(clamp(frac / 0.14, 0, 1));
        turner.style.transform = "none";
        topFace.style.opacity = String(1 - mix);
        sface.style.opacity = mix > 0.001 ? String(mix) : "0";
        sface.style.transform = rollSide === "R" ? "scaleX(-1)" : "none";
        if (mix > 0.001 && morphSvg) drawMorph(morphSvg, (Math.PI / 2) * clamp(frac, 0, 1), wingNow, colors);
      } else {
        turner.style.transform = `rotateX(${(-5 * Math.sin(Math.PI * clamp(frac, 0, 1))).toFixed(1)}deg) rotateY(${angle.toFixed(1)}deg)`;
        sface.style.transform = rollSide === "L" ? "rotateY(-90deg)" : "rotateY(90deg) scaleX(-1)";
        // In a section the swap happens where the top view (cos θ of its width) and the side view (sin θ of its) are equally wide,
        // about 55°, so there is no jump in size, and the blend is short so there is no ghost of the other view.
        topFace.style.opacity = String(clamp((60 - deg) / 18, 0, 1));
        sface.style.opacity = String(clamp((deg - 42) / 18, 0, 1));
      }
      const sway = mode === "walk" && !perched ? Math.sin(now / 240) * 0.05 : 0;
      const bob = mode === "walk" && perched ? Math.sin(now / 120) * 0.5 : 0; // a walking step
      // the wrapper only moves (so the shadow always falls straight down); the moth turns inside it
      sh.style.transform = `translate3d(${pos.x - BOX_W / 2}px, ${pos.y - SIZE / 2 + bob}px, 0)`;
      hit.style.transform = `translate3d(${pos.x - 24 * K}px, ${pos.y - 24 * K + bob}px, 0)`;
      hit.style.cursor = mode === "grab" ? "grabbing" : "grab";
      sh.style.filter = scene ? lift < 0.01 ? "none" : `drop-shadow(0 ${(lift * 9).toFixed(1)}px ${(lift * 5).toFixed(1)}px rgba(57,54,54,${(0.22 * lift).toFixed(3)}))` : lift > 0.04 ? `drop-shadow(0 ${(lift * 9).toFixed(1)}px ${(lift * 5).toFixed(1)}px rgba(57,54,54,${(0.08 + 0.14 * lift).toFixed(2)}))` : "none";
      el.style.transform = `rotate(${heading + Math.PI / 2 + sway}rad) scale(${scale * (1 - 0.07 * squash)})`;
      // The AI star has one fixed place: centred just above the moth's highest point, upright whatever way the moth is
      // turned, so it never swings round behind the moth or catches on an antenna. That highest point is worked out from
      // the moth's real extent (wide in top view, slim on its side), turned by its heading.
      const k = scale * (1 - 0.07 * squash);
      const theta = heading + Math.PI / 2 + sway;
      const hx = (19.6 + (9.5 - 19.6) * ease(clamp(rollVis, 0, 1))) * k; // half its width, top view → on its side
      const hy = 14 * k; // half its length
      const reach = Math.abs(Math.cos(theta)) * hy + Math.abs(Math.sin(theta)) * hx; // how far up it reaches from its middle
      let tx = clamp(pos.x, 9, w - 9);
      let ty = pos.y + bob - reach - 4.5 - STAR / 2;
      if (ledge?.kind === "ceiling" && roll > 0.5 && !wall) {
        // hanging from the header line there is no room above it without crossing the line: the star sits just under the
        // line, ahead of the moth's head, so it stays inside the assistant and still at the moth's top
        const ahead = Math.cos(heading) >= 0 ? 1 : -1;
        tx = clamp(pos.x + ahead * (hy + 9), 9, w - 9);
        ty = pos.y - PERCH + 4 + STAR / 2;
      }
      // never above the header line (once the moth is out of the header), never out of the panel
      ty = clamp(ty, pos.y > 72 ? 64 : 9, h - 9);
      if (!starSeen) {
        starX = tx;
        starY = ty;
        starSeen = true;
      }
      const dtp = clamp((now - lastPlace) / 1000, 0, 0.05);
      lastPlace = now;
      const ke = 1 - Math.exp(-dtp * 30);
      starX += (tx - starX) * ke;
      starY += (ty - starY) * ke;
      star.style.transform = `translate3d(${starX - STAR / 2}px, ${starY - STAR / 2}px, 0)`;
    };

    if (reduced) {
      hit.style.display = "none"; // nothing to pick up when it does not move
      mode = "rest";
      const l = findLedge("composer");
      pos.x = l ? (l.x0 + l.x1) / 2 : w * 0.5;
      pos.y = l ? l.y : botY();
      if (l) {
        ledge = l;
        roll = 1;
        rollVis = 1;
        rollSide = "R";
        heading = 0;
      } else heading = -Math.PI / 2;
      place(0);
      return () => {
        ro.disconnect();
        host.removeAttribute("data-moth-out");
        swarm.get(host)?.delete(me);
        host.removeEventListener("pointerdown", onDown);
      hit.removeEventListener("pointerdown", onHitDown);
        host.removeAttribute("data-moth-away");
      };
    }
    place(t0);

    const prepare = () => {
      const to = pickSpot(pos);
      const dx = to.x - pos.x;
      const dy = to.y - pos.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      const bend = (Math.random() < 0.5 ? -1 : 1) * len * 0.14;
      next = {
        sx: pos.x,
        sy: pos.y,
        tx: to.x,
        ty: to.ledge?.side ? ledgeYFor(to.ledge, 0) : to.y,
        cx: pos.x + dx / 2 + (-dy / len) * bend,
        cy: pos.y + dy / 2 + (dx / len) * bend - len * 0.1, // a hop, so the arc rises
        dur: (first ? 1.3 + len / 420 : 0.95 + len / 420) * (scene ? (to.wall ? 1.25 : 1.15) : 1),
        t: 0,
        to,
        first,
        air: lostPerch,
        lift0: 0,
        scale0: 1,
      };
      lostPerch = false;
      if (to.ledge && to.ledge.kind !== "ceiling" && !first) {
        // a box is landed on from above: the path rises, then comes down onto it (the ceiling is reached from below)
        next.cx = (pos.x + to.x) / 2 + (-dy / len) * bend * 0.4;
        next.cy = Math.max(10, to.y - Math.max(46, len * 0.22));
      }
      if (scene && to.ledge?.side && !first) {
        // onto the top or bottom edge of a section it comes in on a slope and arrives from straight above (or below) its spot, going
        // down onto it, as it comes in across to a wall: it is not skating along the edge, flat, when it arrives
        const away = to.ledge.kind === "ceiling" ? 1 : -1;
        next.cx = to.x + (-dy / len) * bend * 0.3;
        next.cy = to.y + away * clamp(len * 0.3, 50 * K, 150 * K);
      }
      if (first) {
        // out of the header it leaves sideways (a quarter turn from head-up, not a half turn) and swoops down
        next.cx = to.x;
        next.cy = pos.y - 2;
      }
      first = false;
      morphNext = scene && !!to.wall;
      if (to.wall) sideNext = to.wall;
      else if (to.ledge?.side) {
        // landing head-first along the ledge; hanging from the top boundary the legs point up, so the side flips
        const hang = to.ledge.kind === "ceiling";
        sideNext = (to.dir === -1) !== hang ? "L" : "R";
      }
      aimT = 0;
      mode = "aim";
      pt = 0.5; // wings begin to open as it turns
    };

    const beginWalk = () => {
      if (!scene && !wall && !ledge) {
        // the assistant's moth does not wander the open middle: it goes straight on to an edge or a box
        mode = "rest";
        timer = rand(0.5, 0.9);
        return;
      }
      const t = topY() - 10;
      const b = pos.y > calmY() + 20 ? botY() + 6 : calmY(); // starts low: stays low; otherwise keeps to the open space
      let len = wall || ledge ? (scene ? rand(95, 160) : rand(100, 170)) : scene ? rand(180, 260) : rand(120, 185); // a stroll in the open middle is a little shorter, so a visit there takes about as long as at a boundary
      if (wall) {
        len = Math.min(len, pos.y - t); // climbs, so it is always going head first
        if (len < 25) {
          mode = "rest";
          timer = rand(1, 2);
          return;
        }
        strokeLen = len;
        strokeTotal = len;
        strokeId++;
        walkT = 0;
        mode = "walk";
        return;
      }
      if (ledge) {
        // along the top edge, head first: it stands side-on, so it cannot turn round without leaving
        const fwd = Math.cos(heading) >= 0 ? 1 : -1;
        const room = fwd > 0 ? ledge.x1 - 16 - pos.x : pos.x - (ledge.x0 + 16);
        len = Math.min(scene ? rand(95, 160) : rand(60, 110), room);
        if (len < 24) {
          mode = "rest";
          timer = rand(1, 1.6);
          return;
        }
        strokeLen = len;
        strokeTotal = len;
        strokeId++;
        walkT = 0;
        if (!ledge.side) pt = 0.55;
        mode = "walk";
        return;
      }
      let ang = rand(0, Math.PI * 2);
      for (let n = 0; n < 14; n++) {
        const a = rand(0, Math.PI * 2);
        const ex = pos.x + Math.cos(a) * len;
        const ey = pos.y + Math.sin(a) * len;
        if (ex > 22 && ex < w - 22 && ey > t && ey < b) {
          ang = a;
          break;
        }
        len *= 0.93;
      }
      walkHeading = ang;
      lowWalk = pos.y > calmY() + 20;
      strokeLen = len;
      strokeTotal = len;
        strokeId++;
      pt = 0.55; // open the wings and turn to face the way it will walk; it sets off once both are done
      mode = "settle";
      timer = 0;
    };

    // the wash for the stroke in progress: a new one, in the next swatch, each time a stroke begins
    const getWash = (): Wash => {
      let wsh = washes[washes.length - 1];
      if (!wsh || wsh.id !== strokeId) {
        if (wsh && wsh.endT === null) wsh.endT = performance.now();
        const wcv = document.createElement("canvas");
        wcv.width = cv.width;
        wcv.height = cv.height;
        const wc = wcv.getContext("2d")!;
        wc.setTransform(dprPx, 0, 0, dprPx, 0, 0);
        const c = palette[strokeCount++ % palette.length];
        wsh = { id: strokeId, cv: wcv, ctx: wc, rgb: c.join(","), rgbDark: c.map((v) => Math.round(v * 0.7)).join(","), seed: Math.random() * 100, gain: paintGain, endT: null };
        washes.push(wsh);
        if (washes.length > (scene ? 3 : 8)) washes.shift();
      }
      return wsh;
    };
    // Spray: one bar across the line of travel at (px, py), where the feet were along this frame's step (so a slow frame
    // still paints one unbroken band). In top view the bar spans the wings, tip to tip, so the stroke is one band as wide
    // as the wings; on its side it is a thin line along the wall or edge.
    const dab = (px = pos.x, py = pos.y) => {
      if (!scene) return; // the assistant's moth leaves no paint; only the painting sections do
      dabIndex++;
      const travelled = strokeTotal - strokeLen;
      // the wash swells from nothing at the start to its fullest in the middle and back to nothing at the end
      const u = clamp(travelled / Math.max(1, strokeTotal), 0, 1);
      const env = Math.sin(Math.PI * u);
      let cx: number;
      let cy: number;
      let dir: number;
      let half: number;
      if (wall) {
        cx = wall === "L" ? 3 : w - 3;
        cy = py;
        dir = -Math.PI / 2;
        half = 2.8 * (0.45 + 0.55 * Math.pow(env, 0.5));
      } else if (ledge?.side) {
        cx = px - Math.cos(heading) * 3;
        cy = py + (ledge.kind === "ceiling" ? -PERCH : PERCH); // along the edge
        dir = heading;
        half = 2.8 * (0.45 + 0.55 * Math.pow(env, 0.5));
      } else {
        cx = px - Math.cos(heading) * 3;
        cy = py - Math.sin(heading) * 3;
        dir = heading;
        // the wings' full width, tip to tip, as they are at this moment (they swing in as they fold)
        const a = (FOLD * (1 - clamp(p, 0, 1)) * Math.PI) / 180;
        const reach = 19 * Math.cos(a) - 9.4 * Math.sin(a); // wing tip, in the drawing's units from the centre line
        half = reach * (BOX_W / 40) * 0.68 * (0.3 + 0.7 * Math.pow(env, 0.5)); // a little narrower than the wings, so it reads as a trail
      }
      const wash = getWash();
      washBar(wash.ctx, wash, cx, cy, -Math.sin(dir), Math.cos(dir), half, env, travelled);
    };

    let lastDraw = 0;
    let drawnRip = 0;
    let drawnWashes = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = clamp((now - t0) / 1000, 0, 0.05); // never negative: a frame timestamp can be a hair earlier than the clock we started from
      t0 = now;

      if (mode !== "aim" && mode !== "settle" && mode !== "grab") headV = 0;
      // the drawn roll follows the logical roll on a lightly under-damped spring (sub-stepped)
      for (let rem = dt; rem > 0; rem -= 0.016) {
        const hh = Math.min(rem, 0.016);
        rollW += ((roll - rollVis) * 140 - rollW * 23.7) * hh; // critically damped: it settles without a wobble
        rollVis += rollW * hh;
      }
      // wings follow a lightly under-damped spring to their next pose (sub-stepped so a slow frame cannot upset it)
      for (let rem = dt; rem > 0; rem -= 0.016) {
        const hh = Math.min(rem, 0.016);
        pv += ((pt - p) * 110 - pv * 13) * hh;
        p += pv * hh;
      }
      squash = Math.max(0, squash - dt * 4.5);
      // the side it will land on, and which drawing turns, are taken up in the air once it is flat (top view): never while any of it shows
      if (mode === "fly" && rollVis < 0.02) {
        rollSide = sideNext;
        useMorph = morphNext;
      }
      shiverAt -= dt;
      if (shiverAt <= 0) {
        shiver = 1;
        shiverAt = rand(1.8, 3.8);
      }
      shiver = Math.max(0, shiver - dt * 3.5);

      // the user sent a question, or the answer arrived: go to the input box / the answer next
      if (userAt && pending !== "user") {
        pending = "user";
        if (mode === "walk") strokeLen = Math.min(strokeLen, 8);
        else if (mode === "settle" || mode === "rest") {
          strokeLen = 0;
          mode = "rest";
          timer = Math.min(timer, 0.15);
        } else if (mode === "wake") timer = Math.min(timer, 0.3);
      }
      const sg = signalRef.current;
      if (sg && sg.id !== handled && pending !== "user") {
        handled = sg.id;
        pending = sg.kind === "send" ? "composer" : Math.random() < 0.6 ? "centre" : "reply";
        // it finishes what it is doing (shortening a walk), then goes: a beat or two, never a sudden jerk
        if (mode === "walk") strokeLen = Math.min(strokeLen, 30);
        else if (mode === "settle" || mode === "rest") {
          strokeLen = 0;
          mode = "rest";
          timer = Math.min(timer, rand(1, 1.8));
        } else if (mode === "wake") timer = Math.min(timer, 0.4);
      }

      // standing on a ledge: stay exactly on it as the chat scrolls or the text grows
      if (ledge && (mode === "settle" || mode === "walk" || mode === "rest" || mode === "aim" || mode === "crouch")) {
        let L = measure(ledge.el, ledge.kind);
        if (!L && (ledge.kind === "composer" || ledge.kind === "ceiling")) L = findLedge(ledge.kind); // re-rendered: find it again
        if (!L) {
          // its perch has scrolled out of view or been removed: it lifts off rather than hang in the air
          ledge = null;
          if (mode !== "aim" && mode !== "crouch") {
            lostPerch = true;
            strokeLen = 0;
            mode = "rest";
            timer = 0;
          }
        } else {
          const locked = roll > 0.99 && (mode === "walk" || mode === "rest" || mode === "settle");
          ledge = L;
          pos.y = L.side ? ledgeYFor(L, rollVis) : locked ? L.y : pos.y + (L.y - pos.y) * Math.min(1, dt * 10);
          pos.x = clamp(pos.x, L.x0 + 14 * K, L.x1 - 14 * K);
        }
      }
      if (wall && rollVis > 0.02) pos.x = wallXFor(wall, rollVis); // follows the edge if the panel is resized

      if (mode === "grab") {
        // held: it follows the pointer, wings beating, lifted, facing the way it is being carried; it comes off its side
        if (roll > 0) roll = Math.max(0, roll - dt / 0.5);
        const gt = grabTo ?? { x: pos.x, y: pos.y };
        const dx = gt.x - pos.x;
        const dy = gt.y - pos.y;
        const sp = Math.hypot(dx, dy);
        if (sp > 3) turn(Math.atan2(dy, dx), dt, sp > 20 ? 9 : 4);
        const ox = pos.x;
        const oy = pos.y;
        const kk = Math.min(1, dt * 14);
        const stepLen = Math.hypot(dx * kk, dy * kk);
        const cap = 900 * dt; // never faster than this, so a long rush across the panel is a stroke you can see being laid
        const sc = stepLen > cap ? cap / stepLen : 1;
        pos.x += dx * kk * sc;
        pos.y += dy * kk * sc;
        // carried by the user: it makes no paint at all, only a walking moth paints
        lift += (0.8 - lift) * Math.min(1, dt * 10);
        scale += (1.12 - scale) * Math.min(1, dt * 10);
      } else if (mode === "wake") {
        // on the icon: the wings stretch open, the body lifts a little, then it goes
        timer -= dt;
        pt = 0.4 * ease(clamp(1 - timer / 0.9, 0, 1));
        const k = ease(clamp((0.45 - timer) / 0.45, 0, 1));
        lift = 0.22 * k;
        scale = markScale + (1.05 - markScale) * k;
        if (timer <= 0) prepare();
      } else if (mode === "aim" && next) {
        // turn in place to face the way it will hop (and, from a wall or ledge, peel off it)
        aimT += dt;
        const face = Math.atan2(next.cy - next.sy, next.cx - next.sx);
        const rising = next.first || next.air || !!wall || !!ledge?.side; // lifting off from the header, mid-air or a surface: no crouch
        // peeling off a wall or a box edge: it comes off its side, the wings opening as it does; once it is past half way
        // onto its back it starts to turn towards where it is going, and it lifts off the surface as it comes round
        const peel = !!wall || !!ledge?.side;
        if (roll > 0) roll = Math.max(0, roll - dt / (useMorph ? 1 : 0.65));
        if (peel) pt = roll < 0.25 ? 0.5 : 0; // the wings stay folded while it is on its side (so the two views match), and open once it is on its back
        if (roll < 0.3) turn(face, dt, next.first ? 3.4 : 6);
        if (wall) pos.x = wallXFor(wall, rollVis);
        if (peel) {
          lift = 0.3 * (1 - roll);
          scale = 1 + 0.05 * (1 - roll);
        } else if (rising) {
          lift = 0.22 + 0.1 * ease(clamp(aimT / 0.8, 0, 1)); // rises as it turns
          scale = 1.05 + 0.03 * ease(clamp(aimT / 0.8, 0, 1));
        }
        if (Math.abs(wrap(face - heading)) < 0.1 && Math.abs(headV) < 1.2 && roll <= 0 && rollVis < 0.12 && p > 0.4 && (!rising || aimT > (next.first ? (scene ? 0.3 : 0.8) : 0.35))) {
          wall = null;
          ledge = null;
          if (rising) {
            next.lift0 = lift;
            next.scale0 = scale;
            // it has slid and peeled while turning: the hop starts exactly where it is now, so there is no jump as it lifts off
            // (the control point moves with it, so the direction it leaves in is the one it has just turned to face)
            next.cx += pos.x - next.sx;
            next.cy += pos.y - next.sy;
            next.sx = pos.x;
            next.sy = pos.y;
            jump = next;
            next = null;
            pt = 0.85;
            mode = "fly";
          } else {
            timer = 0.3;
            mode = "crouch";
          }
        }
      } else if (mode === "crouch" && next) {
        // gathers itself, wings lifting, then springs
        timer -= dt;
        const k = ease(clamp(1 - timer / 0.3, 0, 1));
        scale = 1 - 0.1 * k;
        pt = 0.7;
        if (timer <= 0) {
          next.lift0 = lift;
          next.scale0 = scale;
          jump = next;
          next = null;
          pt = 0.85;
          mode = "fly";
        }
      } else if (mode === "fly" && jump) {
        if (jump.to.ledge) {
          const L = measure(jump.to.ledge.el, jump.to.ledge.kind);
          if (L) {
            jump.ty = L.side ? ledgeYFor(L, 0) : L.y;
            jump.tx = clamp(jump.tx, L.x0 + 28, Math.max(L.x0 + 29, L.x1 - 28));
            jump.to.ledge = L;
          }
        }
        jump.t = Math.min(1, jump.t + dt / jump.dur);
        const t = jump.t;
        const u = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2; // gathers, leaps, settles
        const a = (1 - u) ** 2;
        const b = 2 * (1 - u) * u;
        const c = u * u;
        const flutter = Math.sin(t * Math.PI * 7) * 2 * Math.sin(Math.PI * t); // a moth's hop is never perfectly smooth
        const dx = 2 * (1 - u) * (jump.cx - jump.sx) + 2 * u * (jump.tx - jump.cx);
        const dy = 2 * (1 - u) * (jump.cy - jump.sy) + 2 * u * (jump.ty - jump.cy);
        const tangent = Math.atan2(dy, dx); // always facing the way it is going
        const len = Math.hypot(dx, dy) || 1;
        pos.x = a * jump.sx + b * jump.cx + c * jump.tx + (-dy / len) * flutter;
        pos.y = a * jump.sy + b * jump.cy + c * jump.ty + (dx / len) * flutter;
        const open = ease(clamp(t / 0.25, 0, 1)); // eases out of the crouch (or the lift-off) into the hop
        lift = Math.max(Math.sin(Math.PI * t), jump.lift0 * (1 - open));
        scale = jump.scale0 * (1 - open) + (1 + 0.16 * Math.sin(Math.PI * t)) * open;
        if (jump.to.wall || jump.to.ledge) {
          // coming down on a wall or ledge: it lines up with it, and on a wall or a box rolls onto its side as it lands
          // one thing after another, as a real moth would: first the wings fold (from 40%), then it lines itself up with the
          // wall or edge (30–70%), and only then does it roll over onto its side (60–100%)
          const edgeScene = scene && !jump.to.wall; // onto the top or bottom edge of a section the hop is long and ends slowly, so it turns and rolls earlier, and is side-on well before it touches down
          const kh = edgeScene ? ease(clamp((t - 0.1) / 0.4, 0, 1)) : ease(clamp((t - 0.3) / 0.4, 0, 1));
          const kr = edgeScene ? ease(clamp((t - 0.2) / 0.5, 0, 1)) : ease(clamp((t - (scene ? 0.5 : 0.6)) / (scene ? 0.5 : 0.4), 0, 1));
          const land = jump.to.wall ? -Math.PI / 2 : jump.to.dir === -1 ? Math.PI : 0;
          heading = tangent + wrap(land - tangent) * kh;
          roll = jump.to.wall || jump.to.ledge?.side ? kr : 0;
          // onto a wall: the hop lands in the open, wings clear of the edge, and the moth slides in against the wall as it rolls
          if (jump.to.ledge?.side && rollVis > 0.02) pos.y += (ledgeYFor(jump.to.ledge, rollVis) - pos.y) * ease(clamp(rollVis / 0.35, 0, 1));
          if (jump.to.wall && rollVis > 0.02) pos.x += (wallXFor(jump.to.wall, rollVis) - pos.x) * (scene ? ease(clamp(rollVis / 0.35, 0, 1)) : 1); // in a section it slides in gradually
          if (t > 0.4) pt = jump.to.ledge && !jump.to.ledge.side ? 0.55 : 0; // over plain text it keeps its wings half open to walk
        } else {
          heading = tangent;
          if (t > 0.8) pt = 0;
        }
        if (t >= 1) {
          scale = 1;
          lift = 0;
          squash = scene && jump.to.wall ? 0 : 1; // in a section it sits down without a pop in its size
          shiver = 1; // a little settling tremble on landing
          wall = jump.to.wall;
          ledge = jump.to.ledge ?? null;
          const landHeading = jump.to.dir === -1 ? Math.PI : 0;
          const placed = !!jump.to.user; // put there by the user: it lands exactly there, then gets straight on with painting
          jump = null;
          pt = ledge && !ledge.side ? 0.55 : 0;
          if (wall) {
            roll = 1;
            heading = -Math.PI / 2;
            clung = false;
            mode = "rest";
            timer = placed ? rand(0.5, 0.9) : rand(1, 1.6);
          } else if (ledge) {
            roll = ledge.side ? 1 : 0;
            heading = landHeading;
            clung = false;
            mode = "rest";
            timer = placed ? rand(0.4, 0.7) : rand(0.8, 1.4);
          } else {
            mode = "settle";
            timer = placed ? rand(0.4, 0.7) : rand(0.9, 1.4);
            moreStrolls = Math.random() < 0.5 ? 1 : 0; // in the open one stroll, sometimes two
          }
        }
      } else if (mode === "settle") {
        timer -= dt;
        if (timer <= 0 && strokeLen === 0) beginWalk();
        else if (strokeLen > 0) {
          // facing its way and wings open: only now does it set off
          turn(walkHeading, dt, 5);
          if (Math.abs(wrap(walkHeading - heading)) < 0.08 && Math.abs(headV) < 1 && p > 0.45) {
            walkT = 0;
            mode = "walk";
          }
        }
      } else if (mode === "walk") {
        // ease into the walk and out of it: speed ramps up over the first moments and drops near the end
        walkT += dt;
        const go = clamp(walkT / 0.8, 0, 1) * clamp(strokeLen / 14, 0.15, 1);
        const gait = 1 + 0.22 * Math.sin(now / 130); // each step lurches forward a little, then settles
        const step = (wall ? 13 : 16) * dt * go * gait;
        const t = topY() - 10;
        const b = lowWalk ? botY() + 6 : calmY();
        const ox = pos.x;
        const oy = pos.y;
        const s0 = sinceDab;
        if (wall) pos.y -= step;
        else if (ledge) pos.x += Math.cos(heading) * step; // along the top edge
        else {
          // a gentle curve; near an edge of its area it steers back inwards while still going forward
          const cx = w / 2;
          const cy = (t + b) / 2;
          const margin = 26;
          const near = pos.x < margin || pos.x > w - margin || pos.y < t + 8 || pos.y > b - 8;
          if (near) heading += wrap(Math.atan2(cy - pos.y, cx - pos.x) - heading) * Math.min(1, dt * 2.5);
          else heading += Math.sin(now / 1100) * 0.25 * dt;
          pos.x = clamp(pos.x + Math.cos(heading) * step, 16 * K, w - 16 * K);
          pos.y = clamp(pos.y + Math.sin(heading) * step, t, b);
        }
        sinceDab += step;
        strokeLen -= step;
        for (let k = 1; sinceDab >= DAB_GAP; k++) {
          sinceDab -= DAB_GAP;
          const f = clamp((DAB_GAP * k - s0) / Math.max(step, 1e-6), 0, 1);
          dab(ox + (pos.x - ox) * f, oy + (pos.y - oy) * f);
        }
        if (strokeLen < 22) pt = 0; // wings begin to fold as it slows to a stop
        if (strokeLen <= 0) {
          strokeLen = 0;
          mode = "rest";
          pt = 0;
          // thinking: keeps pacing the input box; on a ledge: lingers; down by the text: not long
          // a rest after the stroke, set so a whole visit lasts about the same wherever it is (≈13s): longer on a ledge or
          // wall, which have one stroke, shorter in the open, which has one or two
          timer = pending === "user" ? 0.2 : pending ? rand(0.4, 0.8) : ledge?.kind === "composer" && busyRef.current ? rand(0.5, 0.9) : ledge ? (scene ? rand(0.7, 1.4) : rand(6.5, 9.5)) : wall ? (scene ? rand(0.7, 1.4) : rand(5.5, 8)) : moreStrolls > 0 ? rand(0.6, 1) : scene ? rand(0.6, 1.2) : rand(2.5, 4);
        }
      } else {
        // rest
        timer -= dt;
        if (timer <= 0) {
          if (ledge?.kind === "composer" && busyRef.current && !pending) {
            // paces the input box while it thinks: walks on if there is room ahead, else hops along it
            const fwd = Math.cos(heading) >= 0 ? 1 : -1;
            const room = fwd > 0 ? ledge.x1 - 16 - pos.x : pos.x - (ledge.x0 + 16);
            if (room > 40) beginWalk();
            else {
              pending = "composer";
              prepare();
            }
          } else if ((wall || ledge) && !clung && !pending) {
            clung = true;
            beginWalk();
          } else if (!wall && !ledge && moreStrolls > 0 && !pending) {
            moreStrolls--;
            beginWalk(); // a second stroll, in a new direction
          } else prepare();
        }
      }
      // always inside the assistant: nothing of the moth leaves the panel (except clinging to a wall, which is its edge)
      if (!wall && !(jump && jump.to.wall)) {
        // top view turns about its middle, so it needs its half-span clear on every side; side-on it is shorter
        const m = (roll > 0.5 && ledge?.side ? 15 : 24) * K;
        pos.x = clamp(pos.x, m, w - m);
        // a section: the edge limit eases from its top-view clearance to the perch as it rolls (it landed with a 20px snap when it was
        // lifted as soon as the roll passed half way)
        const toEdge = scene && (ledge?.side || jump?.to.ledge?.side);
        const lim = toEdge ? PERCH - 0.5 + (24 * K - PERCH + 0.5) * (1 - ease(clamp(rollVis, 0, 1))) : roll > 0.5 && ledge?.side ? PERCH - 0.5 : 24 * K;
        pos.y = clamp(pos.y, lim, h - lim); // side-on it may sit right at an edge: its legs touch it
      } else pos.y = clamp(pos.y, 16 * K, h - 16 * K);
      // once the moth is well clear of the header, the star takes its place there and the title slides left: never both at once
      if (!away && mode === "fly" && Math.hypot(pos.x - start.x, pos.y - start.y) > 70) {
        away = true;
        host.setAttribute("data-moth-away", "");
      }

      place(now);

      if (now - lastDraw > 33) {
        lastDraw = now;
        const tNow = performance.now();
        // each stroke is its own canvas: it is held while the moth is still painting it, then holds its colour for a while and fades
        for (let i = washes.length - 1; i >= 0; i--) {
          const wsh = washes[i];
          if (wsh.id === strokeId && mode === "walk") wsh.endT = null;
          else if (wsh.endT === null) wsh.endT = tNow;
          if (wsh.endT !== null && (tNow - wsh.endT) / 1000 > LIFE) washes.splice(i, 1);
        }
        // a big section is only repainted when something in it changes (a stroke being laid, paint fading, a ripple), so a
        // landing is never competing with a full-section redraw
        const ripN = ripples.length;
        const changed = !scene || ripN > 0 || ripN !== drawnRip || washes.length !== drawnWashes || washes.some((wsh) => wsh.endT === null || tNow - wsh.endT < 300 || (tNow - wsh.endT) / 1000 > HOLD - 0.1);
        drawnRip = ripN;
        drawnWashes = washes.length;
        if (changed) {
        ctx.clearRect(0, 0, w, h);
        for (const wsh of washes) {
          const age = wsh.endT === null ? 0 : (tNow - wsh.endT) / 1000;
          const k = clamp((age - HOLD) / FADE, 0, 1);
          ctx.globalAlpha = (1 - k * k * (3 - 2 * k)) * 0.7;
          ctx.drawImage(wsh.cv, 0, 0, w, h);
        }
        ctx.globalAlpha = 1;
        while (ripples.length && tNow - ripples[0].t > 700) ripples.shift();
        for (const rp of ripples) {
          const age = (tNow - rp.t) / 700;
          ctx.globalAlpha = 0.28 * (1 - age);
          ctx.strokeStyle = `rgb(${palette[strokeCount % palette.length].join(",")})`; // the colour the next stroke will be
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, 3 + 14 * age, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        }
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      swarm.get(host)?.delete(me);
      host.removeEventListener("pointerdown", onDown);
      hit.removeEventListener("pointerdown", onHitDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("selectstart", noSelect);
      window.removeEventListener("dragstart", noSelect);
      host.style.userSelect = "";
      host.removeAttribute("data-moth-out");
      host.removeAttribute("data-moth-away");
    };
  }, [active]);

  const face = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as const;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" style={{ filter: "blur(0.5px)" }} />
      <div ref={hitEl} className="absolute left-0 top-0 rounded-full" style={{ width: 48 * K, height: 48 * K, pointerEvents: "auto", touchAction: "none", cursor: "grab", transform: "translate3d(-100px,-100px,0)" }} />
      <div ref={starEl} className="absolute left-0 top-0" style={{ width: STAR, height: STAR, lineHeight: 0, opacity: 0 }}>
        <StarBadge size={STAR} />
      </div>
      <div ref={shadowEl} className="absolute left-0 top-0" style={{ width: BOX_W, height: SIZE }}>
        <div ref={mothEl} className="absolute inset-0 will-change-transform" style={{ opacity: 0, perspective: scene ? 420 : 200 }}>
          <div ref={turnEl} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            <div data-top className="absolute inset-0" style={face}>
              <MothIcon size={SIZE} star={false} colors={colors} />
            </div>
            <div ref={sideFace} className="absolute inset-0 grid place-items-center" style={face}>
              {scene ? (
                <>
                  <div data-morphwrap style={{ display: "none" }}>
                    <MothMorph size={SIZE} colors={colors} />
                  </div>
                  <div data-sidewrap>
                    <MothSideIcon size={SIZE} colors={colors} />
                  </div>
                </>
              ) : (
                <MothSideIcon size={SIZE} colors={colors} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
