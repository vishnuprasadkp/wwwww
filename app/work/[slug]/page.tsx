import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { getAllCases, getCaseSource, getNextCases, type CaseMeta } from "@/lib/cases";
import { getAsset } from "@/lib/assets";
import { mdxComponents } from "@/components/mdx";
import CaseHero from "@/components/case/CaseHero";
import NextProjects from "@/components/case/NextProjects";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllCases()).map((c) => ({ slug: c.slug }));
}

async function load(slug: string) {
  const source = await getCaseSource(slug);
  if (!source) notFound();
  return compileMDX<Omit<CaseMeta, "slug">>({
    source,
    components: mdxComponents,
    options: { parseFrontmatter: true, blockJS: false },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { frontmatter: fm } = await load(slug);
  const image = getAsset(fm.hero).file;
  return {
    title: fm.title,
    description: fm.summary,
    openGraph: { title: fm.title, description: fm.summary, images: [image] },
    twitter: { card: "summary_large_image", title: fm.title, description: fm.summary, images: [image] },
  };
}

export default async function CasePage({ params }: Params) {
  const { slug } = await params;
  const { content, frontmatter } = await load(slug);
  const meta = { ...frontmatter, slug };
  const next = await getNextCases(slug);

  return (
    <article>
      <CaseHero meta={meta} />
      {content}
      <NextProjects closing={meta.closing} next={next} />
    </article>
  );
}
