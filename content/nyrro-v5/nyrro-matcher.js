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
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[m][n];
  }

  // what is worked out once from a knowledge base (its vocabulary, its case studies' text), shared by every session
  const SHARED = typeof WeakMap === "function" ? new WeakMap() : null;

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

    // ── v7: understanding questions phrased in other words ──────────────────────
    // The synonym dictionary: each concept lists the ways one idea is phrased, and where it lives (a topic, a project,
    // or words to look for in the answers).
    const concepts = (kb.concepts || []).map(c => ({ ...c, _p: c.patterns.map(p => normalize(p).trim()),
                                                    _t: (c.terms || []).map(t => normalize(t).trim()) }));
    const intentById = Object.fromEntries(intents.map(it => [it.id, it]));
    const entityById = Object.fromEntries(entities.map(e => [e.id, e]));

    // Typo repair against Nyrro's own vocabulary: a word Nyrro doesn't know ("enterprize", "goverment") becomes the one
    // word it does know that is a single slip away (two for long words). Words that appear anywhere in its answers are
    // left alone, so real words are never "corrected".
    const shared = (SHARED && SHARED.get(kb)) || (() => {
      const VOCAB = new Set(), KNOWN = new Set(STOP);
      const words = (x, set) => { for (const w of normalize(x).trim().split(" ")) if (w) set.add(w); };
      for (const e of entities) e.aliases.concat(e.weakAliases || [], e.contextAliases || [], [e.name || "", e.label || ""]).forEach(a => words(a, VOCAB));
      for (const it of intents) it.keywords.concat(it.questions).forEach(k => words(k, VOCAB));
      for (const kws of Object.values(kb.aspects)) kws.forEach(k => words(k.replace(/\*/g, " "), VOCAB));
      for (const c of concepts) c.patterns.forEach(p => words(p, VOCAB));
      VOCAB.forEach(w => KNOWN.add(w));
      for (const it of intents) words(it.answer, KNOWN);
      for (const e of entities) Object.values(e.answers).forEach(a => words(a, KNOWN));
      const x = { KNOWN, VOCAB_LIST: [...VOCAB].filter(w => w.length >= 4 && !/\d/.test(w)), fixCache: new Map(), caseText: null };
      if (SHARED) SHARED.set(kb, x);
      return x;
    })();
    const { KNOWN, VOCAB_LIST, fixCache } = shared;
    function correct(text) {
      return " " + tokens(text).map(w => {
        if (w.length < 5 || KNOWN.has(w) || /\d/.test(w)) return w;
        if (fixCache.has(w)) return fixCache.get(w);
        const tol = w.length >= 8 ? 2 : 1;
        let best = w, bd = tol + 1, tie = false;
        for (const v of VOCAB_LIST) {
          if (Math.abs(v.length - w.length) > tol || v[0] !== w[0] && v[1] !== w[1]) continue;
          const d = lev(w, v);
          if (d < bd) { bd = d; best = v; tie = false; } else if (d === bd && v !== best) tie = true;
        }
        const out = bd <= tol && !tie ? best : w;
        fixCache.set(w, out);
        return out;
      }).join(" ") + " ";
    }
    function conceptHits(text) {
      const hits = [];
      for (const c of concepts) {
        let best = 0;
        for (const p of c._p) if (text.includes(" " + p + " ")) best = Math.max(best, p.split(" ").length);
        if (best) hits.push({ c, len: best });
      }
      return hits.sort((a, b) => b.len - a.len);
    }

    // The case studies an answer talks about, in the order it names them (for "which project shows that?").
    const caseStudies = entities.filter(e => e.url && !e.parent);
    function projectsIn(answer) {
      const t = normalize(answer);
      return caseStudies.map(e => {
        const at = e._strong.concat([normalize(e.name || "").trim(), normalize(e.label || "").trim()]).filter(a => a.length > 3)
          .map(a => t.indexOf(" " + a + " ")).filter(i => i >= 0);
        return { e, at: at.length ? Math.min(...at) : -1 };
      }).filter(x => x.at >= 0).sort((a, b) => a.at - b.at).map(x => x.e);
    }
    // When an answer names no case study, the case studies whose own text best covers the topic's keywords
    // (only for topics about his work, not, say, his education or how to contact him).
    const WORK = new Set(["skills", "process", "ai", "leadership", "work", "domain"]);
    const caseText = shared.caseText || (shared.caseText = new Map(caseStudies.map(e => [e.id, normalize(Object.values(e.answers).concat(
      entities.filter(c => c.parent === e.id).flatMap(c => Object.values(c.answers))).join(" "))])));
    function projectsFor(it, depth = 0) {
      const named = projectsIn(it.answer);
      const link = (kb.topicLinks || {})[it.id];
      if (!named.length && link && intentById[link] && depth < 2) return projectsFor(intentById[link], depth + 1);
      if (named.length || !WORK.has(it.category)) return named;
      const terms = [...new Set(it._kw.filter(k => k.length > 3 && !GENERIC.has(k) && !STOP.has(k)))];
      const scored = caseStudies.map(e => {
        const t = caseText.get(e.id);
        let sc = 0; for (const k of terms) if (t.includes(" " + k + " ")) sc += k.split(" ").length;
        return { e, sc };
      }).filter(x => x.sc >= 2).sort((a, b) => b.sc - a.sc);
      return scored.filter(x => x.sc >= scored[0]?.sc * 0.5).slice(0, 3).map(x => x.e);
    }
    // A project's title (its overview's first line) and the sentence that says what Vishnu did.
    function titleOf(e) {
      const m = (e.answers.overview || "").match(/^\*\*(.+?)\*\*/);
      return m ? m[1] : (e.name || e.label);
    }
    function sentences(x) { return x.replace(/\n+/g, " ").split(/(?<=[.!?])\s+(?=[A-Z*])/).map(z => z.trim()).filter(Boolean); }
    function gist(e) {
      const body = (e.answers.overview || "").split("\n\n").slice(1).find(p => !/^\s*[-\d]/.test(p)) || "";
      const ss = sentences(body);
      const i = ss.findIndex(z => /\bVishnu (designed|led|built)\b/.test(z));
      if (i < 0) return ss[0] || "";
      // ("…the platform that made it possible": the sentence before says what "it" is)
      return i > 0 && /\b(it|this|these)\b/.test(ss[i].replace(/^Vishnu \w+ /, "")) ? ss[i - 1] + " " + ss[i] : ss[i];
    }
    function facts(e) {
      const f = {};
      for (const m of (e.answers.overview || "").matchAll(/^- \*\*(Role|Client|Platform|Timeline|Partners):\*\* (.+)$/gm)) f[m[1]] = m[2].trim();
      return f;
    }
    const linked = e => e.url ? `[${titleOf(e)}](${e.url})` : (e.name || e.label);
    const EXAMPLE = / (which|what) (project|case study|one|ones|work|product|example) | example | examples | show me | where (has|did|can) (he|i) (do|done|did|use|used|apply|applied|see) | where can i see | demonstrat| proof | evidence | in practice | in action | real world /;
    const COMPARE = / (compare|comparison|compared|difference|different|differ|vs|versus|similar|similarity|alike|between) /;

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
      // Longer phrases shadow single words inside them: "information architecture" beats "architecture".
      const multi = [];
      for (const it of intents) for (const k of it._kw) if (k.includes(" ") && text.includes(" " + k + " ")) multi.push(k);
      const shadowed = w => multi.some(p => (" " + p + " ").includes(" " + w + " "));
      for (const it of intents) {
        let kw = 0;
        for (const k of it._kw) {
          const h = phraseHit(text, toks, k);
          if (!h) continue;
          const single = !k.includes(" ");
          const w = GENERIC.has(k) ? 0.5 : single && shadowed(k) && !it._kw.some(x => x.includes(" ") && text.includes(" " + x + " ")) ? 0.35
                  : h * (1 + 0.7 * (k.split(" ").length - 1));
          kw = Math.max(kw, w);
        }
        let qs = 0;
        if (ct.size) for (const q of it._q) {
          if (!q.size) continue;
          let inter = 0; for (const w of ct) if (q.has(w)) inter++;
          const sim = (inter / Math.max(q.size, ct.size)) * (inter === 1 ? 0.6 : 1);   // overlap with sample phrasing (one shared word counts less)
          qs = Math.max(qs, sim);
        }
        const score = kw + qs * 2.5;
        if (score > 0) res.push({ it, score, kw });
      }
      return res.sort((a, b) => b.score - a.score);
    }

    // ── Routing: decide what a question is about (no side effects) ──────────────
    function route(input, ctxEntity, ctxTopic) {
      // ("can he design systems that automate…": "design" is the verb there, not "design systems")
      const text = correct(normalize(input)).replace(/ design system (that|which|to|for|where) /g, " design product $1 ");
      const toks = tokens(text);
      if (!toks.length) return { type: "fallback", score: 0 };

      const ents = findEntities(text, toks, ctxEntity);
      const hits = conceptHits(text);
      // a concept that points at a project counts as naming it
      for (const h of hits) if (h.c.entity && entityById[h.c.entity] && !ents.some(f => f.e.id === h.c.entity))
        ents.push({ e: entityById[h.c.entity], score: 3 + 0.3 * h.len, hit: h.c._p[0], hits: [], concept: true });
      ents.sort((a, b) => b.score - a.score);
      // two projects with a comparing word: compare them
      const named = ents.filter((f, i) => f.score >= 2 && !f.concept && ents.findIndex(g => g.e.id === f.e.id) === i);
      const pair = named.filter(f => !named.some(g => g !== f && (f.e.parent === g.e.id)));
      if (pair.length >= 2 && (COMPARE.test(text) || / and /.test(text) && / (both|two) /.test(text)))
        return { type: "compare", id: pair[0].e.id + "+" + pair[1].e.id, a: pair[0].e, b: pair[1].e, score: +Math.min(pair[0].score, pair[1].score).toFixed(2) };

      // Remove project names before reading the aspect ("cash ai" is a name, not the "ai" aspect).
      let aspectText = text;
      for (const f of ents) for (const h of f.hits.filter(h => f.e._strong.includes(h)).sort((a, b) => b.length - a.length))
        aspectText = aspectText.replace(" " + h + " ", " ");
      const aspect = findAspect(aspectText, tokens(aspectText));
      const ints = scoreIntents(text, toks);
      const rawTop = ints[0] ? ints[0].score : 0;
      // concepts that point at a topic lift it, as a strong two-word keyword would (a "weak" concept only when nothing
      // else in the question matched)
      for (const h of hits) {
        if (!h.c.intent || !intentById[h.c.intent]) continue;
        if (h.c.weak && ints.some(y => y.it.id !== h.c.intent && y.score >= 1)) continue;
        // a topic that matched a phrase of its own as long or longer keeps it ("b2b saas", "other ai agents")
        if (ints.some(y => y.it.id !== h.c.intent && y.kw >= 1.7 && y.kw > 1 + 0.7 * (h.len - 1))) continue;
        const x = ints.find(y => y.it.id === h.c.intent);
        if (x) { x.score += 1.6 + 0.3 * h.len; x.kw = Math.max(x.kw, 1.7); }
        else ints.push({ it: intentById[h.c.intent], score: 2 + 0.3 * h.len, kw: 1.7 });
      }
      ints.sort((a, b) => b.score - a.score);
      const topI = ints[0];
      // "which project shows that?", "show me an example": the projects behind what was just discussed (unless the
      // question clearly asks for something else, like "show me his apps")
      if (ctxTopic && !named.length && EXAMPLE.test(text) && rawTop < 2.2)
        return { type: "examples", id: ctxTopic.id, topic: ctxTopic, score: 2 };
      // things Nyrro has no information on ("his favourite food"): say so rather than force a weak match
      const unknown = hits.find(h => h.c.fallback);
      if (unknown && !(ents[0] && ents[0].score >= 3) && !ints.some(y => y.kw >= 1.7)) return { type: "fallback", score: 0, unknown: true };
      // an idea that lives in the answers rather than in one topic ("low-code"): list where it shows up in his work
      const look = hits.find(h => h.c._t.length);
      if (look && !(ents[0] && ents[0].score >= 3 && !ents[0].concept) && !(topI && topI.score >= 3.5)) return { type: "evidence", id: look.c.id, c: look.c, score: 2 };
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
      const aboutHim = / (he|his|him|vishnu) /.test(text);
      // a general question about him ("what are his design principles?") stays general even while a project is being
      // discussed, unless it points back at the project ("what was his role there?")
      const general = aboutHim && topI && topI.score >= 1.2 && !/ (was|were|did|it|this|that|its|there|project|platform) /.test(text);
      if (ctxEntity && aspect.score && !general && (!topI || topI.score < 2.2 || refersBack)) return { ...asEntity(ctxEntity, aspect.score), followUp: true };
      // 3b. Project-style question but no project named yet ("what was the problem?").
      if (!ctxEntity && !aboutHim && ["problem", "users", "outcomes", "features", "decisions", "learnings", "ai"].includes(aspect.id)
          && (!topI || topI.score < 1.2) && refersBack) return { type: "which-project", score: aspect.score };
      // 4. General question (needs real confidence, otherwise say "I don't know").
      if (topI && topI.score >= (options.minScore || 0.95)) return asIntent(topI);
      return { type: "fallback", score: topI ? +topI.score.toFixed(2) : 0 };
    }

    // ── Conversation state: avoid repeating, keep suggestions fresh ─────────────
    let lastEntity = null;
    let lastTopic = null;   // the last general topic (or idea) discussed, for "which project shows that?"
    const shown = new Set();
    const ASK = { problem: "What was the problem?", users: "Who were the users?", strategy: "What was the approach?",
                  features: "What are the key features?", outcomes: "What was the outcome?", ai: "How is AI used?",
                  decisions: "What were the key decisions?", learnings: "What did he learn?", role: "What was his role?",
                  voting: "How did voting work?" };
    const ORDER = ["problem", "users", "strategy", "features", "ai", "outcomes", "decisions", "voting", "learnings", "role"];
    const EXPLORE = kb.exploreChips || [];
    const keyOf = r => r.type === "intent" ? r.id : r.type === "entity" ? r.id + ":" + (r.aspect && r.e.answers[r.aspect] ? r.aspect : "overview")
                     : r.type === "fallback" || r.type === "which-project" ? "fallback" : r.type + ":" + r.id;

    function freshChips(candidates, ctx, currentKey, max = 4) {
      const out = [], seen = new Set([currentKey]);
      // after the answer's own suggestions, a varied mix picked at random each time: questions about him (his approach,
      // experience, skills, principles, life outside work) as well as his projects, with no more than two projects
      const pool = EXPLORE.slice();
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
      let projects = candidates.filter(c => /^Tell me about /i.test(c)).length;
      for (const c of candidates.concat(pool)) {
        if (out.length >= max) break;
        const own = candidates.includes(c);
        if (!own && /^Tell me about /i.test(c) && projects >= 2) continue;
        const k = keyOf(route(c, ctx));
        if (k === "fallback" || shown.has(k) || seen.has(k)) continue;
        seen.add(k); out.push(c);
        if (!own && /^Tell me about /i.test(c)) projects++;
      }
      return out;
    }
    function entityChips(e) {
      return ORDER.filter(a => e.answers[a] && !shown.has(e.id + ":" + a)).map(a => ASK[a]);
    }

    // ── v7 answers, put together from the knowledge base's own words ───────────
    const pick = (arr, seed) => arr[Math.abs([...String(seed)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7)) % arr.length];
    const CHIP = { "enterprise-search": "Enterprise Search", "agent-workforce": "the Agent Workforce Platform", adeo: "ADEO", hdfc: "HDFC Bank", sony: "the Sony platforms" };
    const tellChip = e => "Tell me about " + (CHIP[e.id] || e.name || e.label);

    function examplesAnswer(topic) {
      const list = topic.projects.slice(0, 3);
      if (!list.length) return null;
      const head = pick(["These case studies show it best:", "You can see it in these case studies:", "Where it shows up in his work:"], topic.id);
      const lines = list.map(e => `- **${linked(e)}:** ${gist(e)}`);
      return { answer: head + "\n\n" + lines.join("\n"), chips: list.map(tellChip) };
    }

    function evidenceAnswer(c) {
      const found = [];
      for (const e of entities) {
        for (const a of ["overview"].concat(Object.keys(e.answers).filter(k => k !== "overview"))) {
          const line = (e.answers[a] || "").split("\n").map(l => l.replace(/^\s*(?:[-•]|\d+\.)\s+/, "").trim())
            .find(l => c._t.some(t => normalize(l).includes(" " + t + " ")));
          if (line) { found.push({ e, line }); break; }
        }
      }
      if (!found.length) return null;
      found.sort((x, y) => (y.e.url ? 1 : 0) - (x.e.url ? 1 : 0));
      const top = found.slice(0, 3);
      const lines = top.map(({ e, line }) => {
        const own = line.replace(/^\*\*[^*]+\*\*\s*(is|was)\s+/, "");
        return `- **${linked(e)}:** ${own.charAt(0).toUpperCase() + own.slice(1)}`;
      });
      return { answer: `Here's where Vishnu's work touches **${c.label}**:\n\n` + lines.join("\n"),
               projects: top.map(x => x.e), chips: top.map(x => tellChip(x.e)) };
    }

    function compareAnswer(a, b) {
      const fa = facts(a), fb = facts(b);
      const part = (e, f) => [`**${linked(e)}**`, gist(e)]
        .concat(["Client", "Platform", "Timeline"].filter(k => f[k]).map(k => `- **${k}:** ${f[k]}`)).join("\n");
      const same = [];
      const both = re => re.test(a.answers.overview || "") && re.test(b.answers.overview || "");
      if (both(/UnifyApps/)) same.push("both were designed with **UnifyApps**, with ICD as design partner");
      if (fa.Role && fa.Role === fb.Role) same.push(`he had the same role on both: **${fa.Role.replace(/\.$/, "")}**`);
      if (fa.Platform && fa.Platform === fb.Platform) same.push(`both run on **${fa.Platform.replace(/\.$/, "")}**`);
      const common = same.length ? "\n\n**In common:** " + same.join("; ") + "." : "";
      return `Here are the two side by side.\n\n${part(a, fa)}\n\n${part(b, fb)}${common}`;
    }

    function ask(input) {
      const r = route(input, lastEntity, lastTopic);
      const email = kb.contactEmail;

      if (r.type === "compare") {
        lastEntity = null;
        lastTopic = { id: r.id, projects: [r.a, r.b] };
        return { answer: compareAnswer(r.a, r.b), followups: freshChips([tellChip(r.a), tellChip(r.b)], null, ""), match: { type: "compare", id: r.id, score: r.score } };
      }
      if (r.type === "examples") {
        const ex = examplesAnswer(r.topic);
        if (ex) return { answer: ex.answer, followups: freshChips(ex.chips, null, ""), match: { type: "examples", id: r.id, score: r.score } };
        return { answer: kb.whichProjectAnswer, followups: freshChips(EXPLORE.slice(0, 5), null, "", 4), match: { type: "which-project", score: r.score } };
      }
      if (r.type === "evidence") {
        const ev = evidenceAnswer(r.c);
        if (ev) {
          lastTopic = { id: r.c.id, projects: ev.projects };
          return { answer: ev.answer, followups: freshChips(ev.chips, null, ""), match: { type: "evidence", id: r.id, score: r.score } };
        }
        r.type = "fallback";
      }

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
        (it.covers || []).forEach(c => shown.add(c));
        lastTopic = { id: it.id, projects: projectsFor(it) };
        return { answer: it.answer, followups: freshChips(it.followups || [], lastEntity, it.id),
                 match: { type: "intent", id: it.id, score: r.score } };
      }

      // Project answers
      const e = r.e, ans = e.answers;
      lastEntity = e;
      lastTopic = null;
      const wanted = r.aspect;
      const onlyOverview = Object.keys(ans).length === 1;
      const parts = entities.filter(c => c.parent === e.id && c.answers.overview);
      if (wanted && ["ai", "features"].includes(wanted) && !ans[wanted] && parts.length) {
        const lines = parts.map(c => {
          const body = c.answers.overview.split("\n").slice(1).map(l => l.replace(/^\s*[-•]\s+/, "").trim()).filter(Boolean);
          const s1 = (wanted === "ai" && body.find(z => /\bAI\b/.test(z))) || body[0] || "";
          return `- **${titleOf(c).replace(/\s*\(.*\)$/, "")}:** ${s1.replace(/:$/, "")}`;
        });
        const key = e.id + ":" + wanted;
        shown.add(key);
        return { answer: `Here's ${wanted === "ai" ? "how AI is used" : "what each one does"} across ${e.name || e.label}:\n\n` + lines.join("\n"),
                 followups: freshChips(entityChips(e), e, key, 4), match: { type: "entity", id: e.id, aspect: wanted, score: r.score } };
      }
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
    function peek(input) { const r = route(input, lastEntity, lastTopic); return keyOf(r); }

    function reset() { lastEntity = null; lastTopic = null; shown.clear(); }
    return { ask, peek, reset, normalize };
  };
});
