import variants from "@/content/variants.json";

type V = { w: number; h: number; widths: number[] };
const table = variants as Record<string, V>;

/** Static, pre-built WebP variant for a master image (see scripts/optimize.mjs). */
const optPath = (file: string, w: number) => `/images/_opt/${file.replace(/^\/images\//, "").replace(/\.png$/, "")}-${w}.webp`;

type Props = {
  file: string;       // master path, e.g. "/images/adeo/hero.png"
  sizes: string;
  alt?: string;
  priority?: boolean; // above the fold: load now, high priority
  fill?: boolean;     // cover its (relatively positioned) parent
  className?: string;
};

/** Plain <img> with a responsive srcset of pre-compressed WebP files: no on-demand processing, no placeholder. */
export default function Pic({ file, sizes, alt = "", priority, fill, className = "" }: Props) {
  const v = table[file];
  if (!v) throw new Error(`No optimised variants for ${file} — run: node scripts/optimize.mjs`);
  const srcSet = v.widths.map((w) => `${optPath(file, w)} ${w}w`).join(", ");
  return (
    <img
      src={optPath(file, v.widths[v.widths.length - 1])}
      srcSet={srcSet}
      sizes={sizes}
      width={v.w}
      height={v.h}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
      className={fill ? `absolute inset-0 h-full w-full object-cover ${className}` : className}
    />
  );
}
