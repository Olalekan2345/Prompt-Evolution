// Record one canon fact from the command line, with §4 dedup and §5 supersession.
//
//   node remember.mjs --ns rentpact::decision::pricing \
//        "pricing — tenants pay no platform fee; revenue is a 0.5% landlord release fee"
//
//   node remember.mjs --ns rentpact::decision::arbiter-selection --status settled \
//        --supersedes "who arbiters are, how they are selected" \
//        "arbiter-selection — arbiters are drawn from a vetted pool of three, paid a flat fee per case"
//
// Flags:
//   --ns <namespace>     required
//   --status <s>         settled | open | rejected | current   (default: inferred)
//   --supersedes "<...>" distinctive words of the record being replaced (§5)
//   --dry                show what would be written, write nothing
//
// Type is inferred from the namespace. Dedup runs before every write:
// nearest distance below 0.25 means it is already canon and the write is skipped.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MemWal } from "@mysten-incubation/memwal";

const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf(`--${name}`); return i === -1 ? null : argv[i + 1]; };
const has = (name) => argv.includes(`--${name}`);

const ns = flag("ns");
const supersedes = flag("supersedes");
const DRY = has("dry");

// Everything not consumed by a flag is the fact text.
const consumed = new Set();
for (const n of ["ns", "status", "supersedes"]) {
  const i = argv.indexOf(`--${n}`);
  if (i !== -1) { consumed.add(i); consumed.add(i + 1); }
}
argv.forEach((a, i) => { if (a === "--dry") consumed.add(i); });
const text = argv.filter((_, i) => !consumed.has(i)).join(" ").trim();

if (!ns || !text) {
  console.log('usage: node remember.mjs --ns <namespace> [--status <s>] [--supersedes "<words>"] [--dry] "<entity> — <fact>"');
  process.exit(1);
}

// Infer type from the namespace: {project}::{type}::{slug}, or events/meta/timeline.
const parts = ns.split("::");
let type = parts.length >= 3 ? parts[1] : parts[1] ?? "event";
if (["events", "timeline", "relationships"].includes(type)) type = type.replace(/s$/, "");
if (type === "meta") type = "term";

const VALID = ["char", "place", "object", "rule", "term", "decision", "event", "relationship", "timeline"];
if (!VALID.includes(type)) {
  console.log(`Cannot infer a valid type from "${ns}" (got "${type}"). Expected {project}::{type}::{slug}.`);
  process.exit(1);
}

const status = flag("status") ?? (type === "decision" ? "settled" : "current");
const today = new Date().toISOString().slice(0, 10);

let record = `[canon:${type}|${status}|${today}] ${text} (as of: session ${today})`;
if (supersedes) record += `\nsupersedes: ${supersedes}`;

const creds = JSON.parse(
  fs.readFileSync(path.join(os.homedir(), ".memwal", "credentials.json"), "utf8"),
);
const mw = MemWal.create({
  key: creds.delegatePrivateKey,
  accountId: creds.accountId,
  serverUrl: creds.relayerUrl,
  namespace: ns,
});

console.log(`\nnamespace: ${ns}`);
console.log(`type: ${type}   status: ${status}${supersedes ? "   SUPERSEDES a previous record" : ""}`);
console.log(`\n${record}\n`);

// §4 — dedup on the candidate's own text.
let nearest = null;
for (let a = 0; a < 4; a++) {
  try {
    const r = await mw.recall({ query: record, topK: 1, maxDistance: 0.99 });
    nearest = r.results?.[0]?.distance ?? Infinity;
    break;
  } catch (e) {
    if (/429|rate limit/i.test(String(e.message)) && a < 3) {
      await new Promise((r) => setTimeout(r, 3000 * (a + 1)));
    } else { console.log(`dedup recall failed: ${String(e.message).slice(0, 70)}`); break; }
  }
}

if (nearest === null) {
  console.log("ABORTED: could not verify whether this already exists (recall failed, not empty).");
  console.log("Refusing to write rather than risk a duplicate on append-only storage.");
  process.exit(1);
}

console.log(`nearest existing record: d=${nearest === Infinity ? "none" : nearest.toFixed(4)}`);
if (nearest < 0.25 && !supersedes) {
  console.log("SKIP — below 0.25, this is already canon. Nothing written.\n");
  process.exit(0);
}
if (nearest < 0.55 && !supersedes) {
  console.log("NOTE — same subject, different claim. Writing as a new fact.");
  console.log("       If this REPLACES an existing record, re-run with --supersedes instead.\n");
}

if (DRY) { console.log("(dry run — nothing written)\n"); process.exit(0); }

const r = await mw.rememberAndWait(record, ns, { timeoutMs: 120_000 });
console.log(`\n✓ canon: ${text.split("—")[0].trim()} → blob ${r.blob_id}`);

// Append to the receipts file — nothing enumerates blobs, so this is the only inventory.
const RECEIPTS = path.resolve(process.cwd(), "..", "walrus-receipts.md");
try {
  const line = `| \`${r.blob_id}\` | \`${ns}\` | ${today}${supersedes ? " (supersedes earlier record)" : ""} |\n`;
  const marker = "\n## Daily log\n\n| blob_id | namespace | date |\n|---|---|---|\n";
  let doc = fs.readFileSync(RECEIPTS, "utf8");
  if (!doc.includes("## Daily log")) doc += marker;
  fs.writeFileSync(RECEIPTS, doc + line, "utf8");
  console.log(`  recorded in walrus-receipts.md`);
} catch (e) {
  console.log(`  ⚠ could not update walrus-receipts.md — record this blob ID manually: ${r.blob_id}`);
}
console.log();
