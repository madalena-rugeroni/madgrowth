---
name: mg-expertise-audit
description: Find a founder's three strongest monetizable angles from the career they already have — before there is a business idea — and route each angle to the kind of business it would be and the Builder Archetype it suits. Use when someone says "I don't know what I'd sell", "what could I build", "find my angle", "expertise audit", "what's my niche", "I have too many ideas", "turn my experience into a business", "what am I actually good at that people pay for", or when mg-start finds there is no business to classify yet. Skill 0 of the mg-* sequence — runs before mg-start; free.
---

# mg-expertise-audit — find your angle

The fifteen `mg-*` skills assume a business concept exists. Most operators arrive without one: a career, a set of things they're known for, and no idea which of them is a business. This skill turns the career into three candidate angles, each concrete enough to run through `mg-go-no-go` (quick roast) and then `mg-start`.

## Entry and interaction rules
- **Click, don't type.** Every question goes through `AskUserQuestion` — 1–4 questions per call, 2–4 options each, recommended option first. Three widget rounds, maximum. If a LinkedIn profile or CV is available, read it first and pre-fill.
- **No context file needed.** This skill runs before `madgrowth/context.md` exists. If one exists already, read it, say "you already have a business on file — this finds a second angle or re-checks the first", and continue.
- **Output is angles, not a verdict.** The roast (`mg-go-no-go`) judges them; this skill only finds them.

## The method
Baker's rule for experts: a position is the intersection of **what you've done repeatedly**, **what people already come to you for**, and **who has budget for it**. An angle is not a topic ("marketing") — it's a *who + problem + proof* triple: "seed-stage founders who just raised and have nobody owning pipeline — I've built that function three times." Three angles; the founder will recognise the right one the moment it's written down.

## Round 1 — the inventory (one widget, 4 questions)
1. **The repeat** — "Which of these have you done at least three times, in different companies or teams?" (multi-select; options drawn from the profile if read, else: built a function from zero · fixed something broken · scaled something that worked · led a transition — reorg, launch, market entry)
2. **The pull** — "What do people already come to you for, outside your job description?" (multi-select: to make the complicated clear · to make a hard call · to get something shipped · to fix the process)
3. **The proof** — "Which of these can you put a number on?" (multi-select: revenue or pipeline grown · a team hired or turned around · a launch or product shipped · cost or time saved)
4. **The room** — "Who was in the room when it mattered?" (single: founders/CEOs · VPs and directors · the team doing the work · customers or users) — this becomes the buyer.

Read `references/angle-patterns.md` for how answers combine into angles.

## Round 2 — the constraints (one widget, up to 4 questions)
1. **Builder Archetype** if known (Advisor / Broadcaster / Productizer / Venture Builder; Orchestrator via Other) — or "not sure" → suggest the diagnostic, proceed without.
2. **Time** — "What can you give this alongside the job?" (a few hours a week · a day a week · half my time · I'm out, full time)
3. **Refusal** — "Which would you refuse even if it paid?" (multi-select: being on camera / public · client calls all day · building software · managing people)
4. **Money shape** — "Which feels right for the first €10k?" (a few clients paying properly · many people paying a little · a product sold while you sleep · a mix)

## Draft the three angles
For each: **who** (from the room + repeat), **the problem** (from the pull, in the buyer's words), **the proof** (from the numbers), **what it would be** (archetype: b2b-services / b2b-saas / b2c-product / local-service / media-audience — from the money shape and refusals), **which Builder Archetype it fits**, and **the first customer you already know** (name the type, not the person). Rank by: proof strength × buyer budget × fit with constraints. Say why #1 is #1.

## Round 3 — confirm (one widget)
"Which angle do you want to take forward?" — the three angles + *None, re-run with different answers*. Then: "Roast it now, or set up the business file first?" (Roast (Recommended) / Set up the file / Both).

## Output — `madgrowth/00-angles.md`
```markdown
# Angles — <founder>
## The three
### 1. <angle name>
Who: … · Problem (their words): … · Proof: … · Would be: <archetype> · Fits: <builder> · First customer you already know: …
Why it's #1: …
### 2. …
### 3. …
## Chosen: <n>
## What the inventory said
<the four answers + constraints, one line each>
```

## Handoff
Chosen angle → **`mg-go-no-go`** quick roast (the free step that tells them if it holds), then **`mg-start`** with the angle pre-filled as the business description. If they picked "none", re-run Round 1 with the alternative option sets in the reference.
