import { site } from "@/lib/site";
import { ArrowLink } from "@/components/ui/ArrowLink";

/** "Get in touch" block for NDA projects: ruled top and bottom, text left, link right. */
export default function Confidential() {
  return (
    <aside className="mt-24 border-y border-rule px-5 pb-[31px] pt-6 md:-mb-[52px] md:mt-[241px] md:px-8">
      <div className="grid gap-6 md:grid-cols-2 md:gap-4">
        <h4 className="font-serif text-2xl font-normal leading-[32px] text-pigment-soft md:text-[2rem] md:leading-[50px] md:max-w-[648px]">
          Further details of this project are confidential. If you&apos;d like to know more, get in touch.
        </h4>
        <div className="self-start md:pt-[118px]">
          <ArrowLink href={site.gmail}>Get in touch</ArrowLink>
        </div>
      </div>
    </aside>
  );
}
