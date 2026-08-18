/* ============================================================
   Madgrowth site configuration — SINGLE SOURCE OF TRUTH
   Replace the PLACEHOLDER values below before launch.
   Everything else on the site reads from this file.
   ============================================================ */
window.MG = {
  // --- Stripe Payment Links (see README) ---
  // Stack: 199€ one-time. Launch Audit: 399€ one-time — fully async,
  // no call to book, so its success URL should point at wherever the
  // intake happens (a form collecting site/LinkedIn/offer details),
  // not Calendly. That intake form doesn't exist yet — set one up
  // (Tally/Typeform/Google Form) and point the Stripe success URL at
  // it before launch.
  STRIPE_LINK_STACK: "STRIPE_LINK_STACK",
  STRIPE_LINK_AUDIT: "STRIPE_LINK_AUDIT",

  // --- Calendly ---
  // Free 15-min fit check. Used ONLY on the Program card (per brief §3.5).
  CALENDLY_FIT_CHECK: "CALENDLY_FIT_CHECK",

  // --- Kit (ConvertKit) ---
  // Public form the diagnostic posts to.
  KIT_FORM_ID: "KIT_FORM_ID",
  // Kit tag IDs (numeric). Find them in Kit → Grow → Tags.
  // One tag per Builder Archetype.
  KIT_TAGS: {
    "broadcaster": "KIT_TAG_BROADCASTER",
    "advisor": "KIT_TAG_ADVISOR",
    "productizer": "KIT_TAG_PRODUCTIZER",
    "venture-builder": "KIT_TAG_VENTURE_BUILDER",
    "orchestrator": "KIT_TAG_ORCHESTRATOR"
  },

  // --- Loom walkthrough of the Program (embed URL) ---
  LOOM_URL: "LOOM_URL",

  // --- LinkedIn Insight Tag partner ID ---
  LINKEDIN_PARTNER_ID: "LINKEDIN_PARTNER_ID",

  // --- UTM params appended to every outbound link ---
  UTM: "utm_source=site&utm_medium=web&utm_campaign=core"
};
