/**
 * Where the visitor is: the page's title and the starter questions the panel offers there.
 * Questions only; every one is answered by the locked Nyrro bundle (public/nyrro.bundle.js).
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
  prompts: ["Who is Vishnu?", "What are his core skills?", "How does he work with AI?"],
};

const CASES: Record<string, PageInfo> = {
  "enterprise-search": {
    key: "enterprise-search",
    slug: "enterprise-search",
    title: "Intelligent Enterprise Search Platform",
    prompts: [
      "What problem did Enterprise Search solve?",
      "Who were the users of Enterprise Search?",
      "What were the outcomes of Enterprise Search?",
      "What were the key design decisions on Enterprise Search?",
      "What did he learn from Enterprise Search?",
    ],
  },
  adeo: {
    key: "adeo",
    slug: "adeo",
    title: "Committee Board Agentic Application",
    prompts: [
      "What problem did ADEO solve?",
      "Who were the users of ADEO?",
      "What were the outcomes of ADEO?",
      "What were the key design decisions on ADEO?",
      "What did he learn from ADEO?",
    ],
  },
  "ai-agent": {
    key: "ai-agent",
    slug: "ai-agent",
    title: "Agent Workforce Platform",
    prompts: [
      "What problem did the Agent Workforce Platform solve?",
      "Who were the users of the Agent Workforce Platform?",
      "What were the outcomes of the Agent Workforce Platform?",
      "What were the key design decisions on the Agent Workforce Platform?",
      "What did he learn from the Agent Workforce Platform?",
    ],
  },
  hdfc: {
    key: "hdfc",
    slug: "hdfc",
    title: "Consent at the scale of a nation's bank (HDFC)",
    prompts: [
      "What problem did HDFC solve?",
      "Who were the users of HDFC?",
      "What were the outcomes of HDFC?",
      "What were the key design decisions on HDFC?",
      "What did he learn from HDFC?",
    ],
  },
  sony: {
    key: "sony",
    slug: "sony",
    title: "Intelligence at the core of Asia's largest media group (Sony)",
    prompts: [
      "What problem did Sony solve?",
      "Who were the users of Sony?",
      "What were the outcomes of Sony?",
      "What are the key features of Sony?",
      "What did he learn from Sony?",
    ],
  },
};

const ABOUT: PageInfo = {
  key: "about",
  title: "About Vishnu",
  prompts: [
    "What is Vishnu's background?",
    "How does architecture shape his design?",
    "What are his hobbies?",
    "How does he approach design?",
  ],
};

const RESUME: PageInfo = {
  key: "resume",
  title: "Vishnu's resume",
  prompts: [
    "What is his career history?",
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
