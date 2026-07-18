import "@shopify/shopify-api/adapters/node";
import setupCheck from "./utils/setupCheck.js";

setupCheck();

console.log(`--> Running in ${process.env.NODE_ENV} mode`);

const appUrl = process.env.SHOPIFY_APP_URL || "https://wishlist.example.com";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: [appUrl.replace(/^https?:\/\//, "")],
};

export default nextConfig;
