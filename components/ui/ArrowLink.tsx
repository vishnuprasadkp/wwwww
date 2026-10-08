/**
 * Framer "View All Button": mono text + right arrow. On hover the arrow slides
 * in (17px -> 8px gap), 4px side padding appears and a 2px dark underline draws.
 */
export function ArrowLink({ href, children, className = "", diagonal = false }: { href: string; children: React.ReactNode; className?: string; diagonal?: boolean }) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group relative inline-flex h-[30px] w-max items-center px-0 font-mono text-base leading-[25px] text-pigment transition-[padding] duration-200 after:pointer-events-none after:absolute after:inset-0 after:border-b-2 after:border-transparent after:transition-colors after:duration-200 hover:px-1 hover:after:border-pigment ${className}`}
    >
      <span className="flex items-center gap-[17px] transition-[gap] duration-200 group-hover:gap-2">
        <span>{children}</span>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.73" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {diagonal ? (
            <path d="M 0 6.058 L 12.115 6.058 M 6.058 12.115 L 12.115 6.058 L 6.058 0" transform="translate(1.154 1.154) rotate(-45 6 6)" />
          ) : (
            <path d="M 1.154 7.212 L 13.269 7.212 M 7.212 13.269 L 13.269 7.212 L 7.212 1.154" />
          )}
        </svg>
      </span>
    </a>
  );
}

/**
 * Framer "UNIFY DIRECT": Geist 18px brown link + small arrow. Hover: gap 12 -> 6
 * and a 2px brown underline.
 */
export function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative mt-2 inline-flex w-max items-center pb-[7px] text-lg leading-[18px] text-pigment-soft after:pointer-events-none after:absolute after:inset-0 after:border-b-[1.5px] after:border-transparent after:transition-colors after:duration-200 hover:after:border-pigment-soft"
    >
      <span className="flex items-center gap-3 transition-[gap] duration-200 group-hover:gap-1.5">
        <span>{children}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.29" strokeLinecap="round" strokeLinejoin="round" className="mt-1" aria-hidden="true">
          <path d="M 1.27 5.77 L 10.27 5.77 M 5.77 10.27 L 10.27 5.77 L 5.77 1.27" />
        </svg>
      </span>
    </a>
  );
}
