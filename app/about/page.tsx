import type { Metadata } from "next";
import fs from "node:fs/promises";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Product designer, planner, and painter — finding structure in everything.",
};

export default async function About() {
  const source = await fs.readFile(path.join(process.cwd(), "content/pages/about.mdx"), "utf8");
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: { parseFrontmatter: true },
  });

  return (
    <>
      {content}
      <section className="mt-24 border-y border-rule px-5 py-6 md:mt-[241px] md:px-8">
        <div className="grid gap-6 md:grid-cols-2 md:gap-4">
          <p className="font-serif text-[2rem] leading-[46px] md:max-w-[40rem]">
            Let’s connect. Open to good conversations and interesting ideas.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="self-start font-mono leading-[25px] text-pigment-soft underline-offset-4 hover:underline md:pt-[61px]"
          >
            Get in touch
          </a>
        </div>
      </section>
    </>
  );
}
