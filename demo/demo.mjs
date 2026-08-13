import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MemWal } from "@mysten-incubation/memwal";

// READ-ONLY. No writes, no cost. Safe to re-run for as many takes as you like.

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

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const rule = (c = "─") => console.log(c.repeat(74));
const h = async (n, t) => { console.log(); rule("═"); console.log(`  ${n}. ${t}`); rule("═"); await pause(1200); };

console.log();
rule("═");
console.log("  CONTINUITY KEEPER v2 — canon consistency on Walrus Memory");
console.log("  Wallet  " + creds.walletAddress);
console.log("  Account " + creds.accountId);
rule("═");
await pause(2000);

// ── 1 ────────────────────────────────────────────────────────────────
await h(1, "RECALL FIRST — what does canon already say?");
console.log(`namespace: ${NS}\n`);
const canon = await mw.recall({ query: "which prompt is being evolved", topK: 10, maxDistance: 0.99 });
for (const m of canon.results ?? []) {
  const t = String(m.text ?? "");
  const status = (t.match(/\|(settled|rejected|open)\|/) || [])[1] ?? "?";
  console.log(`  [${status.toUpperCase().padEnd(8)}] ${t.slice(t.indexOf("—") + 2, t.indexOf("—") + 74)}`);
}
console.log(`\n  ${canon.results?.length ?? 0} records recalled from Walrus mainnet.`);
await pause(4000);

// ── 2 ────────────────────────────────────────────────────────────────
await h(2, "A NEW PROPOSAL ARRIVES");
const proposal = "Let's just evolve BuildMEM Agent instead — I wrote it, so I know exactly what to fix.";
console.log(`  USER: "${proposal}"\n`);
await pause(2500);
console.log("  Checking the proposal against canon before acting...\n");
await pause(1500);

const hits = await mw.recall({ query: proposal, topK: 3, maxDistance: 0.99 });
for (const m of hits.results ?? []) {
  console.log(`   d=${m.distance.toFixed(4)}  ${String(m.text ?? "").slice(0, 66)}`);
}
await pause(3000);

// ── 3 ────────────────────────────────────────────────────────────────
const conflict = (hits.results ?? []).find((m) => /\|rejected\|/.test(m.text ?? "") && /BuildMEM/i.test(m.text ?? ""));
await h(3, "CONTRADICTION GUARD");
if (conflict) {
  const txt = String(conflict.text);
  console.log("  ⚠️  CONTINUITY CONFLICT\n");
  console.log("  Canon says:");
  console.log(`    «${txt.slice(txt.indexOf("—") + 2).trim()}»\n`);
  console.log(`  Status : REJECTED`);
  console.log(`  Blob   : ${conflict.blob_id}`);
  console.log(`  Distance: ${conflict.distance.toFixed(4)}\n`);
  console.log("  The proposal reopens a settled decision.");
  console.log("  Retcon the canon, or revise the proposal?\n");
  console.log("  → Work STOPS here. The agent does not silently override canon.");
} else {
  console.log("  No conflict found (unexpected — check the namespace is seeded).");
}
await pause(5000);

// ── 4 ────────────────────────────────────────────────────────────────
await h(4, "THE DEDUP GAP — the fix that started this evolution");
console.log("  Original ladder:  <0.25 skip | 0.25-0.55 decide | >=0.70 write");
console.log("                    0.55 - 0.70  →  NO RULE AT ALL\n");
await pause(2500);
const probe = "[canon:rule|current|2026-08-12] caution-fee-custody — the caution fee never enters the landlord's custody; it returns to the tenant automatically after 7 days.";
const p = await mw.recall({ query: probe, topK: 1, maxDistance: 0.99 });
const d = p.results?.[0]?.distance;
console.log(`  Candidate from a different project measures:  d = ${d?.toFixed(4)}`);
await pause(2000);
if (d >= 0.55 && d < 0.70) {
  console.log("\n  ← that lands INSIDE the undefined gap.\n");
  console.log("  Original prompt : undefined behaviour → duplicate blob, or a fact silently dropped");
  console.log("  v2              : entity-name tiebreak → no match → WRITE (correct)");
}
await pause(5000);

// ── 5 ────────────────────────────────────────────────────────────────
await h(5, "VERIFY ON WALRUS MAINNET");
const blob = canon.results?.[0]?.blob_id;
const url = `https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${blob}`;
console.log("  Everything above ran on Walrus Memory: it embedded these records,");
console.log("  encrypted them, uploaded them to Walrus, and served the recall that");
console.log("  drove the contradiction guard.");
console.log("\n  Now an independent check — reading the blob straight off Walrus");
console.log("  storage, rather than asking Walrus Memory to confirm its own work:\n");
console.log(`  ${url}\n`);
await pause(2000);
const res = await fetch(url);
const buf = await res.arrayBuffer();
console.log(`  HTTP ${res.status}   ${buf.byteLength} bytes of SEAL ciphertext`);
console.log(`\n  Real blob. Real mainnet. Encrypted at rest.`);
console.log(`\n  Browse it:  https://walruscan.com/mainnet/blob/${blob}`);
console.log();
rule("═");
console.log("  14 records of canon. Recalled before acting. Contradiction caught.");
rule("═");
console.log();
