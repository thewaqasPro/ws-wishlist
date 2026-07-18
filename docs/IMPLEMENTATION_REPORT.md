# Implementation report

## Completed tasks

1. **Customizer positioning and icon consistency**
   - Heart position endpoints now keep a 5px inset on every edge.
   - Admin preview and storefront use the same SVG path and stroke treatment.

2. **Loading behavior**
   - Initial loading appears inside the future heart-button position.
   - The spinner DOM is no longer replaced on every render, so its animation does not repeatedly restart.

3. **Local-first wishlist state**
   - Add/remove updates local state and browser storage immediately.
   - A durable operation queue batches background app-proxy synchronization.
   - Operation IDs are idempotent; temporary failures retry and permanent validation failures are surfaced.
   - Rapid in-flight add/remove reversals use a compensating remove, sync requests are capped at 50 operations, and an in-memory storage fallback is included.

4. **Shopify review and Dokploy readiness**
   - Removed manual shop-domain installation UI.
   - Updated Admin API/webhook/extension version defaults to 2026-07.
   - Reduced scopes to `read_products,write_app_proxy`.
   - Preserved App Bridge CDN setup, signed proxies, privacy webhooks, tenant filters, and GraphQL Admin API access.
   - Added an idempotent fresh-install baseline migration, strict production environment checks, required Compose database credentials, and a PostgreSQL-backed health endpoint.
   - Production container runs as an unprivileged user.

5. **Top products**
   - Added an authenticated Top products page and API with all-time/30-day filters and a maximum of 10 products.

6. **Settings isolation and deduplication**
   - Every Shopify store retains its own `store_settings` row.
   - Identical configurations reuse immutable SHA-256-fingerprinted profile rows.
   - Shared-wishlist lookups are explicitly filtered by shop, and browser caches are scoped by signed-in customer identity to avoid cross-account flashes on shared devices.

7. **Plans**
   - Added a Free forever plan and optional Growth-plan admin UI.
   - Added Shopify pricing-screen redirect and optional Partner API subscription lookup.
   - External plan creation/configuration remains a Partner Dashboard release step.

8. **Header icon and custom CSS**
   - Added a header section app block, optional automatic pre-cart insertion, manual Liquid markup, count badge, and custom CSS editor/validation.

9. **Refactoring and visual improvements**
   - Split the former 800+ line storefront script into seven focused modules; no storefront module exceeds 400 lines.
   - Added drawer keyboard focus containment/restoration, focus-visible states, error toast styling, image placeholders, and admin styles for Plans/Top products.

## Verification performed

- Prisma offline client generation: passed.
- Prisma schema validation: passed.
- Browser JavaScript syntax checks: passed.
- TOML parse and Liquid schema JSON parse: passed.
- Prettier repository check: passed.
- Next.js production build: passed.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- Local release invariant script: passed.
- Storefront rapid-click compensation and 50-operation batching tests: passed.
- Baseline and upgrade SQL executed successfully in fresh-install and legacy-upgrade PostgreSQL-compatible test databases.

## External verification still required

- Authenticated `shopify app config validate` and `shopify app deploy` (the build environment could not reach Shopify device authorization).
- Partner Dashboard Free/Growth plan creation and test billing.
- App Store listing, policies, reviewer credentials/instructions, and final review submission.
- Storefront QA on the merchant's actual themes and production Dokploy environment.
