import { site, resumePdf } from "@/lib/site";
import { ArrowLink } from "@/components/ui/ArrowLink";

export function ContactLinks() {
  const links = [
    { label: "Email", href: site.gmail } as { label: string; href: string; download?: string },
    { label: "LinkedIn", href: site.linkedin },
    { label: "Resume", href: resumePdf, download: "Vishnu_Prasad_Resume_2026.pdf" },
    { label: "Portfolio 2023", href: site.oldPortfolio },
  ];
  return (
    <ul className="flex flex-wrap gap-x-10 gap-y-1">
      {links.map((l) => (
        <li key={l.label}>
          <ArrowLink href={l.href} download={l.download} diagonal>{l.label}</ArrowLink>
        </li>
      ))}
    </ul>
  );
}
