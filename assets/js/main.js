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
    return !v || /^(STRIPE_LINK|CALENDLY|KIT_|LINKEDIN_PARTNER|POSTHOG_)/.test(String(v));
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

  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
    if (window.posthog && typeof window.posthog.capture === "function") window.posthog.capture(name, params || {});
    if (window.lintrk) window.lintrk("track", { event: name });
  }

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
      el.addEventListener("click", function () {
        track(el.getAttribute("data-event"));
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
    subscribe: function (email, tagKeys, fields) {
      if (isPlaceholder(MG.KIT_FORM_ID)) {
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
      return fetch("https://app.kit.com/forms/" + MG.KIT_FORM_ID + "/subscriptions", {
        method: "POST",
        body: body,
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (!res.ok) throw new Error("Kit subscription failed: " + res.status);
        return res.json().catch(function () { return {}; });
      });
    }
  };

  window.MGutil = { withUTM: withUTM, track: track, isPlaceholder: isPlaceholder };
})();
