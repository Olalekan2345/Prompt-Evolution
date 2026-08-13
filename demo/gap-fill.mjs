// Fills the 5 records the RentPact seed lost to rate limits and a timeout.
//
// Uses per-RECORD dedup (§4 of the prompt) rather than the seed's coarse
// per-NAMESPACE check — necessary because rentpact::decision::bio-copy already
// holds 2 of its 3 records, and a namespace-level skip would strand the third.
//
//   node gap-fill.mjs           → dry run
//   node gap-fill.mjs --write   → writes only what is genuinely missing

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MemWal } from "@mysten-incubation/memwal";

const WRITE = process.argv.includes("--write");
const D = "2026-08-12";
const AS = "(as of: launch kit v1)";
const SKIP_BELOW = 0.25; // measured calibration: verbatim dup = 0.0000, reworded dup = 0.0421

const creds = JSON.parse(
  fs.readFileSync(path.join(os.homedir(), ".memwal", "credentials.json"), "utf8"),
);

const MISSING = [
  ["rentpact::rule::caution-fee-custody", `[canon:rule|current|${D}] caution-fee-custody — the caution fee never enters the landlord's custody at any point in the lease lifecycle; it is held in escrow and returns to the tenant automatically. Any design in which the landlord holds, controls or routes the caution fee violates the product's core premise. ${AS}`],
  ["rentpact::decision::bio-copy", `[canon:decision|rejected|${D}] bio-copy — Option C (short form, "USDC rent escrow on Arc") rejected in favour of the problem-first framing. ${AS}`],
  ["rentpact::term::cctp", `[canon:term|current|${D}] cctp — Circle's Cross-Chain Transfer Protocol, the path by which deposits from other chains reach Arc for settlement. ${AS}`],
  ["rentpact::place::arc", `[canon:place|current|${D}] arc — Circle's stablecoin-native L1; RentPact's settlement chain and architectural hub. Other chains connect inward via CCTP. ${AS}`],
  ["rentpact::events", `[canon:event|current|${D}] launch-kit — the RentPact X launch kit v1 was finalised, comprising bio options, six thread sections and the pinned introduction post. ${AS}`],
];

const client = (ns) => MemWal.create({
  key: creds.delegatePrivateKey,
  accountId: creds.accountId,
  serverUrl: creds.relayerUrl,
  namespace: ns,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`\nGap fill — ${MISSING.length} records`);
console.log(WRITE ? "MODE: WRITE\n" : "MODE: DRY RUN (add --write)\n");

const written = [];
for (const [ns, text] of MISSING) {
  console.log(`${ns}`);

  // §4 dedup: recall the candidate's OWN text and read the nearest distance.
  let nearest = null;
  for (let a = 0; a < 4; a++) {
    try {
      const r = await client(ns).recall({ query: text, topK: 1, maxDistance: 0.99 });
      nearest = r.results?.[0]?.distance ?? Infinity;
      break;
    } catch (e) {
      if (/429|rate limit/i.test(String(e.message)) && a < 3) { await sleep(3000 * (a + 1)); continue; }
      console.log(`   recall failed — ${String(e.message).slice(0, 60)}`);
      break;
    }
  }

  if (nearest === null) { console.log("   SKIPPING: could not verify (recall failed, not empty)\n"); continue; }
  if (nearest < SKIP_BELOW) { console.log(`   already present (d=${nearest.toFixed(4)}) — SKIP\n`); continue; }
  console.log(`   nearest d=${nearest === Infinity ? "none" : nearest.toFixed(4)} — needs writing`);

  if (!WRITE) { console.log("   (dry run)\n"); continue; }

  let done = false;
  for (let a = 0; a < 4 && !done; a++) {
    try {
      const r = await client(ns).rememberAndWait(text, ns, { timeoutMs: 180_000 });
      console.log(`   OK  ${r.blob_id}\n`);
      written.push([r.blob_id, ns]);
      done = true;
    } catch (e) {
      const m = String(e.message ?? e);
      if (a < 3) { console.log(`   retry ${a + 1} after: ${m.slice(0, 50)}`); await sleep(5000 * (a + 1)); }
      else { console.log(`   FAILED — ${m.slice(0, 70)}\n`); done = true; }
    }
  }
  await sleep(2500);
}

if (WRITE) {
  console.log("=".repeat(70));
  console.log(`WROTE ${written.length} / ${MISSING.length}`);
  for (const [b, ns] of written) console.log(`| \`${b}\` | \`${ns}\` |`);
}
