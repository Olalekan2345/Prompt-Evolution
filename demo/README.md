# Demo scripts

Runnable scripts that reproduce every claim in the [root README](../README.md) against live Walrus
Memory. Nothing here is mocked — each script talks to the production relayer and, where noted, writes
real blobs to Walrus Mainnet.

## Credentials

These scripts read `~/.memwal/credentials.json` **at runtime**. No keys are stored in this
repository, and none are printed — the write scripts scrub the private key from all output including
error messages.

To create that file, sign in once:

```bash
npx -y "@mysten-incubation/memwal-mcp" login --label my-project
```

> Must be run in a real terminal. If stdin is not a TTY, the CLI silently serves a stub and exits 0
> without logging you in — reported upstream.

## Install

```bash
npm install
```

## Read-only scripts — free, safe to re-run

| Script | What it does |
|---|---|
| `node check.mjs` | Lists every canon record grouped by namespace, with blob IDs. |
| `node ask.mjs "<question>"` | Asks canon a natural-language question. |
| `node ask.mjs --ns <namespace> "<question>"` | Same, forced to one namespace — a single recall instead of eight. |
| `node calibrate.mjs` | Reproduces the dedup calibration table in the root README. |
| `node demo.mjs` | Full walkthrough: recall → contradiction guard → dedup gap → mainnet verification. ~40s. |

### How `ask.mjs` works

Recall is namespace-scoped, so a cross-cutting question has to choose where to look. Fanning out
across all namespaces returns `HTTP 429` — the relayer rate-limits recall, and a throttled call is
indistinguishable from an empty one.

So `ask.mjs` implements §1 of the prompt directly:

- scores namespaces by name overlap with the question, always including `::meta` and `::events`
  (their names describe their contents poorly)
- caps recalls at **8 per invocation**
- retries with backoff on 429, and reports failures separately from empty results
- filters answers using the **measured** calibration bands: below 0.55 answers the question,
  0.55–0.70 is supporting context, and 0.70+ is unrelated and is not shown as an answer

That last rule matters. Without it the tool presents distant matches as answers, which is worse than
saying nothing.

## Scripts that write — cost real WAL and gas

| Script | What it does |
|---|---|
| `node seed-rentpact.mjs` | **Dry run.** Prints all 38 RentPact records, writes nothing. |
| `node seed-rentpact.mjs --write` | Writes them. Skips namespaces that already hold records. |
| `node gap-fill.mjs` / `--write` | Writes only the records a partial seed missed, using per-record dedup. |
| `node demo-live-write.mjs` | Writes one record, then reads it back off Walrus to verify. |

### Why `gap-fill.mjs` exists separately

`seed-rentpact.mjs` guards against duplicates at *namespace* level, which is too coarse to resume a
partially-failed batch. `rentpact::decision::bio-copy` holds three records — one settled, two
rejected. Two landed; the third hit a rate limit. A re-run would see the namespace as occupied, skip
it, and strand that record permanently on append-only storage.

`gap-fill.mjs` uses **per-record** dedup instead — recalling each candidate's own text and skipping
only below 0.25, the measured verbatim-duplicate threshold. That is §4 of the prompt applied
literally, and it is the only safe way to resume a failed batch against storage with no delete path.

It also refuses to write when a dedup recall fails, rather than assuming the namespace is empty:

```
SKIPPING: could not verify (recall failed, not empty)
```

## A note on rate limits

The relayer throttles aggressively. Seeding ~38 records in one run produced five failures and one
120-second job timeout, and sustained use can leave recall returning 429 for a while afterwards. If
scripts start failing, stop and wait rather than retrying — every failed handshake appears to make it
worse.

`demo.mjs` and `ask.mjs --ns` make few calls and are the safest to run on a live demo.
