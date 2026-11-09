# v3: the final answer set for every general topic. Applied LAST in build.py and wins over everything.
#
# Writing rules for every answer:
#   1. The first sentence answers the exact question asked, in plain words.
#   2. Then the evidence: short bullets with real, specific facts (mostly from the 5 case studies).
#   3. No corporate filler, no slogans, nothing repeated from another answer unless the question needs it.
#   4. Skills always come word for word from Vishnu's resume. Never trimmed.

EMAIL = "vishnuprasadkp98@gmail.com"

RESUME_SKILLS = (
    "- **Design & Research:** Product Design, UX Design, Interaction Design, Information Architecture, User Flows, "
    "Design Systems, Component Libraries, Usability Testing, Journey Mapping, Accessibility (WCAG), Enterprise SaaS\n"
    "- **Strategy & Systems:** Product Strategy, Product Discovery, Systems Thinking, User Research, Stakeholder Management, "
    "Design Leadership, DesignOps, Data Visualization\n"
    "- **AI & Tools:** Claude, AI Product Design, Prompt Engineering, Agentic UX, Generative Prototyping"
)
RESUME_TOOLS = "Figma, Figma AI, FigJam, Miro, Framer, Google AI Studio, Adobe Creative Suite"

V3 = {}
def V(id, answer, keywords=(), questions=(), followups=None, category=None, new=False):
    V3[id] = dict(answer=answer, keywords=list(keywords), questions=list(questions), followups=followups,
                  category=category, new=new)

# ════════════════════════ SKILLS (straight from the resume) ════════════════════════

V("skills",
  "Here are Vishnu's skills, exactly as listed on his resume:\n\n" + RESUME_SKILLS + f"\n\n**Tools:** {RESUME_TOOLS}",
  keywords=["skills", "skill", "skill set", "skillset", "core skills", "key skills", "main skills", "top skills", "his skills",
            "list of skills", "skills list", "all skills", "what skills", "which skills", "skills does he have", "technical skills",
            "hard skills", "design skills", "professional skills", "capabilities", "competencies", "competency", "expertise",
            "areas of expertise", "what does he know", "what can he do", "abilities", "proficient", "proficiency", "specialization",
            "specialisation", "specialities", "specialties", "skills on resume", "resume skills", "cv skills", "know how"],
  questions=["what are his skills", "what are his core skills", "list his skills", "what skills does vishnu have",
             "what is his expertise", "what can he do", "what does he know"],
  followups=["What are his AI skills?", "What are his strengths?", "How does he design?"])

V("skills-design",
  "His design skills, from his resume:\n\n- Product Design\n- UX Design\n- Interaction Design\n- Information Architecture\n- User Flows\n- Design Systems and Component Libraries\n- Accessibility (WCAG)\n- Enterprise SaaS\n\n**Where you can see them:** the Agent Workforce Platform gives three types of users three different levels of control on one design system, and the UnifyApps design system he owns is reused across 60+ deployments.",
  keywords=["design skills", "ux skills", "ui skills", "ui ux skills", "ux design skills", "interaction design", "information architecture",
            "user flows", "ia", "ui design", "visual design", "is he a ux designer", "ux designer", "ui designer", "ux or ui", "ui or ux",
            "ui as well as ux", "product design skills", "craft"],
  questions=["what are his design skills", "is he a ux designer or ui designer", "does he do ui as well as ux"],
  followups=["What are his research skills?", "Has he built a design system?"], new=True)

V("skills-research",
  "His research and validation skills, from his resume: **User Research, Usability Testing, Journey Mapping and Product Discovery.**\n\nHow it works in practice:\n\n- On UnifyApps projects, the **product team led the research** and Vishnu turned the findings into design decisions\n- On **ADEO**, requirements came straight from the client's departments, and each major decision was validated with them\n- He validates designs in **review cycles** with PMs, clients and engineers before handoff",
  keywords=["research skills", "ux research skills", "usability testing", "usability", "journey mapping", "product discovery",
            "user testing", "research and testing", "testing skills", "test his designs", "test designs", "testing", "how does he test"],
  questions=["what are his research skills", "does he do usability testing"],
  followups=["How does he design?", "Tell me about ADEO"], new=True)

V("skills-strategy",
  "His strategy and systems skills, from his resume: **Product Strategy, Product Discovery, Systems Thinking, User Research, Stakeholder Management, Design Leadership, DesignOps and Data Visualization.**\n\nIn practice that means he works out *what* to build with product and client leaders, not only *how* it looks. On HDFC Bank, for example, he worked with the bank's senior management from the brief through to final handoff.",
  keywords=["strategy skills", "product strategy", "systems thinking", "designops", "design ops", "strategic", "business skills",
            "product thinking", "product sense", "strategy and systems", "data visualization skills"],
  questions=["what are his strategy skills", "does he have product thinking", "is he strategic"],
  followups=["Does he have leadership experience?", "Tell me about HDFC Bank"], new=True)

V("skills-ai",
  "His AI skills, from his resume: **AI Product Design, Agentic UX, Prompt Engineering, Generative Prototyping, and Claude.**\n\nWhere he has used them:\n\n- **Agent Workforce Platform:** designed how teams build, test and govern AI agents\n- **Enterprise Search:** AI answers with sources, plus a marketplace of verified agents\n- **ADEO:** AI briefings and live minutes for government committees\n- **His own workflow:** prototyping ideas quickly with Claude and Google AI Studio",
  keywords=["ai skills", "ai skill", "agentic ux", "prompt engineering", "prompting", "prompts", "generative prototyping",
            "ai product design", "ai design skills", "does he know ai", "ai knowledge", "ai tools skills", "claude skills"],
  questions=["what are his ai skills", "is he familiar with prompt engineering", "does he know agentic ux"],
  followups=["What AI work has he done?", "Tell me about the Agent Workforce Platform"], new=True)

V("skills-soft",
  "His people skills show up most in **stakeholder management, design leadership and mentoring**:\n\n- Works directly with **senior client stakeholders**, e.g. HDFC Bank's senior management\n- **Mentors 6 junior designers** through critiques and growth planning\n- Runs **several projects in parallel** with product, engineering and client teams\n- Co-delivered **ADEO** with two other design agencies (Frog Design and Nagarro Design)",
  keywords=["soft skills", "people skills", "communication skills", "communication", "interpersonal", "presentation skills",
            "present", "presenting", "teamwork", "team player", "collaboration skills", "leadership skills", "non technical skills"],
  questions=["what are his soft skills", "how are his communication skills", "is he a team player"],
  followups=["How does he work with stakeholders?", "Does he mentor designers?"], new=True)

V("strengths",
  "His three biggest strengths:\n\n1. **Making complicated products understandable.** He maps who uses a product and how its parts depend on each other before designing screens. ADEO handles 1,000+ government proposals a month in one clear flow.\n2. **Designing AI people can trust.** Answers show their sources, AI content is labelled, and a person approves anything important.\n3. **Owning the whole journey.** From client brief to developer handoff, including the design system behind it.",
  keywords=["strengths", "strength", "strong points", "strongest skill", "best at", "good at", "what is he good at", "superpower",
            "greatest strength", "biggest strength", "strong at", "excels", "edge", "advantages"],
  questions=["what are his strengths", "what is he good at", "what is his biggest strength"],
  followups=["What are his skills?", "What makes his approach unique?"], new=True)

V("tools",
  f"The tools on his resume: **{RESUME_TOOLS}.**\n\n- **Figma** is his main design tool, with FigJam and Miro for workshops and mapping\n- **Framer** for websites, including his portfolio\n- **Claude, Google AI Studio and Figma AI** for research synthesis and quick AI prototypes\n- **Adobe Creative Suite** for visual and brand work",
  keywords=["tools", "tool", "software", "figma", "framer", "miro", "figjam", "adobe", "photoshop", "illustrator", "after effects",
            "creative suite", "stack", "toolkit", "design tools", "tools he uses", "favourite tool", "favorite tool", "ai tools",
            "google ai studio", "figma ai", "claude", "uses claude", "use claude", "prototyping tool", "which software", "apps he uses"],
  questions=["what tools does he use", "does he use figma", "what software does he know", "how does he use claude"],
  followups=["What are his skills?", "Does he use AI in his workflow?"])

V("coding",
  "He's a designer, not a developer, but he's comfortable with technical work:\n\n- Builds **quick AI prototypes** with Claude and Google AI Studio\n- Designs for **engineers as users**: the Agent Workforce Platform's Advanced mode covers models, retrieval and testing\n- Set up ICD's **design-to-engineering handoff** process\n- Rebuilt his own **portfolio site in code**",
  keywords=["code", "coding", "can he code", "does he code", "html", "css", "javascript", "frontend", "front end", "programming",
            "developer skills", "vibe coding", "is he technical", "technical", "build websites", "write code"],
  questions=["does he know coding", "can he code", "is he technical"],
  followups=["How does he work with engineers?"])

V("languages",
  "He speaks four languages:\n\n- **English:** professional\n- **Malayalam:** native\n- **Hindi:** conversational\n- **Tamil:** conversational")

V("platforms",
  "He designs for **web, tablet and mobile**:\n\n- **Web:** most of his products, like Enterprise Search and the Agent Workforce Platform\n- **Tablet-first:** the ADEO committee app, used in live government sessions\n- **Web + mobile:** Enterprise Search, Agent Workforce and HDFC consent\n- **iOS & Android apps:** earlier in his career (a hotel booking app, an alarm app and a habit tracker)",
  keywords=["mobile app", "mobile apps", "mobile design", "mobile ux", "ios", "android", "tablet", "ipad", "responsive", "web app",
            "web design", "native app", "native apps", "platforms", "devices", "cross platform", "app design"],
  questions=["has he designed mobile apps", "does he do tablet design", "web or mobile"],
  followups=["Tell me about ADEO", "Tell me about his early work"])

# ════════════════════════ ABOUT ════════════════════════

V("greeting",
  "Hi! I'm **Nyrro**, Vishnu's guide on this site. 🪲\n\nAsk me about his projects, his skills, how he designs, or how to reach him.",
  followups=["Who is Vishnu?", "What has he worked on?", "What are his skills?", "How does he design?"])

V("who-is-vishnu",
  "**Vishnu Prasad K P** is a product designer with 5+ years of experience. He's currently a **Senior Product Designer at ICD (Itu Chaudhuri Design)**, leading design for **UnifyApps**, a platform for AI search, AI agents and workflow automation.\n\nHis recent work includes products for **HDFC Bank**, the **Abu Dhabi government (DGE)** and **Sony Pictures Networks India**.",
  followups=["What has he worked on?", "What are his skills?", "How does he design?"])

V("summary-oneline",
  "A product designer who makes complicated work software clear, especially AI products.")

V("experience-years",
  "Vishnu has **5+ years** of product design experience:\n\n- **ICD / UnifyApps:** Oct 2024 – present\n- **Brane Enterprises:** Oct 2023 – Sep 2024\n- **Kocha Technologies:** Nov 2021 – Oct 2023\n\nIn that time he has worked on **100+ use cases**, including **60+ deployments** at UnifyApps.",
  followups=["What did he do at each company?", "What is his title?"])

V("title-seniority",
  "His title is **Senior Product Designer** at ICD.\n\nOn his projects he works as the **design lead**, which is why his case studies say \"Lead Product Designer\". He owns design end to end, works with client executives, runs several projects at once, and mentors 6 junior designers.",
  followups=["Does he have leadership experience?", "Why should we hire him?"])

V("career-history",
  "He has worked at three companies:\n\n1. **Kocha Technologies** (Nov 2021 – Oct 2023), Senior UI/UX Designer: designed an NFT marketplace end to end\n2. **Brane Enterprises** (Oct 2023 – Sep 2024), Senior UI/UX Designer: led UX for 20+ client projects on a low-code platform\n3. **ICD, working with UnifyApps** (Oct 2024 – present), Senior Product Designer: leads design for AI products and client deployments",
  followups=["What is he working on now?", "Tell me about his early work"])

V("education",
  "He has a **Bachelor of Planning & Architecture** from **NIT Bhopal** (2017 – 2021).",
  followups=["How does architecture shape his design?", "Walk me through his career"])

V("architecture-link",
  "Planning and architecture taught him to **understand a whole system before changing any part of it**. He brings that to software.\n\nAn architect studies who moves through a building, how the spaces connect, and what happens in an emergency, before drawing anything. Vishnu does the same with a product: who uses it, how its parts depend on each other, and where it can fail. Only then does he design the screens.",
  followups=["How does he design?"])

V("location-regions",
  "He's based in **India** and works with clients in **India, the UAE, Qatar and the US**. For example, **HDFC Bank** is in India and **DGE / ADEO** is the Abu Dhabi government.",
  followups=["Tell me about ADEO", "Other projects"])

V("current-work",
  "He's currently a Senior Product Designer at **ICD**, leading design for **UnifyApps**:\n\n- UnifyApps' own products: **Enterprise Search, the Agent Workforce Platform and the Low-Code Builder**\n- Products UnifyApps builds for its clients\n- The **UnifyApps design system**\n\nMost current work is under NDA; the case studies show what can be shared.",
  followups=["Tell me about Enterprise Search", "What has he worked on?"])

# ════════════════════════ PROCESS ════════════════════════

V("design-process",
  "His process has **seven steps**:\n\n1. **Map the system:** who uses it, what each person needs, what depends on what, where it breaks\n2. **Define the roles:** e.g. employees, admins and compliance teams each need something different\n3. **Frame the problems:** usually 4–5 clear problems, each with its own solution\n4. **Design one main flow** everyone shares (in ADEO: *Analyse → Deliberate → Decide & Record*)\n5. **Make decisions and write down their cost**\n6. **Review** with PMs, clients and engineers\n7. **Hand off** documented components to developers",
  keywords=["process", "design process", "how does he design", "how does vishnu design", "how he designs", "methodology", "approach",
            "framework", "steps", "design approach", "way of working", "ux process", "design thinking", "double diamond",
            "start a project", "start a new project", "new project", "first step", "kick off"],
  questions=["does he know design thinking", "how does he approach a new project", "how does he solve problems"],
  followups=["Tell me about ADEO", "How does he handle trade-offs?"])

V("unique-approach",
  "What makes him different:\n\n- **He maps the system before designing screens**, so complicated products stay clear as they grow.\n- **He designs AI people can trust:** sources on every answer, clear labels on AI content, and failures shown openly.\n- **He writes down what each decision costs.** In ADEO he deliberately made voting slower by requiring a written reason, because government decisions shouldn't be rushed.",
  followups=["Tell me about ADEO", "What are his design principles?"])

V("principles",
  "The principles he designs by:\n\n- **Trust matters most in AI:** people use AI they can check\n- **People stay in control:** AI drafts, humans approve\n- **Give each person the right amount of detail:** not everyone needs every control\n- **Build in rules and audit trails from the start**, not as an afterthought\n- **Organise complex information; don't delete it**\n- **Warn early:** flag risks before they become problems\n- **Every decision has a cost:** say what it is",
  followups=["How does he design for trust in AI?"])

V("research",
  "User research and usability testing are on his resume, and he validates every major design.\n\n- On UnifyApps projects, the **product team leads the research** and Vishnu turns the findings into design decisions\n- On **ADEO**, he gathered requirements directly from the client's departments and checked each major decision with them\n- Before handoff, designs go through **review cycles** with PMs, clients and engineers",
  keywords=["user research", "does he do research", "research process", "how does he research", "gather requirements", "requirements"],
  followups=["What are his research skills?", "Tell me about ADEO"])

V("tradeoffs",
  "He states his trade-offs openly. From his case studies:\n\n- **ADEO:** each member only sees their own committees, which keeps them focused, but people on several committees need an extra view\n- **ADEO:** every vote needs a written reason, which is slower on purpose\n- **Agent Workforce:** the simple mode hides technical settings, so engineers use the advanced mode instead\n- **Agent Workforce:** the platform shows when an agent's reasoning has gaps, which looks less polished but prevents confidently wrong answers",
  followups=["Tell me about ADEO", "Tell me about the Agent Workforce Platform"])

V("simplicity",
  "He simplifies by giving each person **only the controls they need**, not by removing features.\n\n- **Agent Workforce Platform:** a Simple mode for product managers, a Workflow mode for operations teams, and an Advanced mode for engineers\n- **HDFC Bank:** long legal consent text was reorganised into plain language customers can follow",
  followups=["Tell me about the Agent Workforce Platform"])

V("stakeholders",
  "He works directly with senior stakeholders and keeps them involved through **regular review cycles**:\n\n- **HDFC Bank:** worked with the bank's senior management and product team from brief to handoff\n- **Sony:** worked with legal, compliance, broadcast, content and governance teams\n- **ADEO:** worked alongside two other agencies, Frog Design and Nagarro Design\n\nTo get people aligned, he agrees on a short list of clear problems first and writes down each decision with its trade-off.",
  keywords=["stakeholders", "stakeholder", "stakeholder management", "executives", "clients", "senior management", "leadership team",
            "product managers", "product manager", "pms", "collaborate", "collaboration", "cross functional", "align", "alignment",
            "present to stakeholders", "work with clients", "work with executives"],
  followups=["How does he work with engineers?", "Tell me about HDFC Bank"])

V("success-metrics",
  "Results from his case studies, with their sources:\n\n- **ADEO:** committee preparation went from up to **15 working days to minutes**\n- **Sony:** contract cycle time went from **30–45 days to 18 days** (project documentation)\n- **HDFC Bank:** **400M+ consents** captured and **$4M** saved a year (reported by UnifyApps)\n- **Enterprise Search & Agent Workforce:** **~$5.5M** projected annual savings (UnifyApps' published figures)",
  keywords=["achievements", "achievement", "achieved", "accomplishments", "results", "impact", "what has he achieved", "measure success",
            "success metrics", "metrics", "kpis", "kpi", "business impact", "track record", "numbers"],
  questions=["what has he achieved", "what are his achievements", "what impact has his work had"],
  followups=["Are these numbers real?", "Tell me about Sony"])

V("working-style",
  "**Organised and collaborative.**\n\n- Works in **regular review cycles** with PMs, clients and engineers\n- **Writes down** each decision and its trade-off\n- **Cares about the details:** accessibility (WCAG 2.1) and clear developer handoff\n- **Reuses proven patterns**, which lets him move fast without cutting corners",
  followups=["How does he work with engineers?", "How can I contact him?"])

# ════════════════════════ AI ════════════════════════

V("ai-experience",
  "Most of his recent work is AI products. He describes himself as a **product designer who uses AI where a product needs it**.\n\nFrom his case studies:\n\n- **Enterprise Search:** AI answers with sources across a company's tools\n- **Agent Workforce Platform:** building, testing and governing AI agents\n- **ADEO:** AI briefings and live meeting minutes for government committees\n- **HDFC Bank:** AI that rewrites legal consent text in plain language\n- **Sony:** AI contract checks, scheduling conflict detection and social media analysis",
  keywords=["ai experience", "ai work", "ai products", "ai projects", "worked on ai", "ai powered", "llm", "llms", "genai", "gen ai",
            "generative ai", "machine learning", "ml", "artificial intelligence", "ai design", "which projects use ai", "projects with ai"],
  followups=["How does he design for trust in AI?", "What are his AI skills?"])

V("ai-trust",
  "He makes AI trustworthy by **letting people check it and keeping them in control**:\n\n- **Sources on every answer** (Enterprise Search)\n- **Clear labels** on anything AI-generated (ADEO)\n- **Problems shown openly:** failed data syncs, unverified agents, gaps in an agent's reasoning\n- **People approve:** AI drafts minutes and summaries; a person signs off\n\nHis view: when a company adopts AI, trust matters more than how clever it is.",
  followups=["Tell me about Enterprise Search"])

V("human-in-loop",
  "In his designs **AI does the groundwork and people make the decisions**:\n\n- **ADEO:** AI drafts minutes and resolutions; the committee approves them before they're official\n- **ADEO:** every vote needs a reason written by a person\n- **Agent Workforce:** compliance teams approve an agent only after seeing its rules and history",
  followups=["Tell me about ADEO"])

V("agentic",
  "His main agent work is the **Agent Workforce Platform**, where teams build, test and run AI agents in three modes:\n\n- **Simple:** describe the agent in plain language\n- **Workflow:** connect steps on a visual canvas\n- **Advanced:** full control over models, data and testing\n\nIt also includes **guardrails** (rules the agent must follow), a **full record of each agent's actions**, and **shared skills** any agent can use. His Enterprise Search platform adds a **marketplace of verified agents**.",
  followups=["Tell me about the Agent Workforce Platform", "Other agentic projects"])

V("ai-governance",
  "He builds AI rules and oversight in **from the start**:\n\n- **Agent Workforce:** guardrails and privacy rules are set when an agent is created, and every action is recorded\n- **HDFC Bank:** every consent action is logged automatically, so the audit trail builds itself\n- **Enterprise Search:** compliance teams can see exactly what data the AI can access",
  followups=["Tell me about HDFC Bank"])

V("copilots",
  "In his view, a good AI assistant **helps you finish the task**, not just answer:\n\n- **Enterprise Search:** one assistant across search, chat, agents and apps\n- **ADEO:** an assistant that searches five years of past decisions during a meeting\n- **Sony:** an assistant that checks each scheduled broadcast against its rights contract",
  followups=["Tell me about Enterprise Search", "Other projects"])

V("ai-patterns",
  "AI design patterns he uses often:\n\n- **Answers with sources:** Enterprise Search\n- **A short AI briefing before the full document:** ADEO\n- **Three levels of control for different users:** Agent Workforce\n- **Legal text rewritten in plain language:** HDFC Bank\n- **Early warnings for spikes, conflicts and risks:** Sony",
  followups=["How does he design for trust in AI?"])

V("when-not-ai",
  "No, he doesn't use AI everywhere. He uses it when the problem actually needs it.\n\nFor example, his visitor management work for Mphasis uses no AI: QR registration, OTP check-in and a shared visit status solved the problem.",
  followups=["What AI work has he done?"])

V("ai-designer",
  "He doesn't call himself an \"AI designer\". He's a **product designer who uses AI when a product needs it**, and designs each AI behaviour, like search, summaries or agents, on purpose.")

# ════════════════════════ LEADERSHIP & TEAM ════════════════════════

V("leadership",
  "He leads design on his projects and **mentors 6 junior designers**:\n\n- **Leads design** on UnifyApps products, end to end\n- **Mentors 6 junior designers** through critiques and growth plans\n- **Runs several projects at once**\n- **Set up the handoff and review process** between designers and engineers at ICD\n- **Works directly with client executives**",
  keywords=["leadership", "leadership experience", "has he led", "led a team", "lead", "leader", "manage", "manages", "manager",
            "management", "people management", "manage people", "team lead", "design lead", "managed designers"],
  followups=["Does he mentor designers?", "Can he lead a design team?"])

V("mentoring",
  "Yes. He mentors **6 junior designers** through regular critiques and growth planning. He helps them think about the whole product, not just single screens, and holds their work to accessibility standards (WCAG 2.1).",
  followups=["Does he have leadership experience?"])

V("engineers",
  "He works closely with engineers:\n\n- He **set up ICD's design-to-engineering handoff and review process**, which reduced rework\n- He hands off **documented components**, not loose screens\n- He designs with **technical limits in mind**\n- In the Agent Workforce Platform he designed **for engineers as users**: the Advanced mode gives them full control over models, data and testing",
  followups=["Has he built a design system?"])

V("design-system",
  "Yes. He **owns the UnifyApps design system**, which covers AI, data quality, governance and workflow automation.\n\n- It's **reused across 60+ client deployments**\n- It **speeds up delivery** and keeps products consistent\n- The Agent Workforce Platform runs **three modes on one design system**",
  followups=["How does he work with engineers?"])

V("accessibility",
  "Yes. Accessibility (WCAG) is on his resume. He **enforces WCAG 2.1** on his team's work and has run **WCAG 2.1 AA audits** of client dashboards, with scored findings and a plan for fixes.")

V("multitasking",
  "He usually runs **several projects in parallel**. A shared design system and reusable patterns keep quality consistent across them. On **HDFC Bank** he delivered against a regulatory deadline that couldn't move (India's DPDP Act).",
  followups=["Has he built a design system?"])

V("agencies",
  "Yes. On the **ADEO** committee platform for the Abu Dhabi government, he worked alongside **Frog Design** and **Nagarro Design**.")

V("lead-fit",
  f"He already works at lead level: he owns design end to end, works with client executives, runs several projects at once, owns a design system and mentors 6 designers. Whether he fits a specific role is best discussed with him directly: **{EMAIL}**.",
  keywords=["lead a design team", "lead a team", "lead role", "lead position", "head of design", "design manager", "principal designer",
            "staff designer", "ready for lead", "can he lead", "manage a design team", "build a design team"],
  followups=["How can I contact him?"])

# ════════════════════════ WORK ════════════════════════

V("best-problems",
  "He's best at products where **information, people and decisions are spread across many places**:\n\n- **Information spread across many tools:** Enterprise Search brings it into one place with sources\n- **Slow, high-stakes decisions:** ADEO gives committees AI briefings and structured voting\n- **Strict regulations:** HDFC's consent platform builds compliance into everyday use\n- **AI that needs control:** Agent Workforce adds rules, testing and records",
  followups=["Tell me about Enterprise Search", "Tell me about ADEO"])

V("common-thread",
  "Across his case studies, the same ideas repeat:\n\n- AI answers come **with evidence**\n- **People approve** important actions\n- **Everyone works from the same data**, each with their own view\n- **Rules and records are built in** from day one")

V("industries",
  "His case studies cover **AI software (UnifyApps), government (Abu Dhabi), banking (HDFC Bank) and media (Sony)**.\n\nHis other client work adds insurance, retail, manufacturing, aviation, hospitality, HR and automotive.",
  followups=["Other projects", "Tell me about ADEO"])

V("most-complex",
  "- **Biggest scope:** **Sony**, four connected platforms (contracts, board governance, broadcast scheduling and social media analysis)\n- **Highest stakes:** **HDFC Bank**, a fixed regulatory deadline and 30M+ customers, and **ADEO**, government decisions on 1,000+ proposals a month",
  followups=["Tell me about Sony", "Tell me about HDFC Bank"])

V("proudest",
  "That's best asked to Vishnu himself. Two case studies show his thinking best:\n\n- **ADEO:** AI that helps government committees decide carefully\n- **Enterprise Search:** AI answers people can trust because they show their sources",
  followups=["Tell me about ADEO", "Tell me about Enterprise Search"])

V("adapt-domains",
  "He learns each new field's rules, workflows and vocabulary first, then applies the same approach. Most products he designs share the same underlying problems: information in too many places, many types of users, approvals and compliance.")

V("dashboards",
  "He designs data-heavy products so they **show what needs attention first**:\n\n- **Sony Social Intelligence:** 2.47M social mentions a month combined with TV ratings, with spike alerts and sentiment\n- **HDFC Bank:** a console where the bank tracks consent problems in real time\n\nData Visualization is also on his resume.",
  followups=["Tell me about Sony", "Other projects"])

# ════════════════════════ CAREER / PERSONAL ════════════════════════

V("early-career",
  "Before ICD he designed a wide mix of products:\n\n- **Momentable / Nextdecentrum:** an NFT marketplace, plus its brand identity\n- **Mycarely.in:** a healthcare platform for senior citizens\n- **Brane Banking & Seamless Loans:** a loans and banking platform\n- **Chicago Park District:** a park events website\n- **Salud Interactiva:** a healthcare services portal\n- **Mobionix & LEAPQUE:** voice AI concepts for hotels and restaurants\n- **QuoteBot:** an insurance quote generator\n\n[See the 2023 portfolio →](https://byvishnudesign.framer.website/)")

V("evolution",
  "No, his work grew in stages: consumer apps and Web3 at Kocha, then 20+ client projects on a low-code platform at Brane, and now AI and enterprise products at ICD / UnifyApps.")

V("branding",
  "Yes, earlier in his career. He created brand identities for Momentable, Salud Interactiva, Mobionix, LEAPQUE and QuoteBot. Adobe Creative Suite is still on his resume.")

V("hobbies",
  "Outside work he:\n\n- 🎨 **Sketches and paints** (mostly live sketching and watercolour)\n- ⚽ **Plays football**\n- ✈️ **Travels**\n- 🚴 **Goes on long bike rides**",
  followups=["Where can I see his art?", "Who are you?"])

V("art",
  "He paints mostly **watercolours and live sketches**, with some oil painting.\n\n- **Sketchbook:** instagram.com/sketch_b.o.o.k\n- **Paintings:** behance.net/vishnuprasadkp")

# ════════════════════════ HIRING ════════════════════════

V("why-hire",
  "Five reasons:\n\n1. He's **led design on major AI products** for HDFC Bank, the Abu Dhabi government and Sony\n2. He designs **AI people trust**: sources, labels and human approval\n3. He **owns the whole journey**, from client brief to developer handoff\n4. His **design system is reused across 60+ deployments**\n5. He **mentors designers** and handles several projects at once\n\n" + f"Reach him at **{EMAIL}**.",
  keywords=["why hire", "why should we hire", "why vishnu", "reasons to hire", "reason to hire", "3 reasons", "three reasons",
            "good hire", "what value", "value he brings", "what can he bring", "convince me", "good fit", "right fit"],
  followups=["How can I contact him?"])

V("open-to-work",
  f"Vishnu is always open to conversations. Email him at **{EMAIL}** or message him on LinkedIn.",
  followups=["Why should we hire him?"])

V("solo-or-team",
  "He **leads the design** on his projects, but they're team efforts:\n\n- On UnifyApps projects, ICD is the design partner and the product team leads the research\n- On ADEO, ICD worked alongside Frog Design and Nagarro Design\n\nTeam sizes for individual projects aren't public.",
  followups=["What was his role?"])

V("outcomes-real",
  "Yes, and every number says where it came from:\n\n- **Enterprise Search & Agent Workforce:** UnifyApps' published figures from a financial institution's deployment\n- **HDFC Bank:** reported by UnifyApps\n- **Sony:** from project documentation\n- **ADEO:** from the case study\n- **Other client projects:** expected results, clearly marked as such")

V("weakness",
  f"I don't know that, sorry. That's a question for Vishnu himself: **{EMAIL}**. His case studies are open about trade-offs, though, and each one names what its decisions cost.")

V("failure",
  f"I don't know about specific mistakes, sorry. Vishnu would be the best person to ask: **{EMAIL}**. Each of his case studies ends with what he learned from the project.")

V("conflict",
  f"I don't know about specific disagreements, sorry. You can ask Vishnu directly at **{EMAIL}**. His general approach is to agree on a short list of clear problems first and to write down each decision with its trade-off.")

# Keywords/questions to REMOVE from older data so topics don't steal each other's questions.
REMOVE = {
  "skills": ["strengths", "strength", "good at", "superpower", "strong at", "what is he good at", "what are his strengths",
             "prompt engineering", "ui ux", "ui and ux", "ux and ui", "ui as well as ux", "ux design", "ui design", "interaction design",
             "information architecture", "visual design skills", "ux designer", "ui designer", "ui or ux", "ux or ui", "ux designer or ui designer"],
  "unique-approach": ["edge"],
  "research": ["usability testing", "test his designs", "testing", "test designs", "usability test"],
  "ai-patterns": [],
}

# ── Audit fixes (v3) ──
V("awards-certs",
  f"I don't have any information about awards or certifications, sorry. 🪲 You can ask Vishnu directly at **{EMAIL}**.",
  keywords=["awards", "award", "won", "certifications", "certification", "certified", "certificate", "certificates", "courses", "recognition", "honours", "honors"],
  questions=["what awards has he won", "does he have certifications"], category="interview", new=True)

V("why-designer",
  f"I don't know his personal story, sorry. 🪲 He studied Planning & Architecture before moving into product design. For the full story, ask him at **{EMAIL}**.",
  keywords=["why did he become a designer", "why design", "why ux", "how did he get into design", "how did he start", "why product design", "switch to design", "motivation", "inspires him", "inspiration", "passion for design"],
  questions=["why did he become a designer", "how did he get into design"], category="about", new=True)

EXTRA_KEYWORDS = {
  "skills-soft": ["communicator", "good communicator", "communicate", "articulate", "storytelling"],
  "skills-design": ["enterprise saas", "saas", "b2b saas", "know information architecture", "know interaction design", "ia skills"],
  "why-hire": ["why should i hire", "why should i hire him", "for my company", "for our company", "for my team", "help my company", "help our team", "what can he do for"],
  "who-is-vishnu": ["yourself and vishnu", "introduce vishnu", "kind of work", "type of work", "what kind of work", "what does he do"],
  "nyrro": ["tell me about yourself", "about yourself", "introduce yourself"],
  "title-seniority": ["his job", "what is his job", "job title", "what is his role", "his role", "current role", "current position", "position"],
  "current-work": ["where does he work", "which company", "current company", "employer", "company he works", "where is he working"],
  "career-history": ["did he work at", "has he worked at", "worked at", "work at", "companies he worked", "previous employer", "previous employers"],
  "experience-years": ["how much experience", "experience level"],
  "projects-list": ["best projects", "top projects", "his projects"],
  "design-process": ["solve problems", "problem solving", "how does he solve", "approach problems"],
  "principles": ["how does he think", "mindset", "thinking", "beliefs"],
  "working-style": ["handle feedback", "take feedback", "receive feedback", "criticism", "team member", "as a colleague", "colleague", "work with him", "like working with"],
  "leadership": ["does he lead", "how many people has he managed", "people has he managed", "how many has he managed", "team he leads"],
  "art": ["creative", "creativity", "is he creative", "artistic"],
  "location-regions": ["where is he from", "from where", "which country", "nationality"],
  "contact": ["call him", "can i call", "message", "dm", "ping him"],
  "sensitive": ["how much does he charge", "how much does he cost", "how much salary", "how much does he earn", "earn", "earning"],
  "off-topic": ["what is ai", "what is artificial intelligence", "meaning of life", "definition of", "capital of", "who won", "weather today"],
}
REMOVE.update({
  "coding": ["technical", "technical skills"],
  "skills": REMOVE["skills"] + ["design skills"],
  "location-regions": ["where does he work"],
  "sensitive": ["how much"],
  "open-to-work": ["hire him", "how can i hire"],
  "proudest": ["best project", "best work", "top project"],
})

V("contact",
  f"The best way to reach Vishnu is **email: {EMAIL}**\n\n- **LinkedIn:** [linkedin.com/in/vishnu-prasad-k-p-225949134](https://www.linkedin.com/in/vishnu-prasad-k-p-225949134/)\n- **Resume:** [vishnuprasad.space/resume](https://vishnuprasad.space/resume)")

V("prototyping",
  "Yes. Prototyping is part of his everyday work, and **Generative Prototyping** is on his resume:\n\n- **Wireframes, user flows and high-fidelity UI:** at Kocha he took requirements all the way to wireframes, flows and final interfaces\n- **Interactive prototypes** in Figma and Framer\n- **Quick AI prototypes** with Claude and Google AI Studio, to test an idea before it's built",
  keywords=["prototype", "prototypes", "prototyping", "wireframe", "wireframes", "wireframing", "mockups", "mockup", "high fidelity", "low fidelity", "hi fi", "lo fi", "can he prototype", "interactive prototype"],
  questions=["does he do prototyping", "can he prototype", "does he do wireframes"], category="skills", new=True,
  followups=["What tools does he use?", "What are his skills?"])

V("project-count",
  "He has worked on **100+ use cases** across his career:\n\n- **60+ deployments** at UnifyApps (through ICD)\n- **20+ client projects** at Brane Enterprises\n- His portfolio features **five case studies**",
  keywords=["how many projects", "number of projects", "how many use cases", "how many clients", "number of clients", "projects count", "how many products", "how many deployments"],
  questions=["how many projects has he done", "how many clients has he worked with"], category="work", new=True,
  followups=["What has he worked on?", "Other projects"])

V("where-to-start",
  "A good place to start is **ADEO**, the committee platform for the Abu Dhabi government. It shows how he designs AI that helps people make careful decisions.\n\nIf you're mainly interested in AI products, start with **Enterprise Search** instead.",
  keywords=["read first", "where to start", "which case study first", "start with", "which one should i read", "recommend a case study", "which case study should i read", "suggest a case study"],
  questions=["which case study should i read first", "where should i start"], category="work", new=True,
  followups=["Tell me about ADEO", "Tell me about Enterprise Search"])

V("links",
  "Here are all of Vishnu's links:\n\n- **Portfolio:** [vishnuprasad.space](https://vishnuprasad.space)\n- **LinkedIn:** [linkedin.com/in/vishnu-prasad-k-p-225949134](https://www.linkedin.com/in/vishnu-prasad-k-p-225949134/)\n- **Resume:** [vishnuprasad.space/resume](https://vishnuprasad.space/resume)\n- **Behance:** [behance.net/vishnuprasadkp](https://www.behance.net/vishnuprasadkp)\n- **Sketchbook (Instagram):** [instagram.com/sketch_b.o.o.k](https://www.instagram.com/sketch_b.o.o.k/)\n- **2023 portfolio:** [byvishnudesign.framer.website](https://byvishnudesign.framer.website/)",
  keywords=["links", "link", "portfolio link", "website", "site", "behance", "instagram", "dribbble", "figma community", "socials", "social media links", "profiles", "url", "github"],
  questions=["give me his links", "what is his behance", "portfolio link"], category="hiring", new=True)

EXTRA_KEYWORDS.update({
  "skills-design": EXTRA_KEYWORDS["skills-design"] + ["visual design", "does he do visual design", "ui visual"],
  "dashboards": ["work with data", "data heavy", "data products", "data", "data driven"],
  "stakeholders": ["handle clients", "client handling", "client facing", "client management", "deal with clients"],
  "skills-strategy": ["understand business", "business goals", "business sense", "business acumen", "business"],
  "education": ["graduation year", "graduation", "graduated", "year of graduation", "passed out", "batch", "university", "which university", "which college"],
  "figma-files": ["get the prototype", "see the prototype", "share the prototype", "prototype link", "figma link", "send designs"],
  "proudest": ["most impressive", "impressive", "best known project"],
})
REMOVE.update({"branding": ["visual design"], "early-career": ["behance"], "art": ["instagram"]})
