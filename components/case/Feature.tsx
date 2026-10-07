import Media from "@/components/ui/Media";
import Img from "@/components/ui/Img";
import { getAsset, isWide } from "@/lib/assets";

type Props = {
  title: string;     // the surface's name, e.g. "Connect Applications"
  lead: string;      // one-line framing
  note?: string;     // right-column pull-out
  images?: string[];
  children?: React.ReactNode;
};

export default function Feature({ title, lead, note, images = [], children }: Props) {
  // One near-square screenshot sits in the right column beside the copy; everything else goes below.
  const side = images.length === 1 && !isWide(getAsset(images[0]));
  return (
    <article>
      <div className="-mx-5 border-b border-rule px-5 pb-[23px] pt-[21px] md:-mx-8 md:px-8">
        <h3 className="font-serif text-[2rem] leading-[50px]">{title}</h3>
      </div>
      <div className="mt-8 grid gap-[26px] md:grid-cols-2 md:gap-x-4">
        <div className="md:max-w-[40rem]">
          <p className="text-xl leading-[30px]">{lead}</p>
          {children && <div className="mt-1.5 space-y-[26px] text-base leading-[26px]">{children}</div>}
        </div>
        {side ? <Img id={images[0]} sizes="(min-width: 768px) 50vw, 100vw" /> : note && <p className="text-xl leading-[30px] md:max-w-[40rem]">{note}</p>}
      </div>
      {images.length > 0 && !side && (
        <div className="mt-8">
          <Media ids={images} />
        </div>
      )}
    </article>
  );
}
