import prisma from "@/utils/prisma.js";
import withMiddleware from "@/utils/middleware/withMiddleware.js";

async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const take = 20;
    const where = { shop: req.user_shop };
    const [total, wishlists] = await Promise.all([
      prisma.wishlist.count({ where }),
      prisma.wishlist.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * take,
        take,
        include: {
          items: { orderBy: { addedAt: "desc" } },
          _count: { select: { items: true } },
        },
      }),
    ]);
    return res.status(200).json({
      page,
      pages: Math.max(1, Math.ceil(total / take)),
      total,
      wishlists: wishlists.map((row) => ({
        id: row.id,
        customerId: row.customerId,
        visitorId: row.visitorId,
        itemCount: row._count.items,
        value: row.items.reduce((sum, item) => sum + Number(item.price), 0),
        updatedAt: row.updatedAt.toISOString(),
        items: row.items.slice(0, 5).map((item) => ({
          id: item.id,
          title: item.title,
          variantTitle: item.variantTitle,
          imageUrl: item.imageUrl,
          price: Number(item.price),
          currency: item.currency,
        })),
      })),
    });
  } catch (error) {
    console.error("Wishlists API error", error);
    return res.status(500).json({ error: "Unable to load wishlists" });
  }
}

export default withMiddleware("verifyRequest")(handler);
