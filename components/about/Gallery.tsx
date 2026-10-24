import Img from "@/components/ui/Img";

/**
 * Painting ticker. Both rows travel left together as one block at 120px/s. The strip is two identical
 * copies; each carries its own 10px right gap, so the loop distance is exactly -50% (a clean seam).
 */
export function Gallery({ rows }: { rows: string[][] }) {
  return (
    <div className="full -mx-5 mt-0 overflow-hidden md:-mx-8 md:mt-[14px]">
      <div className="flex w-max animate-gallery [backface-visibility:hidden] [transform:translateZ(0)] [will-change:transform] md:-ml-[10px]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex flex-col gap-[10px] pr-[10px]" aria-hidden={copy === 1 || undefined}>
            {rows.map((ids, r) => (
              <ul key={r} className="flex gap-[9.33px]">
                {ids.map((id) => (
                  <li key={id} className="h-[260px] shrink-0 md:h-[375px]">
                    <Img id={id} eager sync sizes="(min-width: 768px) 400px, 260px" className="!h-full !w-auto" />
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
