import Hero from "@/components/home/Hero";
import CaseList from "@/components/home/CaseList";
import { WorkOn } from "@/components/home/HomeSections";
import { getAllCases } from "@/lib/cases";

export default async function Home() {
  const cases = await getAllCases();
  return (
    <>
      <Hero />
      <WorkOn />
      <CaseList cases={cases} />
    </>
  );
}
