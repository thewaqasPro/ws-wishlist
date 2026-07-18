import withMiddleware from "@/utils/middleware/withMiddleware.js";
import { getSettings, toPublicSettings } from "@/utils/wishlist/settings.js";

async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const settings = await getSettings(req.user_shop);
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300"
    );
    return res.status(200).json({ settings: toPublicSettings(settings) });
  } catch (error) {
    console.error("Public settings proxy error", error);
    return res.status(500).json({ error: "Unable to load settings" });
  }
}

export default withMiddleware("verifyProxy")(handler);
