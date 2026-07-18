# Changelog

## 2026-07 local-first and review-readiness update

- Fixed heart positioning so every slider endpoint stays 5px inside product media.
- Replaced character hearts in the admin preview with the storefront SVG.
- Stopped repeatedly replacing spinner markup during delayed requests.
- Added immediate local add/remove behavior, customer-scoped persistent operation queues, 50-operation batches, rapid in-flight reversal compensation, idempotent synchronization, retry handling, and memory fallback.
- Split the large storefront script into seven focused modules.
- Added Top products and Plans admin pages.
- Added immutable fingerprinted settings profiles while preserving one isolated settings row per Shopify store.
- Added Free forever/Growth plan UI and Shopify App Pricing/Partner API integration points.
- Added header app block, automatic pre-cart insertion, manual Liquid markup, count badge, and custom CSS.
- Fixed shared-wishlist tenant filtering.
- Removed the direct shop-domain installation form.
- Added a fresh-install baseline migration, strict Docker runtime validation, required Compose database credentials, a PostgreSQL-backed health check, and updated API version, scopes, proxy defaults, environment template, and release documentation.
