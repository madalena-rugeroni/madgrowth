/* ============================================================
   Madgrowth site configuration — SINGLE SOURCE OF TRUTH
   Replace the PLACEHOLDER values below before launch.
   Everything else on the site reads from this file.
   ============================================================ */
window.MG = {
  // --- Stripe Payment Links (see README) ---
  // Stack: 199€ one-time. Teardown: 399€ one-time, with its
  // success URL set (in Stripe) to the Calendly booking page:
  // https://calendly.com/madalena-madgrowth/1-1-strategy-session
  STRIPE_LINK_STACK: "STRIPE_LINK_STACK",
  STRIPE_LINK_TEARDOWN: "STRIPE_LINK_TEARDOWN",

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
