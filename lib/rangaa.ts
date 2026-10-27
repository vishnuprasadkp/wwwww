import fs from "node:fs/promises";
import path from "node:path";
import { site } from "@/lib/site";
import { pageInfo } from "@/lib/rangaa-pages";

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

const pageBlock = (pathname: string) => {
  const pg = pageInfo(pathname);
  if (pg.key === "home") return "";
  return `
Where the visitor is right now
- They are reading: ${pg.title} (${pathname}). "This project", "this page", "it", "here" all mean that page.
- Answer from that page's section of KNOWLEDGE first and stay on it. Keep the NEXT follow-up questions about this same page (at most one may point to another page).
- Good questions to expect here: ${pg.prompts.join(" | ")}
`;
};

export const systemPrompt = (kb: string, pathname = "/") => `You are Rangaa, the AI on Vishnu Prasad's portfolio (vishnuprasad.design). You answer in Vishnu's own voice, in the first person ("I"), the way he would answer a curious recruiter, founder or fellow designer. Vishnu is a product designer with 5+ years of experience designing enterprise and AI products.

How to answer
- Visitors ask "you / your" questions ("What projects have you worked on?"). Answer directly as Vishnu: warm, confident, concrete, plain language.
- One short paragraph, 2-4 sentences. No headings, no bullet lists, no emoji, no jargon for its own sake.
- Use ONLY the facts in KNOWLEDGE below (case studies, About, resume). Never invent clients, numbers, dates, titles or opinions. If it isn't covered, say "I don't have that on hand - the best way is to email me at ${site.email}."
- If someone asks who or what you are: "I'm Rangaa, Vishnu's AI assistant, answering in his voice from his portfolio and resume." Never claim to be a human.
- When a case study is relevant, name it and link it like [Agent Workforce Platform](/work/ai-agent). Pages: /work/enterprise-search, /work/adeo, /work/ai-agent, /work/hdfc, /work/sony, /about, /resume.
- Hiring, collaboration, roles: be encouraging, share the email, don't promise availability or salary.
- Stay on topic (my work, process, background, skills). Politely decline anything unrelated.
${pageBlock(pathname)}
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

/* Reads a case study's own text so offline answers are exact quotes of what the page says. */
const sentences = (t: string, n: number) => (t.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/).slice(0, n).join(" "));
const clean = (t: string) => t.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

async function readCase(slug: string) {
  const raw = await fs.readFile(path.join(process.cwd(), "content/cases", `${slug}.mdx`), "utf8");
  const fm = raw.match(/^---([\s\S]*?)---/)?.[1] ?? "";
  const get = (k: string) => fm.match(new RegExp(`^${k}:\\s*(.*)$`, "m"))?.[1]?.replace(/^["']|["']$/g, "") ?? "";
  const sections: Record<string, string> = {};
  for (const m of raw.matchAll(/<Section([^>]*)>([\s\S]*?)<\/Section>/g)) {
    const label = m[1].match(/label="([^"]*)"/)?.[1];
    if (label) sections[label] = m[2];
  }
  const lead = (body = "") => body.split("\n").map((l) => l.trim()).find((l) => l && !l.startsWith("<") && !l.startsWith("{")) ?? "";
  const list = (re: RegExp, body = "") => [...body.matchAll(re)].map((m) => m.slice(1).map((x) => clean(x ?? "")));
  const features = [...raw.matchAll(/<Feature title="([^"]*)" lead="([^"]*)"[^>]*>([\s\S]*?)<\/Feature>/g)].map((m) => ({
    title: m[1],
    lead: m[2],
    body: lead(m[3]),
  }));
  const products = [...raw.matchAll(/<SubProduct index=\{(\d)\} title="([^"]*)"/g)].map((m) => m[2]);
  return { title: get("title"), role: get("role"), timeline: get("timeline"), sections, lead, list, features, products };
}

async function caseAnswer(slug: string, question: string): Promise<string | null> {
  const q = question.toLowerCase();
  const c = await readCase(slug);
  const S = c.sections;
  const first = (...labels: string[]) => labels.find((l) => S[l]);
  const stats = () => c.list(/<Stat value="([^"]*)"[^>]*>([\s\S]*?)<\/Stat>/g, S["Outcomes"]).slice(0, 4).map(([v, t]) => `${v}${t ? ` (${t.replace(/\.$/, "")})` : ""}`);
  const points = (label?: string) => c.list(/<Point title="([^"]*)"/g, label ? S[label] : "").map(([t]) => t.replace(/\.$/, ""));

  if (slug === "hdfc" && /(regulat|complian|customer)/.test(q) && S["Reflections"]) {
    const l = "Reflections";
    return `${sentences(c.lead(S[l]), 3)} ${points(l).length ? `What that meant in practice: ${points(l).join("; ")}.` : ""}`;
  }
  if (/(learn|lesson|reflect|takeaway)/.test(q)) {
    const l = first("Reflections");
    return l ? `${sentences(c.lead(S[l]), 3)} ${points(l).length ? `The big lessons: ${points(l).join("; ")}.` : ""}` : null;
  }
  if (/(outcome|result|impact|achiev|deliver|numbers|metric|measure)/.test(q)) {
    const l = first("Outcomes");
    return l ? `${sentences(c.lead(S[l]), 3)} ${stats().length ? `For example: ${stats().join("; ")}.` : ""}` : null;
  }
  if (/(vot)/.test(q)) {
    const f = c.features.find((x) => /vot/i.test(x.title));
    if (f) return `${f.lead} ${sentences(f.body, 3)}`;
  }
  if (/(guardrail|observab)/.test(q)) {
    const f = c.features.find((x) => /guardrail/i.test(x.title));
    if (f) return `${f.lead}. ${sentences(f.body, 3)}`;
  }
  if (slug === "ai-agent" && /(simple|workflow agent|advanced|three kinds|types of agent)/.test(q)) {
    const fs3 = c.features.filter((x) => /(simple|workflow|advanced)/i.test(x.title));
    if (fs3.length) return fs3.map((f) => `${f.title}: ${f.lead.replace(/\.$/, "")}.`).join(" ");
  }
  if (slug === "adeo" && /(ai|assist|analys|brief|help)/.test(q)) {
    const fa = c.features.filter((x) => /(analysis|assistant)/i.test(x.title));
    if (fa.length) return fa.map((f) => `${f.lead.replace(/\.$/, "")}. ${sentences(f.body, 2)}`).join(" ");
  }
  if (slug === "sony" && /(platform|products|four|which)/.test(q) && c.products.length) {
    return `The Sony engagement covers ${c.products.length} platforms: ${c.products.join("; ")}. ${sentences(c.lead(S["Engagement"]), 2)}`;
  }
  if (/(ask|configure|govern|orchestrate|strateg|approach|pillar|tune)/.test(q)) {
    const l = first("Design Strategy");
    if (l) {
      const pillars = c.list(/<Pillar title="([^"]*)">([\s\S]*?)<\/Pillar>/g, S[l]).map(([t, x]) => `${t}: ${sentences(x, 1)}`);
      return `${sentences(c.lead(S[l]), 3)} ${pillars.join(" ")}`;
    }
  }
  if (/(role|three|different|user|who|persona|audience|designed for)/.test(q)) {
    const l = first("Discovery", "Engagement");
    if (l) return `${sentences(c.lead(S[l]), 3)} ${points(l).length ? `The roles and needs I designed around: ${points(l).join("; ")}.` : ""}`;
  }
  if (/(problem|challenge|broken|before|why|solving|issue|pain)/.test(q)) {
    const l = first("The Problem", "Engagement");
    if (l) {
      // an Engagement intro starts with "I worked directly with…"; the challenge is in the sentences after it
      const body = l === "Engagement" ? sentences(c.lead(S[l]), 4).split(/(?<=[.!?])\s+/).slice(1).join(" ") : sentences(c.lead(S[l]), 3);
      return `${body} ${points(l).length ? `Key problems: ${points(l).join("; ")}.` : ""}`;
    }
  }
  const l = first("Engagement");
  const role = c.role ? ` I was the ${c.role.toLowerCase()} on it (${c.timeline}).` : "";
  return l ? `${sentences(c.lead(S[l]), 3)}${role}` : null;
}

export async function localAnswer(question: string, pathname = "/"): Promise<string> {
  const pg = pageInfo(pathname);
  // On a case-study page, questions are about that case unless they clearly name another one.
  if (pg.slug) {
    const q = question.toLowerCase();
    const other = CASES.find((c) => c.slug !== pg.slug && c.keys.some((k) => q.includes(k)));
    const general = /(hire|hiring|open to|contact|email|reach|paint|hobb|football|resume|cv|study|studied|your background|career|compan)/.test(q);
    if (!other && !general) {
      const ans = await caseAnswer(pg.slug, question).catch(() => null);
      if (ans) {
        const more = pg.prompts.filter((p) => p.toLowerCase() !== q).slice(0, 3);
        return `${ans.replace(/\s+/g, " ").trim()}${NEXT(...more)}`;
      }
    }
  }
  if (pg.key === "resume" && /(achiev|unifyapps|accomplish|impact|deliver)/.test(question.toLowerCase()))
    return `At Itu Chaudhuri Design, embedded with UnifyApps since October 2024, I've driven design across 60+ enterprise deployments for clients like HDFC Bank, Sony Networks, Jubilant FoodWorks and DGE Abu Dhabi. For HDFC I designed consent and communication products under India's DPDP Act, supporting 30M+ customers, 400M+ consent records and 3M+ daily communications. I also own and scale the UnifyApps design system and mentor six junior designers.${NEXT("Where have you worked?", "What are your core skills?", "What did you study?")}`;
  const general = await localAnswerGeneral(question);
  if (pg.key === "home") return general;
  const asked = question.toLowerCase().trim();
  const more = pg.prompts.filter((p) => p.toLowerCase() !== asked).slice(0, 3);
  return `${general.split("\nNEXT:")[0].trimEnd()}${NEXT(...more)}`;
}

async function localAnswerGeneral(question: string): Promise<string> {
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
  if (/(architect|shape|nit bhopal|planning)/.test(q))
    return `I studied Planning & Architecture at NIT Bhopal, where I learned to understand systems before trying to change them — cities, infrastructure, land, and people. That thinking still shapes how I design today. I don't see a product as a collection of screens; I try to understand the system behind it first.${NEXT("What's your background?", "How do you approach design?", "What do you do outside of design?")}`;
  if (/(background|study|studied|nit|planner|education|about|who are you|yourself)/.test(q))
    return `I'm Vishnu, a product designer with five years of experience in enterprise and AI products. I studied Planning & Architecture at NIT Bhopal, which taught me to understand a system before trying to change it, and that still shapes how I design. There's more on my [about page](/about).${NEXT("What projects have you worked on?", "Tell me about your design process", "What kind of work excites you?")}`;
  if (/(project|work|case|portfolio|built|designed|start|begin|first|show me|proud)/.test(q))
    return `I've mostly designed AI-powered enterprise products. A few I'd point you to: [Enterprise Search](/work/enterprise-search), the [Committee Board Agentic Application](/work/adeo), the [Agent Workforce Platform](/work/ai-agent), [HDFC's consent management](/work/hdfc) and [Sony's enterprise platforms](/work/sony).${NEXT("Tell me about the agent platform", "What was the HDFC project like?", "Which one are you proudest of?")}`;
  return `I'm Rangaa, Vishnu's AI assistant, answering in his voice from his portfolio and resume. Ask me about his projects, process, experience or background.${NEXT("What makes your design approach unique?", "What projects have you worked on?", "Tell me about your design process")}`;
}
