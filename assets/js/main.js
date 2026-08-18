/* ============================================================
   Madgrowth — main.js
   Shared behavior: link wiring, UTM appending, GA4 events,
   LinkedIn Insight Tag, Loom embed, mobile nav.
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
  });

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
