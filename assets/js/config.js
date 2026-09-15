/* ============================================================
   Madgrowth site configuration — SINGLE SOURCE OF TRUTH
   Replace the PLACEHOLDER values below before launch.
   Everything else on the site reads from this file.
   ============================================================ */
window.MG = {
  // --- Stripe Payment Links (see README) ---
  // The Stack: 299€ one-time. The Read: 599€ one-time — fully async,
  // no call to book, so its success URL should point at wherever the
  // intake happens (a form collecting site/LinkedIn/offer details),
  // not Calendly. That intake form doesn't exist yet — set one up
  // (Tally/Typeform/Google Form) and point the Stripe success URL at
  // it before launch.
  STRIPE_LINK_STACK: "STRIPE_LINK_STACK",
  STRIPE_LINK_AUDIT: "https://buy.stripe.com/14AeVeacp1CmaKb1SF0Ny00",

  // --- Calendly ---
  // Free 15-min fit check. Used ONLY on The Build card (per brief §3.5).
  CALENDLY_FIT_CHECK: "https://calendly.com/madalena-madgrowth/fit-check",

  // --- Kit (ConvertKit) ---
  // Public form the diagnostic posts to.
  KIT_FORM_ID: "9916138",
  // Kit tag IDs (numeric). Find them in Kit → Grow → Tags.
  // One tag per Builder Archetype.
  KIT_TAGS: {
    "broadcaster": "23370413",
    "advisor": "23370414",
    "productizer": "23370416",
    "venture-builder": "23370418",
    "orchestrator": "23370420"
  },


  // --- PostHog: pageviews, clicks, session replay ---
  // Project API key (public, safe in client code) and region host.
  // PostHog runs cookieless until the visitor accepts the cookie banner.
  POSTHOG_KEY: "phc_mkVCJMPFNQ932qRPFQ8bNEsZ9gSk4KXWgmCqyrwGwqQW",
  POSTHOG_HOST: "https://us.i.posthog.com",

  // --- LinkedIn Insight Tag partner ID ---
  // Note: the Insight Tag sets cookies. Leave it as a placeholder
  // unless the site gets a consent banner.
  LINKEDIN_PARTNER_ID: "LINKEDIN_PARTNER_ID",

  // --- UTM params appended to every outbound link ---
  UTM: "utm_source=site&utm_medium=web&utm_campaign=core"
};
