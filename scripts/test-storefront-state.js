import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile(
  new URL(
    "../extensions/ws-wishlist-theme/assets/ws-wishlist-state.js",
    import.meta.url
  ),
  "utf8"
);

function loadModule() {
  const context = {
    console,
    setTimeout,
    clearTimeout,
    navigator: { onLine: true },
    window: {
      WSWishlist: { toast() {} },
      addEventListener() {},
    },
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.window.WSWishlist;
}

function makeStorage(initial = []) {
  let queue = [...initial];
  let cache = null;
  let counter = 0;
  return {
    readCache: () => cache,
    writeCache: (value) => {
      cache = structuredClone(value);
    },
    readQueue: () => structuredClone(queue),
    enqueue(operation) {
      const next = {
        ...operation,
        id: operation.id || `op:test_${String(++counter).padStart(12, "0")}`,
      };
      queue.push(next);
      return structuredClone(next);
    },
    removeOperations(ids) {
      queue = queue.filter((operation) => !ids.includes(operation.id));
    },
    cancelOperation(id) {
      queue = queue.filter((operation) => operation.id !== id);
    },
    getQueue: () => structuredClone(queue),
  };
}

async function waitUntil(predicate, timeout = 1000) {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > timeout) throw new Error("Timed out");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

async function testRapidAddRemove() {
  const WS = loadModule();
  const storage = makeStorage();
  let resolveFirst;
  let firstOperations;
  let calls = 0;
  const serverItem = {
    id: "item-1",
    productId: "gid://shopify/Product/1",
    variantId: "gid://shopify/ProductVariant/11",
    productHandle: "alpha",
    title: "Alpha",
    productUrl: "/products/alpha",
    price: 10,
    currency: "USD",
    available: true,
    addedAt: new Date().toISOString(),
  };
  const api = {
    sync(operations) {
      calls += 1;
      if (calls === 1) {
        firstOperations = operations;
        return new Promise((resolve) => {
          resolveFirst = resolve;
        });
      }
      return Promise.resolve({
        results: operations.map((operation) => ({
          id: operation.id,
          ok: true,
        })),
        items: [],
        wishlist: { id: "w1" },
        settings: {},
        requiresLogin: false,
      });
    },
    get: async () => ({ items: [], settings: {} }),
  };

  const store = WS.createStore({ storage, api, shareId: null });
  store.add("alpha", "11", { title: "Alpha" });
  await waitUntil(() => Boolean(resolveFirst));
  store.remove(store.snapshot().items[0]);
  if (store.snapshot().items.length !== 0) {
    throw new Error("Optimistic remove was not immediate");
  }

  resolveFirst({
    results: [{ id: firstOperations[0].id, ok: true, item: serverItem }],
    items: [serverItem],
    wishlist: { id: "w1" },
    settings: {},
    requiresLogin: false,
  });
  await waitUntil(() =>
    storage.getQueue().some((operation) => operation.action === "remove")
  );
  if (store.snapshot().items.length !== 0) {
    throw new Error("In-flight add response re-added a removed item");
  }

  await store.flush();
  if (storage.getQueue().length !== 0) {
    throw new Error("Compensating remove did not synchronize");
  }
}

async function testBatchLimit() {
  const WS = loadModule();
  const operations = Array.from({ length: 60 }, (_, index) => ({
    id: `op:batch_${String(index).padStart(12, "0")}`,
    action: "clear",
  }));
  const storage = makeStorage(operations);
  let received = 0;
  const api = {
    async sync(batch) {
      received = batch.length;
      return {
        results: batch.map((operation) => ({
          id: operation.id,
          ok: true,
        })),
        items: [],
        settings: {},
        requiresLogin: false,
      };
    },
    get: async () => ({ items: [], settings: {} }),
  };

  const store = WS.createStore({ storage, api, shareId: null });
  await store.flush();
  if (received !== 50) {
    throw new Error(`Expected a 50-operation batch, received ${received}`);
  }
  if (storage.getQueue().length !== 10) {
    throw new Error("The wrong number of operations remained after batching");
  }
}

await testRapidAddRemove();
await testBatchLimit();
console.log("Storefront state tests passed.");
process.exit(0);
