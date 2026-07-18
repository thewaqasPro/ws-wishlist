import clientProvider from "@/utils/clientProvider.js";

const PARTNER_API_VERSION =
  process.env.SHOPIFY_PARTNER_API_VERSION || "2026-07";

export const PLAN_CONFIG = Object.freeze({
  free: {
    handle: process.env.SHOPIFY_FREE_PLAN_HANDLE || "free-forever",
    name: "Free forever",
    price: 0,
    activeWishlistLimit: Number(process.env.FREE_ACTIVE_WISHLIST_LIMIT || 1000),
  },
  growth: {
    handle: process.env.SHOPIFY_GROWTH_PLAN_HANDLE || "growth",
    name: "Growth",
    price: Number(process.env.GROWTH_PLAN_PRICE_USD || 9.99),
    activeWishlistLimit: null,
  },
});

export function getPlanSelectionUrl(shop) {
  const storeHandle = String(shop || "").replace(/\.myshopify\.com$/i, "");
  const appHandle = process.env.APP_HANDLE || "ws-wishlist";
  return `https://admin.shopify.com/store/${encodeURIComponent(storeHandle)}/charges/${encodeURIComponent(appHandle)}/pricing_plans`;
}

async function getShopGid(shop) {
  const { client } = await clientProvider.offline.graphqlClient({ shop });
  const response = await client.request(`#graphql
    query WsWishlistBillingShop {
      shop { id }
    }
  `);
  return (response?.data || response)?.shop?.id || null;
}

async function getPartnerSubscription(shop) {
  const organizationId = process.env.SHOPIFY_PARTNER_ORGANIZATION_ID;
  const accessToken = process.env.SHOPIFY_PARTNER_ACCESS_TOKEN;
  const appId = process.env.SHOPIFY_PARTNER_APP_ID;
  if (!organizationId || !accessToken || !appId) return null;

  const shopId = await getShopGid(shop);
  if (!shopId) return null;

  const response = await fetch(
    `https://partners.shopify.com/${organizationId}/api/${PARTNER_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: `#graphql
          query WsWishlistActiveSubscription($appId: ID!, $shopId: ID!) {
            activeSubscription(appId: $appId, shopId: $shopId) {
              billingPeriod
              cancelAtEndOfCycle
              trialEndsAt
              currentBillingCycle { startTime endTime }
              items {
                handle
                description
                price {
                  __typename
                  active
                  currency
                  ... on FlatRatePrice { amount }
                }
              }
            }
          }
        `,
        variables: { appId, shopId },
      }),
    }
  );

  if (!response.ok) throw new Error(`Partner API returned ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message || "Partner API query failed");
  }
  return payload.data?.activeSubscription || null;
}

async function getLegacySubscription(shop) {
  const { client } = await clientProvider.offline.graphqlClient({ shop });
  const response = await client.request(`#graphql
    query WsWishlistLegacySubscriptions {
      currentAppInstallation {
        activeSubscriptions {
          id
          name
          status
          currentPeriodEnd
        }
      }
    }
  `);
  const subscriptions =
    (response?.data || response)?.currentAppInstallation?.activeSubscriptions ||
    [];
  return subscriptions[0] || null;
}

export async function getSubscriptionStatus(shop) {
  try {
    const partner = await getPartnerSubscription(shop);
    if (partner) {
      const handles = partner.items.map((item) => item.handle).filter(Boolean);
      return {
        source: "shopify_app_pricing",
        configured: true,
        active: true,
        handle: handles.includes(PLAN_CONFIG.growth.handle)
          ? PLAN_CONFIG.growth.handle
          : handles[0] || null,
        subscription: partner,
      };
    }
  } catch (error) {
    console.warn("Unable to read Shopify App Pricing subscription", error);
  }

  try {
    const legacy = await getLegacySubscription(shop);
    if (legacy) {
      return {
        source: "billing_api",
        configured: true,
        active: true,
        handle: legacy.name || null,
        subscription: legacy,
      };
    }
  } catch (error) {
    console.warn("Unable to read legacy billing subscription", error);
  }

  return {
    source: "free_default",
    configured: Boolean(
      process.env.SHOPIFY_PARTNER_ORGANIZATION_ID &&
      process.env.SHOPIFY_PARTNER_ACCESS_TOKEN &&
      process.env.SHOPIFY_PARTNER_APP_ID
    ),
    active: false,
    handle: PLAN_CONFIG.free.handle,
    subscription: null,
  };
}
