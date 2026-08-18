/* ============================================================
   Madgrowth — main.js
   Shared behavior: link wiring, UTM appending, GA4 events,
   LinkedIn Insight Tag, Loom embed, mobile nav, motion system
   (scroll reveal, nav shrink, hero parallax, magnetic buttons,
   card tilt). Every motion feature checks prefers-reduced-motion
   and pointer:fine before doing anything — see initMotion().
   ============================================================ */
(function () {
  var MG = window.MG || {};

  function isPlaceholder(v) {
    return !v || /^(STRIPE_LINK|CALENDLY|KIT_|LOOM_URL|LINKEDIN_PARTNER)/.test(String(v));
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
    if (window.lintrk) window.lintrk("track", { event: name });
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

    // ---------- GA4 click events ----------
    document.querySelectorAll("[data-event]").forEach(function (el) {
      el.addEventListener("click", function () {
        track(el.getAttribute("data-event"));
      });
    });

    // ---------- Loom embed ----------
    var loomSlot = document.getElementById("loom-slot");
    if (loomSlot && !isPlaceholder(MG.LOOM_URL)) {
      var ph = loomSlot.querySelector(".placeholder");
      if (ph) {
        var iframe = document.createElement("iframe");
        iframe.src = MG.LOOM_URL;
        iframe.title = "The Program — 3-minute walkthrough";
        iframe.setAttribute("loading", "lazy");
        iframe.setAttribute("allowfullscreen", "");
        ph.replaceWith(iframe);
      }
    }

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
        initHeroParallax();
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

  // Soft cursor-follow spotlight + parallax drift on the hero blobs.
  // rAF-throttled; writes CSS custom properties, no layout thrash.
  function initHeroParallax() {
    var hero = document.querySelector(".hero");
    var bg = hero && hero.querySelector(".hero-bg");
    if (!hero || !bg) return;
    var raf = null;
    hero.addEventListener("mousemove", function (e) {
      var x = e.clientX, y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var rect = hero.getBoundingClientRect();
        var mx = ((x - rect.left) / rect.width) * 100;
        var my = ((y - rect.top) / rect.height) * 100;
        bg.style.setProperty("--mx", mx + "%");
        bg.style.setProperty("--my", my + "%");
        raf = null;
      });
    });
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
      var max = 5; // degrees
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
