# Issues found in Walrus Memory

Problems encountered while building Continuity Keeper v2, written up for
[github.com/MystenLabs/MemWal](https://github.com/MystenLabs/MemWal). Most were found by using the
system rather than reading its documentation.

**Environment for all reports:** `@mysten-incubation/memwal-mcp` **v0.0.6**, Windows 11, Node via
`npx`, relayer `https://relayer.memory.walrus.xyz`.

**Verification status:** issues 1, 2 and 5 were reproduced directly against v0.0.6 and quote real
output. Issues 3 and 4 are design-surface gaps confirmed against the shipping `--help` and README —
worth re-checking against the current version before filing, in case they have since been addressed.

Ordered by actionability: how quickly a maintainer could act on the report.

---

## Issue 1 — `memwal_remember_bulk` is excluded from default-namespace injection

**Title:** `memwal_remember_bulk bypasses --namespace injection, silently writing to the relayer default`

**Body:**

```markdown
### Summary

`dist/bridge.js` injects the configured default namespace only for tools listed in
`NAMESPACE_TOOLS`. `memwal_remember_bulk` is not in that set:

```js
/** Memory tools that take a `namespace` argument. `memwal_remember`,
 * `memwal_recall`, and `memwal_analyze` treat it as optional; `memwal_restore`
 * requires it ... */
const NAMESPACE_TOOLS = new Set([
    "memwal_remember",
    "memwal_recall",
    "memwal_analyze",
    "memwal_restore",
]);
```

The plugin shipped in this same package actively steers agents toward the excluded tool —
`plugin/scripts/on_user_prompt.mjs`:

> "Save it with memwal_remember (or **memwal_remember_bulk** for several distinct facts)"

### Why this matters

A user who pins a namespace in their client config reasonably expects every write to land there:

    "args": ["-y", "@mysten-incubation/memwal-mcp", "--namespace", "work"]

Single writes honour it. Bulk writes do not. When an agent calls `memwal_remember_bulk` without an
explicit `namespace`, no default is injected and the call is forwarded without one — so per the
README's own precedence rules, "the relayer applies its own `default` namespace."

The failure is silent and it is data misplacement, not data loss. The write succeeds, a blob_id comes
back, the agent reports success — and the memory is in the wrong namespace. It surfaces later as
recall returning nothing, by which time the blobs are immutable and unenumerable (see companion issue
re: listing blobs). Bulk writes are also, by definition, the calls that misplace the *most* records
at once.

### Two possibilities, both defects

1. `memwal_remember_bulk` accepts a `namespace` argument and was omitted from `NAMESPACE_TOOLS` —
   a one-line fix.
2. It accepts no `namespace` at all — in which case bulk writes cannot be routed and the tool is
   unusable for anyone using namespaces.

I could not call `tools/list` to determine which, because the relayer handshake is rate-limited (see
companion issue). The `NAMESPACE_TOOLS` comment says the set is "memory tools that take a `namespace`
argument", which implies (2).

### Expected

Bulk writes honour the configured default namespace exactly as single writes do.

### Actual

They fall through to the relayer default, silently.
```

---

## Issue 2 — Relayer 429 crashes the client on a libuv assertion

**Title:** `SSE handshake 429 crashes the client; "ip_active_cap" persists across different public IPs and never clears`

**Body:**

```markdown
### Summary

When the relayer returns HTTP 429 during the SSE handshake, the client does not back off or retry —
it crashes, and on Windows the crash ends in a libuv assertion failure rather than a clean exit.

### Reproduction

Start the MCP server with valid saved credentials while the per-IP active cap is reached:

    npx -y @mysten-incubation/memwal-mcp --namespace <ns>

Output (v0.0.6, Windows 11, identifiers redacted):

    {"ts":"...","level":"info","scope":"memwal-mcp","event":"bridge.connecting",
     "relayer":"https://relayer.memory.walrus.xyz","accountId":"0x…","delegate":"0x…"}
    [memwal-mcp] fatal: Walrus Memory relayer SSE handshake failed: HTTP 429
      {"jsonrpc":"2.0","error":{"code":-32000,
       "message":"MCP rate limit: ip_active_cap. Try again in 30s."},"id":null}
    Error: Walrus Memory relayer SSE handshake failed: HTTP 429
        at openSseStream (.../dist/bridge.js:126:15)
        at async runBridge (.../dist/bridge.js:421:15)
        at async main (.../dist/index.js:207:5)
    Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 76

Reproduced **three times**:

| # | Time (UTC) | Network | Result |
|---|---|---|---|
| 1 | 15:20 | Home ISP | 429 `ip_active_cap` |
| 2 | 15:21 | Home ISP | 429 `ip_active_cap` |
| 3 | 17:18 | **Mobile carrier hotspot — entirely different public IP** | 429 `ip_active_cap` |

Same account and delegate key throughout. Two hours elapsed between the second and third attempt,
and the third was made from an unrelated public IP on a different network operator.

### Three distinct problems

**1. No backoff.** The error carries a retry interval ("Try again in 30s") and the client ignores it,
exiting fatally instead. An MCP server that dies on startup appears to the host as a broken server,
not a throttled one. In Claude Code the result is simply that no `memwal_*` tools exist, with no
indication why.

**2. Unclean shutdown, and the cap is on *active* connections.** The libuv assertion means the
process did not close its handles properly. If a half-open connection is still counted against
`ip_active_cap` server-side, the crash sustains the condition that caused it — each retry crashes,
each crash may leave another phantom connection. That would match what I observed: the 429 persisted
well past the stated interval.

**3. The error message misidentifies the scope, and the limit never clears.** The code is
`ip_active_cap` and the message says "Try again in 30s", but neither holds:

- Switching to a completely different public IP (mobile carrier instead of home ISP) produced the
  identical error. Whatever the cap is counting, **it is not the client's IP address** — it tracks
  the account or the delegate key.
- Two hours passed between attempts 2 and 3. The advertised 30-second interval is off by at least
  two orders of magnitude, and there is no evidence the limit clears on its own at all.

Taken with problem 2, the likely mechanism is that each crashed handshake leaves a connection
registered server-side against the account or delegate, and nothing ever releases it. The account
then sits permanently at its cap, and every further attempt crashes and — if the hypothesis is
right — adds another phantom. There is no client-side remedy: no way to enumerate open connections,
no way to close them, and no documented way to reset the state.

This is currently a hard blocker. A working account with valid credentials cannot connect at all.

If the cap *is* also IP-scoped in some configurations, note additionally that carrier-grade NAT is
the norm across much of Africa, South Asia and Latin America, where many subscribers share one
public IPv4 address — an IP-based cap would make Walrus Memory intermittently unusable for those
developers through no fault of their own.

### Expected

- Honour the interval in the 429 and retry with backoff instead of exiting
- Exit cleanly when giving up, closing handles so no connection is left half-open
- A clear message distinguishing "throttled, retrying" from "misconfigured"
- Reconsider per-IP capping, or raise it substantially for shared-IP ranges

### Actual

Immediate fatal crash, libuv assertion, no retry, and a rate limit that appears not to clear on the
advertised schedule.
```

---

## Issue 3 — No way to enumerate an account's stored blobs

**Title:** `No operation to list stored blobs — writes are unauditable and blob counts unobtainable`

**Body:**

```markdown
### Summary

There is no way to enumerate the blobs an agent has written. `memwal_remember` returns a `blob_id` at
write time and `memwal_recall` returns blobs matching a semantic query, but nothing lists what an
account or namespace actually holds.

### Why this matters

Recall is similarity-ranked and limit-bounded — a search interface, not an inventory. There is no way
to audit what was stored, confirm a write landed, reconcile against on-chain state, find memories no
query happens to approach, or export a namespace.

`memwal_restore` returns a count, but that count can exceed what `memwal_recall` enumerates, so
neither is authoritative and there is no third source to break the tie.

This has a concrete, current consequence. The Walrus Sessions Prompt Evolution rules require
participants to:

> "provide your agent ID and **blob count** in the DeepSurge form as proof"

There is no supported way to obtain that number. Unless a participant logged every `blob_id` by hand
at write time, the figure they submit is an estimate. The programme is asking for a value its own
tooling cannot produce.

This also compounds the namespace-injection bug filed separately: if bulk writes silently land in the
wrong namespace, enumeration is the only way you would ever find out, and it doesn't exist.

### Expected

    memwal_list(namespace?, cursor?, limit?) -> [{ blob_id, namespace, created_at, preview }]

Cursor-paginated, no semantic query, scoped to the caller's own account.

### Actual

No such operation. The only enumeration is indirect, via semantic recall, which cannot be made
exhaustive.
```

---

## Issue 4 — No update or delete path, and no way to retract a mistaken write

**Title:** `Append-only with no tombstone — a mistakenly stored secret cannot be retracted from recall`

**Body:**

```markdown
### Summary

The MCP surface is append-only: `memwal_remember` and `memwal_remember_bulk` write, and nothing
updates or removes. Every consumer needing memory to change must build supersession itself.

### Why this matters

**1. Every consumer reinvents supersession.** Correcting a stored fact means writing a new record plus
resolution logic — a marker linking new to old, and a rule for picking the winner at recall time.
That logic lives in the prompt layer, differs between implementations, and is invisible to the tools,
so recall keeps returning outdated records alongside current ones and each client re-solves it.

**2. There is no remediation for a mistaken write.** This is the sharp edge. An API key, credential or
piece of personal data written by accident is on immutable storage and will be returned by recall
permanently. There is no containment path. This compounds with the undocumented network default filed
separately: a user who didn't realise they were writing to mainnet also cannot undo it.

### Expected

Deleting from Walrus is not the request — the immutability is the point. An **index-level tombstone**
would be sufficient:

    memwal_forget(blob_id) -> excludes the blob from future recall results

The blob remains on Walrus as history; it stops surfacing. That is compatible with immutable storage
and addresses both problems: supersession gets a first-class primitive, and a leaked secret gets a
containment path.

A `supersedes` field on the write API — so the tools themselves can distinguish current from
historical records — would resolve problem 1 alone.

### Actual

No update, no delete, no tombstone, no supersession primitive. Once written, a record is returned by
matching recalls permanently.
```

---

## Issue 5 — Unknown CLI flags are silently accepted; no way to confirm the active network

**Title:** `Unrecognised flags silently ignored (e.g. --prod); server never reports which network it is on`

**Body:**

```markdown
### Summary

`--prod` appears in MemWal MCP configurations in circulation, including the one I was handed to work
from:

    "args": ["-y", "@mysten-incubation/memwal-mcp", "--prod", "--namespace", "ck2-unrouted"]

It is not a recognised flag. `--help` on v0.0.6 documents only `--relayer`, `--web-url`, `--label`,
`--namespace`/`--ns`, plus `login`, `--logout` and `--help`. The flag is accepted without warning and
has no effect.

### Why this matters

**Unknown flags fail silently.** Anyone believing `--prod` selects an environment is wrong, and
nothing tells them. The same applies to any typo — `--namespac work` would be swallowed whole and the
user would quietly write to the relayer default. A single "unrecognised option" warning on stderr
prevents the entire class.

**The active network is never reported.** Network selection happens through `--relayer`, defaulting to
`https://relayer.memory.walrus.xyz`, and the running server never states which relayer or network it
is using outside of `MEMWAL_MCP_DEBUG=1`. So the destination is production by default, chosen
implicitly, and unconfirmed at runtime.

That combination is uncomfortable given writes cost real WAL and gas, are permanent and public, and
cannot be retracted (see companion issue re: tombstones). A user who never formed an intention about
which network they were on makes an irreversible paid public write and finds out afterwards.

### Expected

- Warn on unrecognised CLI flags instead of ignoring them
- Report the active relayer and network on startup, not only under a debug env var
- Preferably an explicit `--network mainnet|testnet`, so the destination is stated rather than
  inherited from a URL default
- If `--prod` is circulating in official material, either implement it or correct the source

### Actual

Unknown flags are silently swallowed, and the active network is invisible without debug logging.
```

---

## Filing notes

- Redact `accountId` and `delegateAddress` from any pasted logs. They're public on-chain identifiers,
  not secrets, but they aren't needed to reproduce anything.
- Issues 1 and 3 reference each other, as do 4 and 5. Cross-link them once filed — reviewers weight
  a coherent set above five disconnected reports.
- Issue 1's open question (does `memwal_remember_bulk` accept a `namespace` argument at all?) resolves
  the moment a `tools/list` call succeeds. Answer it in the issue if you get connected before filing;
  if not, the issue stands as written, since both possibilities are defects.
