CREATE TABLE IF NOT EXISTS "wishlist_sync_operation" (
  "id" TEXT NOT NULL,
  "shop" TEXT NOT NULL,
  "operationId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "wishlist_sync_operation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "wishlist_sync_operation_shop_operationId_key"
  ON "wishlist_sync_operation"("shop", "operationId");
CREATE INDEX IF NOT EXISTS "wishlist_sync_operation_shop_createdAt_idx"
  ON "wishlist_sync_operation"("shop", "createdAt");

CREATE TABLE IF NOT EXISTS "wishlist_settings_profile" (
  "id" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "settings" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wishlist_settings_profile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "wishlist_settings_profile_fingerprint_key"
  ON "wishlist_settings_profile"("fingerprint");


ALTER TABLE "store_settings"
  ADD COLUMN IF NOT EXISTS "autoInjectHeaderIcon" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "customCss" TEXT NOT NULL DEFAULT '';

ALTER TABLE "store_settings"
  ADD COLUMN IF NOT EXISTS "settingsProfileId" TEXT;
CREATE INDEX IF NOT EXISTS "store_settings_settingsProfileId_idx"
  ON "store_settings"("settingsProfileId");

DO $$ BEGIN
  ALTER TABLE "wishlist_sync_operation"
    ADD CONSTRAINT "wishlist_sync_operation_shop_fkey"
    FOREIGN KEY ("shop") REFERENCES "stores"("shop") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


DO $$ BEGIN
  ALTER TABLE "store_settings"
    ADD CONSTRAINT "store_settings_settingsProfileId_fkey"
    FOREIGN KEY ("settingsProfileId") REFERENCES "wishlist_settings_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
