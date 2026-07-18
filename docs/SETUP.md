# Setup

## 1. Shopify app

Create or select a public Shopify app in Partner Dashboard. Use managed installation and the GraphQL Admin API. Configure the production application URL and redirect URL to your HTTPS deployment.

This repository uses:

```text
API version: 2026-07
Scopes: read_products, write_app_proxy
App proxy: /apps/page -> /api/proxy_route
```

Do not add a public form that asks merchants to type a shop domain to install the app. Public installation should begin from a Shopify surface.

## 2. Environment

Copy `.env.example` to `.env` and set:

- Shopify API key, secret, public app URL, and API version.
- PostgreSQL `DATABASE_URL`.
- A long, stable `ENCRYPTION_STRING`.
- `APP_HANDLE`, `APP_PROXY_PREFIX=apps`, and `APP_PROXY_SUBPATH=page`.
- Optional Partner API values for canonical Shopify App Pricing subscription status.

Never commit `.env`.

## 3. Install and migrate

```bash
npm install
npm run prisma:generate
npm run migrate
npm run build
```

For Shopify-connected development:

```bash
npm run shopify -- app dev
```

## 4. Theme setup

In the theme editor:

1. Enable the **Wishlist** app embed and save.
2. Add the **Wishlist header icon** app block to the header when the theme supports header app blocks.
3. Add the **Wishlist page** app block to a page template, or add `/apps/page` to navigation.

The **Customize** page also has an automatic header option that inserts the icon before the first common cart link. The app block is preferred because theme markup varies.

## 5. Pricing

Create two public plans in Shopify Partner Dashboard / App Pricing:

- **Free forever**: free public plan.
- **Growth**: optional monthly paid plan; the included UI defaults to USD 9.99.

Set the app's pricing welcome link to `/plans`. Configure the Partner API environment variables to read canonical subscription state. Keep `ENFORCE_PLAN_LIMITS=false` during review unless entitlement behavior has been fully tested.

## 6. Verification

Run the checklist in `docs/VERIFICATION.md`, deploy the app configuration/extension with Shopify CLI, and test install, uninstall, reinstall, privacy webhooks, app proxy, theme-editor activation, billing, and mobile storefront behavior on development stores.
