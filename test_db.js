import prisma from "./utils/prisma.js";

async function main() {
  const wishlists = await prisma.wishlist.findMany({
    where: {
      shop: "ws-themes-kjcsxce4.myshopify.com",
    },
  });
  console.log("WISHLISTS:", JSON.stringify(wishlists, null, 2));

  const items = await prisma.wishlist_item.findMany({
    where: {
      wishlist: {
        shop: "ws-themes-kjcsxce4.myshopify.com",
      },
    },
  });
  console.log("WISHLIST ITEMS:", JSON.stringify(items, null, 2));

  const syncOps = await prisma.wishlist_sync_operation.findMany({
    where: {
      shop: "ws-themes-kjcsxce4.myshopify.com",
    },
  });
  console.log("SYNC OPERATIONS:", JSON.stringify(syncOps, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
