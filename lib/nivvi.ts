import fs from "node:fs/promises";
import path from "node:path";
import { site } from "@/lib/site";
import { pageInfo } from "@/lib/nivvi-pages";

/** Plain-text knowledge base built from the site's own content, so Nyrro only says what the portfolio says. */
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
  const nyrro = await fs.readFile(path.join(process.cwd(), "content/nyrro.md"), "utf8").catch(() => "");
  if (nyrro) parts.unshift(`## NYRRO AND THE THREADS THAT CONNECT VISHNU'S WORK\n${nyrro.trim()}`);
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

export const systemPrompt = (kb: string, pathname = "/") => `You are Nyrro, the small jewel-beetle guide who lives on Vishnu Prasad's portfolio (vishnuprasad.design). You speak as Nyrro, in the third person about Vishnu ("Vishnu designed...", "he", "his"), and you use "I" only for yourself ("I'm Nyrro"). You are warm, curious and quietly witty, with a light beetle touch (a trail, a wander, a closer look), never childish and never salesy. Visitors are recruiters, founders and designers who want to understand how Vishnu thinks and what he has built.

How to answer
- Be a guide, not a search box. Do not paste or paraphrase one section of the resume. Answer the actual question, then add the insight behind it: why a decision mattered, what connects two projects, what it says about how he works.
- Lead with the answer in the first sentence. Then give two to four sentences of substance (around 60 to 110 words). Use one concrete detail from the projects, such as a number, a role, a design decision, or a lesson, instead of generic praise.
- Connect ideas across his work when it helps: for example how architecture shaped his systems thinking, or how the same Ask, Configure and Govern thinking shows up in other AI work.
- Plain, natural sentences in short paragraphs. No headings, no bullet lists, no emoji, no corporate phrases like "passionate", "leverage" or "cutting-edge". Vary how you open; do not start every answer with "Great question".
- Use ONLY facts in KNOWLEDGE below. Never invent clients, numbers, dates, titles, quotes or opinions, and do not speculate about Vishnu's private life. If something is not covered, say so simply and point to ${site.email}. Being honest about gaps is part of your charm.
- Who or what you are: Nyrro, a beetle and the AI guide of this portfolio, created by Vishnu. You are not a human and not Vishnu. If asked why a beetle, tell the origin story from KNOWLEDGE briefly and warmly, in your own words.
- When a case study is relevant, name it and link it like [Agent Workforce Platform](/work/ai-agent). Pages: /work/enterprise-search, /work/adeo, /work/ai-agent, /work/hdfc, /work/sony, /about, /resume. At most two links per answer.
- Hiring, collaboration or roles: be encouraging, say what makes his work a good fit for the question, share the email, and never promise availability or salary.
- For job title, say "Lead Product Designer" as on the portfolio.
- Off-topic or silly questions: answer in one light line in character, then bring it back to Vishnu's work. Decline anything harmful or unrelated to the portfolio.
${pageBlock(pathname)}
Output format (strict)
Write the answer, then on a NEW final line write exactly:
NEXT: <question 1> | <question 2> | <question 3>
Three short follow-up questions (max 9 words) that the visitor could ask NEXT, written in the visitor's voice to you (Nyrro) and referring to Vishnu by name or "he/his" (e.g. "What does he enjoy most about designing?"). They must be relevant to your answer, different from earlier questions, and answerable from KNOWLEDGE.

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


/* The case studies are written in Vishnu's first person; Nyrro tells them in the third. */
const PRESENT: Record<string, string> = { am: "is", have: "has", own: "owns", map: "maps", believe: "believes", invest: "invests", evaluate: "evaluates", think: "thinks", see: "sees", try: "tries", love: "loves", design: "designs", work: "works", help: "helps", focus: "focuses", don: "doesn" };
export const thirdPerson = (t: string) =>
  t
    .replace(/\bI(?:'|’)m\b/g, "Vishnu is")
    .replace(/\bI(?:'|’)ve\b/g, "Vishnu has")
    .replace(/\bI(?:'|’)d\b/g, "Vishnu would")
    .replace(/\bI(?:'|’)ll\b/g, "Vishnu will")
    .replace(/\bI (am|have|own|map|believe|invest|evaluate|think|see|try|love|design|work|help|focus)\b/g, (_, v: string) => `Vishnu ${PRESENT[v]}`)
    .replace(/\bI don(?:'|’)t\b/g, "Vishnu doesn't")
    .replace(/\bI\b/g, "Vishnu")
    .replace(/\bmyself\b/g, "himself")
    .replace(/\bmy\b/gi, (m) => (m[0] === "M" ? "His" : "his"))
    .replace(/\bme\b/g, "him");

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
  const role = c.role ? ` Vishnu was the ${c.role.toLowerCase()} on it (${c.timeline}).` : "";
  return l ? `${sentences(c.lead(S[l]), 3)}${role}` : null;
}

export async function localAnswer(question: string, pathname = "/"): Promise<string> {
  const pg = pageInfo(pathname);
  // On a case-study page, questions are about that case unless they clearly name another one.
  if (pg.slug) {
    const q = question.toLowerCase();
    const other = CASES.find((c) => c.slug !== pg.slug && c.keys.some((k) => q.includes(k)));
    const general = /(nyrro|beetle|bug\b|who are you|what are you|who made you|trail|hire|hiring|why (should|would)|best at|stand out|open to|contact|email|reach|paint|hobb|football|resume|cv|study|studied|background|career|compan)/.test(q);
    if (!other && !general) {
      const ans = await caseAnswer(pg.slug, question).catch(() => null);
      if (ans) {
        const more = pg.prompts.filter((p) => p.toLowerCase() !== q).slice(0, 3);
        return `${thirdPerson(ans.replace(/\s+/g, " ").trim())}${NEXT(...more)}`;
      }
    }
  }
  if (pg.key === "resume" && /(achiev|unifyapps|accomplish|impact|deliver)/.test(question.toLowerCase()))
    return `At Itu Chaudhuri Design, embedded with UnifyApps since October 2024, Vishnu has driven design across 60+ enterprise deployments for clients like HDFC Bank, Sony Networks, Jubilant FoodWorks and DGE Abu Dhabi. For HDFC he designed consent and communication products under India's DPDP Act, supporting 30M+ customers, 400M+ consent records and 3M+ daily communications. He also owns and scales the UnifyApps design system and mentors six junior designers.${NEXT("Where has he worked?", "What are his core skills?", "What did he study?")}`;
  const general = await localAnswerGeneral(question);
  if (pg.key === "home") return general;
  const asked = question.toLowerCase().trim();
  const more = pg.prompts.filter((p) => p.toLowerCase() !== asked).slice(0, 3);
  return `${general.split("\nNEXT:")[0].trimEnd()}${NEXT(...more)}`;
}

async function localAnswerGeneral(question: string): Promise<string> {
  const q = question.toLowerCase();
  const dir = path.join(process.cwd(), "content/cases");
  if (/(nyrro|beetle|bug|who are you|what are you|who made you|your name|why a beetle|trail)/.test(q))
    return `I'm Nyrro, a small jewel beetle and the guide of this portfolio. Vishnu had never paid much attention to beetles until one caught his eye while he was building the site. Some beetles leave traces behind them, like the oily droplets of oil beetles, and he wondered what it would look like if a tiny creature left its own trail wherever it wandered, like a paintbrush across a canvas. That is why I walk the edges of these pages and paint in watercolour as I go.${NEXT("What does Vishnu do?", "Which projects should I look at first?", "What does he paint outside of work?")}`;
  const hit = CASES.find((c) => c.keys.some((k) => q.includes(k)));
  if (hit) {
    const raw = await fs.readFile(path.join(dir, `${hit.slug}.mdx`), "utf8");
    const fm = raw.match(/^---([\s\S]*?)---/)?.[1] ?? "";
    const get = (k: string) => fm.match(new RegExp(`^${k}:\\s*(.*)$`, "m"))?.[1]?.replace(/^["']|["']$/g, "") ?? "";
    return `Worth a closer look: [${get("title")}](/work/${hit.slug}). ${get("summary")} Vishnu was the ${get("role").toLowerCase()} on it (${get("timeline")}).${NEXT("What was the hardest part of it?", "What did he learn from it?", "Which project is he proudest of?")}`;
  }
  if (/(why (should|would)|best at|strongest|stand out|special|makes him)/.test(q))
    return `Two things stand out. Vishnu trained as an architect and planner, so he looks at the whole system behind a product before he draws a screen, and that shows in complex work like [Enterprise Search](/work/enterprise-search) and the [Agent Workforce Platform](/work/ai-agent). He also carries enterprise work all the way from discovery to launch, across 60+ deployments, while mentoring six junior designers.${NEXT("How did architecture shape his design?", "What is he like to work with?", "How can I reach him?")}`;
  if (/(hire|hiring|open to|available|work together|contact|email|reach|connect|opportunit)/.test(q))
    return `Vishnu is always up for a good conversation about interesting problems. The easiest way to reach him is ${site.email}, and his [resume is here](/resume). I can't speak for his availability, but a short note is the best next step.${NEXT("What kind of work excites him?", "What has he worked on?", "What is his design process?")}`;
  if (/(experience|compan|career|history|employ|current|where (has|have|does|do) .*work|job|title)/.test(q))
    return `Vishnu is a product designer at Itu Chaudhuri Design, embedded with UnifyApps since October 2024, where he has worked on 60+ enterprise deployments for clients like HDFC Bank, Sony and DGE Abu Dhabi. Before that he led UX on 20+ client projects at Brane Enterprises, and designed an NFT marketplace end to end at Kocha Technologies. The full trail is on his [resume](/resume).${NEXT("What projects has he worked on?", "How does he work with engineers?", "What makes his approach unique?")}`;
  if (/(skill|tool|figma|good at|strength|expertise|stack)/.test(q))
    return `His core is product and interaction design, information architecture, design systems and accessibility. Lately a lot of it is AI product design and agentic UX, and he uses Figma, FigJam, Framer and Claude day to day. Systems thinking and stakeholder work matter to him as much as the pixels.${NEXT("How does he design AI products?", "What has he built with design systems?", "What is his design process?")}`;
  if (/(process|approach|unique|different|method|research|how does he|how do you)/.test(q))
    return `Vishnu works research-first. Before anything goes on a screen he maps the whole system: the people, the dependencies, the goals and where things break. Then he owns the work end to end, with clear flows and reusable patterns so the product stays consistent. He trained as an architect, so he thinks of products the way he thinks of buildings: solid ground first.${NEXT("What projects has he worked on?", "How did architecture shape his design?", "What does he enjoy most about designing?")}`;
  if (/(paint|sketch|hobby|outside|football|bike|travel|art|fun)/.test(q))
    return `Away from the screen Vishnu sketches and paints, mostly live sketching and watercolour. He also plays football and loves travelling and long bike rides. Some of his paintings are at the bottom of the [about page](/about), and I borrow his watercolour trails when I wander.${NEXT("How does painting feed his design?", "What is his background?", "What has he worked on?")}`;
  if (/(architect|shape|nit bhopal|planning)/.test(q))
    return `Vishnu studied Planning & Architecture at NIT Bhopal, where he learned to understand systems before trying to change them: cities, infrastructure, land and people. He still designs that way. A product is never just a set of screens to him; it is the system behind them.${NEXT("What is his background?", "How does he approach design?", "What does he do outside of design?")}`;
  if (/(background|study|studied|nit|planner|education|about|yourself|vishnu)/.test(q))
    return `Vishnu is a Lead Product Designer with five years in enterprise and AI products. He studied Planning & Architecture at NIT Bhopal, which taught him to understand a system before trying to change it, and that still shapes how he designs. There is more on his [about page](/about).${NEXT("What projects has he worked on?", "What is his design process?", "What kind of work excites him?")}`;
  if (/(project|work|case|portfolio|built|designed|start|begin|first|show me|proud)/.test(q))
    return `Most of Vishnu's recent work is AI-powered enterprise design. If you only have a minute, start with [Enterprise Search](/work/enterprise-search), the [Agent Workforce Platform](/work/ai-agent) or the [Committee Board Agentic Application](/work/adeo). [HDFC's consent management](/work/hdfc) and [Sony's enterprise platforms](/work/sony) show the same thinking at national scale.${NEXT("Tell me about the agent platform", "What was the HDFC project like?", "Which one is he proudest of?")}`;
  return `I'm Nyrro, a small beetle and the guide of Vishnu's portfolio. I can walk you through his projects, process, background or how he thinks about design, and I will tell you honestly if something is not on the page.${NEXT("What makes Vishnu's approach unique?", "What has he worked on?", "Why a beetle?")}`;
}
