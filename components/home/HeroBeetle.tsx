/**
 * The beetle on the right of the home hero: an ink-and-watercolour painting of a beetle taking off, in grey ink and orange.
 * It is built from four painted layers (paint wash, two wings, body; images in public/images/site/hero-beetle-*.webp, the
 * paper turned into transparency) so the wings can beat on their own. They are background images on divs, so the page's
 * picture reveal leaves them alone; all the motion is in globals.css (".hb-*"): the paint spreads, the beetle drifts in,
 * its wings unfold, then it hovers, wings beating softly.
 */
export default function HeroBeetle() {
  return (
    <div className="hb" aria-hidden="true">
      <div className="hb-wash" />
      <div className="hb-fly">
        <div className="hb-wing hb-wing-l">
          <div className="hb-wing-in" />
        </div>
        <div className="hb-wing hb-wing-r">
          <div className="hb-wing-in" />
        </div>
        <div className="hb-body" />
      </div>
    </div>
  );
}
