-- Idempotent baseline for both brand-new installations and legacy databases
-- that were previously created with `prisma db push` and therefore have no
-- migration history. The custom migration runner records this migration only
-- after the complete transaction succeeds.

CREATE TABLE IF NOT EXISTS "stores" (
  "shop" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stores_pkey" PRIMARY KEY ("shop")
);

CREATE INDEX IF NOT EXISTS "stores_shop_idx" ON "stores"("shop");

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT NOT NULL,
  "content" TEXT,
  "shop" TEXT,
  CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "session_id_idx" ON "session"("id");
CREATE INDEX IF NOT EXISTS "session_shop_idx" ON "session"("shop");

CREATE TABLE IF NOT EXISTS "store_settings" (
  "id" TEXT NOT NULL,
  "shop" TEXT NOT NULL,
  "iconEnabled" BOOLEAN NOT NULL DEFAULT true,
  "showOnCollectionPages" BOOLEAN NOT NULL DEFAULT true,
  "showOnHomePage" BOOLEAN NOT NULL DEFAULT true,
  "showOnProductImage" BOOLEAN NOT NULL DEFAULT true,
  "heartColor" TEXT NOT NULL DEFAULT '#222222',
  "iconPositionX" INTEGER NOT NULL DEFAULT 100,
  "iconPositionY" INTEGER NOT NULL DEFAULT 0,
  "pageTitle" TEXT NOT NULL DEFAULT 'My Wishlist',
  "emptyStateTitle" TEXT NOT NULL DEFAULT 'Your wishlist is empty',
  "emptyStateBody" TEXT NOT NULL DEFAULT 'Save products you love and come back to them anytime.',
  "floatingButtonEnabled" BOOLEAN NOT NULL DEFAULT true,
  "floatingButtonText" TEXT NOT NULL DEFAULT 'My Wishlist',
  "floatingButtonPosition" TEXT NOT NULL DEFAULT 'bottom-right',
  "addButtonEnabled" BOOLEAN NOT NULL DEFAULT true,
  "addButtonText" TEXT NOT NULL DEFAULT 'Add to wishlist',
  "removeButtonText" TEXT NOT NULL DEFAULT 'Remove from wishlist',
  "showPrices" BOOLEAN NOT NULL DEFAULT true,
  "showAddToCart" BOOLEAN NOT NULL DEFAULT true,
  "requireLogin" BOOLEAN NOT NULL DEFAULT false,
  "onlyInStock" BOOLEAN NOT NULL DEFAULT false,
  "excludedTags" TEXT NOT NULL DEFAULT '',
  "setupEmbedConfirmed" BOOLEAN NOT NULL DEFAULT false,
  "customizedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "store_settings_shop_key"
  ON "store_settings"("shop");

CREATE TABLE IF NOT EXISTS "wishlist" (
  "id" TEXT NOT NULL,
  "shop" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "customerId" TEXT,
  "visitorId" TEXT,
  "email" TEXT,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "wishlist_shop_key_key"
  ON "wishlist"("shop", "key");
CREATE INDEX IF NOT EXISTS "wishlist_shop_updatedAt_idx"
  ON "wishlist"("shop", "updatedAt");
CREATE INDEX IF NOT EXISTS "wishlist_shop_customerId_idx"
  ON "wishlist"("shop", "customerId");
CREATE INDEX IF NOT EXISTS "wishlist_shop_visitorId_idx"
  ON "wishlist"("shop", "visitorId");

CREATE TABLE IF NOT EXISTS "wishlist_item" (
  "id" TEXT NOT NULL,
  "wishlistId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "productHandle" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "variantTitle" TEXT,
  "productUrl" TEXT NOT NULL,
  "imageUrl" TEXT,
  "imageAlt" TEXT,
  "price" DECIMAL(14,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "available" BOOLEAN NOT NULL DEFAULT true,
  "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wishlist_item_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "wishlist_item_wishlistId_variantId_key"
  ON "wishlist_item"("wishlistId", "variantId");
CREATE INDEX IF NOT EXISTS "wishlist_item_wishlistId_addedAt_idx"
  ON "wishlist_item"("wishlistId", "addedAt");
CREATE INDEX IF NOT EXISTS "wishlist_item_productId_idx"
  ON "wishlist_item"("productId");

CREATE TABLE IF NOT EXISTS "wishlist_event" (
  "id" TEXT NOT NULL,
  "shop" TEXT NOT NULL,
  "wishlistId" TEXT,
  "type" TEXT NOT NULL,
  "productId" TEXT,
  "variantId" TEXT,
  "value" DECIMAL(14,2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wishlist_event_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "wishlist_event_shop_createdAt_idx"
  ON "wishlist_event"("shop", "createdAt");
CREATE INDEX IF NOT EXISTS "wishlist_event_shop_type_createdAt_idx"
  ON "wishlist_event"("shop", "type", "createdAt");

DO $$ BEGIN
  ALTER TABLE "store_settings"
    ADD CONSTRAINT "store_settings_shop_fkey"
    FOREIGN KEY ("shop") REFERENCES "stores"("shop")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "wishlist"
    ADD CONSTRAINT "wishlist_shop_fkey"
    FOREIGN KEY ("shop") REFERENCES "stores"("shop")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "wishlist_item"
    ADD CONSTRAINT "wishlist_item_wishlistId_fkey"
    FOREIGN KEY ("wishlistId") REFERENCES "wishlist"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "wishlist_event"
    ADD CONSTRAINT "wishlist_event_shop_fkey"
    FOREIGN KEY ("shop") REFERENCES "stores"("shop")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "wishlist_event"
    ADD CONSTRAINT "wishlist_event_wishlistId_fkey"
    FOREIGN KEY ("wishlistId") REFERENCES "wishlist"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
