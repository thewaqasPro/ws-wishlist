import WishlistHeart from "@/components/icons/WishlistHeart";
import { useState } from "react";

const products = [
  ["Classic Tee", "$79.00", "#f2cfbd"],
  ["Casual Shirt", "$129.00", "#dfd7b9"],
  ["Zip Jacket", "$54.00", "#c5c9d0"],
  ["Carbon Tee", "$35.00", "#dae5eb"],
  ["Summer Dress", "$79.00", "#e5b9c0"],
  ["Pleated Dress", "$129.00", "#e3e8dc"],
  ["Blush Top", "$54.00", "#e7cbd0"],
  ["Slim Pants", "$35.00", "#bec4ce"],
];

const wishlistItems = [
  {
    name: "Classic Tee",
    price: "$79.00",
    color: "#f2cfbd",
    variant: "Black / M",
  },
  {
    name: "Summer Dress",
    price: "$79.00",
    color: "#e5b9c0",
    variant: "Pink / S",
  },
  {
    name: "Zip Jacket",
    price: "$54.00",
    color: "#c5c9d0",
    variant: "Grey / L",
  },
];

const HEART_BUTTON_SIZE = 36;
const HEART_EDGE_INSET = 5;
const HEART_POSITION_SLOPE = (HEART_BUTTON_SIZE + HEART_EDGE_INSET * 2) / 100;

// Device configurations — controls inner preview viewport width
const DEVICES = {
  mobile: { key: "mobile", label: "Mobile", width: 390 },
  desktop: { key: "desktop", label: "Desktop", width: null }, // null = full container
  full: { key: "full", label: "Expand", width: null }, // null = breaks out of shell
};

// SVG Icons
const IconMobile = () => (
  <svg
    viewBox="0 0 20 20"
    width="16"
    height="16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M7.75 13.75a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Z" />
    <path
      fillRule="evenodd"
      d="M4.75 5.75a2.75 2.75 0 0 1 2.75-2.75h5a2.75 2.75 0 0 1 2.75 2.75v8.5a2.75 2.75 0 0 1-2.75 2.75h-5a2.75 2.75 0 0 1-2.75-2.75v-8.5Zm2.75-1.25c-.69 0-1.25.56-1.25 1.25v8.5c0 .69.56 1.25 1.25 1.25h5c.69 0 1.25-.56 1.25-1.25v-8.5c0-.69-.56-1.25-1.25-1.25h-.531a1 1 0 0 1-.969.75h-2a1 1 0 0 1-.969-.75h-.531Z"
    />
  </svg>
);

const IconDesktop = () => (
  <svg
    viewBox="0 0 20 20"
    width="16"
    height="16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M3.5 6.25a2.75 2.75 0 0 1 2.75-2.75h7.5a2.75 2.75 0 0 1 2.75 2.75v4.5a2.75 2.75 0 0 1-2.75 2.75h-1.25v1.5h.75a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5h.75v-1.5h-1.25a2.75 2.75 0 0 1-2.75-2.75v-4.5Zm5.5 7.25h2v1.5h-2v-1.5Zm-2.75-8.5c-.69 0-1.25.56-1.25 1.25v3.25h10v-3.25c0-.69-.56-1.25-1.25-1.25h-7.5Zm8.725 6c-.116.57-.62 1-1.225 1h-7.5a1.25 1.25 0 0 1-1.225-1h9.95Z"
    />
  </svg>
);

const IconExpand = () => (
  <svg
    viewBox="0 0 20 20"
    width="16"
    height="16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M4 5.75a2.75 2.75 0 0 1 2.75-2.75h6.5a2.75 2.75 0 0 1 2.75 2.75v.875a.75.75 0 0 1-1.5 0v-.875c0-.69-.56-1.25-1.25-1.25h-6.5c-.69 0-1.25.56-1.25 1.25v.875a.75.75 0 0 1-1.5 0v-.875Z" />
    <path d="M4.75 12.625a.75.75 0 0 1 .75.75v.875c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25v-.875a.75.75 0 0 1 1.5 0v.875a2.75 2.75 0 0 1-2.75 2.75h-6.5a2.75 2.75 0 0 1-2.75-2.75v-.875a.75.75 0 0 1 .75-.75Z" />
    <path d="M9.75 10a.75.75 0 0 1-.75.75H6.56l.72.72a.75.75 0 1 1-1.06 1.06l-2-2a.75.75 0 0 1 0-1.06l2-2a.75.75 0 1 1 1.06 1.06l-.72.72h2.44a.75.75 0 0 1 .75.75Z" />
    <path d="M11 10.75a.75.75 0 0 1 0-1.5h2.44l-.72-.72a.75.75 0 0 1 1.06-1.06l2 2a.75.75 0 0 1 0 1.06l-2 2a.75.75 0 1 1-1.06-1.06l.72-.72H11Z" />
  </svg>
);

const IconChevron = () => (
  <svg
    viewBox="0 0 20 20"
    width="14"
    height="14"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.72 8.47a.75.75 0 0 1 1.06 0l3.47 3.47 3.47-3.47a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 0-1.06Z"
    />
  </svg>
);

const PAGE_LABELS = {
  collection: "Collection page",
  product: "Product page",
  wishlist: "Wishlist page",
};

export default function Preview({
  settings,
  page = "collection",
  onPageChange,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [activeHearts, setActiveHearts] = useState([3]);
  const [device, setDevice] = useState("desktop");
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);

  // Mirrors positionHeart() in the storefront module, including a 5px edge inset.
  const positionValue = (value) => {
    const percent = Math.min(100, Math.max(0, Number(value ?? 0)));
    return `calc(${percent}% + ${HEART_EDGE_INSET - percent * HEART_POSITION_SLOPE}px)`;
  };
  const heartPosition = {
    left: positionValue(settings.iconPositionX ?? 100),
    top: positionValue(settings.iconPositionY ?? 0),
    right: "auto",
  };

  const isMobile = device === "mobile";
  const isFullWidth = device === "full";

  const toggleHeart = (index) => {
    setActiveHearts((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handlePageSelect = (value) => {
    onPageChange?.(value);
    setPageDropdownOpen(false);
  };

  // Inner viewport width based on device
  const viewportStyle = isMobile
    ? {
        maxWidth: 390,
        width: "100%",
        margin: "0 auto",
        transition: "max-width 0.3s ease",
      }
    : { maxWidth: "100%", transition: "max-width 0.3s ease" };

  // Responsive product grid columns
  const productGridStyle = isMobile
    ? { gridTemplateColumns: "repeat(2, 1fr)" }
    : {};

  // Wishlist grid
  const wishlistGridStyle = isMobile ? { gridTemplateColumns: "1fr" } : {};

  // Product page layout
  const productPreviewStyle = isMobile
    ? { gridTemplateColumns: "1fr", padding: "20px" }
    : {};

  const productImageStyle = isMobile ? { minHeight: 220 } : {};

  return (
    <div
      className={`ws-preview-shell${isFullWidth ? " ws-preview-shell--fullwidth" : ""}`}
    >
      {/* ── Toolbar ────────────────────────────────────────── */}
      <div className="ws-preview-toolbar-v2">
        {/* Page type selector */}
        <div className="ws-pt-page-selector">
          <button
            className="ws-pt-page-btn"
            onClick={() => setPageDropdownOpen((v) => !v)}
            aria-expanded={pageDropdownOpen}
          >
            <span className="ws-pt-page-icon">
              {page === "product" ? "📦" : page === "wishlist" ? "♥" : "🗂"}
            </span>
            <span>{PAGE_LABELS[page] || "Collection page"}</span>
            <span
              className={`ws-pt-chevron${pageDropdownOpen ? " ws-pt-chevron--open" : ""}`}
            >
              <IconChevron />
            </span>
          </button>
          {pageDropdownOpen && (
            <div className="ws-pt-dropdown">
              {Object.entries(PAGE_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  className={`ws-pt-dropdown-item${page === value ? " ws-pt-dropdown-item--active" : ""}`}
                  onClick={() => handlePageSelect(value)}
                >
                  <span>
                    {value === "product"
                      ? "📦"
                      : value === "wishlist"
                        ? "♥"
                        : "🗂"}
                  </span>
                  {label}
                  {page === value && <span className="ws-pt-check">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Device selector */}
        <div className="ws-pt-device-group">
          <div className="ws-pt-device-pills">
            {[
              { key: "mobile", Icon: IconMobile, label: "Mobile" },
              { key: "desktop", Icon: IconDesktop, label: "Desktop" },
            ].map(({ key, Icon, label }) => (
              <button
                key={key}
                className={`ws-pt-device-btn${device === key ? " ws-pt-device-btn--active" : ""}`}
                aria-label={label}
                aria-pressed={device === key}
                title={label}
                onClick={() => setDevice(key)}
              >
                <Icon />
              </button>
            ))}
          </div>
          <div className="ws-pt-device-sep" />
          <button
            className={`ws-pt-device-btn${device === "full" ? " ws-pt-device-btn--active" : ""}`}
            aria-label="Expand"
            aria-pressed={device === "full"}
            title="Expand to full width"
            onClick={() => setDevice(device === "full" ? "desktop" : "full")}
          >
            <IconExpand />
          </button>
        </div>
      </div>

      {/* ── Simulated browser chrome ────────────────────────── */}
      {!isFullWidth && (
        <div className="ws-preview-browser-bar">
          <div className="ws-preview-browser-dots">
            <span />
            <span />
            <span />
          </div>
          <div className="ws-preview-browser-url">
            yourstore.myshopify.com/
            {page === "wishlist"
              ? "pages/wishlist"
              : page === "product"
                ? "products/classic-tee"
                : "collections/all"}
          </div>
          <div style={{ width: 48 }} />
        </div>
      )}

      {/* ── Store preview ───────────────────────────────────── */}
      <div className="ws-preview-viewport-wrap">
        <div className="ws-store-preview-v2" style={viewportStyle}>
          {/* Nav */}
          <div
            className={`ws-store-header${isMobile ? " ws-store-header--mobile" : ""}`}
          >
            {isMobile ? (
              <>
                <strong style={{ fontSize: 13 }}>[ YOUR STORE ]</strong>
                <span
                  style={{ display: "flex", gap: 10, alignItems: "center" }}
                >
                  ☰
                  {settings.autoInjectHeaderIcon ? (
                    <WishlistHeart color={settings.heartColor} size={18} />
                  ) : null}
                  🛒
                </span>
              </>
            ) : (
              <>
                <strong>[ YOUR STORE ]</strong>
                <span style={{ textAlign: "center" }}>
                  Home &nbsp;&nbsp; Products &nbsp;&nbsp; Collection
                  &nbsp;&nbsp; Contact
                </span>
                <span
                  style={{ display: "flex", gap: 10, alignItems: "center" }}
                >
                  {settings.autoInjectHeaderIcon ? (
                    <WishlistHeart color={settings.heartColor} size={20} />
                  ) : null}
                  🛒
                </span>
              </>
            )}
          </div>

          {/* Page content */}
          {page === "product" ? (
            <div className="ws-product-preview" style={productPreviewStyle}>
              <div
                className="ws-product-image"
                style={{ background: "#e9ddcf", ...productImageStyle }}
              >
                {settings.showOnProductImage ? (
                  <button
                    type="button"
                    className="ws-preview-heart-btn"
                    style={{
                      color: settings.heartColor,
                      background: "rgba(255,255,255,0.92)",
                      ...heartPosition,
                    }}
                    aria-label="Remove from wishlist"
                    aria-pressed="true"
                  >
                    <WishlistHeart
                      color={settings.heartColor}
                      active
                      size={20}
                    />
                  </button>
                ) : null}
                <div
                  className="ws-garment"
                  style={{ fontSize: isMobile ? 48 : 72 }}
                >
                  T
                </div>
              </div>
              <div className="ws-product-copy">
                <h2 style={{ fontSize: isMobile ? 20 : undefined }}>
                  Classic Tee
                </h2>
                <p style={{ color: "#888", marginTop: 4 }}>Black / M</p>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: isMobile ? 16 : 20,
                    margin: "12px 0",
                  }}
                >
                  $79.00 USD
                </p>
                {!isMobile && (
                  <p style={{ color: "#666", fontSize: 13, lineHeight: 1.5 }}>
                    A polished product shoppers will want to save for later.
                  </p>
                )}
                <button className="ws-preview-atc">Add to cart</button>
                {settings.addButtonEnabled ? (
                  <button
                    className="ws-preview-add"
                    style={{
                      borderColor: settings.heartColor,
                      color: settings.heartColor,
                    }}
                  >
                    <WishlistHeart color={settings.heartColor} size={18} />
                    {settings.addButtonText}
                  </button>
                ) : null}
              </div>
            </div>
          ) : page === "wishlist" ? (
            <div className="ws-preview-wishlist-page">
              <div className="ws-preview-wishlist-header">
                <h2 style={{ fontSize: isMobile ? 18 : undefined }}>
                  {settings.pageTitle || "My Wishlist"}
                </h2>
                <span className="ws-preview-item-count">
                  {wishlistItems.length} items
                </span>
              </div>
              <div
                className="ws-preview-wishlist-grid"
                style={wishlistGridStyle}
              >
                {wishlistItems.map((item, i) => (
                  <div key={i} className="ws-preview-wishlist-card">
                    <div
                      className="ws-preview-wishlist-img"
                      style={{ background: item.color }}
                    >
                      <div
                        className="ws-garment"
                        style={{ fontSize: 40, color: "rgba(255,255,255,0.5)" }}
                      >
                        {i % 3 === 0 ? "T" : i % 3 === 1 ? "▱" : "⌇"}
                      </div>
                      <button
                        className="ws-preview-remove-btn"
                        title="Remove"
                        aria-label="Remove from wishlist"
                      >
                        ×
                      </button>
                    </div>
                    <div className="ws-preview-wishlist-info">
                      <strong>{item.name}</strong>
                      <span>{item.variant}</span>
                      {settings.showPrices && (
                        <span style={{ fontWeight: 600 }}>{item.price}</span>
                      )}
                      <div className="ws-preview-wishlist-actions">
                        {settings.showAddToCart && (
                          <button
                            className="ws-preview-mini-atc"
                            style={{
                              borderColor: settings.heartColor,
                              color: settings.heartColor,
                            }}
                          >
                            Add to cart
                          </button>
                        )}
                        <a className="ws-preview-mini-view">View</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="ws-preview-heading">
                <h3>Products</h3>
                <span>8 products</span>
              </div>
              <div className="ws-product-grid" style={productGridStyle}>
                {products.map(([name, price, color], index) => (
                  <div
                    className={`ws-preview-product${hoveredIdx === index ? " ws-preview-product--hovered" : ""}`}
                    key={name + index}
                    onMouseEnter={() => setHoveredIdx(index)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <div
                      className="ws-preview-product-image"
                      style={{ background: color }}
                    >
                      {settings.iconEnabled &&
                      settings.showOnCollectionPages ? (
                        <button
                          className="ws-preview-heart-btn"
                          style={{
                            color: settings.heartColor,
                            background: "rgba(255,255,255,0.92)",
                            ...heartPosition,
                          }}
                          onClick={() => toggleHeart(index)}
                          title={
                            activeHearts.includes(index)
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >
                          <WishlistHeart
                            color={settings.heartColor}
                            active={activeHearts.includes(index)}
                            size={20}
                          />
                        </button>
                      ) : null}
                      <div className="ws-garment">
                        {index % 3 === 0 ? "T" : index % 3 === 1 ? "▱" : "⌇"}
                      </div>
                    </div>
                    <small>{name}</small>
                    <small>{price} USD</small>
                  </div>
                ))}
              </div>
            </>
          )}

          {settings.floatingButtonEnabled ? (
            <div
              className={`ws-floating-preview ws-floating-preview--${settings.floatingButtonPosition}`}
              style={{
                color: settings.heartColor,
                borderColor: settings.heartColor,
              }}
            >
              <WishlistHeart color={settings.heartColor} active size={18} />
              {!isMobile && <span>{settings.floatingButtonText}</span>}
              <span
                className="ws-floating-count"
                style={{ background: settings.heartColor }}
              >
                {activeHearts.length}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
