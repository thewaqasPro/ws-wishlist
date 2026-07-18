import prisma from "@/utils/prisma.js";
import withMiddleware from "@/utils/middleware/withMiddleware.js";

async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const shop = req.user_shop;
    const period = req.query.period === "30d" ? "30d" : "all";
    const since =
      period === "30d" ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : null;
    const where = {
      wishlist: { shop },
      ...(since ? { addedAt: { gte: since } } : {}),
    };

    const grouped = await prisma.wishlist_item.groupBy({
      by: ["productId"],
      where,
      _count: { productId: true },
      _max: { addedAt: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    });

    const productIds = grouped.map((row) => row.productId);
    const details = productIds.length
      ? await prisma.wishlist_item.findMany({
          where: { ...where, productId: { in: productIds } },
          orderBy: { addedAt: "desc" },
          select: {
            productId: true,
            title: true,
            productHandle: true,
            productUrl: true,
            imageUrl: true,
            imageAlt: true,
            price: true,
            currency: true,
            available: true,
          },
        })
      : [];

    const latestByProduct = new Map();
    for (const item of details) {
      if (!latestByProduct.has(item.productId)) {
        latestByProduct.set(item.productId, item);
      }
    }

    return res.status(200).json({
      period,
      products: grouped.map((row, index) => {
        const item = latestByProduct.get(row.productId) || {};
        return {
          rank: index + 1,
          productId: row.productId,
          saves: row._count.productId,
          lastSavedAt: row._max.addedAt?.toISOString() || null,
          title: item.title || "Unknown product",
          productHandle: item.productHandle || null,
          productUrl: item.productUrl || null,
          imageUrl: item.imageUrl || null,
          imageAlt: item.imageAlt || item.title || "",
          price: Number(item.price || 0),
          currency: item.currency || "USD",
          available: Boolean(item.available),
        };
      }),
    });
  } catch (error) {
    console.error("Top products API error", error);
    return res.status(500).json({ error: "Unable to load top products" });
  }
}

export default withMiddleware("verifyRequest")(handler);
