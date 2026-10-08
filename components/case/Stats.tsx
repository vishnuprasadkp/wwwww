import { SourceLink } from "@/components/ui/ArrowLink";

export function Stats({ children }: { children: React.ReactNode }) {
  return <dl className="rc flex flex-col gap-[26px] md:max-w-[40rem]">{children}</dl>;
}

/** value: the headline figure. label: short caption under it. children: longer explanation. */
export function Stat({ value, label, children }: { value: string; label?: string; children?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[1.75rem] leading-[42px]">{value}</dt>
      {label && <dd className="text-base leading-[26px]">{label}</dd>}
      {children && <dd className="text-base leading-[26px]">{children}</dd>}
    </div>
  );
}

/** Attribution for figures the designer didn't measure. */
export function Source({ href, linkLabel, children }: { href?: string; linkLabel?: string; children: React.ReactNode }) {
  return (
    <p className="src">
      {children}
      {href && (
        <>
          <br />
          <SourceLink href={href}>{linkLabel ?? href}</SourceLink>
        </>
      )}
    </p>
  );
}
