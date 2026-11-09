# v5: for general questions, start with WHO HE IS / HOW HE APPROACHES IT (2–3 sentences), then the examples.
# Every sentence comes from Vishnu's sources:
#   Resume summary: "Product designer with 5 years of experience in enterprise SaaS, AI, and data-heavy platforms. Takes complex,
#     high-stakes systems from discovery to launch, working with product, engineering, and executive stakeholders. Builds design
#     systems that shorten delivery time and has shipped products used by millions."
#   About page: Lead/Senior designer at ICD; 100+ use cases with ICD, UnifyApps, Brane Enterprises and Kocha; focus on agentic systems,
#     search, automation and decision-making tools; studied Planning & Architecture, learned to understand systems before changing them;
#     doesn't see a product as a collection of screens; treats design as a system problem; wants AI tools to be useful, understandable
#     and trustworthy; research-first: maps people, dependencies, goals and failure points before screens; owns projects end to end;
#     invests in clear flows, reusable patterns and documented components.
#   Vishnu's own words: a product designer who applies AI when a product requires it, not an "AI designer"; treats AI behaviour as
#     specific mechanisms rather than buzzwords; works in iterative review cycles with PMs and senior stakeholders; influences product
#     direction at the executive level; title is Senior Product Designer.
#   Case studies and their reflections, resume bullets.

from data_v4 import SKILLS_MD, TOOLS_MD, EMAIL

A5 = {}
F5 = {}

# ════════════════ SKILLS: short intro, then the resume list word for word ════════════════
A5["skills"] = ("His skills cover design and research, product strategy and systems, and AI, built over 5+ years of designing "
  "enterprise SaaS, AI and data-heavy platforms.\n\n"
  "Here are the skills from his resume:\n\n" + SKILLS_MD + "\n\n**Tools**\n" + TOOLS_MD)

A5["skills-ai"] = ("At ICD, Vishnu leads design on AI products for UnifyApps: AI search, AI agents and AI decision tools.\n\n"
  "His AI skills, from his resume:\n\n**AI & Tools**\nClaude, AI Product Design, Prompt Engineering, Agentic UX, Generative Prototyping")
F5["skills-ai"] = ["How does he work with AI?", "What are his skills?"]

A5["skills-design"] = ("Vishnu owned and scaled the UnifyApps design system, reused across 60+ deployments.\n\n"
  "His design skills, from his resume:\n\n**Design & Research**\nProduct Design, UX Design, Interaction Design, Information Architecture, "
  "User Flows, Design Systems, Component Libraries, Usability Testing, Journey Mapping, Accessibility (WCAG), Enterprise SaaS")

A5["skills-strategy"] = ("Vishnu works beyond screens: he takes products from discovery to launch with product, engineering and executive "
  "stakeholders, and influences product direction at the executive level.\n\n"
  "From his resume:\n\n**Strategy & Systems**\nProduct Strategy, Product Discovery, Systems Thinking, User Research, Stakeholder Management, "
  "Design Leadership, DesignOps, Data Visualization")

A5["skills-research"] = ("Research comes before screens in Vishnu's process.\n\n"
  "From his resume: **User Research, Product Discovery, Usability Testing, Journey Mapping.**")

A5["skills-soft"] = ("Vishnu works directly with product, engineering and executive stakeholders in iterative review cycles, and mentors designers on his team.\n\n"
  "From his resume: **Stakeholder Management** and **Design Leadership**. He mentored 6 junior designers through critiques and growth planning.")

A5["tools"] = "The tools on his resume:\n\n" + TOOLS_MD

# ════════════════ AI: his approach first, then the examples ════════════════
A5["ai-experience"] = ("Vishnu is a product designer who applies AI when a product needs it, not an \"AI designer\". "
  "He treats AI as specific mechanisms, like search, summaries and agents, rather than buzzwords. At ICD he leads design on AI products for UnifyApps across 60+ enterprise deployments.\n\n"
  "Where you can see it in his case studies:\n\n"
  "- **Enterprise Search:** AI answers with sources across a company's tools, plus an agent marketplace\n"
  "- **Agent Workforce Platform:** building, governing and running AI agents\n"
  "- **ADEO:** AI briefings, an archive assistant and live minutes for government committees\n"
  "- **HDFC Bank:** AI that infers preferences and simplifies legal disclosures\n"
  "- **Sony:** AI contract review, minutes generation, scheduling conflict detection and social intelligence")
F5["ai-experience"] = ["How does he design for trust in AI?", "What are his AI skills?", "Tell me about the Agent Workforce Platform"]

A5["ai-trust"] = ("Vishnu wants AI tools to be useful, understandable and trustworthy. In his work, people should be able to see where "
  "an AI answer came from, know when content was machine-generated, and stay in control of decisions that matter.\n\n"
  "From his case study reflections:\n\n"
  "- **Enterprise Search:** trust drives adoption more than AI performance; showing sources makes verification easy; transparency about failures builds confidence\n"
  "- **ADEO:** AI content is clearly labelled so users always know what was machine-generated\n"
  "- **Sony:** people trust AI more when they can see how it reached a result")

A5["human-in-loop"] = ("In Vishnu's products, AI supports people rather than replacing their judgement. AI prepares and drafts; people review, "
  "edit and approve anything that becomes official.\n\n"
  "- **ADEO:** AI drafts minutes, action items and resolutions; humans approve them before they become official records. Every vote requires a rationale.\n"
  "- **Agent Workforce:** compliance reviewers see audit history and security controls before approving an agent.")

A5["agentic"] = ("Agentic systems are one of Vishnu's main focus areas, alongside search, automation and decision-making tools. "
  "Agentic UX and AI Product Design are on his resume.\n\n"
  "- **Agent Workforce Platform:** three ways to build AI agents (Simple, Workflow and Advanced), with guardrails and PII rules set during configuration, execution traces and reusable skills\n"
  "- **Enterprise Search:** an Agent Marketplace of ready-made agents, each showing whether it's verified")

A5["ai-governance"] = ("Vishnu designs AI for the people who oversee it, not only the people who use it. Admins and compliance reviewers are "
  "core users in his products, and governance is built into the workflow from the start.\n\n"
  "- **Agent Workforce:** guardrails and PII rules are set during configuration; every interaction is captured as a trace\n"
  "- **HDFC Bank:** consent actions are logged automatically in the normal workflow, creating an audit trail\n"
  "- **Enterprise Search:** compliance teams can see what data the platform can access and audit it")

A5["copilots"] = ("Conversational assistants appear in several of Vishnu's AI products at UnifyApps.\n\n"
  "- **Enterprise Search:** works as a copilot across Search, Chat, Agents, Spaces and Apps\n"
  "- **ADEO:** a conversational assistant that searches the five-year archive inside the session\n"
  "- **Sony:** a copilot that checks each scheduled event against its executed rights agreement")

A5["ai-patterns"] = ("Because he treats AI as specific mechanisms rather than a feature, some patterns repeat across Vishnu's work.\n\n"
  "- **Answers with sources:** Enterprise Search\n"
  "- **An AI briefing before the full document:** ADEO\n"
  "- **Three levels of control for different users:** Agent Workforce Platform\n"
  "- **Legal text in plain language:** HDFC Bank\n"
  "- **Early warnings on risks, conflicts and spikes:** Sony")

A5["ai-designer"] = ("No. Vishnu describes himself as a **product designer who applies AI when a product needs it**, not as an \"AI designer\". "
  "He treats AI behaviour as specific mechanisms rather than buzzwords.")

A5["when-not-ai"] = ("No. Vishnu applies AI only when a product needs it. For example, his Mphasis visitor management project has no AI "
  "features; AI is listed there only as possible future extensions.")

# ════════════════ PROCESS: his approach first, then the examples ════════════════
A5["design-process"] = ("Vishnu's process is research-first. Before designing any screens, he maps the people, dependencies, goals and "
  "failure points, a habit from studying Planning & Architecture, where he learned to understand systems before changing them. "
  "He owns projects end to end, from discovery to launch, and invests in clear flows, reusable patterns and documented components.\n\n"
  "In his case studies:\n\n"
  "- **Enterprise Search:** three user roles (employees, administrators, compliance teams) shaped one copilot model: Ask → Configure → Govern\n"
  "- **ADEO:** committee work was structured as Analyse → Deliberate → Decide & Record\n"
  "- **Agent Workforce:** Configure → Orchestrate → Tune, with three build modes for different users")
F5["design-process"] = ["What makes his approach unique?", "Tell me about ADEO"]

A5["unique-approach"] = ("Vishnu treats design as a system problem. He doesn't see a product as a collection of screens; he works out how the "
  "people, dependencies and decisions connect first.\n\n"
  "In his case studies:\n\n"
  "- **ADEO:** voting deliberately requires a rationale, because important decisions benefit from deliberate interactions, not speed\n"
  "- **Enterprise Search:** sync failures and unverified agents are shown openly, to build trust")

A5["principles"] = ("Vishnu's principles come from the products he has built, and each case study ends with them.\n\n"
  "- **Enterprise Search:** trust drives adoption more than AI performance\n"
  "- **ADEO:** important decisions benefit from deliberate interactions, not speed\n"
  "- **Agent Workforce:** simplicity means showing each user the right level of complexity\n"
  "- **HDFC Bank:** good records create compliance naturally\n"
  "- **Sony:** AI should act before the problem happens")

A5["research"] = ("Research shapes Vishnu's design decisions, and User Research, Usability Testing and Journey Mapping are on his resume.\n\n"
  "- **UnifyApps projects:** the product team defined the roles and led the research; their findings shaped the design decisions\n"
  "- **ADEO:** research was continuous, with requirements gathered from the client, multiple design iterations, and validation at each major decision")

A5["tradeoffs"] = ("Vishnu names the cost of key design decisions instead of presenting them as free wins. His case studies spell them out:\n\n"
  "- **ADEO:** members see only their own committees. That keeps them focused, but members of several committees need a separate view.\n"
  "- **ADEO:** every vote requires a rationale, which deliberately slows voting down\n"
  "- **Agent Workforce:** Simple mode hides technical controls, so engineers may find it limiting; Advanced mode exists for them\n"
  "- **Agent Workforce:** traces show gaps openly, which looks less polished but avoids confident wrong answers")

A5["simplicity"] = ("For Vishnu, simplicity in complex products means showing each user the right level of complexity, not removing features.\n\n"
  "- **Agent Workforce Platform:** Simple, Workflow and Advanced modes for different users\n"
  "- **HDFC Bank:** complex compliance information was organised, not removed")

A5["stakeholders"] = ("Vishnu works directly with product, engineering and executive stakeholders in iterative review cycles, and influences "
  "product direction at the executive level. Stakeholder Management is on his resume.\n\n"
  "- **HDFC Bank:** worked with HDFC's senior management and product team from brief through Final-for-Dev handoff\n"
  "- **Sony:** collaborated with legal, compliance, broadcast operations, content strategy and corporate governance teams\n"
  "- **ADEO:** worked alongside Frog Design and Nagarro Design")

A5["working-style"] = ("Vishnu works in iterative review cycles with PMs and senior stakeholders.\n\n"
  "From his resume: he **established design-to-engineering handoff and review workflows** that reduced rework, and **managed 3 enterprise initiatives in parallel**.")

# ════════════════ LEADERSHIP & TEAM ════════════════
A5["leadership"] = ("Vishnu works at lead scope: he owns design end to end on his projects, works directly with executive stakeholders, "
  "and mentors designers on his team. Design Leadership is on his resume.\n\n"
  "From his resume:\n\n"
  "- Led product design across **60+ enterprise deployments**\n"
  "- Owned and scaled the **UnifyApps design system**\n"
  "- Managed **3 enterprise initiatives in parallel**\n"
  "- Established **design-to-engineering handoff and review workflows**\n"
  "- **Mentored 6 junior designers** through critiques and growth planning")

A5["mentoring"] = ("Yes. Mentoring is part of Vishnu's role at ICD.\n\n"
  "From his resume: he **mentored 6 junior designers** through critiques and growth planning, and enforced WCAG 2.1 accessibility across products.")

A5["engineers"] = ("Vishnu works with engineering from discovery to launch.\n\n"
  "- From his resume: he **established design-to-engineering handoff and review workflows** that reduced rework and implementation inconsistencies\n"
  "- At Brane, he shipped responsive products with **clean developer handoff**\n"
  "- In the **Agent Workforce Platform**, engineers are one of the three user roles; Advanced mode gives them precise control")

A5["design-system"] = ("Yes. Vishnu builds design systems that shorten delivery time.\n\n"
  "From his resume: he **owned and scaled the UnifyApps design system** across AI, Data Quality, Governance and Workflow Automation, "
  "**reused across 60+ deployments**. Design Systems and Component Libraries are on his resume.")

A5["accessibility"] = ("Yes. **Accessibility (WCAG)** is on Vishnu's resume, and at ICD he **enforced WCAG 2.1 accessibility across products**.")

A5["multitasking"] = ("Running several projects at once is a normal part of Vishnu's role.\n\n"
  "From his resume: he **managed 3 enterprise initiatives in parallel**, balancing stakeholder priorities, engineering constraints and timelines.")

A5["dashboards"] = ("Data-heavy platforms are a core part of Vishnu's experience, and **Data Visualization** is on his resume.\n\n"
  "- **Sony Social Intelligence Command:** ~2.47M monthly social mentions combined with broadcast ratings\n"
  "- **HDFC Bank:** real-time monitoring of consent violations")

# ════════════════ ABOUT / HIRING ════════════════
A5["who-is-vishnu"] = ("**Vishnu Prasad K P** is a **Senior Product Designer at ICD (Itu Chaudhuri Design)**, working with UnifyApps. "
  "He's a product designer with 5+ years of experience in enterprise SaaS, AI and data-heavy platforms, and takes complex, high-stakes systems from discovery to launch.\n\n"
  "He has worked on **100+ use cases** across ICD, UnifyApps, Brane Enterprises and Kocha, focusing on **agentic systems, search, automation and decision-making tools**.")

A5["why-hire"] = ("Vishnu has designed high-stakes products for banks, governments and global enterprises, working directly with product, "
  "engineering and executive stakeholders.\n\n"
  "From his resume:\n\n"
  "- **5+ years** in enterprise SaaS, AI and data-heavy platforms\n"
  "- Led product design across **60+ enterprise deployments** (HDFC Bank, Sony Networks, Jubilant FoodWorks, Dubai Development Authority, DGE Abu Dhabi)\n"
  "- Owned and scaled the **UnifyApps design system**\n"
  "- Designed for **HDFC Bank's 30M+ customers** under India's DPDP Act\n"
  "- **Mentored 6 junior designers**\n\n" + f"Contact: **{EMAIL}**")

A5["best-problems"] = ("Vishnu works best on complex, high-stakes systems that run real work. His focus areas are **agentic systems, search, "
  "automation and decision-making tools**, and he takes them from discovery to launch.\n\n"
  "- **Search:** Enterprise Search\n- **Agentic systems:** Agent Workforce Platform\n- **Decision-making tools:** ADEO\n- **Compliance & data:** HDFC Bank\n- **Automation across teams:** the Sony platforms")

A5["domain-knowledge"] = ("Search is one of Vishnu's main focus areas. His **Intelligent Enterprise Search** case study connects a company's tools "
  "into one shared knowledge index, with direct answers and sources, plus an agent marketplace.")

EXTRA5 = {"ai-experience": ["work with ai", "works with ai", "approach ai", "approach to ai", "use ai", "uses ai", "ai approach", "how does he use ai", "his ai work", "ai in his work"]}
