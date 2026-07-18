(() => {
  const WS = (window.WSWishlist = window.WSWishlist || {});
  if (WS.api) return;

  function createApi(proxyPath, visitor) {
    const proxy = proxyPath.replace(/\/$/, "");

    function url(params = {}) {
      const target = new URL(`${proxy}/api`, location.origin);
      target.searchParams.set("visitor_id", visitor);
      Object.entries(params).forEach(([key, value]) => {
        if (value != null && value !== "") target.searchParams.set(key, value);
      });
      return target;
    }

    async function parseResponse(response) {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data.error || "Wishlist request failed");
        error.code = data.code;
        error.status = response.status;
        throw error;
      }
      return data;
    }

    async function get() {
      return parseResponse(
        await fetch(url(), { headers: { Accept: "application/json" } })
      );
    }

    async function getShared(shareId) {
      return parseResponse(
        await fetch(url({ share_id: shareId }), {
          headers: { Accept: "application/json" },
        })
      );
    }

    async function sync(operations) {
      return parseResponse(
        await fetch(url(), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "sync", operations }),
          keepalive: true,
        })
      );
    }

    return { proxy, get, getShared, sync };
  }

  WS.api = { createApi };
})();
