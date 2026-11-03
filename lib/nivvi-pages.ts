/**
 * What Nyrro knows about "where the visitor is". Pure data (no fs), shared by the panel (suggested
 * questions) and the API route (so answers and follow-ups stay on the page being read).
 * Every question here is answerable from that page's own content.
 */
export type PageInfo = {
  key: string;
  title: string;
  /** Page-specific starter questions; the first three are shown when the chat is empty. */
  prompts: string[];
  /** Case study slug, if this is a case study page. */
  slug?: string;
};

const HOME: PageInfo = {
  key: "home",
  title: "Vishnu's portfolio",
  prompts: ["What makes Vishnu's design approach unique?", "What has Vishnu worked on?", "How does Vishnu design?"],
};

const CASES: Record<string, PageInfo> = {
  "enterprise-search": {
    key: "enterprise-search",
    slug: "enterprise-search",
    title: "Intelligent Enterprise Search Platform",
    prompts: [
      "What problem was this search platform solving?",
      "How did he design for three different roles?",
      "What are Ask, Configure and Govern?",
      "What outcomes came from this platform?",
      "What did he learn from this project?",
    ],
  },
  adeo: {
    key: "adeo",
    slug: "adeo",
    title: "Committee Board Agentic Application",
    prompts: [
      "What was broken about committee meetings before?",
      "How does the AI help members in a session?",
      "How does voting work in this platform?",
      "What were the outcomes of this project?",
      "What did he learn designing for government?",
    ],
  },
  "ai-agent": {
    key: "ai-agent",
    slug: "ai-agent",
    title: "Agent Workforce Platform",
    prompts: [
      "What is the Agent Workforce Platform?",
      "Who did he design it for?",
      "How did he design the three kinds of agents?",
      "What are guardrails and observability here?",
      "What did he learn from this project?",
    ],
  },
  hdfc: {
    key: "hdfc",
    slug: "hdfc",
    title: "Consent at the scale of a nation's bank (HDFC)",
    prompts: [
      "What was the challenge with consent at HDFC?",
      "What results came out of this project?",
      "How did he design for regulation and customers?",
      "What did he learn from this project?",
    ],
  },
  sony: {
    key: "sony",
    slug: "sony",
    title: "Intelligence at the core of Asia's largest media group (Sony)",
    prompts: [
      "What are the four platforms in the Sony work?",
      "What was his role on the Sony projects?",
      "What results did these platforms deliver?",
      "What did he learn from this project?",
    ],
  },
};

const ABOUT: PageInfo = {
  key: "about",
  title: "About Vishnu",
  prompts: [
    "What is Vishnu's background?",
    "How does architecture shape his design?",
    "What does he do outside of design?",
    "How does he approach design?",
  ],
};

const RESUME: PageInfo = {
  key: "resume",
  title: "Vishnu's resume",
  prompts: [
    "Where has Vishnu worked?",
    "What are his core skills?",
    "What has he achieved at UnifyApps?",
    "What did he study?",
  ],
};

/** Page info for a pathname such as "/", "/work/adeo", "/about", "/resume". */
export function pageInfo(pathname: string | null | undefined): PageInfo {
  const p = (pathname ?? "/").replace(/\/+$/, "") || "/";
  if (p.startsWith("/work/")) return CASES[p.slice(6)] ?? HOME;
  if (p === "/about") return ABOUT;
  if (p === "/resume") return RESUME;
  return HOME;
}
