/**
 * The beetle on the right of the home hero: a watercolour painting of a flying beetle in orange and grey
 * (public/images/site/hero-beetle.webp, its paper turned into transparency so it sits on the page's own paper).
 * It is a background image on a div, so the page's picture reveal leaves it alone; the motion is in globals.css (".hb-art"):
 * the paint spreads outwards from the beetle, the beetle drifts in and settles, then it floats gently.
 */
export default function HeroBeetle() {
  return (
    <div className="hb" aria-hidden="true">
      <div className="hb-art" />
    </div>
  );
}
