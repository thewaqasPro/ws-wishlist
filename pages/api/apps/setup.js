import withMiddleware from "@/utils/middleware/withMiddleware.js";
import { updateSettings } from "@/utils/wishlist/settings.js";

async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const settings = await updateSettings(req.user_shop, {
      setupEmbedConfirmed: Boolean(req.body?.enabled),
    });
    return res.status(200).json({ settings });
  } catch (error) {
    console.error("Setup API error", error);
    return res.status(500).json({ error: "Unable to update setup" });
  }
}

export default withMiddleware("verifyRequest")(handler);
