(() => {
  const WS = (window.WSWishlist = window.WSWishlist || {});
  if (WS.icons) return;

  const HEART_PATH =
    "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z";

  function heart(active = false, size = 20, className = "") {
    return `<svg class="ws-wishlist-heart-svg ${className}" aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}" fill="${active ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${HEART_PATH}"></path></svg>`;
  }

  function spinner(className = "ws-wishlist-spinner-heart") {
    return `<span class="${className}" aria-hidden="true"></span>`;
  }

  function setHeart(button, { active = false, loading = false } = {}) {
    if (!button) return;
    const visual = loading ? "loading" : active ? "active" : "inactive";
    if (button.dataset.wsVisual === visual) return;
    button.dataset.wsVisual = visual;
    button.innerHTML = loading ? spinner() : heart(active, 20);
  }

  WS.icons = { HEART_PATH, heart, spinner, setHeart };
})();
