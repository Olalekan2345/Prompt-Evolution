# Canon seed — prompt-evolution

Status: **WRITTEN to Walrus Mainnet, 2026-08-12.** Every blob ID is recorded in
[`walrus-receipts.md`](walrus-receipts.md), and each is independently verifiable through the Walrus
aggregator. This file documents the *design* of the seed — what was recorded and why. The receipts
file is the inventory of what exists.

Every record follows the §"Note schema" of `CLAUDE.md`:

```
[canon:<type>|<status>|<effective_at>] <entity> — <fact / current state> (as of: <marker>)
```

Written as individual `remember` calls rather than one bulk call per namespace, because namespace is
a per-call argument and `memwal_remember_bulk` is excluded from the MCP bridge's default-namespace
injection (filed as a bug — see [`bug-reports.md`](bug-reports.md)).

---

## 1. `prompt-evolution::decision::prompt-choice`

Five records: the settled choice, plus one per alternative that was ruled out.

```
[canon:decision|settled|2026-08-11] prompt-choice — Continuity Keeper (Creative Writing & Canon Management) is the prompt being evolved; the submission is Continuity Keeper v2. (as of: session 2026-08-11 canon seed)

[canon:decision|rejected|2026-08-11] prompt-choice — <alternative> rejected as the evolution target: <reason>. (as of: session 2026-08-11 canon seed)
    × 4, one per alternative considered
```

**Why one record per alternative rather than a single "the others were rejected".** A combined record
surfaces on recall but cannot contradict anything specific. Split, each one blocks a reopen of the
alternative it names — the guard fires on precisely what is being re-proposed, with the reason
attached. That granularity is the whole reason the decision type carries a status.

One of the four is the author's own earlier prompt, ruled out because the rules bar original creators
from evolving their own work. That record is the one `demo/demo.mjs` uses to demonstrate the
contradiction guard, since the constraint it encodes is a rule rather than a preference.

## 2. `prompt-evolution::decision::fiction-path`

```
[canon:decision|settled|2026-08-11] fiction-path — Continuity Keeper v2 must keep the original fiction canon path fully working; the `decision` type is an extension, not a repurposing, so a judge cannot claim the prompt was merely reskinned for a different domain. (as of: session 2026-08-11 canon seed)
```

## 3. `prompt-evolution::decision::repo-separation`

```
[canon:decision|settled|2026-08-11] repo-separation — Continuity Keeper v2 lives in its own folder and its own GitHub repo, kept separate from github.com/Olalekan2345/buildmem-agent, so the two Walrus Sessions submissions are never confused. (as of: session 2026-08-11 canon seed)
```

## 4. `prompt-evolution::decision::pinned-namespace`

```
[canon:decision|settled|2026-08-11] pinned-namespace — the memwal MCP server is pinned to namespace ck2-unrouted deliberately: v2 always passes an explicit namespace per call, so a routing bug surfaces as a visible stray namespace instead of silently landing in the relayer's shared default bucket. (as of: session 2026-08-11 canon seed)
```

---

## Optional — beyond the four requested

A standing constraint from the reference data, `rule` type rather than `decision`. Not written unless
approved.

`prompt-evolution::rule::namespace-hygiene`

```
[canon:rule|current|2026-08-11] namespace-hygiene — never write into the buildmem-hackathon namespace; it holds the 22 blobs of the previous Sessions submission and is read-only for this project. (as of: session 2026-08-11 canon seed)
```

---

## Dedup note

§4 dedup is a no-op for this seed: these namespaces are empty, so every candidate lands in the
`d >= 0.70` WRITE band by default. Do **not** skip the dedup recall on later turns.

Calibration cannot be done yet either — §4 requires recalling a known-duplicate and a known-unrelated
fact in the same namespace, and there is nothing to be a duplicate *of* until this seed lands. Run
calibration immediately after, then store the result in `prompt-evolution::meta`:

```
[canon:term|current|<date>] dedup-calibration — skip below X, ambiguous X–Y, write above Y
```

Until that record exists, the 0.25 / 0.55 / 0.70 boundaries are the relayer-default assumption, not a
measured value for this project.

## Write discipline

Per §3, do not verify these writes by recalling them — the index lags and you will write duplicates.
Trust the acknowledgment, echo each returned `blob_id`, and print one `✓ canon:` line per record.

## How these were actually written

Not through the MCP bridge. Every connection attempt to `relayer.memory.walrus.xyz` returned
`HTTP 429 ip_active_cap` and the client crashed on a libuv assertion — reproduced across two public
IP addresses, two accounts and three delegate keys, so the fault is service-side rather than specific
to this account. Filed as an issue; see [`bug-reports.md`](bug-reports.md).

Writes therefore went through the `@mysten-incubation/memwal` SDK (v0.1.1) against the same relayer,
same account, same blobs — a different transport into the same service. The scripts that did it are
in [`demo/`](demo/) and are reproducible.
