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
      <section id="lets-connect" data-toc="Let’s connect" className="mt-14 border-y border-rule px-5 py-5 md:mb-[60px] md:mt-[150px] md:px-8 md:py-8 lg:mb-[100px] lg:mt-[240px]">
        <div className="grid items-start gap-6 md:grid-cols-2 md:gap-4">
          <p className="font-serif text-[1.625rem] leading-[34px] text-pigment md:max-w-[40rem] md:text-[2rem] md:leading-[42px]">
            Let’s connect. Open to good conversations and interesting ideas.
          </p>
          <div className="md:pt-1.5">
            <ArrowLink href={site.gmail}>Get in touch</ArrowLink>
          </div>
        </div>
      </section>
    </>
  );
}
