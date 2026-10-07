// One-time migration: downloads every image listed in content/assets.json from
// Framer's CDN into /public, then records the real dimensions back into the manifest.
// Run with `npm run assets`. Existing files are skipped, so it's safe to re-run.
// After it finishes, commit /public/images — the site no longer touches Framer.
import fs from "node:fs/promises";
import path from "node:path";
import { imageSize } from "image-size";

const root = process.cwd();
const manifestPath = path.join(root, "content/assets.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

let downloaded = 0, skipped = 0, failed = [];

for (const [id, asset] of Object.entries(manifest)) {
  const out = path.join(root, "public", asset.file);
  await fs.mkdir(path.dirname(out), { recursive: true });

  let buf;
  try {
    buf = await fs.readFile(out);
    skipped++;
  } catch {
    try {
      const res = await fetch(asset.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      buf = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(out, buf);
      downloaded++;
      console.log(`✓ ${id} → ${asset.file}`);
    } catch (err) {
      failed.push(`${id}: ${err.message}`);
      continue;
    }
  }

  const { width, height } = imageSize(buf);
  if (width && height) Object.assign(asset, { w: width, h: height });
}

await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nDownloaded ${downloaded}, already present ${skipped}, failed ${failed.length}.`);
if (failed.length) {
  console.log(failed.join("\n"));
  process.exitCode = 1;
}
