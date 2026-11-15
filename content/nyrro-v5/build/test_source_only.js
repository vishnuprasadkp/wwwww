// v4 guard: skills & tools must equal the resume text exactly, and invented phrasing must never come back.
const kb=require("../nyrro-knowledge-base.json"),n=require("../nyrro-matcher.js")(kb);
// v6: the 2026 resume
const SKILLS="**Product design**\nEnd to end product design, interaction design, information architecture, design systems, data visualization, accessibility (WCAG 2.1)\n\n**AI products**\nAgentic UX, AI trust and explainability patterns, human in the loop workflows, prompt design, AI assisted prototyping\n\n**Research and leadership**\nDiscovery, user research, usability testing, stakeholder management, design critique, mentoring, DesignOps\n\n**Tools**\nFigma, FigJam, Framer, Miro, Adobe Creative Suite, Claude, Google AI Studio, GitHub, Vercel";
const TOOLS="Figma, FigJam, Framer, Miro, Adobe Creative Suite, Claude, Google AI Studio, GitHub, Vercel";
const BANNED=[/main design tool/i,/workshops and mapping/i,/including his portfolio/i,/where you can see them/i,/biggest strengths/i,/seven steps/i,/in his view/i,/much like his/i,/real strength/i,/like a building/i,/rebuilt his own portfolio/i,/research synthesis/i,/visual and brand work/i,/the principles he designs by/i,/fewer low-level controls/i,/that's deliberate/i];
let ok=0,fail=[];const chk=(c,m)=>{c?ok++:fail.push(m)};
for(const q of ["What are his core skills?","what skills does he have","list his skills","skills","technical skills","what are his hard skills"]){n.reset();{const a=n.ask(q).answer;chk(a.endsWith(SKILLS)&&a.startsWith("From his resume:"),"skills ≠ intro + resume list for: "+q)}}
for(const q of ["What tools does he use?","what software does he know","tools"]){n.reset();chk(n.ask(q).answer.endsWith(TOOLS),"tools ≠ resume for: "+q)}
const all=kb.intents.map(i=>[i.id,i.answer]).concat(kb.entities.flatMap(e=>Object.entries(e.answers).map(([k,v])=>[e.id+":"+k,v])));
for(const [id,a] of all) for(const re of BANNED) chk(!re.test(a),`invented phrase ${re} in ${id}`);
console.log(`${ok}/${ok+fail.length} source-only checks`);console.log(fail.join("\n"));
