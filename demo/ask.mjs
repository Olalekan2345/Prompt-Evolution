// Ask a natural-language question against canon on Walrus Memory.
//
//   node ask.mjs "what did we decide about the caution fee?"
//   node ask.mjs --ns rentpact::rule::caution-fee-custody "who holds it?"
//
// READ-ONLY. No writes, no cost.
//
// Implements §1 of Continuity Keeper v2: recall only the namespaces where an
// answer is actually possible, cap the number of recalls, back off on rate
// limits, and report skipped namespaces rather than silently omitting them.
// Fanning out across all namespaces gets you HTTP 429 — the relayer rate-limits
// recall, and a throttled call looks identical to an empty one.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MemWal } from "@mysten-incubation/memwal";

const RECALL_BUDGET = 8; // §1: cap entity recalls per turn

const argv = process.argv.slice(2);
let forcedNs = null;
const nsIdx = argv.indexOf("--ns");
if (nsIdx !== -1) { forcedNs = argv[nsIdx + 1]; argv.splice(nsIdx, 2); }
const question = argv.join(" ").trim();

if (!question) {
  console.log('usage: node ask.mjs "your question"');
  console.log('       node ask.mjs --ns <namespace> "your question"');
  process.exit(1);
}

const creds = JSON.parse(
  fs.readFileSync(path.join(os.homedir(), ".memwal", "credentials.json"), "utf8"),
);

const NAMESPACES = [
  "prompt-evolution::decision::prompt-choice",
  "prompt-evolution::decision::fiction-path",
  "prompt-evolution::decision::repo-separation",
  "prompt-evolution::decision::pinned-namespace",
  "prompt-evolution::decision::account-identity",
  "prompt-evolution::decision::write-path",
  "prompt-evolution::rule::namespace-hygiene",
  "prompt-evolution::meta",
  "prompt-evolution::events",
  "rentpact::rule::caution-fee-custody",
  "rentpact::rule::no-evidence-no-deduction",
  "rentpact::rule::evidence-immutability",
  "rentpact::rule::gasless-invariant",
  "rentpact::decision::market",
  "rentpact::decision::problem-frame",
  "rentpact::decision::chain",
  "rentpact::decision::currency",
  "rentpact::decision::cross-chain",
  "rentpact::decision::release-schedule",
  "rentpact::decision::caution-fee-return-window",
  "rentpact::decision::freeze-mechanism",
  "rentpact::decision::dispute-model",
  "rentpact::decision::dispute-trigger",
  "rentpact::decision::onboarding",
  "rentpact::decision::gas-model",
  "rentpact::decision::vertical-expansion",
  "rentpact::decision::arbiter-selection",
  "rentpact::decision::rental-credential",
  "rentpact::decision::bio-copy",
  "rentpact::decision::launch-positioning",
  "rentpact::term::caution-fee",
  "rentpact::term::escrow",
  "rentpact::term::freeze",
  "rentpact::term::move-in-baseline",
  "rentpact::term::arbiter",
  "rentpact::term::cctp",
  "rentpact::term::gas-station",
  "rentpact::char::tenant",
  "rentpact::char::landlord",
  "rentpact::char::arbiter",
  "rentpact::object::escrow-contract",
  "rentpact::object::evidence-bundle",
  "rentpact::object::rental-credential",
  "rentpact::place::arc",
  "rentpact::events",
];

// ── Pick candidate namespaces by name overlap. Free, local, no API calls. ──
const STOP = new Set(["the","a","an","what","why","did","do","we","our","is","are","was",
  "about","for","on","of","to","and","or","in","it","that","this","how","who","when","decide","decided"]);
const words = question.toLowerCase().match(/[a-z]+/g)?.filter((w) => w.length > 2 && !STOP.has(w)) ?? [];

const scored = NAMESPACES.map((ns) => {
  const hay = ns.toLowerCase();
  let score = 0;
  for (const w of words) {
    if (hay.includes(w)) score += 3;
    // Crude stemming: "expanding" must reach "vertical-expansion", and
    // w.length-2 is too long a prefix to do it ("expandi" matches nothing).
    // A fixed 5-char prefix bridges most English inflections here.
    else if (w.length >= 5 && hay.includes(w.slice(0, 5))) score += 2;
    else if (w.length >= 4 && hay.includes(w.slice(0, 4))) score += 1;
  }
  return { ns, score };
}).sort((a, b) => b.score - a.score);

// Name-overlap alone is not enough: ::meta and ::events describe their contents
// poorly ("meta" shares no words with "dedup calibration"), yet often hold the
// answer. Always include them, then fill the rest of the budget by score.
const CATCH_ALL = NAMESPACES.filter((ns) => /::(meta|events)$/.test(ns));

let chosen;
if (forcedNs) {
  chosen = [forcedNs];
} else {
  const byScore = scored.filter((s) => s.score > 0).map((s) => s.ns);
  const merged = [...new Set([...byScore, ...CATCH_ALL])];
  // Pad with the next best names if scoring was too sparse to be useful.
  for (const s of scored) {
    if (merged.length >= RECALL_BUDGET) break;
    if (!merged.includes(s.ns)) merged.push(s.ns);
  }
  chosen = merged.slice(0, RECALL_BUDGET);
}
const skipped = NAMESPACES.length - chosen.length;

console.log(`\n❓ ${question}\n`);
console.log(`   recalling ${chosen.length} namespace(s) — the ones where an answer is plausible`);
for (const ns of chosen) console.log(`     · ${ns}`);
if (skipped > 0) console.log(`   ⚠ recall budget: ${skipped} other namespaces not checked this turn`);
console.log();

// ── Recall, sequentially, with backoff on 429 ──
const hits = [];
const empty = [];
const failed = [];

for (const ns of chosen) {
  const mw = MemWal.create({
    key: creds.delegatePrivateKey,
    accountId: creds.accountId,
    serverUrl: creds.relayerUrl,
    namespace: ns,
  });
  let done = false;
  for (let attempt = 0; attempt < 3 && !done; attempt++) {
    try {
      const r = await mw.recall({ query: question, topK: 3, maxDistance: 0.80 });
      const n = r.results?.length ?? 0;
      if (n === 0) empty.push(ns);
      for (const m of r.results ?? []) hits.push({ ns, ...m });
      done = true;
    } catch (e) {
      const msg = String(e.message ?? e);
      if (/429|rate limit/i.test(msg) && attempt < 2) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      } else {
        failed.push([ns, msg.slice(0, 70)]);
        done = true;
      }
    }
  }
  await new Promise((r) => setTimeout(r, 400));
}

if (failed.length) {
  console.log(`⚠ ${failed.length} namespace(s) FAILED to respond — this is NOT "no canon found":`);
  for (const [ns, m] of failed) console.log(`   ${ns}\n     ${m}`);
  console.log();
}

hits.sort((a, b) => a.distance - b.distance);

if (!hits.length) {
  console.log("   No canon found in the namespaces checked.");
  if (failed.length) console.log("   NOTE: some recalls failed, so this answer is incomplete.");
  console.log();
  process.exit(0);
}

// Apply the calibrated bands measured in prompt-evolution::meta:
//   d < 0.55  → answers the question
//   0.55-0.70 → related, supporting context
//   d >= 0.70 → unrelated. Showing these as "answers" is noise.
const ANSWER = 0.55, RELATED = 0.70;

const fmt = (h) => {
  const t = String(h.text ?? "");
  const status = (t.match(/\|(settled|rejected|open|current)\|/) || [])[1] ?? "?";
  const body = t.slice(t.indexOf("—") + 2).trim();
  return { status: status.toUpperCase(), body, ns: h.ns, blob: h.blob_id, d: h.distance };
};

const answers = hits.filter((h) => h.distance < ANSWER).map(fmt);
const related = hits.filter((h) => h.distance >= ANSWER && h.distance < RELATED).map(fmt);
const noise = hits.filter((h) => h.distance >= RELATED);

if (answers.length) {
  const a = answers[0];
  console.log("═".repeat(78));
  console.log(`  ANSWER  [${a.status}]`);
  console.log("═".repeat(78));
  console.log(`\n  ${a.body}\n`);
  console.log(`  source : ${a.ns}`);
  console.log(`  blob   : ${a.blob}`);
  console.log(`  distance: ${a.d.toFixed(4)}\n`);

  if (answers.length > 1) {
    console.log("─".repeat(78));
    console.log("  ALSO IN CANON\n");
    for (const x of answers.slice(1, 4)) {
      console.log(`  [${x.status}] ${x.body.slice(0, 140)}${x.body.length > 140 ? "…" : ""}`);
      console.log(`         ${x.ns}  ·  d=${x.d.toFixed(4)}\n`);
    }
  }
} else if (related.length) {
  console.log("  No direct answer in canon, but related records exist:\n");
  for (const x of related.slice(0, 3)) {
    console.log(`  [${x.status}] ${x.body.slice(0, 140)}${x.body.length > 140 ? "…" : ""}`);
    console.log(`         ${x.ns}  ·  d=${x.d.toFixed(4)}\n`);
  }
} else {
  console.log("  No canon answers this question.");
  if (noise.length) console.log(`  (${noise.length} record(s) matched weakly at d>=${RELATED} — unrelated by the measured calibration.)`);
  console.log();
}

console.log("─".repeat(78));
console.log(`  ${answers.length} answer(s) · ${related.length} related · ${noise.length} unrelated · ${empty.length} namespace(s) empty · ${failed.length} failed`);
if (failed.length) console.log(`  ⚠ ${failed.length} recall(s) failed — this answer may be incomplete.`);
console.log();
