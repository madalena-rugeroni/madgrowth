/* ============================================================
   Madgrowth site configuration — SINGLE SOURCE OF TRUTH
   Replace the PLACEHOLDER values below before launch.
   Everything else on the site reads from this file.
   ============================================================ */
window.MG = {
  // --- Stripe Payment Links (see README) ---
  // The Stack: 299€ one-time, self-serve.
  //
  // The Read: 599€ one-time, fully async. The post-payment chain is
  // live and wired end to end:
  //   Stripe "After payment" redirects to
  //     /audit/intake/?order={CHECKOUT_SESSION_ID}
  //   → audit/intake/index.html reads ?order into a hidden field
  //   → FormSubmit posts the answers to madalena@madgrowth.io,
  //     reply-to set to the buyer, so the order id ties the intake
  //     to the payment.
  // The buyer then gets a confirmation from Madalena by hand; the
  // 5 business days run from that confirmation, not from submission.
  STRIPE_LINK_STACK: "https://buy.stripe.com/9B6eVe2JXftc7xZ2WJ0Ny01",

  // --- Advertised prices, in EUR ---
  // Advertised price must equal the charged price, so these track Stripe.
  // The Stack is 299 as a founding price through 30 September 2026 and 399
  // from 1 October. STACK_PRICE_EUR is the value sent with the "purchase"
  // event on /stack/thanks/ — change it the same day the Stripe link and the
  // page copy change, or reported revenue silently understates every sale.
  STACK_PRICE_EUR: 299,
  STRIPE_LINK_AUDIT: "https://buy.stripe.com/14AeVeacp1CmaKb1SF0Ny00",

  // --- Calendly ---
  // Free 15-min fit check. Used ONLY on The Build card (per brief §3.5).
  CALENDLY_FIT_CHECK: "https://calendly.com/madalena-rugeroni/fit-check",

  // --- Kit (ConvertKit) ---
  // Public form the diagnostic posts to.
  KIT_FORM_ID: "9916138",
  // Newsletter form ("Newsletter form" in Kit, the one the welcome
  // automation listens to). Used by /newsletter/.
  KIT_NEWSLETTER_FORM_ID: "7572611",
  // "The Stack - buyers" (no automation attached, confirmation email off).
  // Currently UNUSED: the thank-you page no longer captures emails, because
  // Make reads the address straight off the Stripe checkout and creates the
  // Kit subscriber itself. Kept because the form exists in Kit and is the
  // obvious fallback if that ever needs to move back into the page.
  KIT_STACK_FORM_ID: "9972351",
  // Kit tag IDs (numeric). Find them in Kit → Grow → Tags.
  // One tag per Builder Archetype.
  // One tag per Builder Archetype, plus "newsletter".
  //
  // "newsletter" is the same tag the newsletter form applies. The
  // diagnostic gate promises the newsletter in its consent copy, and
  // until now diagnostic signups only actually received it because
  // broadcasts happen to target "all subscribers" — the day one is sent
  // to the Newsletter subscribers tag instead, they would silently stop
  // getting it while still having been promised it. Tagging at signup
  // makes the promise hold regardless of how a broadcast is targeted.
  KIT_TAGS: {
    "broadcaster": "23370413",
    "advisor": "23370414",
    "productizer": "23370416",
    "venture-builder": "23370418",
    "orchestrator": "23370420",
    "newsletter": "5968512",
    // Both of these are applied by MAKE, not by this site: the Stack
    // scenario tags the buyer straight off the Stripe webhook. Listed here
    // so the ids live in one place, not because the site sends them.
    // "stack-customer" starts "The Stack — Onboarding" in Kit.
    "stack-customer": "24062185",
    // Consent audit trail, used by the diagnostic gate. NOT applied to Stack
    // buyers: they are on the soft opt-in for existing customers, which is a
    // different legal basis, and recording it as consent would be a false
    // audit record. Their basis is stamped on newsletter_basis instead.
    "gdpr-consent": "8086275"
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
