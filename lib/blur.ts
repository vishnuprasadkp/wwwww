import blur from "@/content/blur.json";

/** Tiny blurred preview for an image path (see scripts/optimize.mjs), shown while the real one loads. */
export const blurFor = (file: string) => (blur as Record<string, string>)[file];
