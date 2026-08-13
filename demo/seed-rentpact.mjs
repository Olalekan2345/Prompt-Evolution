// Seeds the RentPact project bible — 37 records across 21 namespaces.
//
//   node seed-rentpact.mjs          → dry run, writes nothing
//   node seed-rentpact.mjs --write  → WRITES 37 REAL BLOBS. Costs real WAL/gas.
//
// Recall-before-write: skips any namespace that already holds records.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MemWal } from "@mysten-incubation/memwal";

const WRITE = process.argv.includes("--write");
const D = "2026-08-12";
const AS = "(as of: launch kit v1)";

const creds = JSON.parse(
  fs.readFileSync(path.join(os.homedir(), ".memwal", "credentials.json"), "utf8"),
);

const R = [
  // ── rules ──
  ["rentpact::rule::caution-fee-custody", `[canon:rule|current|${D}] caution-fee-custody — the caution fee never enters the landlord's custody at any point in the lease lifecycle; it is held in escrow and returns to the tenant automatically. Any design in which the landlord holds, controls or routes the caution fee violates the product's core premise. ${AS}`],
  ["rentpact::rule::no-evidence-no-deduction", `[canon:rule|current|${D}] no-evidence-no-deduction — no deduction from the caution fee is permitted without a landlord damage claim carrying photo evidence compared against the move-in baseline. Absence of evidence resolves in the tenant's favour, always and without exception. ${AS}`],
  ["rentpact::rule::evidence-immutability", `[canon:rule|current|${D}] evidence-immutability — the landlord's declaration of property condition is hashed on-chain before the lease begins and cannot be edited afterward; tenant-filed issues are timestamped at filing. Any feature permitting retroactive edit of a condition declaration breaks the dispute model. ${AS}`],
  ["rentpact::rule::gasless-invariant", `[canon:rule|current|${D}] gasless-invariant — no tenant or landlord ever pays gas or sees a seed phrase. Any flow surfacing either to an end user violates the product's fintech-experience premise, regardless of how few users it affects. ${AS}`],

  // ── decisions: settled ──
  ["rentpact::decision::market", `[canon:decision|settled|${D}] market — Lagos, Nigeria is the launch market; the product is designed around the Nigerian rental ritual of 1-2 years rent paid upfront plus a non-returnable caution fee. ${AS}`],
  ["rentpact::decision::problem-frame", `[canon:decision|settled|${D}] problem-frame — RentPact is positioned problem-first around tenant powerlessness after payment, not technology-first; the agreement protecting only the landlord is the wedge. ${AS}`],
  ["rentpact::decision::chain", `[canon:decision|settled|${D}] chain — Arc, Circle's stablecoin-native L1, is the settlement chain and the hub of the architecture; all other chains reach it rather than it reaching them. ${AS}`],
  ["rentpact::decision::currency", `[canon:decision|settled|${D}] currency — all deposits, scheduled releases and refunds are denominated in USDC; rent money must never be exposed to price volatility. ${AS}`],
  ["rentpact::decision::cross-chain", `[canon:decision|settled|${D}] cross-chain — deposits may originate on any chain and arrive via CCTP, with Arc as the settlement hub; multi-chain deposit support does not imply multi-chain settlement. ${AS}`],
  ["rentpact::decision::release-schedule", `[canon:decision|settled|${D}] release-schedule — the landlord receives rent in scheduled releases (monthly, quarterly or yearly), not as a lump sum at deposit; the schedule is fixed at lease creation. ${AS}`],
  ["rentpact::decision::caution-fee-return-window", `[canon:decision|settled|${D}] caution-fee-return-window — on a clean lease end the caution fee returns to the tenant automatically within 7 days, with no landlord action required to release it. ${AS}`],
  ["rentpact::decision::freeze-mechanism", `[canon:decision|settled|${D}] freeze-mechanism — on landlord breach the tenant freezes the next scheduled release with a single action, backed by timestamped photo evidence; freezing halts the next release only, it does not claw back releases already made. ${AS}`],
  ["rentpact::decision::dispute-model", `[canon:decision|settled|${D}] dispute-model — arbiters review an evidence timeline, not party statements or arguments. Evidence decides, not argument, connections, or who knows the caretaker. ${AS}`],
  ["rentpact::decision::dispute-trigger", `[canon:decision|settled|${D}] dispute-trigger — a repair ignored past its deadline automatically unlocks the dispute option for the tenant, with the full evidence trail attached; the tenant does not have to request or justify access to dispute. ${AS}`],
  ["rentpact::decision::onboarding", `[canon:decision|settled|${D}] onboarding — users sign up with email and a Circle Wallet is created silently behind it; no seed phrase is ever shown, exported or required. ${AS}`],
  ["rentpact::decision::gas-model", `[canon:decision|settled|${D}] gas-model — transactions are sponsored via Circle Gas Station so the product is fully gasless for end users. ${AS}`],
  ["rentpact::decision::launch-positioning", `[canon:decision|settled|${D}] launch-positioning — the caution fee thread is the primary viral angle, leading with the question "have you EVER gotten your caution fee back?"; the tech thread is secondary and aimed at a Web3 audience only. ${AS}`],

  // ── decisions: open ──
  ["rentpact::decision::vertical-expansion", `[canon:decision|open|${D}] vertical-expansion — extending the escrow engine to event halls, studios and short-lets is stated public vision but not committed scope; sequencing, timing and product differences are undefined. ${AS}`],
  ["rentpact::decision::arbiter-selection", `[canon:decision|open|${D}] arbiter-selection — who arbiters are, how they are selected, how they are compensated and how they are held accountable is unresolved. The dispute model depends on this and cannot be called complete until it is settled. ${AS}`],
  ["rentpact::decision::rental-credential", `[canon:decision|open|${D}] rental-credential — the portable on-chain rental credential minted on clean lease completion is directional; issuance mechanics, revocation, privacy and cross-platform portability are all undefined. ${AS}`],

  // ── decision with rejected alternatives ──
  ["rentpact::decision::bio-copy", `[canon:decision|settled|${D}] bio-copy — the X bio uses Option A, the problem-first framing opening "Rent held in escrow. Released on schedule. Frozen on dispute." ${AS}`],
  ["rentpact::decision::bio-copy", `[canon:decision|rejected|${D}] bio-copy — Option B ("The end of pay 2 years upfront and pray") rejected in favour of the problem-first framing. ${AS}`],
  ["rentpact::decision::bio-copy", `[canon:decision|rejected|${D}] bio-copy — Option C (short form, "USDC rent escrow on Arc") rejected in favour of the problem-first framing. ${AS}`],

  // ── terms ──
  ["rentpact::term::caution-fee", `[canon:term|current|${D}] caution-fee — the refundable deposit a Nigerian tenant pays at lease start, held in trust rather than earned by the landlord; conventionally never returned in practice, which is the abuse RentPact exists to end. ${AS}`],
  ["rentpact::term::escrow", `[canon:term|current|${D}] escrow — the smart contract holding deposited rent and the caution fee, releasing to the landlord on schedule and returning the caution fee to the tenant on clean completion. ${AS}`],
  ["rentpact::term::freeze", `[canon:term|current|${D}] freeze — the tenant action halting the next scheduled release on landlord breach, requiring timestamped photo evidence. ${AS}`],
  ["rentpact::term::move-in-baseline", `[canon:term|current|${D}] move-in-baseline — the landlord's photographic declaration of property condition, hashed on-chain before the lease begins; the sole reference against which damage claims are compared. ${AS}`],
  ["rentpact::term::arbiter", `[canon:term|current|${D}] arbiter — the party resolving a dispute by reviewing the evidence timeline; hears no arguments and receives no statements. ${AS}`],
  ["rentpact::term::cctp", `[canon:term|current|${D}] cctp — Circle's Cross-Chain Transfer Protocol, the path by which deposits from other chains reach Arc for settlement. ${AS}`],
  ["rentpact::term::gas-station", `[canon:term|current|${D}] gas-station — Circle's transaction sponsorship service, the mechanism making RentPact gasless for end users. ${AS}`],

  // ── entities ──
  ["rentpact::char::tenant", `[canon:char|current|${D}] tenant — deposits full rent into escrow, files timestamped issue reports, freezes releases on breach, and receives the caution fee back automatically on clean completion. ${AS}`],
  ["rentpact::char::landlord", `[canon:char|current|${D}] landlord — receives rent in scheduled releases, declares property condition before lease start, must file evidenced damage claims to deduct anything, and never holds the caution fee. ${AS}`],
  ["rentpact::char::arbiter", `[canon:char|current|${D}] arbiter — resolves disputes from the evidence timeline alone. Selection and compensation unresolved — see decision::arbiter-selection. ${AS}`],
  ["rentpact::object::escrow-contract", `[canon:object|current|${D}] escrow-contract — the smart contract on Arc holding rent and caution fee, executing scheduled releases, freezes and automatic refunds. ${AS}`],
  ["rentpact::object::evidence-bundle", `[canon:object|current|${D}] evidence-bundle — the timestamped, on-chain-hashed collection of move-in baseline photos, tenant issue reports and landlord damage claims that an arbiter reviews. ${AS}`],
  ["rentpact::object::rental-credential", `[canon:object|current|${D}] rental-credential — a permanent portable on-chain record minted on clean lease completion, intended as tenant-owned proof of payment history. Directional only — see decision::rental-credential. ${AS}`],
  ["rentpact::place::arc", `[canon:place|current|${D}] arc — Circle's stablecoin-native L1; RentPact's settlement chain and architectural hub. Other chains connect inward via CCTP. ${AS}`],
  ["rentpact::events", `[canon:event|current|${D}] launch-kit — the RentPact X launch kit v1 was finalised, comprising bio options, six thread sections and the pinned introduction post. ${AS}`],
];

const client = (ns) => MemWal.create({
  key: creds.delegatePrivateKey,
  accountId: creds.accountId,
  serverUrl: creds.relayerUrl,
  namespace: ns,
});

console.log(`\n${R.length} records across ${new Set(R.map((r) => r[0])).size} namespaces`);
console.log(WRITE ? "MODE: WRITE — real blobs, real cost\n" : "MODE: DRY RUN — nothing will be written. Add --write to commit.\n");

if (!WRITE) {
  for (const [ns, t] of R) console.log(`  ${ns}\n    ${t.slice(0, 96)}…`);
  console.log(`\nDry run complete. ${R.length} records ready.\n`);
  process.exit(0);
}

// §1 recall-before-write: skip namespaces that already hold records.
const nsList = [...new Set(R.map((r) => r[0]))];
const occupied = new Set();
console.log("Checking which namespaces already hold canon...");
for (const ns of nsList) {
  try {
    const r = await client(ns).recall({ query: "canon", topK: 1, maxDistance: 0.99 });
    if ((r.results?.length ?? 0) > 0) { occupied.add(ns); console.log(`  OCCUPIED ${ns}`); }
  } catch (e) { console.log(`  ? ${ns} — ${String(e.message).slice(0, 50)}`); }
  await new Promise((r) => setTimeout(r, 350));
}
if (occupied.size) console.log(`\n${occupied.size} namespace(s) already seeded — skipping those.\n`);

const written = [];
for (const [ns, text] of R) {
  if (occupied.has(ns)) continue;
  let ok = false;
  for (let a = 0; a < 3 && !ok; a++) {
    try {
      const r = await client(ns).rememberAndWait(text, ns, { timeoutMs: 120_000 });
      console.log(`OK  ${r.blob_id}  ${ns}`);
      written.push([r.blob_id, ns]);
      ok = true;
    } catch (e) {
      const m = String(e.message ?? e);
      if (/429|rate limit/i.test(m) && a < 2) await new Promise((r) => setTimeout(r, 2500 * (a + 1)));
      else { console.log(`FAIL ${ns} — ${m.slice(0, 70)}`); ok = true; }
    }
  }
  await new Promise((r) => setTimeout(r, 500));
}

console.log(`\n${"=".repeat(70)}`);
console.log(`WROTE ${written.length} blobs. RUNNING TOTAL: ${14 + written.length}`);
console.log("Copy these into walrus-receipts.md — nothing enumerates blobs.\n");
for (const [b, ns] of written) console.log(`| \`${b}\` | \`${ns}\` |`);
