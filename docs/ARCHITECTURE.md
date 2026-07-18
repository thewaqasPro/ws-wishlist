# Architecture

## Storefront request flow

1. The theme app embed or app block loads `ws-wishlist-icons.js`, `storage.js`, `api.js`, `state.js`, `panel.js`, `buttons.js`, and finally the small bootstrap file `ws-wishlist.js`.
2. Cached wishlist state is rendered immediately. When no cache exists, the spinner is rendered inside the exact 36px heart-button location.
3. Add/remove actions update local state and `localStorage` immediately, then enqueue an operation with a unique operation ID.
4. The queue is sent to `/apps/page/api` in batches of at most 50 operations. The server claims each operation in `wishlist_sync_operation`, making retries idempotent.
5. Successful operations are removed from the local queue. Temporary failures are retried; permanent validation failures are removed and surfaced to the shopper.
6. The canonical database payload is reconciled with any remaining local operations. If a shopper removes an optimistic item while its add is already in flight, the client queues a compensating remove instead of allowing the response to re-add it.

The browser queue is capped at 100 operations and split into 50-operation network batches. Cache and queue keys are scoped by store, proxy path, and signed-in customer identity; guest storage remains separate. If `localStorage` is unavailable, the current page uses an in-memory fallback.

## Identity and data isolation

- Logged-in shoppers use the signed app-proxy `logged_in_customer_id`.
- Guests receive a random visitor ID stored in the browser.
- Wishlists are unique on `(shop, key)`, so customer or visitor identities cannot collide across stores.
- Shared wishlist IDs are always queried together with the requesting shop domain.
- Admin settings are unique per Shopify shop.

## Settings profiles

`store_settings` remains the authoritative per-shop configuration. A SHA-256 fingerprint is computed from the configurable fields and linked to an immutable `wishlist_settings_profile` row. Identical configurations reuse the same profile; changing one store creates or reuses another profile and never changes another store's settings.

The storefront visual configuration is merchant/store-wide. Shopper-specific wishlist contents remain separate by customer or guest identity. Creating visual settings rows for every shopper would be unnecessary and would create the database growth the profile design is intended to avoid.

## Positioning

Heart buttons are 36px square. Each position axis uses:

```text
calc(percent% + (5 - percent * 0.46)px)
```

At 0%, the top/left edge is 5px inside the image. At 100%, the 36px icon is 5px inside the bottom/right edge. The admin preview mirrors the same formula.

## Server boundaries

- Admin routes require a Shopify session token.
- Storefront routes require a valid Shopify app-proxy signature.
- Product title, variant, price, availability, and exclusions are resolved server-side through Admin GraphQL before persistence.
- Custom CSS is length-limited and rejects scripts, `@import`, `expression()`, JavaScript URLs, and HTML data URLs.
- An idempotent baseline migration supports empty databases and legacy databases previously created with `prisma db push`; later migrations run under a PostgreSQL advisory lock during container startup.
- Docker startup rejects missing or placeholder production secrets, and `/api/health` verifies PostgreSQL before reporting healthy.
