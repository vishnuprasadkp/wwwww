# Nyrro v2 — integration brief (for Claude Code)

Nyrro is the beetle assistant on vishnuprasad.space. It answers visitor questions about Vishnu **without any AI API**: a keyword knowledge base plus a small matcher that runs in the browser.

**Your job is only to wire it into the site's existing chat UI.** All content and matching logic are done and tested (412 test questions and conversation turns).

## Hard rules

1. **Do not rewrite, summarise, shorten or "improve" any answer text** in `nyrro-knowledge-base.json`. The wording is approved.
2. **Do not replace the matcher** with your own keyword logic, embeddings or an LLM call. Import `nyrro-matcher.js` as is.
3. **Do not add projects, clients, metrics or facts**, and don't change the order of the 5 case studies.
4. **Do not add your own repeat handling, "I don't know" text or suggestion chips.** The matcher already does all three; just render what it returns.
5. Keep the files exactly as delivered. If you need a different module format, wrap the file; don't edit it.

## What the matcher handles for you

| Behaviour | What it does |
|---|---|
| **Case studies first** | The 5 portfolio case studies are the main projects. Other client work appears only when a visitor names the client, asks for "other projects", or asks about a domain the case studies don't cover |
| **No repeated answers** | If a question would repeat an earlier answer, Nyrro says it was covered above and suggests something new |
| **Fresh chips** | Suggestion chips never point to an answer already given |
| **Honest "I don't know"** | Unknown questions → "I don't know about that, sorry… get in touch with Vishnu at …". Unknown project details (budget, team size, a missing aspect) → "I don't have details about …" |
| **Follow-ups** | After a project is mentioned, "what was the outcome?" applies to that project. With no project yet, Nyrro asks which one |
| **Typos, plurals, Hinglish basics** | "vishu", "mashrek", "llms", "kaun hai", "experience kitna" |

## Files

| File | What it is |
|---|---|
| `nyrro-knowledge-base.json` | All content: 91 general topics, 35 projects/companies, ~310 answers |
| `nyrro-matcher.js` | Zero-dependency matcher (UMD: `<script>`, ES import via bundler, or Node `require`) |
| `nyrro-demo.html` | Working reference chat UI; copy its rendering logic |
| `nyrro-qa-catalogue.md` | Human-readable list of every topic and answer (review only) |
| `build/` | Source data (Python) and tests. Edit content here, then rebuild |

## How to use it

```js
import kb from "./nyrro-knowledge-base.json";
import createNyrro from "./nyrro-matcher.js";   // or <script src="nyrro-matcher.js"> → window.createNyrro

const nyrro = createNyrro(kb, {
  onMiss: (q) => { /* optional: log unanswered questions, e.g. to analytics */ }
});

const reply = nyrro.ask(userText);
// reply.answer    → Markdown string (render it, see below)
// reply.followups → up to 4 suggested questions; render as chips that call ask(chipText)
// reply.match     → { type, id, aspect, score }  (debug only; don't show visitors)
```

- Create **one `nyrro` instance per chat session** and reuse it, because it remembers what was already said. Call `nyrro.reset()` when the visitor starts a new chat.
- On open, call `nyrro.ask("hi")`, or use the site's existing suggested prompts. All of these are answerable:
  - "What makes Vishnu's design approach unique?"
  - "What has Vishnu worked on?"
  - "How does Vishnu design?"

## Rendering answers (Markdown subset)

Answers only use: paragraphs, `**bold**`, `_italic_` / `*italic*`, `- bullets`, `1. numbered` lists, `[text](https://url)` links, and emoji. Use the `md()` function in `nyrro-demo.html` (about 20 lines, escapes HTML first). Links open in a new tab.

## UX details

- Show answers instantly. If you add a typing indicator, keep it ≤ 400 ms.
- Render every chip returned (max 4) under the bot message.
- Enter submits; keep the input focused after each answer.
- Must work at 375 px width.

## Updating content later

1. Edit `build/data_general.py` (topics), `build/data_projects.py` (projects) or `build/data_overrides.py` (v2 wording and extra keywords).
2. `cd build && python3 build.py` regenerates `nyrro-knowledge-base.json`.
3. Run all tests; every one must pass:
   `node test.js && node test_blind.js && node test_blind2.js && node test_v2.js && node test_phrasing.js`
4. To teach Nyrro a missed question: add its key phrase to a topic with `K("topic-id", "new phrase")` at the bottom of `data_overrides.py`, rebuild and re-test.
