import Section from "@/components/case/Section";
import { Point } from "@/components/case/Points";

/** Before the cases: three short columns, in the case studies' titled-statement style. */
export function WorkOn() {
  return (
    <Section label="What I usually work on">
      <div className="full grid gap-6 md:grid-cols-3 md:gap-4">
        <Point title="Agentic products.">Agent builders, search and copilots, designed so people can see what the system did and step in when they need to.</Point>
        <Point title="Systems with real consequences.">Consent under India&apos;s DPDP Act, government decisions, contracts and board meetings. Every action here needs a record, so I design for that from day one.</Point>
        <Point title="Design systems.">I look after one system that runs across data quality, governance, workflow and agent products, reused in more than 60 deployments.</Point>
      </div>
    </Section>
  );
}
