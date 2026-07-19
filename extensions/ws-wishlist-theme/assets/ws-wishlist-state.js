(() => {
  const WS = (window.WSWishlist = window.WSWishlist || {});
  if (WS.createStore) return;

  const DEFAULT_SETTINGS = {
    heartColor: "#222222",
    iconEnabled: true,
    showOnCollectionPages: true,
    showOnHomePage: true,
    showOnProductImage: true,
    autoInjectHeaderIcon: false,
    iconPositionX: 100,
    iconPositionY: 0,
    pageTitle: "My Wishlist",
    emptyStateTitle: "Your wishlist is empty",
    emptyStateBody: "Save products you love and come back to them anytime.",
    floatingButtonEnabled: true,
    floatingButtonText: "My Wishlist",
    floatingButtonPosition: "bottom-right",
    addButtonEnabled: true,
    addButtonText: "Add to wishlist",
    removeButtonText: "Remove from wishlist",
    showPrices: true,
    showAddToCart: true,
    requireLogin: false,
    onlyInStock: false,
    customCss: "",
  };

  const gid = (id) => {
    const value = String(id || "");
    if (!value || value.startsWith("pending:")) return value;
    return value.startsWith("gid://")
      ? value
      : `gid://shopify/ProductVariant/${value}`;
  };

  function createStore({ storage, api, shareId }) {
    const listeners = new Set();
    const cached = !shareId ? storage.readCache() : null;
    let syncTimer = null;
    let syncing = false;
    let inFlightOperationIds = new Set();
    const cancelledInFlightAdds = new Map();

    let state = {
      loading: !cached,
      items: cached?.items || [],
      wishlist: cached?.wishlist || null,
      settings: { ...DEFAULT_SETTINGS, ...(cached?.settings || {}) },
      requiresLogin: false,
      isSharedView: Boolean(shareId),
      syncPending: storage.readQueue().length > 0,
    };

    const emit = () => listeners.forEach((listener) => listener(state));
    const subscribe = (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    };
    const snapshot = () => state;
    const setState = (patch, cache = true) => {
      state = { ...state, ...patch };
      if (cache && !state.isSharedView) {
        storage.writeCache({
          items: state.items,
          wishlist: state.wishlist,
          settings: state.settings,
        });
      }
      emit();
    };

    const byVariant = (variantId) => {
      const wanted = gid(variantId);
      return state.items.find((item) => item.variantId === wanted);
    };
    const byHandle = (handle) =>
      state.items.find((item) => item.productHandle === handle);

    function optimisticItem(handle, variantId, product = {}, operationId) {
      const canonicalVariant = variantId ? gid(variantId) : null;
      return {
        id: `local:${operationId}`,
        productId: product.productId || `pending:${handle}`,
        variantId: canonicalVariant || `pending:${handle}`,
        productHandle: handle,
        title:
          product.title && product.title !== "Saved product"
            ? product.title
            : handle
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
        variantTitle: product.variantTitle || null,
        productUrl: product.productUrl || `/products/${handle}`,
        imageUrl: product.imageUrl || null,
        imageAlt: product.imageAlt || product.title || "",
        price: Number(product.price || 0),
        currency: product.currency || "USD",
        available: product.available !== false,
        addedAt: new Date().toISOString(),
        _optimistic: true,
        _operationId: operationId,
      };
    }

    function queueSync(delay = 30) {
      if (state.isSharedView) return;
      clearTimeout(syncTimer);
      syncTimer = setTimeout(flush, delay);
    }

    function add(handle, variantId, product) {
      if (!handle || state.requiresLogin || state.isSharedView) return;
      if (byVariant(variantId) || byHandle(handle)) return;
      const operation = storage.enqueue({ action: "add", handle, variantId });
      const item = optimisticItem(handle, variantId, product, operation.id);
      setState({ items: [item, ...state.items], syncPending: true });
      WS.toast?.("Added to your wishlist");
      queueSync();
    }

    function remove(itemOrVariant) {
      if (state.isSharedView) return;
      const item =
        typeof itemOrVariant === "object"
          ? itemOrVariant
          : byVariant(itemOrVariant) || byHandle(itemOrVariant);
      if (!item) return;

      if (item._optimistic && item._operationId) {
        if (inFlightOperationIds.has(item._operationId)) {
          cancelledInFlightAdds.set(item._operationId, {
            handle: item.productHandle,
          });
        } else {
          storage.cancelOperation(item._operationId);
        }
      } else if (item.variantId && !item.variantId.startsWith("pending:")) {
        storage.enqueue({ action: "remove", variantId: item.variantId });
      }

      setState({
        items: state.items.filter((entry) => entry !== item),
        syncPending: storage.readQueue().length > 0,
      });
      WS.toast?.("Removed from wishlist");
      queueSync();
    }

    function applyQueue(serverItems, operations, cachedItems) {
      let items = [...serverItems];
      for (const operation of operations) {
        if (operation.action === "clear") items = [];
        if (operation.action === "remove") {
          const variant = gid(operation.variantId);
          items = items.filter((item) => item.variantId !== variant);
        }
        if (operation.action === "add") {
          const existing = items.some(
            (item) =>
              item.productHandle === operation.handle ||
              (operation.variantId &&
                item.variantId === gid(operation.variantId))
          );
          if (!existing) {
            const cachedItem = cachedItems.find(
              (item) => item._operationId === operation.id
            );
            if (cachedItem) items.unshift(cachedItem);
          }
        }
      }
      return items;
    }

    async function flush() {
      if (syncing || state.isSharedView || !navigator.onLine) return;
      const operations = storage.readQueue().slice(0, 50);
      if (!operations.length) {
        if (state.syncPending) setState({ syncPending: false });
        return;
      }

      syncing = true;
      inFlightOperationIds = new Set(
        operations.map((operation) => operation.id).filter(Boolean)
      );
      try {
        const data = await api.sync(operations);
        const completedIds = data.results
          .filter((result) => result.ok || result.retryable === false)
          .map((result) => result.id)
          .filter(Boolean);
        for (const result of data.results) {
          const cancelled = cancelledInFlightAdds.get(result.id);
          if (!cancelled) continue;

          if (result.ok) {
            const addedItem =
              result.item ||
              (data.items || []).find(
                (item) => item.productHandle === cancelled.handle
              );
            if (addedItem?.variantId) {
              storage.enqueue({
                action: "remove",
                variantId: addedItem.variantId,
              });
            }
          }

          if (result.ok || result.retryable === false) {
            cancelledInFlightAdds.delete(result.id);
          }
        }

        storage.removeOperations(completedIds);
        const remainingOperations = storage.readQueue();
        const failures = data.results.filter((result) => !result.ok);
        if (failures.length) {
          const message = failures.some(
            (failure) => failure.code === "LOGIN_REQUIRED"
          )
            ? "Please sign in to use the wishlist"
            : "One wishlist change could not be saved";
          WS.toast?.(message, true);
        }
        setState({
          items: applyQueue(data.items || [], remainingOperations, state.items),
          wishlist: data.wishlist || state.wishlist,
          settings: { ...state.settings, ...(data.settings || {}) },
          requiresLogin: Boolean(data.requiresLogin),
          loading: false,
          syncPending: remainingOperations.length > 0,
        });
      } catch (error) {
        console.warn("WS Wishlist sync deferred", error);
        setState({ syncPending: true }, false);
      } finally {
        syncing = false;
        inFlightOperationIds = new Set();
        if (storage.readQueue().length && navigator.onLine) queueSync(3000);
      }
    }

    async function hydrate() {
      if (shareId) {
        try {
          const data = await api.getShared(shareId);
          setState(
            {
              items: data.items || [],
              settings: { ...state.settings, ...(data.settings || {}) },
              loading: false,
              isSharedView: true,
            },
            false
          );
        } catch (error) {
          console.warn("WS Wishlist shared view failed", error);
          setState({ loading: false }, false);
        }
        return;
      }

      try {
        const data = await api.get();
        const operations = storage.readQueue();
        setState({
          items: applyQueue(data.items || [], operations, state.items),
          wishlist: data.wishlist || null,
          settings: { ...state.settings, ...(data.settings || {}) },
          requiresLogin: Boolean(data.requiresLogin),
          loading: false,
          syncPending: operations.length > 0,
        });
      } catch (error) {
        console.warn("WS Wishlist initial fetch failed", error);
        setState({ loading: false }, Boolean(cached));
      }
      queueSync(0);
    }

    window.addEventListener("online", () => queueSync(0));
    window.addEventListener("pagehide", () => {
      if (storage.readQueue().length) flush();
    });

    return {
      subscribe,
      snapshot,
      hydrate,
      flush,
      add,
      remove,
      byVariant,
      byHandle,
      gid,
    };
  }

  WS.createStore = createStore;
})();
