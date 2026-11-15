"use client";

import { ArrowLink } from "@/components/ui/ArrowLink";

/** "View work": glides down to the cases (smoothly, not a jump). */
export default function ViewWork() {
  return (
    <ArrowLink
      down
      onClick={() => {
        const to = document.getElementById("cases");
        if (!to) return;
        if (window.__lenis) window.__lenis.scrollTo(to, { duration: 1.6, offset: -24, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
        else to.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      View work
    </ArrowLink>
  );
}
