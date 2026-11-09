import json
kb=json.load(open('../nyrro-knowledge-base.json'))
L=["# Nyrro v5 — Question & Answer Catalogue","",f"Generated from the locked build (v{kb['version']}). **{len(kb['intents'])} topics · {len(kb['entities'])} projects/companies.** Every answer opens by answering the question directly.","",
"## Rules Nyrro follows","",
"- **Source-only:** every answer comes from the resume, About page, case studies, Notion projects or the 2023 portfolio. Nothing is invented.",
"- **Skills and tools are copied from the resume as-is**, after a short 1–2 sentence intro.",
"- **General questions open with how Vishnu approaches the topic** (from his resume, About page and own words), then examples from the case studies.",
"- **The 5 case studies come first.** Other client work appears only when a visitor names the client, asks for \"other projects\", or asks about a field the case studies don't cover.",
"- **No repeated answers.** Suggestions never point to something already answered.",
"- **Honest when it doesn't know:** _\""+kb['fallback']['answer'].replace('**','')+"\"_","","---",""]
names={"conversation":"Conversation","about":"About Vishnu","skills":"Skills & tools","process":"How he works","ai":"AI","leadership":"Leadership & team","work":"Projects","domain":"Industries","career":"Career","personal":"Personal & Nyrro","hiring":"Hiring, contact & links","boundaries":"Boundaries","interview":"Interview-style"}
order=["conversation","about","skills","process","ai","leadership","work","domain","career","personal","hiring","interview","boundaries"]
cats={}
for it in kb['intents']: cats.setdefault(it['category'],[]).append(it)
L.append("## Part 1 — General topics\n")
for c in order+[c for c in cats if c not in order]:
    if c not in cats: continue
    L.append(f"### {names.get(c,c)}\n")
    for it in cats[c]:
        L+=[f"#### {it['questions'][0][0].upper()+it['questions'][0][1:]}?  `{it['id']}`" if it['questions'] else f"#### `{it['id']}`",
            "**Also asked as:** "+" · ".join(f"_{q}_" for q in it['questions'][1:]) if len(it['questions'])>1 else "",
            "","**Keywords:** "+", ".join(it['keywords']),"","**Answer:**\n",
            "\n".join("> "+l if l else ">" for l in it['answer'].split("\n")),""]
an={"overview":"Overview","problem":"Problem","users":"Users","features":"Features","strategy":"Approach","decisions":"Decisions & trade-offs","outcomes":"Outcomes","ai":"How AI is used","learnings":"Learnings","role":"His role","voting":"Voting"}
groups=[("Part 2 — The 5 case studies",lambda e:e['caseStudy']),("Part 3 — Other client projects (only when asked)",lambda e:not e['caseStudy'] and e['id'] not in {"unifyapps","icd","brane","kocha"}),("Part 4 — Companies",lambda e:e['id'] in {"unifyapps","icd","brane","kocha"})]
for title,flt in groups:
    L.append(f"---\n\n## {title}\n")
    for e in filter(flt,kb['entities']):
        L+=[f"### {e['label']}\n","**Recognised by:** "+", ".join(e['aliases']+e.get('weakAliases',[])),""]
        for k,v in e['answers'].items(): L+=[f"**{an.get(k,k)}**\n","\n".join("> "+l if l else ">" for l in v.split("\n")),""]
open('../nyrro-qa-catalogue_v5.md','w').write("\n".join(L))
