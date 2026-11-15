/**
 * The height a full-screen layer must have to reach the very foot of the screen. On a phone the page is drawn under the
 * browser's bars (the floating bar at the foot included), and the heights the browser reports (innerHeight, 100lvh) can
 * stop short of that, leaving the page showing through at the bottom. On a touch screen the device's own screen height
 * is the sure upper bound, so the layer is at least that tall.
 */
let probe: HTMLDivElement | null = null;
export function fullScreenHeight() {
  if (typeof window === "undefined") return 0;
  if (!probe) {
    probe = document.createElement("div");
    probe.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:100vh;height:100lvh;pointer-events:none;visibility:hidden";
    document.body.appendChild(probe);
  }
  let h = Math.max(window.innerHeight, probe.getBoundingClientRect().height, window.visualViewport?.height ?? 0);
  const touch = window.matchMedia("(pointer: coarse)").matches;
  if (touch) h = Math.max(h, window.screen.height || 0);
  return Math.ceil(h);
}
