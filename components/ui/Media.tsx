import Img from "./Img";
import { getAsset, isWide } from "@/lib/assets";

/** Screenshot grid. Landscape shots span the full width; near-square shots pair up two-across. */
export default function Media({ ids }: { ids: string[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {ids.map((id) => {
        const wide = isWide(getAsset(id));
        return (
          <figure key={id} className={wide ? "md:col-span-2" : ""}>
            <Img id={id} sizes={wide ? undefined : "(min-width: 768px) 50vw, 100vw"} />
          </figure>
        );
      })}
    </div>
  );
}
