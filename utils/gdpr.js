import crypto from "node:crypto";

const MAX_BODY_BYTES = 1024 * 1024;

export async function readRawBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error("PAYLOAD_TOO_LARGE");
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export function verifyShopifyWebhookHmac(rawBody, headerValue) {
  if (!headerValue || !process.env.SHOPIFY_API_SECRET) return false;

  const supplied = Buffer.from(String(headerValue), "base64");
  const expected = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(rawBody)
    .digest();

  return (
    supplied.length === expected.length &&
    crypto.timingSafeEqual(supplied, expected)
  );
}

export async function parseVerifiedGdprRequest(req) {
  const rawBody = await readRawBody(req);
  const hmac = Array.isArray(req.headers["x-shopify-hmac-sha256"])
    ? req.headers["x-shopify-hmac-sha256"][0]
    : req.headers["x-shopify-hmac-sha256"];

  if (!verifyShopifyWebhookHmac(rawBody, hmac)) {
    const error = new Error("INVALID_HMAC");
    error.statusCode = 401;
    throw error;
  }

  try {
    return JSON.parse(rawBody.toString("utf8"));
  } catch {
    const error = new Error("INVALID_JSON");
    error.statusCode = 400;
    throw error;
  }
}

export function gdprErrorResponse(res, error) {
  const status =
    error?.statusCode || (error?.message === "PAYLOAD_TOO_LARGE" ? 413 : 500);
  if (status >= 500) console.error("GDPR webhook error", error);
  return res.status(status).json({
    error: status === 401 ? "Invalid signature" : "Unable to process request",
  });
}
