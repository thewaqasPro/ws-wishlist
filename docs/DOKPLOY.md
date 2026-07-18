# Dokploy deployment

## Service model

Deploy this repository as a Docker Compose application or deploy the `app` image and provide an external PostgreSQL database. The included production image runs as an unprivileged `nextjs` user, applies versioned migrations, and then starts Next.js on port 3000.

## Required environment

```dotenv
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
SHOPIFY_API_SCOPES=read_products,write_app_proxy
SHOPIFY_APP_URL=https://wishlist.example.com
SHOPIFY_API_VERSION=2026-07
DATABASE_URL=postgresql://wswishlist:use-a-strong-password@postgres:5432/wswishlist?schema=public
POSTGRES_PASSWORD=use-the-same-strong-password
ENCRYPTION_STRING=...
APP_NAME=WS Wishlist
APP_HANDLE=ws-wishlist
APP_PROXY_PREFIX=apps
APP_PROXY_SUBPATH=page
PORT=3000
NEXT_TELEMETRY_DISABLED=1
```

When using the bundled Compose stack, `POSTGRES_PASSWORD` is mandatory and must match the password embedded in `DATABASE_URL`. For an external PostgreSQL service, deploy the Dockerfile app service directly, or remove the `postgres` service and its `depends_on` entry from a copy of the Compose file, then point `DATABASE_URL` at the managed service. Optional pricing-status variables are documented in `.env.example`.

## Dokploy steps

1. Create a Compose project from the repository.
2. Add production environment variables in Dokploy; do not upload a production `.env` into source control. Compose intentionally has no fallback database password and will stop before deployment when required credentials are absent.
3. Attach a persistent PostgreSQL volume or use a managed PostgreSQL service.
4. Map the public HTTPS domain to app port 3000.
5. Keep the `/api/health` health check enabled; it returns success only when PostgreSQL is reachable.
6. Deploy and confirm migration logs complete before the Next.js server starts.
7. In Shopify Partner Dashboard and `shopify.app.toml`, use the same canonical HTTPS domain.
8. From an authenticated release machine, run `npm run shopify:deploy` to publish app configuration and the theme extension.

## Upgrades

Back up PostgreSQL first. Deploy the new image; `scripts/migrate.js` applies only migrations not recorded in `_ws_wishlist_migrations` and uses an advisory lock to prevent concurrent migration execution. Container startup also rejects missing or placeholder production credentials before migrations run.

The `20260718170000_baseline` migration creates the original schema idempotently for both empty databases and legacy databases that were previously created with `prisma db push`.

The `20260718190000_optimistic_sync_profiles` migration adds:

- idempotent sync-operation records;
- deduplicated immutable settings profiles;
- automatic header-injection and custom-CSS settings.

## Rollback

Application rollback is done by redeploying the previous image. Database migrations are forward-only; restore the pre-deploy database backup when a schema rollback is required.

## Troubleshooting

- A 404 at `/apps/page` usually means the Partner Dashboard app proxy does not match the deployed TOML/environment.
- A 401 from proxy APIs usually means the request did not pass through Shopify's storefront proxy or the app secret is inconsistent.
- A login loop generally indicates an app URL/redirect URL mismatch or a changed encryption secret.
- If paid status always appears free, configure Partner API credentials and confirm the Free/Growth plans exist in Shopify App Pricing.
