"use client";

import { useEffect, useState } from "react";
import { ambience } from "@/lib/ambience";

/**
 * Sound on and off, at the top right of the film, as an icon alone: four little bars that dance while the sound plays and lie flat when it
 * is off.
 */
export default function SoundToggle({ shown = true }: { shown?: boolean }) {
  const [on, setOn] = useState(true);
  useEffect(() => ambience().subscribe(setOn), []);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        ambience().setOn(!on);
      }}
      aria-pressed={on}
      aria-label={on ? "Turn the sound off" : "Turn the sound on"}
      tabIndex={shown ? 0 : -1}
      className="absolute right-5 top-5 z-10 -m-2 flex items-center p-2 font-mono text-[15px] leading-[19px] text-white/80 hover:text-white md:right-8 md:top-8"
      style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(-6px)", pointerEvents: shown ? "auto" : "none", transition: "opacity 0.5s ease 0.2s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s" }}
    >
      <span aria-hidden="true" className="flex h-[14px] items-end gap-[2.5px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="nyrro-bar block w-[2px] rounded-full bg-current"
            style={{
              height: 14,
              transformOrigin: "bottom",
              transform: on ? undefined : "scaleY(0.16)",
              animation: on ? `nyrro-bar 1.${1 + i * 2}s ease-in-out ${-i * 0.37}s infinite alternate` : "none",
              transition: "transform 0.4s ease",
            }}
          />
        ))}
      </span>
    </button>
  );
}
