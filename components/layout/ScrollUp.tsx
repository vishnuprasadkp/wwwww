"use client";

import { useEffect, useState } from "react";

/** Round "back to top" button, bottom centre. Appears once you scroll. */
export default function ScrollUp() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 200);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <a
      href="#header"
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      className={`group fixed bottom-3 left-1/2 z-10 h-[60px] w-[60px] -translate-x-1/2 transition-opacity duration-300 ${show ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <span className="absolute left-[5px] top-[5px] h-[50px] w-[50px] rounded-full bg-[#121212]" />
      <svg
        viewBox="0 0 18 18"
        className="absolute left-[21px] top-[21px] h-[18px] w-[18px] transition-[top] duration-200 group-hover:top-[17px]"
        fill="none"
        stroke="rgb(231,226,225)"
        strokeWidth="1.26"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 9 18 L 9 0 M 18 9 L 9 0 L 0 9" />
      </svg>
    </a>
  );
}
