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
Nyrro.selfTest()   // must return { ok: true, fingerprint: "39cde9602569f256", ... }
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
node test.js && node test_blind.js && node test_blind2.js && node test_v2.js && node test_phrasing.js && node test_relevance.js && node test_source_only.js
```

All tests must pass. Rebuilding prints a new fingerprint; update it in this README.
