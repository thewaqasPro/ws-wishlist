(() => {
  const WS = (window.WSWishlist = window.WSWishlist || {});
  if (WS.panel) return;

  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>'"]/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[character]
    );

  const numeric = (id) =>
    String(id || "")
      .split("/")
      .pop();

  function money(value, currency) {
    try {
      return new Intl.NumberFormat(document.documentElement.lang || "en", {
        style: "currency",
        currency: currency || "USD",
      }).format(Number(value || 0));
    } catch {
      return `${value} ${currency || ""}`;
    }
  }

  function toast(message, isError = false) {
    let element = document.querySelector(".ws-wishlist-toast");
    if (!element) {
      element = document.createElement("div");
      element.className = "ws-wishlist-toast";
      element.setAttribute("role", "status");
      document.body.appendChild(element);
    }
    element.textContent = message;
    element.classList.toggle("is-error", isError);
    element.classList.add("is-visible");
    clearTimeout(element._wsTimer);
    element._wsTimer = setTimeout(
      () => element.classList.remove("is-visible"),
      2400
    );
  }
  WS.toast = toast;

  function applyCustomCss(settings) {
    let style = document.getElementById("ws-wishlist-custom-css");
    if (!settings.customCss) {
      style?.remove();
      return;
    }
    if (!style) {
      style = document.createElement("style");
      style.id = "ws-wishlist-custom-css";
      document.head.appendChild(style);
    }
    if (style.textContent !== settings.customCss) {
      style.textContent = settings.customCss;
    }
  }

  let previouslyFocused = null;

  function ensureDrawer(state) {
    if (document.querySelector(".ws-wishlist-drawer")) return;

    let viewAllUrl = WS.config.proxyPath || "/apps/page/ws-wishlist";
    if (viewAllUrl === "/apps/page") {
      viewAllUrl = "/apps/page/ws-wishlist";
    } else if (
      viewAllUrl.startsWith("/apps/") &&
      !viewAllUrl.startsWith("/apps/page/")
    ) {
      const suffix = viewAllUrl.substring(6);
      viewAllUrl = `/apps/page/${suffix}`;
    } else if (!viewAllUrl.endsWith("/ws-wishlist")) {
      viewAllUrl = `${viewAllUrl}/ws-wishlist`;
    }

    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="ws-wishlist-overlay" aria-hidden="true"></div>
       <aside class="ws-wishlist-drawer" aria-hidden="true" aria-label="Wishlist" role="dialog" aria-modal="true" tabindex="-1">
         <header class="ws-wishlist-drawer-header">
           <div class="ws-wishlist-drawer-title">
             <h2>${esc(state.settings.pageTitle)}</h2>
             <span class="ws-wishlist-drawer-badge">0</span>
           </div>
           <button type="button" class="ws-wishlist-close" aria-label="Close wishlist">✕</button>
         </header>
         <div class="ws-wishlist-drawer-body"></div>
         <footer class="ws-wishlist-drawer-footer" hidden>
           <a href="${esc(viewAllUrl)}" class="ws-wishlist-view-all">View all saved items</a>
         </footer>
       </aside>`
    );
    document
      .querySelector(".ws-wishlist-close")
      ?.addEventListener("click", closeDrawer);
    document
      .querySelector(".ws-wishlist-overlay")
      ?.addEventListener("click", closeDrawer);
  }

  function openDrawer() {
    const state = WS.store.snapshot();
    previouslyFocused = document.activeElement;
    ensureDrawer(state);
    renderDrawer(state);
    document.querySelector(".ws-wishlist-overlay")?.classList.add("is-open");
    const drawer = document.querySelector(".ws-wishlist-drawer");
    drawer?.classList.add("is-open");
    drawer?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() =>
      drawer?.querySelector(".ws-wishlist-close")?.focus()
    );
  }

  function closeDrawer() {
    document.querySelector(".ws-wishlist-overlay")?.classList.remove("is-open");
    const drawer = document.querySelector(".ws-wishlist-drawer");
    drawer?.classList.remove("is-open");
    drawer?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (previouslyFocused?.isConnected) previouslyFocused.focus();
    previouslyFocused = null;
  }

  document.addEventListener("keydown", (event) => {
    const drawer = document.querySelector(".ws-wishlist-drawer.is-open");
    if (event.key === "Escape") closeDrawer();
    if (event.key !== "Tab" || !drawer) return;
    const focusable = Array.from(
      drawer.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
      )
    );
    if (!focusable.length) {
      event.preventDefault();
      drawer.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const loadingHtml = () => `<div class="ws-wishlist-drawer-loading">
    <span class="ws-wishlist-spinner-large"></span>
    <p>Loading your wishlist…</p>
  </div>`;

  function emptyHtml(state) {
    if (state.requiresLogin) {
      return `<div class="ws-wishlist-empty">
        <div class="ws-wishlist-empty-icon">${WS.icons.heart(false, 42)}</div>
        <h3>Sign in to view your wishlist</h3>
        <p>Your saved products will be available on every device.</p>
        <a href="/account/login?return_url=${encodeURIComponent(location.pathname)}">Sign in</a>
      </div>`;
    }
    return `<div class="ws-wishlist-empty">
      <div class="ws-wishlist-empty-icon">${WS.icons.heart(false, 42)}</div>
      <h3>${esc(state.settings.emptyStateTitle)}</h3>
      <p>${esc(state.settings.emptyStateBody)}</p>
    </div>`;
  }

  function itemHtml(item, state, compact = false) {
    const image = item.imageUrl
      ? `<img class="ws-wishlist-product-card__image" src="${esc(item.imageUrl)}" alt="${esc(item.imageAlt || item.title)}" loading="lazy">`
      : `<div class="ws-wishlist-product-card__image ws-wishlist-product-card__image--placeholder"></div>`;
    const addToCart =
      !state.isSharedView &&
      state.settings.showAddToCart &&
      item.available &&
      !String(item.variantId).startsWith("pending:")
        ? `<button class="ws-wishlist-product-card__atc" data-ws-cart="${numeric(item.variantId)}">Add to cart</button>`
        : "";
    const remove = !state.isSharedView
      ? `<button class="ws-wishlist-product-card__wishlist" type="button" data-ws-remove="${esc(item.variantId)}" aria-label="Remove ${esc(item.title)} from wishlist">✕</button>`
      : "";
    return `<article class="ws-wishlist-product-card${compact ? " ws-wishlist-product-card--sm" : ""}" data-variant="${esc(item.variantId)}">
      <div class="ws-wishlist-product-card__media">
        <a class="ws-wishlist-product-card__image-link" href="${esc(item.productUrl)}">${image}</a>
        ${item.variantTitle ? `<span class="ws-wishlist-product-card__brand">${esc(item.variantTitle)}</span>` : ""}
        ${remove}
      </div>
      <div class="ws-wishlist-product-card__content">
        <div class="ws-wishlist-product-card__title"><a class="ws-wishlist-product-card__title-link" href="${esc(item.productUrl)}">${esc(item.title)}</a></div>
        ${state.settings.showPrices && Number(item.price) > 0 ? `<p class="ws-wishlist-product-card__price">${money(item.price, item.currency)}</p>` : ""}
        <div class="ws-wishlist-product-card__actions">
          ${addToCart}
          <a class="ws-wishlist-product-card__view" href="${esc(item.productUrl)}">View</a>
        </div>
      </div>
    </article>`;
  }

  async function addToCart(button) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = "Adding…";
    try {
      const response = await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ id: Number(button.dataset.wsCart), quantity: 1 }],
        }),
      });
      if (!response.ok) throw new Error();
      toast("Added to cart");
      document.dispatchEvent(
        new CustomEvent("cart:refresh", { bubbles: true })
      );
    } catch {
      toast("Could not add this item to cart", true);
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  }

  function bindActions(root, state) {
    root?.querySelectorAll("[data-ws-remove]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = state.items.find(
          (entry) => entry.variantId === button.dataset.wsRemove
        );
        WS.store.remove(item || button.dataset.wsRemove);
      });
    });
    root
      ?.querySelectorAll("[data-ws-cart]")
      .forEach((button) =>
        button.addEventListener("click", () => addToCart(button))
      );
    root?.querySelectorAll("[data-ws-copy-link]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(button.dataset.wsCopyLink);
          toast("Link copied");
        } catch {
          toast("Could not copy the link", true);
        }
      });
    });
    root?.querySelectorAll("[data-ws-share-email]").forEach((button) => {
      button.addEventListener("click", () => {
        location.href = `mailto:?subject=My%20Wishlist&body=${encodeURIComponent(button.dataset.wsShareEmail)}`;
      });
    });
    root?.querySelectorAll("[data-ws-add-all]").forEach((button) => {
      button.addEventListener("click", async () => {
        const variants = state.items
          .filter(
            (item) =>
              item.available && !String(item.variantId).startsWith("pending:")
          )
          .map((item) => ({
            id: Number(numeric(item.variantId)),
            quantity: 1,
          }));
        if (!variants.length) return;
        const original = button.textContent;
        button.disabled = true;
        button.textContent = "Adding…";
        try {
          const response = await fetch("/cart/add.js", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: variants }),
          });
          if (!response.ok) throw new Error();
          toast("Wishlist added to cart");
          document.dispatchEvent(
            new CustomEvent("cart:refresh", { bubbles: true })
          );
        } catch {
          toast("Could not add all items to cart", true);
        } finally {
          button.disabled = false;
          button.textContent = original;
        }
      });
    });
  }

  function renderDrawer(state) {
    ensureDrawer(state);
    const body = document.querySelector(".ws-wishlist-drawer-body");
    const footer = document.querySelector(".ws-wishlist-drawer-footer");
    const badge = document.querySelector(".ws-wishlist-drawer-badge");
    const heading = document.querySelector(".ws-wishlist-drawer-title h2");
    if (!body) return;
    if (heading) heading.textContent = state.settings.pageTitle;
    if (badge) badge.textContent = String(state.items.length);
    if (footer) footer.hidden = !state.items.length || state.loading;
    body.innerHTML = state.loading
      ? loadingHtml()
      : state.items.length
        ? `<div class="ws-wishlist-drawer-grid">${state.items.map((item) => itemHtml(item, state, true)).join("")}</div>`
        : emptyHtml(state);
    bindActions(body, state);
  }

  function renderToolbar(state) {
    const toolbar = document.querySelector("[data-ws-wishlist-toolbar]");
    if (!toolbar) return;
    if (state.isSharedView) {
      toolbar.innerHTML = `<div class="ws-wishlist-share-toolbar"><span>Shared wishlist (read-only)</span></div>`;
      return;
    }
    if (!state.wishlist?.id || !state.items.length) {
      toolbar.innerHTML = "";
      return;
    }
    const shareUrl = `${location.origin}${location.pathname}?share=${state.wishlist.id}`;
    const available = state.items.filter(
      (item) => item.available && !String(item.variantId).startsWith("pending:")
    ).length;
    toolbar.innerHTML = `<div class="ws-wishlist-share-toolbar">
      <span class="ws-wishlist-share-label">Share</span>
      <div class="ws-wishlist-share-actions">
        <button type="button" class="ws-wishlist-share-action" data-ws-copy-link="${esc(shareUrl)}" aria-label="Copy share link">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        </button>
        <button type="button" class="ws-wishlist-share-action" data-ws-share-email="${esc(shareUrl)}" aria-label="Share by email">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
        </button>
      </div>
    </div>
    ${available ? `<button type="button" class="ws-wishlist-add-all-btn" data-ws-add-all>Add all to cart (${available})</button>` : ""}`;
    bindActions(toolbar, state);
  }

  function renderPage(state) {
    document
      .querySelectorAll("[data-ws-wishlist-page-content]")
      .forEach((root) => {
        root.innerHTML = state.loading
          ? loadingHtml()
          : state.items.length
            ? `<div class="ws-wishlist-page-grid">${state.items.map((item) => itemHtml(item, state)).join("")}</div>`
            : emptyHtml(state);
        bindActions(root, state);
      });
    renderToolbar(state);
  }

  function renderFloat(state) {
    let button = document.querySelector(".ws-wishlist-float");
    if (!state.settings.floatingButtonEnabled) {
      button?.remove();
      return;
    }
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "ws-wishlist-float";
      button.addEventListener("click", openDrawer);
      document.body.appendChild(button);
    }
    button.className = `ws-wishlist-float ws-wishlist-float--${state.settings.floatingButtonPosition === "bottom-left" ? "left" : "right"}`;
    button.style.setProperty("--ws-heart", state.settings.heartColor);
    const count = state.loading
      ? WS.icons.spinner("ws-wishlist-spinner")
      : String(state.items.length);
    button.innerHTML = `${WS.icons.heart(true, 18)}<span class="ws-wishlist-float-label">${esc(state.settings.floatingButtonText)}</span><span class="ws-wishlist-count">${count}</span>`;
  }

  function render(state) {
    applyCustomCss(state.settings);
    renderFloat(state);
    renderDrawer(state);
    renderPage(state);
  }

  WS.panel = { render, openDrawer, closeDrawer };
})();
