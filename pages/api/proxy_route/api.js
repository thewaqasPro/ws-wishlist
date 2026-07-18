import withMiddleware from "@/utils/middleware/withMiddleware.js";
import { getWishlistIdentity } from "@/utils/wishlist/identity.js";
import { resolveProduct } from "@/utils/wishlist/products.js";
import {
  addWishlistItem,
  clearWishlist,
  getWishlistPayload,
  removeWishlistItem,
  serializeItem,
} from "@/utils/wishlist/service.js";
import { getSettings, toPublicSettings } from "@/utils/wishlist/settings.js";
import prisma from "@/utils/prisma.js";

const MAX_SYNC_OPERATIONS = 50;
const OPERATION_ID_PATTERN = /^[A-Za-z0-9:_-]{12,120}$/;
const PERMANENT_SYNC_ERRORS = new Set([
  "INVALID_OPERATION_ID",
  "UNKNOWN_SYNC_ACTION",
  "INVALID_VARIANT_ID",
  "LOGIN_REQUIRED",
  "IDENTITY_REQUIRED",
  "OUT_OF_STOCK",
  "PRODUCT_EXCLUDED",
]);

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

function normalizeVariantId(value) {
  if (!value) return null;
  const stringValue = String(value);
  return stringValue.startsWith("gid://shopify/ProductVariant/")
    ? stringValue
    : /^\d+$/.test(stringValue)
      ? `gid://shopify/ProductVariant/${stringValue}`
      : null;
}

function errorResponse(res, error) {
  const code = error?.message;
  if (code === "LOGIN_REQUIRED")
    return res
      .status(401)
      .json({ error: "Please sign in to use the wishlist", code });
  if (code === "IDENTITY_REQUIRED")
    return res
      .status(400)
      .json({ error: "Wishlist identity is missing", code });
  if (code === "OUT_OF_STOCK")
    return res
      .status(409)
      .json({ error: "This product is out of stock", code });
  if (code === "PRODUCT_EXCLUDED")
    return res
      .status(403)
      .json({ error: "This product cannot be added", code });
  return res
    .status(400)
    .json({ error: error?.message || "Unable to update wishlist" });
}

function parseBody(req) {
  return typeof req.body === "string"
    ? JSON.parse(req.body || "{}")
    : req.body || {};
}

async function claimSyncOperation(
  shop,
  operationId,
  action,
  reclaimed = false
) {
  if (!OPERATION_ID_PATTERN.test(operationId)) {
    throw new Error("INVALID_OPERATION_ID");
  }

  try {
    await prisma.wishlist_sync_operation.create({
      data: { shop, operationId, action },
    });
    return "claimed";
  } catch (error) {
    if (error?.code !== "P2002") throw error;
    const existing = await prisma.wishlist_sync_operation.findUnique({
      where: { shop_operationId: { shop, operationId } },
      select: { completedAt: true, createdAt: true },
    });
    if (existing?.completedAt) return "completed";

    const stale =
      existing?.createdAt && Date.now() - existing.createdAt.getTime() > 60_000;
    if (stale && !reclaimed) {
      await releaseSyncOperation(shop, operationId);
      return claimSyncOperation(shop, operationId, action, true);
    }
    return "pending";
  }
}

async function releaseSyncOperation(shop, operationId) {
  await prisma.wishlist_sync_operation
    .delete({ where: { shop_operationId: { shop, operationId } } })
    .catch(() => {});
}

async function completeSyncOperation(shop, operationId) {
  await prisma.wishlist_sync_operation.update({
    where: { shop_operationId: { shop, operationId } },
    data: { completedAt: new Date() },
  });
}

async function runSyncOperation(shop, identity, operation) {
  const operationId = String(operation?.id || "");
  const action = String(operation?.action || "").toLowerCase();
  if (!new Set(["add", "remove", "clear"]).has(action)) {
    throw new Error("UNKNOWN_SYNC_ACTION");
  }

  const claim = await claimSyncOperation(shop, operationId, action);
  if (claim === "completed") {
    return { id: operationId, ok: true, duplicate: true };
  }
  if (claim === "pending") {
    return {
      id: operationId,
      ok: false,
      code: "OPERATION_IN_PROGRESS",
      retryable: true,
    };
  }

  try {
    if (action === "add") {
      const product = await resolveProduct({
        shop,
        handle: String(operation.handle || ""),
        variantId: operation.variantId,
      });
      const item = await addWishlistItem(shop, identity, product);
      await completeSyncOperation(shop, operationId);
      return { id: operationId, ok: true, item };
    }

    if (action === "remove") {
      const variantId = normalizeVariantId(operation.variantId);
      if (!variantId) throw new Error("INVALID_VARIANT_ID");
      await removeWishlistItem(shop, identity, variantId);
      await completeSyncOperation(shop, operationId);
      return { id: operationId, ok: true };
    }

    await clearWishlist(shop, identity);
    await completeSyncOperation(shop, operationId);
    return { id: operationId, ok: true };
  } catch (error) {
    await releaseSyncOperation(shop, operationId);
    throw error;
  }
}

async function syncOperations(shop, identity, operations) {
  if (!Array.isArray(operations) || !operations.length) {
    return { results: [], payload: await getWishlistPayload(shop, identity) };
  }
  if (operations.length > MAX_SYNC_OPERATIONS) {
    throw new Error(
      `A maximum of ${MAX_SYNC_OPERATIONS} operations is allowed`
    );
  }

  const results = [];
  for (const operation of operations) {
    try {
      results.push(await runSyncOperation(shop, identity, operation));
    } catch (error) {
      const code = error?.message || "SYNC_FAILED";
      results.push({
        id: String(operation?.id || ""),
        ok: false,
        code,
        retryable: !PERMANENT_SYNC_ERRORS.has(code),
      });
    }
  }

  // Keep the idempotency table bounded without adding a separate worker.
  if (Math.random() < 0.02) {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    prisma.wishlist_sync_operation
      .deleteMany({ where: { shop, createdAt: { lt: cutoff } } })
      .catch(() => {});
  }

  return { results, payload: await getWishlistPayload(shop, identity) };
}

async function handler(req, res) {
  const shop = req.user_shop;
  const identity = getWishlistIdentity(req);
  res.setHeader("Cache-Control", "no-store");

  try {
    if (req.method === "GET") {
      const shareId = Array.isArray(req.query.share_id)
        ? req.query.share_id[0]
        : req.query.share_id;
      if (shareId) {
        const [shared, settings] = await Promise.all([
          prisma.wishlist.findFirst({
            where: { id: String(shareId), shop },
            include: {
              items: { select: itemSelect, orderBy: { addedAt: "desc" } },
            },
          }),
          getSettings(shop),
        ]);
        if (!shared)
          return res.status(404).json({ error: "Shared wishlist not found" });
        return res.status(200).json({
          shared: true,
          items: shared.items.map(serializeItem),
          settings: toPublicSettings(settings),
        });
      }

      const [payload, settings] = await Promise.all([
        getWishlistPayload(shop, identity),
        getSettings(shop),
      ]);
      return res
        .status(200)
        .json({ ...payload, settings: toPublicSettings(settings) });
    }

    if (req.method !== "POST" && req.method !== "DELETE") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = parseBody(req);
    const action =
      req.method === "DELETE"
        ? "remove"
        : String(body.action || "").toLowerCase();

    if (action === "sync") {
      const { results, payload } = await syncOperations(
        shop,
        identity,
        body.operations
      );
      const settings = await getSettings(shop);
      return res.status(200).json({
        ok: results.every((result) => result.ok),
        results,
        ...payload,
        settings: toPublicSettings(settings),
      });
    }

    if (action === "add") {
      const product = await resolveProduct({
        shop,
        handle: String(body.handle || ""),
        variantId: body.variantId,
      });
      const item = await addWishlistItem(shop, identity, product);
      const payload = await getWishlistPayload(shop, identity);
      return res.status(200).json({ ok: true, item, items: payload.items });
    }

    if (action === "remove") {
      const variantId = normalizeVariantId(
        body.variantId || req.query.variant_id
      );
      if (!variantId)
        return res
          .status(400)
          .json({ error: "A valid variant ID is required" });
      await removeWishlistItem(shop, identity, variantId);
      const payload = await getWishlistPayload(shop, identity);
      return res.status(200).json({ ok: true, items: payload.items });
    }

    if (action === "clear") {
      await clearWishlist(shop, identity);
      return res.status(200).json({ ok: true, items: [] });
    }

    return res.status(400).json({ error: "Unknown wishlist action" });
  } catch (error) {
    console.error("Wishlist proxy API error", error);
    return errorResponse(res, error);
  }
}

export default withMiddleware("verifyProxy")(handler);
