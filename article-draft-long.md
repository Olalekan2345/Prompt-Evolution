# I Was Re-Explaining My Project to AI Every Single Session. Then It Started Arguing With Me.

*How I gave my AI collaborator a permanent memory on Walrus — and what happened the first time it
refused one of my ideas.*

---

I'm building RentPact, a USDC rent-escrow product for Lagos. The problem it solves is one every
Nigerian tenant knows: you pay one or two years of rent upfront, hand over a "caution fee" you will
never see again, and sign an agreement that protects exactly one person — not you.

The product has a lot of moving decisions. Rent sits in escrow and releases on a schedule. The
caution fee never touches the landlord. Disputes are settled by photo evidence compared against a
move-in baseline, not by argument. Users never see a seed phrase or pay gas.

Every one of those was decided once, carefully, with a reason.

And every time I opened a new AI session, none of them existed.

I'd explain the caution-fee model again. I'd re-justify why we settle on Arc instead of somewhere
with deeper liquidity. Twice, an assistant proposed letting landlords hold the caution fee in a
sub-account "for faster deduction" — a suggestion that quietly destroys the entire premise of the
product, offered helpfully, because it had no way of knowing we'd already ruled it out.

That's the tax. Not that the AI is wrong. That it's *reasonably* wrong, over and over, because
nothing in the loop remembers what's already settled.

## What I actually did about it

I took a prompt called **Continuity Keeper** — written for novelists to stop dead characters walking
back into chapter nineteen — and rebuilt it for decisions.

The insight that made it work: *a dead character speaking again and a rejected approach being
re-proposed are the same failure.* New work contradicting established truth. The machinery doesn't
care which domain it's in.

The prompt sits on **Walrus Memory**, which stores memories on Walrus — decentralised storage, tied
to my wallet rather than to any one AI tool. That last part matters more than it sounds. My project
memory isn't inside Claude Code. It's mine, and any tool I sign into can read it.

Every turn, the agent does four things: recalls what canon already says, checks the new work against
it, writes only durable facts, and — because Walrus is immutable — updates canon by appending rather
than editing.

## What it actually remembers

Not conversation. Not transcripts. Facts, one per memory, each in its own namespace:

```
rentpact::rule::caution-fee-custody
  The caution fee never enters the landlord's custody at any point in the lease
  lifecycle; it is held in escrow and returns to the tenant automatically. Any
  design in which the landlord holds, controls or routes the caution fee violates
  the product's core premise.

rentpact::decision::currency
  All deposits, scheduled releases and refunds are denominated in USDC; rent money
  must never be exposed to price volatility.

rentpact::decision::vertical-expansion   [OPEN]
  Extending the escrow engine to event halls, studios and short-lets is stated
  public vision but not committed scope.
```

Note that last one. It's marked **open**, not settled. That distinction turned out to be the single
most useful thing I added, and I'll come back to it.

I seeded 49 records across two projects. They're on Walrus mainnet — anyone can fetch one:

```
https://walruscan.com/mainnet/blob/v14MnlqtllF_lCLMeEjK_Zu8Cs_G482_BlXMA7s1Wkk
```

It comes back as ciphertext. Memories are encrypted before they're stored.

## The first time it changed a session

I asked for something reasonable. Something I'd have accepted.

```
❓ is expanding to short-lets a committed decision?

  ANSWER  [OPEN]

  Extending the escrow engine to event halls, studios and short-lets is stated
  public vision but not committed scope; sequencing, timing and product
  differences are undefined.

  source : rentpact::decision::vertical-expansion
  blob   : jEBeYF2OhHJf35ejIYHqGjj-Q0ah8PYb5THDOx6F2LQ
```

I'd been about to plan sprint work around short-lets as though it were roadmap. It isn't. It's
marketing copy I wrote for an X thread and then half-remembered as a commitment.

Nothing dramatic happened. That's the point. A decision I'd mentally promoted from "vision" to
"committed" got demoted back, by a record I wrote myself three days earlier and had already
misremembered.

## The time it stopped me writing garbage

This one I didn't plan.

Halfway through seeding, I was convinced a batch of records had already been written. The agent
checked first — its recall-before-write step — and found all six target namespaces empty. The batch
had never run. I'd have written six duplicate records on top of nothing, or worse, if I'd been wrong
in the other direction, six duplicates on top of six originals. On storage with **no delete
operation**.

Later the same day it went further. A partial batch had failed to rate limits, so I re-ran the
fill script. Every verification call came back rate-limited too, and the script simply stopped:

```
SKIPPING: could not verify (recall failed, not empty)
```

It wrote nothing. It couldn't tell whether those records already existed, so it refused to guess.

That distinction — between *"I found nothing"* and *"I couldn't look"* — is a rule I added to the
prompt on a hunch, thinking it was a rare edge case. It paid for itself within a day, on permanent
storage I can't undo.

## The change I'm proudest of, and the number that justified it

The original prompt had a gap I couldn't unsee.

Before saving a fact, the agent scores how similar it is to what's already stored. Zero means
identical, one means unrelated. The original had rules for **below 0.25** (skip, duplicate),
**0.25–0.55** (decide), and **0.70 and above** (write).

Nothing covered **0.55 to 0.70.**

That's not a rare edge. It's roughly where *"same thing, worded differently"* lands — the exact case
the check exists for. An AI hitting an undefined rule doesn't stop and ask; it improvises. So you
either store a duplicate you paid for, or you silently lose a real fact and find out months later
when your canon contradicts itself.

I closed the gap and added a tiebreak on the entity's name. Then I measured, expecting to prove the
original's numbers wrong.

They were right. All five test cases sorted correctly — verbatim duplicate at 0.0000, a reworded
version at 0.0421, a genuinely new claim at 0.2625, an unrelated record at 0.5926.

**0.5926.** Inside the gap. A real record, on the first calibration run, landing exactly in the range
the original left undefined. A second measured 0.6286 the next day.

The thresholds were fine. The hole between them was the problem, and it was reachable on day one.

I also found that the obvious way to calibrate — interpolate between a known duplicate and a known
unrelated fact — produces a *worse* ladder than the defaults. It would sort that genuinely-new fact
at 0.2625 into "skip" and silently discard it. So calibration has to *validate* the bands against
labelled examples, never interpolate between two points. That correction only exists because I ran it.

## What went wrong

I'd be lying if I said this was smooth.

**The MCP bridge never worked once.** Every connection returned `HTTP 429` and crashed on a libuv
assertion. I reproduced it across two public IP addresses, two accounts and three delegate keys
before accepting the fault wasn't mine. Everything here runs through the SDK instead — same service,
same account, different transport.

**A package migration stranded memories I'd written earlier.** MemWal's on-chain package moved. My
account and delegate key came across; the memory index didn't. The relayer still counts 19 records
under my wallet and returns zero of them:

```
restore()  ->  {"restored":0, "skipped":19, "total":19}
recall()   ->  0 records
```

Intact on Walrus. Permanently unreachable. No error, no warning, no migration path.

**And there's no way to list your own memories.** None. If you don't record a blob ID at the moment
you write it, it's gone — not deleted, just unfindable. I lost track of two of my own writes inside a
single afternoon and only recovered them because they surfaced as noise in an unrelated query.

I filed all of it — eight issues, with reproductions.

## Would I keep using it

Yes, and I have. The setup cost me a day I didn't plan to spend. What I got back is a project bible
that doesn't live in my head or in one tool's chat history.

The honest pitch isn't "AI with memory." It's narrower and more useful than that: **an AI that knows
what you already decided, and won't quietly talk you out of it.**

If you're managing anything with decisions that get revisited — a product, a codebase, a thesis, a
novel — that's the tax you're paying without noticing. Not wrong answers. Reasonable ones, that
contradict a call you already made and can no longer remember making.

## If you want to try it

The prompt is one file. Paste it as your agent's system prompt, point it at Walrus Memory, give it a
project name, and start working.

**Repo:** https://github.com/Olalekan2345/Prompt-Evolution

It includes runnable scripts — you can reproduce the calibration against your own account rather than
taking my numbers on faith.

Three things I'd tell you before you start:

1. **Write down every blob ID as you go.** There's no way to list them later. This is not optional.
2. **Measure your own distance bands** before trusting any thresholds, including mine.
3. **Only record what's actually decided.** The temptation is to save everything. A bible you don't
   trust is one you stop consulting, and on immutable storage you can't take it back.

---

*Built during the Walrus Sessions Prompt Evolution round, 11–13 August 2026. 49 records on Walrus
mainnet, every blob ID published in the repo.*

*#Walrus #WalrusMemory*
