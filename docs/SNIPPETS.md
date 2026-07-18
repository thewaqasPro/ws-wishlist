# Integration snippets

## Header icon before cart

Use the **Wishlist header icon** theme app block when possible. For manual Liquid, copy the markup from `docs/EXTENSIONS.md` immediately before the theme's cart link and keep the Wishlist app embed enabled.

## Open wishlist from theme JavaScript

```js
window.location.assign("/apps/page");
```

## Open the drawer

The floating button is the supported drawer trigger. Custom theme code can click it after the app initializes:

```js
document.querySelector(".ws-wishlist-float")?.click();
```

## Recommended custom CSS selectors

```css
.ws-wishlist-heart {
}
.ws-wishlist-product-button {
}
.ws-wishlist-float {
}
.ws-wishlist-header-link {
}
.ws-wishlist-drawer {
}
.ws-wishlist-product-card {
}
```

Save CSS in the embedded app's **Customize → Custom CSS** field so it remains outside merchant theme files.
