import useAuthenticatedFetch from "@/components/hooks/useAuthenticatedFetch";
import isInitialLoad from "@/utils/middleware/isInitialLoad";
import {
  Badge,
  BlockStack,
  Button,
  Card,
  InlineGrid,
  InlineStack,
  Page,
  SkeletonBodyText,
  Text,
} from "@shopify/polaris";
import { useEffect, useState } from "react";

export async function getServerSideProps(context) {
  return await isInitialLoad(context);
}

function PlanCard({ title, price, description, features, active, action }) {
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingLg">
            {title}
          </Text>
          {active ? <Badge tone="success">Current plan</Badge> : null}
        </InlineStack>
        <Text as="p" variant="heading2xl">
          {price}
        </Text>
        <Text tone="subdued">{description}</Text>
        <div className="ws-plan-features">
          {features.map((feature) => (
            <div key={feature}>✓ {feature}</div>
          ))}
        </div>
        {action}
      </BlockStack>
    </Card>
  );
}

export default function PlansPage() {
  const api = useAuthenticatedFetch();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/apps/plans")
      .then(setData)
      .catch((err) => setError(err.message));
  }, [api]);

  const openPricing = () => {
    if (!data?.planSelectionUrl) return;
    window.open(data.planSelectionUrl, "_top");
  };

  return (
    <Page
      title="Plans"
      subtitle="A free forever plan with an optional upgrade for high-volume stores"
      backAction={{ content: "WS Wishlist", url: "/" }}
    >
      <BlockStack gap="400">
        {error ? (
          <Card>
            <Text tone="critical">{error}</Text>
          </Card>
        ) : null}

        {!data ? (
          <Card>
            <SkeletonBodyText lines={8} />
          </Card>
        ) : (
          <>
            <Card>
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingMd">
                    Current usage
                  </Text>
                  <Text tone="subdued">
                    {data.activeWishlists} active wishlists in the last 30 days
                  </Text>
                </BlockStack>
                {data.overFreeLimit ? (
                  <Badge tone="attention">High-volume usage</Badge>
                ) : (
                  <Badge tone="success">Within free allowance</Badge>
                )}
              </InlineStack>
            </Card>

            <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
              <PlanCard
                title={data.plans.free.name}
                price="$0 forever"
                description={`Designed for stores with up to ${data.plans.free.activeWishlistLimit.toLocaleString()} active wishlists per month.`}
                features={[
                  "Wishlist hearts and product button",
                  "Local-first instant interactions",
                  "Wishlist page and drawer",
                  "Top-product analytics",
                  "Custom CSS and header icon block",
                ]}
                active={data.currentPlan === "free"}
                action={
                  <Button disabled={data.currentPlan === "free"}>
                    {data.currentPlan === "free"
                      ? "Included"
                      : "Downgrade in Shopify"}
                  </Button>
                }
              />
              <PlanCard
                title={data.plans.growth.name}
                price={`$${data.plans.growth.price.toFixed(2)}/month`}
                description="Optional pricing for stores whose wishlist usage has grown beyond the free allowance."
                features={[
                  "Unlimited active wishlists",
                  "Priority support",
                  "High-volume sync capacity",
                  "All current and future core features",
                ]}
                active={data.currentPlan === "growth"}
                action={
                  <Button
                    variant="primary"
                    onClick={openPricing}
                    disabled={data.currentPlan === "growth"}
                  >
                    {data.currentPlan === "growth"
                      ? "Current plan"
                      : "View Shopify pricing"}
                  </Button>
                }
              />
            </InlineGrid>

            {!data.billingStatusConfigured ? (
              <Card>
                <Text tone="subdued">
                  Shopify App Pricing credentials are not configured on this
                  deployment, so the page defaults to the free plan. Configure
                  the Partner API environment variables before enforcing paid
                  entitlements.
                </Text>
              </Card>
            ) : null}
          </>
        )}
      </BlockStack>
    </Page>
  );
}
