import withMiddleware from "@/utils/middleware/withMiddleware.js";
import {
  getSettings,
  toAdminSettings,
  updateSettings,
} from "@/utils/wishlist/settings.js";

async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const settings = await getSettings(req.user_shop);
      return res.status(200).json({
        settings: toAdminSettings(settings),
        proxyPath: `/${process.env.APP_PROXY_PREFIX || "apps"}/${process.env.APP_PROXY_SUBPATH || "page"}`,
      });
    }
    if (req.method === "PUT" || req.method === "PATCH") {
      const settings = await updateSettings(req.user_shop, req.body || {});
      return res.status(200).json({
        settings: toAdminSettings(settings),
        proxyPath: `/${process.env.APP_PROXY_PREFIX || "apps"}/${process.env.APP_PROXY_SUBPATH || "page"}`,
      });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Settings API error", error);
    const validationError = /Custom CSS contains a blocked construct/.test(
      error?.message || ""
    );
    return res.status(validationError ? 400 : 500).json({
      error: validationError ? error.message : "Unable to save settings",
    });
  }
}

export default withMiddleware("verifyRequest")(handler);
