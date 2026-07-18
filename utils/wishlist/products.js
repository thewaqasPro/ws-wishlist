import clientProvider from "@/utils/clientProvider.js";

function normalizeGid(value, type) {
  if (!value) return null;
  const stringValue = String(value);
  return stringValue.startsWith("gid://")
    ? stringValue
    : /^\d+$/.test(stringValue)
      ? `gid://shopify/${type}/${stringValue}`
      : null;
}

export async function resolveProduct({ shop, handle, variantId }) {
  if (!handle || !/^[a-z0-9][a-z0-9-]*$/i.test(handle)) {
    throw new Error("A valid product handle is required.");
  }

  const { client } = await clientProvider.offline.graphqlClient({ shop });
  const response = await client.request(
    `#graphql
      query WsWishlistProduct($identifier: ProductIdentifierInput!) {
        shop { currencyCode }
        product: productByIdentifier(identifier: $identifier) {
          id
          handle
          title
          tags
          totalInventory
          onlineStoreUrl
          featuredMedia {
            preview {
              image { url altText }
            }
          }
          variants(first: 100) {
            nodes {
              id
              title
              price
              availableForSale
            }
          }
        }
      }
    `,
    { variables: { identifier: { handle } } }
  );

  const data = response?.data || response;
  const product = data?.product;
  if (!product) throw new Error("Product not found.");

  const wantedVariant = normalizeGid(variantId, "ProductVariant");
  const variant =
    product.variants?.nodes?.find((node) => node.id === wantedVariant) ||
    product.variants?.nodes?.[0];
  if (!variant) throw new Error("Product has no purchasable variant.");

  return {
    productId: product.id,
    variantId: variant.id,
    productHandle: product.handle,
    title: product.title,
    variantTitle: variant.title === "Default Title" ? null : variant.title,
    productUrl: product.onlineStoreUrl || `/products/${product.handle}`,
    imageUrl: product.featuredMedia?.preview?.image?.url || null,
    imageAlt: product.featuredMedia?.preview?.image?.altText || product.title,
    price: String(variant.price || "0"),
    currency: data?.shop?.currencyCode || "USD",
    available: Boolean(variant.availableForSale),
    tags: Array.isArray(product.tags) ? product.tags : [],
    totalInventory: Number(product.totalInventory || 0),
  };
}
