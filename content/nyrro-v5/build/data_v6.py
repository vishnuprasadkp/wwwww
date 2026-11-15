# v6: matches the 2026 resume and the updated portfolio (nyrro-update.md).
# Applied last in build.py: these answers replace the earlier ones. No em or en dashes anywhere (build.py also
# turns any left in older answers into "to", a colon, a comma or a hyphen).

A6 = {
"who-is-vishnu": """**Vishnu Prasad K P** is a **Senior Product Designer at ICD (Itu Chaudhuri Design)**. UnifyApps is ICD's major client, and Vishnu leads design on his projects there.

He has five years of designing enterprise and AI products for clients like **HDFC Bank**, **Sony Pictures Networks India** and **Abu Dhabi's Department of Government Enablement**. He tries to understand the system behind a product before he designs its screens, something he picked up studying architecture at NIT Bhopal.

His work covers **agentic products**, **search**, **consent and governance**, and the **design system** used across 60+ deployments.""",

"title-seniority": """**Senior Product Designer** at ICD (Itu Chaudhuri Design). UnifyApps is ICD's major client. On his projects he is the **design lead for the engagement**, owning design from the first brief to developer handoff.""",

"experience-years": """**5 years.**

- **ICD (Itu Chaudhuri Design):** Oct 2024 to Present, design lead for UnifyApps
- **Brane Enterprises:** Oct 2023 to Sep 2024
- **Kocha Technologies:** Nov 2021 to Oct 2023""",

"career-history": """1. **Senior Product Designer, ICD (Itu Chaudhuri Design)**, Oct 2024 to Present: design lead for UnifyApps, ICD's major client, and its customers across India, the UAE and the US. Projects include HDFC Bank's consent platform, Sony Pictures Networks India, DGE Abu Dhabi, an AI search platform and an agent builder.
2. **Senior UI/UX Designer, Brane Enterprises**, Oct 2023 to Sep 2024: led UX for 20+ client products in finance, healthcare, e-commerce and education, built on Brane's low-code platform.
3. **Senior UI/UX Designer, Kocha Technologies**, Nov 2021 to Oct 2023: designed an NFT marketplace end to end, from onboarding to bidding and wallet.""",

"education": """**Bachelor of Planning & Architecture**, NIT Bhopal, Madhya Pradesh, India (2017 to 2021)""",

"leadership": """Vishnu leads design on his projects. He owns the work from the first brief to developer handoff and works directly with PMs and client executives.

- Looks after the **UnifyApps design system**, reused across **60+ deployments**
- Ran **3 product initiatives in parallel**
- Set up the **design to dev handoff process** and the **WCAG 2.1 accessibility standard**
- **Mentors 6 designers** through critiques and reviews""",

"lead-fit": """His work is already lead scope: he leads design on each engagement, looks after a design system used in **60+ deployments**, ran **3 initiatives in parallel** and **mentors 6 designers**. His title is Senior Product Designer. For a specific role, write to him at **vishnuprasadkp98@gmail.com**.""",

"skills": """From his resume:

**Product design**
End to end product design, interaction design, information architecture, design systems, data visualization, accessibility (WCAG 2.1)

**AI products**
Agentic UX, AI trust and explainability patterns, human in the loop workflows, prompt design, AI assisted prototyping

**Research and leadership**
Discovery, user research, usability testing, stakeholder management, design critique, mentoring, DesignOps

**Tools**
Figma, FigJam, Framer, Miro, Adobe Creative Suite, Claude, Google AI Studio, GitHub, Vercel""",

# TODO [me]: once the HDFC figures are confirmed, add the savings and time to market line back to the HDFC bullet.
"success-metrics": """Results from his case studies, and where each number comes from:

- **HDFC Bank:** **400M+** consent records and **3M+** messages a day (reported by UnifyApps)
- **Sony:** contract cycle time from **30 to 45 days down to 18**, board minutes from **2 to 3 days down to about 4 hours**, time to insight from **48 hours to 90 minutes** (project documentation)
- **ADEO:** a **15 working day** preparation cycle replaced by briefings ready before each session, across **1,000+** proposals a month""",

"outcomes-real": """Yes, and each number says where it came from:

- **HDFC Bank:** reported by UnifyApps
- **Sony:** from project documentation
- **ADEO:** from the case study
- **Enterprise Search and Agent Workforce:** no outcome numbers, because the published figures belong to a different deployment
- **Other client projects:** expected results, clearly marked as such""",

"project-count": """He has worked on **100+ use cases** across his career:

- **60+ deployments** with UnifyApps, through ICD
- **20+ client projects** at Brane Enterprises
- His portfolio features **five case studies**""",

"principles": """Three things he has learned over five years:

1. **Trust comes from what people can see.** If the system did something, it should show it: the source behind an answer, a sync that failed, a label that says a draft was written by AI.
2. **Some decisions should be slow.** A vote needs a reason. A consent needs a record. Not every screen is about saving clicks.
3. **Simple doesn't mean less.** It means showing the right depth to the right person, which is why the agent builder has three modes instead of one.""",
}

# small changes to answers that otherwise stay as they are
TOOLS_ADD = ["GitHub", "Vercel"]
CODING_ADD = "He also builds what he designs. He put together this site himself and ships it with GitHub and Vercel."

# the five case studies
ROLE = "Senior Product Designer, design lead for the engagement"
OPENING = {
"hdfc": "When India's DPDP Act came in, HDFC Bank had to collect and respect consent for more than 30 million customers, and on a deadline. Vishnu led the design of the platform that made it possible, both the customer journeys and the console the operations team works in. Today it holds over **400 million consent records** and sends more than **3 million messages a day**.",
"sony": "At Sony Pictures Networks India, contracts, board minutes, sports schedules and audience data were spread across emails, spreadsheets and separate tools. Vishnu designed **four products** to bring each of them into one place. Board minutes that took two to three days now take **about four hours**, and the team gets audience insights in **90 minutes instead of 48 hours**.",
"adeo": "Committees at ADEO review over **1,000 important proposals every month**, and getting a single proposal ready could take 15 working days. Vishnu designed a tablet app that briefs members before the session, lets them search five years of past decisions while they discuss, and records votes and minutes as they happen.",
"agent-workforce": "Building an agent used to mean passing work between product managers, engineers and compliance, with no way to check quality before launch. Vishnu designed one platform with three ways to build, **Simple, Workflow and Advanced**, so each person works at the depth they need without leaving the product.",
"enterprise-search": "Company knowledge was spread across dozens of apps, and search gave people files instead of answers. Vishnu designed a search experience that **answers with sources**, along with the admin and governance tools that make those answers worth trusting.",
}
OUTCOMES = {
"enterprise-search": """UnifyApps' published figures come from a different deployment, so this case study doesn't quote outcome numbers. What shipped:

- Connectors for apps like **Slack, Jira, GitHub and Google Drive**
- **Sync status and failures** that admins can always see
- Settings written in **plain language**, so admins don't need engineering
- An **agent marketplace** where every agent shows whether it's verified""",
"agent-workforce": """UnifyApps' published figures come from a different deployment, so this case study doesn't quote outcome numbers. What shipped:

- **Three building modes** on one shared design system
- **Guardrails and PII rules** set while configuring the agent, not added later
- A **trace for every decision** the agent makes
- A shared **library of skills** any agent can use""",
}

# the 2026 resume's skills, item by item ("does he know X?"), section by section as on the resume
RESUME_ITEMS = {
  "Product design": ["Product Design", "Interaction Design", "Information Architecture", "Design Systems", "Data Visualization",
                     "Accessibility (WCAG)"],
  "AI products": ["Agentic UX", "AI Trust & Explainability", "Human in the Loop Workflows", "Prompt Design", "AI Assisted Prototyping"],
  "Research & leadership": ["Product Discovery", "User Research", "Usability Testing", "Stakeholder Management", "Design Critique",
                            "Mentoring", "DesignOps"],
  "Tools": ["Figma", "FigJam", "Framer", "Miro", "Adobe Creative Suite", "Photoshop", "Illustrator", "After Effects",
            "Claude", "Google AI Studio", "GitHub", "Vercel"],
}
ITEM_ALIASES_ADD = {
  "AI Trust & Explainability": ["ai trust", "explainability", "explainable ai"],
  "Human in the Loop Workflows": ["human in the loop", "hitl"],
  "Prompt Design": ["prompt design", "prompt engineering", "prompting"],
  "AI Assisted Prototyping": ["ai assisted prototyping", "ai prototyping", "generative prototyping"],
  "Product Discovery": ["product discovery", "discovery"],
  "Design Critique": ["design critique", "critique", "design reviews"],
  "Mentoring": ["mentoring", "mentorship"],
  "GitHub": ["github", "git"],
  "Vercel": ["vercel"],
}

# the skill topics quote the 2026 resume's sections (their opening lines stay as they were)
SKILL_SECTIONS = {
"skills-design": "**Product design**\nEnd to end product design, interaction design, information architecture, design systems, data visualization, accessibility (WCAG 2.1)",
"skills-strategy": "**Research and leadership**\nDiscovery, user research, usability testing, stakeholder management, design critique, mentoring, DesignOps",
"skills-ai": "**AI products**\nAgentic UX, AI trust and explainability patterns, human in the loop workflows, prompt design, AI assisted prototyping",
}
SKILLS_RESEARCH = "Research comes before screens in Vishnu's process.\n\nFrom his resume: **discovery, user research and usability testing.**"
TOOLS_LIST = "Figma, FigJam, Framer, Miro, Adobe Creative Suite, Claude, Google AI Studio, GitHub, Vercel"

# General questions get general answers: from his resume, his About page and the reflections across his work, with no
# single project as the example (a question about a project gets that project's answer).
A6.update({
"experience-years": """**5 years** of product design, on enterprise and AI products for banks, governments and media companies.

- **ICD (Itu Chaudhuri Design):** Oct 2024 to Present, Senior Product Designer, design lead for UnifyApps
- **Brane Enterprises:** Oct 2023 to Sep 2024, Senior UI/UX Designer
- **Kocha Technologies:** Nov 2021 to Oct 2023, Senior UI/UX Designer""",

"unique-approach": """Vishnu understands the system behind a product before he designs its screens, a habit from studying **planning and architecture at NIT Bhopal**.

- **Systems first:** he maps the people, dependencies, goals and where things break before anything goes on a screen
- **Trust by design:** in AI products he makes clear what the system did, so people can check it and step in
- **The right depth for each person:** simple doesn't mean less; each user sees the detail they need
- **Built to scale:** reusable patterns and a design system used across **60+ deployments**
- **Designs and builds:** he also ships front-ends himself with GitHub and Vercel""",

"design-process": """Vishnu's process is **research first**: before designing any screens, he maps the people, dependencies, goals and where things break.

1. **Understand the system:** discovery and research with the people who use and run the product
2. **Define the structure:** product structure, flows and the decisions that matter, before visual detail
3. **Design and review:** iterate with PMs, engineers and client stakeholders, and test with users
4. **Systemise:** reusable patterns and documented components, so the product stays consistent
5. **Hand off and ship:** a clear design to dev handoff, through to launch

He owns the work **end to end**, from the first brief to developer handoff.""",

"research": """Research comes first in Vishnu's process: before designing, he maps the people, dependencies, goals and where things break.

From his resume: **discovery, user research and usability testing**. On client projects the product team often leads the research, and Vishnu turns its findings into design decisions, validating them in review cycles with stakeholders.""",

"strengths": """Vishnu is strongest at **making complex, high-stakes systems usable**.

- Taking products **from discovery to launch**, end to end
- **Agentic and AI products** that people can understand and trust
- **Systems with real consequences**, like consent, governance and decisions that need a record
- **Design systems**, including one reused across **60+ deployments**
- Working directly with **PMs, engineers and client executives**""",

"why-hire": """Vishnu brings **five years** of designing **enterprise and AI products** for banks, governments and media companies, from the first brief to developer handoff.

- **Design lead** on each engagement at ICD, working with PMs and client executives
- Looks after a **design system used in 60+ deployments**
- Products at real scale, like **HDFC Bank's consent platform for 30M+ customers**
- **Mentors 6 designers** and set the **design to dev handoff** and **WCAG 2.1** standards
- Also **builds front-ends** himself with GitHub and Vercel

Contact: **vishnuprasadkp98@gmail.com**""",

"working-style": """Vishnu works in **iterative review cycles** with PMs, engineers and client executives, and owns design end to end.

- Ran **3 product initiatives in parallel**
- Set up the **design to dev handoff process**, so what gets built matches what was designed
- **Mentors 6 designers** through critiques and reviews""",

"simplicity": """For Vishnu, simple doesn't mean less. It means **showing the right depth to the right person**: complex information is organised, not removed, and each user sees the level of detail they need.""",

"best-problems": """Vishnu works best on **complex, high-stakes systems that run real work**: agentic products, search, consent and governance, and decision-making tools, taken from discovery to launch.""",
})

# more ways of asking for his experience
EXTRA6 = {
"research": ["approach to research", "research approach", "how does he do research", "research process"],
"experience-years": ["overall experience", "his experience", "work experience", "total years", "experience overall", "how experienced",
                     "total experience", "experience in years", "professional experience"],
}
