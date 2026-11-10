import { site } from "@/lib/site";

/** The foot of every page: one small line, the contact on the left and the year on the right. */
export default function Footer() {
  return (
    <footer className="mt-14 md:mt-[90px] lg:mt-[140px]">
      <div className="flex flex-col justify-between gap-1 border-t border-rule px-5 pb-[27px] pt-[26px] font-mono text-[15px] leading-[24px] text-pigment-soft sm:flex-row md:px-8">
        <p className="hidden md:block">
          Lets Connect{" "}
          <a href={site.gmail} target="_blank" rel="noopener noreferrer" className="break-all hover:text-pigment">
            {site.email}
          </a>
        </p>
        <p>ⓒ {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
