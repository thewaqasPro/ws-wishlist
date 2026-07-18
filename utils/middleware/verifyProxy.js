import crypto from "node:crypto";

function normalizeValue(value) {
  return Array.isArray(value)
    ? value.map(String).join(",")
    : String(value ?? "");
}

export function calculateProxySignature(
  query,
  secret = process.env.SHOPIFY_API_SECRET
) {
  const message = Object.keys(query)
    .filter((key) => key !== "signature")
    .sort()
    .map((key) => `${key}=${normalizeValue(query[key])}`)
    .join("");
  return crypto
    .createHmac("sha256", secret)
    .update(message, "utf8")
    .digest("hex");
}

const verifyProxy = async (req, res, next) => {
  try {
    const signature = Array.isArray(req.query.signature)
      ? req.query.signature[0]
      : req.query.signature;
    const shop = Array.isArray(req.query.shop)
      ? req.query.shop[0]
      : req.query.shop;
    if (!signature || !shop || !process.env.SHOPIFY_API_SECRET) {
      return res.status(401).json({ error: "Invalid app proxy request" });
    }

    const calculated = calculateProxySignature(req.query);
    const suppliedBuffer = Buffer.from(String(signature), "utf8");
    const calculatedBuffer = Buffer.from(calculated, "utf8");
    const valid =
      suppliedBuffer.length === calculatedBuffer.length &&
      crypto.timingSafeEqual(suppliedBuffer, calculatedBuffer);

    if (!valid)
      return res.status(401).json({ error: "Signature verification failed" });
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(String(shop))) {
      return res.status(401).json({ error: "Invalid shop" });
    }

    req.user_shop = String(shop).toLowerCase();
    await next();
  } catch (error) {
    console.error("App proxy verification failed", error);
    return res.status(401).json({ error: "Signature verification failed" });
  }
};

export default verifyProxy;
