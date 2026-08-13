import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MemWal } from "@mysten-incubation/memwal";

const creds = JSON.parse(
  fs.readFileSync(path.join(os.homedir(), ".memwal", "credentials.json"), "utf8"),
);
const NS = "prompt-evolution::decision::prompt-choice";

const mw = MemWal.create({
  key: creds.delegatePrivateKey,
  accountId: creds.accountId,
  serverUrl: creds.relayerUrl,
  namespace: NS,
});

console.log("DEDUP CALIBRATION — read-only, no writes, no cost");
console.log("namespace:", NS, "\n");

// §4 measures: distance from a CANDIDATE RECORD'S OWN TEXT to its nearest neighbour.
const cases = [
  ["A. VERBATIM duplicate (exact text of an existing record)",
   "[canon:decision|rejected|2026-08-12] prompt-choice — BuildMEM Agent rejected as the evolution target: the author wrote it, and the rules bar original creators from evolving their own prompt. (as of: session 2026-08-12 canon seed)"],

  ["B. REWORDED duplicate (same claim, different words)",
   "[canon:decision|rejected|2026-08-12] prompt-choice — BuildMEM Agent is not eligible as the evolution target because the submitter is its original author and the rules forbid evolving your own prompt. (as of: session 2026-08-12 canon seed)"],

  ["C. SAME ENTITY, DIFFERENT CLAIM",
   "[canon:decision|settled|2026-08-12] prompt-choice — the submission deadline for the prompt-choice decision is 24 August 2026 at 14:00 UTC. (as of: session 2026-08-12 canon seed)"],

  ["D. UNRELATED (different project entirely)",
   "[canon:rule|current|2026-08-12] caution-fee-custody — the caution fee never enters the landlord's custody; it is held in escrow and returns to the tenant automatically after 7 days. (as of: launch kit v1)"],

  ["E. TOTALLY UNRELATED (no shared domain)",
   "The migratory patterns of arctic terns span roughly seventy thousand kilometres each year."],
];

const nearest = {};

for (const [label, text] of cases) {
  try {
    const r = await mw.recall({ query: text, topK: 3, maxDistance: 0.99 });
    const hits = r.results ?? [];
    const d = hits.length ? hits[0].distance : null;
    nearest[label[0]] = d;
    console.log(label);
    console.log(`   nearest d = ${d === null ? "no hits" : d.toFixed(4)}   (${hits.length} hits)`);
    if (hits[0]) console.log(`   matched: ${String(hits[0].text ?? "").slice(0, 88)}`);
    console.log();
  } catch (e) {
    console.log(label, "\n   FAILED:", e.message, "\n");
  }
}

console.log("=".repeat(64));
const dup = nearest.A, unrel = nearest.E ?? nearest.D;
if (dup != null && unrel != null) {
  console.log(`known-duplicate  (A): ${dup.toFixed(4)}`);
  console.log(`known-unrelated  (E): ${unrel.toFixed(4)}`);
  const span = unrel - dup;
  console.log(`\nsuggested bands (thirds of the observed span):`);
  console.log(`  SKIP      d < ${(dup + span / 3).toFixed(3)}`);
  console.log(`  DECIDE    ${(dup + span / 3).toFixed(3)} – ${(dup + (2 * span) / 3).toFixed(3)}`);
  console.log(`  AMBIGUOUS ${(dup + (2 * span) / 3).toFixed(3)} – ${unrel.toFixed(3)}`);
  console.log(`  WRITE     d >= ${unrel.toFixed(3)}`);
  console.log(`\nv2 defaults for comparison:  skip <0.25 | decide 0.25-0.55 | ambiguous 0.55-0.70 | write >=0.70`);
}
console.log("=".repeat(64));
