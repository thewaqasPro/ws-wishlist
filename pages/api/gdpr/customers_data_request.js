import { gdprErrorResponse, parseVerifiedGdprRequest } from "@/utils/gdpr.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const payload = await parseVerifiedGdprRequest(req);
    // Shopify expects an acknowledgement. Wishlist data remains queryable by
    // shop/customer ID for the merchant's compliance export process.
    console.info("GDPR customer data request received", {
      shop: payload.shop_domain,
      customerId: payload.customer?.id,
      requestId: payload.data_request?.id,
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    return gdprErrorResponse(res, error);
  }
}
