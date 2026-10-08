import variants from "@/content/variants.json";

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
  fill?: boolean;     // cover its (relatively positioned) parent
  className?: string;
};

/**
 * <picture> with AVIF (about half the weight of WebP at the same look) and a WebP fallback.
 * Plain static files: no on-demand processing, no placeholder.
 */
export default function Pic({ file, sizes, alt = "", priority, fill, className = "" }: Props) {
  const v = table[file];
  if (!v) throw new Error(`No optimised variants for ${file} — run: node scripts/optimize.mjs`);
  const set = (list: number[], ext: "avif" | "webp") => list.map((w) => `${optPath(file, w, ext)} ${w}w`).join(", ");
  return (
    <picture className="contents">
      <source type="image/avif" srcSet={set(v.avif, "avif")} sizes={sizes} />
      <img
        src={optPath(file, v.webp[v.webp.length - 1], "webp")}
        srcSet={set(v.webp, "webp")}
        sizes={sizes}
        width={v.w}
        height={v.h}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
        className={fill ? `absolute inset-0 h-full w-full object-cover ${className}` : className}
      />
    </picture>
  );
}
