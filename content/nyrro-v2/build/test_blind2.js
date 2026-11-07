const kb=require("../nyrro-knowledge-base.json"),n=require("../nyrro-matcher.js")(kb);
const T=[["what kind of designer is he","who-is-vishnu"],["give me a quick intro","who-is-vishnu"],["how senior is he","title-seniority"],
["did he study design","education"],["what's his background in architecture","architecture-link"],["is he good with figma","tools"],
["what's his process like","design-process"],["how does he start a new project","design-process"],["what are his core beliefs as a designer","principles"],
["how does he make sure ai is trustworthy","ai-trust"],["does he use ai in every project","when-not-ai"],["has he worked with llms","ai-experience"],
["how does he collaborate with product managers","stakeholders"],["does he manage people","leadership"],["has he scaled a design system","design-system"],
["what projects has he done in the uae","location-regions"],["any banking projects","domain-banking"],["any government work","domain-government"],
["what has he done in hr tech","domain-hr"],["has he designed for airlines","domain-aviation"],["tell me about his insurance project","domain-insurance"],
["what did he do for mashreq","mashreq:overview"],["what did he do for lowe's","lowes:overview"],["how did ai help in greif","greif:ai"],
["what's the hdfc case study about","hdfc:overview"],["sony project details","sony:overview"],["outcome of the abu dhabi project","adeo:outcomes"],
["how did he solve the search problem","enterprise-search:strategy"],["agent platform users","agent-workforce:users"],["challenges in the tekion project","tekion:problem"],
["key features of ajman one","ajman:features"],["what did docebo want","docebo:overview"],["shaw industries results","shaw:outcomes"],
["what is sharek","cgb:overview"],["stowers outlook assistant","stowers:overview"],["virtusa results","virtusa:outcomes"],
["how can i hire vishnu","open-to-work"],["his email address?","contact"],["how much does he charge","sensitive"],["are you chatgpt","are-you-ai"],
["what is the capital of france","fallback"],["asdfgh","fallback"]];
let p=0,f=[];for(const[r,e]of T){n.reset();const m=n.ask(r).match;const g=m.type==="entity"?`${m.id}:${m.aspect}`:m.type==="intent"?m.id:"fallback";if(g===e)p++;else f.push(`  ✗ "${r}" → ${g} (${m.score}) expected ${e}`)}
console.log(`${p}/${T.length}`);console.log(f.join("\n"));
