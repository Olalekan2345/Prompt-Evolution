# RentPact canon seed — `rentpact::*`

Status: **WRITTEN to Walrus Mainnet, 2026-08-12 — 33 of 38 records.** Blob IDs are in
[`walrus-receipts.md`](walrus-receipts.md). Five records failed to relayer rate limits and a job
timeout and are listed there as outstanding; they are documented rather than quietly omitted.

Source: RentPact X Account Launch Kit v1 — a rent-escrow product, and a second, unrelated project on
the same Walrus Memory account. Its purpose here is to demonstrate that canon is scoped per project
rather than per tool, and to exercise the `decision` entity type on real product decisions rather
than on the submission talking about itself.

## Two decisions I made in drafting this

**1. `effective_at` is `2026-08-11` throughout.** That is the honest date — it is when these facts
entered canon, not when each was originally decided. Fabricating historical dates would put invented
facts on immutable storage, which is exactly what `rule::evidence-integrity` forbids. Where you know
a real decision date, overwrite it before writing; ordering below is by logical dependency, so
substituting real dates won't disturb the structure.

**2. Marketing claims are not canon.** The launch kit asserts finished outcomes because that is what
launch copy does. Canon records the *decision* and its reason, never the implementation status. So
"Arc was chosen as the settlement chain" is `settled`; "gasless works today" is not recorded at all —
that becomes an `event` when it actually ships. Anything the copy gestures at without committing is
`open`, not `settled`.

Publishability: everything below derives from public launch copy, so all of it is safe to quote in
the article. Keep anything you know *beyond* the copy — unit economics, real build status, arbiter
compensation — out of both canon and article until you decide deliberately.

---

## Tier 1 — Market and problem

### `rentpact::decision::market`
```
[canon:decision|settled|2026-08-11] market — Lagos, Nigeria is the launch market; the product is designed around the Nigerian rental ritual of 1-2 years rent paid upfront plus a non-returnable caution fee. (as of: launch kit v1)
```

### `rentpact::decision::problem-frame`
```
[canon:decision|settled|2026-08-11] problem-frame — RentPact is positioned problem-first around tenant powerlessness after payment, not technology-first; the agreement protecting only the landlord is the wedge. (as of: launch kit v1)
```

## Tier 2 — Infrastructure

### `rentpact::decision::chain`
```
[canon:decision|settled|2026-08-11] chain — Arc, Circle's stablecoin-native L1, is the settlement chain and the hub of the architecture; all other chains reach it rather than it reaching them. (as of: launch kit v1)
```

### `rentpact::decision::currency`
```
[canon:decision|settled|2026-08-11] currency — all deposits, scheduled releases and refunds are denominated in USDC; rent money must never be exposed to price volatility. (as of: launch kit v1)
```

### `rentpact::decision::cross-chain`
```
[canon:decision|settled|2026-08-11] cross-chain — deposits may originate on any chain and arrive via CCTP, with Arc as the settlement hub; multi-chain deposit support does not imply multi-chain settlement. (as of: launch kit v1)
```

## Tier 3 — Custody and escrow mechanics (the core)

### `rentpact::rule::caution-fee-custody`
```
[canon:rule|current|2026-08-11] caution-fee-custody — the caution fee never enters the landlord's custody at any point in the lease lifecycle; it is held in escrow and returns to the tenant automatically. Any design in which the landlord holds, controls or routes the caution fee violates the product's core premise. (as of: launch kit v1)
```

### `rentpact::decision::release-schedule`
```
[canon:decision|settled|2026-08-11] release-schedule — the landlord receives rent in scheduled releases (monthly, quarterly or yearly), not as a lump sum at deposit; the schedule is fixed at lease creation. (as of: launch kit v1)
```

### `rentpact::decision::caution-fee-return-window`
```
[canon:decision|settled|2026-08-11] caution-fee-return-window — on a clean lease end the caution fee returns to the tenant automatically within 7 days, with no landlord action required to release it. (as of: launch kit v1)
```

### `rentpact::decision::freeze-mechanism`
```
[canon:decision|settled|2026-08-11] freeze-mechanism — on landlord breach the tenant freezes the next scheduled release with a single action, backed by timestamped photo evidence; freezing halts the next release only, it does not claw back releases already made. (as of: launch kit v1)
```

## Tier 4 — Evidence and dispute (the differentiator)

### `rentpact::rule::no-evidence-no-deduction`
```
[canon:rule|current|2026-08-11] no-evidence-no-deduction — no deduction from the caution fee is permitted without a landlord damage claim carrying photo evidence compared against the move-in baseline. Absence of evidence resolves in the tenant's favour, always and without exception. (as of: launch kit v1)
```

### `rentpact::rule::evidence-immutability`
```
[canon:rule|current|2026-08-11] evidence-immutability — the landlord's declaration of property condition is hashed on-chain before the lease begins and cannot be edited afterward; tenant-filed issues are timestamped at filing. Any feature permitting retroactive edit of a condition declaration breaks the dispute model. (as of: launch kit v1)
```

### `rentpact::decision::dispute-model`
```
[canon:decision|settled|2026-08-11] dispute-model — arbiters review an evidence timeline, not party statements or arguments. Evidence decides, not argument, connections, or who knows the caretaker. (as of: launch kit v1)
```

### `rentpact::decision::dispute-trigger`
```
[canon:decision|settled|2026-08-11] dispute-trigger — a repair ignored past its deadline automatically unlocks the dispute option for the tenant, with the full evidence trail attached; the tenant does not have to request or justify access to dispute. (as of: launch kit v1)
```

## Tier 5 — User experience

### `rentpact::rule::gasless-invariant`
```
[canon:rule|current|2026-08-11] gasless-invariant — no tenant or landlord ever pays gas or sees a seed phrase. Any flow surfacing either to an end user violates the product's fintech-experience premise, regardless of how few users it affects. (as of: launch kit v1)
```

### `rentpact::decision::onboarding`
```
[canon:decision|settled|2026-08-11] onboarding — users sign up with email and a Circle Wallet is created silently behind it; no seed phrase is ever shown, exported or required. (as of: launch kit v1)
```

### `rentpact::decision::gas-model`
```
[canon:decision|settled|2026-08-11] gas-model — transactions are sponsored via Circle Gas Station so the product is fully gasless for end users. (as of: launch kit v1)
```

## Tier 6 — Open questions (deliberately not settled)

### `rentpact::decision::vertical-expansion`
```
[canon:decision|open|2026-08-11] vertical-expansion — extending the escrow engine to event halls, studios and short-lets is stated public vision but not committed scope; sequencing, timing and product differences are undefined. (as of: launch kit v1)
```

### `rentpact::decision::arbiter-selection`
```
[canon:decision|open|2026-08-11] arbiter-selection — who arbiters are, how they are selected, how they are compensated and how they are held accountable is unresolved. The dispute model depends on this and cannot be called complete until it is settled. (as of: launch kit v1)
```

### `rentpact::decision::rental-credential`
```
[canon:decision|open|2026-08-11] rental-credential — the portable on-chain rental credential minted on clean lease completion is directional; issuance mechanics, revocation, privacy and cross-platform portability are all undefined. (as of: launch kit v1)
```

## Tier 7 — Vocabulary

Namespace `rentpact::term::{slug}`, one per record.

```
[canon:term|current|2026-08-11] caution-fee — the refundable deposit a Nigerian tenant pays at lease start, held in trust rather than earned by the landlord; conventionally never returned in practice, which is the abuse RentPact exists to end. (as of: launch kit v1)

[canon:term|current|2026-08-11] escrow — the smart contract holding deposited rent and the caution fee, releasing to the landlord on schedule and returning the caution fee to the tenant on clean completion. (as of: launch kit v1)

[canon:term|current|2026-08-11] freeze — the tenant action halting the next scheduled release on landlord breach, requiring timestamped photo evidence. (as of: launch kit v1)

[canon:term|current|2026-08-11] move-in-baseline — the landlord's photographic declaration of property condition, hashed on-chain before the lease begins; the sole reference against which damage claims are compared. (as of: launch kit v1)

[canon:term|current|2026-08-11] arbiter — the party resolving a dispute by reviewing the evidence timeline; hears no arguments and receives no statements. (as of: launch kit v1)

[canon:term|current|2026-08-11] cctp — Circle's Cross-Chain Transfer Protocol, the path by which deposits from other chains reach Arc for settlement. (as of: launch kit v1)

[canon:term|current|2026-08-11] gas-station — Circle's transaction sponsorship service, the mechanism making RentPact gasless for end users. (as of: launch kit v1)
```

## Tier 8 — Entities

### `rentpact::char::{slug}` — roles, not people
```
[canon:char|current|2026-08-11] tenant — deposits full rent into escrow, files timestamped issue reports, freezes releases on breach, and receives the caution fee back automatically on clean completion. (as of: launch kit v1)

[canon:char|current|2026-08-11] landlord — receives rent in scheduled releases, declares property condition before lease start, must file evidenced damage claims to deduct anything, and never holds the caution fee. (as of: launch kit v1)

[canon:char|current|2026-08-11] arbiter — resolves disputes from the evidence timeline alone. Selection and compensation unresolved — see decision::arbiter-selection. (as of: launch kit v1)
```

### `rentpact::object::{slug}`
```
[canon:object|current|2026-08-11] escrow-contract — the smart contract on Arc holding rent and caution fee, executing scheduled releases, freezes and automatic refunds. (as of: launch kit v1)

[canon:object|current|2026-08-11] evidence-bundle — the timestamped, on-chain-hashed collection of move-in baseline photos, tenant issue reports and landlord damage claims that an arbiter reviews. (as of: launch kit v1)

[canon:object|current|2026-08-11] rental-credential — a permanent portable on-chain record minted on clean lease completion, intended as tenant-owned proof of payment history. Directional only — see decision::rental-credential. (as of: launch kit v1)
```

### `rentpact::place::arc`
```
[canon:place|current|2026-08-11] arc — Circle's stablecoin-native L1; RentPact's settlement chain and architectural hub. Other chains connect inward via CCTP. (as of: launch kit v1)
```

## Tier 9 — Launch

### `rentpact::decision::bio-copy`
```
[canon:decision|settled|2026-08-11] bio-copy — the X bio uses Option A, the problem-first framing opening "Rent held in escrow. Released on schedule. Frozen on dispute." (as of: launch kit v1)

[canon:decision|rejected|2026-08-11] bio-copy — Option B ("The end of pay 2 years upfront and pray") rejected in favour of the problem-first framing. (as of: launch kit v1)

[canon:decision|rejected|2026-08-11] bio-copy — Option C (short form, "USDC rent escrow on Arc") rejected in favour of the problem-first framing. (as of: launch kit v1)
```

### `rentpact::decision::launch-positioning`
```
[canon:decision|settled|2026-08-11] launch-positioning — the caution fee thread is the primary viral angle, leading with the question "have you EVER gotten your caution fee back?"; the tech thread is secondary and aimed at a Web3 audience only. (as of: launch kit v1)
```

### `rentpact::events`
```
[canon:event|current|2026-08-11] launch-kit — the RentPact X launch kit v1 was finalised, comprising bio options, six thread sections and the pinned introduction post. (as of: launch kit v1)
```

---

## Write plan

Namespace is per call, so one `memwal_remember_bulk` per namespace. All well under the 20-fact cap.

| Namespace | Records |
|---|---|
| `rentpact::decision::*` — one call per decision slug (15 slugs, 18 records) | 18 |
| `rentpact::rule::*` — 4 slugs | 4 |
| `rentpact::term::*` — 7 slugs | 7 |
| `rentpact::char::*` — 3 slugs | 3 |
| `rentpact::object::*` — 3 slugs | 3 |
| `rentpact::place::arc` | 1 |
| `rentpact::events` | 1 |
| **Total** | **37** |

Comfortably past the 10-blob minimum even if `remember_bulk` writes one blob per call rather than
one per fact — **verify that mapping first**, since it changes whether this is ~37 blobs or ~30.

Dedup is a no-op on this seed (empty namespaces, everything lands in the WRITE band). Run the §4
calibration immediately afterward, on a namespace that now has content, and store the result in
`rentpact::meta` and `prompt-evolution::meta`.

## Contradictions this seed will catch

Predicted, and worth watching for — each is a plausible, well-intentioned proposal:

| Proposal | Canon violated |
|---|---|
| Landlord sub-account for faster deduction | `rule::caution-fee-custody` |
| Accept a naira stablecoin or ETH | `decision::currency` |
| Seed-phrase option for power users | `rule::gasless-invariant` |
| Let arbiters read both sides' statements | `decision::dispute-model` |
| Auto-deduct for obvious wear and tear | `rule::no-evidence-no-deduction` |
| Let landlords amend a condition declaration | `rule::evidence-immutability` |
| Ship on Base for deeper liquidity | `decision::chain` |
| Treat short-lets as committed roadmap | `decision::vertical-expansion` is `open`, not `settled` |
