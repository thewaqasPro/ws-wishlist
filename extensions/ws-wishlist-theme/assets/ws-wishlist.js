(() => {
  if (window.__WS_WISHLIST__) return;
  window.__WS_WISHLIST__ = true;

  const WS = (window.WSWishlist = window.WSWishlist || {});
  const configElement =
    document.getElementById("ws-wishlist-config") ||
    document.querySelector("[data-ws-wishlist-config]") ||
    document.querySelector("[data-ws-wishlist-page]");

  function inferredProxyPath() {
    if (configElement?.dataset.proxyPath) {
      return configElement.dataset.proxyPath;
    }
    const match = location.pathname.match(/^\/(apps\/[^/]+)/);
    return match ? `/${match[1]}` : "/apps/page";
  }

  WS.config = {
    proxyPath: inferredProxyPath().replace(/\/$/, ""),
    pageType: configElement?.dataset.pageType || "",
    productHandle: configElement?.dataset.productHandle || "",
    variantId: configElement?.dataset.variantId || "",
    customerId: configElement?.dataset.customerId || "",
  };

  const shareId = new URL(location.href).searchParams.get("share");
  const storage = WS.storage.createStorage(
    WS.config.proxyPath,
    WS.config.customerId
  );
  const api = WS.api.createApi(WS.config.proxyPath, storage.visitor);
  WS.store = WS.createStore({ storage, api, shareId });

  function render(state) {
    WS.panel.render(state);
    WS.buttons.inject(state);
  }

  function observeDynamicTheme() {
    let timer;
    const observer = new MutationObserver((mutations) => {
      const relevant = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            !node.closest?.(
              ".ws-wishlist-drawer,.ws-wishlist-float,.ws-wishlist-toast"
            )
        )
      );
      if (!relevant) return;
      clearTimeout(timer);
      timer = setTimeout(() => WS.buttons.inject(WS.store.snapshot()), 120);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    WS.store.subscribe(render);
    render(WS.store.snapshot());
    WS.store.hydrate();
    observeDynamicTheme();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
