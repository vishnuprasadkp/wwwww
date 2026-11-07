/*!
 * Nyrro matcher: answers visitor questions from nyrro-knowledge-base.json.
 * Zero dependencies, no API calls. Works in the browser and in Node.
 *
 *   const nyrro = createNyrro(kb);          // kb = parsed nyrro-knowledge-base.json
 *   const reply = nyrro.ask("what was the impact of hdfc?");
 *   // reply = { answer: "markdown…", followups: ["…"], match: { type, id, aspect, score } }
 *
 *   createNyrro(kb, { onMiss: q => console.log("unanswered:", q) })  // optional: collect gaps
 *
 * The matcher remembers the last project discussed, so follow-ups like
 * "what was the outcome?" or "who were the users?" apply to that project.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.createNyrro = factory();
})(typeof self !== "undefined" ? self : this, function () {

  const STOP = new Set(("a an the is are was were be been of for to in on at by with and or but it its this that these those " +
    "he she him his her they them their you your me my i we us our can could would should will do does did done " +
    "please tell show give about what whats which who whom how why when where any some much many more most there here " +
    "has have had get got let lets just also very really kindly want know like vishnu").split(" "));

  // Very common words: they count, but much less than a specific keyword.
  const GENERIC = new Set("experience work worked working design designed designs designing project projects built build help made make good".split(" "));

  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }

  return function createNyrro(kb, options = {}) {
    const spell = kb.spellfix || {};

    function normalize(text) {
      let t = (" " + String(text || "").toLowerCase() + " ")
        .replace(/[’‘`]/g, "'")
        .replace(/\b(who|what|where|how|it|he|that|there)'s\b/g, "$1 is").replace(/n't\b/g, " not").replace(/'s\b/g, "").replace(/'/g, "")
        .replace(/&/g, " and ").replace(/[^a-z0-9.\/+\- ]+/g, " ")
        .replace(/(\w)[\/\-](\w)/g, "$1 $2").replace(/\.(?=\s|$)/g, " ").replace(/\s+/g, " ");
      t = t.split(" ").map(w => spell[w] !== undefined ? spell[w] : w).join(" ");
      // Light stemming so plurals match: "llms"→"llm", "airlines"→"airline", "studies"→"study".
      t = t.split(" ").map(w => w.length > 4 && /ies$/.test(w) ? w.slice(0, -3) + "y"
                        : w.length > 3 && /[^su]s$/.test(w) ? w.slice(0, -1) : w).join(" ");
      return " " + t.replace(/\s+/g, " ").trim() + " ";
    }
    const tokens = t => t.trim().split(" ").filter(Boolean);
    const contentTokens = t => tokens(t).filter(w => !STOP.has(w) && w.length > 1);
    const qsTokens = t => contentTokens(t).filter(w => !GENERIC.has(w));

    // Phrase match: exact (word-boundary) or, for single long words, typo-tolerant.
    function phraseHit(text, toks, phrase, minFuzzy = 5) {
      const p = normalize(phrase).trim();
      if (!p) return 0;
      if (text.includes(" " + p + " ")) return 1;
      if (!p.includes(" ") && p.length >= minFuzzy) {
        const tol = p.length >= 8 ? 2 : 1;
        for (const w of toks) if (w.length >= 4 && lev(w, p) <= tol) return 0.8;
      }
      return 0;
    }

    // Pre-normalise the knowledge base once.
    const entities = kb.entities.map(e => ({
      ...e,
      _strong: e.aliases.map(a => normalize(a).trim()),
      _weak: (e.weakAliases || []).map(a => normalize(a).trim()),
      _ctx: (e.contextAliases || []).map(a => normalize(a).trim()),
    }));
    const intents = kb.intents.map(it => ({
      ...it,
      _kw: it.keywords.map(k => normalize(k).trim()),
      _q: it.questions.map(q => new Set(qsTokens(normalize(q)))),
    }));
    const aspects = Object.entries(kb.aspects).map(([id, kws]) => ({ id, kws: kws.map(k => k.includes("*") ? k.toLowerCase().trim() : normalize(k).trim()) }));

    function findEntities(text, toks, ctxEntity) {
      const found = [];
      for (const e of entities) {
        let best = 0, hit = "", hits = [];
        for (const a of e._strong) {
          const h = phraseHit(text, toks, a, 7);   // names: typo-tolerant only when long
          if (h) { hits.push(a); const s = h * (3 + a.split(" ").length); if (s > best) { best = s; hit = a; } }
        }
        for (const a of e._weak) {
          const h = text.includes(" " + a + " ") ? 1 : 0;   // weak aliases: exact only
          if (h) { hits.push(a); const s = 1.2 + 0.4 * a.split(" ").length; if (s > best) { best = s; hit = a; } }
        }
        if (best) found.push({ e, score: best, hit, hits });
      }
      found.sort((a, b) => b.score - a.score || b.hit.length - a.hit.length);
      // Generic words count for a sub-project only when its parent client is named ("mashreq credit").
      const named = new Set(found.map(f => f.e.id)); if (ctxEntity) named.add(ctxEntity.id);
      for (const e of entities) {
        if (!e.parent || !named.has(e.parent) || named.has(e.id)) continue;
        const h = e._ctx.concat(e._weak).filter(a => text.includes(" " + a + " "));
        if (h.length) found.push({ e, score: 1.5, hit: h[0], hits: h });
      }
      // Prefer a specific sub-project over its parent ("sony board minutes" → Sony governance).
      if (found[0]) {
        const child = found.find(f => f.e.parent === found[0].e.id);
        if (child) { child.score = Math.max(child.score, found[0].score); found.splice(found.indexOf(child), 1); found.unshift(child); }
      }
      return found;
    }

    function findAspect(text, toks) {
      let best = null, bestScore = 0;
      for (const a of aspects) {
        let s = 0;
        for (const k of a.kws) {
          let hit = false;
          if (k.includes("*")) {
            const re = new RegExp(" " + k.split(" ").map(w => w === "*" ? "(?:\\S+ ){1,4}?" : w + " ").join(""));
            hit = re.test(text);
          } else hit = text.includes(" " + k + " ");
          if (hit) s = Math.max(s, 1 + 0.5 * (k.replace(/\*\s?/g, "").trim().split(" ").length - 1));
        }
        if (s) s += (kb.aspectBoost || {})[a.id] || 0;
        if (s > bestScore) { bestScore = s; best = a.id; }
      }
      return { id: best, score: bestScore };
    }

    function scoreIntents(text, toks) {
      const ct = new Set(qsTokens(text));
      const res = [];
      for (const it of intents) {
        let kw = 0;
        for (const k of it._kw) {
          const h = phraseHit(text, toks, k);
          if (h) kw = Math.max(kw, GENERIC.has(k) ? 0.5 : h * (1 + 0.7 * (k.split(" ").length - 1)));
        }
        let qs = 0;
        if (ct.size) for (const q of it._q) {
          if (!q.size) continue;
          let inter = 0; for (const w of ct) if (q.has(w)) inter++;
          const sim = inter / Math.max(q.size, ct.size);   // overlap with sample phrasing
          qs = Math.max(qs, sim);
        }
        const score = kw + qs * 2.5;
        if (score > 0) res.push({ it, score, kw });
      }
      return res.sort((a, b) => b.score - a.score);
    }

    // ── Routing: decide what a question is about (no side effects) ──────────────
    function route(input, ctxEntity) {
      const text = normalize(input);
      const toks = tokens(text);
      if (!toks.length) return { type: "fallback", score: 0 };

      const ents = findEntities(text, toks, ctxEntity);
      // Remove project names before reading the aspect ("cash ai" is a name, not the "ai" aspect).
      let aspectText = text;
      for (const f of ents) for (const h of f.hits.filter(h => f.e._strong.includes(h)).sort((a, b) => b.length - a.length))
        aspectText = aspectText.replace(" " + h + " ", " ");
      const aspect = findAspect(aspectText, tokens(aspectText));
      const ints = scoreIntents(text, toks);
      const topI = ints[0];
      const asIntent = x => ({ type: "intent", id: x.it.id, it: x.it, score: +x.score.toFixed(2),
                               alts: ints.filter(y => y !== x && y.score >= x.score * 0.75 && y.score >= 1.2).map(y => y.it) });
      const asEntity = (e, score) => ({ type: "entity", id: e.id, e, aspect: aspect.id, score: +score.toFixed(2) });

      // 0. Boundaries first: competitor comparisons and personal details.
      const pri = ints.find(x => x.it.priority && x.kw >= 1);
      if (pri && (!topI || pri.score >= topI.score - 1.5)) return asIntent(pri);
      // 1. A clearly named project wins (unless a general question is clearly stronger).
      if (ents[0] && ents[0].score >= 3 && !(topI && topI.score >= 3.2 && topI.score > ents[0].score)) return asEntity(ents[0].e, ents[0].score);
      // 2. Weakly named project vs general question: pick the stronger.
      if (ents[0] && (!topI || ents[0].score + (aspect.score ? 0.8 : 0) > topI.score)) return asEntity(ents[0].e, ents[0].score);
      // 3. Follow-up about the project being discussed ("what was the impact?").
      const refersBack = / (was|were|did|it|this|that|its|there) /.test(text) || contentTokens(text).length <= 2;
      if (ctxEntity && aspect.score && (!topI || topI.score < 2.2 || refersBack)) return { ...asEntity(ctxEntity, aspect.score), followUp: true };
      // 3b. Project-style question but no project named yet ("what was the problem?").
      const aboutHim = / (he|his|him|vishnu) /.test(text);
      if (!ctxEntity && !aboutHim && ["problem", "users", "outcomes", "features", "decisions", "learnings", "ai"].includes(aspect.id)
          && (!topI || topI.score < 1.2) && refersBack) return { type: "which-project", score: aspect.score };
      // 4. General question (needs real confidence, otherwise say "I don't know").
      if (topI && topI.score >= (options.minScore || 0.95)) return asIntent(topI);
      return { type: "fallback", score: topI ? +topI.score.toFixed(2) : 0 };
    }

    // ── Conversation state: avoid repeating, keep suggestions fresh ─────────────
    let lastEntity = null;
    const shown = new Set();
    const ASK = { problem: "What was the problem?", users: "Who were the users?", strategy: "What was the approach?",
                  features: "What are the key features?", outcomes: "What was the outcome?", ai: "How is AI used?",
                  decisions: "What were the key decisions?", learnings: "What did he learn?", role: "What was his role?",
                  voting: "How did voting work?" };
    const ORDER = ["problem", "users", "strategy", "features", "ai", "outcomes", "decisions", "voting", "learnings", "role"];
    const EXPLORE = kb.exploreChips || [];
    const keyOf = r => r.type === "intent" ? r.id : r.type === "entity" ? r.id + ":" + (r.aspect && r.e.answers[r.aspect] ? r.aspect : "overview") : "fallback";

    function freshChips(candidates, ctx, currentKey, max = 4) {
      const out = [], seen = new Set([currentKey]);
      for (const c of candidates.concat(EXPLORE)) {
        if (out.length >= max) break;
        const k = keyOf(route(c, ctx));
        if (k === "fallback" || shown.has(k) || seen.has(k)) continue;
        seen.add(k); out.push(c);
      }
      return out;
    }
    function entityChips(e) {
      return ORDER.filter(a => e.answers[a] && !shown.has(e.id + ":" + a)).map(a => ASK[a]);
    }

    function ask(input) {
      const r = route(input, lastEntity);
      const email = kb.contactEmail;

      if (r.type === "fallback") {
        if (typeof options.onMiss === "function") options.onMiss(String(input));   // collect gaps
        return { answer: kb.fallback.answer, followups: freshChips(kb.fallback.followups, lastEntity, "fallback", 3), match: r.matchInfo || { type: "fallback", score: r.score } };
      }

      if (r.type === "which-project") {
        return { answer: kb.whichProjectAnswer, followups: freshChips(EXPLORE.slice(0, 5), null, "", 4), match: { type: "which-project", score: r.score } };
      }

      if (r.type === "intent") {
        let it = r.it;
        if (shown.has(it.id)) {
          const alt = r.alts.find(a => !shown.has(a.id));
          if (alt) it = alt;
          else return { answer: kb.repeatAnswer, followups: freshChips([], lastEntity, it.id, 3),
                        match: { type: "repeat", id: it.id, score: r.score } };
        }
        shown.add(it.id);
        return { answer: it.answer, followups: freshChips(it.followups || [], lastEntity, it.id),
                 match: { type: "intent", id: it.id, score: r.score } };
      }

      // Project answers
      const e = r.e, ans = e.answers;
      lastEntity = e;
      const wanted = r.aspect;
      const onlyOverview = Object.keys(ans).length === 1;
      if (wanted && (wanted === "unknown" || (!ans[wanted] && !onlyOverview))) {
        // Honest: we don't have this detail for this project.
        const label = (kb.aspectLabels || {})[wanted] || "that";
        return { answer: `I don't have details about ${label} for ${e.name || e.label}. 🪲 You can get in touch with Vishnu at **${email}** to know more.`,
                 followups: freshChips(entityChips(e), e, "", 3), match: { type: "unknown-detail", id: e.id, aspect: wanted, score: r.score } };
      }
      const aspect = wanted && ans[wanted] ? wanted : "overview";
      const key = e.id + ":" + aspect;
      if (shown.has(key)) {
        return { answer: `I've shared that about ${e.name || e.label} above ☝️ What else would you like to know?`,
                 followups: freshChips(entityChips(e), e, key, 4), match: { type: "repeat", id: e.id, aspect, score: r.score } };
      }
      shown.add(key);
      const chips = aspect === "overview" || ORDER.includes(aspect) ? entityChips(e) : [];
      return { answer: ans[aspect], followups: freshChips(chips, e, key, 4), match: { type: "entity", id: e.id, aspect, score: r.score } };
    }

    /** Which answer a question would get, without changing the conversation (for tests / debugging). */
    function peek(input) { const r = route(input, lastEntity); return keyOf(r); }

    function reset() { lastEntity = null; shown.clear(); }
    return { ask, peek, reset, normalize };
  };
});
