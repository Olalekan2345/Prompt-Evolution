# Walrus mainnet receipts

**Record every blob ID here at write time.** MemWal has no operation to enumerate an account's blobs
(see `bug-reports.md` Issue 3), so this file is the only inventory that exists. A blob ID lost from
terminal scrollback is unrecoverable.

## Account

| | |
|---|---|
| Wallet (dedicated Sessions) | `0x51f2d246f0f193aa45af81d6afe260e6c681e99b14fce98d211cac3ff5428879` |
| MemWalAccount | `0xfedbe55fbd3350a3e9e18747cbbdadcf235eb6eca867f9b6dd51ef3ec1f3b107` |
| MEMWAL_AGENT_ID | `7701cacb25267d9b361e57f0a6803ad053d8d98e90f729089cfef12ee1f1651c` |
| Delegate address | `0xedcee881cc46a9e89e618cd886949a1b15a345ef86f2e0850b8bdc56e0dea1b5` |
| Package | `0xe7c16fbea0560e7057e2bf7422feaa4fb313749fc69c9e9092fac7a33b81d7f5` |
| Delegate created | 2026-08-12T08:56:09Z |

Written via the `@mysten-incubation/memwal` SDK v0.1.1 — the MCP bridge path is unusable
(`ip_active_cap` 429 on every connection, see Issue 2).

## Blob mapping — confirmed empirically

`rememberBulkAndWait` with 4 items returned **4 distinct blob IDs**, one per fact. Bulk does not
coalesce facts into a single blob. So blob count ≈ record count.

---

## Batch 1 — 2026-08-12 · `prompt-evolution::decision::prompt-choice` · 5 blobs

| # | blob_id | record |
|---|---|---|
| 1 | `v14MnlqtllF_lCLMeEjK_Zu8Cs_G482_BlXMA7s1Wkk` | settled — Continuity Keeper is the prompt being evolved |
| 2 | `ytaUN2aIw6y0VuRH-aWeuYdAMUUjPmTNeC0KHi3zE5Y` | rejected — BuildMEM Agent (authored by submitter) |
| 3 | `XY0aCwiW2FkMcxZI_Ruobto2AcyLikliGDxZ_a6iT4k` | rejected — Continuum |
| 4 | `3lq4bBiTZ8HoPrhPp8S7HKSSsyo38mGYmdEoXwSlVGw` | rejected — Markov |
| 5 | `ZeUjKZlPRXMudAq8kcm9QyY-SOWRAgSy8Qm7vDPzv4g` | rejected — Exam Mistake Memory |

**Batch 1 subtotal: 5 blobs.**

---

## Batch 2 — 2026-08-12 · six namespaces · 6 blobs

Preceded by a recall-before-write check (§1) across all six target namespaces, all confirmed empty —
which prevented six duplicate paid blobs, since an earlier run of this seed had been assumed to have
happened and had not.

| # | blob_id | namespace |
|---|---|---|
| 6 | `lGVHScRHSCyPJnMkI9iJZq6u_ZJCShhg2m5sPm4NWEg` | `prompt-evolution::decision::fiction-path` |
| 7 | `bxCUo7MBHE-bVRQQ3k-G0xJIjMvi0DEGmt-aQUgFShQ` | `prompt-evolution::decision::repo-separation` |
| 8 | `gIAEuYvbY01qTISHFkcmeu1SJiI5Oxfy6K7DBG-wDug` | `prompt-evolution::decision::pinned-namespace` |
| 9 | `AxbV5Rf8vBmL01H1xYTmZqQP1Js5ev0xFnYXU-6Syh8` | `prompt-evolution::rule::namespace-hygiene` |
| 10 | `_xvOdKzzQx5HIxN2XnA6pmWR84hyRcPV5PVvDa4cL20` | `prompt-evolution::decision::account-identity` |
| 11 | `4ftPCnILqeVMe7SKQIXTafIjCX8NbC7Ff-HU-ZxN1RU` | `prompt-evolution::decision::write-path` |

---

## Batch 3 — 2026-08-12 · `prompt-evolution::meta` · 3 blobs

| # | blob_id | record |
|---|---|---|
| 12 | `bDkTHxjjVfAoV6AHWp1xtBj77hZIGccH4bItfIAVHWQ` | `dedup-calibration` — measured values, defaults retained |
| 13 | `ZwbenmnVc3g1JuGqQg2v8Mkx_YUrtimROy27Mb-xouU` | `calibration-method` — how to measure, and how not to |
| 14 | `R3bYD2h3iV4u9QlxYPaOwJiwfZOl-4iYiAyPz6eIvkQ` | `gap-band-confirmed` — 0.5926 landed in the undefined gap |

---

## Batch 4 — 2026-08-12 · `prompt-evolution::events` · 2 blobs

Written during demo rehearsals by `demo/demo-live-write.mjs`. Recovered from an `ask.mjs` result —
they would otherwise have been lost, since nothing enumerates blobs.

| # | blob_id | record |
|---|---|---|
| 15 | `7LbDDEl5SLFTDwsN2frKcxY4g1h_dVupXWAbpxfLtOM` | `demo-recording` — 2026-08-12T12:12:26Z |
| 16 | `t7rHtKrAR839q24G9T9mQnraBwXCMv4vxwXVPattwvI` | `demo-recording` — 2026-08-12T12:22:56Z |

---

## Batch 5 — 2026-08-12 · `rentpact::*` · 33 blobs

The RentPact project bible — a second, unrelated project on the same account, demonstrating that
canon is per-project rather than per-tool. Written by `demo/seed-rentpact.mjs`.

**33 of 38 records landed.** Five failed — four to HTTP 429 rate limits and one to a 120s job
timeout — see the gap-fill note below.

### Rules (3 of 4)
| blob_id | namespace |
|---|---|
| `Bw5Hz86N2aGffKI8fJm7IRurD3947bqdxzhU2MFUI4g` | `rentpact::rule::no-evidence-no-deduction` |
| `_YBNiOmhHaTzt3WquUkwJId6DH_O_ZrUesDL6EylhTM` | `rentpact::rule::evidence-immutability` |
| `XS3pBjzuym9rAzr1qT5FTeKg1mNDKk6e_v7oCnFXMNA` | `rentpact::rule::gasless-invariant` |

### Decisions (17)
| blob_id | namespace |
|---|---|
| `v_mjNhbFBLt4p3vYMnyuu3Gk4sQ9IuBlamfkGW90A6U` | `rentpact::decision::market` |
| `RY224ZVsoCIISRI9ltbyxLHnQNSYNiPDqNpOIzOrzZ0` | `rentpact::decision::problem-frame` |
| `gt3NlcEH_viUMHeYiAp_IiueZjJ8AakoDvs1K6JgqdE` | `rentpact::decision::chain` |
| `qPsq_TVL06ibPQmFdxi714r3N6QU5zqF5cIDK9TQx2g` | `rentpact::decision::currency` |
| `zC4kC5pSdM10knjy-fdDBX9dpwtELuFyL6cWG6k0KeA` | `rentpact::decision::cross-chain` |
| `ZYFZxDyzeh63ZS7nmum6StEQf6-vlMj0gd2dxXdwSA0` | `rentpact::decision::release-schedule` |
| `yavIu0fRhAkRwZmnRl5RtsTThBmcRaBxsqYiomGfwII` | `rentpact::decision::caution-fee-return-window` |
| `t4F1i6D8QvxYV_X53h-E9k2h98Gd5_09vdlitBcLsE8` | `rentpact::decision::freeze-mechanism` |
| `9sUZvKRVK8E8E4ube3szL7UkNSZN21ND8X_l9UZTJ_c` | `rentpact::decision::dispute-model` |
| `UGPt07T3COOCKhcxCHWqYsDyepTOOGFp0B_Pf7hr-PQ` | `rentpact::decision::dispute-trigger` |
| `APSKL8v-q3caBj3GcfaTjLbwoHFSCBH1P4u3mgAy5bM` | `rentpact::decision::onboarding` |
| `KcHrDD6RVhexHXgGIPbq8D-K8zoMVFxdMNnQHFl9XF4` | `rentpact::decision::gas-model` |
| `hNWWibFnoCO1E1KIapegUo9ZG9Bpp_w8ExePGHWoRok` | `rentpact::decision::launch-positioning` |
| `jEBeYF2OhHJf35ejIYHqGjj-Q0ah8PYb5THDOx6F2LQ` | `rentpact::decision::vertical-expansion` **(open)** |
| `7t88IeN0oqj62dKRXrBjI4KfVkmXaxYK7m5IFkkHCA0` | `rentpact::decision::arbiter-selection` **(open)** |
| `vI0lhFrcsymg_SJNS_aac8G_XJl__Ua0OvrgKsMuzjA` | `rentpact::decision::rental-credential` **(open)** |
| `GhYKP9LSiG2SpPD5ICm1-avocoMkidBSdfywO64FtCw` | `rentpact::decision::bio-copy` (settled — Option A) |
| `yi2HtNpoA_Wg6wd-S6j6Z3RtPANNHRVNdX7ODxmz4SI` | `rentpact::decision::bio-copy` (rejected — Option B) |

### Terms (6 of 7)
| blob_id | namespace |
|---|---|
| `TVUwXF4BVJMax7nlTSnc2IGD662EZ73fn3I4Qq8kS88` | `rentpact::term::caution-fee` |
| `lFABbxa_KhOjEuI7B0t3rPl6S1MAjSNjIkC_LTkulOE` | `rentpact::term::escrow` |
| `qYfQQ3j2OnMSCykFhUyevfe5G-uJ583HVNO056d9hLg` | `rentpact::term::freeze` |
| `-9XBwvES3QLZclAA0t3bOYvJPzkqZfqO7Yh3lzvwSlw` | `rentpact::term::move-in-baseline` |
| `DeCA9Xwwexj-l-Qi98Cq3-JZwl7NKYenTGDqodDpRec` | `rentpact::term::arbiter` |
| `C-bAaS37psv2mEAvMznFpfG3t6fPbjtGUgCMhlTnMro` | `rentpact::term::gas-station` |

### Entities (6)
| blob_id | namespace |
|---|---|
| `OVQOEkfMsa2_IsCHZjS5Ksd-zalOLcLKFrymvYZMN_c` | `rentpact::char::tenant` |
| `1YsDsUvlNRP-4mOTVkaS5RtqEHQKHGuw6iDr6cUKZtE` | `rentpact::char::landlord` |
| `6XFSHwTCM38mAZmJBtPzwaAA9ORSVBOO2npMHrcvM1U` | `rentpact::char::arbiter` |
| `DzHB7KCmy7x0kRLXDg8ZxaHwNjDxdn7pytls103iv6Q` | `rentpact::object::escrow-contract` |
| `x8KTJUuDpbOw4mTTNEtD-fgZb-j3NFHM8WnpEDFNjhE` | `rentpact::object::evidence-bundle` |
| `fOE73rHrUychzFTD4RgLkAqzvUlciIaC1l2_dXOG2FE` | `rentpact::object::rental-credential` |

### Still missing — 5 records, `demo/gap-fill.mjs` retry attempt 1 wrote 0

| namespace | seed failure | gap-fill outcome |
|---|---|---|
| `rentpact::rule::caution-fee-custody` | HTTP 429 | recall 429 → refused to write |
| `rentpact::decision::bio-copy` (Option C) | HTTP 429 | recall 429 → refused to write |
| `rentpact::term::cctp` | HTTP 429 | recall 429 → refused to write |
| `rentpact::place::arc` | job timeout after 120s | recall 429 → refused to write |
| `rentpact::events` | HTTP 429 | recall 429 → refused to write |

**Writing 0 of 5 was the correct behaviour.** Every dedup recall failed with HTTP 429 after four
retries and escalating backoff (3s / 6s / 9s). The script refused to write rather than assume the
namespaces were empty:

```
SKIPPING: could not verify (recall failed, not empty)
```

Had it treated a rate-limited recall as "no canon found", it would have written five records that may
already exist — permanent duplicates on append-only storage with no delete path. This is §1's
empty-vs-failed distinction preventing real, unrecoverable damage.

**Retry when the relayer recovers.** `node gap-fill.mjs --write` is idempotent by per-record dedup;
run it again after a quiet period. These 5 records are not required for eligibility — 49 blobs
already clears the 10-blob minimum nearly fivefold.

> **Why a separate gap-fill script.** `seed-rentpact.mjs` guards against duplicates at *namespace*
> level, which is too coarse here: `rentpact::decision::bio-copy` already holds 2 of its 3 records, so
> a re-run would skip the namespace entirely and strand the third permanently. `gap-fill.mjs` uses
> per-record dedup instead — recalling each candidate's own text and skipping only if the nearest
> distance is below 0.25, the measured verbatim-duplicate threshold. That is §4 of the prompt applied
> literally, and it is the only safe way to re-run a partially-failed batch against append-only
> storage.

---

## ✅ RUNNING TOTAL: 49 blobs on Walrus Mainnet

**Minimum required for submission: 10 — cleared with margin.**

Report **49** as the blob count on the DeepSurge form (up to 54 once `gap-fill.mjs` completes —
recount from this file before submitting), alongside agent ID
`7701cacb25267d9b361e57f0a6803ad053d8d98e90f729089cfef12ee1f1651c`.

Spread across **two unrelated projects on one account** — `prompt-evolution::*` (16) and
`rentpact::*` (33). That split is itself evidence: canon is scoped per project, not per tool.

---

## Independent on-chain verification — 2026-08-12

All 14 blob IDs fetched from the **official Walrus mainnet aggregator**, independently of MemWal:

```
https://aggregator.walrus-mainnet.walrus.space/v1/blobs/<blob_id>
```

**Result: 14 / 14 returned HTTP 200**, payloads 587–937 bytes. Sizes exceed the plaintext records
because MemWal SEAL-encrypts before upload, so the stored bytes are ciphertext — the memories are
encrypted at rest on Walrus, not public.

This is the verification that matters: the aggregator is Walrus infrastructure, not MemWal's relayer,
so a 200 proves the blob is genuinely stored on Walrus mainnet rather than merely accepted by a
queue.

### Explorer links (all confirmed reachable)

| What | URL |
|---|---|
| **MemWalAccount object** (use for the form's explorer field) | `https://suiscan.xyz/mainnet/object/0xfedbe55fbd3350a3e9e18747cbbdadcf235eb6eca867f9b6dd51ef3ec1f3b107` |
| Same, alternate explorer | `https://suivision.xyz/object/0xfedbe55fbd3350a3e9e18747cbbdadcf235eb6eca867f9b6dd51ef3ec1f3b107` |
| Sessions wallet activity | `https://suiscan.xyz/mainnet/account/0x51f2d246f0f193aa45af81d6afe260e6c681e99b14fce98d211cac3ff5428879` |
| Any individual blob | `https://walruscan.com/mainnet/blob/<blob_id>` |
| Raw blob bytes | `https://aggregator.walrus-mainnet.walrus.space/v1/blobs/<blob_id>` |

> The MemWalAccount is a **Shared** object, so it will not appear under the wallet's "Owned Objects"
> on any Sui explorer. Link to the object address directly.

## What the explorer link does NOT show

Suiscan lists only **3 transactions** against the account object:

| Func | Age | Sender |
|---|---|---|
| `add_delegate_key` | today | `0x51f2d246…` (Sessions wallet) ✓ |
| `legacy_import_delegate_key` | 12d | `0xcbf358…1b4ce352` (MemWal migration) |
| `legacy_import_account` | 12d | `0xcbf358…1b4ce352` (MemWal migration) |

**None of the 14 memory writes appear on-chain against this object.** The relayer performs the Walrus
upload and holds vector metadata in its own database; `MemWalAccount` tracks account and delegate
state only. So the explorer link proves the account exists and is bound to the Sessions wallet — it
does **not** demonstrate that memories exist.

Pair it with Walruscan blob links on the form. Those are the ones that show actual memories.

Note also: this account was created by MemWal's **migration 12 days ago**, not minted fresh at login.
Today's `add_delegate_key` only attached the new delegate to an object that already existed.

## Legacy data — present but unreachable

```
restore("buildmem-hackathon") -> {"restored":0,"skipped":19,"total":19,
                                  "owner":"0x51f2d246…","truncated":true}
recall("buildmem-hackathon")  -> 0 records
```

The migration carried metadata for **19 records** across, then skipped every one of them. Recall
returns nothing. The data is present and permanently inaccessible.

Two consequences:

1. **Report 14, not 33.** The 14 blobs in this file are aggregator-verified, recallable, and written
   inside the Hackathon Duration. The 19 legacy records cannot be demonstrated to anyone.
2. Project notes recorded **22** blobs in the old namespace; the relayer reports **19**. Neither is
   verifiable, because no operation enumerates blobs — see `bug-reports.md` Issue 3.

## Dedup calibration — measured 2026-08-12

Measured by recalling each candidate's **own text** against
`prompt-evolution::decision::prompt-choice` (5 records).

| case | distance | v2 band | action taken | correct? |
|---|---|---|---|---|
| Verbatim duplicate | 0.0000 | SKIP | skip | ✓ |
| Reworded, same claim | 0.0421 | SKIP | skip | ✓ |
| Same entity, different claim | 0.2625 | DECIDE | write as new fact | ✓ |
| Unrelated project | 0.5926 | AMBIGUOUS → name tiebreak | no name match → write | ✓ |
| Wholly unrelated | 0.9128 | WRITE | write | ✓ |

**Result: v2's default bands are correct for this relayer and are retained unchanged.**

Two findings worth carrying into the article:

1. **The undefined gap is reachable.** Case D measured **0.5926** — inside the `0.55–0.70` band the
   original Continuity Keeper left with no rule at all. v2's entity-name tiebreak resolved it
   correctly. The gap fix addresses a real case, not a hypothetical one.

2. **Naive calibration is worse than the defaults.** Deriving boundaries by interpolating between the
   known-duplicate (0.0000) and known-unrelated (0.9128) endpoints yields SKIP `< 0.304` — which
   would sort case C (0.2625, a genuinely new fact) into SKIP and silently drop it. §4 should specify
   that calibration **validates** the bands against labelled cases rather than interpolating between
   two endpoints.

---

## Recall distances observed (query → record)

Query: *"which prompt is being evolved"* against the namespace above.

| distance | record |
|---|---|
| 0.4193 | rejected — BuildMEM Agent |
| 0.4886 | settled — Continuity Keeper |
| 0.5155 | rejected — Continuum |
| 0.5320 | rejected — Markov |
| 0.5421 | rejected — Exam Mistake Memory |

> **These are NOT dedup calibration values.** They are distances from a *topical query* to each
> record. §4 dedup measures the distance from a *candidate record's own text* to its nearest
> neighbour, which is a different quantity. Calibration must be derived separately — see
> `prompt-evolution::meta`.
>
> They are still informative: the closest match to a directly relevant query is 0.42, which suggests
> this embedding model's distances run high. If so, v2's default bands (0.25 / 0.55 / 0.70) are
> mis-set for this relayer — which is precisely the failure §4's calibration requirement exists to
> catch.

## Daily log

| blob_id | namespace | date |
|---|---|---|
| `Z4DJQxUsOpnZ6dv8QHPkCLIvWzroNqwlkzedjB75Pto` | `rentpact::decision::pricing` | 2026-08-13 |
