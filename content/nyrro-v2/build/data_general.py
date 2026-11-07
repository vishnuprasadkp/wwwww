# General intents: not tied to a single project.
# keywords: phrases (multi-word phrases score higher). questions: sample phrasings (also matched).
INTENTS = []

PRIORITY = {"competitors", "sensitive"}

def I(id, category, keywords, questions, answer, followups=None):
    INTENTS.append({"id": id, "category": category, "keywords": keywords, "questions": questions,
                    "answer": answer, "followups": followups or [], "priority": id in PRIORITY})

EMAIL = "vishnuprasadkp98@gmail.com"

# ───────────── CONVERSATION ─────────────
I("greeting", "conversation",
  ["hi", "hello", "hey", "hii", "hola", "namaste", "good morning", "good evening", "good afternoon", "yo", "sup", "hey there", "anyone there"],
  ["hi", "hello there", "hey nyrro"],
  "Hi! I'm **Nyrro**, Vishnu's guide on this site.\n\nAsk me about his work, how he designs, the clients he's worked with, or how to reach him.",
  ["Who is Vishnu?", "What has he worked on?", "How does he design?"])

I("thanks", "conversation",
  ["thanks", "thank you", "thx", "ty", "great", "awesome", "cool", "nice", "helpful", "perfect", "appreciate"],
  ["thanks", "thank you so much", "that was helpful"],
  "Glad that helped! Anything else you'd like to know about Vishnu's work?",
  ["Show me his case studies", "How can I contact him?"])

I("bye", "conversation",
  ["bye", "goodbye", "see you", "see ya", "later", "cya", "good night"],
  ["bye", "see you later"],
  f"Thanks for stopping by! If you'd like to talk to Vishnu, he's at **{EMAIL}**.")

# ───────────── ABOUT ─────────────
I("who-is-vishnu", "about",
  ["who is vishnu", "intro", "quick intro", "who exactly", "what kind of designer", "kind of designer", "vishnu prasad", "who vishnu", "what does vishnu do", "vishnu do", "about vishnu", "tell me about vishnu", "introduce", "introduction", "who are you designing", "about him", "who is he", "tell me about him", "bio", "biography", "background", "profile", "elevator pitch", "tldr", "overview of vishnu"],
  ["who is vishnu", "tell me about vishnu", "can you introduce him", "give me his background", "who is this designer", "what does vishnu do"],
  "**Vishnu Prasad K P** is a Senior Product Designer at **ICD (Itu Chaudhuri Design)**, where he leads design for **UnifyApps**, an AI-powered enterprise platform.\n\nOver 5+ years he has designed complex, high-stakes systems for banks, governments and global enterprises.\n\n- **Clients:** HDFC Bank, DGE Abu Dhabi, Sony, Mashreq, Digital Dubai, Lowe's, Tekion, Jubilant\n- **Focus:** agentic systems, enterprise search, workflow automation, governance and decision tools\n- **Background:** Planning & Architecture, NIT Bhopal. He designs products like buildings: structure first, screens second",
  ["What makes his approach unique?", "What has he worked on?", "What's his experience?"])

I("summary-oneline", "about",
  ["one line", "one liner", "in one sentence", "short summary", "quick summary", "summarize vishnu", "sum up", "describe vishnu in"],
  ["describe vishnu in one line", "give me a quick summary", "sum him up in a sentence"],
  "A product designer who designs experiences for the **complex systems that run real work**.")

I("experience-years", "about",
  ["years of experience", "how many years", "experienced", "how long", "been a designer", "been designing", "since when", "experience", "how experienced", "yoe", "work experience", "how long has he", "years", "career length", "total experience"],
  ["how many years of experience does he have", "how experienced is vishnu", "what is his work experience", "how long has he been designing"],
  "**5+ years** in product design:\n\n- **ICD / UnifyApps** (Oct 2024 – present): Senior Product Designer, leading design on enterprise and AI products\n- **Brane Enterprises** (Oct 2023 – Sep 2024): Senior UI/UX Designer, 20+ client projects on a low-code platform\n- **Kocha Technologies** (Nov 2021 – Oct 2023): Senior UI/UX Designer, NFT marketplace and product work\n\nAcross his career: **100+ use cases**, including **60+ enterprise deployments**.",
  ["Tell me about his current role", "What did he do at Brane?", "Is he lead level?"])

I("title-seniority", "about",
  ["title", "designation", "senior", "lead", "level", "seniority", "position", "lead product designer", "senior product designer", "is he lead", "staff", "principal", "job title", "rank"],
  ["what is his title", "is he a lead designer", "what level is he", "why do case studies say lead", "is he senior or lead", "what's his designation"],
  "His title is **Senior Product Designer** at ICD. He works at **lead-level scope**, which is why his case studies list his project role as Lead Product Designer:\n\n- **Owns design end to end**, from client brief to developer handoff\n- Works directly with **executives and senior stakeholders** (e.g., HDFC Bank's senior management)\n- Runs **several enterprise initiatives in parallel**\n- Owns and scales the **UnifyApps design system** (reused across 60+ deployments)\n- **Mentors** junior designers through critiques and growth planning",
  ["Does he have leadership experience?", "Why should we hire him?"])

I("career-history", "about",
  ["career", "career history", "previous companies", "past companies", "work history", "companies", "employers", "where has he worked", "journey", "cv", "previous jobs", "past roles", "timeline"],
  ["where has he worked before", "what is his career history", "walk me through his career", "which companies has he worked for"],
  "**Career timeline**\n\n1. **Kocha Technologies** (Nov 2021 – Oct 2023): Senior UI/UX Designer. Designed the Nextdecentrum / Momentable NFT marketplace end to end\n2. **Brane Enterprises** (Oct 2023 – Sep 2024): Senior UI/UX Designer. Led UX for 20+ client projects on a low-code platform\n3. **ICD, embedded at UnifyApps** (Oct 2024 – present): Senior Product Designer. Leads design across 60+ enterprise deployments and UnifyApps' core AI products\n\nThe arc: from consumer, Web3 and brand work to **large-scale enterprise and AI systems**.",
  ["What did he do at ICD?", "Tell me about his early work"])

I("education", "about",
  ["education", "degree", "college", "university", "nit", "nit bhopal", "bhopal", "studied", "study", "qualification", "graduated", "academic", "bachelor", "b.plan", "barch", "school"],
  ["where did he study", "what is his degree", "what is his educational background", "did he go to design school"],
  "**Bachelor of Planning & Architecture**, NIT Bhopal (2017 – 2021).\n\nPlanning taught him to understand a whole system before changing any part of it: who uses it, how the parts depend on each other, and where it can fail. He applies that same thinking to software.",
  ["How does architecture relate to his design?"])

I("architecture-link", "about",
  ["architecture", "architect", "planning", "design like a building", "building", "urban planning", "architecture to design", "architecture background", "from architecture", "background in architecture", "architecture degree"],
  ["how does architecture help his design", "why did he move from architecture to product design", "what does design like a building mean"],
  "More than you'd expect. A building and an enterprise product are both **systems many kinds of people move through**.\n\n**\"Design like a building\"** in practice:\n\n- **Foundation:** the data and permissions everything depends on\n- **Structure:** the core flow every role shares\n- **Rooms:** role-specific views for different people\n- **Circulation:** how people and work move between steps\n- **Safety:** what happens when something fails, and how people see it\n\nThat's why he maps roles, dependencies and failure points **before** drawing screens.",
  ["What is his design process?"])

I("languages", "about",
  ["languages", "language", "speak", "malayalam", "hindi", "tamil", "english", "arabic", "multilingual"],
  ["what languages does he speak", "does he speak hindi"],
  "- **English:** professional\n- **Malayalam:** native\n- **Hindi:** conversational\n- **Tamil:** conversational")

I("location-regions", "about",
  ["where is he based", "location", "based", "country", "city", "regions", "international", "global", "uae", "middle east", "gcc", "us clients", "india", "countries", "geography", "where does he work"],
  ["where is he based", "which countries has he worked with", "does he have international experience", "has he worked with middle east clients"],
  "He's based in **India** and works with clients across four regions:\n\n- **India:** HDFC Bank, Sony Pictures Networks India, Jubilant, Niva Bupa, Mphasis\n- **UAE:** DGE / ADEO Abu Dhabi, Digital Dubai, Digital Ajman, Mashreq, Wasl, Air Arabia\n- **Qatar:** CGB\n- **US and global:** Lowe's, Tekion, Shaw Industries, Greif, Stowers Institute, Docebo, Virtusa",
  ["Tell me about his government work", "Can he work remotely?"])


I("current-work", "about",
  ["working on now", "currently working", "right now", "these days", "current projects", "current work", "what is he doing now", "latest work", "recent work", "nowadays"],
  ["what is vishnu working on right now", "what is he doing these days"],
  "He's currently a **Senior Product Designer at ICD**, leading design for **UnifyApps**:\n\n- UnifyApps' core products: **Enterprise Search**, **Agent Workforce Platform**, **Low-Code Builder**\n- Client solutions across banking, government, retail, manufacturing and more\n- Owning and scaling the **UnifyApps design system**\n- **Mentoring** junior designers\n\nMany current projects are under NDA, but the case studies show recent work.",
  ["Show me his case studies", "Tell me about Enterprise Search"])

I("dashboards", "skills",
  ["dashboard", "dashboards", "data visualization", "data visualisation", "dataviz", "data viz", "analytics", "charts", "reporting", "reports", "kpi dashboard", "data heavy", "data-heavy", "insights platform", "bi"],
  ["has he designed dashboards", "any experience with data visualization", "can he design analytics products"],
  "Yes. Data-heavy products are a big part of his work:\n\n- **CGB Qatar (Sharek):** government service performance across entities, with benchmarking, SLA monitoring, funnels and anomaly detection\n- **Sony Social Intelligence:** 2.47M monthly mentions plus ratings, spike detection, sentiment\n- **Wasl:** consolidated P&L and CAPEX across a hotel portfolio\n- **Mashreq Incidents:** SLA tracking, timelines, causal chains\n- **Docebo:** Voice of Customer, NPS, deal-loss analytics\n- **Shaw Industries:** account and market intelligence\n\nHis approach: lead with **what needs attention and why**, not with every number.",
  ["Tell me about Sharek", "Tell me about Sony Social Intelligence"])

I("coding", "skills",
  ["code", "coding", "can he code", "html", "css", "javascript", "frontend", "front end", "developer skills", "programming", "vibe coding", "build websites", "technical skills"],
  ["does he know coding", "can he code", "is he technical"],
  "He's a product designer first, but technically fluent:\n\n- Works closely with engineering on **handoff and implementation** (he set up ICD's handoff and review process)\n- Designs **for engineers as users** (Agent Workforce Advanced mode: models, retrieval, evaluations)\n- Uses **AI tools like Claude and Google AI Studio** for prototyping\n- Rebuilt his own portfolio site in code, moving off a no-code builder",
  ["How does he work with engineers?"])

# ───────────── SKILLS & TOOLS ─────────────
I("skills", "skills",
  ["skills", "skill set", "skillset", "strengths", "expertise", "good at", "specialization", "specialisation", "superpower", "capabilities", "what can he do", "competencies", "strong at", "core skills", "prompt engineering", "ui ux", "ui and ux", "ux and ui", "ui as well as ux", "ux design", "ui design", "interaction design", "information architecture", "visual design skills"],
  ["what are his skills", "what is he good at", "what are his strengths", "what is his expertise"],
  "**Design & Research**\n- Product, UX and interaction design; information architecture; user flows\n- Design systems and component libraries\n- Usability testing, journey mapping, accessibility (WCAG)\n\n**Strategy & Systems**\n- Product strategy and discovery; systems thinking\n- Stakeholder management; design leadership; DesignOps\n- Data visualisation\n\n**AI**\n- AI product design and agentic UX\n- Prompt engineering and generative prototyping",
  ["What tools does he use?", "What AI work has he done?"])

I("tools", "skills",
  ["tools", "software", "figma", "framer", "miro", "figjam", "adobe", "photoshop", "illustrator", "after effects", "stack", "toolkit", "design tools", "claude", "ai tools", "google ai studio", "prototyping tool"],
  ["what tools does he use", "does he use figma", "what is his design stack", "does he use ai tools"],
  "- **Design:** Figma, Figma AI, FigJam, Framer, Adobe Creative Suite\n- **Collaboration:** Miro, FigJam\n- **AI:** Claude, Google AI Studio, used for research synthesis, prototyping and generative exploration\n\nHe also builds with code where it helps, for example rebuilding his own portfolio site.")

I("platforms", "skills",
  ["mobile", "tablet", "ios", "android", "app", "apps", "responsive", "web", "desktop", "platforms", "mobile design", "mobile app"],
  ["has he designed mobile apps", "does he do tablet design", "web or mobile"],
  "Yes, across platforms:\n\n- **Web:** most enterprise work (search, agents, governance, dashboards)\n- **Tablet-first:** ADEO committee platform for Abu Dhabi\n- **Mobile + web:** Digital Dubai supplier onboarding, Enterprise Search, Agent Workforce, HDFC consent\n- **Offline-first field tool:** Air Arabia cabin crew assessments\n- **iOS & Android apps:** earlier career (Nest hotel booking, Minder alarm, D.Note)")

# ───────────── PROCESS & STRATEGY ─────────────
I("design-process", "process",
  ["process", "design process", "how does he design", "how he designs", "methodology", "approach", "workflow", "framework", "start a project", "start a new project", "new project", "kick off", "first step", "first thing", "how does vishnu design", "how vishnu designs", "how he designs", "how does he design", "way of working", "steps", "design approach"],
  ["how does vishnu design", "what is his design process", "walk me through his process", "what's his approach to a project", "how does he work"],
  "His process is **research-first and systems-first**:\n\n1. **Understand the system:** who uses it, what they need, what depends on what, where it breaks\n2. **Define the roles:** end users, admins, compliance, leaders, each with a different experience\n3. **Frame the problems:** a small set of structural problems, each mapped to a product response\n4. **Design the core flow:** e.g., *Ask → Configure → Govern* or *Analyse → Deliberate → Decide*\n5. **Decide and name the cost:** every important choice comes with its trade-off\n6. **Validate iteratively** with PMs, client stakeholders and engineering\n7. **Hand off cleanly:** documented components and patterns, then Final-for-Dev",
  ["What are his design principles?", "How does he handle trade-offs?", "How does he do research?"])

I("unique-approach", "process",
  ["unique", "different", "stand out", "special", "differentiator", "what makes him", "why him", "edge", "usp", "distinctive", "better than other designers"],
  ["what makes vishnu's design approach unique", "how is he different from other designers", "what sets him apart"],
  "Three things stand out:\n\n- **Systems before screens.** He maps people, dependencies and failure points before designing, a habit from his planning and architecture training.\n- **Trust as a design material.** In AI products: sources on every answer, AI content clearly labelled, failures shown openly, a person always in control.\n- **Decisions with named costs.** No design choice is presented as free. In ADEO, he made voting deliberately slower by requiring a rationale, because government decisions deserve that friction.",
  ["Show me the ADEO case study", "What are his design principles?"])

I("principles", "process",
  ["principles", "philosophy", "beliefs", "values", "mindset", "design philosophy", "guiding", "rules", "what does he believe"],
  ["what are his design principles", "what is his design philosophy", "what does he believe about design"],
  "- **Trust is the product:** adoption depends on trust more than on AI performance\n- **People stay in control:** AI drafts; humans review and approve\n- **Right complexity for each user:** simplicity ≠ removing features\n- **Governance from the start:** guardrails and audit trails live inside the workflow\n- **Design for every role:** admins and compliance reviewers are users too\n- **Organise complexity, don't delete it**\n- **Act before the problem:** flag risk early, not after\n- **Configuration is product:** rules and thresholds deserve design\n- **Every decision has a cost:** name the trade-off",
  ["How does he design for trust in AI?"])

I("research", "process",
  ["research", "user research", "discovery", "interviews", "personas", "usability testing", "validate", "validation", "user testing", "insights", "requirements"],
  ["how does he do user research", "does he do research", "how does he validate designs", "how does he gather requirements"],
  "It depends on the engagement, and he's careful to credit it accurately:\n\n- **UnifyApps projects:** the product team defined the roles and led the research; their findings shaped every design decision\n- **ADEO:** requirements came directly from the client and departments, with validation at every major decision instead of a single research phase\n- **His own discovery:** mapping roles, dependencies and failure points, then turning them into design decisions\n\nHe validates through iterative review cycles with PMs, client stakeholders and engineering.")

I("tradeoffs", "process",
  ["trade off", "tradeoff", "trade-offs", "tradeoffs", "compromise", "hard decision", "difficult decision", "tough call", "downside", "cost of decision", "decisions"],
  ["how does he handle trade-offs", "give an example of a hard design decision", "what compromises did he make"],
  "He makes trade-offs explicit. Examples:\n\n- **ADEO:** each member sees only their own committees, which keeps them focused, but multi-committee members need a separate view\n- **ADEO:** a required voting rationale adds friction on purpose\n- **Agent Workforce:** Simple mode hides technical controls; engineers use Advanced mode\n- **Agent Workforce:** traces show gaps openly, which looks less polished but avoids confident wrong answers\n- **Agent Workforce:** shared skills are harder to maintain, but stop teams rebuilding the same thing")

I("simplicity", "process",
  ["simplicity", "simplify", "complexity", "complex products", "make simple", "reduce complexity", "cognitive", "overwhelming", "progressive disclosure"],
  ["how does he simplify complex products", "how does he handle complexity"],
  "For him, simplicity means **showing each person the right amount of complexity**, not removing capability.\n\nThe Agent Workforce Platform is the clearest example: **one product, three depths**.\n\n- **Simple:** plain language for product managers\n- **Workflow:** a visual canvas operations teams can verify\n- **Advanced:** full control for engineers\n\nAnd at HDFC, compliance content was **organised** around how customers think, not cut.")

I("stakeholders", "process",
  ["stakeholders", "stakeholder management", "executives", "leadership team", "clients", "client management", "senior management", "cxo", "business teams", "competing needs", "alignment", "multiple stakeholders", "work with executives", "work with stakeholders", "work with clients", "work with leadership", "product managers", "product manager", "pms", "pm", "collaborate", "collaboration", "cross functional", "business stakeholders"],
  ["how does he work with stakeholders", "how does he manage executives", "how does he align different teams", "how does he handle competing stakeholder needs"],
  "Directly, in iterative review cycles:\n\n- **HDFC:** worked with the bank's senior management and product team from brief to final handoff\n- **Sony:** worked with legal, compliance, broadcast operations, content strategy and governance teams\n- **ADEO:** co-delivered with Frog Design and Nagarro Design for a government client\n\n**How he aligns people:** a small set of clear problems, decisions made explicit with their costs, and **one shared source of truth with role-specific views**. At HDFC, the customer portal and operator console run on the same consent record, so neither side can drift.")

I("success-metrics", "process",
  ["measure success", "success metrics", "kpi", "kpis", "how does he measure", "impact of design", "roi of design", "business impact", "outcomes", "results", "metrics"],
  ["how does he measure success", "what impact has his work had", "what results has he delivered"],
  "He ties design to **operational outcomes** (time saved, errors avoided, work made traceable) and is strict about honest attribution:\n\n- **ADEO:** prep from up to 15 working days → minutes\n- **Sony:** contract cycle 30–45 → 18 days; board minutes 2–3 days → 4 hours (project documentation)\n- **HDFC:** 400M+ consents, $4M yearly savings (reported by UnifyApps)\n- **Search / Agent Workforce:** ~$5.5M projected savings (UnifyApps' published figures)\n\nFor other client projects, outcomes are **expected or target** figures and are always presented that way.")

# ───────────── AI ─────────────
I("ai-experience", "ai",
  ["ai experience", "artificial intelligence", "ai work", "ai products", "ai projects", "llm", "genai", "gen ai", "generative ai", "machine learning", "ml", "ai design", "worked on ai", "ai powered", "gpt", "large language model", "ai native", "ai first products"],
  ["does he have ai experience", "what ai products has he designed", "has he worked on generative ai", "tell me about his ai work"],
  "Yes, extensive. Most of his work at ICD and UnifyApps involves AI, though he positions himself as a **product designer who applies AI when a product needs it**, not an \"AI designer\".\n\n**AI he has designed:**\n- **Enterprise search** with source-cited answers (RAG)\n- **AI agent builders** with guardrails and observability\n- **Copilots** that move from answers to actions\n- **Document extraction** with human confirmation\n- **AI briefings, risk scoring and summaries** for decision-makers\n- **Root-cause agents, anomaly detection, sentiment analysis**",
  ["How does he design for trust in AI?", "What agentic work has he done?", "Tell me about the Agent Workforce Platform"])

I("ai-trust", "ai",
  ["trust", "trustworthy", "transparency", "explainability", "explainable", "hallucination", "citations", "sources", "trust in ai", "responsible ai", "ethical ai", "confidence score"],
  ["how does he design for trust in ai", "how does he handle ai hallucinations", "how does he make ai explainable"],
  "Trust is the thread through all his AI work:\n\n- **Sources on every answer** so people verify instead of guess (Search, Stowers, Docebo)\n- **Clear labels** on anything machine-generated (ADEO)\n- **Confidence scores** that tell people when to look closer (Digital Dubai, Greif, Mashreq)\n- **Failures shown openly:** sync failures, unverified agents, gaps in traces\n- **Humans approve:** AI drafts minutes, contracts, summaries; people sign off\n- **Execution traces** showing every tool call and model decision\n\nHis central thesis: **in enterprise AI, trust is the product.**")

I("human-in-loop", "ai",
  ["human in the loop", "hitl", "human review", "human oversight", "approval", "human control", "people in control", "automation vs human", "manual review"],
  ["how does he design human in the loop", "who stays in control of the ai", "how does he balance automation and human review"],
  "AI does the heavy work; **people make the consequential decisions**. Examples:\n\n- **Digital Dubai:** suppliers confirm AI-extracted data; specialists verify flagged exceptions\n- **Greif:** plant managers approve recovered charges\n- **Mashreq Credit:** risk managers challenge AI findings at review checkpoints\n- **Ajman One:** business owners confirm every step before the agent submits\n- **ADEO:** AI drafts minutes; humans approve before they become official\n\nThe goal: **reserve human attention for the exceptions that need it.**")

I("agentic", "ai",
  ["agentic", "agents", "ai agents", "agent", "multi agent", "multi agent orchestration", "agent orchestration", "autonomous", "orchestration", "agentic ai", "agentic ux", "agent design"],
  ["has he designed ai agents", "what agentic work has he done", "does he know agentic ux"],
  "Yes, a lot:\n\n- **Agent Workforce Platform:** a full agent builder (Simple, Workflow, Advanced) with guardrails, observability and reusable skills\n- **Mashreq Credit Initiation:** classifies documents, spreads financials, stress-tests repayment\n- **Mashreq Incident Investigation:** SRE and search agents find root causes\n- **Supplier GPT (Digital Dubai):** AI-assisted tender submission and invoicing\n- **Ajman One:** guided government journeys with user approval\n- **Greif:** agentic exception review for revenue recovery\n- **Enterprise Search:** an Agent Marketplace of verified agents",
  ["Tell me about the Agent Workforce Platform"])

I("ai-governance", "ai",
  ["governance", "guardrails", "compliance", "audit", "audit trail", "pii", "security", "safety", "observability", "traces", "ai governance", "regulation", "regulatory"],
  ["how does he approach ai governance", "how does he design for compliance", "how does he handle ai safety"],
  "He builds governance into **setup**, not review:\n\n- **Guardrails and PII rules** configured when an agent is created\n- **Traces** of every tool call, retrieval and model decision\n- **Compliance reviewers** approve documented decisions instead of reverse-engineering behaviour\n- **Audit trails** that build themselves as part of the normal workflow (HDFC, Virtusa, Greif, Wasl)\n- **Plain-language admin controls** over tools, models and data")

I("copilots", "ai",
  ["copilot", "copilots", "chatbot", "chatbots", "assistant", "assistants", "conversational", "conversational ai", "chat interface", "conversational ux", "virtual assistant", "conversational ai experience", "chatbot experience"],
  ["has he designed chatbots", "what is his view on copilots", "has he designed conversational interfaces"],
  "Many. His view: a good copilot doesn't stop at answering; it **moves people toward completing the task**.\n\n- **Supplier GPT:** \"where's my payment?\" → create the invoice, submit the tender\n- **Mashreq Cash AI:** payment questions with downloadable MT103 proof\n- **Smart Employee Copilot:** answers plus leave and certificate requests\n- **Wasl:** an insights copilot explaining budget changes\n- **Ajman One:** guided licence and lease renewal\n- **Sony:** a rights-check copilot inside the sports scheduler\n\nAlways with **sources**, and the person **confirming actions**.")

I("when-not-ai", "ai",
  ["without ai", "no ai", "not ai", "every project", "ai in every", "always use ai", "ai everywhere", "force ai", "when not to use ai", "non ai", "ai overkill", "unnecessary ai", "does everything need ai"],
  ["when does he decide ai is not needed", "has he done non ai projects"],
  "When the problem is **coordination, not intelligence**.\n\nHis **Mphasis visitor management** work uses no AI in its current design. The value comes from QR self-registration, OTP check-in and one shared visit status. AI ideas (ID extraction, visitor forecasting) are noted as future options, not forced in.\n\nThat's why he calls himself a product designer who applies AI **when the product needs it**.")

I("ai-designer", "ai",
  ["ai designer", "is he an ai designer", "ai ux designer", "ai first", "ai specialist"],
  ["is he an ai designer"],
  "He'd say no. He's a **product designer who applies AI when the product needs it**. He treats AI as specific mechanisms (retrieval, extraction, classification, summarisation, agents, guardrails) and designs each deliberately, rather than treating AI as a feature in itself.")

I("ai-patterns", "ai",
  ["ai patterns", "patterns", "rag", "retrieval", "document processing", "idp", "ocr", "extraction", "summarization", "summarisation", "anomaly detection", "sentiment analysis", "recommendations", "computer vision", "face verification", "identity verification", "nlp", "natural language processing", "predictive analytics", "forecasting", "ai technologies", "which ai techniques"],
  ["what ai patterns does he use", "has he worked with rag", "has he designed document extraction"],
  "Patterns he uses repeatedly:\n\n- **Retrieval with citations (RAG):** Search, Stowers, Lowe's, Docebo\n- **Document extraction + human confirmation:** Digital Dubai, Mashreq Credit, Jubilant, Tekion\n- **Confidence scores + evidence panels:** Greif, Mashreq, Digital Dubai\n- **Briefings before raw content:** ADEO\n- **Copilots with downloadable outputs:** Cash AI, Supplier GPT\n- **Multi-agent orchestration with traces:** Agent Workforce, Mashreq Incidents\n- **Anomaly, spike and risk detection:** Sony Social, CGB, Mashreq\n- **Computer vision for identity verification:** Jubilant\n- **Predictive analytics and forecasting:** Jubilant (demand), CGB")

# ───────────── LEADERSHIP & COLLABORATION ─────────────
I("leadership", "leadership",
  ["leadership", "leader", "lead", "led", "leading", "manage team", "management", "manager", "people management", "manage people", "people manager", "managed designers", "team lead", "design lead", "led a team"],
  ["does he have leadership experience", "has he led teams", "is he a good leader"],
  "Yes:\n\n- **Leads design end to end** on enterprise products\n- **Mentors junior designers** (6, per his resume) through critiques and growth planning\n- Runs **several enterprise initiatives in parallel**\n- Set up ICD's **design-to-engineering handoff and review** workflows\n- Works directly with **client executives**\n- Co-delivered ADEO alongside **Frog Design and Nagarro Design**",
  ["How does he mentor?", "How does he work with engineers?"])

I("mentoring", "leadership",
  ["mentor", "mentoring", "mentorship", "coach", "coaching", "junior designers", "teach", "critique", "critiques", "grow designers"],
  ["does he mentor designers", "how does he mentor"],
  "He mentors **junior designers (6, per his resume)** through regular **critiques and growth planning**. He helps them move from screen-level thinking to **systems-level thinking**, and holds quality standards, including WCAG 2.1 accessibility, across their work.")

I("engineers", "leadership",
  ["engineers", "developers", "engineering", "dev", "devs", "handoff", "hand off", "development team", "tech team", "implementation", "dev handoff", "collaborate with developers", "work with developers", "work with engineers", "work with devs"],
  ["how does he work with engineers", "how is his developer handoff", "does he work well with developers"],
  "- He set up ICD's **design-to-engineering handoff and review** workflows, which **reduced rework** and implementation inconsistencies\n- Hands off **documented components and patterns** (Final-for-Dev)\n- Takes engineering constraints seriously and designs decisions that can be built\n- In the Agent Workforce Platform he designed **for engineers as users**: a focused workspace with precise control over models, retrieval and testing")

I("design-system", "leadership",
  ["design system", "design systems", "component library", "components", "tokens", "design tokens", "ui kit", "consistency", "scalable design", "pattern library"],
  ["does he have design system experience", "has he built a design system"],
  "Yes. He **owns and scales the UnifyApps design system** across AI, Data Quality, Governance and Workflow Automation.\n\n- **Reused across 60+ enterprise deployments**\n- **Shortens delivery time** and keeps products consistent\n- The Agent Workforce Platform runs **three agent modes on one design system**\n- Shared patterns (search, copilots, approvals, audit trails) let him run several initiatives in parallel")

I("accessibility", "leadership",
  ["accessibility", "a11y", "wcag", "inclusive", "inclusive design", "screen reader", "contrast", "accessible", "work accessible", "is it accessible"],
  ["does he care about accessibility", "does he know wcag"],
  "Yes. He **enforces WCAG 2.1** across products and has run **WCAG 2.1 AA accessibility audits** on client dashboards, including CGB's government service dashboard for Qatar, with scored findings and a remediation roadmap.")

I("multitasking", "leadership",
  ["multiple projects", "parallel", "multitask", "multitasking", "prioritize", "prioritise", "deadlines", "pressure", "workload", "time management", "manage projects"],
  ["how does he manage multiple projects", "how does he handle deadlines"],
  "By **reusing structure**. A strong design system plus shared patterns for search, copilots, approvals and audit trails, together with clear review cycles, let him run **several enterprise initiatives in parallel** without losing quality. At HDFC he delivered against an immovable **regulatory deadline** (DPDP Act).")

I("agencies", "leadership",
  ["frog", "frog design", "nagarro", "agency", "agencies", "partner agency", "collaborated with agencies"],
  ["has he worked with other agencies", "did he work with frog design"],
  "Yes. On the **ADEO Committee Board platform** for Abu Dhabi he worked alongside **Frog Design** and **Nagarro Design**, with ICD as design partner to UnifyApps.")

# ───────────── PORTFOLIO-WIDE ─────────────
I("projects-list", "work",
  ["projects", "work", "portfolio", "case studies", "case study", "what has he worked on", "show me his work", "clients", "client list", "list projects", "all projects", "his work", "worked on", "examples", "what he has built", "what has he built", "built", "what he made", "what has he made"],
  ["what has vishnu worked on", "show me his portfolio", "show me his projects", "which clients has he worked with", "list his case studies"],
  "**Featured case studies**\n- **Intelligent Enterprise Search** (UnifyApps)\n- **Committee Board Agentic App** (DGE / ADEO, Abu Dhabi)\n- **Agent Workforce Platform** (UnifyApps)\n- **Consent & Preference Management** (HDFC Bank)\n- **Four platforms for Sony Pictures Networks India**\n\n**Other client work**\n- **Banking & insurance:** Mashreq (×3), Niva Bupa\n- **Government:** Digital Dubai (×3), Digital Ajman, CGB Qatar\n- **Enterprise AI & knowledge:** Lowe's, Stowers, Docebo, Shaw Industries\n- **Operations & finance:** Greif, Tekion, Wasl, Jubilant\n- **HR, workplace & aviation:** Virtusa, Mphasis, Air Arabia\n\nAsk me about any of them.",
  ["Tell me about Enterprise Search", "Tell me about ADEO", "Tell me about HDFC"])

I("industries", "work",
  ["industries", "industry", "domains", "domain", "sectors", "what sectors", "which sectors", "designed for which", "sector", "verticals", "domain expertise", "which industries"],
  ["which industries has he worked in", "what domains does he know"],
  "- **Banking & finance:** HDFC Bank, Mashreq\n- **Insurance:** Niva Bupa\n- **Government:** DGE / ADEO, Digital Dubai, Digital Ajman, CGB Qatar\n- **Media:** Sony Pictures Networks India\n- **Retail:** Lowe's\n- **Food & consumer:** Jubilant\n- **Manufacturing:** Greif, Shaw Industries, Jubilant Ingrevia\n- **Aviation:** Air Arabia\n- **Automotive retail:** Tekion\n- **Real estate & hospitality:** Wasl\n- **IT services & HR:** Virtusa, Mphasis\n- **Research & learning:** Stowers Institute, Docebo\n- **Earlier:** healthcare, Web3, hospitality")

I("best-problems", "work",
  ["what problems", "kind of problems", "type of problems", "best at solving", "problems he solves", "sweet spot", "speciality", "ideal project", "what kind of work"],
  ["what kinds of problems does he solve best", "what is his sweet spot"],
  "Problems where **information, people and decisions are scattered**:\n\n- **Fragmented knowledge → one trusted source:** Search, Lowe's, Stowers, Docebo, Sharek\n- **Document-heavy processes → AI extraction + human confirmation:** Digital Dubai, Mashreq, Jubilant, Tekion\n- **Slow, high-stakes decisions → AI briefings and structured deliberation:** ADEO, Sony governance, Wasl\n- **Compliance pressure → audit trails built into the workflow:** HDFC, Virtusa, Greif\n- **Answers → actions:** copilots for Digital Dubai, Mashreq, Ajman")

I("proudest", "work",
  ["proudest", "favourite project", "favorite project", "best project", "best work", "most proud", "flagship", "signature project", "top project"],
  ["which project is he proudest of", "what is his best work"],
  "I can't speak for him on that, so it's worth asking him directly. Two projects best show his thinking:\n\n- **ADEO:** deliberate, human-centred AI for government decisions\n- **Enterprise Search:** the idea that, in enterprise AI, **trust is the product**",
  ["Tell me about ADEO", "Tell me about Enterprise Search"])

I("most-complex", "work",
  ["most complex", "hardest project", "most challenging", "biggest project", "largest project", "toughest", "most difficult", "scale"],
  ["what is the most complex project he worked on", "what was his hardest project"],
  "- **By scope:** **Sony**, four interconnected platforms (contracts, governance, broadcast scheduling, social intelligence) across legal, compliance, operations and content teams\n- **By stakes:** **HDFC**, an immovable regulatory deadline and 30M+ customers, and **ADEO**, government decisions on 1,000+ proposals a month")

I("common-thread", "work",
  ["common", "common thread", "pattern across", "consistent", "across projects", "similar", "connects", "theme", "recurring"],
  ["what is common across his work", "what connects all his projects"],
  "Across all his AI work:\n\n- **Sources and evidence** behind every AI output\n- **Confidence shown**, not hidden\n- **Humans approve** consequential actions\n- **Role-specific views** on one shared source of truth\n- **Governance designed in** from the start")

I("adapt-domains", "work",
  ["adapt", "new domain", "learn domain", "different domains", "unfamiliar", "domain knowledge", "ramp up", "onboard to new"],
  ["how does he adapt to different domains", "how does he learn a new domain"],
  "The domains change, but the **structure of the problems repeats**: scattered information, many roles, approvals, compliance and the need for trust. He learns each domain's constraints (regulation, workflows, vocabulary), then applies the same systems approach and a consistent set of patterns.")


I("other-projects", "work",
  ["other projects", "more projects", "other work", "other clients", "more clients", "anything else", "what else", "beyond case studies", "besides these", "apart from these", "other than these", "more work", "additional projects", "other companies", "all clients", "full client list", "client work", "other case studies"],
  ["what other projects has he done", "show me more projects", "what else has he worked on", "any other clients"],
  "")

I("other-banking", "work",
  ["other banking projects", "other banking", "more banking", "other bank projects", "other financial projects", "other fintech"],
  ["other banking projects", "any other bank work"],
  "Beyond HDFC, Vishnu designed **three AI products for Mashreq**:\n\n1. **Cash AI:** conversational cross-border payment operations for treasury teams\n2. **Agentic Credit Initiation:** from documents to corporate credit decisions\n3. **AI Incident Investigation:** root-cause analysis for banking service failures\n\nHe also designed **Niva Bupa's** insurance sales platform.",
  ["Tell me about Mashreq credit", "Tell me about Cash AI", "Tell me about Niva Bupa"])

I("other-government", "work",
  ["other government projects", "other government", "more government", "other public sector", "other govt projects"],
  ["other government projects", "any other government work"],
  "Beyond ADEO, his government client work includes:\n\n- **Digital Dubai:** supplier onboarding, the Supplier GPT procurement copilot, and a Smart Employee Copilot\n- **Digital Ajman (Ajman One):** an AI gateway for government services and business licence renewals\n- **CGB Qatar (Sharek):** a performance intelligence platform for government services",
  ["Tell me about Digital Dubai", "Tell me about Ajman One", "Tell me about Sharek"])

I("other-agentic", "work",
  ["other agentic projects", "other agentic", "more agent projects", "other ai agents", "other agents work", "other ai projects", "more ai projects"],
  ["other agentic projects", "what other ai projects"],
  "Beyond the case studies, his client work includes several agentic products:\n\n- **Mashreq Credit Initiation:** an agent that classifies documents, spreads financials and stress-tests repayment\n- **Mashreq Incident Investigation:** agents that correlate alerts and propose root causes\n- **Supplier GPT (Digital Dubai):** AI-assisted tender submission and invoicing\n- **Ajman One:** guided government journeys, where the user confirms every step\n- **Greif:** agentic review of missed service charges",
  ["Tell me about Mashreq credit", "Tell me about Supplier GPT", "Tell me about Greif"])

# ───────────── DOMAIN OVERVIEWS ─────────────
I("domain-banking", "domain",
  ["banking", "bank", "banks", "fintech", "finance", "financial services", "bfsi", "payments domain", "financial", "treasury domain"],
  ["what banking experience does he have", "has he worked in fintech", "has he designed for banks"],
  "Significant, across retail and corporate banking:\n\n- **HDFC Bank:** consent management for 30M+ customers (DPDP Act)\n- **Mashreq Cash AI:** cross-border payment operations\n- **Mashreq Credit Initiation:** documents to corporate credit decisions\n- **Mashreq Incident Investigation:** root-cause analysis for banking services\n- **Brane Banking** (earlier career)\n\n**What he's learned about banking design:**\n- Regulation is a hard constraint, so make compliance natural\n- Every number must be traceable\n- Risk should surface **before** the decision",
  ["Tell me about HDFC", "Tell me about Mashreq credit"])

I("domain-insurance", "domain",
  ["insurance", "insurance domain", "insurtech", "insurance experience", "insurance industry", "insurance project", "insurance app"],
  ["has he worked in insurance"],
  "None of his case studies is in insurance, but his client work includes **Niva Bupa**: an AI-assisted sales platform for health insurance agents, covering premiums, plan comparison, riders, quotes over WhatsApp and AI-written messages.\n\nEarlier in his career he also designed **QuoteBot**, an insurance quote generator.",
  ["Tell me about Niva Bupa"])

I("domain-government", "domain",
  ["government", "public sector", "govtech", "gov tech", "e-government", "citizen", "citizens", "ministry", "public services", "smart government", "government projects"],
  ["what government projects has he done", "has he worked in the public sector", "has he designed for government"],
  "Extensive, across the UAE and Qatar:\n\n- **DGE / ADEO, Abu Dhabi:** AI committee board platform for 1,000+ proposals a month\n- **Digital Dubai:** supplier onboarding, Supplier GPT, Smart Employee Copilot\n- **Digital Ajman (Ajman One):** AI gateway for services and business renewals\n- **CGB Qatar (Sharek):** government service performance intelligence\n\n**What's different about government:**\n- Accountability matters more than speed\n- Citizens confirm every consequential action\n- AI must be clearly labelled\n- Data spans many entities and channels",
  ["Tell me about ADEO", "Tell me about Ajman One", "Tell me about Sharek"])

I("domain-media", "domain",
  ["media", "entertainment", "broadcasting", "ott", "television", "tv", "streaming", "media domain"],
  ["has he worked in media"],
  "Yes, with **Sony Pictures Networks India**, one of Asia's largest media groups: four platforms covering **contracts, board governance, sports broadcast scheduling and social intelligence**.",
  ["Tell me about the Sony platforms"])

I("domain-manufacturing", "domain",
  ["manufacturing", "industrial", "factory", "plants", "supply chain", "operations domain", "industry 4.0"],
  ["has he worked in manufacturing"],
  "Yes:\n\n- **Greif:** AI revenue recovery and BOM validation across plants\n- **Shaw Industries:** sales intelligence for a flooring manufacturer\n- **Jubilant Ingrevia:** operations, quality control, inventory and procurement workflows",
  ["Tell me about Greif"])

I("domain-retail", "domain",
  ["retail", "ecommerce", "e-commerce", "consumer", "qsr", "food", "restaurants", "stores"],
  ["has he worked in retail"],
  "Yes:\n\n- **Lowe's:** an enterprise AI workspace for employees\n- **Jubilant FoodWorks:** store expansion, workforce, inventory and operations workflows\n- **E-commerce projects** at Brane Enterprises (earlier career)")

I("domain-hr", "domain",
  ["hr", "human resources", "hr tech", "hrtech", "workforce", "people ops", "employee experience", "talent"],
  ["has he designed hr products"],
  "Yes:\n\n- **Virtusa:** promotions, HR partner assignment and buddy allocation\n- **Jubilant:** workforce management and employee services\n- **Digital Dubai Smart Employee Copilot:** HR requests via conversation",
  ["Tell me about Virtusa"])

I("domain-sales", "domain",
  ["sales", "crm", "crm tools", "revenue", "go to market", "gtm", "sales enablement", "sales tools", "b2b sales"],
  ["has he designed sales tools"],
  "Yes:\n\n- **Shaw Industries:** account intelligence, call analysis, RFP automation\n- **Docebo:** deal-loss analysis, Voice of Customer, sales handoff (Salesforce, Outreach, Gong)\n- **Niva Bupa:** insurance sales enablement\n- **Greif:** revenue recovery")

I("domain-knowledge", "domain",
  ["knowledge management", "enterprise knowledge", "intranet", "knowledge base", "search experience", "information retrieval"],
  ["has he designed knowledge management tools"],
  "Yes, it's one of his core areas:\n\n- **UnifyApps Enterprise Search:** the core product\n- **Lowe's:** an AI workspace with project spaces\n- **Stowers Institute:** citation-backed research assistants in Outlook\n- **Docebo:** cited search and people discovery\n- **Digital Dubai:** Smart Employee Copilot",
  ["Tell me about Enterprise Search"])

I("domain-finance-ops", "domain",
  ["finance operations", "accounting", "reconciliation domain", "fp&a", "budgeting domain", "procurement domain", "erp", "sap"],
  ["has he designed finance operations tools"],
  "Yes:\n\n- **Tekion:** reconciliation across bank records, invoices and lockbox files\n- **Wasl:** hospitality budgeting with staged Board approvals and SAP integration\n- **Digital Dubai Supplier GPT:** invoices and payments\n- **Mashreq Cash AI:** treasury and payments\n- **Sony CLM:** contracts integrated with SAP S/4")

I("domain-healthcare", "domain",
  ["healthcare", "health", "medical", "hospital", "hospitals", "patients", "patient", "healthtech"],
  ["has he worked in healthcare"],
  "Yes, mostly earlier in his career:\n\n- **Mycarely.in:** a healthcare platform for senior citizens\n- **Salud Interactiva:** an internal portal for a healthcare services provider\n- Healthcare client projects at **Brane Enterprises**\n- **Niva Bupa** health insurance sales (recent)\n- **Air Arabia** onboard medical incident reporting")


I("domain-aviation", "domain",
  ["aviation", "airline", "airlines", "aviation domain", "flights", "cabin crew", "airport"],
  ["has he worked in aviation", "has he designed for airlines"],
  "None of his case studies is in aviation, but his client work includes **Air Arabia**: digital cabin crew assessments, flight checks and onboard incident reports, designed to work **offline** in flight.",
  ["Tell me about Air Arabia"])

I("domain-hospitality", "domain",
  ["hospitality", "hotel", "hotels", "real estate", "property", "travel industry"],
  ["has he worked in hospitality", "any hotel projects"],
  "None of his case studies is in hospitality, but his client work includes **Wasl**: a budgeting platform for a hotel portfolio that connects hotel operators, asset managers and the Board, with AI revision summaries.",
  ["Tell me about Wasl"])

I("domain-automotive", "domain",
  ["automotive", "cars", "dealership", "dealer", "auto industry"],
  ["has he worked in automotive"],
  "None of his case studies is in automotive, but his client work includes **Tekion**: a workflow platform for dealership operations and financial reconciliation, with a conversational copilot.",
  ["Tell me about Tekion"])

# ───────────── EARLY CAREER ─────────────
I("early-career", "career",
  ["early career", "early work", "old work", "old portfolio", "previous portfolio", "2023 portfolio", "before enterprise", "first projects", "older projects", "behance", "past work", "freelance work"],
  ["what did he work on before enterprise ai", "show me his old portfolio", "what was his early work"],
  "- **Momentable / Nextdecentrum:** NFT marketplace, end to end, plus brand identity\n- **Mycarely.in:** healthcare for senior citizens\n- **Brane Banking & Seamless Loans**\n- **Chicago Park District:** park events and activities\n- **Salud Interactiva:** healthcare services portal\n- **Mobionix & LEAPQUE:** voice AI concepts for hotels and restaurants\n- **QuoteBot:** insurance quote generator\n- **App case studies:** Nest hotel booking, Minder alarm, D.Note driver habits\n\n[See the 2023 portfolio →](https://byvishnudesign.framer.website/)")

I("evolution", "career",
  ["evolve", "evolved", "evolution", "growth", "grown", "progression", "always enterprise", "always ai", "transition", "switch to enterprise"],
  ["how has his work evolved", "did he always work on enterprise ai"],
  "No, his path was varied:\n\n1. **Consumer, Web3 and brand work** at Kocha (NFT marketplace, apps, branding)\n2. **20+ low-code client projects** at Brane across e-commerce, finance, healthcare and education\n3. **Large-scale enterprise and AI systems** at ICD / UnifyApps\n\nThe constant: turning complex problems into clear, usable products. That variety gave him range in consumer UX, branding and fast delivery.")

I("branding", "career",
  ["branding", "brand identity", "logo", "visual design", "graphic design", "illustration"],
  ["does he do branding", "can he do visual design"],
  "Yes. Earlier in his career he did **brand identity** for Momentable, Salud Interactiva, Mobionix, LEAPQUE and QuoteBot, plus illustration (user persona templates, character design). Today his focus is product design, with a strong visual craft underneath.")

# ───────────── PERSONAL ─────────────
I("hobbies", "personal",
  ["hobbies", "hobby", "outside work", "free time", "interests", "personal life", "fun", "weekend", "passion", "apart from design", "fun fact"],
  ["what does he do outside work", "what are his hobbies", "tell me something fun about him"],
  "- 🎨 **Live sketching and watercolour** (also oil painting)\n- ⚽ **Football**\n- ✈️ **Travel**\n- 🚴 **Long bike rides**\n\nHis sketches are on Instagram (**@sketch_b.o.o.k**) and his paintings are on Behance and the About page.",
  ["Does art influence his design?"])

I("art", "personal",
  ["art", "painting", "paint", "sketch", "sketching", "watercolor", "watercolour", "artist", "drawing", "instagram", "sketchbook"],
  ["does he paint", "does art influence his design", "where can i see his art"],
  "He sketches and paints, mostly **live sketching and watercolour**. His About page describes him as *a product designer, a planner and a painter, finding structure in everything*.\n\nObservation is central to all three: noticing how people move through a space, a system or a scene.\n\n- **Sketchbook:** instagram.com/sketch_b.o.o.k\n- **Paintings:** behance.net/vishnuprasadkp")

I("nyrro", "personal",
  ["who are you", "what are you", "nyrro", "your name", "beetle", "why beetle", "what is nyrro", "about you", "mascot"],
  ["who are you", "what is nyrro", "why are you a beetle"],
  "I'm **Nyrro**, Vishnu's guide on this site.\n\nI'm one of his creative side projects, a little beetle inspired by how beetles **defend themselves in nature**, and by the idea of a tiny creature leaving a **paint-like trail** as it moves. Part observation, part imagination, much like his watercolours.")

I("are-you-ai", "personal",
  ["are you ai", "are you a bot", "are you real", "are you human", "are you chatgpt", "chatgpt", "are you claude", "which model are you", "how do you work", "are you a robot"],
  ["are you an ai", "are you a real person"],
  f"I'm a small assistant built on Vishnu's portfolio, case studies and project work. For anything I can't answer, Vishnu is one email away: **{EMAIL}**.")

# ───────────── HIRING & CONTACT ─────────────
I("contact", "hiring",
  ["contact", "email", "email address", "email id", "reach", "get in touch", "talk to him", "connect", "message him", "mail", "how to reach", "contact details", "socials", "linkedin"],
  ["how can i contact vishnu", "what is his email", "how do i reach him", "is he on linkedin"],
  f"- **Email:** {EMAIL}\n- **LinkedIn:** [linkedin.com/in/vishnu-prasad-k-p-225949134](https://www.linkedin.com/in/vishnu-prasad-k-p-225949134/)\n- **Resume:** [vishnuprasad.space/resume](https://vishnuprasad.space/resume)")

I("resume", "hiring",
  ["resume", "cv", "download resume", "resume pdf", "curriculum vitae"],
  ["can i see his resume", "download cv"],
  "You can view or download his resume here: [vishnuprasad.space/resume](https://vishnuprasad.space/resume)")

I("open-to-work", "hiring",
  ["open to work", "available", "availability", "looking for job", "hiring", "hire", "job", "opportunity", "opportunities", "looking for a job", "job hunting", "freelance", "contract work", "consulting", "collaborate", "work with him", "open to opportunities", "can we hire", "how can i hire", "how to hire", "hire vishnu", "hire him", "recruit", "interview him", "schedule a call", "book a call"],
  ["is he open to opportunities", "is vishnu available for hire", "can we work with him", "does he do freelance"],
  f"Vishnu is always open to conversations and ideas. The best way to reach him is **{EMAIL}** or LinkedIn.",
  ["Why should we hire him?"])

I("why-hire", "hiring",
  ["why hire", "why should we hire", "why vishnu", "value", "what can he bring", "fit", "good fit", "right fit", "recommend him", "convince me", "strengths for role"],
  ["why should we hire vishnu", "what value would he bring", "is he a good fit for our team"],
  f"- Leads design on **complex, high-stakes enterprise and AI products** for clients like HDFC Bank, DGE Abu Dhabi and Sony\n- **Thinks in systems:** roles, dependencies and failure points before screens\n- Designs **AI people trust:** sources, confidence, clear labels, human control\n- Works directly with **executives and engineering**; set up handoff that reduced rework\n- Builds **design systems that scale** (reused across 60+ deployments)\n- **Mentors** designers and runs several initiatives in parallel\n\nHe'd be glad to talk about how this fits your team: **{EMAIL}**.")

I("lead-fit", "hiring",
  ["lead role", "lead position", "principal role", "manager role", "head of design", "design manager", "ready for lead", "fit for lead", "lead designer role", "staff designer"],
  ["is he a fit for a lead designer role", "is he ready for a lead position"],
  f"His work already happens at **lead scope**:\n\n- End-to-end ownership of enterprise and AI products\n- Executive and senior stakeholder management\n- Several initiatives in parallel\n- Design system ownership across 60+ deployments\n- Mentoring designers and setting up team processes\n\nThe fit for a specific role is best discussed with him directly: **{EMAIL}**.")

I("remote", "hiring",
  ["remote", "relocate", "relocation", "onsite", "hybrid", "work from home", "timezone", "time zone", "travel for work", "international team"],
  ["can he work remotely", "is he open to relocation"],
  f"He already works with **international teams**: clients across India, the UAE, Qatar and the US, and co-delivery with Frog Design and Nagarro Design. For specifics on location or working arrangements, please ask him directly at **{EMAIL}**.")

I("sensitive", "hiring",
  ["salary", "ctc", "compensation", "pay", "package", "expected salary", "current salary", "notice period", "notice", "phone number", "mobile number", "contact number", "whatsapp number", "home address", "where does he live", "why leaving", "charge", "charges", "rates", "rate card", "hourly rate", "fees", "pricing", "how much", "cost to hire", "budget for hiring", "why is he leaving", "age", "married", "lpa", "salary expectation"],
  ["what is his salary expectation", "what is his notice period", "what is his phone number", "why is he leaving his job"],
  f"That's best discussed with Vishnu directly. You can reach him at **{EMAIL}**.")

I("figma-files", "hiring",
  ["figma file", "figma files", "more screens", "screens", "see designs", "prototype", "nda", "confidential", "full case study", "more details", "deck"],
  ["can i see the figma files", "can i see more screens", "why are details hidden"],
  "Many of his projects are under **NDA**, so detailed files aren't public. The case studies show what can be shared, and Vishnu is happy to walk through more in a conversation.")

I("competitors", "boundaries",
  ["competitor", "competitors", "compare", "compare to", "compare with", "compared to", "comparison with", "better than", "worse than", "alternative", "microsoft copilot", "glean", "salesforce einstein", "servicenow", "onetrust"],
  ["how does this compare to competitors", "is this better than microsoft copilot", "what are the alternatives"],
  "I'd rather not compare his work with other products. What I can tell you is what Vishnu designed and why it works the way it does. Which project would you like to hear about?")


I("working-style", "process",
  ["working style", "work style", "style of working", "detail oriented", "detail-oriented", "attention to detail", "how fast", "speed", "pace", "work ethic", "what is he like to work with", "easy to work with", "personality", "culture fit", "team player"],
  ["what is his working style", "is he detail oriented", "what is he like to work with"],
  "**Structured and collaborative.**\n\n- Works in **iterative review cycles** with PMs, clients and engineers\n- **Writes decisions down**, including the cost of each one\n- **Holds the details:** WCAG 2.1 accessibility and documented developer handoff\n- Builds **reusable patterns**, so speed comes from the system, not from shortcuts\n\nFor a real sense of him as a colleague, the best thing is a conversation with him.",
  ["How does he work with engineers?", "How can I contact him?"])

I("future-goals", "interview",
  ["5 years", "five years", "future plans", "career goals", "career goal", "see himself", "aspirations", "aspiration", "long term goal", "next step in career", "ambition", "ambitions", "dream job", "what next"],
  ["where does he see himself in 5 years", "what are his career goals"],
  "I don't know that, sorry. That's a great question to ask Vishnu himself: **vishnuprasadkp98@gmail.com**.",
  ["How can I contact him?"])

# ───────────── INTERVIEW-STYLE ─────────────
I("weakness", "interview",
  ["weakness", "weaknesses", "improve", "areas of improvement", "flaws", "shortcomings", "what is he bad at", "not good at"],
  ["what is his biggest weakness", "what does he need to improve"],
  "That's a question for Vishnu himself. What his case studies do show is that he's **open about trade-offs**. He names the cost of each decision, like Simple mode feeling limiting to engineers, or ADEO's multi-committee members needing a separate view.")

I("failure", "interview",
  ["failure", "failed", "mistake", "mistakes", "went wrong", "learned the hard way", "regret", "do differently", "what would he change"],
  ["tell me about a failure", "what would he do differently", "what mistakes has he made"],
  "That's best asked to him directly. His reflections are public, though. Each case study ends with what it taught him, for example:\n\n- *Trust drives adoption more than AI performance* (Enterprise Search)\n- *Important decisions benefit from deliberate interactions, not speed* (ADEO)\n- *Governance works best when built in from the start* (Agent Workforce)")

I("conflict", "interview",
  ["conflict", "disagreement", "disagree", "pushback", "push back", "difficult stakeholder", "difficult client", "argument", "convince stakeholders"],
  ["how does he handle disagreement with stakeholders", "how does he deal with difficult clients"],
  "I don't have specific stories about disagreements; that's best asked to him directly. His approach to **alignment** is visible in his work:\n\n- Frame a **small set of clear problems**\n- Make decisions **explicit, with their costs**\n- Give every stakeholder group a **role-specific view on one shared source of truth**")

I("solo-or-team", "interview",
  ["alone", "solo", "by himself", "team size", "who else", "credit", "did he design it alone", "individual contribution", "his contribution", "only designer", "other designers", "only one", "whole team", "team members"],
  ["did he design these projects alone", "what was his individual contribution"],
  "He **leads design** on them, and is careful about credit:\n\n- **UnifyApps projects:** ICD is the design partner; the product team defined roles and led research\n- **ADEO:** ICD worked alongside **Frog Design** and **Nagarro Design**\n- **His part:** end-to-end design ownership, from client brief to developer handoff")

I("outcomes-real", "interview",
  ["are the numbers real", "real results", "verified", "fake", "made up", "credible", "trust the numbers", "where do numbers come from", "attribution", "metrics verified", "numbers verified", "results verified", "these metrics", "these numbers", "genuine"],
  ["are the outcomes real", "where do these numbers come from"],
  "Yes, and they're labelled honestly:\n\n- **Enterprise Search & Agent Workforce:** UnifyApps' published figures from a financial institution's deployment\n- **HDFC:** reported by UnifyApps\n- **Sony:** from project documentation\n- **ADEO:** as reported in the case study\n- **Other client projects:** expected or target outcomes, always presented as such")

# ───────────── FALLBACK / OFF-TOPIC ─────────────
I("off-topic", "boundaries",
  ["write code", "python", "javascript code", "homework", "essay", "weather", "news", "joke", "recipe", "movie", "cricket score", "stock price", "translate"],
  ["can you write me a python script", "what's the weather today", "tell me a joke"],
  "I'm Nyrro, and I only know about Vishnu and his work. Want to see one of his case studies instead?",
  ["Show me his case studies", "Who is Vishnu?"])

# ───────────── v2.2: career highlights (from the resume) ─────────────
I("achievements", "career",
  ["achievements", "achievement", "biggest achievement", "accomplishments", "accomplishment", "career highlights", "highlights", "what has he achieved", "what did he achieve", "wins", "notable work", "impact", "what is he known for"],
  ["what are his achievements", "what is his biggest achievement", "what has he accomplished"],
  "From his resume:\n\n- Drove design across **60+ enterprise deployments** for clients including HDFC Bank, Sony Networks, Jubilant FoodWorks, Dubai Development Authority and DGE Abu Dhabi\n- Designed consent and communication products under India's DPDP Act for HDFC Bank: **30M+ customers, 400M+ consent records, 3M+ daily communications**\n- Owned and scaled the **UnifyApps design system** across AI, Data Quality, Governance and Workflow Automation, reused across 60+ deployments\n- Ran **3 enterprise product initiatives in parallel**\n- **Mentored 6 junior designers**\n- Led UX for **20+ client projects** at Brane Enterprises",
  ["Tell me about HDFC Bank", "What are his case studies?", "How does he lead?"])
