// Builds dist/nyrro.bundle.js: knowledge base + matcher + safe Markdown→HTML, in ONE locked file,
// plus a fingerprint so anyone can verify the site is serving the approved answers unchanged.
const fs = require("fs"), crypto = require("crypto");
const kbText = fs.readFileSync("../nyrro-knowledge-base.json", "utf8");
const kb = JSON.parse(kbText);
const canonical = JSON.stringify(kb);
const fingerprint = crypto.createHash("sha256").update(canonical).digest("hex").slice(0, 16);
const matcher = fs.readFileSync("../nyrro-matcher.js", "utf8");

// Golden answers: question → sha of the exact answer text. The self-test compares against these.
const createNyrro = require("../nyrro-matcher.js");
const GOLD_Q = ["hi", "What are his core skills?", "What tools does he use?", "Who is Vishnu?", "How many years of experience?",
  "What has he worked on?", "How does he design?", "What makes his approach unique?", "What AI work has he done?",
  "Tell me about Enterprise Search", "Tell me about ADEO", "Tell me about the Agent Workforce Platform", "Tell me about HDFC Bank",
  "Tell me about the Sony platforms", "How can I contact him?", "What is his salary?", "did he work at google", "what are his strengths"];
const sha = s => crypto.createHash("sha256").update(s).digest("hex").slice(0, 12);
const gold = GOLD_Q.map(q => { const n = createNyrro(kb); return [q, sha(n.ask(q).answer)]; });

const out = `/*! Nyrro ${kb.version} — Vishnu Prasad K P's portfolio assistant. LOCKED BUILD: do not edit by hand.
 *  Content fingerprint: ${fingerprint}
 *  Rebuild with: cd build && python3 build.py && node make_bundle.js
 *
 *  Usage (browser):   load nyrro.bundle.js with a normal script tag, then:
 *                     const bot = Nyrro.create();              // one per chat session
 *                     const r = bot.ask("What are his skills?");
 *                     // r.html      → safe HTML to put in the message bubble
 *                     // r.answer    → same answer as Markdown
 *                     // r.followups → up to 4 suggested questions (render as clickable chips → bot.ask(text))
 *                     bot.reset();                              // when the visitor starts a new chat
 *  Usage (ESM/bundler): import Nyrro from "./nyrro.bundle.js"
 *  Verify:            Nyrro.selfTest()  → { ok: true, fingerprint: "${fingerprint}" }
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Nyrro = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var KB = ${canonical};
  var FINGERPRINT = "${fingerprint}";
  var GOLD = ${JSON.stringify(gold)};
  var module = undefined, exports = undefined;   // keep the inner matcher from exporting itself
  var createNyrro = (function () { var self = {}; ${matcher.replace(/typeof self !== "undefined" \? self : this/, "self")}; return self.createNyrro; })();

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function inline(s) {
    return esc(s)
      .replace(/\\[([^\\]]+)\\]\\((https?:[^)\\s]+)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\\*\\*([^*]+)\\*\\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*\\w])_([^_]+)_(?=$|[^\\w])/g, "$1<em>$2</em>")
      .replace(/(^|[^*])\\*([^*\\s][^*]*)\\*/g, "$1<em>$2</em>");
  }
  /** Markdown subset → safe HTML (paragraphs, bold, italic, links, bullet and numbered lists). */
  function toHTML(md) {
    var out = [], list = null, lines = String(md).split("\\n");
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].replace(/\\s+$/, ""), m;
      if ((m = l.match(/^\\s*[-•]\\s+(.*)/))) { if (list !== "ul") { if (list) out.push("</" + list + ">"); out.push("<ul>"); list = "ul"; } out.push("<li>" + inline(m[1]) + "</li>"); continue; }
      if ((m = l.match(/^\\s*\\d+\\.\\s+(.*)/))) { if (list !== "ol") { if (list) out.push("</" + list + ">"); out.push("<ol>"); list = "ol"; } out.push("<li>" + inline(m[1]) + "</li>"); continue; }
      if (list) { out.push("</" + list + ">"); list = null; }
      if (l.trim()) out.push("<p>" + inline(l) + "</p>");
    }
    if (list) out.push("</" + list + ">");
    return out.join("");
  }
  function sha12(s) {   // tiny sync SHA-256 (for selfTest only)
    function r(n, x) { return (x >>> n) | (x << (32 - n)); }
    var K = [], H = [], p = 2, c = 0;
    function frac(x) { return ((x - Math.floor(x)) * 4294967296) | 0; }
    while (c < 64) { var isP = true; for (var f = 2; f * f <= p; f++) if (p % f === 0) { isP = false; break; } if (isP) { if (c < 8) H[c] = frac(Math.pow(p, 1 / 2)); K[c] = frac(Math.pow(p, 1 / 3)); c++; } p++; }
    var bytes = unescape(encodeURIComponent(s)), words = [], L = bytes.length * 8;
    for (var i = 0; i < bytes.length; i++) words[i >> 2] |= bytes.charCodeAt(i) << (24 - (i % 4) * 8);
    words[L >> 5] |= 0x80 << (24 - L % 32); words[(((L + 64) >> 9) << 4) + 15] = L;
    for (var j = 0; j < words.length; j += 16) {
      var w = [], a = H.slice(0);
      for (var t = 0; t < 64; t++) {
        if (t < 16) w[t] = words[j + t] | 0;
        else { var s0 = r(7, w[t - 15]) ^ r(18, w[t - 15]) ^ (w[t - 15] >>> 3), s1 = r(17, w[t - 2]) ^ r(19, w[t - 2]) ^ (w[t - 2] >>> 10); w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0; }
        var t1 = (a[7] + (r(6, a[4]) ^ r(11, a[4]) ^ r(25, a[4])) + ((a[4] & a[5]) ^ (~a[4] & a[6])) + K[t] + w[t]) | 0;
        var t2 = ((r(2, a[0]) ^ r(13, a[0]) ^ r(22, a[0])) + ((a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]))) | 0;
        a = [(t1 + t2) | 0].concat(a.slice(0, 7)); a[4] = (a[4] + t1) | 0;
      }
      for (var k = 0; k < 8; k++) H[k] = (H[k] + a[k]) | 0;
    }
    return H.map(function (x) { return ("00000000" + (x >>> 0).toString(16)).slice(-8); }).join("").slice(0, 12);
  }

  return {
    version: KB.version,
    fingerprint: FINGERPRINT,
    /** Create one assistant per chat session. options.onMiss(question) is called for unanswered questions. */
    create: function (options) {
      var bot = createNyrro(KB, options || {});
      return {
        ask: function (q) { var r = bot.ask(q); return { answer: r.answer, html: toHTML(r.answer), followups: r.followups, match: r.match }; },
        reset: bot.reset
      };
    },
    toHTML: toHTML,
    /** Checks that answers are exactly the approved ones. */
    selfTest: function () {
      var bad = [];
      for (var i = 0; i < GOLD.length; i++) { var b = createNyrro(KB, {}); if (sha12(b.ask(GOLD[i][0]).answer) !== GOLD[i][1]) bad.push(GOLD[i][0]); }
      return { ok: bad.length === 0, fingerprint: FINGERPRINT, checked: GOLD.length, failed: bad };
    }
  };
});
`;
fs.mkdirSync("../dist", { recursive: true });
fs.writeFileSync("../dist/nyrro.bundle.js", out);
console.log("bundle", (out.length / 1024).toFixed(0) + "KB", "fingerprint", fingerprint);
