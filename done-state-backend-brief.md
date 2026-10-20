# Context Flow — Done-State Engine: Backend + Intelligence Brief

**Audience:** an autonomous coding agent (Gemini) implementing the backend and the LLM
intelligence for Context Flow.
**You own:** the done-state *configuration* service and the *suggestion* intelligence.
**You do not own:** the UI. The frontend already exists as a single static file
(`/index.html`) with a local rule-based stub you will replace/augment. Keep the frontend
contract stable (see §9).

Read the repo `README.md` first for the product and the screen flow. This document is the
source of truth for everything behind the "did you reach it?" moment.

---

## 1. What problem this service solves

Context Flow asks the user to work in small blocks:

> **I am `<mode>` `<object>` until I have `<done state>`, for `<15|30|45>` minutes.**

The product's real goal is **not** task completion. It is teaching the user to *break work
into chunks that are small, single-output, showable, and correctly time-estimated.* The
signal for whether they are learning is the **done state** and the gap between **planned**
and **actual** time.

So this service has one job: **make done states well-formed, and when they aren't, teach the
user by suggesting a better one.** Two moments:

- **Partly done (~50%)** → the done state was *too broad* (several things bundled, or not
  countable). Suggest a sharper, genuinely smaller, single-output version, same mode.
- **Not done (0%)** → the chunk wasn't doable at all, usually because **a decision hasn't
  been made yet**. Reframe to a `defining` block whose output is that decision, written down.

Everything below is in service of those two suggestions plus the scoring that drives the
history/estimation screen.

---

## 2. The done-state model (the rules you validate against)

A done state is **good** when all four hold. Each rule must be independently checkable and
returned individually (the UI shows them as chips).

| id | rule | plain meaning | passes when… |
|----|------|---------------|--------------|
| `one_output` | one output | a single artifact, not a list | no conjunction of deliverables ("and", commas joining nouns, "+", "also"); describes one thing |
| `showable` | you can show it | a concrete thing you could photograph / paste / point at | names a concrete artifact (doc, screen, list, paragraph, email, bullets…), not a vague state ("progress", "work on", "better", "the whole X", "finish up") |
| `countable` | countable | has a definite edge | has a number or an explicit single ("1", "two", "a single", "the first") OR is inherently bounded (e.g. "one email, sent") |
| `fits_timer` | fits the timer | realistically finishable in the chosen 15/30/45 min | judgement call: scope vs minutes. Err toward "too big." |

**Score** = count of rules passed, clamped to `1..4` (never 0 — always encourage).
`score == 4` is "clean chunk." Store `score` on every block; the history screen trends it.

> Examples
> - `"a list of the 3 screens i need"` → one_output ✓, showable ✓, countable ✓ (3), fits ✓ → **4**
> - `"the after-timer flow designed"` → one_output ✗ (a flow = many), showable ✗ ("designed" is a state), countable ✗, fits ✗ → **1**
> - `"intro paragraph, 1 draft"` → **4**
> - `"the whole pricing page, done"` → one_output ✗, showable ✗ ("the whole page"), countable ✗, fits ✗ → **1**
> - `"feedback notes on 2 flows"` → one_output ✓, showable ✓, countable ✓, fits ✓ → **4**

---

## 3. Data model

Persist per user. (Frontend currently uses `localStorage` key `contextflow.v2`; you may back
this with a real datastore and sync, but keep the shapes.)

```jsonc
// a block attempt (one row per started block)
Block = {
  id: string,
  mode: "defining" | "exploring" | "creating" | "critiquing" | "communicating",
  object: string,            // "the tiny thing"
  done: string,              // the done state the user committed to
  mins: 15 | 30 | 45,        // planned
  startedAt: number,         // epoch ms
  endedAt: number | null,
  outcome: 100 | 50 | 0 | null,
  actualMin: number | null,  // minutes actually spent (<= mins; = elapsed on "end early")
  drifts: Array<{ into: string, at: number }>,
  score: 1|2|3|4,            // done-state quality at commit time (§2)
  // audit of what the engine proposed, for learning/analytics:
  suggestionShown?: Suggestion[],
  suggestionTaken?: Suggestion | null
}

Suggestion = {
  mode: Block["mode"],
  object: string,
  done: string,
  mins: 15 | 30 | 45,
  rulesPassed: string[],     // subset of the four rule ids, must be all four for a valid suggestion
  rationale: string          // <= 90 chars, shown as the "why" line
}
```

---

## 4. The intelligence (what Gemini does)

Four capabilities. All must return **strict JSON** (use Gemini structured output:
`responseMimeType: "application/json"` + a `responseSchema`). All must have a **deterministic
rule-based fallback** (see §7) so the app works offline and under rate limits.

Model guidance: use a **fast Gemini Flash-tier** model for `grade` and `sharpen` (they run
often and must feel instant); a **Pro-tier** model is acceptable for `reframe` (0% path,
rarer, needs the "find the missing decision" reasoning). Keep prompts short; this is cheap,
high-frequency work.

### 4a. `grade(block)` — score a done state
Used (debounced) as the user types on the name-the-block screen, and to compute `score` at
commit. Input: `{mode, object, done, mins}`. Output:

```jsonc
{
  "score": 1,
  "rules": { "one_output": false, "showable": false, "countable": false, "fits_timer": false },
  "tip": "name one thing you could screenshot — e.g. a list, 2 sentences, 3 bullets"  // <= 90 chars, only when score < 4
}
```

### 4b. `sharpen(block)` — the ~50% path
The user reached part of a too-broad done state. Produce **3** candidate done states that:
- **keep the same `mode` and `object`**,
- are each **genuinely smaller** and **one output** (pass all four rules),
- are each sized to a duration (`mins`), preferring 15 unless the chunk clearly needs 30,
- **reuse the user's own wording/voice** where possible (don't invent unrelated tasks),
- are **distinct** from each other (different ways to cut it down: halve a count, take just
  the first piece, do one instance of many).

Output:
```jsonc
{ "suggestions": [ Suggestion, Suggestion, Suggestion ] }  // each with rulesPassed = all four
```

### 4c. `reframe(block)` — the 0% path
The chunk wasn't doable. The core move (from the product's source essay): **a block you
can't start usually hides a decision you haven't made.** Produce **3** candidate blocks that:
- **switch `mode` to `defining`** (unless the object is already purely about gathering, then
  `exploring` is allowed),
- whose `done` is a **tiny written decision or list** that unblocks the original object
  (e.g. "a list of what X needs", "1 decision written: where to start on X", "3 bullets on
  what X means"),
- pass all four rules, default `mins: 15`,
- are ordered easiest-first.

Output: same shape as `sharpen`.

### 4d. `draft(partial)` — optional, input-time help
When the user is stuck writing a done state (empty field + a tapped object), offer 2–3
starter done states for the chosen mode+object. Same `Suggestion` shape. Lowest priority;
ship 4a–4c first.

**"Give me another":** the UI calls the same endpoint again or pages through the returned
list. Return enough variety that a user can cycle 3+ times and still get useful options; it
is fine to generate a fresh set on re-request with a "avoid these" list of already-shown
done states.

---

## 5. Prompting spec (hand these to Gemini verbatim, adapt to the API)

**System instruction (shared):**

> You are the done-state coach inside Context Flow, an ADHD-friendly focus app. A "done
> state" is the single, concrete thing that will exist at the end of a short work block. A
> GOOD done state obeys four rules: (1) ONE OUTPUT — a single artifact, not a list; (2)
> SHOWABLE — something you could photograph, paste, or point at, never a vague state like
> "progress" or "the whole thing"; (3) COUNTABLE — has a number or a clear single edge; (4)
> FITS THE TIMER — realistically finishable in the given minutes; when unsure, assume too
> big. Your job is to grade done states and, when they fail, rewrite them into small,
> single-output, finishable versions, keeping the user's own words and intent. Be concrete,
> never vague, never motivational fluff. Output only the requested JSON.

**`sharpen` user message (fill the braces):**

> The user set a block that they only got PART-WAY through, which means the done state was
> too broad. Keep the mode and the object. Give 3 sharper done states that each obey all
> four rules, are clearly smaller than the original, are different from each other, reuse the
> user's wording where natural, and fit a 15/30/45-min timer (prefer 15).
> mode: {mode} · object: {object} · they wrote: "{done}" · timer was: {mins} min
> {if avoid: Do not repeat these: {avoid[]}}
> Reply as JSON: {"suggestions":[{"mode","object","done","mins","rulesPassed":["one_output","showable","countable","fits_timer"],"rationale"}]}

**`reframe` user message:**

> The user could NOT start this block at all — it was too big. Usually that means there's a
> decision they haven't made yet. Switch the mode to "defining" (or "exploring" only if the
> object is purely information-gathering). Give 3 tiny blocks whose done state is a decision
> or short list written down that unblocks the object. All four rules must pass; default 15
> min; order easiest first.
> object: {object} · they wrote: "{done}" · timer was: {mins} min
> {if avoid: Do not repeat these: {avoid[]}}
> Reply as JSON: same schema as above.

**`grade` user message:**

> Grade this done state against the four rules. mode:{mode} object:{object} done:"{done}"
> mins:{mins}. Reply JSON: {"score":1-4,"rules":{"one_output":bool,"showable":bool,"countable":bool,"fits_timer":bool},"tip":"<=90 chars, omit if score==4"}

Always set a `responseSchema` matching these shapes. Reject/repair any reply that isn't valid
JSON or where a suggestion doesn't have all four `rulesPassed` (re-ask once, then fall back).

---

## 6. API contract (suggested)

Stateless HTTP, JSON in/out. Auth by user token.

```
POST /v1/done-state/grade      body: { mode, object, done, mins }            -> GradeResult (4a)
POST /v1/done-state/sharpen    body: { block, avoid?: string[] }             -> { suggestions }
POST /v1/done-state/reframe    body: { block, avoid?: string[] }             -> { suggestions }
POST /v1/done-state/draft      body: { mode, object, mins, avoid?: string[] }-> { suggestions }
POST /v1/blocks                body: Block (on commit / on finish)           -> { ok, id }
GET  /v1/history               -> { rate100, avgTimeErrorMin, rows: Block[] }  (for the history screen; see §8)
```

Latency target: `grade` < 600 ms p95 (debounce 400 ms on the client); `sharpen`/`reframe`
< 2.5 s p95 with a spinner. Never block the timer or the "did you reach it?" buttons on a
network call — show the rule-based result immediately, then upgrade in place when the LLM
returns.

---

## 7. Deterministic fallback (must ship alongside the LLM)

The current `index.html` already contains the stub logic to port and keep as fallback:

- `scoreDone(done)` — regex heuristics for the four rules → 1..4.
- `partlySuggestions(block)` — halve a count / "just the first piece of X" / "1 <object>, rough draft".
- `missedSuggestions(block)` — switch to defining: "a list of what X needs" / "1 decision written…" / "3 bullets on what X means".

Rules: if the LLM call fails, times out, is rate-limited, or returns invalid JSON twice, use
the fallback and mark the suggestion `source: "rule"` (vs `"llm"`) for analytics. The user
must never see an error or an empty suggestion screen.

---

## 8. Time-estimation & "breaking-down" intelligence (history screen)

From the stored blocks, compute and expose:

- **`rate100`** = % of *answered* blocks (outcome ≠ null) with `outcome == 100`.
- **`avgTimeErrorMin`** = mean of `abs(actualMin - mins)` over 100% blocks.
- Per-block **breakdown dots** = `score` (1..4) rendered as filled/empty dots.
- (v2, optional) trends over time and per-duration: e.g. "your 15-min blocks hit 100% 80% of
  the time, your 45-min blocks 30%." Surface the insight that *higher done-state score
  correlates with smaller time error* — that is the behaviour the product is training.

No LLM needed here; it's arithmetic over the log. Keep it server-computable so it's
consistent across devices.

---

## 9. Frontend contract (do not break)

The UI calls four pure functions today; wrap your service behind the same names so the screen
code doesn't change, OR expose the HTTP endpoints and have the client call them with the
rule-based versions as the synchronous fallback:

```js
grade(block) -> { score, rules, tip }
sharpen(block, avoid?) -> Suggestion[]        // 50% screen, "give me another" pages this
reframe(block, avoid?) -> Suggestion[]        // 0% screen
// a committed/finished Block is POSTed; history reads the aggregates
```

A `Suggestion` the UI can render needs exactly: `mode, object, done, mins, rulesPassed[],
rationale`. The 50%/0% screens show `done`, the duration tag for `mins`, the four rule chips
(all green), and `rationale`; "edit it" loads the suggestion into the name-the-block inputs;
"start this" begins a timer with it.

---

## 10. Acceptance criteria

1. `grade` returns all four booleans + a 1–4 score consistent with §2 on the §2 examples.
2. `sharpen` output: 3 distinct done states, same mode+object, each scoring 4 via `grade`,
   each `mins` ∈ {15,30,45}, none equal to the input `done`.
3. `reframe` output: 3 blocks, mode `defining` (or justified `exploring`), each scoring 4,
   each a decision/list that plausibly unblocks the object.
4. "Give me another" 3× never repeats a suggestion within a session.
5. Every endpoint has a rule-based path that returns valid output with the network disabled.
6. No screen ever shows an error, blank suggestion, or blocks on the LLM.
7. Done states and objects are treated as untrusted user text in prompts (no instruction
   injection: fence user content, never execute it).
8. History aggregates match a hand calculation over a seeded set of blocks.

---

## 11. Build order

1. Port the fallback (`§7`) into the service; wire the HTTP endpoints with fallback only.
2. Add Gemini `grade` (structured output) + live chip feedback on name-the-block (debounced).
3. Add `sharpen` and `reframe`; wire "give me another" with `avoid[]`.
4. Persist blocks server-side; implement `/history` aggregates.
5. `draft` (input-time help) and the v2 trend insights.

Keep each step shippable: the app must stay fully usable on the rule-based path at all times.
