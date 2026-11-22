# v7: smarter understanding, with no new answers of its own.
#
# CONCEPTS: a synonym dictionary. Each concept lists the ways visitors phrase one idea and says where that idea lives in
# the knowledge base: a topic (`intent`), a project (`entity`), or words to look for in the existing answers (`terms`,
# used to list where that idea shows up in his work). `fallback` marks ideas Nyrro has no information on (so it says so
# instead of forcing a weak match). Phrases are matched after the usual clean-up (lower case, plurals folded, typos fixed).
CONCEPTS = [
  # AI agents and automation
  {"id": "agents", "label": "AI agents and agentic workflows", "intent": "agentic",
   "patterns": ["autonomous", "autonomous system", "autonomous agent", "intelligent workflow", "intelligent automation",
                "smart workflow", "agent workflow", "agentic workflow", "automate", "automates", "automated", "automating",
                "automation", "business process", "process automation", "workflow automation", "ai workflow",
                "ai workflows", "ai agent", "ai agents", "digital worker", "digital workers", "bots that", "agent based"]},
  # Enterprise search
  {"id": "search", "label": "enterprise search", "entity": "enterprise-search",
   "patterns": ["find information", "finding information", "find answer", "finding answer", "company knowledge",
                "across company tools", "across tools", "across apps", "workplace search",
                "internal search", "search across", "knowledge discovery", "search experience", "search product",
                "search platform", "ai search"]},
  # Enterprise UX / complex B2B products
  {"id": "enterprise-ux", "label": "enterprise UX", "intent": "best-problems",
   "patterns": ["enterprise ux", "enterprise design", "enterprise software", "enterprise product", "enterprise app",
                "enterprise application", "b2b", "b2b product", "b2b software", "complex software", "complex product",
                "complex system", "business software", "business application", "internal tool", "internal tools",
                "complex workflow", "complex workflows", "enterprise grade"]},
  # Low-code / no-code
  {"id": "low-code", "label": "low-code and no-code platforms", "terms": ["low code", "low-code", "lowcode", "no code", "no-code"],
   "patterns": ["low code", "lowcode", "no code", "nocode", "low code platform", "no code platform", "visual builder",
                "drag and drop", "citizen developer", "builder tool", "app builder"]},
  # Product strategy
  {"id": "strategy", "label": "product strategy", "intent": "skills-strategy",
   "patterns": ["product strategy", "product thinking", "business goal", "business goals", "roadmap", "product vision"]},
  # Research and discovery
  {"id": "research", "label": "research and discovery", "intent": "research",
   "patterns": ["discovery", "user interview", "user interviews", "field research",
                "understand user", "understand the user", "user need", "user needs"]},
  # Introductions about Vishnu (not about Nyrro)
  {"id": "intro", "label": "who Vishnu is", "intent": "who-is-vishnu",
   "patterns": ["introduce vishnu", "yourself vishnu", "introduce him", "professional background",
                "his profile", "about his profile", "overview of vishnu", "summary of vishnu", "elevator pitch"]},
  # His projects, asked loosely
  {"id": "projects", "label": "his projects", "intent": "projects-list", "weak": True,
   "patterns": ["what projects", "which projects", "project has he", "project did he", "has he done", "he has done",
                "did he do", "list of project", "his project", "what has he designed", "what did he design",
                "body of work", "past work"]},
  # Personal things Nyrro doesn't know
  {"id": "personal", "label": "personal details", "fallback": True,
   "patterns": ["favourite", "favorite", "girlfriend", "boyfriend", "wife", "religion", "caste", "politics",
                "political", "his age", "how old", "birthday", "zodiac", "favourite food", "favorite food"]},
]

# The case study page for each project (answers link to them when they suggest projects or compare them).
CASE_URLS = {
  "enterprise-search": "/work/enterprise-search", "agent-workforce": "/work/ai-agent", "adeo": "/work/adeo",
  "hdfc": "/work/hdfc", "sony": "/work/sony", "sony-clm": "/work/sony", "sony-governance": "/work/sony",
  "sony-sports": "/work/sony", "sony-social": "/work/sony",
}

# A topic whose answer names no case study borrows the case studies of a closely related topic, for "which project
# shows that?" (e.g. his AI skills → the projects in his AI experience answer).
TOPIC_LINKS = {
  "skills-ai": "ai-experience", "ai-designer": "ai-experience", "when-not-ai": "ai-experience",
  "item-agentic-ux": "agentic", "other-agentic": "agentic", "item-ai-trust-explainability": "ai-trust",
  "item-human-in-the-loop-workflows": "human-in-loop", "item-prompt-design": "ai-patterns",
  "item-design-systems": "design-system", "item-user-research": "research", "item-product-discovery": "research",
  "skills-research": "research", "item-stakeholder-management": "stakeholders", "skills-strategy": "stakeholders",
  "item-mentoring": "mentoring", "item-data-visualization": "dashboards", "best-problems": "most-complex",
  "strengths": "most-complex", "proudest": "most-complex", "skills-design": "design-process",
  "item-product-design": "design-process", "item-information-architecture": "design-process",
  "item-interaction-design": "design-process", "unique-approach": "design-process", "principles": "design-process",
}
