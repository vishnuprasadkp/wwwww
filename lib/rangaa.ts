import fs from "node:fs/promises";
import path from "node:path";
import { site } from "@/lib/site";

/** Plain-text knowledge base built from the site's own content, so Rangaa only says what the portfolio says. */
let cache: string | null = null;

const strip = (mdx: string) => {
  const attrs: string[] = [];
  for (const m of mdx.matchAll(/(?:title|lead|label|value|linkLabel)="([^"]*)"/g)) attrs.push(m[1]);
  const body = mdx
    .replace(/^---[\s\S]*?---/, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/<[^>]*>/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return [...attrs, ...body].join("\n");
};

export async function knowledge() {
  if (cache) return cache;
  const dir = path.join(process.cwd(), "content/cases");
  const parts: string[] = [];
  for (const f of (await fs.readdir(dir)).filter((f) => f.endsWith(".mdx")).sort()) {
    const raw = await fs.readFile(path.join(dir, f), "utf8");
    const fm = raw.match(/^---([\s\S]*?)---/)?.[1] ?? "";
    const get = (k: string) => fm.match(new RegExp(`^${k}:\\s*(.*)$`, "m"))?.[1]?.replace(/^["']|["']$/g, "") ?? "";
    const slug = f.replace(/\.mdx$/, "");
    parts.push(
      `## CASE STUDY: ${get("title")}  (page: /work/${slug})\nClient: ${get("client")} | Platform: ${get("platform")} | Timeline: ${get("timeline")} | Role: ${get("role")}\nSummary: ${get("summary")}\n${strip(raw)}`,
    );
  }
  const about = await fs.readFile(path.join(process.cwd(), "content/pages/about.mdx"), "utf8");
  parts.push(`## ABOUT VISHNU  (page: /about)\n${strip(about)}`);
  const resume = await fs.readFile(path.join(process.cwd(), "content/resume.txt"), "utf8");
  parts.push(`## RESUME (page: /resume)\n${resume.trim()}`);
  parts.push(`## CONTACT\nEmail: ${site.email}\nResume: /resume (view, print or download)\nLinkedIn: ${site.linkedin}\nEarlier portfolio: ${site.oldPortfolio}`);
  cache = parts.join("\n\n");
  return cache;
}

export const systemPrompt = (kb: string) => `You are Rangaa, the AI on Vishnu Prasad's portfolio (vishnuprasad.design). You answer in Vishnu's own voice, in the first person ("I"), the way he would answer a curious recruiter, founder or fellow designer. Vishnu is a product designer with 5+ years of experience designing enterprise and AI products.

How to answer
- Visitors ask "you / your" questions ("What projects have you worked on?"). Answer directly as Vishnu: warm, confident, concrete, plain language.
- One short paragraph, 2-4 sentences. No headings, no bullet lists, no emoji, no jargon for its own sake.
- Use ONLY the facts in KNOWLEDGE below (case studies, About, resume). Never invent clients, numbers, dates, titles or opinions. If it isn't covered, say "I don't have that on hand - the best way is to email me at ${site.email}."
- If someone asks who or what you are: "I'm Rangaa, Vishnu's AI assistant, answering in his voice from his portfolio and resume." Never claim to be a human.
- When a case study is relevant, name it and link it like [Agent Workforce Platform](/work/ai-agent). Pages: /work/enterprise-search, /work/adeo, /work/ai-agent, /work/hdfc, /work/sony, /about, /resume.
- Hiring, collaboration, roles: be encouraging, share the email, don't promise availability or salary.
- Stay on topic (my work, process, background, skills). Politely decline anything unrelated.
- For job title, say "Lead Product Designer" as on the portfolio.

Output format (strict)
Write the answer, then on a NEW final line write exactly:
NEXT: <question 1> | <question 2> | <question 3>
Three short follow-up questions (max 8 words) written TO Vishnu in the visitor's voice, using "you/your" (e.g. "What's your favorite part of designing?"), relevant to what you just said and not repeating earlier questions.

KNOWLEDGE
${kb}`;

/* ---------- Offline responder (used when no ANTHROPIC_API_KEY is set) ---------- */

const CASES: { slug: string; keys: string[] }[] = [
  { slug: "enterprise-search", keys: ["search", "enterprise search", "knowledge"] },
  { slug: "adeo", keys: ["adeo", "committee", "board", "government", "dge", "abu dhabi"] },
  { slug: "ai-agent", keys: ["agent", "workflow", "assistant", "workforce"] },
  { slug: "hdfc", keys: ["hdfc", "consent", "bank", "preference"] },
  { slug: "sony", keys: ["sony", "media", "clm", "contract", "sports", "social"] },
];

const NEXT = (...q: string[]) => `\nNEXT: ${q.join(" | ")}`;

export async function localAnswer(question: string): Promise<string> {
  const q = question.toLowerCase();
  const dir = path.join(process.cwd(), "content/cases");
  const hit = CASES.find((c) => c.keys.some((k) => q.includes(k)));
  if (hit) {
    const raw = await fs.readFile(path.join(dir, `${hit.slug}.mdx`), "utf8");
    const fm = raw.match(/^---([\s\S]*?)---/)?.[1] ?? "";
    const get = (k: string) => fm.match(new RegExp(`^${k}:\\s*(.*)$`, "m"))?.[1]?.replace(/^["']|["']$/g, "") ?? "";
    return `That one is [${get("title")}](/work/${hit.slug}). ${get("summary")} I was the ${get("role").toLowerCase()} on it (${get("timeline")}).${NEXT("What was the hardest part?", "What did you learn from it?", "Which project are you proudest of?")}`;
  }
  if (/(hire|hiring|open to|available|work together|contact|email|reach|connect|opportunit)/.test(q))
    return `I'm always up for a good conversation about interesting problems. The easiest way to reach me is ${site.email}, and you can see my [resume here](/resume).${NEXT("What kind of work excites you?", "What have you worked on?", "What's your design process?")}`;
  if (/(experience|compan|career|history|employ|current|where (have|do) you work|job|title)/.test(q))
    return `I'm a product designer at Itu Chaudhuri Design, embedded with UnifyApps since October 2024, where I've worked on 60+ enterprise deployments for clients like HDFC Bank, Sony and DGE Abu Dhabi. Before that I led UX on 20+ client projects at Brane Enterprises, and designed an NFT marketplace end to end at Kocha Technologies. The full story is on my [resume](/resume).${NEXT("What projects have you worked on?", "How do you work with engineers?", "What makes your approach unique?")}`;
  if (/(skill|tool|figma|good at|strength|expertise|stack)/.test(q))
    return `My core is product and interaction design, information architecture, design systems and accessibility. I also work a lot with AI product design and agentic UX, and I use Figma, FigJam, Framer and Claude day to day. I like systems thinking and stakeholder work as much as the pixels.${NEXT("How do you design AI products?", "What have you built with design systems?", "Tell me about your design process")}`;
  if (/(process|approach|unique|different|method|research|how do you)/.test(q))
    return `My process is research-first. Before anything goes on a screen I map the whole system: the people, the dependencies, the goals and where things break. Then I own the work end to end, from discovery to shipped experience, with clear flows and reusable patterns so the product stays consistent. I trained as an architect, so I think of products the way I think of buildings: solid ground first.${NEXT("What projects have you worked on?", "How did architecture shape your design?", "What's your favorite part of designing?")}`;
  if (/(paint|sketch|hobby|outside|football|bike|travel|art|fun)/.test(q))
    return `Outside work I sketch and paint, mostly live sketching and watercolour. I also play football and love travelling and long bike rides. You can see some of my paintings at the bottom of the [about page](/about).${NEXT("What do you love about painting?", "How does it feed your design?", "What have you worked on?")}`;
  if (/(background|study|studied|architect|nit|planner|education|about|who are you|yourself)/.test(q))
    return `I'm Vishnu, a product designer with five years of experience in enterprise and AI products. I studied Planning & Architecture at NIT Bhopal, which taught me to understand a system before trying to change it, and that still shapes how I design. There's more on my [about page](/about).${NEXT("What projects have you worked on?", "Tell me about your design process", "What kind of work excites you?")}`;
  if (/(project|work|case|portfolio|built|designed|start|begin|first|show me|proud)/.test(q))
    return `I've mostly designed AI-powered enterprise products. A few I'd point you to: [Enterprise Search](/work/enterprise-search), the [Committee Board Agentic Application](/work/adeo), the [Agent Workforce Platform](/work/ai-agent), [HDFC's consent management](/work/hdfc) and [Sony's enterprise platforms](/work/sony).${NEXT("Tell me about the agent platform", "What was the HDFC project like?", "Which one are you proudest of?")}`;
  return `I'm Rangaa, Vishnu's AI assistant, answering in his voice from his portfolio and resume. Ask me about his projects, process, experience or background.${NEXT("What makes your design approach unique?", "What projects have you worked on?", "Tell me about your design process")}`;
}
