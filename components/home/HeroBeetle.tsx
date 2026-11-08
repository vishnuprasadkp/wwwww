/**
 * The beetle on the right of the home hero: a watercolour in orange and grey, painted from layers of SVG
 * (ragged edges, pigment pooling at the rim and paper grain come from the filters below, not from images).
 * Each layer is its own static SVG, so the animations (see globals.css, ".hb-*") only move finished layers:
 * the paint blooms in, the beetle flies in through it and settles, then floats gently, its wings fluttering a few degrees.
 */

// Palette: the site's orange and a warm grey.
const ORANGE = "#EE6A22";
const ORANGE_LIGHT = "#F8AA5E";
const ORANGE_DEEP = "#C2410F";
const GREY = "#A09C99";
const GREY_MID = "#6B6764";
const GREY_DEEP = "#46423F";

/** Small seeded random numbers, so the server and the browser draw the same splatter. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const splatter = (() => {
  const r = rng(11);
  const colours = [ORANGE, ORANGE, ORANGE_LIGHT, GREY, GREY_MID, ORANGE_DEEP];
  return Array.from({ length: 58 }, (_, i) => {
    // two clusters: up and to the right (where the wash is wetter) and below-left (where it drips)
    const up = i % 3 !== 0;
    const x = up ? 330 + r() * 240 : 90 + r() * 260;
    const y = up ? 40 + r() * 300 : 330 + r() * 230;
    const big = r() > 0.86;
    return { x, y, r: big ? 4 + r() * 4 : 1.2 + r() * 2.6, c: colours[Math.floor(r() * colours.length)], o: 0.45 + r() * 0.45 };
  });
})();

/** Fine dark speckles on the wing cases, like the pigment spots in a painted animal. */
const speckles = (() => {
  const r = rng(29);
  return Array.from({ length: 46 }, () => ({ x: -78 + r() * 76, y: -52 + r() * 200, r: 0.7 + r() * 1.9, o: 0.3 + r() * 0.45 }));
})();

const drips = [
  { x: 214, y: 378, h: 92, w: 3.4, c: ORANGE },
  { x: 250, y: 410, h: 64, w: 2.6, c: GREY },
  { x: 372, y: 462, h: 78, w: 3, c: ORANGE_LIGHT },
  { x: 410, y: 440, h: 50, w: 2.4, c: GREY_MID },
];

/** The body of the beetle is drawn about its own centre, head up, and then turned and moved into place. */
const FLY = "translate(310 312) rotate(-18) scale(1.18)";

const Mirror = ({ children }: { children: React.ReactNode }) => <g transform="scale(-1 1)">{children}</g>;

function Elytron() {
  return (
    <g>
      <path
        d="M -6,-62 C -34,-70 -66,-52 -76,-12 C -86,34 -72,96 -46,132 C -32,152 -16,158 -4,150 C -12,100 -10,20 -6,-62 Z"
        fill="url(#hbElytra)"
        filter="url(#hbBody)"
      />
      {/* a darker glaze near the tip, and the fine grooves of the wing case */}
      <path d="M -10,70 C -34,80 -60,76 -72,60 C -64,108 -42,138 -20,150 C -10,150 -6,110 -10,70 Z" fill={GREY_MID} opacity="0.28" filter="url(#hbBody)" />
      <g fill="none" stroke={ORANGE_DEEP} strokeWidth="1.5" opacity="0.5" filter="url(#hbLine)">
        <path d="M -20,-50 C -28,0 -26,70 -16,126" />
        <path d="M -40,-42 C -54,10 -52,82 -33,122" />
        <path d="M -58,-24 C -70,28 -62,84 -42,116" />
      </g>
      <g clipPath="url(#hbClipE)" fill={GREY_DEEP}>
        {speckles.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} opacity={d.o} />
        ))}
      </g>
      {/* the light catching the case: paper left showing through */}
      <path d="M -62,-10 C -70,26 -62,70 -46,104" fill="none" stroke="#F6EFE6" strokeWidth="5" strokeLinecap="round" opacity="0.7" filter="url(#hbLine)" />
    </g>
  );
}

function HindWing() {
  return (
    <g>
      <path
        d="M -14,-50 C -48,-104 -132,-150 -214,-136 C -268,-126 -276,-76 -236,-38 C -196,-2 -112,26 -26,14 C -20,-10 -16,-30 -14,-50 Z"
        fill="url(#hbWing)"
        filter="url(#hbBody)"
      />
      <g fill="none" stroke={ORANGE_DEEP} strokeWidth="1.3" opacity="0.55" filter="url(#hbLine)">
        <path d="M -16,-44 C -70,-92 -150,-120 -232,-112" />
        <path d="M -16,-40 C -80,-70 -170,-80 -258,-70" />
        <path d="M -16,-34 C -80,-44 -170,-40 -262,-48" />
        <path d="M -18,-26 C -80,-10 -170,6 -240,-8" />
        <path d="M -20,-18 C -70,10 -140,24 -200,14" />
      </g>
    </g>
  );
}

export default function HeroBeetle() {
  return (
    <div className="hb" aria-hidden="true">
      {/* filters shared by every layer */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {/* big washes: wandering edges, uneven pigment, a darker rim where the paint pooled */}
          <filter id="hbWash" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.011 0.014" numOctaves="3" seed="7" result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="52" xChannelSelector="R" yChannelSelector="G" result="d" />
            <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="13" result="blot" />
            <feColorMatrix in="blot" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.7 -0.25" result="blotA" />
            <feComposite in="d" in2="blotA" operator="arithmetic" k1="0.7" k2="0.55" k3="0" k4="0" result="uneven" />
            <feMorphology in="d" operator="erode" radius="5" result="er" />
            <feGaussianBlur in="er" stdDeviation="6" result="erb" />
            <feComposite in="d" in2="erb" operator="out" result="ring" />
            <feColorMatrix in="ring" type="matrix" values="0.86 0 0 0 0  0 0.84 0 0 0  0 0 0.82 0 0  0 0 0 1 0" result="rimDark" />
            <feMerge>
              <feMergeNode in="uneven" />
              <feMergeNode in="rimDark" />
            </feMerge>
          </filter>
          {/* the beetle itself: a tighter edge, fine paper grain, a pooled rim */}
          <filter id="hbBody" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="7" xChannelSelector="R" yChannelSelector="G" result="d" />
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="9" result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.5 -0.1" result="grainA" />
            <feComposite in="d" in2="grainA" operator="arithmetic" k1="0.35" k2="0.75" k3="0" k4="0" result="grained" />
            <feMorphology in="d" operator="erode" radius="2.2" result="er" />
            <feGaussianBlur in="er" stdDeviation="2.2" result="erb" />
            <feComposite in="d" in2="erb" operator="out" result="ring" />
            <feColorMatrix in="ring" type="matrix" values="0.62 0 0 0 0  0 0.62 0 0 0  0 0 0.62 0 0  0 0 0 1 0" result="rimDark" />
            <feMerge>
              <feMergeNode in="grained" />
              <feMergeNode in="rimDark" />
            </feMerge>
          </filter>
          {/* thin lines: legs, feelers, veins */}
          <filter id="hbLine" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="2" result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="hbDot" x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="5" result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <clipPath id="hbClipE">
            <path d="M -6,-62 C -34,-70 -66,-52 -76,-12 C -86,34 -72,96 -46,132 C -32,152 -16,158 -4,150 C -12,100 -10,20 -6,-62 Z" />
          </clipPath>
          <linearGradient id="hbElytra" gradientUnits="userSpaceOnUse" x1="-40" y1="-70" x2="-24" y2="156">
            <stop offset="0" stopColor={ORANGE_LIGHT} stopOpacity="0.95" />
            <stop offset="0.45" stopColor={ORANGE} stopOpacity="0.95" />
            <stop offset="0.82" stopColor={ORANGE_DEEP} stopOpacity="0.9" />
            <stop offset="1" stopColor={GREY_MID} stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="hbWing" gradientUnits="userSpaceOnUse" x1="-14" y1="-30" x2="-270" y2="-80">
            <stop offset="0" stopColor={ORANGE_LIGHT} stopOpacity="0.5" />
            <stop offset="0.55" stopColor={GREY} stopOpacity="0.3" />
            <stop offset="1" stopColor={GREY_MID} stopOpacity="0.34" />
          </linearGradient>
          <radialGradient id="hbShield" cx="0.4" cy="0.3" r="0.8">
            <stop offset="0" stopColor={GREY} stopOpacity="0.85" />
            <stop offset="1" stopColor={GREY_MID} stopOpacity="0.92" />
          </radialGradient>
        </defs>
      </svg>

      {/* 1. the paint: orange and grey washes that bloom in one after another */}
      <svg viewBox="0 0 600 600" className="hb-layer hb-wash" style={{ ["--d" as string]: "0s" }}>
        <path d="M 96,176 C 170,70 340,36 462,104 C 548,152 540,262 478,318 C 418,370 300,352 218,326 C 130,298 46,250 96,176 Z" fill={ORANGE} opacity="0.66" filter="url(#hbWash)" />
        <circle cx="206" cy="150" r="26" fill={ORANGE_DEEP} opacity="0.3" filter="url(#hbWash)" />
      </svg>
      <svg viewBox="0 0 600 600" className="hb-layer hb-wash" style={{ ["--d" as string]: "0.7s" }}>
        <path d="M 150,118 C 230,86 330,100 380,150 C 330,176 230,170 150,118 Z" fill={ORANGE_LIGHT} opacity="0.7" filter="url(#hbWash)" />
        <path d="M 360,80 C 450,40 562,100 566,196 C 568,268 500,296 440,258 C 384,222 310,150 360,80 Z" fill={GREY} opacity="0.3" filter="url(#hbWash)" />
      </svg>
      <svg viewBox="0 0 600 600" className="hb-layer hb-wash" style={{ ["--d" as string]: "1.4s" }}>
        <path d="M 168,340 C 238,388 336,404 404,476 C 444,526 402,568 332,548 C 252,526 202,478 152,428 C 112,388 122,330 168,340 Z" fill={ORANGE_LIGHT} opacity="0.42" filter="url(#hbWash)" />
        <circle cx="398" cy="500" r="20" fill={ORANGE_DEEP} opacity="0.26" filter="url(#hbWash)" />
      </svg>

      {/* 2. drips and splatter, drifting a little */}
      <svg viewBox="0 0 600 600" className="hb-layer hb-drift" style={{ ["--d" as string]: "2.2s" }}>
        <g filter="url(#hbDot)">
          {drips.map((d, i) => (
            <g key={i} opacity="0.7">
              <rect x={d.x} y={d.y} width={d.w} height={d.h} rx={d.w / 2} fill={d.c} />
              <circle cx={d.x + d.w / 2} cy={d.y + d.h + 1} r={d.w * 1.1} fill={d.c} />
            </g>
          ))}
          {splatter.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.c} opacity={s.o} />
          ))}
        </g>
      </svg>

      {/* 3. the beetle, flying in through the paint, then floating */}
      <div className="hb-layer hb-fly">
        <svg viewBox="0 0 600 600" className="hb-wing hb-wing-l" style={{ transformOrigin: "47.7% 42.9%" }}>
          <g transform={FLY}>
            <HindWing />
          </g>
        </svg>
        <svg viewBox="0 0 600 600" className="hb-wing hb-wing-r" style={{ transformOrigin: "47.7% 42.9%" }}>
          <g transform={FLY}>
            <Mirror>
              <HindWing />
            </Mirror>
          </g>
        </svg>
        <svg viewBox="0 0 600 600" className="hb-body">
          <g transform={FLY}>
            {/* legs, tucked as it flies */}
            <g fill="none" stroke={GREY_DEEP} strokeWidth="3" strokeLinecap="round" opacity="0.85" filter="url(#hbLine)">
              {[1, -1].map((s) => (
                <g key={s} transform={`scale(${s} 1)`}>
                  <path d="M -26,-62 C -56,-72 -82,-98 -92,-128" />
                  <path d="M -32,-34 C -68,-30 -98,-8 -110,22" />
                  <path d="M -28,-12 C -58,22 -78,62 -84,98" />
                </g>
              ))}
            </g>
            {/* feelers */}
            <g fill="none" stroke={GREY_DEEP} strokeWidth="2.4" strokeLinecap="round" filter="url(#hbLine)">
              <path d="M -8,-116 C -18,-146 -44,-166 -72,-170" />
              <path d="M 8,-116 C 20,-144 46,-160 70,-160" />
              <circle cx="-74" cy="-170" r="3.4" fill={GREY_DEEP} />
              <circle cx="72" cy="-160" r="3.4" fill={GREY_DEEP} />
            </g>
            {/* the wing cases, opened a little as it flies */}
            <g transform="rotate(-11 -6 -58)">
              <Elytron />
            </g>
            <g transform="rotate(11 6 -58)">
              <Mirror>
                <Elytron />
              </Mirror>
            </g>
            {/* shield and head */}
            <path
              d="M -40,-72 C -30,-96 30,-96 40,-72 C 46,-58 38,-46 30,-40 C 12,-34 -12,-34 -30,-40 C -38,-46 -46,-58 -40,-72 Z"
              fill="url(#hbShield)"
              filter="url(#hbBody)"
            />
            <path d="M -30,-70 C -14,-80 14,-80 30,-70" fill="none" stroke={ORANGE_LIGHT} strokeWidth="4" strokeLinecap="round" opacity="0.7" filter="url(#hbLine)" />
            <path d="M -20,-96 C -22,-124 22,-124 20,-96 C 12,-90 -12,-90 -20,-96 Z" fill={GREY_DEEP} opacity="0.92" filter="url(#hbBody)" />
            <ellipse cx="-13" cy="-107" rx="5" ry="7" fill="#1E1B1A" opacity="0.8" />
            <ellipse cx="13" cy="-107" rx="5" ry="7" fill="#1E1B1A" opacity="0.8" />
          </g>
        </svg>
      </div>
    </div>
  );
}
