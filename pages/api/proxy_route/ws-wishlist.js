import withMiddleware from "@/utils/middleware/withMiddleware.js";
import { getSettings } from "@/utils/wishlist/settings.js";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const ASSETS = [
  "ws-wishlist-icons.js",
  "ws-wishlist-storage.js",
  "ws-wishlist-api.js",
  "ws-wishlist-state.js",
  "ws-wishlist-panel.js",
  "ws-wishlist-buttons.js",
  "ws-wishlist.js",
];

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method not allowed");

  try {
    const settings = await getSettings(req.user_shop);
    const proxyPath = `/${process.env.APP_PROXY_PREFIX || "apps"}/${process.env.APP_PROXY_SUBPATH || "page"}`;
    const scripts = ASSETS.map(
      (asset) => `<script src="{{ '${asset}' | asset_url }}" defer></script>`
    ).join("\n");

    res.setHeader("Content-Type", "application/liquid; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(`
      {{ 'ws-wishlist.css' | asset_url | stylesheet_tag }}
      <div hidden data-ws-wishlist-config data-proxy-path="${escapeHtml(proxyPath)}" data-page-type="page" data-customer-id="{% if customer %}{{ customer.id }}{% endif %}"></div>
      <section class="page-width ws-wishlist-proxy-page" data-ws-wishlist-page data-proxy-path="${escapeHtml(proxyPath)}">
        <header class="ws-wishlist-page-header">
          <h1>${escapeHtml(settings.pageTitle)}</h1>
          <p class="ws-wishlist-page-description">${escapeHtml(settings.emptyStateBody.replace("Save products you love and come back to them anytime.", "Save your favorite products for later"))}</p>
          <div class="ws-wishlist-page-toolbar" data-ws-wishlist-toolbar></div>
        </header>
        <div class="ws-wishlist-page-content" data-ws-wishlist-page-content>
          <div class="ws-wishlist-page-loading">
            <span class="ws-wishlist-spinner-large"></span>
            <p>Loading your wishlist…</p>
          </div>
        </div>
        <noscript>Please enable JavaScript to use your wishlist.</noscript>
      </section>
      ${scripts}
    `);
  } catch (error) {
    console.error("Wishlist proxy page error", error);
    return res.status(500).send("Unable to load wishlist");
  }
}

export default withMiddleware("verifyProxy")(handler);
