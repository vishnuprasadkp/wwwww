import Img from "@/components/ui/Img";

/** One product inside a multi-product engagement (Sony): lead left; capabilities and figures right; image below. */
export default function SubProduct({
  index, title, capabilities, image, children,
}: { index: number; title: string; capabilities: string; image: string; children: React.ReactNode }) {
  return (
    <article>
      <div className="-mx-5 border-b border-rule px-5 pb-[23px] pt-[21px] md:-mx-8 md:px-8">
        <p className="font-mono text-base leading-[26px] text-pigment-soft">Product {index}</p>
        <h3 className="mt-2.5 font-serif text-[1.625rem] leading-[34px] md:max-w-[min(40rem,calc(50%-8px))] md:text-4xl md:leading-[46px]">{title}</h3>
      </div>
      <div className="case-grid sub mt-5 md:mt-8">
        {children}
        <p className="cap">{capabilities}</p>
      </div>
      <figure className="mt-8 md:mt-11">
        <Img id={image} />
      </figure>
    </article>
  );
}
