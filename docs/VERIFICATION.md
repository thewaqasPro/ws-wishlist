# Verification

## Automated checks

```bash
npm install
npm run prisma:generate
npm run verify:local
npm audit --omit=dev --audit-level=high
npm run shopify:config
```

Also run syntax checks for extension JavaScript:

```bash
for file in extensions/ws-wishlist-theme/assets/ws-wishlist*.js; do
  node --check "$file"
done
```

Shopify CLI commands require authentication and network access. A local Next.js build does not validate Partner Dashboard pricing, app-proxy registration, review listing content, or every merchant theme.

## Database

- Apply migrations to an empty PostgreSQL database.
- Upgrade a copy of an existing database and confirm existing wishlists/settings remain.
- Add identical settings to two stores and confirm both reference one settings-profile fingerprint while retaining separate `store_settings` rows.
- Retry the same sync operation ID and confirm it does not duplicate an item or analytics event.
- Confirm a share ID from store A cannot be opened through store B's app proxy.

## Storefront

- Verify cached hearts render immediately.
- With an empty cache and delayed network, confirm the loading spinner remains centered in the eventual heart button.
- Click add/remove repeatedly under network throttling; UI must change once per click without animation restarts. Remove an item while its add request is visibly in flight and confirm it stays removed after both background operations complete.
- Go offline, add/remove products, refresh, reconnect, and confirm the final database state matches local intent.
- Verify product variant changes, in-stock rule, excluded tags, login requirement, add-to-cart, sharing, and clear-all.
- Verify 5px inset at all position-slider extremes.
- Test the header app block, manual markup, and automatic pre-cart placement.
- Verify custom CSS applies and unsafe CSS is rejected with a readable 400 error.

## Admin

- Verify dashboard metrics and recent wishlists are tenant-isolated.
- Verify Top products returns at most 10 records for all-time and 30-day periods.
- Verify Customize preview uses the same heart shape and position formula as storefront.
- Verify settings from one installed shop do not alter another shop.
- Verify Plans opens Shopify's top-level pricing screen and degrades safely to Free when canonical billing credentials are not configured.

## Deployment

- Resolve the Compose file with explicit secrets (`DATABASE_URL=... POSTGRES_PASSWORD=... docker compose config`) and confirm no placeholder credential remains.
- Build the Docker image.
- Confirm the process runs as the `nextjs` user.
- Confirm `/api/health` succeeds with PostgreSQL available and returns HTTP 503 when PostgreSQL is unavailable.
- Confirm the baseline initializes an empty database, upgrades an existing database without data loss, and migrations run exactly once under concurrent startup.
- Confirm graceful SIGTERM shutdown and persistent database storage.
