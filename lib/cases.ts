import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content/cases");

export type CaseMeta = {
  slug: string;
  order: number;
  title: string;
  summary: string;
  tags: string[];      // shown above the title on the case page
  cardTags: string[];  // shown on the home page card
  client: string;
  platform: string;
  timeline: string;
  role: string;
  hero: string;        // asset ids from content/assets.json
  closing: string;
};

export async function getAllCases(): Promise<CaseMeta[]> {
  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".mdx"));
  const cases = await Promise.all(
    files.map(async (file) => {
      const { data } = matter(await fs.readFile(path.join(DIR, file), "utf8"));
      return { ...(data as Omit<CaseMeta, "slug">), slug: file.replace(/\.mdx$/, "") };
    }),
  );
  return cases.sort((a, b) => a.order - b.order);
}

export async function getCaseSource(slug: string) {
  try {
    return await fs.readFile(path.join(DIR, `${slug}.mdx`), "utf8");
  } catch {
    return null;
  }
}

/** The two cases that follow this one, wrapping around the list. */
export async function getNextCases(slug: string, count = 2) {
  const all = await getAllCases();
  const i = all.findIndex((c) => c.slug === slug);
  return Array.from({ length: count }, (_, k) => all[(i + 1 + k) % all.length]);
}
