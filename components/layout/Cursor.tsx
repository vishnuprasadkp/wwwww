"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Black dot that follows the pointer. Over a project (`data-cursor="view"`) it
 * shrinks to 8px and an eye appears around it. Mouse/trackpad only.
 */
export default function Cursor() {
  const box = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [view, setView] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      if (box.current) box.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      setShown(true);
      setView(!!(e.target as Element | null)?.closest?.("[data-cursor='view']"));
    };
    const leave = () => setShown(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  const ease = "transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]";
  return (
    <div
      ref={box}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-[70px] w-[70px] [@media(hover:hover)_and_(pointer:fine)]:block"
      style={{ opacity: shown ? 1 : 0, transition: "opacity 0.3s", willChange: "transform" }}
    >
      <span
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black ${ease} ${view ? "h-2 w-2" : "h-3 w-3"}`}
      />
      <svg
        viewBox="0 0 36 26"
        className={`absolute left-1/2 top-1/2 h-[26px] w-9 -translate-x-1/2 -translate-y-1/2 ${ease} ${view ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
      >
        <path
          fillRule="evenodd"
          d="M 17.796 0 C 22.271 0 25.935 2.064 28.668 4.444 C 31.398 6.822 33.275 9.578 34.215 11.133 C 34.414 11.462 34.645 11.822 34.76 12.345 C 34.846 12.739 34.846 13.261 34.76 13.655 C 34.645 14.178 34.414 14.538 34.215 14.867 C 33.275 16.422 31.398 19.178 28.668 21.556 C 25.935 23.936 22.271 26 17.796 26 C 13.321 26 9.659 23.936 6.926 21.556 C 4.196 19.178 2.32 16.422 1.379 14.867 C 1.18 14.538 0.947 14.178 0.833 13.655 C 0.746 13.261 0.746 12.739 0.833 12.345 C 0.947 11.822 1.18 11.462 1.379 11.133 C 2.32 9.578 4.196 6.822 6.926 4.444 C 9.659 2.064 13.321 0 17.796 0 Z M 18.02 6.71 C 14.568 6.71 11.769 9.526 11.769 13 C 11.769 16.474 14.568 19.29 18.02 19.29 C 21.47 19.29 24.269 16.474 24.269 13 C 24.269 9.526 21.47 6.71 18.02 6.71 Z"
          fill="#000"
        />
      </svg>
    </div>
  );
}
