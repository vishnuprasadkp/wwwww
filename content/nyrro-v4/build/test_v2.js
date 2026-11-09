// Multi-turn conversations: checks v2 behaviour (no repeats, honest unknowns, case studies first, apps).
const kb=require("../nyrro-knowledge-base.json"),n=require("../nyrro-matcher.js")(kb);
const key=r=>{const m=r.match;return m.type==="entity"?`${m.id}:${m.aspect}`:m.type==="intent"?m.id:m.type+(m.id?":"+m.id:"")};
const convs=[
 ["Recruiter",[["hi","greeting"],["who is vishnu","who-is-vishnu"],["tell me about vishnu","repeat:who-is-vishnu"],["how many years of experience","experience-years"],["what are his main projects","projects-list"],["apps","repeat:projects-list"],["any other projects?","other-projects"],["tell me about mashreq","mashreq:overview"],["what about the credit one","mashreq-credit:overview"],["salary expectation","sensitive"],["thanks","thanks"]]],
 ["Design lead",[["how does he design","design-process"],["what's his process","repeat:design-process"],["what makes him unique","unique-approach"],["tell me about adeo","adeo:overview"],["what was the problem","adeo:problem"],["who were the users","adeo:users"],["how did voting work","adeo:voting"],["what were the trade offs","adeo:decisions"],["what was the budget","unknown-detail:adeo"],["what was the problem","repeat:adeo"],["what did he learn","adeo:learnings"]]],
 ["Apps",[["app","projects-list"],["show me his apps","repeat:projects-list"],["mobile apps","platforms"]]],
 ["Unknowns",[["did he work at google","career-history"],["what is the capital of france","off-topic"],["what was the problem","which-project"],["tell me about greif","greif:overview"],["what were the trade-offs","unknown-detail:greif"],["what is the team size","unknown-detail:greif"],["what was the outcome","greif:outcomes"]]],
 ["Case studies first",[["what has he worked on","projects-list"],["does he have ai experience","ai-experience"],["has he designed ai agents","agentic"],["other agentic projects","other-agentic"],["banking experience","domain-banking"],["other banking projects","other-banking"],["government work","domain-government"],["other government projects","other-government"]]],
 ["Sony",[["sony","sony:overview"],["tell me about the contract platform","sony-clm:overview"],["results?","repeat:sony-clm"],["sports scheduling","sony-sports:overview"]]],
];
let p=0,t=0,f=[];
for(const [name,turns] of convs){n.reset();for(const [q,e] of turns){t++;const r=n.ask(q);const g=key(r);if(g===e)p++;else f.push(`  ✗ [${name}] "${q}" → ${g}   expected ${e}`);
  if(r.followups.length>4) f.push("  too many chips: "+q);}}
console.log(`${p}/${t} conversation turns`);console.log(f.join("\n"));
// No answer text should state the "building" idea more than once.
const all=JSON.stringify(kb.intents.map(i=>i.answer))+JSON.stringify(kb.entities.map(e=>e.answers));const c=(all.match(/like a building|like buildings/gi)||[]).length;console.log("'building' phrase occurrences in answers:",c);
