import Pic from "./Pic";
import { getAsset } from "@/lib/assets";

type Props = {
  id: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/** Renders a self-hosted image by its id in content/assets.json. */
export default function Img({ id, alt, priority, sizes = "(min-width: 768px) calc(100vw - 64px), 100vw", className = "" }: Props) {
  const a = getAsset(id);
  return <Pic file={a.file} alt={alt ?? a.alt} priority={priority} sizes={sizes} className={`h-auto w-full ${className}`} />;
}
