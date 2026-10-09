import { site } from "@/lib/site";
import { ArrowLink } from "@/components/ui/ArrowLink";

export function ContactLinks() {
  const links = [
    { label: "Email", href: site.gmail },
    { label: "LinkedIn", href: site.linkedin },
    { label: "Resume", href: "/resume" },
    { label: "Portfolio 2023", href: site.oldPortfolio },
  ];
  return (
    <ul className="flex flex-wrap gap-x-10 gap-y-1">
      {links.map((l) => (
        <li key={l.label}>
          <ArrowLink href={l.href} diagonal>{l.label}</ArrowLink>
        </li>
      ))}
    </ul>
  );
}
