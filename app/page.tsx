import Hero from "@/components/home/Hero";
import CaseList from "@/components/home/CaseList";
import { Scale, WorkOn, Learned } from "@/components/home/HomeSections";
import { getAllCases } from "@/lib/cases";

export default async function Home() {
  const cases = await getAllCases();
  return (
    <>
      <Hero />
      <Scale />
      <WorkOn />
      <CaseList cases={cases} />
      <Learned />
    </>
  );
}
