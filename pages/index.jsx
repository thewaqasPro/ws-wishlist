import MetricCard from "@/components/dashboard/MetricCard";
import SetupCard from "@/components/dashboard/SetupCard";
import useAuthenticatedFetch from "@/components/hooks/useAuthenticatedFetch";
import isInitialLoad from "@/utils/middleware/isInitialLoad";
import LandingPage from "./landing/page";

import {
  BlockStack,
  Button,
  Card,
  EmptyState,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

export async function getServerSideProps(context) {
  return await isInitialLoad(context);
}

export default function HomePage({ isDirectVisit }) {
  if (isDirectVisit) {
    return <InstallLandingPage />;
  }
  return <DashboardPage />;
}

function DashboardPage() {
  const api = useAuthenticatedFetch();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setData(await api("/api/apps/dashboard"));
    } catch (err) {
      setError(err.message);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const formatMoney = useCallback(
    (value) =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: data?.currency || "USD",
        maximumFractionDigits: 0,
      }).format(value),
    [data?.currency]
  );

  const confirmEmbed = async () => {
    try {
      await api("/api/apps/setup", {
        method: "POST",
        body: JSON.stringify({ enabled: true }),
      });
      window.shopify?.toast?.show?.("App embed marked as activated");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!data) {
    return (
      <Page title="WS Wishlist">
        <Layout>
          <Layout.Section>
            <Card>
              <SkeletonDisplayText size="small" />
              <br />
              <SkeletonBodyText lines={6} />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="WS Wishlist"
      subtitle="Storefront wishlist analytics and setup"
    >
      <BlockStack gap="500">
        {error ? (
          <Card>
            <Text tone="critical">{error}</Text>
          </Card>
        ) : null}
        <InlineStack align="end">
          <Text tone="subdued">Results for last 30 days</Text>
        </InlineStack>
        <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
          <MetricCard
            label="Wishlists"
            value={data.stats.wishlists.toLocaleString()}
          />
          <MetricCard
            label="Products"
            value={data.stats.products.toLocaleString()}
          />
          <MetricCard
            label="Total value"
            value={formatMoney(data.stats.totalValue)}
          />
          <MetricCard
            label="Average wishlist"
            value={formatMoney(data.stats.averageWishlist)}
          />
        </InlineGrid>
        <SetupCard
          setup={data.setup}
          themeEditorUrl={data.themeEditorUrl}
          onConfirmEmbed={confirmEmbed}
          onCustomize={() =>
            router.push(
              `/customize?shop=${router.query.shop || ""}&host=${router.query.host || ""}`
            )
          }
        />
        <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingLg">
                  Recent wishlists
                </Text>
                <Button
                  variant="plain"
                  onClick={() =>
                    router.push(
                      `/wishlists?shop=${router.query.shop || ""}&host=${router.query.host || ""}`
                    )
                  }
                >
                  View all
                </Button>
              </InlineStack>
              {data.recentWishlists.length ? (
                data.recentWishlists.slice(0, 5).map((list) => (
                  <div className="ws-recent-row" key={list.id}>
                    <div>
                      <Text as="p" variant="headingSm">
                        {list.label}
                      </Text>
                      <Text as="p" tone="subdued">
                        {list.itemCount} saved{" "}
                        {list.itemCount === 1 ? "product" : "products"}
                      </Text>
                    </div>
                    <InlineStack gap="100" wrap={false}>
                      {list.items
                        .slice(0, 3)
                        .map((item) =>
                          item.imageUrl ? (
                            <Thumbnail
                              key={item.id}
                              source={item.imageUrl}
                              alt={item.title}
                              size="small"
                            />
                          ) : null
                        )}
                    </InlineStack>
                  </div>
                ))
              ) : (
                <EmptyState heading="No wishlists yet" image="">
                  <p>
                    Activate the app embed and shoppers&apos; saved products
                    will appear here.
                  </p>
                </EmptyState>
              )}
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                Storefront access
              </Text>
              <Text>
                WS Wishlist uses a Shopify app proxy, so customer requests stay
                on the merchant&apos;s storefront domain.
              </Text>
              <div className="ws-code-path">{data.proxyPath}</div>
              <Text tone="subdued">
                Use this URL as a menu destination for a dedicated wishlist
                page. The theme app embed also opens a fast wishlist drawer.
              </Text>
              <Button
                onClick={() => navigator.clipboard?.writeText(data.proxyPath)}
              >
                Copy wishlist URL
              </Button>
            </BlockStack>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}

function InstallLandingPage() {
  return <LandingPage />;
}
