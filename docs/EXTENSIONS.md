# Theme app extension

The extension is under `extensions/ws-wishlist-theme`.

## Blocks

- **Wishlist**: body app embed. Loads the storefront configuration and modular assets.
- **Wishlist page**: section app block for a Shopify page template.
- **Wishlist header icon**: header section app block with optional saved-item count.

All blocks use `/apps/page` by default. Change the block setting only if the app proxy subpath is changed in both Shopify configuration and server environment.

## Manual header markup

For themes where the merchant wants to edit Liquid directly, place this immediately before the cart link. The Wishlist app embed must remain enabled so the module bundle can enhance the element and update the count.

```liquid
<a
  href="/apps/page"
  class="ws-wishlist-header-link"
  data-ws-wishlist-header-icon
  data-ws-show-count="true"
  aria-label="Open wishlist"
>
  <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
</a>
```

Set `data-ws-show-count="false"` to hide the badge.

## Custom CSS

Merchants can save storefront CSS in **Customize → Custom CSS**. Prefer selectors beginning with `.ws-wishlist`, for example:

```css
.ws-wishlist-header-link {
  margin-inline: 0.5rem;
}

.ws-wishlist-heart {
  box-shadow: none;
}
```

The server rejects unsafe constructs and limits CSS to 12,000 characters. Custom CSS affects storefront wishlist UI only.

## Asset order

Do not reorder the scripts in `snippets/ws-wishlist-assets.liquid`. The bootstrap file must load last. Every module has a duplicate-load guard because more than one app block can be present on a page.
