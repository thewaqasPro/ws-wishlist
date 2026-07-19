import { calculateProxySignature } from "./utils/middleware/verifyProxy.js";
import http from "node:http";

// Mock env
process.env.SHOPIFY_API_SECRET = "shpss_mock_secret_key_for_testing";

const query = {
  shop: "ws-themes-kjcsxce4.myshopify.com",
  timestamp: String(Math.floor(Date.now() / 1000)),
  path_prefix: "/apps/page",
};

const signature = calculateProxySignature(
  query,
  process.env.SHOPIFY_API_SECRET
);
const url = `http://localhost:3000/api/proxy_route/api?shop=${query.shop}&timestamp=${query.timestamp}&path_prefix=${query.path_prefix}&signature=${signature}`;

console.log("Mock request URL:", url);

// We will also directly call the service to see what it resolves for the shop
import prisma from "./utils/prisma.js";
import { getWishlistPayload } from "./utils/wishlist/service.js";

async function runDirect() {
  const identity = {
    key: "visitor:mock-visitor-id",
    customerId: null,
    visitorId: "mock-visitor-id",
  };
  const payload = await getWishlistPayload(
    "ws-themes-kjcsxce4.myshopify.com",
    identity
  );
  console.log("PAYLOAD FROM DB:", JSON.stringify(payload, null, 2));
}

runDirect()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
