import type { Metadata } from "next";
import fs from "node:fs/promises";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx";
import { site } from "@/lib/site";
import { ArrowLink } from "@/components/ui/ArrowLink";

export const metadata: Metadata = {
  title: "About",
  description: "Product designer, planner, and painter — finding structure in everything.",
};

export default async function About() {
  const source = await fs.readFile(path.join(process.cwd(), "content/pages/about.mdx"), "utf8");
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: { parseFrontmatter: true, blockJS: false },
  });

  return (
    <>
      {content}
      <section data-toc="Let’s connect" className="mt-16 border-y border-rule px-5 py-3 md:mt-[140px] md:py-6 md:px-8 lg:mt-[241px]">
        <div className="grid gap-6 md:grid-cols-2 md:gap-4">
          <p className="font-serif text-2xl leading-[32px] md:max-w-[40rem] md:text-[2rem] md:leading-[46px]">
            Let’s connect. Open to good conversations and interesting ideas.
          </p>
          <div className="self-start md:pt-[61px]">
            <ArrowLink href={site.gmail}>Get in touch</ArrowLink>
          </div>
        </div>
      </section>
    </>
  );
}
