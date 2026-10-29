import type { MothColors } from "@/components/copilot/Moth";

/**
 * The painting section at the foot of every page: its ground, its moth and the paint the moth sprays, each taken from the
 * six designs. In the designs the moth is two colours: a pale one for its head, body, antennae and fore wings, and a dark
 * one for its under-wings and the fine lines in its fore wings. The paint is the pale tint of its spray.
 */
type Rgb = [number, number, number];
export type Scheme = { name: string; bg: string; moth: MothColors; paint: Rgb; gain: number };

const hex = (h: string): Rgb => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/** A colour part of the way from `a` to `b`: the beetle's third colour, a grey between its pale and its dark one. */
function mix(a: string, b: string, t: number): string {
  const x = hex(a);
  const y = hex(b);
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/** `wing` is the moth's pale colour, `dark` its dark colour, `spray` the paint, all read off the design. */
function scheme(name: string, bg: string, wing: string, dark: string, spray: string, gain = 0.65): Scheme {
  return {
    name,
    bg,
    // the drawing's four colours: the wing cases (a grey, inside), the under-wings, the outside (head, shield, antennae, legs and the case outline: white), and the lines cut into the cases
    moth: { grey: mix(wing, dark, 0.45), hind: dark, deep: wing, vein: dark },
    paint: hex(spray),
    gain,
  };
}

export const SCHEMES = {
  charcoal: scheme("charcoal", "#545454", "#f8f8f8", "#292a2a", "#a6a6a6"),
  mist: scheme("mist", "#8ea1a9", "#f7f9fa", "#57676c", "#e0edf3"),
  moss: scheme("moss", "#698369", "#f7faf7", "#3d573d", "#bfd3c1"),
  clay: scheme("clay", "#8c5a40", "#fbf8f6", "#653a20", "#cda38c"),
  slate: scheme("slate", "#596b73", "#f3f5f7", "#33464d", "#a2b3ba"),
  sage: scheme("sage", "#93a992", "#f4f6f4", "#517252", "#dcefde", 1),
} as const;

/**
 * Which design each painting already in the portfolio is: Home and About end on the charcoal one (`footer-bg.png`), and each
 * case study ends on its own closing image. The ground of each is the image already there; the moth is added on top of it.
 */
export const SCHEME_FOR_CLOSING: Record<string, keyof typeof SCHEMES> = {
  "es-closing": "mist", // enterprise search: the light blue-grey
  "adeo-closing": "moss", // Adeo: the green
  "agent-closing": "clay", // AI agent: the terracotta
  "hdfc-closing": "slate", // HDFC: the slate
  "sony-closing": "sage", // Sony: the sage
};

export const schemeForClosing = (closing: string): Scheme => SCHEMES[SCHEME_FOR_CLOSING[closing] ?? "charcoal"];
