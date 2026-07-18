(() => {
  const WS = (window.WSWishlist = window.WSWishlist || {});
  if (WS.storage) return;

  const memory = new Map();

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function storageGet(key) {
    try {
      return localStorage.getItem(key) ?? memory.get(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  }

  function storageSet(key, value) {
    memory.set(key, value);
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(
        "WS Wishlist local storage unavailable; using memory",
        error
      );
    }
  }

  function createId(prefix = "op") {
    const random = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return `${prefix}:${random}`;
  }

  function createStorage(proxyPath, customerId = "") {
    const identityScope = customerId ? `customer:${customerId}` : "guest";
    const scope = `${location.host}:${proxyPath}:${identityScope}`;
    const cacheKey = `ws_wishlist_cache_v2:${scope}`;
    const queueKey = `ws_wishlist_queue_v2:${scope}`;
    const visitorKey = "ws_wishlist_visitor";

    let visitor = storageGet(visitorKey);
    if (!visitor) {
      visitor = createId("visitor").replace(/:/g, "_");
      storageSet(visitorKey, visitor);
    }

    const readCache = () => safeParse(storageGet(cacheKey), null);
    const writeCache = (value) => {
      storageSet(
        cacheKey,
        JSON.stringify({ ...value, cachedAt: new Date().toISOString() })
      );
    };
    const readQueue = () => safeParse(storageGet(queueKey), []);
    const writeQueue = (operations) => {
      storageSet(queueKey, JSON.stringify(operations.slice(-100)));
    };

    function enqueue(operation) {
      const operations = readQueue();
      operations.push({
        ...operation,
        id: operation.id || createId(),
        createdAt: operation.createdAt || new Date().toISOString(),
      });
      writeQueue(operations);
      return operations.at(-1);
    }

    function removeOperations(ids) {
      const idSet = new Set(ids);
      writeQueue(readQueue().filter((operation) => !idSet.has(operation.id)));
    }

    function cancelOperation(id) {
      if (id) removeOperations([id]);
    }

    return {
      visitor,
      cacheKey,
      queueKey,
      createId,
      readCache,
      writeCache,
      readQueue,
      writeQueue,
      enqueue,
      removeOperations,
      cancelOperation,
    };
  }

  WS.storage = { createStorage };
})();
