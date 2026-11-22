// v7: questions in other words, synonyms, typos, follow-ups, comparisons and honest misses.
// Each case is a conversation; the last question's topic must be the expected one.
const kb = require("../nyrro-knowledge-base.json"), C = require("../nyrro-matcher.js");
const T = [
  // AI agents, asked five different ways
  [["Has Vishnu worked on AI agents?"], "agentic"],
  [["What experience does he have with autonomous systems?"], "agentic"],
  [["Has he designed intelligent workflows?"], "agentic"],
  [["Tell me about his AI-powered products."], "ai-experience"],
  [["Can he design systems that automate business processes?"], "agentic"],
  [["does he do workflow automation"], "agentic"],
  // introductions and background
  [["Who is he?"], "who-is-vishnu"],
  [["introduce yourself vishnu"], "who-is-vishnu"],
  [["What's his professional background?"], "who-is-vishnu"],
  [["where has he worked before"], "career-history"],
  [["How many years has he been designing?"], "experience-years"],
  [["where did he study"], "education"],
  // enterprise UX, search, low-code, strategy, research
  [["Is he good at enterprise UX?"], "best-problems"],
  [["complex B2B software experience?"], "best-problems"],
  [["Has he worked on enterprise search?"], "enterprise-search:overview"],
  [["finding information across company tools"], "enterprise-search:overview"],
  [["low code platforms?"], "evidence:low-code"],
  [["no-code builder experience"], "evidence:low-code"],
  [["product strategy"], "skills-strategy"],
  [["discovery work"], "research"],
  [["does he do user research"], "research"],
  // leadership, collaboration, tools
  [["does he lead a team?"], "leadership"],
  [["how does he collaborate with developers"], "engineers"],
  [["what software does he use"], "tools"],
  // projects and follow-ups
  [["Tell me about the HDFC project", "what was the outcome?"], "hdfc:outcomes"],
  [["Tell me about the HDFC project", "what was the outcome?", "who were the users?"], "hdfc:users"],
  [["Tell me about Sony", "which one used AI?"], "sony:ai"],
  [["Tell me about Vishnu's AI experience.", "Which project demonstrates that?"], "examples:ai-experience"],
  [["Has he worked on AI agents?", "which project shows that"], "examples:agentic"],
  [["What are his AI skills?", "show me an example"], "examples:skills-ai"],
  [["low code platforms?", "where can I see that"], "examples:low-code"],
  [["what projects has he done"], "projects-list"],
  [["app", "show me his apps"], "repeat"],
  // comparisons and topics combined
  [["Compare Enterprise Search and Agent Workforce"], "compare:enterprise-search+agent-workforce"],
  [["difference between adeo and hdfc"], "compare:adeo+hdfc"],
  [["hdfc vs sony"], "compare:hdfc+sony"],
  [["AI and banking"], "domain-banking"],
  [["designing trustworthy AI for regulated industries"], "ai-trust"],
  [["what impact has his work had"], "success-metrics"],
  // spelling mistakes
  [["Has he worked on agnetic workflows?"], "agentic"],
  [["tell me about enterprize serch"], "enterprise-search:overview"],
  [["experiance with goverment projects"], "domain-government"],
  [["tell me abut the agent workfroce platform"], "agent-workforce:overview"],
  // nothing in his portfolio: say so
  [["what is his favourite food"], "fallback"],
  [["can he fly a plane"], "fallback"],
  [["does he know kubernetes"], "fallback"],
  [["what's the weather"], "off-topic"],
];
const key = m => m.type === "entity" ? m.id + ":" + m.aspect : m.type === "intent" ? m.id : m.type === "fallback" || m.type === "repeat" ? m.type : m.type + ":" + m.id;
let ok = 0; const bad = [];
for (const [qs, want] of T) {
  const n = C(kb); let r; for (const q of qs) r = n.ask(q);
  const got = key(r.match);
  if (got === want) ok++; else bad.push(`  ✗ ${qs.join(" → ")}  got ${got}, expected ${want}`);
  if (/undefined|\[object/.test(r.answer)) bad.push(`  ✗ broken answer for ${qs.join(" → ")}`);
}
console.log(`${ok}/${T.length} v7 understanding`); console.log(bad.join("\n"));
process.exit(bad.length ? 1 : 0);
