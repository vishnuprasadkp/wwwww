import json, sys
sys.path.insert(0, ".")
from data_projects import ENTITIES
from data_general import INTENTS
from data_overrides import OVERRIDES, DONT_KNOW

# Aspect = which part of a project the visitor is asking about.
ASPECTS = {
  "problem":   ["problem", "problems", "challenge", "challenges", "pain", "pain point", "pain points", "issue", "issues",
                "why was it needed", "why needed", "before", "struggle", "gap", "context", "situation", "what was wrong",
                "why build", "need for", "challenging", "difficult", "hard part", "tricky", "hardest", "hard", "complex part"],
  "users":     ["users", "user", "who uses", "who used", "personas", "persona", "roles", "audience", "who is it for",
                "target users", "user types", "end users", "who was it for", "for whom", "customers of"],
  "features":  ["features", "feature", "capabilities", "capability", "what can it do", "functionality", "functions",
                "modules", "screens", "how does it work", "how it works", "what does it do", "components", "what was built",
                "what did he build", "deliverables", "flows", "what can", "how does * work", "how * work", "what can * do"],
  "strategy":  ["strategy", "approach", "how did he design", "how did he approach", "design approach", "thinking",
                "solution", "how did he solve", "solve", "solved", "design process", "core flow", "idea", "concept", "insight",
                "design thinking", "how was it designed", "methodology", "principle", "key idea", "design strategy"],
  "decisions": ["decision", "decisions", "trade off", "trade offs", "tradeoff", "tradeoffs", "why did he", "choices",
                "choice", "compromise", "downside", "rationale", "design decisions", "key decisions"],
  "outcomes":  ["outcome", "outcomes", "result", "results", "impact", "metric", "metrics", "numbers", "roi", "savings",
                "success", "kpi", "kpis", "achieved", "benefits", "benefit", "value", "improvement", "improvements",
                "what changed", "effect", "measurable"],
  "ai":        ["ai", "artificial intelligence", "ml", "machine learning", "llm", "genai", "gen ai", "generative",
                "model", "models", "type of ai", "what ai", "ai used", "ai features", "ai capabilities",
                "agentic", "intelligence used", "how is ai used", "ai role", "use ai", "uses ai", "no ai"],
  "learnings": ["learn", "learned", "learnt", "learning", "learnings", "lesson", "lessons", "takeaway", "takeaways",
                "reflection", "reflections", "retrospective", "what did he learn"],
  "role":      ["his role", "role", "responsibility", "responsibilities", "contribution", "team", "timeline", "duration",
                "when", "how long", "partner", "partners", "who did he work with", "what did he do on", "involvement", "his part"],
  "unknown":   ["budget", "cost", "costs", "budget of", "project budget", "cost of the project", "how much did it cost", "price of", "team size", "how many designers",
                "how many people", "revenue of", "funding", "contract value", "client contact", "contact person", "who was the client lead",
                "how many screens", "number of screens", "salary for", "tech stack", "which framework", "programming language",
                "database", "launch date", "release date", "is it live", "live link", "url of", "app store", "download the app"],
  "voting":    ["vote", "votes", "voting", "async", "absent members", "rationale for vote"],
}

# Generic single words that also appear in non-project questions: they only identify a
# project weakly, so a strong general-intent match can override them.
WEAK_ALIASES = {
  "search", "contract", "contracts", "sentiment", "onboarding", "payments", "credit", "incident", "insurance",
  "budget", "budgeting", "hotel", "hotels", "sports", "research", "promotion", "promotions", "visitor", "visitors",
  "offline", "flight", "privacy", "consent", "connectors", "committee", "procurement", "tender", "tenders",
  "invoices", "shipments", "fx", "treasury", "lending", "loan", "kyc", "outage", "alerts", "airline", "aviation",
  "hospitality", "capex", "proposal", "rfp", "flooring", "packaging", "salesforce", "gong", "outreach", "nps",
  "outlook", "reception", "front desk", "dealer", "dealership", "automotive", "reconciliation", "landlord", "tenant",
  "tenancy", "minutes", "statutory", "broadcast", "scheduling", "ratings", "audience", "mentions", "social media",
  "low code", "lowcode", "no code", "nft", "web3", "crypto", "blockchain", "buddy", "appraisal", "nominations",
  "unify", "dubai", "voting", "productivity", "medical incident", "riders", "quotation", "insurance agent",
  "deliberation", "data protection", "data privacy", "governance app", "board app", "search engine", "ai search",
  "copilot search", "knowledge search", "multi agent", "agent builder", "agents platform", "sap s4", "adobe sign",
  "agreements", "board minutes", "board governance", "corporate governance", "companies act", "customer experience",
  "revenue intelligence", "sales intelligence", "account intelligence", "call analysis", "sales calls",
  "cabin crew", "in flight", "research assistant", "research institute", "current company", "current job",
  "current employer", "manufacturing plants", "value added services", "financial planning", "portfolio consolidation",
  "government services", "service intelligence", "government service", "customer satisfaction", "cash management",
  "cross border", "foreign currency", "remittance", "root cause", "rca", "sre", "it operations", "aiops", "sources",
  "duplicate supplier", "kyb", "trade license", "trade licence", "purchase orders", "corporate assistant",
  "employee assistant", "hr assistant", "leave request", "hr copilot", "employee self service", "premium calculator",
  "health insurance", "insurance sales", "connected productivity", "enterprise workspace", "ai workspace",
  "voice of customer", "voc", "lost deal", "deal loss", "sales handoff", "channel planning", "tournament",
  "ten channels", "sports rights", "broadcast planning", "social listening", "social intelligence", "social command",
  "clm", "contract management", "contracts platform", "hr operations", "hr partner", "promotion management",
  "bill of materials", "bom", "revenue leakage", "revenue recovery", "incident management", "incident investigation",
  "service recovery", "lockbox", "bank reconciliation", "visitor management", "visitor pass", "gate pass",
  "qr check in", "otp check in", "cabin operations", "crew assessment", "pnl", "p&l", "rfp response",
  "supplier registration", "supplier verification", "vendor onboarding", "procurement copilot", "supplier copilot",
  "smart employee", "employee copilot", "consent management", "preference management", "consent platform",
  "consent portal", "dpdp", "dpdp act", "board management", "committee platform", "voting platform",
  "committee intelligence", "connector management", "search product", "search platform",
  "intelligent search", "media group", "license renewal", "licence renewal", "lease renewal", "business renewal",
}

# Typos and shorthand people actually type → normalised form.
SPELLFIX = {
  "vishu": "vishnu", "vishnus": "vishnu", "visnu": "vishnu", "vishhnu": "vishnu", "vishnuprasad": "vishnu",
  "experiance": "experience", "experianced": "experienced", "expirienced": "experienced", "expirience": "experience", "experince": "experience", "exp": "experience",
  "porfolio": "portfolio", "portfollio": "portfolio", "portfoilo": "portfolio", "portifolio": "portfolio",
  "linkdin": "linkedin", "linkedln": "linkedin", "resum": "resume", "résumé": "resume",
  "acheived": "achieved", "acheivements": "achievements", "achivement": "achievement",
  "hdfcbank": "hdfc bank", "airarabia": "air arabia", "nivabupa": "niva bupa", "digitaldubai": "digital dubai",
  "ajmanone": "ajman one", "unifyapp": "unifyapps", "unify-apps": "unifyapps",
  "a.i": "ai", "a.i.": "ai", "ux/ui": "ux ui", "ui/ux": "ui ux", "u": "you", "ur": "your", "abt": "about",
  "wat": "what", "wht": "what", "pls": "please", "plz": "please", "tel": "tell", "desgin": "design",
  "desing": "design", "designes": "designs", "designd": "designed", "procss": "process", "proces": "process",
  "stratergy": "strategy", "startegy": "strategy", "strategi": "strategy", "outcom": "outcome", "reslts": "results",
  "challange": "challenge", "challanges": "challenges", "hobies": "hobbies", "hobbys": "hobbies",
  "agentic-ai": "agentic ai", "co-pilot": "copilot", "chat bot": "chatbot", "e-mail": "email", "mail id": "email",
  "contactdetails": "contact details", "salry": "salary", "sallary": "salary", "govt": "government", "gov": "government",
  "mgmt": "management", "dept": "department", "proj": "project", "projs": "projects", "yrs": "years", "yr": "year",
  "grief": "greif", "lowes": "lowes", "mphsis": "mphasis", "mashrek": "mashreq", "masreq": "mashreq",
  "jubiliant": "jubilant", "virtua": "virtusa", "techion": "tekion", "stower": "stowers", "doceebo": "docebo",
}

# Starter chips shown when the bot isn't sure.
FALLBACK = {
  "answer": "I'm not sure I understood that. I know a lot about Vishnu's **projects, design approach, AI work, clients and experience**. Try one of these, or email him at **vishnuprasadkp98@gmail.com**.",
  "followups": ["Who is Vishnu?", "What has he worked on?", "How does he design?", "What AI work has he done?", "How can I contact him?"],
}

# Follow-up chips per aspect (shown after an entity answer).
ASPECT_FOLLOWUPS = {
  "overview": ["What was the problem?", "Who were the users?", "What was the approach?", "What was the outcome?"],
  "problem": ["Who were the users?", "What was the approach?", "What were the key features?"],
  "users": ["What were the key features?", "What was the approach?"],
  "features": ["How is AI used?", "What was the outcome?"],
  "strategy": ["What were the key features?", "What was the outcome?"],
  "decisions": ["What was the outcome?", "What did he learn?"],
  "outcomes": ["What was the approach?", "What did he learn?"],
  "ai": ["What was the outcome?", "What was the approach?"],
  "learnings": ["Show me another project", "How does he design?"],
  "role": ["What was the problem?", "What was the outcome?"],
  "voting": ["What was the outcome?", "What did he learn?"],
}

PARENT = {"sony-clm":"sony","sony-governance":"sony","sony-sports":"sony","sony-social":"sony","dd-onboarding":"digital-dubai","dd-supplier-gpt":"digital-dubai","dd-employee-copilot":"digital-dubai","mashreq-cash":"mashreq","mashreq-credit":"mashreq","mashreq-incident":"mashreq"}
ids = {it["id"] for it in INTENTS}
for k in OVERRIDES: assert k in ids, f"override for unknown intent {k}"
for it in INTENTS:
    o = OVERRIDES.get(it["id"])
    if not o: continue
    if o["answer"]: it["answer"] = o["answer"]
    it["keywords"] = [k for k in it["keywords"] if k not in o["remove_keywords"]] + [k for k in o["add_keywords"] if k not in it["keywords"]]
    it["questions"] += o["add_questions"]
    if o["followups"] is not None: it["followups"] = o["followups"]
for it in INTENTS: assert it["answer"], f"empty answer {it['id']}"
FALLBACK["answer"] = DONT_KNOW
FALLBACK["followups"] = ["What has he worked on?", "How does he design?", "How can I contact him?"]
from data_scope import DROP, NOTION, CASE_STUDY
SHORT = {"enterprise-search":"Enterprise Search","adeo":"the ADEO committee platform","agent-workforce":"the Agent Workforce Platform",
 "hdfc":"the HDFC Bank project","sony":"the Sony platforms","sony-clm":"Sony's contract platform","sony-governance":"Sony's governance platform",
 "sony-sports":"Sony's sports scheduling platform","sony-social":"Sony's social intelligence platform","digital-dubai":"the Digital Dubai projects",
 "dd-onboarding":"Digital Dubai supplier onboarding","dd-supplier-gpt":"Supplier GPT","dd-employee-copilot":"the Smart Employee Copilot",
 "niva-bupa":"the Niva Bupa project","mashreq":"the Mashreq projects","mashreq-cash":"Mashreq Cash AI","mashreq-credit":"Mashreq Credit Initiation",
 "mashreq-incident":"Mashreq Incident Investigation","jubilant":"the Jubilant project","virtusa":"the Virtusa project","tekion":"the Tekion project",
 "lowes":"the Lowe's workspace","cgb":"Sharek (CGB Qatar)","mphasis":"the Mphasis project","air-arabia":"the Air Arabia project",
 "stowers":"the Stowers project","ajman":"Ajman One","wasl":"the Wasl project","shaw":"the Shaw Industries project","docebo":"the Docebo project",
 "greif":"the Greif project","unifyapps":"UnifyApps","icd":"ICD","brane":"Brane Enterprises","kocha":"Kocha Technologies"}
for e in ENTITIES:
    if e["id"] in NOTION:
        # Generic words only count when the client itself is named ("mashreq credit", "digital dubai employee assistant").
        e["contextAliases"] = [a for a in e["aliases"] if a in DROP]
        e["aliases"] = [a for a in e["aliases"] if a not in DROP]
    e["caseStudy"] = e["id"] in CASE_STUDY
    e["name"] = SHORT[e["id"]]
    if e["id"] in PARENT: e["parent"] = PARENT[e["id"]]
    e["weakAliases"] = [a for a in e["aliases"] if a in WEAK_ALIASES]
    e["aliases"] = [a for a in e["aliases"] if a not in WEAK_ALIASES]

kb = {"version": "2.0.0", "assistant": "Nyrro", "owner": "Vishnu Prasad K P",
      "aspects": ASPECTS, "aspectLabels": {"problem":"the problem","users":"the users","features":"the features","strategy":"the approach","decisions":"the decisions and trade-offs","outcomes":"the outcomes","ai":"how AI is used","learnings":"the learnings","role":"his role and timeline","voting":"voting","unknown":"that"}, "aspectBoost": {"voting": 1.5}, "aspectFollowups": ASPECT_FOLLOWUPS, "spellfix": SPELLFIX,
      "entities": ENTITIES, "intents": INTENTS, "fallback": FALLBACK, "contactEmail": "vishnuprasadkp98@gmail.com",
      "whichProjectAnswer": "Which project would you like to know about? Here are his five case studies:",
      "repeatAnswer": "I've already shared that above ☝️ Is there something more specific you'd like to know?",
      "exploreChips": ["Tell me about Enterprise Search", "Tell me about ADEO", "Tell me about the Agent Workforce Platform", "Tell me about HDFC Bank", "Tell me about the Sony platforms", "How does he design?", "What AI work has he done?", "Other client work", "How can I contact him?"]}

out = "../nyrro-knowledge-base.json"
json.dump(kb, open(out, "w"), ensure_ascii=False, indent=1)
na = sum(len(e["answers"]) for e in ENTITIES)
print(f"entities={len(ENTITIES)} entity-answers={na} intents={len(INTENTS)} total-answers={na+len(INTENTS)}")
