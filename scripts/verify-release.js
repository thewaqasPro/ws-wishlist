import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import TOML from "@iarna/toml";
import { validateRuntimeEnvironment } from "./runtime-env.js";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const fail = (message) => {
  throw new Error(message);
};

const appConfig = TOML.parse(read("shopify.app.toml"));
const extensionConfig = TOML.parse(
  read("extensions/ws-wishlist-theme/shopify.extension.toml")
);
if (appConfig.webhooks?.api_version !== "2026-07") {
  fail("Shopify webhook API version must be 2026-07");
}
if (extensionConfig.api_version !== "2026-07") {
  fail("Theme extension API version must be 2026-07");
}
const privacy = appConfig.webhooks?.privacy_compliance || {};
for (const key of [
  "customer_data_request_url",
  "customer_deletion_url",
  "shop_deletion_url",
]) {
  if (!privacy[key]) fail(`Missing privacy compliance URL: ${key}`);
}

for (const file of fs
  .readdirSync(path.join(root, "extensions/ws-wishlist-theme/blocks"))
  .filter((name) => name.endsWith(".liquid"))) {
  const source = read(`extensions/ws-wishlist-theme/blocks/${file}`);
  const schema = source.match(/\{% schema %\}([\s\S]*?)\{% endschema %\}/);
  if (!schema) fail(`Missing schema block in ${file}`);
  JSON.parse(schema[1]);
}

const baselineMigration = read(
  "prisma/migrations/20260718170000_baseline/migration.sql"
);
const upgradeMigration = read(
  "prisma/migrations/20260718190000_optimistic_sync_profiles/migration.sql"
);
for (const table of [
  "stores",
  "session",
  "store_settings",
  "wishlist",
  "wishlist_item",
  "wishlist_event",
]) {
  if (!baselineMigration.includes(`CREATE TABLE IF NOT EXISTS "${table}"`)) {
    fail(`Baseline migration does not create ${table}`);
  }
}
for (const table of ["wishlist_sync_operation", "wishlist_settings_profile"]) {
  if (!upgradeMigration.includes(`CREATE TABLE IF NOT EXISTS "${table}"`)) {
    fail(`Upgrade migration does not create ${table}`);
  }
}
if (read("docs/DOKPLOY.md").includes("_ws_migrations")) {
  fail("Dokploy docs reference the wrong migration history table");
}

const validEnvironment = {
  DATABASE_URL: "postgresql://user:password@db:5432/wswishlist",
  SHOPIFY_API_KEY: "real-api-key",
  SHOPIFY_API_SECRET: "real-api-secret",
  SHOPIFY_API_SCOPES: "read_products,write_app_proxy",
  SHOPIFY_APP_URL: "https://wishlist.test-shop-domain.dev",
  SHOPIFY_API_VERSION: "2026-07",
  ENCRYPTION_STRING: "12345678901234567890123456789012",
  APP_NAME: "WS Wishlist",
  APP_HANDLE: "ws-wishlist",
  APP_PROXY_PREFIX: "apps",
  APP_PROXY_SUBPATH: "page",
};
validateRuntimeEnvironment(validEnvironment);
let placeholderRejected = false;
try {
  validateRuntimeEnvironment({
    ...validEnvironment,
    SHOPIFY_API_SECRET: "replace_me",
  });
} catch {
  placeholderRejected = true;
}
if (!placeholderRejected)
  fail("Runtime environment accepted a placeholder secret");

const storefrontState = read(
  "extensions/ws-wishlist-theme/assets/ws-wishlist-state.js"
);
if (!storefrontState.includes("readQueue().slice(0, 50)")) {
  fail("Storefront sync batching cap is missing");
}
if (!storefrontState.includes("cancelledInFlightAdds")) {
  fail("Rapid add/remove compensation is missing");
}
const storefrontStorage = read(
  "extensions/ws-wishlist-theme/assets/ws-wishlist-storage.js"
);
if (!storefrontStorage.includes("identityScope")) {
  fail("Storefront cache is not scoped by shopper identity");
}
if (
  !read("pages/api/health.js").includes('prisma.$queryRawUnsafe("SELECT 1")')
) {
  fail("Health endpoint does not verify PostgreSQL");
}

const browserAssets = fs
  .readdirSync(path.join(root, "extensions/ws-wishlist-theme/assets"))
  .filter((name) => name.startsWith("ws-wishlist") && name.endsWith(".js"));
for (const asset of browserAssets) {
  execFileSync(
    process.execPath,
    ["--check", path.join(root, "extensions/ws-wishlist-theme/assets", asset)],
    {
      stdio: "inherit",
    }
  );
}

const adminHeart = read("components/icons/WishlistHeart.jsx").match(
  /M20\.84[^"']+/
)?.[0];
const storefrontHeart = read(
  "extensions/ws-wishlist-theme/assets/ws-wishlist-icons.js"
).match(/M20\.84[^"']+/)?.[0];
if (!adminHeart || adminHeart !== storefrontHeart) {
  fail("Admin and storefront heart paths differ");
}

const storefrontFiles = browserAssets.map((name) => ({
  name,
  lines: read(`extensions/ws-wishlist-theme/assets/${name}`).split("\n").length,
}));
const largeFile = storefrontFiles.find(({ lines }) => lines > 400);
if (largeFile)
  fail(`${largeFile.name} is too large (${largeFile.lines} lines)`);

const heartButtonSize = 36;
const heartInset = 5;
const heartSlope = (heartButtonSize + heartInset * 2) / 100;
const x0 = heartInset - 0 * heartSlope;
const x100 = heartInset - 100 * heartSlope;
if (x0 !== heartInset || 100 + x100 + heartButtonSize !== 100 - heartInset) {
  fail("Heart positioning invariant changed");
}

const previewCss = read("styles/globals.css");
if (
  !previewCss.includes(".ws-preview-heart-btn") ||
  !previewCss.includes("width: 36px")
) {
  fail("Customizer heart button size differs from storefront");
}

const searchable = [
  "README.md",
  ".env.example",
  "shopify.app.toml",
  "utils/shopify.js",
  "pages/api/apps/dashboard.js",
  "pages/api/apps/settings.js",
]
  .map(read)
  .join("\n");
if (searchable.includes("/apps/ws-wishlist")) fail("Legacy proxy path remains");
if (searchable.includes("2026-04")) fail("Legacy API version remains");

const documentSource = read("pages/_document.js");
const appBridgeIndex = documentSource.indexOf("app-bridge.js");
const nextScriptIndex = documentSource.indexOf("<NextScript");
if (
  appBridgeIndex < 0 ||
  nextScriptIndex < 0 ||
  appBridgeIndex > nextScriptIndex
) {
  fail("App Bridge must load before application scripts");
}

console.log(
  `Release checks passed (${browserAssets.length} storefront modules; largest ${Math.max(...storefrontFiles.map(({ lines }) => lines))} lines).`
);
