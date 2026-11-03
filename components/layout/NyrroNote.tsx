"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A small greeting in the corner of the painting ("Hi, I'm Nyrro"). Hover it (or tap it on a phone) and a longer note opens
 * above it: what the beetle is, and why it is in this portfolio. It sits over the painting without taking part in its layout.
 */
export default function NyrroNote() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(0);

  const show = () => {
    window.clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 160); // a short grace so the pointer can move from the pill to the card
  };

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const mouse = (e: React.PointerEvent) => e.pointerType === "mouse";

  return (
    // the wrapper itself never catches the pointer (an empty box still would): only the button does, and the note once it is open;
    // there is no gap between them, so the pointer can travel from one to the other
    <div
      ref={box}
      className="pointer-events-none absolute right-4 top-4 z-10 flex flex-col items-end md:right-8 md:top-7"
      onPointerEnter={(e) => mouse(e) && show()}
      onPointerMove={(e) => mouse(e) && !open && show()}
      onPointerLeave={(e) => mouse(e) && hide()}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="nyrro-note"
        onClick={() => (open ? setOpen(false) : show())}
        onFocus={show}
        className="pointer-events-auto flex items-center gap-2 border border-rule nyrro-paper py-1.5 px-3.5 font-mono text-[14px] leading-5 text-pigment transition-[filter] hover:brightness-95"
      >
        About Nyrro
      </button>

      <div className={`pt-2 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          id="nyrro-note"
          role="region"
          aria-label="About Nyrro"
          aria-hidden={!open}
          className={`w-[min(calc(100vw-40px),380px)] nyrro-paper border border-rule p-5 text-left transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-y-0 opacity-100" : "-translate-y-1.5 opacity-0"}`}
        >
          <h3 className="font-serif text-[18px] leading-[28px] text-pigment">Nyrro &mdash; Nature in Colour</h3>
          <p className="mt-3 text-[16px] md:text-[14px] leading-6 text-pigment">
            I&rsquo;d never really paid much attention to beetles before. But while working on this portfolio, one caught my eye and made me curious to explore their little world. The more I looked into them, the more I discovered some fascinating things about their natural defence mechanisms &mdash; from the oily droplets of oil beetles to the chemical spray of bombardier beetles, which can leave traces of their own.
          </p>
          <p className="mt-3 text-[16px] md:text-[14px] leading-6 text-pigment">
            That sparked an idea: what if a tiny creature left its own trail wherever it wandered, like a paintbrush moving across a canvas? That&rsquo;s how Nyrro came to life &mdash; part observation, part imagination, and a little expression of my love for nature, painting, and creative exploration.
          </p>
        </div>
      </div>
    </div>
  );
}
