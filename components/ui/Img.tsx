import Image from "next/image";
import { getAsset } from "@/lib/assets";

type Props = {
  id: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/** Renders a self-hosted image by its id in content/assets.json. */
export default function Img({ id, alt, priority, sizes = "(min-width: 1216px) 1216px, 100vw", className = "" }: Props) {
  const a = getAsset(id);
  return (
    <Image
      src={a.file}
      width={a.w}
      height={a.h}
      alt={alt ?? a.alt}
      priority={priority}
      sizes={sizes}
      className={`h-auto w-full ${className}`}
    />
  );
}
