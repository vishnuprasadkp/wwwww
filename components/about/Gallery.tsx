import Img from "@/components/ui/Img";

/**
 * Painting ticker. Both rows travel left together as one block at 120px/s (copy
 * repeated for a seamless loop), 10px gaps, no pause on hover.
 */
export function Gallery({ rows }: { rows: string[][] }) {
  return (
    <div className="full -mx-5 mt-0 overflow-hidden md:-mx-8 md:mt-[14px]">
      <div className="flex w-max animate-gallery gap-[10px] md:-ml-[10px]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex flex-col gap-[10px]" aria-hidden={copy === 1 || undefined}>
            {rows.map((ids, r) => (
              <ul key={r} className="flex gap-[9.33px]">
                {ids.map((id) => (
                  <li key={id} className="h-[260px] shrink-0 md:h-[375px]">
                    <Img id={id} sizes="(min-width: 768px) 280px, 190px" className="!h-full !w-auto" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
