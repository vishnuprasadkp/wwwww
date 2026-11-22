# Nyrro v5 — integration brief (for Claude Code)

Nyrro is the beetle assistant on vishnuprasad.space. It answers visitors' questions about Vishnu with **no AI API**: a locked knowledge base and a matcher, shipped as **one file: `dist/nyrro.bundle.js`**.

> ⚠️ **The current live site is NOT using this content.** Its skills answer ("His real strength is making complex systems usable…") was written by hand and does not exist in the knowledge base. Remove every hand-written Nyrro answer, keyword list and matching rule from the site and use the bundle instead.

## The only acceptable integration

1. Copy `dist/nyrro.bundle.js` into the site **unchanged** (e.g. `public/nyrro.bundle.js`).
2. Load it (a normal script tag, or `import Nyrro from "./nyrro.bundle.js"`).
3. Wire it to the existing chat UI:

```js
const bot = Nyrro.create({ onMiss: q => {/* optional analytics */} });   // ONE per chat session

function onUserMessage(text) {
  const r = bot.ask(text);
  renderBotMessage(r.html);          // r.html is ready, escaped HTML. Insert it as-is.
  renderChips(r.followups);          // ≤ 4 suggested questions. Clicking a chip → onUserMessage(chipText)
}
// When the visitor clears/restarts the chat: bot.reset();
// On open: onUserMessage("hi")  (or keep the site's starter prompts; they are all answerable)
```

4. **Verify** in the browser console on the live site, and include the output in your summary:

```js
Nyrro.selfTest()   // must return { ok: true, fingerprint: "69561e8cda68927e", ... }
```

If `ok` is false, the site is serving modified answers. Fix the integration, not the bundle.

## Do NOT

- ❌ Write, rewrite, shorten, summarise or "improve" any answer
- ❌ Add your own keyword matching, intent detection, embeddings or LLM calls
- ❌ Add your own "I don't know" text, repeat handling or suggestion logic (the bundle already does all three)
- ❌ Edit `nyrro.bundle.js` or split it apart
- ❌ Add projects, clients, numbers or skills

## Do

- ✅ Style the bubbles and chips to match the site. The HTML uses only `<p> <strong> <em> <ul> <ol> <li> <a>`
- ✅ Open links in a new tab (already set in the HTML)
- ✅ Show answers instantly (any typing animation ≤ 400 ms)
- ✅ Make sure it works at 375 px width

## Reference

- `nyrro-demo.html`: a complete working chat using the bundle. Open it in a browser to see the expected behaviour.
- `nyrro-qa-catalogue_v5.md`: every topic, example question and answer.

## Changing content (Vishnu's team only)

Edit `build/data_v5.py` (general answers; **source-only**: resume, About page, case studies, Notion, 2023 portfolio; skills and tools copied from the resume as-is) or `build/data_projects.py` (projects), then:

```bash
cd build
python3 build.py && node make_bundle.js && python3 make_catalogue.py
node test.js && node test_blind.js && node test_blind2.js && node test_v2.js && node test_phrasing.js && node test_relevance.js && node test_source_only.js && node test_v7.js
```

All tests must pass. Rebuilding prints a new fingerprint; update it in this README.

## v7: understanding questions phrased differently (still no AI API)

Everything runs in the browser, from the bundle. Nothing is sent anywhere.

- **Synonym dictionary** (`build/data_v7.py`, `CONCEPTS`): each concept lists the ways visitors phrase one idea ("autonomous systems", "intelligent workflows", "automate business processes") and points to where it lives: a topic (`intent`), a project (`entity`), words to look for in the existing answers (`terms`), or `fallback` for things Nyrro has no information on. To teach Nyrro a new phrasing, add it to a concept's `patterns`, rebuild and run the tests.
- **Typo repair**: a word Nyrro doesn't know is replaced by the one word in its own vocabulary that is a single slip away (two for long words); swapped letters count as one slip ("agnetic" → "agentic"). Words that appear anywhere in its answers are never changed.
- **Follow-ups**: after a general answer ("Tell me about his AI experience"), "Which project shows that?" or "Show me an example" lists the case studies behind it, with links. Topics that name no project borrow them from a related topic (`TOPIC_LINKS`).
- **Comparisons**: "Compare Enterprise Search and Agent Workforce", "ADEO vs HDFC" put two projects side by side, using only their own overviews.
- **Composed answers** (comparisons, examples, "where does low-code show up") are put together at answer time from existing answer text only, never new facts.

`build/test_v7.js` holds 47 conversations covering rewording, synonyms, typos, follow-ups, comparisons and honest misses.
