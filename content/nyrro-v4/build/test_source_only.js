// v4 guard: skills & tools must equal the resume text exactly, and invented phrasing must never come back.
const kb=require("../nyrro-knowledge-base.json"),n=require("../nyrro-matcher.js")(kb);
const SKILLS="**Design & Research**\nProduct Design, UX Design, Interaction Design, Information Architecture, User Flows, Design Systems, Component Libraries, Usability Testing, Journey Mapping, Accessibility (WCAG), Enterprise SaaS\n\n**Strategy & Systems**\nProduct Strategy, Product Discovery, Systems Thinking, User Research, Stakeholder Management, Design Leadership, DesignOps, Data Visualization\n\n**AI & Tools**\nClaude, AI Product Design, Prompt Engineering, Agentic UX, Generative Prototyping\n\n**Tools**\nClaude, Figma, Figma AI, FigJam, Miro, Framer, Google AI Studio, Adobe Creative Suite (Photoshop, Illustrator, After Effects)";
const TOOLS="Claude, Figma, Figma AI, FigJam, Miro, Framer, Google AI Studio, Adobe Creative Suite (Photoshop, Illustrator, After Effects)";
const BANNED=[/main design tool/i,/workshops and mapping/i,/including his portfolio/i,/where you can see them/i,/biggest strengths/i,/seven steps/i,/in his view/i,/much like his/i,/real strength/i,/like a building/i,/rebuilt his own portfolio/i,/research synthesis/i,/visual and brand work/i,/the principles he designs by/i,/fewer low-level controls/i,/that's deliberate/i];
let ok=0,fail=[];const chk=(c,m)=>{c?ok++:fail.push(m)};
for(const q of ["What are his core skills?","what skills does he have","list his skills","skills","technical skills","what are his hard skills"]){n.reset();chk(n.ask(q).answer===SKILLS,"skills ≠ resume for: "+q)}
for(const q of ["What tools does he use?","what software does he know","tools"]){n.reset();chk(n.ask(q).answer===TOOLS,"tools ≠ resume for: "+q)}
const all=kb.intents.map(i=>[i.id,i.answer]).concat(kb.entities.flatMap(e=>Object.entries(e.answers).map(([k,v])=>[e.id+":"+k,v])));
for(const [id,a] of all) for(const re of BANNED) chk(!re.test(a),`invented phrase ${re} in ${id}`);
console.log(`${ok}/${ok+fail.length} source-only checks`);console.log(fail.join("\n"));
