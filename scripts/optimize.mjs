// One-off asset build. Run: node scripts/optimize.mjs
//  1. Paper textures (flattened onto white; the PNG is mostly alpha grain).
//  2. Responsive WebP variants of every content image -> public/images/_opt/<path>-<width>.webp,
//     plus content/variants.json (natural size + available widths) used by components/ui/Pic.tsx.
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const root = "public/images";
const walk = async (d) =>
  (await Promise.all((await fs.readdir(d, { withFileTypes: true })).map((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : path.join(d, e.name))))).flat();

for (const [file, width, quality] of [["paper.webp", 3456, 80], ["paper-sm.webp", 2400, 85]]) {
  const buf = await sharp(`${root}/site/paper-1.png`).resize(width).flatten({ background: "#ffffff" }).webp({ quality, effort: 6 }).toBuffer();
  await fs.writeFile(`${root}/site/${file}`, buf);
  console.log(file, Math.round(buf.length / 1024), "KB");
}

const WIDTHS = [480, 800, 1200, 1800, 2560];
const variants = {};
const files = (await walk(root)).filter((f) => f.endsWith(".png") && !/\/(logos|_opt)\//.test(f) && !/paper|home-preview|og-default/.test(f));
let bytes = 0;
for (const f of files) {
  const rel = "/" + f.replace(/^public\//, "");
  const { width, height } = await sharp(f).metadata();
  const widths = [...WIDTHS.filter((w) => w < width), Math.min(width, 2560)].filter((w, i, a) => a.indexOf(w) === i);
  const base = rel.replace(/^\/images\//, "").replace(/\.png$/, "");
  await fs.mkdir(path.dirname(`${root}/_opt/${base}`), { recursive: true });
  await Promise.all(
    widths.map(async (w) => {
      const buf = await sharp(f).resize(w).webp({ quality: 86, effort: 4 }).toBuffer();
      bytes += buf.length;
      await fs.writeFile(`${root}/_opt/${base}-${w}.webp`, buf);
    }),
  );
  variants[rel] = { w: width, h: height, widths };
}
await fs.writeFile("content/variants.json", JSON.stringify(variants));
console.log(files.length, "images,", Math.round(bytes / 1048576), "MB of variants");
