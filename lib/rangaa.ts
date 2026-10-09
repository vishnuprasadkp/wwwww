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
  parts.push(`## CONTACT\nEmail: ${site.email}\nResume: /resume (view, print or download)\nLinkedIn: ${site.linkedin}\nEarlier portfolio: ${site.oldPortfolio}`);
  cache = parts.join("\n\n");
  return cache;
}

export const systemPrompt = (kb: string) => `You are Rangaa, the AI assistant on Vishnu Prasad's portfolio website (vishnuprasad.design). Vishnu is a Lead Product Designer (5+ years) who designs enterprise and AI products.

How to talk
- Warm, calm and concise: 2-5 short sentences, plain language, no jargon, no emoji, no headings, no bullet lists unless the visitor asks for a list.
- Refer to Vishnu in the third person ("Vishnu led...", "he designed..."). You are his assistant, not him.
- Use ONLY the facts in KNOWLEDGE below. Never invent clients, numbers, dates or opinions. If something isn't covered, say you don't have that detail and point to his email (${site.email}).
- When a case study is relevant, mention it and link it like [Agent Workforce Platform](/work/ai-agent). Pages: /work/enterprise-search, /work/adeo, /work/ai-agent, /work/hdfc, /work/sony, /about.
- For hiring, collaboration or roles: be encouraging and share his email. Do not promise availability or salary.
- Stay on topic (Vishnu, his work, process, background). Politely decline unrelated requests.
- Like a good guide, end by steering the visitor toward what they might want next.

Output format (strict)
Write the reply, then on a NEW final line write exactly:
NEXT: <question 1> | <question 2> | <question 3>
The three questions are short (max 7 words), in the visitor's voice, and relevant to what you just said.

KNOWLEDGE
${kb}`;

/* ---------- Offline responder (used when no ANTHROPIC_API_KEY is set) ---------- */

const CASES: { slug: string; keys: string[]; name: string }[] = [
  { slug: "enterprise-search", keys: ["search", "enterprise search", "unifyapps", "knowledge"], name: "Intelligent Enterprise Search Platform" },
  { slug: "adeo", keys: ["adeo", "committee", "board", "government", "dge", "abu dhabi"], name: "Committee Board Agentic Application" },
  { slug: "ai-agent", keys: ["agent", "workflow", "assistant", "workforce"], name: "Agent Workforce Platform" },
  { slug: "hdfc", keys: ["hdfc", "consent", "bank", "preference"], name: "Consent at the scale of a nation's bank" },
  { slug: "sony", keys: ["sony", "media", "clm", "contract", "sports", "social"], name: "Sony enterprise platforms" },
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
    return `[${get("title")}](/work/${hit.slug}) — ${get("summary")} Vishnu's role was ${get("role").toLowerCase()} (${get("timeline")}).${NEXT("What was the hardest part?", "Show me another case study", "Is he open to roles?")}`;
  }
  if (/(hire|hiring|role|open to|available|work together|contact|email|reach|connect|resume|cv)/.test(q))
    return `Vishnu is always glad to talk about interesting problems. The quickest way to reach him is by email at ${site.email}, and his [resume is here](/resume).${NEXT("What does Vishnu do?", "Where should I start?", "Tell me about his process")}`;
  if (/(process|approach|how does he|method|research)/.test(q))
    return `Vishnu's process is research-first. He maps the full system — people, dependencies, goals and where things break — before anything goes on a screen. Then he owns the work end to end, from discovery to shipped experience, building clear flows and reusable patterns so products stay consistent.${NEXT("Which case shows this best?", "What is his background?", "How does he work with teams?")}`;
  if (/(paint|sketch|hobby|outside|football|bike|travel|art)/.test(q))
    return `Outside work Vishnu sketches and paints, mostly live sketching and watercolour. He also plays football and loves travelling and long bike rides. You can see his paintings at the bottom of the [about page](/about).${NEXT("What does Vishnu do?", "Tell me about his process", "Show me a case study")}`;
  if (/(background|study|studied|architect|nit|planner|education|about|who|what does|what do you|does vishnu|does he do|his job|his role)/.test(q))
    return `Vishnu is a Lead Product Designer at ICD with five years of experience designing enterprise and AI-powered products. He studied Planning & Architecture at NIT Bhopal, which taught him to understand a system before trying to change it — and that still shapes how he designs. More on the [about page](/about).${NEXT("What projects has he worked on?", "Tell me about his process", "Is he open to roles?")}`;
  if (/(project|work|case|portfolio|built|designed|start|begin|first|show me)/.test(q))
    return `Five case studies are on the site: [Enterprise Search](/work/enterprise-search), [Committee Board Agentic Application](/work/adeo), [Agent Workforce Platform](/work/ai-agent), [HDFC consent management](/work/hdfc) and [Sony's enterprise platforms](/work/sony). Most are AI-powered enterprise products.${NEXT("Tell me about the agent platform", "What was the HDFC project?", "What is his process?")}`;
  return `Hey — I'm Rangaa, Vishnu's AI assistant. He designs enterprise and AI products; I can walk you through his case studies, his process or his background.${NEXT("Where should I start?", "What does Vishnu do?", "Is he open to roles?")}`;
}
