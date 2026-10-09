const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type Props = {
  label?: string;
  title?: string;
  large?: boolean;      // 40px heading (About) instead of 36px
  intro?: boolean;      // title left, body right on the same row (About opener)
  stack?: boolean;      // body stays in the left column, a figure sits right
  statement?: boolean;  // second paragraph set large
  big?: boolean;        // right-column text at 18px (Sony)
  children: React.ReactNode;
};

/**
 * A chapter: a full-width ruled header (mono label + serif heading), then a
 * two-column body (see .case-grid in globals.css).
 */
export default function Section({ label, title, large, intro, stack, statement, big, children }: Props) {
  const id = label ?? title;
  const h = large ? "text-[1.875rem] leading-[40px] md:text-[2.5rem] md:leading-[54px]" : "text-[1.625rem] leading-[34px] md:text-4xl md:leading-[46px]";
  const grid = `case-grid ${stack ? "stack" : ""} ${statement ? "statement" : ""} ${big ? "big" : ""} ${large && !label ? "lead-lg" : ""}`;

  if (intro) {
    return (
      <section data-toc={title} className="px-5 pt-24 md:px-8 md:pt-[150px] lg:pt-[200px]">
        <div className="grid gap-4 md:grid-cols-2">
          <h1 className={`font-serif md:pr-10 ${h}`}>{title}</h1>
          <div className="space-y-7 text-base leading-[26px] md:max-w-[40rem] md:pt-1.5 [&>ul]:!mt-[17px]">{children}</div>
        </div>
      </section>
    );
  }

  const pad = large ? (label ? "pt-6 pb-[23px]" : "pt-[34px] pb-[25px]") : "pt-[21px] pb-[23px]";
  return (
    <section id={id ? slug(id) : undefined} data-toc={title} className="pt-16 md:pt-[140px] lg:pt-[241px]">
      <div className={`border-b border-rule px-5 md:px-8 ${pad}`}>
        {label && <p className={`font-mono text-base ${large ? "leading-8" : "leading-[26px]"} text-pigment-soft`}>{label}</p>}
        {title && <h2 className={`font-serif ${h} ${label ? "mt-2.5" : ""} md:max-w-[min(40rem,calc(50%-8px))]`}>{title}</h2>}
      </div>
      <div className={`${grid} mt-[11px] px-5 md:mt-[23px] md:px-8`}>{children}</div>
    </section>
  );
}
