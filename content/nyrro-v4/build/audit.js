// Relevance audit: prints question → first line of the answer, so a human can judge fit.
const kb=require("../nyrro-knowledge-base.json"),n=require("../nyrro-matcher.js")(kb);
const qs=process.argv.slice(2).length?process.argv.slice(2):require("./audit_questions.json");
for(const q of qs){n.reset();const r=n.ask(q);const m=r.match;const id=(m.type==="entity"?m.id+":"+m.aspect:m.id||m.type);
 console.log(`${q}\n   → [${id}] ${r.answer.split("\n").find(l=>l.trim()).replace(/\*\*/g,"").slice(0,120)}`)}
