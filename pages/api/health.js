import prisma from "@/utils/prisma.js";

const DATABASE_TIMEOUT_MS = 2500;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let timeoutId;

  try {
    await Promise.race([
      prisma.$queryRawUnsafe("SELECT 1"),
      new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("Database health check timed out")),
          DATABASE_TIMEOUT_MS
        );
      }),
    ]);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      ok: true,
      service: "ws-wishlist",
      database: "ok",
    });
  } catch (error) {
    console.error("Health check failed", error);
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({
      ok: false,
      service: "ws-wishlist",
      database: "unavailable",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
