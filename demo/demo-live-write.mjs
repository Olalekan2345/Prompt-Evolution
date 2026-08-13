import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MemWal } from "@mysten-incubation/memwal";

// WRITES ONE REAL BLOB. Costs real WAL/gas. Run once, on camera.

const creds = JSON.parse(
  fs.readFileSync(path.join(os.homedir(), ".memwal", "credentials.json"), "utf8"),
);
const NS = "prompt-evolution::events";
const mw = MemWal.create({
  key: creds.delegatePrivateKey,
  accountId: creds.accountId,
  serverUrl: creds.relayerUrl,
  namespace: NS,
});

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const rule = () => console.log("═".repeat(74));

const stamp = new Date().toISOString();
const text = `[canon:event|current|2026-08-12] demo-recording — the Continuity Keeper v2 demo was recorded on ${stamp}, writing this record live to Walrus mainnet to demonstrate the full write-and-verify path. (as of: demo recording)`;

console.log();
rule();
console.log("  WRITING NEW CANON TO WALRUS MAINNET — LIVE");
rule();
console.log(`\n  namespace: ${NS}\n`);
console.log("  record:");
console.log(`    ${text.slice(0, 70)}`);
console.log(`    ${text.slice(70, 140)}`);
console.log();
await pause(2500);

console.log("  Writing to Walrus...\n");
const t0 = Date.now();
const r = await mw.rememberAndWait(text, NS, { timeoutMs: 120_000 });
const secs = ((Date.now() - t0) / 1000).toFixed(1);

console.log(`  ✓ written in ${secs}s`);
console.log(`\n  BLOB ID : ${r.blob_id}`);
console.log(`  OWNER   : ${r.owner}`);
console.log(`  NAMESPACE: ${r.namespace}\n`);
await pause(3500);

rule();
console.log("  VERIFYING — reading the blob straight off Walrus storage");
console.log("  (Walrus Memory wrote it. Now Walrus itself confirms it landed.)");
rule();
const url = `https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${r.blob_id}`;
console.log(`\n  ${url}\n`);
await pause(2000);

const res = await fetch(url);
const buf = await res.arrayBuffer();
console.log(`  HTTP ${res.status}   ${buf.byteLength} bytes of SEAL ciphertext\n`);
await pause(1500);

console.log(`  That memory did not exist ${secs} seconds ago.`);
console.log(`  It is now permanently on Walrus mainnet.\n`);
console.log(`  Browse it:  https://walruscan.com/mainnet/blob/${r.blob_id}`);
console.log();
rule();
console.log("  RECORD THIS BLOB ID IN walrus-receipts.md — nothing enumerates blobs.");
rule();
console.log();
