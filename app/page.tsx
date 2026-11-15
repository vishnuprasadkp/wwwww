import Hero from "@/components/home/Hero";
import CaseList from "@/components/home/CaseList";
import { getAllCases } from "@/lib/cases";

export default async function Home() {
  const cases = await getAllCases();
  return (
    <>
      <Hero />
      <CaseList cases={cases} />
    </>
  );
}
