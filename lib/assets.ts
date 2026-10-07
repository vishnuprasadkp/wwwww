import manifest from "@/content/assets.json";

export type Asset = { url: string; file: string; w: number; h: number; alt: string };
const assets = manifest as Record<string, Asset>;

export function getAsset(id: string): Asset {
  const a = assets[id];
  if (!a) throw new Error(`Unknown asset "${id}" — add it to content/assets.json`);
  return a;
}

export const isWide = (a: Asset) => a.w / a.h > 1.5;
