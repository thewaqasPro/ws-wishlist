# WS Wishlist

WS Wishlist is a Shopify wishlist app with an embedded merchant admin, a theme app extension, a signed app-proxy API, PostgreSQL persistence, local-first storefront interactions, analytics, Shopify-hosted pricing support, and a Dokploy-ready Docker deployment.

## What is included

- Instant add/remove interactions backed by a durable, shopper-scoped browser queue. The storefront updates local state first, handles rapid add/remove reversals, and synchronizes to PostgreSQL through the signed app proxy without blocking the shopper.
- A modular storefront bundle. The former large `ws-wishlist.js` has been split into icon, storage, API, state, panel, button-injection, and bootstrap modules.
- One shared SVG heart design across the admin preview and storefront.
- Product-card and product-image hearts with a guaranteed 5px inset at every slider endpoint.
- Wishlist drawer, dedicated app-proxy page, page app block, product-page button, add-to-cart actions, sharing, guest wishlists, and guest-to-customer merge.
- A header app block plus optional automatic placement immediately before common cart links.
- Merchant custom CSS with server-side validation and a 12,000-character limit.
- Store-isolated settings with immutable, fingerprinted settings profiles. Stores with identical configurations can reference one profile instead of duplicating the full configuration as a new profile row.
- Top 10 wishlist-products reporting and rolling 30-day dashboard metrics.
- Free forever and optional Growth-plan UI using Shopify-hosted pricing. No off-platform billing is implemented.
- Mandatory privacy webhook routes, app-uninstall handling, signed proxy verification, authenticated admin APIs, database-backed health checks, fresh-install/upgrade SQL migrations, strict runtime environment validation, and a non-root production container.

## Important paths

```text
pages/                         Embedded admin pages and API routes
utils/wishlist/                Wishlist settings, identity, products, and services
utils/billing.js               Shopify pricing/subscription helpers
prisma/schema.prisma           PostgreSQL data model
prisma/migrations/             Versioned SQL migrations
extensions/ws-wishlist-theme/  Theme app extension and modular storefront assets
scripts/migrate.js             Production migration runner
Dockerfile                     Multi-stage non-root production image
docker-compose.yml             App and PostgreSQL stack
docs/                          Setup, architecture, review, and deployment guides
```

## Local development

Requirements: Node.js 22+, PostgreSQL, a Shopify Partner app, Shopify CLI authentication, and an HTTPS development URL.

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run migrate
npm run build
```

Use `npm run shopify -- app dev` for Shopify-connected development. The app proxy path must match `shopify.app.toml`; this package uses `/apps/page`.

After installation, enable the **Wishlist** app embed in the theme editor. Add the **Wishlist header icon** app block to the header for deterministic placement, or enable automatic pre-cart placement in **Customize**. Add `/apps/page` to store navigation for the hosted wishlist page, or add the **Wishlist page** app block to a Shopify page template.

## Production and release

Dokploy instructions are in [`docs/DOKPLOY.md`](docs/DOKPLOY.md). Shopify review preparation is in [`docs/APP_STORE_SUBMISSION.md`](docs/APP_STORE_SUBMISSION.md).

Deploying the Docker service does not publish Shopify app configuration or extensions. From an authenticated release machine:

```bash
npm install
npm run shopify:config
npm run shopify:deploy
```

Create the public Free and Growth plans in Shopify Partner Dashboard before relying on plan status. Keep `ENFORCE_PLAN_LIMITS=false` until billing has been tested in a Shopify development store.

## Verification commands

```bash
npm run prisma:generate
npm run build
npm run lint:check
npm run shopify:config
```

The Shopify CLI validation and deployment commands require network access and Shopify authentication. Review [`docs/VERIFICATION.md`](docs/VERIFICATION.md) before release.

## Security notes

Never include `.env`, database dumps, session exports, Shopify access tokens, Partner API tokens, or private keys in a release archive. Keep `ENCRYPTION_STRING` stable. Back up PostgreSQL before deploying migrations. Shopify approval cannot be guaranteed by code alone; listing content, test credentials, pricing configuration, privacy policies, support details, and reviewer instructions must also be completed in Partner Dashboard.
