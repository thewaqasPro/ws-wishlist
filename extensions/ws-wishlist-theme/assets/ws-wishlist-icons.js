(() => {
  const WS = (window.WSWishlist = window.WSWishlist || {});
  if (WS.icons) return;

  const HEART_PATH =
    "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78a5.5 5.5 0 0 0 0-7.78z";

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
