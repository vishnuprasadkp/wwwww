// Everything an MDX file can use. Add a component here to make it available to all case studies.
import Img from "@/components/ui/Img";
import Media from "@/components/ui/Media";
import Section from "@/components/case/Section";
import Feature from "@/components/case/Feature";
import SubProduct from "@/components/case/SubProduct";
import Confidential from "@/components/case/Confidential";
import { Points, Point, Pillars, Pillar } from "@/components/case/Points";
import { Stats, Stat, Source } from "@/components/case/Stats";
import { Gallery } from "@/components/about/Gallery";
import { ContactLinks } from "@/components/about/ContactLinks";

const Figure = ({ id }: { id: string }) => (
  <figure>
    <Img id={id} />
  </figure>
);

export const mdxComponents = {
  Img: Figure, Media, Section, Feature, SubProduct, Confidential,
  Points, Point, Pillars, Pillar, Stats, Stat, Source,
  Gallery, ContactLinks,
};
