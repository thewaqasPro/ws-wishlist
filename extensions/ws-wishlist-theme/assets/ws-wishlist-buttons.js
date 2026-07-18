(() => {
  const WS = (window.WSWishlist = window.WSWishlist || {});
  if (WS.buttons) return;

  function productHandleFromLink(link) {
    try {
      const match = new URL(link.href, location.origin).pathname.match(
        /\/products\/([^/?#]+)/
      );
      return match ? decodeURIComponent(match[1]) : null;
    } catch {
      return null;
    }
  }

  const HEART_BUTTON_SIZE = 36;
  const HEART_EDGE_INSET = 5;
  const HEART_POSITION_SLOPE = (HEART_BUTTON_SIZE + HEART_EDGE_INSET * 2) / 100;

  function positionHeart(button, settings) {
    const x = Math.min(100, Math.max(0, Number(settings.iconPositionX || 0)));
    const y = Math.min(100, Math.max(0, Number(settings.iconPositionY || 0)));
    const offsetX = HEART_EDGE_INSET - x * HEART_POSITION_SLOPE;
    const offsetY = HEART_EDGE_INSET - y * HEART_POSITION_SLOPE;
    button.style.left = `calc(${x}% + ${offsetX}px)`;
    button.style.top = `calc(${y}% + ${offsetY}px)`;
    button.style.right = "auto";
    button.style.setProperty("--ws-heart", settings.heartColor);
  }

  function snapshotFromCard(card, link, handle) {
    const title =
      card
        .querySelector(
          ".card__heading,.card__information h3,.product-card__title,.product-item__title,[data-product-title]"
        )
        ?.textContent?.trim() ||
      link.getAttribute("aria-label") ||
      link.textContent?.trim() ||
      "Saved product";
    const image = card.querySelector("img");
    return {
      title,
      productUrl: link.href || `/products/${handle}`,
      imageUrl: image?.currentSrc || image?.src || null,
      imageAlt: image?.alt || title,
      currency: window.Shopify?.currency?.active || "USD",
      available: true,
    };
  }

  function setButtonState(button, item, state) {
    const loading = state.loading && !item;
    WS.icons.setHeart(button, { active: Boolean(item), loading });
    button.disabled = loading;
    button.toggleAttribute("aria-busy", loading);
    button.setAttribute("aria-pressed", String(Boolean(item)));
    button.setAttribute(
      "aria-label",
      item ? "Remove from wishlist" : "Add to wishlist"
    );
    positionHeart(button, state.settings);
  }

  function injectCardHearts(state) {
    if (!state.settings.iconEnabled) return;
    const pageType = WS.config.pageType;
    const home = pageType === "index" || location.pathname === "/";
    const listing =
      pageType === "collection" ||
      pageType === "search" ||
      location.pathname.includes("/collections") ||
      location.pathname.includes("/search");
    if (home && !state.settings.showOnHomePage) return;
    if (listing && !state.settings.showOnCollectionPages) return;
    if (!home && !listing) return;

    document.querySelectorAll('a[href*="/products/"]').forEach((link) => {
      const handle = productHandleFromLink(link);
      if (
        !handle ||
        link.closest(".ws-wishlist-drawer,.ws-wishlist-page-block")
      )
        return;
      const card =
        link.closest(
          ".card-wrapper,.card,.product-card,.product-item,.grid__item,li,[data-product-card]"
        ) || link.parentElement;
      if (!card || card.dataset.wsHeartInjected) return;
      const media =
        card.querySelector(
          ".card__media,.media,.product-card__image,.product-item__image"
        ) ||
        card.querySelector("img")?.parentElement ||
        card;
      if (!media || media.querySelector(".ws-wishlist-heart")) return;

      card.dataset.wsHeartInjected = "true";
      media.classList.add("ws-wishlist-card-anchor");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ws-wishlist-heart";
      button.dataset.handle = handle;
      button._wsSnapshot = snapshotFromCard(card, link, handle);
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = WS.store.byHandle(handle);
        item
          ? WS.store.remove(item)
          : WS.store.add(handle, null, button._wsSnapshot);
      });
      media.appendChild(button);
      setButtonState(button, WS.store.byHandle(handle), state);
    });
  }

  function productContext() {
    const handle =
      WS.config.productHandle || productHandleFromLink({ href: location.href });
    const form = document.querySelector('form[action*="/cart/add"]');
    const variantId =
      form?.querySelector('[name="id"]')?.value || WS.config.variantId;
    return { handle, form, variantId };
  }

  function productSnapshot(handle) {
    const image = document.querySelector(
      ".product__media img,.product-media-container img,.product-gallery img,main img"
    );
    return {
      title:
        document.querySelector("h1")?.textContent?.trim() || "Saved product",
      productUrl: location.href,
      imageUrl: image?.currentSrc || image?.src || null,
      imageAlt: image?.alt || "",
      currency: window.Shopify?.currency?.active || "USD",
      available: true,
    };
  }

  function injectProductImageHeart(state) {
    if (
      !state.settings.iconEnabled ||
      !state.settings.showOnProductImage ||
      !location.pathname.includes("/products/")
    )
      return;
    const { handle, variantId } = productContext();
    if (!handle || document.querySelector(".ws-wishlist-product-heart")) return;
    const image = document.querySelector(
      ".product__media-wrapper,.product-media-container,.product__media-list,.product-gallery,.product-single__media-wrapper,[data-product-media],main img"
    );
    const anchor = image?.matches("img") ? image.parentElement : image;
    if (!anchor) return;
    anchor.classList.add("ws-wishlist-product-media-anchor");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ws-wishlist-heart ws-wishlist-product-heart";
    button.dataset.handle = handle;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const current = productContext();
      const item =
        WS.store.byVariant(current.variantId) || WS.store.byHandle(handle);
      item
        ? WS.store.remove(item)
        : WS.store.add(handle, current.variantId, productSnapshot(handle));
    });
    anchor.appendChild(button);
    setButtonState(
      button,
      WS.store.byVariant(variantId) || WS.store.byHandle(handle),
      state
    );
  }

  function updateProductButton(button, state) {
    const { handle, variantId } = productContext();
    const item = WS.store.byVariant(variantId) || WS.store.byHandle(handle);
    button.dataset.variantId = variantId || "";
    button.style.setProperty("--ws-heart", state.settings.heartColor);
    button.setAttribute("aria-pressed", String(Boolean(item)));
    button.innerHTML = `${WS.icons.heart(Boolean(item), 19)}<span>${item ? state.settings.removeButtonText : state.settings.addButtonText}</span>`;
  }

  function injectProductButton(state) {
    if (
      !state.settings.addButtonEnabled ||
      !location.pathname.includes("/products/")
    )
      return;
    const { handle, form } = productContext();
    if (
      !handle ||
      !form ||
      document.querySelector(".ws-wishlist-product-button")
    )
      return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ws-wishlist-product-button";
    button.addEventListener("click", () => {
      const current = productContext();
      const item =
        WS.store.byVariant(current.variantId) || WS.store.byHandle(handle);
      item
        ? WS.store.remove(item)
        : WS.store.add(handle, current.variantId, productSnapshot(handle));
    });
    form.addEventListener("change", () =>
      updateProductButton(button, WS.store.snapshot())
    );
    const submit = form.querySelector('[type="submit"]');
    if (submit?.parentElement) {
      submit.parentElement.insertAdjacentElement("afterend", button);
    } else {
      form.appendChild(button);
    }
    updateProductButton(button, state);
  }

  function headerLinkMarkup(state, showCount = true) {
    return `${WS.icons.heart(false, 22)}${showCount ? `<span class="ws-wishlist-header-count">${state.items.length}</span>` : ""}`;
  }

  function enhanceHeaderLink(link, state) {
    link.classList.add("ws-wishlist-header-link");
    link.href = WS.config.proxyPath;
    link.setAttribute(
      "aria-label",
      `Wishlist with ${state.items.length} items`
    );
    link.style.setProperty("--ws-heart", state.settings.heartColor);
    const showCount = link.dataset.wsShowCount !== "false";
    const visual = `${state.items.length}:${showCount}`;
    if (link.dataset.wsCount !== visual) {
      link.dataset.wsCount = visual;
      link.innerHTML = headerLinkMarkup(state, showCount);
    }
  }

  function injectHeaderLinks(state) {
    document
      .querySelectorAll("[data-ws-wishlist-header-icon]")
      .forEach((node) => {
        let link = node.matches("a") ? node : node.querySelector("a");
        if (!link) {
          link = document.createElement("a");
          node.appendChild(link);
        }
        enhanceHeaderLink(link, state);
      });

    const hasHeaderLink = document.querySelector(
      ".ws-wishlist-header-link,[data-ws-wishlist-header-icon]"
    );
    if (!state.settings.autoInjectHeaderIcon || hasHeaderLink) return;
    const cart = document.querySelector(
      'header a[href="/cart"],header a[href*="/cart"],[role="banner"] a[href="/cart"],[role="banner"] a[href*="/cart"]'
    );
    if (!cart) return;
    const link = document.createElement("a");
    link.dataset.wsAutoHeader = "true";
    enhanceHeaderLink(link, state);
    cart.insertAdjacentElement("beforebegin", link);
  }

  function update(state) {
    document.querySelectorAll(".ws-wishlist-heart").forEach((button) => {
      const handle = button.dataset.handle;
      const context = productContext();
      const item = button.classList.contains("ws-wishlist-product-heart")
        ? WS.store.byVariant(context.variantId) || WS.store.byHandle(handle)
        : WS.store.byHandle(handle);
      setButtonState(button, item, state);
    });
    const productButton = document.querySelector(".ws-wishlist-product-button");
    if (productButton) updateProductButton(productButton, state);
    injectHeaderLinks(state);
  }

  function inject(state) {
    injectCardHearts(state);
    injectProductImageHeart(state);
    injectProductButton(state);
    injectHeaderLinks(state);
    update(state);
  }

  WS.buttons = { inject, update, positionHeart };
})();
