import prisma from "@/utils/prisma.js";
import withMiddleware from "@/utils/middleware/withMiddleware.js";
import { getSettings } from "@/utils/wishlist/settings.js";

async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const shop = req.user_shop;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
      settings,
      wishlistCount,
      distinctProducts,
      valueAggregate,
      recentWishlists,
      addEvents,
      currencyItem,
    ] = await Promise.all([
      getSettings(shop),
      prisma.wishlist.count({
        where: { shop, updatedAt: { gte: since }, items: { some: {} } },
      }),
      prisma.wishlist_item.findMany({
        where: { wishlist: { shop }, addedAt: { gte: since } },
        distinct: ["productId"],
        select: { productId: true },
      }),
      prisma.wishlist_item.aggregate({
        where: { wishlist: { shop }, addedAt: { gte: since } },
        _sum: { price: true },
      }),
      prisma.wishlist.findMany({
        where: { shop, items: { some: {} } },
        orderBy: { updatedAt: "desc" },
        take: 8,
        include: {
          items: {
            orderBy: { addedAt: "desc" },
            take: 4,
            select: {
              id: true,
              title: true,
              imageUrl: true,
              price: true,
              currency: true,
            },
          },
          _count: { select: { items: true } },
        },
      }),
      prisma.wishlist_event.findMany({
        where: { shop, type: "ADD", createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 250,
        select: { productId: true, value: true },
      }),
      prisma.wishlist_item.findFirst({
        where: { wishlist: { shop } },
        orderBy: { addedAt: "desc" },
        select: { currency: true },
      }),
    ]);

    const totalValue = Number(valueAggregate._sum.price || 0);
    const averageWishlist = wishlistCount ? totalValue / wishlistCount : 0;
    const productCounts = new Map();
    for (const event of addEvents) {
      if (!event.productId) continue;
      const entry = productCounts.get(event.productId) || {
        productId: event.productId,
        saves: 0,
        value: 0,
      };
      entry.saves += 1;
      entry.value += Number(event.value || 0);
      productCounts.set(event.productId, entry);
    }

    return res.status(200).json({
      period: "last_30_days",
      currency: currencyItem?.currency || "USD",
      stats: {
        wishlists: wishlistCount,
        products: distinctProducts.length,
        totalValue,
        averageWishlist,
      },
      setup: {
        embedEnabled: settings.setupEmbedConfirmed,
        customized: Boolean(settings.customizedAt),
        completed: [
          settings.setupEmbedConfirmed,
          Boolean(settings.customizedAt),
        ].filter(Boolean).length,
        total: 2,
      },
      themeEditorUrl: `https://${shop}/admin/themes/current/editor?context=apps&template=index&activateAppId=${process.env.SHOPIFY_API_KEY}/ws-wishlist`,
      proxyPath: `/${process.env.APP_PROXY_PREFIX || "apps"}/${process.env.APP_PROXY_SUBPATH || "page"}`,
      recentWishlists: recentWishlists.map((wishlist) => ({
        id: wishlist.id,
        label: wishlist.customerId
          ? `Customer #${wishlist.customerId}`
          : "Guest wishlist",
        customerId: wishlist.customerId,
        visitorId: wishlist.visitorId,
        itemCount: wishlist._count.items,
        updatedAt: wishlist.updatedAt.toISOString(),
        items: wishlist.items.map((item) => ({
          ...item,
          price: Number(item.price),
        })),
      })),
      topProducts: Array.from(productCounts.values())
        .sort((a, b) => b.saves - a.saves)
        .slice(0, 5),
    });
  } catch (error) {
    console.error("Dashboard API error", error);
    return res.status(500).json({ error: "Unable to load dashboard" });
  }
}

export default withMiddleware("verifyRequest")(handler);
