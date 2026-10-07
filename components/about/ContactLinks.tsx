import { site } from "@/lib/site";

export function ContactLinks() {
  const links = [
    { label: "Email", href: `mailto:${site.email}` },
    { label: "LinkedIn", href: site.linkedin },
    { label: "Resume", href: site.resume },
    { label: "Portfolio 2023", href: site.oldPortfolio },
  ];
  return (
    <ul className="flex flex-wrap gap-x-[72px] gap-y-1 font-mono leading-[25px] text-pigment-soft">
      {links.map((l) => (
        <li key={l.label}>
          <a
            href={l.href}
            target={l.href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="hover:underline underline-offset-4"
          >
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
