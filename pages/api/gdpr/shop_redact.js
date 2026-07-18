import prisma from "@/utils/prisma.js";
import { gdprErrorResponse, parseVerifiedGdprRequest } from "@/utils/gdpr.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const payload = await parseVerifiedGdprRequest(req);
    const shop = String(payload.shop_domain || "").toLowerCase();

    if (shop) {
      await prisma.$transaction([
        prisma.session.deleteMany({ where: { shop } }),
        prisma.stores.deleteMany({ where: { shop } }),
      ]);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return gdprErrorResponse(res, error);
  }
}
