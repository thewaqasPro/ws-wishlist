# Shopify App Store submission checklist

This codebase is prepared for review, but approval is not automatic. Complete every Partner Dashboard and operational item before submitting.

## Code and configuration

- [ ] Publish the app with API version `2026-07` and only required scopes.
- [ ] Validate and deploy `shopify.app.toml` and the theme app extension with an authenticated Shopify CLI session.
- [ ] Confirm App Bridge's CDN script and API-key meta tag load before embedded admin application scripts.
- [ ] Confirm installation begins only from Shopify surfaces; do not restore a shop-domain installation form.
- [ ] Verify all new Admin API operations use GraphQL.
- [ ] Confirm app-proxy HMAC verification, session-token authentication, tenant filters, and HTTPS.
- [ ] Test mandatory customer data request, customer redact, and shop redact webhooks with valid and invalid signatures.
- [ ] Test app uninstall and reinstall.
- [ ] Verify no secret `.env`, token, database dump, or customer data exists in the release package.

## Theme behavior

- [ ] Install on at least two Online Store 2.0 themes.
- [ ] Enable and disable the app embed without editing theme code.
- [ ] Add/remove the header app block and verify the cart remains functional.
- [ ] Test the automatic header option separately; document any theme where the app block is required.
- [ ] Test product, collection, search, home, wishlist-page, mobile, and dynamic-section rendering.
- [ ] Confirm 0% and 100% slider positions retain a 5px inset.
- [ ] Confirm initial spinner stays inside the future heart location and does not restart repeatedly.
- [ ] Test offline add/remove, refresh, reconnect, duplicate retry, and database reconciliation.

## Pricing

- [ ] Select Shopify App Pricing in the Partner Dashboard and create one Free public plan plus the optional Growth paid plan.
- [ ] Set the pricing welcome link to the embedded `/plans` page.
- [ ] Test plan selection, redirect `plan_handle`, Partner API subscription lookup, and cancellation in a development store using Shopify's current $0 private test plan.
- [ ] Configure Partner API credentials for canonical subscription reads.
- [ ] Keep entitlement enforcement disabled until all billing states are verified.
- [ ] Ensure pricing shown in the listing matches Shopify-hosted pricing exactly.

## Listing and reviewer access

- [ ] Supply an accurate app description, screenshots, demo video where required, support email, privacy policy, terms, and data-retention/deletion details.
- [ ] Provide reviewer instructions covering app-embed activation, header block, `/apps/page`, Customize, Top products, and Plans.
- [ ] Provide a test store and credentials that do not require unsupported multi-factor steps.
- [ ] Remove placeholder domains, keys, copy, and broken links.
- [ ] Verify support and incident-response ownership.

## Performance and accessibility

- [ ] Measure storefront impact with the extension enabled and disabled.
- [ ] Verify keyboard focus, labels, contrast, reduced-motion behavior, drawer focus/close behavior, and screen-reader names.
- [ ] Confirm no console errors, unbounded observers, repeated network loops, or layout shifts.

## Current Shopify references

Review the live documentation immediately before submission because requirements change:

- https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements
- https://shopify.dev/docs/apps/launch/billing/shopify-app-pricing
- https://shopify.dev/docs/apps/build/online-store/theme-app-extensions
- https://shopify.dev/docs/apps/build/compliance/privacy-law-compliance
