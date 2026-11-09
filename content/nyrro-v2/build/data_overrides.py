# v2 overrides: applied on top of data_general.py by build.py.
# Principles:
#  - The 5 portfolio case studies are THE projects. Other client work appears only when the
#    visitor asks beyond them ("other projects", a specific client, or a domain the case studies don't cover).
#  - Each idea lives in one answer only (e.g. the architecture/"building" idea lives only in architecture-link).
#  - Each answer says something the others don't.

EMAIL = "vishnuprasadkp98@gmail.com"
CS = ["Tell me about Enterprise Search", "Tell me about ADEO", "Tell me about the Agent Workforce Platform",
      "Tell me about HDFC Bank", "Tell me about the Sony platforms"]

OVERRIDES = {}
def O(id, answer=None, add_keywords=(), remove_keywords=(), add_questions=(), followups=None):
    OVERRIDES[id] = dict(answer=answer, add_keywords=list(add_keywords), remove_keywords=list(remove_keywords),
                         add_questions=list(add_questions), followups=followups)

O("who-is-vishnu",
  "**Vishnu Prasad K P** is a Senior Product Designer at **ICD (Itu Chaudhuri Design)**, leading design for **UnifyApps**, an AI-powered enterprise platform.\n\nHe designs complex products that organisations run real work on: enterprise search, AI agents, governance and decision tools. His recent work includes products for **HDFC Bank**, **DGE Abu Dhabi** and **Sony Pictures Networks India**.",
  followups=["What has he worked on?", "What makes his approach unique?", "How many years of experience?"])

O("education",
  "**Bachelor of Planning & Architecture**, NIT Bhopal (2017 – 2021).",
  followups=["How does architecture shape his design?", "Walk me through his career"])

O("unique-approach",
  "Three things stand out:\n\n- **He maps the system before the screens.** Roles, dependencies and failure points come first, so the product holds together as it grows.\n- **He treats trust as a design material.** In AI products, answers carry sources, AI content is labelled, and failures are visible instead of hidden.\n- **He names the cost of every decision.** In the ADEO committee platform he made voting deliberately slower by requiring a rationale, because government decisions deserve that friction.",
  followups=["Tell me about ADEO", "What are his design principles?"])

O("projects-list",
  "Vishnu's portfolio features **five case studies**:\n\n1. **Intelligent Enterprise Search:** AI search across a company's tools, with sources (UnifyApps)\n2. **Committee Board Agentic App:** AI-assisted committee decisions for the Abu Dhabi government (DGE / ADEO)\n3. **Agent Workforce Platform:** build, govern and run AI agents (UnifyApps)\n4. **Consent at the scale of a nation's bank:** DPDP consent management for 30M+ customers (HDFC Bank)\n5. **Intelligence at the core of a media group:** four AI platforms for Sony Pictures Networks India\n\nWhich one would you like to explore?",
  add_keywords=["app", "apps", "his apps", "products", "product", "what apps", "which apps", "apps he designed", "applications", "show apps", "case studies list", "major projects", "main projects", "key projects", "featured"],
  add_questions=["what apps has he designed", "show me his apps", "what are his main projects"],
  followups=CS[:4] + ["Other client work"])

O("other-projects",
  "Beyond the five case studies, Vishnu has designed for **15+ other clients** through ICD and UnifyApps:\n\n- **Banking & insurance:** Mashreq (payments, credit, incidents), Niva Bupa\n- **Government:** Digital Dubai, Digital Ajman, CGB Qatar\n- **Enterprise AI & knowledge:** Lowe's, Stowers Institute, Docebo, Shaw Industries\n- **Operations & finance:** Greif, Tekion, Wasl, Jubilant\n- **HR, workplace & aviation:** Virtusa, Mphasis, Air Arabia\n\nThese aren't public case studies, but I can tell you what each one was about. Just name the client.",
  followups=["Tell me about Mashreq", "Tell me about Digital Dubai", "Tell me about Lowe's", "Tell me about Greif"])

O("experience-years",
  "**5+ years** in product design, across three companies:\n\n- **ICD / UnifyApps:** Oct 2024 – present\n- **Brane Enterprises:** Oct 2023 – Sep 2024\n- **Kocha Technologies:** Nov 2021 – Oct 2023\n\nOver that time he has worked on **100+ use cases**, including **60+ enterprise deployments** at UnifyApps.",
  followups=["What did he do at each company?", "What is his title?"])

O("career-history",
  "1. **Kocha Technologies** (2021 – 2023): designed an NFT marketplace end to end, from onboarding and discovery to bidding and wallets\n2. **Brane Enterprises** (2023 – 2024): led UX for 20+ client projects on a low-code platform, across e-commerce, finance, healthcare and education\n3. **ICD, embedded at UnifyApps** (2024 – present): leads design on UnifyApps' AI products and enterprise deployments\n\nHis work moved from consumer and Web3 products to large-scale enterprise and AI systems.",
  followups=["Tell me about his early work", "What is he working on now?"])

O("location-regions",
  "He's based in **India** and designs for teams in **India, the UAE, Qatar and the US**. Two of his case studies show this range:\n\n- **HDFC Bank** in India\n- **DGE / ADEO** for the Abu Dhabi government",
  followups=["Tell me about ADEO", "Other client work"])

O("skills",
  "**Design & research**\n- Product, UX and interaction design; information architecture\n- Design systems and component libraries\n- Usability testing, journey mapping, accessibility (WCAG)\n\n**Strategy & systems**\n- Product strategy and discovery; systems thinking\n- Stakeholder management and design leadership\n- Data visualisation\n\n**AI**\n- Agentic UX and AI product design\n- Prompt engineering and generative prototyping",
  followups=["What tools does he use?", "How does he design?"])

O("design-process",
  "His process moves from understanding to delivery:\n\n1. **Map the system:** who uses it, what each person needs, what depends on what, where it breaks\n2. **Define the roles:** end users, admins, compliance and leaders each get their own experience\n3. **Frame the problems:** a few structural problems, each tied to a product response\n4. **Design one core flow** every role shares (in ADEO: *Analyse → Deliberate → Decide & Record*)\n5. **Decide, and name the cost** of each decision\n6. **Validate** in review cycles with PMs, clients and engineering\n7. **Hand off** documented components to developers",
  followups=["How does he handle trade-offs?", "How does he do research?"])

O("principles",
  "- **Trust is the product:** people adopt AI they can verify\n- **People stay in control:** AI drafts, humans approve\n- **The right complexity for each user:** simplicity doesn't mean fewer features\n- **Governance from the start:** guardrails and audit trails live inside the workflow\n- **Organise complexity, don't delete it**\n- **Act before the problem:** flag risk early\n- **Every decision has a cost:** name it",
  followups=["How does he design for trust in AI?"])

O("tradeoffs",
  "He states trade-offs openly in his case studies:\n\n- **ADEO:** members see only their own committees, which keeps them focused, but people on several committees need a separate view\n- **Agent Workforce:** Simple mode hides technical controls, so engineers use Advanced mode instead\n- **Agent Workforce:** execution traces show gaps openly, which looks less polished but prevents confident wrong answers",
  followups=["Tell me about ADEO", "Tell me about the Agent Workforce Platform"])

O("simplicity",
  "He shows each person **the right amount of complexity** instead of removing capability.\n\nThe **Agent Workforce Platform** is one product with three depths: Simple for product managers, Workflow for operations teams, Advanced for engineers. At **HDFC**, dense compliance content was **reorganised** around how customers think rather than cut.",
  followups=["Tell me about the Agent Workforce Platform"])

O("stakeholders",
  "He works directly with senior stakeholders in iterative review cycles:\n\n- **HDFC Bank:** with the bank's senior management and product team, from brief to final handoff\n- **Sony:** with legal, compliance, broadcast operations, content strategy and governance teams\n- **ADEO:** alongside Frog Design and Nagarro Design for a government client\n\nHe gets everyone aligned on a short list of clear problems and **one shared source of truth**, with a view tailored to each role.",
  followups=["How does he work with engineers?", "Tell me about HDFC Bank"])

O("success-metrics",
  "Results from his case studies, each attributed to its source:\n\n- **ADEO:** committee preparation went from up to 15 working days to **minutes**\n- **Sony:** contract cycle time went from 30–45 days to **18 days** (project documentation)\n- **HDFC Bank:** **400M+** consents captured and **$4M** saved a year (reported by UnifyApps)\n- **Enterprise Search & Agent Workforce:** **~$5.5M** in projected savings (UnifyApps' published figures)",
  followups=["Are these numbers real?", "Tell me about Sony"])

O("ai-experience",
  "Yes. Most of his recent work involves AI, though he calls himself a **product designer who applies AI when a product needs it**.\n\nAcross his case studies he has designed:\n\n- **AI search** with source-cited answers (Enterprise Search)\n- **AI agent building** with guardrails and traces (Agent Workforce)\n- **AI briefings and live minutes** for government decisions (ADEO)\n- **AI that turns legal text into plain language** (HDFC)\n- **Contract risk, conflict detection and social listening** (Sony)",
  remove_keywords=["chatgpt"],
  followups=["How does he design for trust in AI?", "Tell me about the Agent Workforce Platform"])

O("ai-trust",
  "His central idea is that **in enterprise AI, trust is the product**. In practice:\n\n- **Sources on every answer**, so people can verify instead of guess\n- **AI content clearly labelled**, as in ADEO's briefings\n- **Failures shown openly:** sync failures, unverified agents, gaps in traces\n- **Humans sign off:** AI drafts minutes and summaries; people approve them\n- **Execution traces** that show how an agent reached its answer",
  followups=["Tell me about Enterprise Search"])

O("human-in-loop",
  "AI does the heavy lifting; **people make the consequential decisions**.\n\n- **ADEO:** AI drafts minutes and resolutions, and the committee approves them before they become official\n- **ADEO:** every vote needs a human-written rationale\n- **Agent Workforce:** compliance reviewers approve agents with their guardrails documented\n\nThe aim is to spend human attention only where it's needed.",
  followups=["Tell me about ADEO"])

O("agentic",
  "Yes. The **Agent Workforce Platform** is his main agentic work: a platform for building, governing and running AI agents in three modes (**Simple, Workflow, Advanced**), with guardrails, execution traces and reusable skills.\n\nHis **Enterprise Search** platform also includes an **Agent Marketplace** of verified, ready-made agents.",
  followups=["Tell me about the Agent Workforce Platform", "Other agentic projects"])

O("copilots",
  "A good copilot, in his view, **helps people finish the task**, not just answer a question.\n\n- **Enterprise Search:** one copilot over Search, Chat, Agents, Spaces and Apps\n- **ADEO:** an assistant that searches five years of decisions mid-session\n- **Sony:** a copilot that checks every scheduled broadcast against its rights contract",
  followups=["Tell me about Enterprise Search", "Other client work"])

O("ai-patterns",
  "Patterns he returns to:\n\n- **Answers with citations (RAG):** Enterprise Search\n- **The briefing before the document:** ADEO\n- **Three levels of control:** Agent Workforce\n- **Plain-language versions of legal text:** HDFC\n- **Spike, conflict and risk detection:** Sony\n- **Confidence scores and evidence** for human review (used across his client work)",
  followups=["How does he design for trust in AI?"])

O("ai-governance",
  "He builds governance into **setup**, not after-the-fact review:\n\n- **Agent Workforce:** guardrails and PII rules are set when an agent is created, and every action is traced\n- **HDFC:** consent actions are logged automatically, so the audit trail builds itself\n- **Enterprise Search:** compliance teams see what data the platform can access",
  followups=["Tell me about HDFC Bank"])

O("best-problems",
  "Problems where **information, people and decisions are scattered**:\n\n- **Scattered knowledge:** Enterprise Search brings it into one source with citations\n- **Slow, high-stakes decisions:** ADEO gives AI briefings and structured deliberation\n- **Compliance pressure:** HDFC records consent and creates an audit trail inside the flow\n- **AI that has to be governed:** Agent Workforce controls it with guardrails and traces\n- **Many manual workflows at once:** the Sony platforms cover contracts, board governance, scheduling and social listening",
  followups=CS[:3])

O("common-thread",
  "Across his five case studies:\n\n- **Evidence behind every AI output**\n- **People approve** what matters\n- **One source of truth**, with a view for each role\n- **Governance designed in** from day one",
  followups=["What are his design principles?"])

O("industries",
  "**His case studies cover:** enterprise SaaS (UnifyApps), government (Abu Dhabi), banking (HDFC) and media (Sony).\n\n**Beyond them**, his client work includes insurance, retail, manufacturing, aviation, hospitality, HR and automotive.",
  followups=["Other client work", "Tell me about ADEO"])

O("most-complex",
  "- **By scope:** **Sony**, four connected platforms for contracts, board governance, broadcast scheduling and social listening\n- **By stakes:** **HDFC**, with a regulatory deadline that couldn't move and 30M+ customers, and **ADEO**, government decisions on 1,000+ proposals a month",
  followups=["Tell me about Sony", "Tell me about HDFC Bank"])

O("current-work",
  "He's leading design at **ICD for UnifyApps**: its AI products (Enterprise Search, Agent Workforce, the Low-Code Builder), client deployments, and the shared design system. Much of the current work is under NDA.",
  followups=["Tell me about Enterprise Search", "Other client work"])

O("why-hire",
  "- He's led design on **high-stakes AI products** for HDFC Bank, the Abu Dhabi government and Sony\n- He designs **AI people trust**, with sources, labels and a human in control\n- He works directly with **executives and engineers**, and set up a handoff process that reduced rework\n- His **design system** is reused across 60+ deployments\n- He **mentors** designers and runs several projects in parallel\n\n" + f"He'd be glad to talk: **{EMAIL}**",
  followups=["How can I contact him?"])

O("dashboards",
  "Yes. He designs data-heavy products by **leading with what needs attention and why**, not with every number.\n\n- **Sony Social Intelligence:** 2.47M monthly mentions combined with ratings, with spike detection and sentiment\n- **HDFC:** an operator console for monitoring consent violations in real time\n\nHis client work also includes dashboards for government services, hotel budgets and incident response.",
  followups=["Tell me about Sony", "Other client work"])

O("domain-banking",
  "His banking case study is **HDFC Bank**: consent and preference management for 30M+ customers under India's DPDP Act.\n\nWhat he took from it:\n\n- Regulation is a hard constraint, so compliance should happen naturally inside the workflow\n- Every number must be traceable\n- Customers and operators need to work from the same record",
  followups=["Tell me about HDFC Bank", "Other banking projects"])

O("domain-government",
  "His government case study is the **Committee Board Agentic App for DGE / ADEO, Abu Dhabi**: AI briefings, deliberation, voting and live minutes for 1,000+ proposals a month.\n\nWhat's different about government:\n\n- Accountability matters more than speed\n- AI content must be clearly labelled\n- Every decision needs a recorded rationale",
  followups=["Tell me about ADEO", "Other government projects"])

O("domain-knowledge",
  "It's one of his core areas. His **Intelligent Enterprise Search** case study connects a company's tools into one index, so people get direct, role-aware answers with sources, plus an agent marketplace.",
  followups=["Tell me about Enterprise Search", "Other client work"])

O("domain-media",
  "Yes. **Sony Pictures Networks India** is one of his case studies: four platforms covering **contracts, board governance, sports broadcast scheduling and social intelligence**.",
  followups=["Tell me about Sony"])

O("domain-sales",
  "None of his five case studies is a sales tool, but his client work includes:\n\n- **Shaw Industries:** account intelligence, call analysis, RFP automation\n- **Docebo:** deal-loss analysis, Voice of Customer, sales handoff\n- **Niva Bupa:** insurance sales enablement",
  followups=["Tell me about Shaw Industries", "Tell me about Docebo"])

O("domain-finance-ops",
  "His client work includes several finance operations products:\n\n- **Tekion:** reconciliation across bank records, invoices and lockbox files\n- **Wasl:** hotel portfolio budgeting with staged Board approvals\n- **Mashreq Cash AI:** treasury and cross-border payments\n\nIn his case studies, **Sony's contract platform** integrates with SAP S/4.",
  followups=["Tell me about Tekion", "Tell me about Wasl"])

O("leadership",
  "Yes:\n\n- Leads design **end to end** on UnifyApps products\n- **Mentors junior designers** (6, per his resume) through critiques and growth planning\n- Runs **several initiatives in parallel**\n- Set up ICD's **design-to-engineering handoff** process\n- Works directly with **client executives**",
  followups=["How does he mentor?", "How does he work with engineers?"])

O("platforms",
  "- **Web:** most of his enterprise work\n- **Tablet-first:** the ADEO committee app\n- **Web + mobile:** Enterprise Search, Agent Workforce, HDFC consent\n- **iOS & Android apps:** earlier in his career (hotel booking, alarm and habit-tracking apps)",
  remove_keywords=["app", "apps", "mobile"],
  add_keywords=["mobile app", "mobile apps", "mobile design", "mobile ux", "ios app", "android app", "tablet app", "native app", "native apps"],
  followups=["Tell me about ADEO", "Tell me about his early work"])

O("hobbies",
  "- 🎨 **Live sketching and watercolour**\n- ⚽ **Football**\n- ✈️ **Travel**\n- 🚴 **Long bike rides**",
  followups=["Where can I see his art?", "Who are you?"])

O("art",
  "Mostly **live sketching and watercolour**, with some oil painting. His About page sums him up as *a product designer, a planner and a painter*.\n\n- **Sketchbook:** instagram.com/sketch_b.o.o.k\n- **Paintings:** behance.net/vishnuprasadkp")

# Honest "I don't know" message. Used for fallback and for details Nyrro doesn't have.
DONT_KNOW = f"I don't know about that, sorry. You can get in touch with Vishnu directly at **{EMAIL}**, and he'll be happy to help."

# ── Vocabulary widening (v2 phrasing tests) ──
def K(id, *kws):
    if id in OVERRIDES: OVERRIDES[id]["add_keywords"] += list(kws)
    else: O(id, add_keywords=kws)
# ── Lead-level rewrites from the resume (v2.1) ──
O("who-is-vishnu",
  "**Vishnu Prasad K P** is a Senior Product Designer at **ICD (Itu Chaudhuri Design)**, leading design for **UnifyApps**, an AI-powered enterprise platform.\n\nWith 5+ years across enterprise SaaS, AI and data-heavy platforms, he takes complex, high-stakes systems from discovery to launch, working closely with product, engineering and executive stakeholders. His work includes products for **HDFC Bank**, **DGE Abu Dhabi** and **Sony Pictures Networks India**.",
  followups=["What has he worked on?", "What makes his approach unique?", "How many years of experience?"])

O("experience-years",
  "**5+ years** in product design across enterprise SaaS, AI and data-heavy platforms:\n\n- **ICD, embedded at UnifyApps** (Oct 2024 – present): drove design across **60+ enterprise deployments**, ran 3 initiatives in parallel and mentored 6 junior designers\n- **Brane Enterprises** (Oct 2023 – Sep 2024): led UX for **20+ client projects** on a low-code platform\n- **Kocha Technologies** (Nov 2021 – Oct 2023): designed an NFT marketplace end to end\n\nIn total, **100+ use cases**.",
  followups=["What did he do at each company?", "What is his title?"])

O("career-history",
  "1. **Kocha Technologies** (Nov 2021 – Oct 2023), Senior UI/UX Designer: designed **Nextdecentrum**, an NFT marketplace, end to end, covering onboarding, discovery, bidding and wallet integration with a distributed engineering team\n2. **Brane Enterprises** (Oct 2023 – Sep 2024), Senior UI/UX Designer: led UX for **20+ client projects** across e-commerce, finance, healthcare and education, turning unclear business and technical requirements into scalable workflows\n3. **ICD, embedded at UnifyApps** (Oct 2024 – present), Senior Product Designer: leads design on UnifyApps' AI products and **60+ enterprise deployments**, owns the design system and mentors 6 junior designers\n\nHis work moved from consumer and Web3 products to large-scale enterprise and AI systems.",
  followups=["Tell me about his early work", "What is he working on now?"])

O("skills",
  "Every skill on his resume, and where it shows in his work:\n\n**Design & research**\n- **Product, UX and interaction design** for enterprise SaaS, AI and data-heavy platforms\n- **Information architecture and user flows:** turning unclear business and technical requirements into scalable workflows\n- **Design systems and component libraries:** he owns the UnifyApps design system, reused across **60+ enterprise deployments**\n- **Usability testing and journey mapping**\n- **Accessibility (WCAG 2.1)**, held as a standard across the products his team ships\n\n**Strategy & systems**\n- **Product strategy and product discovery:** taking ambiguous, high-stakes problems from discovery to launch\n- **User research and systems thinking:** mapping the people, dependencies and failure points before designing a screen\n- **Stakeholder management:** **3 enterprise initiatives** run in parallel with product, engineering and executive stakeholders\n- **Design leadership and DesignOps:** mentors **6 junior designers**, and set up handoff and review workflows that cut rework\n- **Data visualisation** for data-heavy platforms\n\n**AI & tools**\n- **AI product design and agentic UX**, with **prompt engineering** and **generative prototyping**\n- **Tools:** Figma, Figma AI, FigJam, Framer, Miro, Adobe Creative Suite, Claude and Google AI Studio",
  followups=["What tools does he use?", "How does he design?"])

O("tools",
  "- **Design:** Figma, Figma AI, FigJam, Framer, Adobe Creative Suite\n- **Collaboration:** Miro, FigJam\n- **AI:** Claude, Google AI Studio",
  followups=["What are his core skills?", "How does he design?"])

O("proudest",
  "These five case studies in his portfolio show his strongest work. Which one he's proudest of is a question for Vishnu himself:\n\n1. **Intelligent Enterprise Search:** AI search across a company's tools, with sources (UnifyApps)\n2. **Committee Board Agentic App:** AI-assisted decisions for the Abu Dhabi government (DGE / ADEO)\n3. **Agent Workforce Platform:** build, govern and run AI agents (UnifyApps)\n4. **HDFC Bank consent platform:** consent management for 30M+ customers\n5. **Sony Pictures Networks India:** four AI platforms for a media group\n\nWhich would you like to explore?",
  followups=CS[:4])

O("industries",
  "Vishnu has designed across these domains. **Bold** names are full case studies in his portfolio:\n\n- **Enterprise AI & knowledge:** **Intelligent Enterprise Search**, **Agent Workforce Platform**, Lowe's, Stowers Institute, Docebo\n- **Government:** **Committee Board Agentic App (DGE / ADEO)**, Digital Dubai, Digital Ajman, CGB Qatar\n- **Banking & insurance:** **HDFC Bank**, Mashreq, Niva Bupa\n- **Media & entertainment:** **Sony Pictures Networks India**\n- **Manufacturing & sales:** Greif, Shaw Industries, Jubilant\n- **Automotive & hospitality:** Tekion, Wasl\n- **HR, workplace & aviation:** Virtusa, Mphasis, Air Arabia\n\nName any of them and I'll tell you what he designed.",
  followups=["Other client work", "Tell me about Mashreq", "Tell me about Digital Dubai"])

O("contact",
  "- **Email:** " + EMAIL + "\n- **LinkedIn:** [linkedin.com/in/vishnu-prasad-k-p-225949134](https://www.linkedin.com/in/vishnu-prasad-k-p-225949134/)\n- **Resume:** [vishnuprasad.space/resume](https://vishnuprasad.space/resume)",
  followups=["Why should we hire him?", "What has he worked on?"])

K("proudest", "best projects", "top projects", "best works", "best case studies", "greatest work", "his best projects")
K("experience-years", "his experience", "work experience", "professional experience", "his work experience")
K("industries", "what all domains", "domains and projects", "domain wise", "projects by domain", "domains he worked", "all domains")

K("projects-list", "projects", "project", "his projects", "tell me his projects", "what are his projects", "works", "his works", "major works", "important works", "main works", "key works", "his major works", "work he has done", "what work has he done", "what work", "cases", "show cases", "his cases", "list of cases", "casestudies", "casestudy", "major casestudies", "his casestudies", "important projects", "most important projects", "products he designed", "what products", "products did he design", "what did he design", "what has he designed", "major case studies")
K("proudest", "most famous project", "famous project", "most famous work", "top case studies", "top casestudies", "most important work", "headline project", "marquee project")
K("leadership", "lead teams", "lead team", "does he lead", "team lead")
K("other-projects", "other client work", "more client work", "client work", "other clients", "any other clients")
K("skills", "specialty", "specialization", "specialisation", "speciality", "what is he good at")
K("projects-list", "what kind of products", "kind of products", "what kind of products has he designed", "types of products", "type of products")
K("current-work", "where does he work now", "where does he work", "where is he working", "current company", "current employer", "which company is he in", "present job")
K("location-regions", "where is he from", "hometown", "native place", "which city", "which state")
K("experience-years", "how many projects", "number of projects", "how many clients", "how many use cases", "how many deployments", "how many projects has he done")
K("title-seniority", "his role", "role in these projects", "what is his role", "his role in projects", "role in projects")
K("ai-trust", "design for trust", "designing for trust", "how does he build trust", "trust in design")
K("sensitive", "how old is he", "his age", "age", "date of birth", "birthday", "dob", "married", "marital status")
K("education", "certification", "certifications", "certificate", "courses", "course")
K("greeting", "whats up", "what is up", "wassup", "wats up")
K("capabilities", "help me please", "please help", "i need help", "can you help", "help please", "need your help")
K("skills", "ux designer", "ui designer", "ui or ux", "ux or ui", "ux designer or ui designer", "what kind of skills")
K("why-hire", "reasons to hire", "reason to hire", "3 reasons", "three reasons", "good hire", "convince")
K("unique-approach", "known for", "famous for", "best known", "signature")
K("proudest", "strongest case study", "best case study", "strongest project", "strongest work")
K("projects-list", "which companies trust", "clients trust", "which clients", "who has he worked for", "who has he designed for", "brands")
K("solo-or-team", "team size", "how big was the team", "big team", "size of team", "how many people in team")
K("ai-experience", "projects use ai", "projects uses ai", "which projects ai", "projects with ai", "uses ai")
K("design-process", "design thinking", "double diamond", "ux process")
K("lead-fit", "lead a design team", "lead a team", "manage a design team", "build a design team")
K("mentoring", "feedback", "give feedback", "feedback to juniors", "design reviews", "review designs")
K("engineers", "documentation", "document", "documents", "specs", "spec")
K("research", "test his designs", "testing", "test designs", "usability test")
K("are-you-ai", "this chatbot", "how were you built", "who built you", "who made you", "how do you work", "how was this chatbot built", "built this bot")
K("who-is-vishnu", "kaun", "kaun hai", "vishnu kaun hai", "kon hai", "do for a living")
K("experience-years", "experience kitna", "kitna experience", "kitne saal", "kitne years")
K("design-process", "kaise design", "design kaise")
K("contact", "contact kaise", "kaise contact", "number do", "best way to contact")
K("location-regions", "kahan", "kaha se", "where from")
