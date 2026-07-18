# Developer notes

## Authentication boundaries

- Embedded admin APIs under `pages/api/apps` must use `withMiddleware("verifyRequest")`.
- Storefront app-proxy APIs under `pages/api/proxy_route` must use `withMiddleware("verifyProxy")`.
- Privacy webhook routes read the raw body and validate `X-Shopify-Hmac-Sha256`.
- Never accept a shop domain, customer ID, product price, or paid-plan claim from an unverified client as authoritative.

## Storefront modules

`ws-wishlist.js` is intentionally only the bootstrap/orchestrator. Add focused behavior to the corresponding module:

- `icons`: shared SVG/spinner markup;
- `storage`: local cache and operation queue;
- `api`: app-proxy transport;
- `state`: optimistic state and reconciliation;
- `panel`: drawer/page/toolbar/cart UI;
- `buttons`: product/header discovery and injection.

Keep modules guarded against duplicate loading because several theme app blocks can render on one page.

## Migrations

Add forward-only SQL migrations under `prisma/migrations/<timestamp>_<name>/migration.sql`. Production startup runs them under an advisory lock. Never edit a migration after it has shipped; add a new migration instead.

## Webhooks

Keep webhook handlers fast and idempotent. Acknowledge only after signature validation and required local work. At higher volume, move non-critical processing to a durable queue, but do not weaken uninstall or privacy handling.
