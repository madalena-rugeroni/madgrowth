/* ============================================================
   Madgrowth — main.js
   Shared behavior: link wiring, UTM appending, GA4 events,
   LinkedIn Insight Tag, mobile nav, motion system
   (scroll reveal, nav shrink, hero parallax, magnetic buttons,
   card tilt). Every motion feature checks prefers-reduced-motion
   and pointer:fine before doing anything — see initMotion().
   ============================================================ */
(function () {
  var MG = window.MG || {};

  function isPlaceholder(v) {
    return !v || /^(STRIPE_LINK|CALENDLY|KIT_|LINKEDIN_PARTNER|POSTHOG_|SALE_ALERT)/.test(String(v));
  }

  function withUTM(url) {
    if (!url) return url;
    try {
      var u = new URL(url);
      // Only tag outbound http(s) links, never mailto/anchors.
      if (u.protocol !== "http:" && u.protocol !== "https:") return url;
      (MG.UTM || "").split("&").forEach(function (pair) {
        var kv = pair.split("=");
        if (kv[0] && !u.searchParams.has(kv[0])) u.searchParams.set(kv[0], kv[1] || "");
      });
      return u.toString();
    } catch (e) {
      return url;
    }
  }

  // `beacon` matters on any click that navigates away. capture() and gtag()
  // both send over XHR by default, and the browser tears those requests down
  // the moment it starts unloading the page — so a click on a plain <a> was
  // being recorded only when the request happened to win the race. That is
  // why diagnostic_cta_click logged once across 38 placements while
  // diagnostic_start logged 60 times: people were clicking, the event was
  // dying on navigation. sendBeacon is queued by the browser and survives
  // unload, which is exactly what it exists for.
  function track(name, params, beacon) {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, beacon
        ? assign({ transport_type: "beacon" }, params || {})
        : (params || {}));
    }
    if (window.posthog && typeof window.posthog.capture === "function") {
      window.posthog.capture(name, params || {}, beacon ? { transport: "sendBeacon" } : undefined);
    }
    if (window.lintrk) window.lintrk("track", { event: name });
  }

  function assign(target, src) {
    for (var k in src) { if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k]; }
    return target;
  }

  // Where on the page a click happened, so 38 identical CTAs stop being one
  // undifferentiated number. Footer is tested before nav because the footer
  // contains its own <nav> columns.
  function placementOf(el) {
    if (el.closest("footer")) return "footer";
    if (el.closest(".site-header") || el.closest("header nav")) return "nav";
    var sec = el.closest("section");
    if (sec) {
      if (sec.id) return sec.id;
      var cls = String(sec.className || "").split(/\s+/);
      for (var i = 0; i < cls.length; i++) {
        if (cls[i] && cls[i] !== "alt" && cls[i] !== "reveal") return cls[i];
      }
      return "section";
    }
    return "body";
  }

  // A click that leaves the page: a real href that is not an in-page anchor,
  // not opening in a new tab, and not a modified click (those keep the page).
  function navigatesAway(el, e) {
    if (!el || el.tagName !== "A") return false;
    var href = el.getAttribute("href");
    if (!href || href.charAt(0) === "#") return false;
    if (el.target && el.target !== "_self") return false;
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1)) return false;
    return true;
  }

  // ---------- JS error reporting ----------
  // A TypeError in diagnostic.js once killed the whole diagnostic for
  // anyone who double-clicked an answer, and nothing surfaced it: it was
  // only found weeks later, indirectly, through dead-click data. This
  // reports uncaught errors so a broken script shows up as an event with
  // a file and line number instead of silent drop-off.
  //
  // Deliberately narrow, because an unfiltered handler is mostly noise:
  // only same-origin /assets/ scripts are reported, so browser
  // extensions, injected third-party code and cross-origin scripts
  // (which are opaque anyway) are ignored. Repeats of the same error are
  // sent once, and the whole thing caps out per page load.
  (function () {
    var MAX_PER_PAGE = 5;
    var sent = 0;
    var seen = {};

    // Same-origin and under /assets/ — i.e. a script from this site.
    function isOurs(src) {
      if (!src) return false;
      try {
        var u = new URL(src, location.href);
        return u.origin === location.origin && u.pathname.indexOf("/assets/") === 0;
      } catch (e) { return false; }
    }

    function report(name, params) {
      if (sent >= MAX_PER_PAGE) return;
      var key = name + "|" + params.message + "|" + params.source + "|" + params.lineno;
      if (seen[key]) return;
      seen[key] = 1;
      sent++;
      params.page = location.pathname;
      track(name, params);
    }

    window.addEventListener("error", function (e) {
      // Resource failures (a script or stylesheet that 404s) surface on
      // the same event but target an element instead of window, and carry
      // no message. Worth reporting for our own assets: a diagnostic.js
      // that never loads looks identical to one that silently breaks.
      if (e.target && e.target !== window && e.target.tagName) {
        var url = e.target.src || e.target.href;
        if (!isOurs(url)) return;
        report("js_resource_error", {
          message: e.target.tagName.toLowerCase() + " failed to load",
          source: String(url).replace(location.origin, ""),
          lineno: 0
        });
        return;
      }
      if (!isOurs(e.filename)) return;
      report("js_error", {
        message: String(e.message || "unknown").slice(0, 300),
        source: String(e.filename || "").replace(location.origin, ""),
        lineno: e.lineno || 0,
        colno: e.colno || 0,
        stack: e.error && e.error.stack ? String(e.error.stack).slice(0, 500) : ""
      });
    }, true); // capture phase: resource errors don't bubble

    window.addEventListener("unhandledrejection", function (e) {
      var r = e.reason;
      var stack = r && r.stack ? String(r.stack) : "";
      // No filename on a rejection, so fall back to the stack to decide
      // whether this came from our own code. No stack, no report.
      if (!stack || stack.indexOf(location.origin + "/assets/") === -1) return;
      report("js_unhandled_rejection", {
        message: String((r && r.message) || r || "unknown").slice(0, 300),
        source: "promise",
        lineno: 0,
        stack: stack.slice(0, 500)
      });
    });
  })();

  // ---------- Consent (GA4 Consent Mode + PostHog) ----------
  // GA4 starts with analytics_storage denied (see the inline head snippet).
  // PostHog uses cookieless_mode "on_reject": nothing is stored on the
  // device until the visitor accepts. The choice itself is saved in
  // localStorage so the banner only shows once.
  var CONSENT_KEY = "mg_consent";
  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function applyConsent(v) {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: v === "granted" ? "granted" : "denied" });
    }
    if (window.posthog && typeof window.posthog.opt_in_capturing === "function") {
      if (v === "granted") window.posthog.opt_in_capturing();
      else window.posthog.opt_out_capturing();
    }
  }
  function setConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
    applyConsent(v);
  }

  // ---------- PostHog (only with a real project key, never on localhost) ----------
  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  if (!isPlaceholder(MG.POSTHOG_KEY) && !isLocal) {
    // Official PostHog loader snippet (posthog.com/docs/libraries/js)
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init(MG.POSTHOG_KEY, {
      api_host: MG.POSTHOG_HOST || "https://us.i.posthog.com",
      defaults: "2026-05-30",
      person_profiles: "identified_only",
      cookieless_mode: "on_reject"
    });
    var stored = getConsent();
    if (stored) applyConsent(stored);
  }

  function siteBase() {
    var s = document.querySelector('script[src$="assets/js/main.js"]');
    return s ? s.getAttribute("src").replace("assets/js/main.js", "") : "";
  }

  function showConsentBanner() {
    if (document.querySelector(".consent-bar")) return;
    var bar = document.createElement("div");
    bar.className = "consent-bar";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Cookie preferences");
    bar.innerHTML =
      '<p>I use Google Analytics and PostHog to see which pages help and where people get stuck. OK to set cookies? <a href="' + siteBase() + 'privacy/">Privacy policy</a></p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="consent-accept">Accept</button>' +
      '<button type="button" class="consent-decline">Decline</button>' +
      "</div>";
    bar.querySelector(".consent-accept").addEventListener("click", function () { setConsent("granted"); bar.remove(); });
    bar.querySelector(".consent-decline").addEventListener("click", function () { setConsent("denied"); bar.remove(); });
    document.body.appendChild(bar);
  }

  // ---------- LinkedIn Insight Tag (only with a real partner ID) ----------
  if (!isPlaceholder(MG.LINKEDIN_PARTNER_ID)) {
    window._linkedin_partner_id = MG.LINKEDIN_PARTNER_ID;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(MG.LINKEDIN_PARTNER_ID);
    (function (l) {
      if (!l) {
        window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
        window.lintrk.q = [];
      }
      var s = document.getElementsByTagName("script")[0];
      var b = document.createElement("script");
      b.type = "text/javascript"; b.async = true;
      b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
      s.parentNode.insertBefore(b, s);
    })(window.lintrk);
  }

  document.addEventListener("DOMContentLoaded", function () {
    // ---------- Mobile nav ----------
    var toggle = document.querySelector(".nav-toggle");
    var links = document.getElementById("nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      links.addEventListener("click", function (e) {
        if (e.target.tagName === "A") {
          links.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    // ---------- Wire config-driven links (Stripe / Calendly) ----------
    document.querySelectorAll("[data-link]").forEach(function (a) {
      var key = a.getAttribute("data-link");
      var val = MG[key];
      if (isPlaceholder(val)) {
        // Placeholder not yet replaced: keep the button but make the
        // gap obvious in dev instead of silently linking nowhere.
        a.setAttribute("href", "#");
        a.setAttribute("data-missing-config", key);
        a.addEventListener("click", function (e) {
          e.preventDefault();
          console.warn("Madgrowth config: set " + key + " in assets/js/config.js");
        });
      } else {
        a.setAttribute("href", withUTM(val));
      }
    });

    // ---------- UTM on static outbound links ----------
    document.querySelectorAll('a[href^="http"]').forEach(function (a) {
      if (a.host !== window.location.host) a.setAttribute("href", withUTM(a.href));
    });

    // ---------- Cookie banner + "Cookie settings" footer link ----------
    if (!getConsent()) showConsentBanner();
    var footerLinks = document.querySelector(".footer-links");
    if (footerLinks) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#";
      a.textContent = "Cookie settings";
      a.addEventListener("click", function (e) { e.preventDefault(); showConsentBanner(); });
      li.appendChild(a);
      footerLinks.appendChild(li);
    }

    // ---------- Analytics click events ----------
    document.querySelectorAll("[data-event]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        track(el.getAttribute("data-event"), {
          placement: el.getAttribute("data-placement") || placementOf(el),
          page: location.pathname
        }, navigatesAway(el, e));
      });
    });

    initMotion();
  });

  // ---------- Motion system ----------
  function initMotion() {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var fine = window.matchMedia("(pointer: fine)").matches;

    initScrollProgress();
    initNavShrink();
    initScrollReveal(reduced);
    if (!reduced) {
      initHeroReveal();
      if (fine) {
        initMagneticButtons();
        initCardTilt();
      } else {
        // No fine pointer: skip pointer-follow effects, just settle
        // tilt-eligible cards at rest (CSS already handles the rest).
      }
    } else {
      // Reduced motion: hero content must still appear — set it
      // visible immediately rather than relying on the (disabled)
      // entrance transition.
      document.querySelectorAll(".hero .reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  // Thin fixed bar at the top showing scroll depth through the page.
  function initScrollProgress() {
    var bar = document.getElementById("scroll-progress");
    if (!bar) return;
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var scrollable = h.scrollHeight - h.clientHeight;
      var pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
      bar.style.width = pct + "%";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  // Adds .scrolled to the header past a small threshold, for the
  // blur/shrink treatment defined in CSS.
  function initNavShrink() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle("scrolled", window.scrollY > 12);
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  // Hero content is always above the fold on load, so it reveals
  // immediately rather than waiting on an IntersectionObserver.
  // setTimeout, not rAF: rAF is suspended in some backgrounded/
  // occluded tab states (confirmed in testing) while timers keep
  // firing, and a hidden-then-shown tab must never leave the hero
  // permanently stuck at opacity:0.
  function initHeroReveal() {
    window.setTimeout(function () {
      document.querySelectorAll(".hero .reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
    }, 20);
  }

  // Everything else fades/rises into view the first time it enters
  // the viewport. One observer, unobserve-on-reveal (fires once).
  //
  // Safety net: some browsers suspend IntersectionObserver delivery
  // for backgrounded/occluded tabs (document.hidden), and certain
  // embedding contexts do this more aggressively than others. revealVisible()
  // is a plain getBoundingClientRect check that reveals only elements
  // actually on-screen right now — it piggybacks on the scroll tick
  // (so it still paces itself with real scrolling) and also runs on
  // a short bounded poll to catch on-load content even if no scroll
  // or IO event ever arrives. Motion is polish; it must never be a
  // dependency for seeing the page.
  function initScrollReveal(reduced) {
    var els = document.querySelectorAll(".reveal:not(.hero .reveal)");
    if (!els.length) return;
    if (reduced || typeof IntersectionObserver === "undefined") {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    function revealVisible() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("is-visible");
      });
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach(function (el) { io.observe(el); });

    window.addEventListener("scroll", function () { revealVisible(); }, { passive: true });
    revealVisible();
    var ticks = 0;
    var poll = window.setInterval(function () {
      revealVisible();
      if (++ticks >= 10 || !document.querySelector(".reveal:not(.is-visible)")) {
        window.clearInterval(poll);
      }
    }, 1000);
  }

  // Buttons marked .btn-magnetic drift a few px toward the cursor
  // while hovered, and spring back to rest on leave.
  function initMagneticButtons() {
    document.querySelectorAll(".btn-magnetic").forEach(function (btn) {
      var raf = null;
      var strength = 0.28;
      var max = 10;
      btn.addEventListener("mousemove", function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var rect = btn.getBoundingClientRect();
          var dx = e.clientX - (rect.left + rect.width / 2);
          var dy = e.clientY - (rect.top + rect.height / 2);
          var mx = Math.max(-max, Math.min(max, dx * strength));
          var my = Math.max(-max, Math.min(max, dy * strength));
          btn.style.setProperty("--mx", mx + "px");
          btn.style.setProperty("--my", my + "px");
          raf = null;
        });
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.setProperty("--mx", "0px");
        btn.style.setProperty("--my", "0px");
      });
    });
  }

  // Cards marked .tilt get a subtle perspective tilt following the
  // cursor, on top of the CSS-driven lift/shadow on :hover.
  function initCardTilt() {
    document.querySelectorAll(".tilt").forEach(function (card) {
      var raf = null;
      var max = 3; // degrees — subtle, not showy
      card.addEventListener("mousemove", function (e) {
        card.classList.remove("settling");
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var rect = card.getBoundingClientRect();
          var px = (e.clientX - rect.left) / rect.width - 0.5;
          var py = (e.clientY - rect.top) / rect.height - 0.5;
          var rx = (-py * max).toFixed(2);
          var ry = (px * max).toFixed(2);
          card.style.transform =
            "perspective(800px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
          raf = null;
        });
      });
      card.addEventListener("mouseleave", function () {
        card.classList.add("settling");
        card.style.transform = "";
      });
    });
  }

  // ---------- Kit helper (shared with the diagnostic page) ----------
  window.MGKit = {
    /**
     * Subscribe an email to the Kit form with tags.
     * tagKeys: array of keys in MG.KIT_TAGS (e.g. ["broadcaster"]).
     * fields:  extra Kit custom fields, e.g. { archetype: "broadcaster" }.
     */
    subscribe: function (email, tagKeys, fields, formId) {
      formId = arguments.length > 3 ? formId : MG.KIT_FORM_ID;
      if (isPlaceholder(formId)) {
        console.warn("Madgrowth config: set KIT_FORM_ID in assets/js/config.js");
        return Promise.reject(new Error("KIT_FORM_ID not configured"));
      }
      var body = new FormData();
      body.append("email_address", email);
      (tagKeys || []).forEach(function (key) {
        var id = (MG.KIT_TAGS || {})[key];
        if (!isPlaceholder(id)) body.append("tags[]", id);
      });
      Object.keys(fields || {}).forEach(function (k) {
        body.append("fields[" + k + "]", fields[k]);
      });
      return fetch("https://app.kit.com/forms/" + formId + "/subscriptions", {
        method: "POST",
        body: body,
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (!res.ok) throw new Error("Kit subscription failed: " + res.status);
        return res.json().catch(function () { return {}; });
      }).then(function (json) {
        // Kit answers 200 even when it refused the subscription — the real
        // outcome is in the body, not the HTTP status. Without this check a
        // rejected signup (wrong form id, spam block, address Kit won't
        // take) resolves, every caller says "You're in", and the address is
        // gone. Found by posting to a form id that doesn't exist: HTTP 200,
        // body {"status":"failed"}, visitor told it worked.
        //
        // "quarantined" is NOT a failure: Kit is asking the visitor to clear
        // a bot check, and callers surface that themselves.
        if (json && json.status === "failed") {
          var msgs = json.errors && json.errors.messages;
          throw new Error("Kit subscription failed: " +
            (msgs && msgs.length ? msgs[0] : "unknown error"));
        }
        return json;
      });
    }
  };

  // ---------- Sale alert: email Madalena the moment a sale lands ----------
  //
  // Why this exists at all: a Stack sale went through on 30 Sep 2026 and the
  // only reason it was noticed is that the buyer said so. Stripe's own
  // "successful payments" email is the authoritative alert and it is the
  // first thing to keep switched on — but it is a dashboard setting that can
  // be turned off, throttled or filtered without anything here changing, and
  // when it goes quiet it goes quiet silently. This is the second, independent
  // signal, so both have to fail before a sale goes unnoticed again.
  //
  // Deliberately NOT gated on the cookie banner. It is not analytics: it is
  // Madgrowth emailing itself a record of its own order, which is the sale's
  // performance of contract, not tracking of the visitor. Nothing about the
  // visitor is sent beyond the Stripe order reference, and no cookie or
  // storage is read for it other than the de-dupe key below.
  //
  // What it cannot do: the buyer's email address is not in the redirect URL,
  // so the alert names the order, not the person. Stripe's receipt and the
  // Make delivery email carry the address.
  function notifySale(opts) {
    opts = opts || {};
    var order = opts.order_id;
    if (!order) return false;

    var endpoint = (window.MG || {}).SALE_ALERT_ENDPOINT;
    if (!endpoint || isPlaceholder(endpoint)) {
      console.warn("Madgrowth config: set SALE_ALERT_ENDPOINT in assets/js/config.js");
      return false;
    }

    // Its own key, separate from the analytics "mg_purchase_" one. If they
    // shared a key, an analytics send that landed before this one would mark
    // the order done and the alert would never be sent for it.
    var KEY = "mg_sale_alert_" + order;
    try { if (window.localStorage && localStorage.getItem(KEY)) return true; } catch (e) {}

    var price = opts.value;
    var amount = (price || price === 0) ? price + " " + (opts.currency || "EUR") : "see Stripe";

    // Written to be read on a phone lock screen: product and amount are in
    // the subject, so the alert does not need opening to be understood.
    var body = {
      _subject: "Sale: " + (opts.product_name || "Madgrowth") + " - " + amount,
      _template: "table",
      Product: opts.product_name || "unknown",
      Amount: amount,
      "Stripe order": order,
      "Paid at": new Date().toISOString(),
      "What to do next": opts.next || "",
      "Open in Stripe": "https://dashboard.stripe.com/payments?query=" + encodeURIComponent(order)
    };

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        // Only burn the key once the relay actually accepted it. Flagging on
        // "sent" would lose the alert for good on a network blip, which is
        // the exact failure this whole function exists to stop.
        if (!res.ok || String(res.body.success) !== "true") return;
        try { if (window.localStorage) localStorage.setItem(KEY, "1"); } catch (e) {}
      })
      .catch(function () { /* nothing useful to tell the buyer; keep the key unset */ });

    return true;
  }

  window.MGutil = { withUTM: withUTM, track: track, isPlaceholder: isPlaceholder, notifySale: notifySale };

  // ---------- Newsletter forms: <form data-kit-form="newsletter"> ----------
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('form[data-kit-form="newsletter"]').forEach(function (form) {
      var status = form.nextElementSibling && form.nextElementSibling.classList.contains("form-status")
        ? form.nextElementSibling : null;
      var input = form.querySelector('input[type="email"]');
      var button = form.querySelector('button[type="submit"]');
      function say(msg, cls) {
        if (!status) return;
        status.className = "form-status" + (cls ? " " + cls : "");
        status.textContent = "";
        if (typeof msg === "string") status.textContent = msg; else status.appendChild(msg);
      }
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = (input.value || "").trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          say("Enter a valid email address.", "err");
          input.focus();
          return;
        }
        button.disabled = true;
        say("Adding you…");
        window.MGKit.subscribe(email, [], {}, form.getAttribute("data-kit-form-id") || MG.KIT_NEWSLETTER_FORM_ID)
          .then(function (res) {
            if (res && res.status === "quarantined" && res.url) {
              // Kit's bot check: the visitor confirms on Kit's page.
              var frag = document.createDocumentFragment();
              frag.appendChild(document.createTextNode("One more step: "));
              var a = document.createElement("a");
              a.href = res.url; a.target = "_blank"; a.rel = "noopener";
              a.textContent = "confirm you're not a bot";
              frag.appendChild(a);
              frag.appendChild(document.createTextNode(" and you're in."));
              say(frag, "ok");
            } else {
              say("You're in. Check your inbox for the welcome email (it sometimes lands in Promotions).", "ok");
              form.reset();
            }
            track("newsletter_subscribe");
          })
          .catch(function () {
            say("That didn't go through. Try again, or email madalena@madgrowth.io.", "err");
          })
          .then(function () { button.disabled = false; });
      });
    });
  });
})();
