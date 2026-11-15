import Section from "@/components/case/Section";
import { Stats, Stat } from "@/components/case/Stats";
import { Points, Point } from "@/components/case/Points";

/** Under the client logos: the scale of the work, set as the case studies' metric callouts. */
export function Scale() {
  return (
    <Section label="Some of the scale I've designed for">
      <Stats>
        <Stat value="400M+" label="consent records at HDFC Bank" />
        <Stat value="1,000+" label="proposals reviewed every month at DGE Abu Dhabi" />
        <Stat value="48h to 90 min" label="time to insight for the Sony team" />
        <Stat value="60+" label="deployments running on one design system" />
      </Stats>
    </Section>
  );
}

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

/** After the cases: three points, from the reflections in the case studies. */
export function Learned() {
  return (
    <Section label="A few things I've learned">
      <Points>
        <Point title="1. Trust comes from what people can see.">If the system did something, it should show it. The source behind an answer, a sync that failed, a label that says this draft was written by AI.</Point>
        <Point title="2. Some decisions should be slow.">A vote needs a reason. A consent needs a record. Not every screen is about saving clicks.</Point>
        <Point title="3. Simple doesn't mean less.">It means showing the right depth to the right person. That&apos;s why the agent builder has three modes instead of one.</Point>
      </Points>
    </Section>
  );
}
