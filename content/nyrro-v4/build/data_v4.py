# v4: SOURCE-ONLY answers. Nothing in here is invented.
# Allowed sources: Vishnu's resume, his About page, his 5 case studies, the Notion project table,
# his 2023 portfolio, and facts he stated directly (e.g. title = Senior; tools incl. Photoshop/Illustrator/After Effects).
# Skills and tools are copied from the resume as-is: no commentary, no "examples", no ranking.

EMAIL = "vishnuprasadkp98@gmail.com"

SKILLS_MD = (
    "**Design & Research**\n"
    "Product Design, UX Design, Interaction Design, Information Architecture, User Flows, Design Systems, "
    "Component Libraries, Usability Testing, Journey Mapping, Accessibility (WCAG), Enterprise SaaS\n\n"
    "**Strategy & Systems**\n"
    "Product Strategy, Product Discovery, Systems Thinking, User Research, Stakeholder Management, Design Leadership, "
    "DesignOps, Data Visualization\n\n"
    "**AI & Tools**\n"
    "Claude, AI Product Design, Prompt Engineering, Agentic UX, Generative Prototyping"
)
TOOLS_MD = "Claude, Figma, Figma AI, FigJam, Miro, Framer, Google AI Studio, Adobe Creative Suite (Photoshop, Illustrator, After Effects)"

A = {}   # id -> answer
F = {}   # id -> followups (optional)

# ── Skills & tools: straight from the resume ──
A["skills"] = SKILLS_MD + "\n\n**Tools**\n" + TOOLS_MD
F["skills"] = ["What tools does he use?", "What has he worked on?", "How does he design?"]
A["tools"] = TOOLS_MD
F["tools"] = ["What are his skills?", "What has he worked on?"]
A["skills-design"] = "**Design & Research**\nProduct Design, UX Design, Interaction Design, Information Architecture, User Flows, Design Systems, Component Libraries, Usability Testing, Journey Mapping, Accessibility (WCAG), Enterprise SaaS"
F["skills-design"] = ["What are his skills?", "What tools does he use?"]
A["skills-strategy"] = "**Strategy & Systems**\nProduct Strategy, Product Discovery, Systems Thinking, User Research, Stakeholder Management, Design Leadership, DesignOps, Data Visualization"
F["skills-strategy"] = ["What are his skills?"]
A["skills-ai"] = "**AI & Tools**\nClaude, AI Product Design, Prompt Engineering, Agentic UX, Generative Prototyping"
F["skills-ai"] = ["What are his skills?", "What AI work has he done?"]
A["skills-research"] = "From his resume: **User Research, Product Discovery, Usability Testing, Journey Mapping.**"
F["skills-research"] = ["What are his skills?", "How does he do research?"]
A["skills-soft"] = "From his resume: **Stakeholder Management** and **Design Leadership**. He also mentored 6 junior designers through critiques and growth planning."
F["skills-soft"] = ["What are his skills?", "Does he have leadership experience?"]
A["strengths"] = "From his resume summary: he takes **complex, high-stakes systems from discovery to launch**, working with product, engineering and executive stakeholders. He **builds design systems that shorten delivery time** and has **shipped products used by millions**."
F["strengths"] = ["What are his skills?", "What has he worked on?"]
A["prototyping"] = "**Generative Prototyping** is on his resume. At Kocha Technologies he turned requirements into **wireframes, flows and high-fidelity interfaces**."
A["coding"] = "Coding isn't listed on his resume. He works closely with engineering: he **established design-to-engineering handoff and review workflows** that reduced rework and implementation inconsistencies."
A["languages"] = "- **English:** Professional\n- **Malayalam:** Native\n- **Hindi:** Conversational\n- **Tamil:** Conversational"
A["platforms"] = "- **Web and mobile:** Enterprise Search, Agent Workforce Platform, HDFC Bank\n- **Tablet (primary) and web:** ADEO\n- **iOS & Android apps:** listed in his 2023 portfolio"

# ── About ──
A["who-is-vishnu"] = "**Vishnu Prasad K P** is a **Senior Product Designer at ICD (Itu Chaudhuri Design)**, working with UnifyApps.\n\nHe's a product designer with 5+ years of experience in enterprise SaaS, AI and data-heavy platforms. He takes complex, high-stakes systems from discovery to launch."
F["who-is-vishnu"] = ["What are his skills?", "What has he worked on?", "How many years of experience?"]
A["summary-oneline"] = "A product designer with 5+ years of experience who designs experiences for the complex systems that run real work."
A["experience-years"] = "**5+ years.**\n\n- **ICD (Itu Chaudhuri Design), working with UnifyApps:** Oct 2024 – Present\n- **Brane Enterprises:** Oct 2023 – Sep 2024\n- **Kocha Technologies:** Nov 2021 – Oct 2023"
A["title-seniority"] = "**Senior Product Designer** at ICD (Itu Chaudhuri Design), working with UnifyApps. In his case studies his project role is listed as Lead Product Designer."
A["career-history"] = ("1. **Senior Product Designer, ICD (working with UnifyApps)**, Oct 2024 – Present\n"
  "   Led product design across 60+ enterprise deployments for clients including HDFC Bank, Sony Networks, Jubilant FoodWorks, Dubai Development Authority and DGE Abu Dhabi.\n"
  "2. **Senior UI/UX Designer, Brane Enterprises**, Oct 2023 – Sep 2024\n"
  "   Led UX for 20+ client projects across e-commerce, finance, healthcare and education on Brane's low-code platform.\n"
  "3. **Senior UI/UX Designer, Kocha Technologies**, Nov 2021 – Oct 2023\n"
  "   Designed Nextdecentrum, an NFT marketplace, end to end: onboarding, discovery, bidding and wallet integration.")
A["education"] = "**Bachelor of Planning & Architecture**, NIT Bhopal, Madhya Pradesh, India (Aug 2017 – May 2021)"
A["architecture-link"] = "He studied Planning & Architecture at NIT Bhopal, where he learned to **understand systems before changing them**. That thinking still shapes his work: he doesn't see a product as a collection of screens."
A["location-regions"] = "He's based in **India**. His clients are in **India, the UAE, Qatar and the US**."
A["current-work"] = "He's a **Senior Product Designer at ICD**, working with **UnifyApps**. Much of his current work is under NDA; the case studies show what can be shared."
F["current-work"] = ["What has he worked on?", "What are his skills?"]
A["dashboards"] = "**Data Visualization** is on his resume. Examples from his case studies:\n\n- **Sony Social Intelligence Command:** ~2.47M monthly social mentions combined with broadcast ratings\n- **HDFC Bank:** real-time monitoring of consent violations"

# ── Process (About page + case studies only) ──
A["design-process"] = "From his About page: his process is **research-first**. He maps the **people, dependencies, goals and failure points** before designing screens. He **owns projects end to end** and invests in **clear flows, reusable patterns and documented components**."
F["design-process"] = ["What are his skills?", "Tell me about ADEO"]
A["unique-approach"] = "From his About page: he treats **design as a system problem**, and wants AI tools to be **useful, understandable and trustworthy**. His process is research-first: people, dependencies, goals and failure points come before screens."
A["principles"] = ("Reflections from his case studies:\n\n"
  "- **Enterprise Search:** trust drives adoption more than AI performance\n"
  "- **ADEO:** important decisions benefit from deliberate interactions, not speed\n"
  "- **Agent Workforce:** simplicity means showing each user the right level of complexity\n"
  "- **HDFC Bank:** good records create compliance naturally\n"
  "- **Sony:** AI should act before the problem happens")
A["research"] = ("- **UnifyApps projects:** the product team defined the roles and led the research; their findings shaped the design decisions\n"
  "- **ADEO:** research was continuous, with requirements gathered from the client, multiple design iterations, and validation at each major decision\n\n"
  "User Research, Usability Testing and Journey Mapping are on his resume.")
A["tradeoffs"] = ("From his case studies:\n\n"
  "- **ADEO:** members only see their own committees. That keeps them focused, but members of several committees need a separate view.\n"
  "- **ADEO:** every vote requires a rationale, which deliberately slows voting down\n"
  "- **Agent Workforce:** Simple mode hides technical controls, so engineers may find it limiting; Advanced mode exists for them\n"
  "- **Agent Workforce:** traces show gaps openly, which looks less polished but avoids confident wrong answers")
A["simplicity"] = ("- **Agent Workforce Platform:** \"Simplicity means showing each user the right level of complexity, not removing features.\" It has Simple, Workflow and Advanced modes.\n"
  "- **HDFC Bank:** complex compliance information was organised, not removed.")
A["stakeholders"] = ("- **HDFC Bank:** worked with HDFC's senior management and product team from brief through Final-for-Dev handoff\n"
  "- **Sony:** collaborated with legal, compliance, broadcast operations, content strategy and corporate governance teams\n"
  "- **ADEO:** worked alongside Frog Design and Nagarro Design\n\n"
  "**Stakeholder Management** is on his resume.")
A["working-style"] = "From his About page: he **owns projects end to end** and invests in **clear flows, reusable patterns and documented components**. From his resume: he **established design-to-engineering handoff and review workflows** that reduced rework."
A["multitasking"] = "From his resume: he **managed 3 enterprise initiatives in parallel**, balancing stakeholder priorities, engineering constraints and timelines."

# ── AI (case studies only) ──
A["ai-experience"] = ("AI products from his case studies:\n\n"
  "- **Enterprise Search:** AI answers with sources across a company's tools, plus an agent marketplace\n"
  "- **Agent Workforce Platform:** building, governing and running AI agents\n"
  "- **ADEO:** AI briefings, an archive assistant and live minutes for government committees\n"
  "- **HDFC Bank:** AI that infers preferences and simplifies legal disclosures\n"
  "- **Sony:** AI contract review, minutes generation, scheduling conflict detection and social intelligence\n\n"
  "AI Product Design, Agentic UX and Prompt Engineering are on his resume.")
A["ai-trust"] = ("From his case study reflections:\n\n"
  "- **Enterprise Search:** trust drives adoption more than AI performance; showing sources makes verification easy; transparency about failures builds confidence\n"
  "- **ADEO:** AI content is clearly labelled so users always know what was machine-generated\n"
  "- **Sony:** people trust AI more when they can see how it reached a result")
A["human-in-loop"] = ("- **ADEO:** AI produces drafts; humans review, edit and approve them before they become official records. Every vote requires a rationale.\n"
  "- **Agent Workforce:** compliance reviewers see audit history and security controls before approving an agent.")
A["agentic"] = ("**Agent Workforce Platform** (UnifyApps): three ways to build AI agents (Simple, Workflow and Advanced), with guardrails and PII rules set during configuration, execution traces, and reusable skills.\n\n"
  "**Enterprise Search** also includes an **Agent Marketplace** of ready-made agents, each showing whether it's verified.")
A["ai-governance"] = ("- **Agent Workforce:** guardrails and PII rules are set during configuration; every interaction is captured as a trace\n"
  "- **HDFC Bank:** consent actions are logged automatically in the normal workflow, creating an audit trail\n"
  "- **Enterprise Search:** compliance teams can see what data the platform can access and audit it")
A["copilots"] = ("- **Enterprise Search:** works as a copilot across Search, Chat, Agents, Spaces and Apps\n"
  "- **ADEO:** a conversational assistant that searches the five-year archive inside the session\n"
  "- **Sony:** a copilot that checks each scheduled event against its executed rights agreement")
A["ai-patterns"] = A["ai-experience"]
A["when-not-ai"] = "His Mphasis visitor management project has **no AI features** in its project content. AI there is listed only as possible future extensions."
A["ai-designer"] = "He describes himself as a **product designer who applies AI when a product needs it**, not as an \"AI designer\"."

# ── Leadership & team (resume) ──
A["leadership"] = ("From his resume:\n\n"
  "- Led product design across **60+ enterprise deployments**\n"
  "- Owned and scaled the **UnifyApps design system**\n"
  "- Managed **3 enterprise initiatives in parallel**\n"
  "- Established **design-to-engineering handoff and review workflows**\n"
  "- **Mentored 6 junior designers** through critiques and growth planning")
A["mentoring"] = "From his resume: he **mentored 6 junior designers** through critiques and growth planning, and enforced WCAG 2.1 accessibility across products."
A["engineers"] = ("From his resume:\n\n"
  "- Established **design-to-engineering handoff and review workflows** that reduced rework and implementation inconsistencies\n"
  "- At Brane, shipped responsive products with **clean developer handoff**\n\n"
  "In the **Agent Workforce Platform**, engineers are one of the three user roles; Advanced mode gives them precise control.")
A["design-system"] = "From his resume: he **owned and scaled the UnifyApps design system** across AI, Data Quality, Governance and Workflow Automation, **reused across 60+ deployments**. Design Systems and Component Libraries are on his resume."
A["accessibility"] = "**Accessibility (WCAG)** is on his resume, and he **enforced WCAG 2.1 accessibility across products** at ICD."
A["lead-fit"] = f"From his resume: he led product design across 60+ deployments, managed 3 initiatives in parallel, owned the UnifyApps design system and mentored 6 junior designers. For a specific role, contact him at **{EMAIL}**."
A["agencies"] = "On **ADEO**, he worked alongside **Frog Design** and **Nagarro Design**, with ICD as design partner."

# ── Work overview ──
A["best-problems"] = "From his About page, his focus areas are **agentic systems, search, automation and decision-making tools**. His resume describes his work as taking **complex, high-stakes systems from discovery to launch**."
A["common-thread"] = "From his About page: he treats **design as a system problem** and wants AI tools to be **useful, understandable and trustworthy**."
A["proudest"] = "I don't know which project he's proudest of. You can ask him at **" + EMAIL + "**. His portfolio features five case studies."
F["proudest"] = ["What has he worked on?"]
A["most-complex"] = "I don't know which he considers most complex. You can ask him at **" + EMAIL + "**. By scope, the **Sony** case study covers four platforms; **HDFC Bank** serves 30M+ customers; **ADEO** handles 1,000+ proposals a month."
A["adapt-domains"] = "I don't know the details of how he approaches a new industry. You can ask him at **" + EMAIL + "**."
A["where-to-start"] = "His five case studies, in portfolio order: **Enterprise Search, ADEO, Agent Workforce Platform, HDFC Bank, Sony.**"
F["where-to-start"] = ["Tell me about Enterprise Search", "Tell me about ADEO"]
A["industries"] = "**Case studies:** enterprise SaaS (UnifyApps), government (DGE / ADEO), banking (HDFC Bank), media (Sony).\n\n**Other client work:** insurance, retail, manufacturing, aviation, hospitality, HR and automotive.\n\nAt Brane: e-commerce, finance, healthcare and education."
A["domain-banking"] = "His banking case study is **HDFC Bank**: consent and preference management for 30M+ customers under India's DPDP Act.\n\nIts reflections: good records create compliance naturally; complex information should be organised, not removed; designing customer and operator sides together creates a better experience."
A["domain-government"] = "His government case study is the **Committee Board Agentic Application** for DGE / ADEO, Abu Dhabi: 1,000+ submissions a month.\n\nIts reflections: label AI clearly; important decisions benefit from deliberate interactions, not speed; AI drafts and humans approve."
A["domain-knowledge"] = "His **Intelligent Enterprise Search** case study connects a company's tools into one shared knowledge index, with direct answers and sources, plus an agent marketplace."
A["domain-retail"] = "- **Lowe's:** enterprise AI workspace (client project)\n- **Jubilant FoodWorks:** operations and workforce workflows (client project)\n- **E-commerce** client projects at Brane Enterprises"

# ── Career / personal ──
A["evolution"] = "His roles in order: **Kocha Technologies** (NFT marketplace), **Brane Enterprises** (20+ client projects on a low-code platform), and **ICD / UnifyApps** (enterprise and AI products)."
A["branding"] = "His 2023 portfolio lists **brand identity** work for Momentable, Salud Interactiva, Mobionix, LEAPQUE and QuoteBot. Adobe Creative Suite is on his resume."
A["hobbies"] = "From his About page: he **sketches and paints** (mostly live sketching and watercolour), **plays football**, **travels** and goes on **long bike rides**."
A["art"] = "Mostly **live sketching and watercolour**. His paintings are on his About page and Behance, and his sketchbook is on Instagram (@sketch_b.o.o.k)."
A["nyrro"] = "I'm **Nyrro**, Vishnu's creative side project, named after a beetle. 🪲 I'm inspired by beetles' natural defence mechanisms, and by the idea of a tiny creature leaving a paint-like trail as it moves: part observation, part imagination."

# ── Hiring ──
A["why-hire"] = ("From his resume:\n\n"
  "- **5 years** in enterprise SaaS, AI and data-heavy platforms\n"
  "- Led product design across **60+ enterprise deployments** (HDFC Bank, Sony Networks, Jubilant FoodWorks, Dubai Development Authority, DGE Abu Dhabi)\n"
  "- Owned and scaled the **UnifyApps design system**\n"
  "- Designed for **HDFC Bank's 30M+ customers** under India's DPDP Act\n"
  "- **Mentored 6 junior designers**\n\n" + f"Contact: **{EMAIL}**")
A["remote"] = f"I don't know his preferences on location or remote work. Please ask him at **{EMAIL}**."
A["solo-or-team"] = "On UnifyApps projects, ICD was the design partner and the product team defined the roles and led the research. On ADEO, ICD worked alongside Frog Design and Nagarro Design. Team sizes aren't public."

# ── Interview-style: don't know ──
A["weakness"] = f"I don't know that. You can ask Vishnu directly at **{EMAIL}**."
A["conflict"] = f"I don't know about that. You can ask Vishnu directly at **{EMAIL}**."
A["failure"] = f"I don't know about that. You can ask Vishnu directly at **{EMAIL}**."
A["why-designer"] = f"I don't know his personal story. You can ask Vishnu directly at **{EMAIL}**."

# ── Keyword additions ──
EXTRA = {
  "tools": ["adobe tools"],
  "design-system": ["built a design system", "build a design system", "scaled a design system", "design system experience", "has he built a design system", "own a design system", "design systems experience"],
  "art": ["does he sketch", "he sketch", "sketches"],
}

# ── Project answers that were my own synthesis (not in any source): remove them ──
REMOVE_ENTITY_ASPECTS = {
  # "strategy" paragraphs for client projects were written by me; Notion has no approach column.
  **{pid: ["strategy"] for pid in ["dd-onboarding", "dd-supplier-gpt", "dd-employee-copilot", "niva-bupa", "mashreq-cash", "mashreq-credit",
                                    "mashreq-incident", "jubilant", "virtusa", "tekion", "lowes", "cgb", "mphasis", "air-arabia", "stowers",
                                    "ajman", "wasl", "shaw", "docebo", "greif"]},
}
ENTITY_FIX = {
  ("enterprise-search", "decisions"): "From the case study:\n\n- **A marketplace instead of only an agent builder**, so successful agents can be reused\n- **Sync failures and unverified agents are shown openly**, to build trust",
  ("enterprise-search", "strategy"): "The platform works as a **copilot**: Search, Chat, Agents, Spaces and Apps share one index and one interaction model. Responsibility grows across three levels: **Ask → Configure → Govern**.",
  ("mphasis", "ai"): "AI capabilities are **not established** in the available project content. Possible future extensions listed:\n\n- Intelligent document processing for visitor ID details\n- Computer vision for ID quality checks\n- NLP for classifying visit purposes\n- Anomaly detection for unusual visit patterns\n- Predictive analytics for visitor volumes",
  ("air-arabia", "ai"): "The project shows a **conversational assistant concept** for flight-status queries within team conversations. The underlying AI architecture is not specified.",
  ("hdfc", "strategy"): "From the case study:\n\n- The **customer portal and operator console** were designed together, on the same consent record\n- Compliance content was **organised to match how customers think**, not reduced\n- Consent actions are **logged automatically** in the normal workflow, creating an audit trail",
  ("agent-workforce", "strategy"): "The platform is structured as **Configure → Orchestrate → Tune**, with Simple, Workflow and Advanced modes under one design system. From the case study: \"Simplicity means showing each user the right level of complexity, not removing features.\"",
  ("sony", "strategy"): "Reflections from the case study:\n\n- **Trust comes from visibility:** people trust AI more when they can see how it reached a result\n- **AI should act before the problem happens**, e.g. flagging risk before review\n- **Configuration is part of the product:** rules, approvals and thresholds shape how well AI works",
}

A["figma-files"] = "Many of his projects are confidential, so detailed files aren't public. The case studies show what can be shared. For more, contact him at **" + EMAIL + "**."

# ── One direct answer per resume skill / tool: "Does he know X?" → "Yes. X is on his resume …" ──
RESUME_ITEMS = {
  "Design & Research": ["Product Design", "UX Design", "Interaction Design", "Information Architecture", "User Flows", "Design Systems",
                        "Component Libraries", "Usability Testing", "Journey Mapping", "Accessibility (WCAG)", "Enterprise SaaS"],
  "Strategy & Systems": ["Product Strategy", "Product Discovery", "Systems Thinking", "User Research", "Stakeholder Management",
                         "Design Leadership", "DesignOps", "Data Visualization"],
  "AI & Tools": ["AI Product Design", "Prompt Engineering", "Agentic UX", "Generative Prototyping"],
  "Tools": ["Claude", "Figma", "Figma AI", "FigJam", "Miro", "Framer", "Google AI Studio", "Adobe Creative Suite",
            "Photoshop", "Illustrator", "After Effects"],
}
ITEM_ALIASES = {"Accessibility (WCAG)": ["accessibility", "wcag", "a11y"], "Data Visualization": ["data visualization", "data visualisation", "dataviz", "data viz"],
  "DesignOps": ["designops", "design ops"], "UX Design": ["ux design", "ux"], "Enterprise SaaS": ["enterprise saas", "saas", "b2b saas"],
  "Adobe Creative Suite": ["adobe creative suite", "adobe", "creative suite", "creative cloud"], "After Effects": ["after effects", "ae", "aftereffects"],
  "Photoshop": ["photoshop", "ps"], "Illustrator": ["illustrator", "adobe illustrator"], "Google AI Studio": ["google ai studio", "ai studio"],
  "Information Architecture": ["information architecture", "ia"], "Agentic UX": ["agentic ux", "agentic design"],
  "Prompt Engineering": ["prompt engineering", "prompting", "prompt design"], "User Research": ["user research", "ux research"],
  "Usability Testing": ["usability testing", "usability test", "user testing"], "Design Systems": ["design systems", "design system"],
  "Generative Prototyping": ["generative prototyping", "ai prototyping"]}

A_NOT_ON_RESUME = ("That isn't listed on his resume. His tools are: " + TOOLS_MD + ".\n\nFor anything else, you can ask him at **" + EMAIL + "**.")
NOT_ON_RESUME_KW = ["know sketch", "use sketch", "uses sketch", "sketch app", "sketch tool", "in sketch", "good at sketch", "adobe xd", "xd", "webflow",
  "invision", "zeplin", "protopie", "axure", "balsamiq", "principle app", "origami", "blender", "spline", "canva", "notion", "jira", "confluence",
  "react", "angular", "vue", "swift", "kotlin", "flutter", "python", "java", "html", "css", "javascript", "webflow skills", "lottie", "rive"]
