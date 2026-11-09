// Regression: human-reviewed question → topic pairs (built from the v3 relevance audits).
const kb=require("../nyrro-knowledge-base.json"),n=require("../nyrro-matcher.js")(kb),snap=require("./relevance_snapshot.json");
let p=0,f=[];for(const[q,e]of Object.entries(snap)){n.reset();const m=n.ask(q).match;const g=m.type==="entity"?m.id+":"+m.aspect:m.id||m.type;if(g===e)p++;else f.push(`  ✗ "${q}" → ${g} expected ${e}`)}
console.log(`${p}/${Object.keys(snap).length} relevance`);console.log(f.join("\n"));
