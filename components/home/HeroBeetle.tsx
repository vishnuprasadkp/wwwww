/**
 * The beetle on the right of the home hero: a minimal watercolour of a small beetle in flight, in slate grey and orange.
 * Painted layers (images in public/images/site/hero-beetle-air-*.webp, the paper turned into transparency so it sits on the
 * page's own paper): a drift of paint, one pair of wings (used for both sides) and the body. The body is drawn as four
 * parts cut from one image (core, antennae, left legs, right legs) so each can move on its own.
 * They are background images on divs, so the page's picture reveal leaves them alone; all the motion is in
 * globals.css (".hb-*"): the paint flows in, the beetle fades in through it, its wings open, then it hovers, every part
 * of it moving a little.
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
        <div className="hb-bodybox">
          <div className="hb-part hb-core" />
          <div className="hb-part hb-ant hb-ant-l" />
          <div className="hb-part hb-ant hb-ant-r" />
          <div className="hb-part hb-leg hb-leg-l" />
          <div className="hb-part hb-leg hb-leg-r" />
        </div>
      </div>
    </div>
  );
}
