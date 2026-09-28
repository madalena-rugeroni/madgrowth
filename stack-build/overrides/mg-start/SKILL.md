---
name: mg-start
description: Classify a founder's business before running any other mg-* skill — archetype (B2B SaaS, B2B services, B2C product, local service, media/audience, marketplace), stage, motion, price band, solo vs team, Builder Archetype, geography and build capacity — and write it to madgrowth/context.md so no later skill re-asks. Run this first, or whenever a founder says "start", "set up my business context", "what kind of business is this", "I'm starting a new project", or when any mg-* skill finds no context file.
---

# mg-start — the classifier

Every other `mg-*` skill routes on eight inputs. This skill captures them once, writes `madgrowth/context.md`, and names the next skill. Founders never need to call it on purpose; it runs the first time any skill finds no context file.

## If `madgrowth/context.md` already exists

Read it, summarise it back in three lines, and ask with one `AskUserQuestion` whether anything changed — options: *Nothing changed* / *Stage or customer count* / *Price or offer* / *Something else* (→ Other). Update only what changed. Then stop — do not re-run the interview.

## If it doesn't — the front door

Skip this if it's already obvious from the conversation: the founder named a specific business, arrived with a specific question ("help me price X"), or arrived from `mg-expertise-audit` with a chosen angle already in hand (go straight to Widget 1 with it pre-filled). Otherwise, before Widget 1, ask one `AskUserQuestion`:

**Where are you starting from?**
- *I have a business idea — let's build the file* (Recommended)
- *I have an idea, want a Go / No-Go check first*
- *I don't have an idea yet*

Route:
- First option → continue to Widget 1 below.
- Second option → run **mg-go-no-go** now (Skill tool, quick roast mode — five minutes, a verdict and the cheapest test, no file needed). When it's done, ask if they want to build the context file next.
- Third option → run **mg-expertise-audit** now (Skill tool — finds three angles from their career in about ten minutes). It hands back here once an angle is chosen, pre-filled into Widget 1.

This is one extra widget, not counted against the budget below — it only fires once, before any file exists.

## How to run it — with AskUserQuestion, never as typed answers

Founders click; they don't write. Every input below is captured with the `AskUserQuestion` tool (1–4 questions per call, 2–4 options each, the founder can always pick *Other*). Infer first from anything available — a URL, a repo, a deck, prior conversation — and pre-select by putting the inferred option first with "(Recommended)". Never ask a question you can already answer; say what you inferred instead. Aim for **two widget calls**, three at most.

### Before the first widget: read what exists
If there's a website, repo, README or deck in reach, read it and draft the two-sentence business description yourself. If there's nothing, the first widget's first question is "How should I learn about the business?" with options *Read this URL/folder* / *I'll describe it in one line* (→ Other).

### Widget 1 — archetype, stage, motion (4 questions)
1. **Who pays?** — *A company* / *A person, with their own money* / *Readers, sponsors or advertisers* / *Both sides of a match (marketplace)*
2. **What do they get?** — *Software they use* / *Human expertise (consulting, fractional, freelance, coaching, done-for-you)* / *A product — physical or digital* / *In-person work in an area*
3. **Paying customers so far?** — *None yet* / *1–10* / *10–50* / *50+*
4. **How does someone buy?** — *Sign up and pay on their own* / *Talk to me or a salesperson first* / *Walk in, call or order*

Map: company + software → `b2b-saas` · company + expertise → `b2b-services` · person + expertise → `b2b-services` with note "individual buyer" (coaching, career services, courses to professionals — the expertise frameworks fit; the buyer is emotional and the price band is lower) · person + product → `b2c-product` · anyone + in-person → `local-service` · readers/sponsors → `media-audience` · both sides → `marketplace: yes`. Routing rule: **who pays decides, never how you deliver.** Being solo is a modifier. Q3 → `stage`. Q4 → `motion` (`plg` / `sales-led` / `retail`).

### Widget 2 — price, unit, builder, geo (4 questions)
1. **What does one customer pay per year, roughly?** — *Under €500* / *€500–5,000* / *€5,000–25,000* / *Over €25,000* — the description asks them to pick Other and type the exact figure if they know it ("€79/mo", "€6k/mo retainer"). Record as stated → yearly value.
2. **Who delivers?** — *Just me* / *Me plus contractors* / *A team* (→ `solo` / `solo` with note / `team`)
3. **Your Builder Archetype** (from the Madgrowth diagnostic) — *Advisor — a few clients paying properly for judgment* / *Broadcaster — your name is the distribution* / *Productizer — package once, sell many* / *Venture Builder — the long game, an owned system*. Description: "Orchestrator (you build the machine, not the work) or not sure → Other." If not sure, ask the one question in `references/builder-archetypes.md` as a follow-up widget; record `(unverified)`.
4. **Is the business tied to an area?** — *No, anywhere* / *Yes, a city or region* / *Yes, a neighbourhood or radius*

### Widget 3 — only what's still open (skip if nothing is)
- **Capacity**: "If you needed a lead magnet next week, what could you ship?" — *A small tool or calculator* / *A template or scorecard* / *A document or guide*
- **b2c_form** (only if `b2c-product`): *Physical* / *Digital or app*
- **Marketplace sides** (only if marketplace): which side is harder to get — *Supply (the providers)* / *Demand (the buyers)*
- **Confirm the description** if you drafted it from a URL: *Yes, that's it* / *Close — I'll adjust* (→ Other)

If `capacity` is the only open item, fold it into a spare slot in widget 2 instead of a third call.

## Write the context file

Create `madgrowth/` if needed. Write exactly this shape:

```markdown
# Founder context
<!-- Written by mg-start. Every mg-* skill reads this first and never re-asks. Edit by hand when something changes. -->

business: <two sentences>
archetype: <b2b-saas | b2b-services | b2c-product | local-service | media-audience>
marketplace: <no | yes>
marketplace_sides: supply=<archetype> demand=<archetype> constrained=<supply | demand>
b2c_form: <physical | digital>
stage: <pre-customers | post-customers (n)>
motion: <plg | sales-led | retail>
price: <as stated → yearly value>
unit: <solo | team>
builder: <archetype> <(unverified) if guessed>
geo: <bound (area) | unbound>
capacity: <tool | template | document>

## Outputs
| # | Skill | File | Status |
|---|---|---|---|
| 1 | mg-talk-to-customers | madgrowth/01-evidence.md | — |
| 2 | mg-customer | madgrowth/02-customer.md | — |
| 3 | mg-offer | madgrowth/03-offer.md | — |
| 4 | mg-pricing | madgrowth/04-pricing.md | — |
| 5 | mg-positioning | madgrowth/05-positioning.md | — |
| 6 | mg-messaging | madgrowth/06-messaging.md | — |
| 7 | mg-go-no-go | madgrowth/07-go-no-go.md | — |
| 8 | mg-landing-page | madgrowth/08-landing-page.md | — |
| 9 | mg-lead-magnet | madgrowth/09-lead-magnet.md | — |
| 10 | mg-launch | madgrowth/10-launch.md | — |
| 11 | mg-get-customers | madgrowth/11-get-customers.md | — |
| 12 | mg-convert | madgrowth/12-convert.md | — |
| 13 | mg-retain | madgrowth/13-retain.md | — |
| 14 | mg-founder-content | madgrowth/14-founder-content.md | — |
| 15 | mg-numbers | madgrowth/15-numbers.md | — |

## Notes
<anything the founder said that later skills should know: constraints, history, what they've already tried>
```

Omit `marketplace_sides` and `b2c_form` lines when they don't apply.

## Name the next skill

- `pre-customers` → **mg-talk-to-customers**. Say why: everything downstream is built on evidence, and they have none yet.
- `post-customers` → **mg-customer** in data mode, then **mg-talk-to-customers** for win/loss interviews.
- If the founder came in with a specific question ("help me price this"), that skill runs next — immediately, in the same conversation. Skills run in any order; missing upstream outputs are assumed and labelled, never required.

End with the three-line summary of the context and the one next step. No menu of fifteen options.
