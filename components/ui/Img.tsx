import Image from "next/image";
import { getAsset } from "@/lib/assets";
import { blurFor } from "@/lib/blur";

type Props = {
  id: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/** Renders a self-hosted image by its id in content/assets.json, with a blur-up placeholder. */
export default function Img({ id, alt, priority, sizes = "(min-width: 768px) calc(100vw - 64px), 100vw", className = "" }: Props) {
  const a = getAsset(id);
  const blurDataURL = blurFor(a.file);
  return (
    <Image
      src={a.file}
      width={a.w}
      height={a.h}
      alt={alt ?? a.alt}
      priority={priority}
      sizes={sizes}
      quality={90}
      {...(blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {})}
      className={`h-auto w-full ${className}`}
    />
  );
}
