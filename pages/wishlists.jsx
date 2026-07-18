import useAuthenticatedFetch from "@/components/hooks/useAuthenticatedFetch";
import isInitialLoad from "@/utils/middleware/isInitialLoad";
import {
  Badge,
  BlockStack,
  Card,
  EmptyState,
  InlineStack,
  Page,
  Pagination,
  SkeletonBodyText,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";

export async function getServerSideProps(context) {
  return await isInitialLoad(context);
}

export default function WishlistsPage() {
  const api = useAuthenticatedFetch();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const load = useCallback(
    () =>
      api(`/api/apps/wishlists?page=${page}`)
        .then(setData)
        .catch((e) => setError(e.message)),
    [api, page]
  );
  useEffect(() => {
    load();
  }, [load]);

  return (
    <Page
      title="Wishlists"
      subtitle="Browse recent shopper wishlists"
      backAction={{ content: "WS Wishlist", url: "/" }}
    >
      {error ? (
        <Card>
          <Text tone="critical">{error}</Text>
        </Card>
      ) : null}
      {!data ? (
        <Card>
          <SkeletonBodyText lines={8} />
        </Card>
      ) : data.wishlists.length ? (
        <BlockStack gap="300">
          {data.wishlists.map((list) => (
            <Card key={list.id}>
              <InlineStack
                align="space-between"
                blockAlign="center"
                wrap={false}
              >
                <BlockStack gap="100">
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="h3" variant="headingMd">
                      {list.customerId
                        ? `Customer #${list.customerId}`
                        : "Guest wishlist"}
                    </Text>
                    <Badge>{list.itemCount} items</Badge>
                  </InlineStack>
                  <Text tone="subdued">
                    Updated {new Date(list.updatedAt).toLocaleString()}
                  </Text>
                  <Text>
                    Visible sample value:{" "}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: list.items[0]?.currency || "USD",
                    }).format(list.value)}
                  </Text>
                </BlockStack>
                <InlineStack gap="200" wrap={false}>
                  {list.items.map((item) =>
                    item.imageUrl ? (
                      <Thumbnail
                        key={item.id}
                        source={item.imageUrl}
                        alt={item.title}
                        size="medium"
                      />
                    ) : null
                  )}
                </InlineStack>
              </InlineStack>
            </Card>
          ))}
          <InlineStack align="center">
            <Pagination
              hasPrevious={page > 1}
              onPrevious={() => setPage((p) => p - 1)}
              hasNext={page < data.pages}
              onNext={() => setPage((p) => p + 1)}
            />
          </InlineStack>
        </BlockStack>
      ) : (
        <Card>
          <EmptyState heading="No wishlists yet" image="">
            <p>
              Shopper wishlists will appear after the storefront embed is
              active.
            </p>
          </EmptyState>
        </Card>
      )}
    </Page>
  );
}
