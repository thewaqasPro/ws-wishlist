import prisma from "@/utils/prisma.js";
import { getSettings } from "./settings.js";

const itemSelect = {
  id: true,
  productId: true,
  variantId: true,
  productHandle: true,
  title: true,
  variantTitle: true,
  productUrl: true,
  imageUrl: true,
  imageAlt: true,
  price: true,
  currency: true,
  available: true,
  addedAt: true,
};

export function serializeItem(item) {
  return {
    ...item,
    price: Number(item.price),
    addedAt: item.addedAt?.toISOString?.() || item.addedAt,
  };
}

async function findWishlist(shop, identity) {
  if (!identity.key) return null;
  return prisma.wishlist.findUnique({
    where: { shop_key: { shop, key: identity.key } },
  });
}

async function createOrGetWishlist(shop, identity) {
  if (!identity.key) return null;
  return prisma.wishlist.upsert({
    where: { shop_key: { shop, key: identity.key } },
    update: {},
    create: {
      shop,
      key: identity.key,
      customerId: identity.customerId,
      visitorId: identity.customerId ? null : identity.visitorId,
    },
  });
}

async function touchWishlist(client, wishlistId) {
  await client.wishlist.update({
    where: { id: wishlistId },
    data: { updatedAt: new Date() },
  });
}

async function mergeGuestWishlist(shop, customerWishlist, visitorId) {
  if (!visitorId || !customerWishlist) return;
  const guest = await prisma.wishlist.findUnique({
    where: { shop_key: { shop, key: `visitor:${visitorId}` } },
    include: { items: true },
  });
  if (!guest || guest.id === customerWishlist.id) return;

  await prisma.$transaction(async (tx) => {
    for (const item of guest.items) {
      await tx.wishlist_item.upsert({
        where: {
          wishlistId_variantId: {
            wishlistId: customerWishlist.id,
            variantId: item.variantId,
          },
        },
        update: {
          productId: item.productId,
          productHandle: item.productHandle,
          title: item.title,
          variantTitle: item.variantTitle,
          productUrl: item.productUrl,
          imageUrl: item.imageUrl,
          imageAlt: item.imageAlt,
          price: item.price,
          currency: item.currency,
          available: item.available,
        },
        create: {
          wishlistId: customerWishlist.id,
          productId: item.productId,
          variantId: item.variantId,
          productHandle: item.productHandle,
          title: item.title,
          variantTitle: item.variantTitle,
          productUrl: item.productUrl,
          imageUrl: item.imageUrl,
          imageAlt: item.imageAlt,
          price: item.price,
          currency: item.currency,
          available: item.available,
        },
      });
    }
    await tx.wishlist.delete({ where: { id: guest.id } });
    await touchWishlist(tx, customerWishlist.id);
  });
}

export async function getWishlistPayload(shop, identity) {
  const settings = await getSettings(shop);
  if (settings.requireLogin && !identity.customerId) {
    return { wishlist: null, items: [], requiresLogin: true };
  }
  if (!identity.key)
    return { wishlist: null, items: [], requiresIdentity: true };

  let wishlist = await findWishlist(shop, identity);
  if (identity.customerId && identity.visitorId) {
    const guest = await prisma.wishlist.findUnique({
      where: { shop_key: { shop, key: `visitor:${identity.visitorId}` } },
      select: { id: true },
    });
    if (guest) {
      wishlist ||= await createOrGetWishlist(shop, identity);
      await mergeGuestWishlist(shop, wishlist, identity.visitorId);
    }
  }
  if (!wishlist) {
    return { wishlist: null, items: [], requiresLogin: false };
  }
  const fresh = await prisma.wishlist.findUnique({
    where: { id: wishlist.id },
    include: { items: { select: itemSelect, orderBy: { addedAt: "desc" } } },
  });
  return {
    wishlist: { id: fresh.id, updatedAt: fresh.updatedAt.toISOString() },
    items: fresh.items.map(serializeItem),
    requiresLogin: false,
  };
}

function isExcluded(product, settings) {
  const excluded = settings.excludedTags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  return excluded.some((tag) =>
    product.tags.map((value) => value.toLowerCase()).includes(tag)
  );
}

export async function addWishlistItem(shop, identity, product) {
  const settings = await getSettings(shop);
  if (settings.requireLogin && !identity.customerId)
    throw new Error("LOGIN_REQUIRED");
  if (!identity.key) throw new Error("IDENTITY_REQUIRED");
  if (settings.onlyInStock && !product.available)
    throw new Error("OUT_OF_STOCK");
  if (isExcluded(product, settings)) throw new Error("PRODUCT_EXCLUDED");

  const wishlist = await createOrGetWishlist(shop, identity);
  if (identity.customerId && identity.visitorId)
    await mergeGuestWishlist(shop, wishlist, identity.visitorId);

  const item = await prisma.wishlist_item.upsert({
    where: {
      wishlistId_variantId: {
        wishlistId: wishlist.id,
        variantId: product.variantId,
      },
    },
    update: {
      productId: product.productId,
      productHandle: product.productHandle,
      title: product.title,
      variantTitle: product.variantTitle,
      productUrl: product.productUrl,
      imageUrl: product.imageUrl,
      imageAlt: product.imageAlt,
      price: product.price,
      currency: product.currency,
      available: product.available,
    },
    create: {
      wishlistId: wishlist.id,
      productId: product.productId,
      variantId: product.variantId,
      productHandle: product.productHandle,
      title: product.title,
      variantTitle: product.variantTitle,
      productUrl: product.productUrl,
      imageUrl: product.imageUrl,
      imageAlt: product.imageAlt,
      price: product.price,
      currency: product.currency,
      available: product.available,
    },
  });

  await prisma.$transaction([
    prisma.wishlist_event.create({
      data: {
        shop,
        wishlistId: wishlist.id,
        type: "ADD",
        productId: product.productId,
        variantId: product.variantId,
        value: product.price,
      },
    }),
    prisma.wishlist.update({
      where: { id: wishlist.id },
      data: { updatedAt: new Date() },
    }),
  ]);
  return serializeItem(item);
}

export async function removeWishlistItem(shop, identity, variantId) {
  if (!identity.key || !variantId) return false;
  const wishlist = await prisma.wishlist.findUnique({
    where: { shop_key: { shop, key: identity.key } },
  });
  if (!wishlist) return false;
  const existing = await prisma.wishlist_item.findUnique({
    where: { wishlistId_variantId: { wishlistId: wishlist.id, variantId } },
  });
  if (!existing) return false;
  await prisma.$transaction([
    prisma.wishlist_item.delete({ where: { id: existing.id } }),
    prisma.wishlist_event.create({
      data: {
        shop,
        wishlistId: wishlist.id,
        type: "REMOVE",
        productId: existing.productId,
        variantId: existing.variantId,
        value: existing.price,
      },
    }),
    prisma.wishlist.update({
      where: { id: wishlist.id },
      data: { updatedAt: new Date() },
    }),
  ]);
  return true;
}

export async function clearWishlist(shop, identity) {
  if (!identity.key) return 0;
  const wishlist = await prisma.wishlist.findUnique({
    where: { shop_key: { shop, key: identity.key } },
  });
  if (!wishlist) return 0;
  const [result] = await prisma.$transaction([
    prisma.wishlist_item.deleteMany({ where: { wishlistId: wishlist.id } }),
    prisma.wishlist_event.create({
      data: { shop, wishlistId: wishlist.id, type: "CLEAR" },
    }),
    prisma.wishlist.update({
      where: { id: wishlist.id },
      data: { updatedAt: new Date() },
    }),
  ]);
  return result.count;
}
