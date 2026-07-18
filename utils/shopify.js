import { LogSeverity, shopifyApi } from "@shopify/shopify-api";
import "@shopify/shopify-api/adapters/node";
import appUninstallHandler from "./webhooks/app_uninstalled.js";

const isDev = process.env.NODE_ENV === "development";
const appUrl = process.env.SHOPIFY_APP_URL || "https://wishlist.example.com";

// Environment fallbacks allow static compilation and container image creation.
// setupCheck logs missing production values, and real requests still require the
// configured Shopify credentials.
let shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || "build-placeholder",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "build-placeholder-secret",
  scopes: process.env.SHOPIFY_API_SCOPES || "read_products",
  hostName: appUrl.replace(/^https?:\/\//, ""),
  hostScheme: "https",
  apiVersion: process.env.SHOPIFY_API_VERSION || "2026-07",
  isEmbeddedApp: true,
  logger: { level: isDev ? LogSeverity.Info : LogSeverity.Error },
});

shopify = {
  ...shopify,
  user: {
    webhooks: [
      {
        topics: ["app/uninstalled"],
        url: "/api/webhooks/app_uninstalled",
        callback: appUninstallHandler,
      },
    ],
    events: [],
    metafields: [],
  },
};

export default shopify;
