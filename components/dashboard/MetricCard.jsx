import { BlockStack, Card, Text } from "@shopify/polaris";

export default function MetricCard({ label, value }) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text as="p" variant="headingSm">
          {label}
        </Text>
        <Text as="p" variant="heading2xl">
          {value}
        </Text>
      </BlockStack>
    </Card>
  );
}
