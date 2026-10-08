// One-off: builds the web-optimised paper texture and tiny blur placeholders for every image.
// Run: node scripts/optimize.mjs
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const root = "public/images";
const walk = async (d) =>
  (await Promise.all((await fs.readdir(d, { withFileTypes: true })).map((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : path.join(d, e.name))))).flat();

// Paper texture: displayed at ~120vw, so 2000px is plenty. The PNG is mostly alpha noise; flattened onto white it is ~130KB.
const flat = () => sharp(`${root}/site/paper-1.png`).resize(2000).flatten({ background: "#ffffff" });
const paper = await flat().webp({ quality: 72, effort: 6 }).toBuffer();
await fs.writeFile(`${root}/site/paper.webp`, paper);
const { channels } = await sharp(paper).resize(64).stats();
console.log("paper.webp", Math.round(paper.length / 1024), "KB; mean rgb", channels.map((c) => Math.round(c.mean)).join(","));

const blur = {};
for (const f of (await walk(root)).filter((f) => f.endsWith(".png") && !f.includes("/logos/") && !f.includes("paper"))) {
  const buf = await sharp(f).resize(28).blur(1).webp({ quality: 40 }).toBuffer();
  blur["/" + f.replace(/^public\//, "")] = `data:image/webp;base64,${buf.toString("base64")}`;
}
await fs.writeFile("content/blur.json", JSON.stringify(blur));
console.log("blur placeholders:", Object.keys(blur).length);
