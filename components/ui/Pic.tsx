import variants from "@/content/variants.json";
import masks from "@/content/masks.json";
import WashOverlay from "./WashOverlay";
import { schemeForImage, inkPalette } from "@/lib/painting";

type V = { w: number; h: number; avif: number[]; webp: number[] };
const table = variants as Record<string, V>;

/** Static pre-built file for a master image (see scripts/optimize.mjs). */
const optPath = (file: string, w: number, ext: "avif" | "webp") =>
  `/images/_opt/${file.replace(/^\/images\//, "").replace(/\.png$/, "")}-${w}.${ext}`;

type Props = {
  file: string;       // master path, e.g. "/images/adeo/hero.png"
  sizes: string;
  alt?: string;
  priority?: boolean; // above the fold: load now, high priority
  eager?: boolean;    // load now (normal priority) — for things that slide into view
  sync?: boolean;     // decode on the main thread so nothing flashes blank while moving
  fill?: boolean;     // cover its (relatively positioned) parent
  className?: string;
};

/**
 * <picture> with AVIF (about half the weight of WebP at the same look) and a WebP fallback.
 * Plain static files: no on-demand processing, no placeholder.
 */
export default function Pic({ file, sizes, alt = "", priority, eager, sync, fill, className = "" }: Props) {
  const v = table[file];
  if (!v) throw new Error(`No optimised variants for ${file} — run: node scripts/optimize.mjs`);
  const set = (list: number[], ext: "avif" | "webp") => list.map((w) => `${optPath(file, w, ext)} ${w}w`).join(", ");
  // a case study image: its painted background moves, like the painting at the foot of its case; the product stays still
  const sc = file in masks ? schemeForImage(file) : null;
  const pic = (
    <picture className="contents">
      <source type="image/avif" srcSet={set(v.avif, "avif")} sizes={sizes} />
      <img
        src={optPath(file, v.webp[v.webp.length - 1], "webp")}
        srcSet={set(v.webp, "webp")}
        sizes={sizes}
        width={v.w}
        height={v.h}
        alt={alt}
        loading="eager"
        decoding={sync ? "sync" : "async"}
        {...(priority ? { fetchPriority: "high" as const } : {})}
        className={fill ? `absolute inset-0 h-full w-full object-cover ${className}` : sc ? `block ${className}` : className}
      />
    </picture>
  );
  if (!sc) return pic;
  const overlay = <WashOverlay mask={`${file.replace(/^\/images\//, "/images/_mask/")}?v=${(masks as unknown as Record<string, { v: string }>)[file].v}`} palette={inkPalette(sc, (masks as unknown as Record<string, { ground: [number, number, number] }>)[file].ground)} fill={fill} />;
  if (fill) {
    return (
      <span data-wash className="absolute inset-0 block">
        {pic}
        {overlay}
      </span>
    );
  }
  return (
    <span data-wash className="relative block">
      {pic}
      {overlay}
    </span>
  );
}
