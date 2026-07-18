import { BlockStack, Card, Collapsible, Text } from "@shopify/polaris";

export default function SectionCard({
  title,
  description,
  open,
  onToggle,
  children,
}) {
  return (
    <Card padding="0">
      <button
        className={`ws-section-trigger${open ? " ws-section-trigger--open" : ""}`}
        type="button"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span>
          <Text as="span" variant="headingMd">
            {title}
          </Text>
          {description ? <small>{description}</small> : null}
        </span>
        <span className="ws-section-chevron" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <Collapsible open={open} id={`section-${title.replaceAll(" ", "-")}`}>
        <div className="ws-section-content">{children}</div>
      </Collapsible>
    </Card>
  );
}
