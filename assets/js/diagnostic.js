/* ============================================================
   Madgrowth — diagnostic.js
   The Builder Diagnostic: 8 scenarios, multiple choice, scored
   across 5 wiring dimensions into a Builder Archetype —
   what kind of builder you are and which businesses fit.
   ============================================================ */
(function () {
  var track = (window.MGutil && window.MGutil.track) || function () {};

  // ---------- Wiring dimensions ----------
  // Each axis runs -2 .. +2. Negative pole first.
  var DIMENSIONS = [
    { key: "b", name: "Build",    neg: "Creator-Led", pos: "System-Led" },
    { key: "r", name: "Risk",     neg: "De-Risked",   pos: "Bet Big" },
    { key: "p", name: "Pace",     neg: "Compound",    pos: "Sprint-First" },
    { key: "l", name: "Leverage", neg: "Craft",       pos: "Audience" },
    { key: "v", name: "Revenue",  neg: "High-Ticket", pos: "Volume" }
  ];

  // ---------- Scenarios ----------
  var SCENARIOS = [
    {
      text: "It's Saturday morning. No plans, no obligations. Where does your energy actually go?",
      options: [
        { text: "Writing something worth publishing", w: { b: -2, l: 2, p: 1 } },
        { text: "Building something that works by tonight", w: { b: 2, p: 2, r: 1 } },
        { text: "A long conversation about someone's hard problem", w: { b: -1, l: -1, v: -2 } },
        { text: "Designing the plan — systems, sequence, next quarter", w: { b: 1, p: -2, r: -1 } }
      ]
    },
    {
      text: "Your first 1,000€ of owned income lands. Which version feels best?",
      options: [
        { text: "1,000 people paid 1€ for something I made", w: { v: 2, l: 2 } },
        { text: "One client paid 1,000€ for my judgment", w: { v: -2, l: -1 } },
        { text: "A product sold overnight while I slept", w: { v: 2, b: 1, p: 1 } },
        { text: "Four clients on 250€/month retainers", w: { v: -1, p: -2, r: -1 } }
      ]
    },
    {
      text: "You get 10 extra hours a week for 90 days. You spend them:",
      options: [
        { text: "Posting daily — audience and distribution first", w: { l: 2, b: -1, p: 1 } },
        { text: "Shipping a v1 and iterating in public", w: { b: 1, p: 2, r: 1 } },
        { text: "Taking one paid engagement to learn the market", w: { v: -2, r: -1, p: -1 } },
        { text: "Building the machine: niche, offer, pipeline", w: { b: 2, p: -1, r: -1 } }
      ]
    },
    {
      text: "Which risk would you actually enjoy taking?",
      options: [
        { text: "Announcing the launch publicly before it's built", w: { r: 2, l: 2, p: 1 } },
        { text: "Going all-in on a product for a year", w: { r: 2, b: 2, p: -1 } },
        { text: "Tripling your price on the next client", w: { r: 1, v: -2 } },
        { text: "None. I test small until the data says go", w: { r: -2, p: -1 } }
      ]
    },
    {
      text: "At work, people come to you when they need:",
      options: [
        { text: "Someone to make the complicated thing clear", w: { b: -2, l: 1 } },
        { text: "Someone to just get it shipped", w: { p: 2, b: 1 } },
        { text: "Judgment on a hard, ambiguous call", w: { v: -2, l: -1 } },
        { text: "Someone to make the machine actually run", w: { b: 2, p: -1, v: -1 } }
      ]
    },
    {
      text: "Which failure would sting the most?",
      options: [
        { text: "Building something great nobody ever hears about", w: { l: 2 } },
        { text: "Being visible everywhere with nothing real to sell", w: { l: -1, b: 1, v: 1 } },
        { text: "Trading time for money forever", w: { v: 2, b: 1 } },
        { text: "Launching fast and watching it break in public", w: { r: -2, p: -2 } }
      ]
    },
    {
      text: "Your ideal Tuesday, two years from now:",
      options: [
        { text: "Morning writing; the audience grows while you sleep", w: { b: -2, l: 2, v: 1 } },
        { text: "Deep work on the product; the dashboard is up and to the right", w: { b: 2, v: 1, p: -1 } },
        { text: "Two great client sessions; the afternoon is yours", w: { v: -2, l: -1, p: -1 } },
        { text: "A 30-minute ops review; the machine ran without you", w: { b: 2, v: -1, p: -2 } }
      ]
    },
    {
      text: "Be honest about money. You'd rather earn:",
      options: [
        { text: "100k€/year from thousands of small customers", w: { v: 2, l: 1 } },
        { text: "100k€/year from five clients who love you", w: { v: -2 } },
        { text: "60k€/year today — fully passive, still growing", w: { v: 1, p: -2, b: 1 } },
        { text: "A real shot at 1M€ — equity-style upside, all yours", w: { r: 2, b: 1, p: -1 } }
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
    "l-": "The strongest signal in your answers: your leverage is the craft itself — the work is what people pay for.",
    "l+": "The strongest signal in your answers: your leverage is attention — distribution finds you when you're visible.",
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
      current++;
      render();
    } else {
      finish();
    }
  }

  function back() {
    if (current > 0) {
      current--;
      answers.length = current;
      render();
    }
  }

  // ---------- Scoring ----------
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

  // Per-axis mean/std of the raw sums over every possible answer
  // combination — used to standardize scores so no archetype captures
  // the "mixed answers" middle by accident. Recompute if SCENARIO
  // weights change (see README).
  var AXIS_MEAN = { b: 3, r: 0.25, p: -2, l: 2.25, v: -1.25 };
  var AXIS_STD  = { b: 3.18, r: 2.36, p: 2.98, l: 2.63, v: 3.27 };

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

    // Wiring dimension bars
    el.dims.innerHTML = "";
    DIMENSIONS.forEach(function (d) {
      var v = pct(result.wiring[d.key]);
      var row = document.createElement("div");
      row.className = "dim-row";
      row.innerHTML =
        '<span class="dim-name">' + d.name + "</span>" +
        '<div class="dim-bar"><span class="marker" style="left:' + v + '%"></span></div>' +
        '<div class="dim-labels">' +
          '<span class="' + (v < 50 ? "active" : "") + '">' + d.neg + "</span>" +
          '<span class="' + (v > 50 ? "active" : "") + '">' + d.pos + "</span>" +
        "</div>";
      el.dims.appendChild(row);
    });

    // Narrative: personalized signal line + archetype story + secondary blend
    el.narrative.innerHTML = "";
    var paras = [result.signal + " " + A.narrative[0]]
      .concat(A.narrative.slice(1))
      .concat(["Your secondary <strong>" + S.name + "</strong> wiring adds a layer: " + S.flavor]);
    paras.forEach(function (p) {
      var elP = document.createElement("p");
      elP.innerHTML = p;
      el.narrative.appendChild(elP);
    });

    el.builds.innerHTML = "";
    A.builds.forEach(function (b) {
      var li = document.createElement("li");
      li.textContent = b;
      el.builds.appendChild(li);
    });
    el.avoids.innerHTML = "";
    A.avoids.forEach(function (a) {
      var li = document.createElement("li");
      li.textContent = a;
      el.avoids.appendChild(li);
    });
    el.thrive.textContent = A.thrive;
    el.stress.textContent = A.stress;

    el.run.classList.add("hidden");
    el.result.classList.remove("hidden");
    window.scrollTo({ top: 0 });
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
