/**
 * Hand-drawn ink from an exact outline: the same treatment the beetle has. Each piece of an SVG path (M, L, C and Z only) is turned
 * into one brush stroke: a ribbon whose width follows the pressure of the hand, thick in the middle and fine where it lifts, the line a
 * little unsteady, and where a shape closes the stroke runs on a little past where it began. Everything is computed from fixed
 * numbers, so the drawing is the same every time (and the same on the server and in the browser).
 */
type Pt = [number, number];
type Piece = { pts: Pt[]; closed: boolean };

/** Reads a path made only of absolute M, L, C and Z commands into dense points, one list per piece. */
function pieces(d: string): Piece[] {
  const out: Piece[] = [];
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+/g) ?? [];
  let cur: Piece | null = null;
  let i = 0;
  let cmd = "";
  let last: Pt = [0, 0];
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    if (/[MLCZ]/.test(tokens[i])) cmd = tokens[i++];
    if (cmd === "M") {
      last = [num(), num()];
      cur = { pts: [last], closed: false };
      out.push(cur);
      cmd = "L";
    } else if (cmd === "L" && cur) {
      const p: Pt = [num(), num()];
      const n = Math.max(1, Math.round(Math.hypot(p[0] - last[0], p[1] - last[1]) / 1.2));
      for (let k = 1; k <= n; k++) cur.pts.push([last[0] + ((p[0] - last[0]) * k) / n, last[1] + ((p[1] - last[1]) * k) / n]);
      last = p;
    } else if (cmd === "C" && cur) {
      const a: Pt = [num(), num()];
      const b: Pt = [num(), num()];
      const p: Pt = [num(), num()];
      const n = 14;
      for (let k = 1; k <= n; k++) {
        const t = k / n;
        const u = 1 - t;
        cur.pts.push([u * u * u * last[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t * t * t * p[0], u * u * u * last[1] + 3 * u * u * t * a[1] + 3 * u * t * t * b[1] + t * t * t * p[1]]);
      }
      last = p;
    } else if (cmd === "Z" && cur) {
      cur.closed = true;
      cmd = "";
    } else i++;
  }
  return out;
}

function ribbon(pts: Pt[], width: (t: number) => number): string {
  const n = pts.length - 1;
  const left: Pt[] = [];
  const right: Pt[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const h = width(i / n) / 2;
    left.push([p[0] - (dy / len) * h, p[1] + (dx / len) * h]);
    right.push([p[0] + (dy / len) * h, p[1] - (dx / len) * h]);
  });
  return "M" + [...left, ...right.reverse()].map((q) => `${q[0].toFixed(2)} ${q[1].toFixed(2)}`).join("L") + "Z";
}

/** The ink for a path: `main` is the stroke, `echo` the faint second line a little off it. `weight` is the widest the main stroke gets. */
export function inkPath(d: string, weight = 1.7): { main: string; echo: string } {
  let main = "";
  let echo = "";
  pieces(d).forEach((piece, s) => {
    let pts = piece.pts;
    if (piece.closed) {
      // the hand runs on past where it began
      const over = pts.slice(1, Math.max(3, Math.round(pts.length * 0.06)));
      pts = [...pts, ...over.map(([x, y]) => [x + 0.22, y - 0.18] as Pt)];
    }
    const shaky = pts.map(([x, y], i) => [x + Math.sin(i * 0.9 + s * 2.1) * 0.12 + Math.sin(i * 2.3 + s) * 0.06, y + Math.cos(i * 1.1 + s * 1.7) * 0.12 + Math.cos(i * 2.7 + s * 0.6) * 0.06] as Pt);
    main += ribbon(shaky, (t) => weight * (0.42 + 0.58 * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, t * 0.96 + 0.02))), 0.55)) * (1 + 0.14 * Math.sin(t * 11 + s)));
    const off = shaky.map(([x, y]) => [x + 0.32, y - 0.26] as Pt);
    echo += ribbon(off, () => 0.55);
  });
  return { main, echo };
}
