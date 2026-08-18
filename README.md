# madgrowth.io — rebuilt site

Static site, no build step. Two pages:

- `index.html` — the single-page site (hero → gap → how it works → who it's for → products → newsletter → about → testimonials → FAQ → final CTA)
- `diagnostic/index.html` — The Builder Diagnostic (8 multiple-choice scenarios → Builder Archetype, email gate → Kit)

Deploy the folder as-is to any static host (Netlify, Vercel, Cloudflare Pages, S3). `/diagnostic` resolves via the `diagnostic/index.html` convention.

## Before launch: replace placeholders

Everything lives in **`assets/js/config.js`** — one source of truth. Replace:

| Constant | What to put there |
|---|---|
| `STRIPE_LINK_STACK` | Stripe Payment Link URL for The Skills Stack (199€ one-time) |
| `STRIPE_LINK_AUDIT` | Stripe Payment Link URL for The Launch Audit (399€ one-time) |
| `CALENDLY_FIT_CHECK` | Calendly URL for the free 15-min fit check |
| `KIT_FORM_ID` | Kit (ConvertKit) form ID the site posts subscribers to |
| `KIT_TAGS.*` | Numeric Kit tag IDs for the five archetypes (`broadcaster`, `advisor`, `productizer`, `venture-builder`, `orchestrator`) plus `newsletter-direct` (Kit → Grow → Tags; the ID is in the tag's URL) |
| `LOOM_URL` | Loom **embed** URL for the 3-min Program walkthrough (`https://www.loom.com/embed/<id>`) |
| `LINKEDIN_PARTNER_ID` | LinkedIn Insight Tag partner ID |

Until a placeholder is replaced, the affected button stays visible but is inert and logs a console warning (`data-missing-config` attribute set) — nothing links to a dead URL.

### Stripe setup (do this in Stripe, not in code)

1. Create the two Payment Links at exactly the advertised prices: **199€** (Stack) and **399€** (Launch Audit). Advertised price must equal charged price.
2. The Launch Audit is fully async — no call to book. Its confirmation/redirect should go to an intake form (site URL, LinkedIn, current offer) so you have what you need to write the audit. That form doesn't exist yet; build one (Tally/Typeform/Google Form) and point the Stripe success URL at it. The old plan (redirect to a Calendly booking) no longer applies since there's no call.
3. On the **Stack** link, set the confirmation/redirect to wherever the Stack is delivered.

Both buy buttons on the site go straight to Stripe checkout (never to a booking page or form).

### Kit setup

The site posts to `https://app.kit.com/forms/<KIT_FORM_ID>/subscriptions` with:

- `email_address`
- `tags[]` — tag IDs from `KIT_TAGS` (diagnostic: the primary archetype tag; newsletter band: `newsletter-direct`)
- `fields[archetype]`, `fields[archetype_secondary]`, `fields[wiring]` — the diagnostic result (create matching custom fields in Kit); `wiring` is the five 0–100 dimension scores as one string
- `fields[newsletter_consent]` — always `"yes"` from the diagnostic gate: consent is required there (see below)

In Kit, set up:

1. An automation on the form that **delivers the free Expertise Audit skill** to every diagnostic subscriber.
2. Subscribe everyone from the form to **the Madgrowth newsletter**. The diagnostic gate makes the deal explicit and consent **required**: the checkbox (unchecked by default, must be ticked to submit) states that the free profile + skill arrive by email and that the email is subscribed to the newsletter, unsubscribe anytime. No email reaches Kit without that consent, so `newsletter_consent` is always `yes` from the diagnostic. The newsletter band (`newsletter-direct` tag) is self-evidently consent.

### Analytics

- **GA4** `G-6H3NDWYBL8` is live on both pages. Events fired: `diagnostic_start`, `diagnostic_complete` (with `archetype`, `archetype_secondary`), `email_capture` (with `archetype`), `newsletter_subscribe`, `stack_checkout_click`, `audit_checkout_click`, `fit_check_click`, `mazo_click`.
- **LinkedIn Insight Tag** loads only once `LINKEDIN_PARTNER_ID` is set.
- All outbound links get `utm_source=site&utm_medium=web&utm_campaign=core` appended automatically (existing UTM params are never overwritten).

### SEO / GSC

Title, meta description, and OG tags are set per the brief. The old Framer site had **no Google Search Console verification meta tag**, so there was nothing to carry over — if you verify via meta tag later, add it to both pages' `<head>`.

## Diagnostic scoring — The Builder Diagnostic

8 scenario questions, 4 short answers each. Every answer moves the visitor along five wiring dimensions (each −2 … +2, displayed 0–100):

| Dimension | Negative pole | Positive pole |
|---|---|---|
| Build | Creator-Led | System-Led |
| Risk | De-Risked | Bet Big |
| Pace | Compound | Sprint-First |
| Leverage | Craft | Audience |
| Revenue | High-Ticket | Volume |

The final wiring vector is matched (euclidean distance) against five archetype prototypes. Nearest = primary archetype, second-nearest = secondary.

**Gated reveal (the funnel logic):** finishing the scenarios shows only the hook — archetype name, tagline, and the five wiring bars. The full profile (personalized narrative, built-for-you / fights-your-wiring businesses, thrive/stress modes) unlocks **only after** the visitor submits their email with the required consent. The same submission triggers Kit to send the written profile + the Expertise Audit skill and subscribes them to the Madgrowth newsletter — that's the trade, stated plainly on the gate.

The five Builder Archetypes:

- **The Broadcaster** — creator-led, audience-leveraged, sprint-paced → audience-first launches, media brands, cohorts, digital products
- **The Advisor** — depth, high-ticket, de-risked → fractional leadership, consulting, advisory retainers, paid teardowns
- **The Productizer** — ship-fast, volume, packaged → toolkits, templates, self-serve courses, productized services
- **The Venture Builder** — system-led, bet-big, long-game → SaaS/micro-SaaS, AI tools, owned software
- **The Orchestrator** — system-led, de-risked, machine-thinking → agency/studio, AI-augmented services, done-for-you offers

## Acceptance criteria mapping (brief §1 / §5)

1. **One pricing section** — a single `#pricing` block in the DOM; breakpoints only change the grid layout, never the content or prices.
2. **All anchors resolve** — `#howitworks`, `#who`, `#pricing`, `#about` all exist; nav, footer, and in-page links point at them.
3. **Advertised = charged** — no strike-throughs anywhere; prices in copy must match the Stripe links you create.
4. **Buy buttons → checkout** — Stack and Launch Audit buttons link to Stripe Payment Links directly. The Launch Audit's post-payment intake form (if any) comes *after* checkout, never before it.
5. **No duplicate offer cards** — three cards, rendered once. (The pain **marquee** duplicates its track once for the seamless loop; the duplicate is `aria-hidden` and hidden entirely under reduced motion. Testimonials render once each.)
6. The word "quiz" appears nowhere in the rendered output.
7. The hero logo bar is an infinite CSS marquee (grayscale, edge-masked, pauses on hover); under `prefers-reduced-motion` it falls back to a static wrapped grid and the duplicate track is hidden.

## Motion system

Both pages share one motion layer (`assets/js/main.js` + the "Motion system" block in `assets/css/style.css`):

- **Scroll reveal** — elements marked `.reveal` (optionally `.reveal-scale`, and staggered via a `.stagger` parent or `.reveal-d1`/`-d2`/`-d3`) fade/rise into view once. Driven by one shared `IntersectionObserver`, with a `getBoundingClientRect`-based backup tied to the scroll tick plus a short bounded poll — belt-and-suspenders so a slow or unusual environment can't leave real content stuck invisible.
- **Progressive enhancement, not a gamble** — an inline script in `<head>` adds `.js` to `<html>` before first paint. All hidden-by-default reveal states are scoped under `html.js`, so a no-JS visitor (or a failed script load) sees the full page immediately — verified by removing the `.js` class and confirming every `.reveal` element resolves to `opacity:1; transform:none`.
- **Hero** — staggered entrance on load (not scroll-triggered, since it's always above the fold), plus a decorative `.hero-bg` layer: slow-drifting blurred blobs, a cursor-tracking spotlight (`--mx`/`--my` written on `mousemove`, pointer-fine only), and a faint grain overlay.
- **Buttons** — a shine sweep on hover (`::before`, CSS only) and an opt-in magnetic pull (`.btn-magnetic`, pointer-fine only) that drifts a few px toward the cursor.
- **Cards** — `.tilt` cards (steps, who-cards, pricing cards) get a cursor-following perspective tilt with no transition while the pointer is moving (crisp tracking), then a `.settling` class adds a spring-back transition on `mouseleave`.
- **Diagnostic page** — scenario changes get a brief fade+dip on the statement card; the wiring bars sweep their marker/fill out from center to value on reveal; the narrative, fit-cards, and edge-cards fade in staggered, gated to the actual unlock moment (they live inside `#full-report`, so they can't animate before the visitor has actually unlocked them).
- **Reduced motion** — `prefers-reduced-motion: reduce` is checked in both CSS (kills all animations/transitions globally) and JS (skips the parallax/magnetic/tilt effects entirely and reveals content immediately instead of animating it in).
- **Timers, not `requestAnimationFrame`, for deferred reveals** — some browser states (backgrounded/occluded tabs) suspend `requestAnimationFrame` and `IntersectionObserver` callback delivery entirely. Every "wait a tick, then apply the visible state" spot uses `setTimeout` instead, confirmed in testing to keep firing when rAF doesn't — so a visibility-API edge case degrades to "appears instantly, no animation" rather than "stuck invisible."

## Notes

- Old site spelled "Joāo Pelágio" (with `ā`); this rebuild uses the correct Portuguese "João" — flag if you want the old spelling back.
- Logos (18, from the old site, all with alt text): Meta, Microsoft, Nokia, SAP, Vodafone, Deloitte, ServiceNow, Delivery Hero, Talabat, Glovo, Careem, Bitpanda, Sword Health, OutSystems, Tripadvisor, Twitch, Sonae, Mercado Libre.
- Local preview: `python3 -m http.server 8000` from the repo root, then open `http://localhost:8000`.
