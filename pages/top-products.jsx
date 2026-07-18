import useAuthenticatedFetch from "@/components/hooks/useAuthenticatedFetch";
import isInitialLoad from "@/utils/middleware/isInitialLoad";
import {
  Badge,
  BlockStack,
  Card,
  EmptyState,
  InlineStack,
  Page,
  Select,
  SkeletonBodyText,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";

export async function getServerSideProps(context) {
  return await isInitialLoad(context);
}

export default function TopProductsPage() {
  const api = useAuthenticatedFetch();
  const [period, setPeriod] = useState("all");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setData(null);
    setError("");
    api(`/api/apps/top-products?period=${period}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [api, period]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Page
      title="Top wishlist products"
      subtitle="The 10 products shoppers have saved most often"
      backAction={{ content: "WS Wishlist", url: "/" }}
    >
      <BlockStack gap="400">
        <Card>
          <InlineStack align="space-between" blockAlign="center">
            <Text as="h2" variant="headingMd">
              Product ranking
            </Text>
            <div style={{ minWidth: 180 }}>
              <Select
                label="Period"
                labelHidden
                options={[
                  { label: "All time", value: "all" },
                  { label: "Last 30 days", value: "30d" },
                ]}
                value={period}
                onChange={setPeriod}
              />
            </div>
          </InlineStack>
        </Card>

        {error ? (
          <Card>
            <Text tone="critical">{error}</Text>
          </Card>
        ) : null}

        {!data ? (
          <Card>
            <SkeletonBodyText lines={10} />
          </Card>
        ) : data.products.length ? (
          <BlockStack gap="300">
            {data.products.map((product) => (
              <Card key={product.productId}>
                <InlineStack
                  align="space-between"
                  blockAlign="center"
                  wrap={false}
                >
                  <InlineStack gap="400" blockAlign="center" wrap={false}>
                    <div className="ws-top-product-rank">#{product.rank}</div>
                    {product.imageUrl ? (
                      <Thumbnail
                        source={product.imageUrl}
                        alt={product.imageAlt || product.title}
                        size="medium"
                      />
                    ) : (
                      <div className="ws-top-product-placeholder" />
                    )}
                    <BlockStack gap="100">
                      <Text as="h3" variant="headingMd">
                        {product.title}
                      </Text>
                      <Text tone="subdued">
                        Last saved{" "}
                        {new Date(product.lastSavedAt).toLocaleString()}
                      </Text>
                      <Text>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: product.currency,
                        }).format(product.price)}
                      </Text>
                    </BlockStack>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center" wrap={false}>
                    <Badge tone={product.available ? "success" : "warning"}>
                      {product.available ? "Available" : "Unavailable"}
                    </Badge>
                    <Badge tone="info">{product.saves} saves</Badge>
                  </InlineStack>
                </InlineStack>
              </Card>
            ))}
          </BlockStack>
        ) : (
          <Card>
            <EmptyState heading="No saved products yet" image="">
              <p>
                Rankings appear after shoppers add products to their wishlists.
              </p>
            </EmptyState>
          </Card>
        )}
      </BlockStack>
    </Page>
  );
}
