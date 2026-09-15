/* ============================================================
   Madgrowth — diagnostic.js
   The Builder Diagnostic: 10 scenarios, multiple choice, scored
   across 5 wiring dimensions into a Builder Archetype —
   what kind of builder you are and which businesses fit.
   ============================================================ */
(function () {
  var track = (window.MGutil && window.MGutil.track) || function () {};

  // ---------- Wiring dimensions ----------
  // Each axis runs -2 .. +2. Negative pole first.
  var DIMENSIONS = [
    { key: "b", name: "Engine", neg: "You",                 pos: "The machine" },
    { key: "r", name: "Bet",    neg: "Reversible",          pos: "All-in" },
    { key: "p", name: "Tempo",  neg: "Long game",           pos: "This week" },
    { key: "l", name: "Moat",   neg: "What you know",       pos: "Who knows you" },
    { key: "v", name: "Buyers", neg: "A handful",           pos: "Thousands" }
  ];

  // ---------- Scenarios ----------
  var SCENARIOS = [
    {
      text: "The side project. The last thing you made outside your job description — what was it?",
      options: [
        { text: "A post, deck or doc that got passed around", w: { b: -2, l: 2, p: 1 } },
        { text: "A script, tool or automation I built in a weekend", w: { b: 2, p: 2, r: 1 } },
        { text: "Nothing — but people started booking 30 minutes with me", w: { b: -1, l: -1, v: -2 } },
        { text: "A plan or playbook the company adopted", w: { b: 1, p: -2, r: -1 } }
      ]
    },
    {
      text: "The win. Which win at work did you enjoy most?",
      options: [
        { text: "A launch with thousands of signups", w: { v: 2, l: 2 } },
        { text: "A deal I closed myself, with the CEO", w: { v: -2, l: -1 } },
        { text: "Something that kept selling after the team moved on", w: { v: 2, b: 1, p: 1 } },
        { text: "A quarter with zero churn", w: { v: -1, p: -2, r: -1 } }
      ]
    },
    {
      text: "The slack. The last time you had real free time — between jobs, after a launch — what did you do with it?",
      options: [
        { text: "Wrote and posted; my network grew", w: { l: 2, b: -1, p: 1 } },
        { text: "Shipped something rough and showed people", w: { b: 1, p: 2, r: 1 } },
        { text: "Took a paid project for someone's company", w: { v: -2, r: -1, p: -1 } },
        { text: "Worked on the plan: niche, offer, pipeline", w: { b: 2, p: -1, r: -1 } }
      ]
    },
    {
      text: "The risk. The biggest professional risk you've actually taken?",
      options: [
        { text: "Announced something publicly before I knew how to do it", w: { r: 2, l: 2, p: 1 } },
        { text: "Spent a year on one thing people said was too early", w: { r: 2, b: 2, p: -1 } },
        { text: "Asked for much more money than the going rate", w: { r: 1, v: -2 } },
        { text: "I don't take risks I can't undo — I pilot first", w: { r: -2, p: -1 } }
      ]
    },
    {
      text: "The inbox. The last three times a colleague asked for your help, what did they need?",
      options: [
        { text: "Explain it so leadership gets it", w: { b: -2, l: 1 } },
        { text: "Get it over the line", w: { p: 2, b: 1 } },
        { text: "A call on something ambiguous", w: { v: -2, l: -1 } },
        { text: "Fix why the process isn't working", w: { b: 2, p: -1, v: -1 } }
      ]
    },
    {
      text: "The failure. Which past failure still bothers you?",
      options: [
        { text: "Something good that nobody heard about", w: { l: 2 } },
        { text: "Something loud with nothing real behind it", w: { l: -1, b: 1, v: 1 } },
        { text: "Years of selling my time with nothing to show for it", w: { v: 2, b: 1 } },
        { text: "A rushed launch that broke in public", w: { r: -2, p: -2 } }
      ]
    },
    {
      text: "The best week. Your best working week ever — what made it?",
      options: [
        { text: "Something I wrote reached the right people", w: { b: -2, l: 2, v: 1 } },
        { text: "Heads-down building; the numbers moved on their own", w: { b: 2, v: 1, p: -1 } },
        { text: "Two conversations that changed someone's decision, then a free afternoon", w: { v: -2, l: -1, p: -1 } },
        { text: "It ran without me; I checked in for 30 minutes", w: { b: 2, v: -1, p: -2 } }
      ]
    },
    {
      text: "The offers. Four offers land the same week. Which do you take?",
      options: [
        { text: "Head of growth at a consumer brand — thousands of customers", w: { v: 2, l: 1 } },
        { text: "Fractional exec for five companies who pay properly", w: { v: -2 } },
        { text: "A royalty deal — less now, paid for years, no hours", w: { v: 1, p: -2, b: 1 } },
        { text: "Co-founder with real equity — two years before you know", w: { r: 2, b: 1, p: -1 } }
      ]
    },
    {
      text: "The side money. Have you made money outside a salary? What came closest?",
      options: [
        { text: "Advice or a project someone paid me for", w: { v: -2, l: -1 } },
        { text: "Something I made and sold — a template, a course, a product", w: { v: 2, b: 1 } },
        { text: "Sponsorship, ads or affiliate on something I published", w: { l: 2, v: 1 } },
        { text: "Not yet — salary only, so far", w: { r: -1, p: -1 } }
      ]
    },
    {
      text: "The near-miss. The last time something you owned was about to fail in public, what did you do?",
      options: [
        { text: "Said so early and asked for help", w: { r: 2, l: 2 } },
        { text: "Doubled down quietly until it worked", w: { r: 2, b: 2, p: -1 } },
        { text: "Cut scope and shipped the safe version", w: { r: -2, p: 1 } },
        { text: "Pulled it before anyone saw", w: { r: -2, p: -2 } }
      ]
    }
  ];

  // ---------- Archetypes ----------
  // proto: prototype position on each axis (-2..+2), used for matching.
  var ARCHETYPES = {
    broadcaster: {
      name: "The Broadcaster",
      tagline: "Your name is the distribution. You build in public — and demand comes to you.",
      proto: { b: -2, r: 1, p: 2, l: 2, v: 1 },
      narrative: [
        "You're wired to build as yourself, not behind a brand. Your unfair advantage isn't a product or a process — it's that when you say the thing everyone's thinking, the right people show up in your inbox. Attention is your raw material, and unlike most operators, you actually enjoy the exposure.",
        "That means the businesses that fit you are the ones where <strong>your voice is a feature, not a liability</strong>: audience-first launches, media-style brands, digital offers with demand built in before the product exists. You don't need to build the machine first. You need to be visible first — the machine comes second.",
        "The blind spot: Broadcasters generate demand faster than they can fulfill it. Reach without an offer is a hobby with good analytics. Your risk isn't obscurity — it's being three announcements deep with nothing packaged to sell behind them."
      ],
      builds: [
        "Audience-first launches with demand built in before day one",
        "A newsletter or media brand that compounds into paid offers",
        "Cohort programs and time-boxed drops",
        "Digital products sold to many at once",
        "Anything where your voice and perspective are the moat"
      ],
      avoids: [
        "White-label or behind-the-scenes work where you're invisible",
        "Slow infrastructure builds with nothing to show for months"
      ],
      thrive: "You turn attention into pipeline — one sharp post creates more inbound than most people's quarter of outreach.",
      stress: "You chase reach over revenue — publishing daily, converting nothing, mistaking impressions for a business.",
      flavor: "you want the work visible. Whatever you build, keep a public surface on it — your voice pulls people in."
    },
    advisor: {
      name: "The Advisor",
      tagline: "Depth over reach. A few clients who pay properly for judgment that took a decade to build.",
      proto: { b: -1, r: -1, p: -1, l: -1, v: -2 },
      narrative: [
        "You're wired for depth: fewer people, harder problems, higher trust. In a room with a genuinely ambiguous call to make, you're the calmest person there — and the one they call back. That's not a personality trait, it's an asset class. Most operators never learn to price it.",
        "The businesses that fit you <strong>sell judgment, not hours</strong>: fractional leadership, high-ticket consulting with a sharp named offer, advisory retainers, a paid teardown with a fixed price on it. You don't need an audience of thousands — you need fifteen people with budget who know exactly what you fix.",
        "The blind spot: Advisors under-price and over-deliver. The calendar fills, the rate stays flat, and eighteen months in you've rebuilt a job with worse benefits. Your risk isn't finding clients — it's never packaging, so every engagement starts from zero."
      ],
      builds: [
        "Fractional leadership across two or three companies",
        "High-ticket consulting with one sharp, named offer",
        "Advisory retainers with clear scope and a waitlist",
        "A productized audit or teardown at a fixed price",
        "A small paid community of senior peers"
      ],
      avoids: [
        "Volume plays — low-ticket products that need thousands of buyers",
        "Businesses that depend on daily content output to survive"
      ],
      thrive: "You're the person senior people trust with the decision they can't take to anyone else — and they pay accordingly.",
      stress: "You under-price and over-deliver until the calendar is full and the leverage is gone — a job, rebuilt.",
      flavor: "you sell judgment, not hours. Price for depth, keep the client list short, and protect the calendar."
    },
    productizer: {
      name: "The Productizer",
      tagline: "Package once, sell many. You turn what you know into things that work without you.",
      proto: { b: 1, r: 0, p: 2, l: 0, v: 2 },
      narrative: [
        "You're wired to ship. While others are still naming the planning doc, you have a v1 in someone's hands — and your instinct is always to turn messy, bespoke work into a thing with edges: a template, a system, a fixed price. That instinct is the whole game.",
        "The businesses that fit you are <strong>packaged and repeatable</strong>: toolkits and templates people buy off the shelf, self-serve courses with zero delivery time, productized services with fixed scope and fixed price. Your revenue should scale with copies sold, not hours worked — you feel that in your bones already.",
        "The blind spot: Productizers ship five small things instead of selling one properly. A graveyard of launches, each abandoned at the hard part — distribution. Your risk isn't building it. It's that nobody's job, including yours, is selling it."
      ],
      builds: [
        "Toolkits, templates and systems sold off the shelf",
        "Self-serve courses with zero delivery time",
        "Productized services — fixed scope, fixed price",
        "Digital products that improve with small weekly iterations",
        "A portfolio of small bets sharing one audience"
      ],
      avoids: [
        "Bespoke client work that reinvents the wheel every engagement",
        "Long enterprise sales cycles"
      ],
      thrive: "You compress a decade of expertise into a product someone can buy at 2am — and it actually works.",
      stress: "You launch a sixth thing instead of marketing the fifth — momentum mistaken for progress.",
      flavor: "you instinctively turn messy work into packaged things — use that to productize the core of whatever you build."
    },
    "venture-builder": {
      name: "The Venture Builder",
      tagline: "The long game. You'd rather spend two years building something that could be worth twenty.",
      proto: { b: 2, r: 2, p: -1, l: -1, v: 1 },
      narrative: [
        "You're wired to build the machine itself. Where others see a service to sell, you see a workflow to automate, a product to own, equity-style upside that doesn't cap out at your calendar. And you're willing to bet big on it — patience plus conviction is a rare wiring.",
        "The businesses that fit you are <strong>owned systems</strong>: SaaS or micro-SaaS in a niche you know cold, AI tools that replace a workflow you've personally run a hundred times, software where the moat is the build itself. Your industry knowledge is the unfair advantage most technical founders never have.",
        "The blind spot: Venture Builders build for one more quarter before talking to a customer. Perfect architecture, zero distribution. Your risk isn't the product failing — it's the product working and nobody ever finding out."
      ],
      builds: [
        "SaaS or micro-SaaS in a niche you know cold",
        "AI-powered tools that replace a workflow you've run yourself",
        "A marketplace or platform inside your industry",
        "Software with equity-style upside you fully own",
        "Products where the moat is the build"
      ],
      avoids: [
        "Services businesses that cap out at your calendar",
        "Anything that needs daily public visibility to survive"
      ],
      thrive: "You see the system behind the problem — and build the thing that makes the old way obsolete.",
      stress: "You build one more quarter before talking to a single customer — architecture perfect, pipeline empty.",
      flavor: "part of you wants to build the machine itself. Keep a product bet on the roadmap — but ship distribution first."
    },
    orchestrator: {
      name: "The Orchestrator",
      tagline: "You don't do the work — you build the machine that does. Teams, systems, leverage.",
      proto: { b: 2, r: -1, p: -1, l: -1, v: -1 },
      narrative: [
        "You're wired to run things. Your talent isn't the deliverable — it's the delivery: the system that makes quality boringly repeatable, the machine that runs on the weeks you're away. Most builders romanticize doing the work. You know the leverage is in orchestrating it.",
        "The businesses that fit you are <strong>machines with margins</strong>: a boutique agency or studio with a small senior team, AI-augmented service delivery running your playbook, done-for-you offers where the system — not your hours — is the product. You scale past your own calendar faster than any other archetype.",
        "The blind spot: Orchestrators optimize the machine before there's demand to feed it. Process built for ten clients, pipeline built for one. Your risk isn't operations — it's that nobody owns getting customers, because that part never felt like a system."
      ],
      builds: [
        "A boutique agency or studio with a small senior team",
        "AI-augmented service delivery — your playbook, automated",
        "Done-for-you offers with systematized delivery",
        "A portfolio run on operators and systems, not your hours",
        "Licensing your playbook to other operators"
      ],
      avoids: [
        "Solo creator businesses where everything needs your face",
        "One-off gigs with no repeatable system behind them"
      ],
      thrive: "You make delivery boringly reliable — clients feel it, margins show it, and it runs while you're away.",
      stress: "You perfect the process for ten clients while the pipeline holds one — the machine starves.",
      flavor: "you think in systems. Whatever you launch, you'll scale it past your own hours faster than most."
    }
  };

  // Opening line of the narrative keyed to the strongest wiring signal.
  var SIGNAL_LINES = {
    "b-": "The strongest signal in your answers: you're built to work under your own name, in the open.",
    "b+": "The strongest signal in your answers: you'd rather build the system than be the show.",
    "r-": "The strongest signal in your answers: you de-risk before you leap — evidence first, commitment second.",
    "r+": "The strongest signal in your answers: you back yourself when the stakes are real.",
    "p-": "The strongest signal in your answers: you play long games and let them compound.",
    "p+": "The strongest signal in your answers: you move in sprints — ship, read the signal, ship again.",
    "l-": "The strongest signal in your answers: your moat is what you know — the work itself is what people pay for.",
    "l+": "The strongest signal in your answers: your moat is who knows you — distribution finds you when you're visible.",
    "v-": "The strongest signal in your answers: you want fewer, deeper clients — high trust, high ticket.",
    "v+": "The strongest signal in your answers: you want revenue that scales with copies, not hours."
  };

  // ---------- State ----------
  var answers = []; // option index per scenario
  var current = 0;
  var started = false;
  var result = null;

  var el = {
    run: document.getElementById("diag-run"),
    result: document.getElementById("diag-result"),
    num: document.getElementById("scenario-num"),
    text: document.getElementById("scenario-text"),
    options: document.getElementById("option-stack"),
    back: document.getElementById("btn-back"),
    progressLabel: document.getElementById("progress-label"),
    progressFill: document.getElementById("progress-fill"),
    name: document.getElementById("result-name"),
    tagline: document.getElementById("result-tagline"),
    dims: document.getElementById("dim-grid"),
    narrative: document.getElementById("result-narrative"),
    builds: document.getElementById("result-builds"),
    avoids: document.getElementById("result-avoids"),
    thrive: document.getElementById("result-thrive"),
    stress: document.getElementById("result-stress"),
    gate: document.getElementById("email-gate"),
    gateForm: document.getElementById("gate-form"),
    gateEmail: document.getElementById("gate-email"),
    gateConsent: document.getElementById("gate-consent"),
    gateStatus: document.getElementById("gate-status"),
    thanks: document.getElementById("gate-thanks"),
    fullReport: document.getElementById("full-report")
  };

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  var KEYS = ["A", "B", "C", "D"];
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveals newly-inserted .reveal elements a tick later so the CSS
  // transition actually runs (setting opacity:0→1 in the same paint
  // as insertion would skip straight to the end state). setTimeout,
  // not rAF: rAF is suspended in some backgrounded/occluded tab
  // states (confirmed in testing) while timers keep firing, and this
  // content must never end up permanently stuck invisible.
  function revealSoon(root) {
    var scope = root || document;
    // querySelectorAll only matches descendants, never the scope
    // element itself — so a root that's directly .reveal (like
    // #email-gate) needs adding back in explicitly.
    var els = Array.prototype.slice.call(scope.querySelectorAll(".reveal:not(.is-visible)"));
    if (scope.nodeType === 1 && scope.classList.contains("reveal") && !scope.classList.contains("is-visible")) {
      els.unshift(scope);
    }
    if (!els.length) return;
    if (reducedMotion) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    window.setTimeout(function () {
      els.forEach(function (el) { el.classList.add("is-visible"); });
    }, 20);
  }

  // Wraps a scenario-index mutation (advance/back) in a brief fade+dip
  // transition on the statement card, skipped entirely under reduced
  // motion so nothing ever waits on an animation that won't play.
  function renderTransitioned(mutate) {
    var card = document.querySelector(".statement-card");
    if (!card || reducedMotion) {
      mutate();
      render();
      return;
    }
    card.classList.add("is-switching");
    window.setTimeout(function () {
      mutate();
      render();
      card.classList.remove("is-switching");
    }, 200);
  }

  function render() {
    var s = SCENARIOS[current];
    el.num.textContent = pad(current + 1) + " / " + pad(SCENARIOS.length);
    el.text.textContent = s.text;
    el.progressLabel.textContent = "Scenario " + (current + 1) + " of " + SCENARIOS.length;
    el.progressFill.style.width = ((current / SCENARIOS.length) * 100) + "%";
    el.back.disabled = current === 0;

    el.options.innerHTML = "";
    s.options.forEach(function (opt, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.innerHTML = '<span class="key">' + KEYS[i] + "</span><span>" + opt.text + "</span>";
      btn.addEventListener("click", function () { answer(i); });
      el.options.appendChild(btn);
    });
  }

  function answer(optionIndex) {
    if (!started) {
      started = true;
      track("diagnostic_start");
    }
    answers[current] = optionIndex;
    if (current < SCENARIOS.length - 1) {
      renderTransitioned(function () { current++; });
    } else {
      finish();
    }
  }

  function back() {
    if (current > 0) {
      renderTransitioned(function () { current--; answers.length = current; });
    }
  }

  // ---------- Scoring ----------
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

  // Per-axis mean/std of the raw sums over every possible answer
  // combination — used to standardize scores so no archetype captures
  // the "mixed answers" middle by accident. Recompute if SCENARIO
  // weights change (see README).
  var AXIS_MEAN = { b: 3.75, r: 0.0, p: -2.75, l: 3.0, v: -1.0 };
  var AXIS_STD  = { b: 3.33, r: 3.12, p: 3.21, l: 2.98, v: 3.59 };

  function computeResult() {
    var sums = { b: 0, r: 0, p: 0, l: 0, v: 0 };
    SCENARIOS.forEach(function (s, i) {
      var w = s.options[answers[i]].w;
      Object.keys(w).forEach(function (k) { sums[k] += w[k]; });
    });
    // Standardize each axis, clamp to -2..+2
    var wiring = {};
    Object.keys(sums).forEach(function (k) {
      wiring[k] = clamp((sums[k] - AXIS_MEAN[k]) / AXIS_STD[k], -2, 2);
    });

    // Match to archetype prototypes by euclidean distance
    var ranked = Object.keys(ARCHETYPES).map(function (key) {
      var proto = ARCHETYPES[key].proto;
      var d = 0;
      Object.keys(proto).forEach(function (k) { d += Math.pow(wiring[k] - proto[k], 2); });
      return { key: key, d: Math.sqrt(d) };
    }).sort(function (a, b) { return a.d - b.d; });

    // Strongest single wiring signal (for the personalized opening line)
    var strongest = Object.keys(wiring).reduce(function (best, k) {
      return Math.abs(wiring[k]) > Math.abs(wiring[best]) ? k : best;
    }, "b");
    var signalKey = strongest + (wiring[strongest] >= 0 ? "+" : "-");

    return {
      primary: ranked[0].key,
      secondary: ranked[1].key,
      wiring: wiring,
      signal: SIGNAL_LINES[signalKey]
    };
  }

  function pct(v) { return Math.round(50 + v * 25); } // -2..2 → 0..100

  function finish() {
    result = computeResult();
    var A = ARCHETYPES[result.primary];
    var S = ARCHETYPES[result.secondary];

    track("diagnostic_complete", {
      archetype: result.primary,
      archetype_secondary: result.secondary
    });

    el.name.textContent = A.name;
    el.tagline.textContent = A.tagline;

    // Wiring dimension bars — marker/fill start centered and animate
    // out to their real value a frame after insertion (see below),
    // so the bars visibly sweep into place instead of appearing preset.
    el.dims.innerHTML = "";
    el.dims.classList.add("stagger");
    var dimTargets = [];
    DIMENSIONS.forEach(function (d) {
      var v = pct(result.wiring[d.key]);
      var row = document.createElement("div");
      row.className = "dim-row reveal";
      row.innerHTML =
        '<span class="dim-name">' + d.name + "</span>" +
        '<div class="dim-bar"><span class="fill" style="width:50%"></span><span class="marker" style="left:50%"></span></div>' +
        '<div class="dim-labels">' +
          '<span class="' + (v < 50 ? "active" : "") + '">' + d.neg + "</span>" +
          '<span class="' + (v > 50 ? "active" : "") + '">' + d.pos + "</span>" +
        "</div>";
      el.dims.appendChild(row);
      dimTargets.push({ row: row, v: v });
    });

    // Narrative: personalized signal line + archetype story + secondary blend
    el.narrative.innerHTML = "";
    el.narrative.classList.add("stagger");
    var paras = [result.signal + " " + A.narrative[0]]
      .concat(A.narrative.slice(1))
      .concat(["Your secondary <strong>" + S.name + "</strong> wiring adds a layer: " + S.flavor]);
    paras.forEach(function (p) {
      var elP = document.createElement("p");
      elP.className = "reveal";
      elP.innerHTML = p;
      el.narrative.appendChild(elP);
    });

    el.builds.innerHTML = "";
    el.builds.classList.add("stagger");
    A.builds.forEach(function (b) {
      var li = document.createElement("li");
      li.className = "reveal";
      li.textContent = b;
      el.builds.appendChild(li);
    });
    el.avoids.innerHTML = "";
    el.avoids.classList.add("stagger");
    A.avoids.forEach(function (a) {
      var li = document.createElement("li");
      li.className = "reveal";
      li.textContent = a;
      el.avoids.appendChild(li);
    });
    el.thrive.textContent = A.thrive;
    el.stress.textContent = A.stress;

    el.run.classList.add("hidden");
    el.result.classList.remove("hidden");
    window.scrollTo({ top: 0 });

    // Reveal the wiring bars + gate now (they're visible pre-unlock);
    // sweep marker + fill to their real values in the same pass.
    // setTimeout, not rAF — see revealSoon() for why.
    revealSoon(el.dims);
    revealSoon(el.gate);
    if (reducedMotion) {
      dimTargets.forEach(function (t) {
        t.row.querySelector(".fill").style.width = t.v + "%";
        t.row.querySelector(".marker").style.left = t.v + "%";
      });
    } else {
      window.setTimeout(function () {
        dimTargets.forEach(function (t) {
          t.row.querySelector(".fill").style.width = t.v + "%";
          t.row.querySelector(".marker").style.left = t.v + "%";
        });
      }, 20);
    }
  }

  // ---------- Email gate ----------
  el.gateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!el.gateEmail.checkValidity()) {
      el.gateStatus.textContent = "Please enter a valid email.";
      el.gateStatus.className = "form-status err";
      return;
    }
    // Consent is part of the deal: profile + skill arrive by email, and
    // the email is subscribed to The Operator Letter. Explicit, required
    // (EU audience) — no email is sent to Kit without the box checked.
    if (!el.gateConsent.checked) {
      el.gateStatus.textContent = "Tick the box above — it's how you get the profile and the skill (and the newsletter that comes with them).";
      el.gateStatus.className = "form-status err";
      return;
    }
    var wiringSummary = DIMENSIONS.map(function (d) {
      return d.name.toLowerCase() + ":" + pct(result.wiring[d.key]);
    }).join(" ");
    window.MGKit.subscribe(el.gateEmail.value, [result.primary], {
      archetype: result.primary,
      archetype_secondary: result.secondary,
      wiring: wiringSummary,
      newsletter_consent: "yes"
    })
      .then(function () {
        track("email_capture", { archetype: result.primary });
        track("newsletter_subscribe", { source: "diagnostic" });
        // Unlock: swap the gate for the confirmation + full report.
        el.gate.classList.add("hidden");
        el.thanks.classList.remove("hidden");
        el.fullReport.classList.remove("hidden");
        // The narrative/fit/edge content was hidden inside #full-report
        // until now, so its .reveal elements need triggering here.
        revealSoon(el.fullReport);
        el.fullReport.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      })
      .catch(function () {
        el.gateStatus.textContent = "Something went wrong — try again, or email madalena@madgrowth.io.";
        el.gateStatus.className = "form-status err";
      });
  });

  el.back.addEventListener("click", back);

  // Keyboard: A-D or 1-4 select options
  document.addEventListener("keydown", function (e) {
    if (el.run.classList.contains("hidden")) return;
    if (e.target.tagName === "INPUT") return;
    var k = e.key.toUpperCase();
    var idx = KEYS.indexOf(k);
    if (idx === -1 && /^[1-4]$/.test(e.key)) idx = parseInt(e.key, 10) - 1;
    if (idx > -1 && idx < SCENARIOS[current].options.length) answer(idx);
  });

  render();
})();
