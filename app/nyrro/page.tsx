import type { Metadata } from "next";
import NyrroFilm from "@/components/home/NyrroFilm";

export const metadata: Metadata = {
  title: "Nyrro",
  description: "Nyrro — Nature in Colour: the beetle of this portfolio, flying through its painting.",
};

export default function NyrroPage() {
  return <NyrroFilm />;
}
