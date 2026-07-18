import prisma from "@/utils/prisma.js";
import withMiddleware from "@/utils/middleware/withMiddleware.js";
import {
  getPlanSelectionUrl,
  getSubscriptionStatus,
  PLAN_CONFIG,
} from "@/utils/billing.js";

async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const shop = req.user_shop;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [activeWishlists, subscription] = await Promise.all([
      prisma.wishlist.count({
        where: { shop, updatedAt: { gte: since }, items: { some: {} } },
      }),
      getSubscriptionStatus(shop),
    ]);
    // This app exposes one optional paid public plan. Any active paid
    // subscription therefore maps to Growth, independent of pricing-item handles.
    const isGrowth = subscription.active;

    return res.status(200).json({
      currentPlan: isGrowth ? "growth" : "free",
      subscriptionSource: subscription.source,
      billingStatusConfigured: subscription.configured,
      activeWishlists,
      overFreeLimit: activeWishlists > PLAN_CONFIG.free.activeWishlistLimit,
      planSelectionUrl: getPlanSelectionUrl(shop),
      plans: PLAN_CONFIG,
      enforcementEnabled: process.env.ENFORCE_PLAN_LIMITS === "true",
    });
  } catch (error) {
    console.error("Plans API error", error);
    return res.status(500).json({ error: "Unable to load plans" });
  }
}

export default withMiddleware("verifyRequest")(handler);
