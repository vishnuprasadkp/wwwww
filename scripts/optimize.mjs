// One-off: builds the web-optimised paper textures. Run: node scripts/optimize.mjs
// The source PNG is mostly alpha grain; flattened onto white it compresses well and looks identical.
import sharp from "sharp";
import fs from "node:fs/promises";

const src = "public/images/site/paper-1.png";
for (const [file, width, quality] of [["paper.webp", 3456, 80], ["paper-sm.webp", 2400, 85]]) {
  const buf = await sharp(src).resize(width).flatten({ background: "#ffffff" }).webp({ quality, effort: 6 }).toBuffer();
  await fs.writeFile(`public/images/site/${file}`, buf);
  console.log(file, Math.round(buf.length / 1024), "KB");
}
