import toml from "@iarna/toml";
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import shopify from "../utils/shopify.js";

const appUrl = String(process.env.SHOPIFY_APP_URL || "").replace(/\/$/, "");
if (!appUrl || !process.env.SHOPIFY_API_KEY) {
  console.error(
    "SHOPIFY_APP_URL and SHOPIFY_API_KEY are required to write shopify.app.toml"
  );
  process.exit(1);
}

const config = {
  name: process.env.APP_NAME || "WS Wishlist",
  handle: process.env.APP_HANDLE || "ws-wishlist",
  client_id: process.env.SHOPIFY_API_KEY,
  application_url: appUrl,
  embedded: true,
  extension_directories: ["extensions/**"],
  build: {
    automatically_update_urls_on_dev: true,
  },
  auth: { redirect_urls: [`${appUrl}/api/`] },
  access_scopes: {
    scopes: process.env.SHOPIFY_API_SCOPES || "read_products,write_app_proxy",
    use_legacy_install_flow: false,
  },
  webhooks: {
    api_version: process.env.SHOPIFY_API_VERSION || "2026-07",
    subscriptions: shopify.user.webhooks.map((webhook) => ({
      topics: webhook.topics,
      uri: webhook.url,
    })),
    privacy_compliance: {
      customer_data_request_url: `${appUrl}/api/gdpr/customers_data_request`,
      customer_deletion_url: `${appUrl}/api/gdpr/customers_redact`,
      shop_deletion_url: `${appUrl}/api/gdpr/shop_redact`,
    },
  },
  app_proxy: {
    url: "/api/proxy_route",
    prefix: process.env.APP_PROXY_PREFIX || "apps",
    subpath: process.env.APP_PROXY_SUBPATH || "page",
  },
  pos: { embedded: process.env.POS_EMBEDDED === "true" },
};

fs.writeFileSync(
  path.join(process.cwd(), "shopify.app.toml"),
  toml.stringify(config)
);
console.log("Updated shopify.app.toml from environment variables.");
