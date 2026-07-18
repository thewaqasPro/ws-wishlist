import {
  Badge,
  BlockStack,
  Button,
  Card,
  Divider,
  InlineStack,
  ProgressBar,
  Text,
} from "@shopify/polaris";
import { CheckCircleIcon, ExternalIcon } from "@shopify/polaris-icons";

function Step({ complete, title, action, actionLabel, external }) {
  return (
    <div className="ws-setup-step">
      <InlineStack
        align="space-between"
        blockAlign="center"
        gap="300"
        wrap={false}
      >
        <InlineStack gap="300" blockAlign="center" wrap={false}>
          <span
            className={
              complete ? "ws-step-icon ws-step-icon--done" : "ws-step-icon"
            }
          >
            {complete ? "✓" : "○"}
          </span>
          <Text as="p" variant="headingMd">
            {title}
          </Text>
          {complete ? <Badge tone="success">Done</Badge> : null}
        </InlineStack>
        {!complete && actionLabel ? (
          <Button
            onClick={action}
            icon={external ? ExternalIcon : undefined}
            external={external}
          >
            {actionLabel}
          </Button>
        ) : null}
      </InlineStack>
    </div>
  );
}

export default function SetupCard({
  setup,
  themeEditorUrl,
  onConfirmEmbed,
  onCustomize,
}) {
  const progress = setup.total
    ? Math.round((setup.completed / setup.total) * 100)
    : 0;
  return (
    <Card padding="0">
      <div className="ws-card-pad">
        <BlockStack gap="300">
          <Text as="h2" variant="headingLg">
            Set up WS Wishlist
          </Text>
          <InlineStack gap="400" blockAlign="center" wrap={false}>
            <Text as="p">
              You&apos;ve completed {setup.completed} of {setup.total} steps.
              Finish setup to start collecting shopper intent.
            </Text>
            <div className="ws-progress">
              <ProgressBar progress={progress} size="small" />
            </div>
          </InlineStack>
        </BlockStack>
      </div>
      <Divider />
      <Step
        complete={setup.embedEnabled}
        title="App embed activated"
        action={() => {
          window.open(themeEditorUrl, "_blank", "noopener,noreferrer");
          onConfirmEmbed();
        }}
        actionLabel="Open theme editor"
        external
      />
      <Divider />
      <Step
        complete={setup.customized}
        title="Customize the app"
        action={onCustomize}
        actionLabel="Customize"
      />
      <Divider />
      <div className="ws-card-pad ws-tip">
        <Text as="p">
          Tip: Every step you finish makes WS Wishlist more effective at turning
          saved products into orders.
        </Text>
      </div>
    </Card>
  );
}
