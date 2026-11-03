import { site } from "@/lib/site";
import { ArrowLink } from "@/components/ui/ArrowLink";

/** "Get in touch" block for NDA projects: ruled top and bottom, text left, link right. */
export default function Confidential() {
  return (
    <aside className="mt-16 border-y border-rule px-5 py-5 md:mt-[140px] md:px-8 md:py-8 lg:-mb-[52px] lg:mt-[241px]">
      <div className="grid items-start gap-6 md:grid-cols-2 md:gap-4">
        <h4 className="font-serif text-[1.625rem] leading-[34px] text-pigment md:max-w-[648px] md:text-[1.75rem] md:leading-[38px]">
          Further details of this project are confidential. If you&apos;d like to know more, get in touch.
        </h4>
        <div className="md:pt-1">
          <ArrowLink href={site.gmail}>Get in touch</ArrowLink>
        </div>
      </div>
    </aside>
  );
}
