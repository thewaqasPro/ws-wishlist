import Preview from "@/components/customize/Preview";
import WishlistHeart from "@/components/icons/WishlistHeart";
import SectionCard from "@/components/customize/SectionCard";
import useAuthenticatedFetch from "@/components/hooks/useAuthenticatedFetch";
import isInitialLoad from "@/utils/middleware/isInitialLoad";
import {
  BlockStack,
  Button,
  Checkbox,
  InlineStack,
  Page,
  RangeSlider,
  Select,
  SkeletonPage,
  Text,
  TextField,
} from "@shopify/polaris";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

export async function getServerSideProps(context) {
  return await isInitialLoad(context);
}

const sectionDescriptions = {
  icon: "Control where the Wishlist icon appears across your store.",
  page: "Customize the layout and content of your Wishlist page.",
  floating: "Choose how customers access their Wishlist page.",
  add: "Customize the add and remove Wishlist buttons on product pages.",
  rules: "Control stock, login, and product eligibility rules.",
  translations: "Edit the storefront text shown to shoppers.",
  header: "Add a wishlist destination to the store header.",
  css: "Apply optional storefront-only CSS without editing the app files.",
  url: "This is the app proxy path that powers your Wishlist page.",
};

const PREVIEW_PAGES = [
  { label: "Collection", value: "collection" },
  { label: "Product", value: "product" },
  { label: "Wishlist", value: "wishlist" },
];

export default function CustomizePage() {
  const api = useAuthenticatedFetch();
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(null);
  const [open, setOpen] = useState("icon");
  const [previewPage, setPreviewPage] = useState("collection");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [proxyPath, setProxyPath] = useState("/apps/page");
  const [shop, setShop] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy URL");

  const finalShop = shop || router.query.shop;
  const fullProxyUrl = useMemo(() => {
    return finalShop ? `https://${finalShop}${proxyPath}` : proxyPath;
  }, [finalShop, proxyPath]);

  useEffect(() => {
    api("/api/apps/settings")
      .then(({ settings: loaded, proxyPath: loadedProxyPath, shop: loadedShop }) => {
        setSettings(loaded);
        setSaved(loaded);
        if (loadedProxyPath) setProxyPath(loadedProxyPath);
        if (loadedShop) setShop(loadedShop);
      })
      .catch((err) => setError(err.message));
  }, [api]);

  const dirty = useMemo(
    () =>
      settings && saved && JSON.stringify(settings) !== JSON.stringify(saved),
    [settings, saved]
  );
  const set = useCallback(
    (key, value) => setSettings((current) => ({ ...current, [key]: value })),
    []
  );

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const { settings: next } = await api("/api/apps/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      setSettings(next);
      setSaved(next);
      window.shopify?.toast?.show?.("Wishlist settings saved");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(fullProxyUrl);
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy URL"), 2000);
  };

  if (!settings)
    return <SkeletonPage title="Customize WS Wishlist" primaryAction />;

  return (
    <Page
      fullWidth
      title="Customize WS Wishlist"
      backAction={{ content: "WS Wishlist", url: "/" }}
      primaryAction={{
        content: "Save",
        onAction: save,
        loading: saving,
        disabled: !dirty,
      }}
      secondaryActions={[
        {
          content: "Discard",
          onAction: () => setSettings(saved),
          disabled: !dirty,
        },
      ]}
    >
      {error ? (
        <div className="ws-error">
          <Text tone="critical">{error}</Text>
        </div>
      ) : null}

      {dirty ? (
        <div className="ws-unsaved-banner">
          <span>⚠ You have unsaved changes</span>
          <button className="ws-unsaved-save" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save now"}
          </button>
        </div>
      ) : null}

      <div className="ws-customize-layout">
        <div className="ws-customize-sidebar">
          <SectionCard
            title="Wishlist icon"
            description={sectionDescriptions.icon}
            open={open === "icon"}
            onToggle={() => setOpen(open === "icon" ? "" : "icon")}
          >
            <BlockStack gap="300">
              <Checkbox
                label="Show icon on collection pages"
                checked={settings.showOnCollectionPages}
                onChange={(v) => set("showOnCollectionPages", v)}
              />
              <Checkbox
                label="Show icon on home page"
                checked={settings.showOnHomePage}
                onChange={(v) => set("showOnHomePage", v)}
              />
              <Checkbox
                label="Show icon on the main product image"
                checked={settings.showOnProductImage}
                onChange={(v) => set("showOnProductImage", v)}
              />

              {/* Color picker + hex field */}
              <div className="ws-color-field">
                <label className="ws-color-label">Heart icon color</label>
                <div className="ws-color-row">
                  <input
                    type="color"
                    className="ws-color-swatch"
                    value={
                      /^#[0-9a-f]{6}$/i.test(settings.heartColor)
                        ? settings.heartColor
                        : "#222222"
                    }
                    onChange={(e) => set("heartColor", e.target.value)}
                  />
                  <input
                    type="text"
                    className="ws-color-hex"
                    value={settings.heartColor}
                    onChange={(e) => set("heartColor", e.target.value)}
                    placeholder="#222222"
                    maxLength={7}
                  />
                  <span className="ws-color-preview-heart">
                    <WishlistHeart
                      color={settings.heartColor}
                      active
                      size={24}
                    />
                  </span>
                </div>
                <small className="ws-color-help">
                  Use a six-digit hex color, for example #222222.
                </small>
              </div>

              <RangeSlider
                label="Move vertically (5px edge padding)"
                min={0}
                max={100}
                output
                value={settings.iconPositionY}
                onChange={(v) => set("iconPositionY", v)}
                suffix={<span>{settings.iconPositionY}%</span>}
              />
              <Text tone="subdued" as="p">
                At 0 the icon starts 5px from the top/left; at 100 it remains
                5px inside the bottom/right edge.
              </Text>
              <RangeSlider
                label="Move horizontally (5px edge padding)"
                min={0}
                max={100}
                output
                value={settings.iconPositionX}
                onChange={(v) => set("iconPositionX", v)}
                suffix={<span>{settings.iconPositionX}%</span>}
              />
            </BlockStack>
          </SectionCard>

          <SectionCard
            title="Wishlist page"
            description={sectionDescriptions.page}
            open={open === "page"}
            onToggle={() => setOpen(open === "page" ? "" : "page")}
          >
            <BlockStack gap="300">
              <TextField
                label="Page title"
                value={settings.pageTitle}
                onChange={(v) => set("pageTitle", v)}
                autoComplete="off"
              />
              <TextField
                label="Empty state heading"
                value={settings.emptyStateTitle}
                onChange={(v) => set("emptyStateTitle", v)}
                autoComplete="off"
              />
              <TextField
                label="Empty state message"
                value={settings.emptyStateBody}
                onChange={(v) => set("emptyStateBody", v)}
                multiline={3}
                autoComplete="off"
              />
              <Checkbox
                label="Show product prices"
                checked={settings.showPrices}
                onChange={(v) => set("showPrices", v)}
              />
              <Checkbox
                label="Show Add to cart buttons"
                checked={settings.showAddToCart}
                onChange={(v) => set("showAddToCart", v)}
              />
            </BlockStack>
          </SectionCard>

          <SectionCard
            title="My Wishlist button"
            description={sectionDescriptions.floating}
            open={open === "floating"}
            onToggle={() => setOpen(open === "floating" ? "" : "floating")}
          >
            <BlockStack gap="300">
              <Checkbox
                label="Show floating Wishlist button"
                checked={settings.floatingButtonEnabled}
                onChange={(v) => set("floatingButtonEnabled", v)}
              />
              <TextField
                label="Button text"
                value={settings.floatingButtonText}
                onChange={(v) => set("floatingButtonText", v)}
                autoComplete="off"
              />
              <Select
                label="Position"
                options={[
                  { label: "Bottom right", value: "bottom-right" },
                  { label: "Bottom left", value: "bottom-left" },
                ]}
                value={settings.floatingButtonPosition}
                onChange={(v) => set("floatingButtonPosition", v)}
              />
            </BlockStack>
          </SectionCard>

          <SectionCard
            title="Add to Wishlist button"
            description={sectionDescriptions.add}
            open={open === "add"}
            onToggle={() => setOpen(open === "add" ? "" : "add")}
          >
            <BlockStack gap="300">
              <Checkbox
                label="Show button on product pages"
                checked={settings.addButtonEnabled}
                onChange={(v) => set("addButtonEnabled", v)}
              />
              <TextField
                label="Add text"
                value={settings.addButtonText}
                onChange={(v) => set("addButtonText", v)}
                autoComplete="off"
              />
              <TextField
                label="Remove text"
                value={settings.removeButtonText}
                onChange={(v) => set("removeButtonText", v)}
                autoComplete="off"
              />
            </BlockStack>
          </SectionCard>

          <SectionCard
            title="Advanced display rules"
            description={sectionDescriptions.rules}
            open={open === "rules"}
            onToggle={() => setOpen(open === "rules" ? "" : "rules")}
          >
            <BlockStack gap="300">
              <Checkbox
                label="Require customers to log in"
                checked={settings.requireLogin}
                onChange={(v) => set("requireLogin", v)}
              />
              <Checkbox
                label="Allow only in-stock products"
                checked={settings.onlyInStock}
                onChange={(v) => set("onlyInStock", v)}
              />
              <TextField
                label="Excluded product tags"
                value={settings.excludedTags}
                onChange={(v) => set("excludedTags", v)}
                autoComplete="off"
                helpText="Comma-separated tags. Matching products cannot be saved."
              />
            </BlockStack>
          </SectionCard>

          <SectionCard
            title="Translations"
            description={sectionDescriptions.translations}
            open={open === "translations"}
            onToggle={() =>
              setOpen(open === "translations" ? "" : "translations")
            }
          >
            <Text>
              Storefront text is managed in the sections above. Theme editor
              labels are available in the extension locale files.
            </Text>
          </SectionCard>

          <SectionCard
            title="Header wishlist icon"
            description={sectionDescriptions.header}
            open={open === "header"}
            onToggle={() => setOpen(open === "header" ? "" : "header")}
          >
            <BlockStack gap="300">
              <Checkbox
                label="Automatically place a wishlist icon before the first cart link"
                checked={settings.autoInjectHeaderIcon}
                onChange={(v) => set("autoInjectHeaderIcon", v)}
                helpText="For the most reliable placement, merchants can also add the WS Wishlist Header Icon app block in the theme editor."
              />
              <Text tone="subdued" as="p">
                The automatic option targets common header cart links and does
                not move or replace the cart icon.
              </Text>
            </BlockStack>
          </SectionCard>

          <SectionCard
            title="Custom CSS"
            description={sectionDescriptions.css}
            open={open === "css"}
            onToggle={() => setOpen(open === "css" ? "" : "css")}
          >
            <TextField
              label="Storefront CSS"
              value={settings.customCss || ""}
              onChange={(v) => set("customCss", v)}
              multiline={8}
              maxLength={12000}
              showCharacterCount
              autoComplete="off"
              helpText="Scoped selectors that start with .ws-wishlist are recommended. Scripts, @import, expression(), and unsafe data URLs are blocked."
            />
          </SectionCard>

          <SectionCard
            title="Wishlist page URL"
            description={sectionDescriptions.url}
            open={open === "url"}
            onToggle={() => setOpen(open === "url" ? "" : "url")}
          >
            <BlockStack gap="300">
              <div className="ws-code-path">{fullProxyUrl}</div>
              <InlineStack gap="200">
                <Button onClick={handleCopy}>{copyLabel}</Button>
                <Button url={fullProxyUrl} external>
                  Open in new tab
                </Button>
              </InlineStack>
            </BlockStack>
          </SectionCard>
        </div>

        <div className="ws-customize-preview">
          <Preview
            settings={settings}
            page={previewPage}
            onPageChange={setPreviewPage}
          />
        </div>
      </div>
    </Page>
  );
}
