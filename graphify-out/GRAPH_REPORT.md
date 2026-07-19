# Graph Report - .  (2026-07-19)

## Corpus Check
- 120 files · ~96,291 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1490 nodes · 1609 edges · 86 communities (60 shown, 26 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Prisma Client
- Prisma Client
- Wishlist Prisma
- Event Prisma
- Settings Prisma
- Item Prisma
- Sync Wishlist
- Settings Profile
- Prisma Client
- Developer Eventwriter
- Package Iarna
- Prisma Client
- Utils Wishlist
- Prisma Client
- Next Cryptr
- Scripts Docker
- Prisma Client
- Pages Index
- Prisma Client
- Store Prisma
- Prisma Client
- Wishlist Prisma
- Wishlist Prisma
- Wishlist Settings
- Wishlist Sync
- Prisma Client
- Wishlist Extensions
- Wishlist Extensions
- Utils Middleware
- Api Pages
- Components Customize
- Jsconfig Paths
- Prisma Client
- Prisma Client
- Utils Billing
- Wishlist Extensions
- Store Prisma
- Prisma Wishlist
- Scripts Test
- Wishlist Extensions
- Pages Customize
- Wishlist Prisma
- Prisma Wishlist
- Prisma Wishlist
- Utils Gdpr
- Developer Autodev
- Wishlist Extensions
- Setupcheck Next
- Pages Api
- Pages Api
- Pages Document
- Prisma Client
- Scripts Migrate
- Pages Api
- Pages Api
- Pages Api
- Proxy Config
- Utils Wishlist
- Scripts Prisma

## God Nodes (most connected - your core abstractions)
1. `scripts` - 25 edges
2. `PrismaClient` - 18 edges
3. `sessionDelegate` - 18 edges
4. `store_settingsDelegate` - 18 edges
5. `storesDelegate` - 18 edges
6. `wishlistDelegate` - 18 edges
7. `wishlist_eventDelegate` - 18 edges
8. `wishlist_itemDelegate` - 18 edges
9. `wishlist_settings_profileDelegate` - 18 edges
10. `wishlist_sync_operationDelegate` - 18 edges

## Surprising Connections (you probably didn't know these)
- `handler()` --indirect_call--> `serializeItem()`  [INFERRED]
  pages/api/proxy_route/api.js → utils/wishlist/service.js
- `freshInstall()` --calls--> `getSettings()`  [EXTRACTED]
  utils/freshInstall.js → utils/wishlist/settings.js
- `isInitialLoad()` --calls--> `freshInstall()`  [EXTRACTED]
  utils/middleware/isInitialLoad.js → utils/freshInstall.js
- `verifyCheckout()` --calls--> `validateJWT()`  [EXTRACTED]
  utils/middleware/verifyCheckout.js → utils/validateJWT.js
- `verifyRequest()` --calls--> `validateJWT()`  [EXTRACTED]
  utils/middleware/verifyRequest.js → utils/validateJWT.js

## Import Cycles
- 3-file cycle: `prisma/client/commonInputTypes.ts -> prisma/client/internal/prismaNamespace.ts -> prisma/client/models.ts -> prisma/client/commonInputTypes.ts`
- 3-file cycle: `prisma/client/internal/prismaNamespace.ts -> prisma/client/models.ts -> prisma/client/models/session.ts -> prisma/client/internal/prismaNamespace.ts`
- 3-file cycle: `prisma/client/internal/prismaNamespace.ts -> prisma/client/models.ts -> prisma/client/models/stores.ts -> prisma/client/internal/prismaNamespace.ts`
- 3-file cycle: `prisma/client/internal/prismaNamespace.ts -> prisma/client/models.ts -> prisma/client/models/wishlist_item.ts -> prisma/client/internal/prismaNamespace.ts`
- 3-file cycle: `prisma/client/internal/prismaNamespace.ts -> prisma/client/models.ts -> prisma/client/models/wishlist_settings_profile.ts -> prisma/client/internal/prismaNamespace.ts`
- 3-file cycle: `prisma/client/internal/prismaNamespace.ts -> prisma/client/models.ts -> prisma/client/models/wishlist.ts -> prisma/client/internal/prismaNamespace.ts`
- 3-file cycle: `prisma/client/internal/prismaNamespace.ts -> prisma/client/models.ts -> prisma/client/models/wishlist_event.ts -> prisma/client/internal/prismaNamespace.ts`
- 3-file cycle: `prisma/client/internal/prismaNamespace.ts -> prisma/client/models.ts -> prisma/client/models/wishlist_sync_operation.ts -> prisma/client/internal/prismaNamespace.ts`
- 3-file cycle: `prisma/client/internal/prismaNamespace.ts -> prisma/client/models.ts -> prisma/client/models/store_settings.ts -> prisma/client/internal/prismaNamespace.ts`

## Communities (86 total, 26 thin omitted)

### Community 0 - "Prisma Client"
Cohesion: 0.02
Nodes (114): Args, At, AtLeast, AtLoose, AtStrict, BatchPayload, Boolean, BooleanFieldRefInput (+106 more)

### Community 1 - "Prisma Client"
Cohesion: 0.02
Nodes (105): AggregateStores, BoolFieldUpdateOperationsInput, DateTimeFieldUpdateOperationsInput, GetStoresAggregateType, GetStoresGroupByPayload, stores$eventsArgs, stores$settingsArgs, stores$syncOperationsArgs (+97 more)

### Community 2 - "Wishlist Prisma"
Cohesion: 0.02
Nodes (101): AggregateWishlist, GetWishlistAggregateType, GetWishlistGroupByPayload, wishlist$eventsArgs, wishlist$itemsArgs, WishlistAggregateArgs, WishlistCountAggregateInputType, WishlistCountAggregateOutputType (+93 more)

### Community 3 - "Event Prisma"
Cohesion: 0.02
Nodes (96): AggregateWishlist_event, GetWishlist_eventAggregateType, GetWishlist_eventGroupByPayload, NullableDecimalFieldUpdateOperationsInput, wishlist_event$wishlistArgs, Wishlist_eventAggregateArgs, Wishlist_eventAvgAggregateInputType, Wishlist_eventAvgAggregateOutputType (+88 more)

### Community 4 - "Settings Prisma"
Cohesion: 0.02
Nodes (94): AggregateStore_settings, GetStore_settingsAggregateType, GetStore_settingsGroupByPayload, IntFieldUpdateOperationsInput, NullableDateTimeFieldUpdateOperationsInput, store_settings$settingsProfileArgs, Store_settingsAggregateArgs, Store_settingsAvgAggregateInputType (+86 more)

### Community 5 - "Item Prisma"
Cohesion: 0.02
Nodes (81): AggregateWishlist_item, DecimalFieldUpdateOperationsInput, GetWishlist_itemAggregateType, GetWishlist_itemGroupByPayload, Wishlist_itemAggregateArgs, Wishlist_itemAvgAggregateInputType, Wishlist_itemAvgAggregateOutputType, wishlist_itemAvgOrderByAggregateInput (+73 more)

### Community 6 - "Sync Wishlist"
Cohesion: 0.03
Nodes (74): AggregateWishlist_sync_operation, GetWishlist_sync_operationAggregateType, GetWishlist_sync_operationGroupByPayload, Wishlist_sync_operationAggregateArgs, Wishlist_sync_operationCountAggregateInputType, Wishlist_sync_operationCountAggregateOutputType, wishlist_sync_operationCountArgs, wishlist_sync_operationCountOrderByAggregateInput (+66 more)

### Community 7 - "Settings Profile"
Cohesion: 0.03
Nodes (70): AggregateWishlist_settings_profile, GetWishlist_settings_profileAggregateType, GetWishlist_settings_profileGroupByPayload, wishlist_settings_profile$assignmentsArgs, Wishlist_settings_profileAggregateArgs, Wishlist_settings_profileCountAggregateInputType, Wishlist_settings_profileCountAggregateOutputType, wishlist_settings_profileCountArgs (+62 more)

### Community 8 - "Prisma Client"
Cohesion: 0.04
Nodes (53): AggregateSession, GetSessionAggregateType, GetSessionGroupByPayload, NullableStringFieldUpdateOperationsInput, SessionAggregateArgs, SessionCountAggregateInputType, SessionCountAggregateOutputType, sessionCountArgs (+45 more)

### Community 9 - "Developer Eventwriter"
Cohesion: 0.06
Nodes (32): eventsTopicFilePath, eventWriter(), shopifyFilePath, writeToApi(), appUrl, config, availableTopics, shopifyFilePath (+24 more)

### Community 10 - "Package Iarna"
Cohesion: 0.05
Nodes (43): @iarna/toml, description, devDependencies, @iarna/toml, prettier, prisma, @shopify/cli, engines (+35 more)

### Community 11 - "Prisma Client"
Cohesion: 0.05
Nodes (41): BoolFilter, BoolWithAggregatesFilter, DateTimeFilter, DateTimeNullableFilter, DateTimeNullableWithAggregatesFilter, DateTimeWithAggregatesFilter, DecimalFilter, DecimalNullableFilter (+33 more)

### Community 12 - "Utils Wishlist"
Cohesion: 0.12
Nodes (25): ADMIN_SETTING_KEYS, DEFAULT_SETTINGS, PROFILE_SETTING_KEYS, PUBLIC_SETTING_KEYS, addWishlistItem(), createOrGetWishlist(), findWishlist(), getWishlistPayload() (+17 more)

### Community 13 - "Prisma Client"
Cohesion: 0.07
Nodes (25): $Enums, session, store_settings, stores, wishlist, wishlist_event, wishlist_item, wishlist_settings_profile (+17 more)

### Community 14 - "Next Cryptr"
Cohesion: 0.07
Nodes (27): cryptr, dotenv, lucide-react, next, next-api-middleware, dependencies, cryptr, dotenv (+19 more)

### Community 15 - "Scripts Docker"
Cohesion: 0.09
Nodes (21): migration, server, REQUIRED, VALID_PROXY_PREFIXES, validateRuntimeEnvironment(), appBridgeIndex, appConfig, baselineMigration (+13 more)

### Community 16 - "Prisma Client"
Cohesion: 0.09
Nodes (4): config, LogOptions, PrismaClient, PrismaClientConstructor

### Community 26 - "Wishlist Extensions"
Cohesion: 0.32
Nodes (15): enhanceHeaderLink(), headerLinkMarkup(), inject(), injectCardHearts(), injectHeaderLinks(), injectProductButton(), injectProductImageHeart(), positionHeart() (+7 more)

### Community 27 - "Wishlist Extensions"
Cohesion: 0.30
Nodes (15): addToCart(), applyCustomCss(), bindActions(), closeDrawer(), emptyHtml(), ensureDrawer(), itemHtml(), money() (+7 more)

### Community 28 - "Utils Middleware"
Cohesion: 0.25
Nodes (9): verifyCheckout(), verifyHmac(), calculateProxySignature(), normalizeValue(), verifyProxy(), getSession(), verifyRequest(), withMiddleware (+1 more)

### Community 29 - "Api Pages"
Cohesion: 0.33
Nodes (11): claimSyncOperation(), completeSyncOperation(), errorResponse(), handler(), itemSelect, normalizeVariantId(), parseBody(), PERMANENT_SYNC_ERRORS (+3 more)

### Community 30 - "Components Customize"
Cohesion: 0.24
Nodes (7): DEVICES, IconDesktop(), IconMobile(), PAGE_LABELS, Preview(), products, wishlistItems

### Community 31 - "Jsconfig Paths"
Cohesion: 0.22
Nodes (8): compilerOptions, paths, @/components, @/hooks, @/utils, ./components/*, ./components/hooks/*, ./utils/*

### Community 34 - "Utils Billing"
Cohesion: 0.43
Nodes (5): getLegacySubscription(), getPartnerSubscription(), getShopGid(), getSubscriptionStatus(), PLAN_CONFIG

### Community 35 - "Wishlist Extensions"
Cohesion: 0.60
Nodes (5): createId(), createStorage(), safeParse(), storageGet(), storageSet()

### Community 38 - "Scripts Test"
Cohesion: 0.67
Nodes (5): loadModule(), makeStorage(), testBatchLimit(), testRapidAddRemove(), waitUntil()

### Community 39 - "Wishlist Extensions"
Cohesion: 0.60
Nodes (3): init(), observeDynamicTheme(), render()

### Community 44 - "Utils Gdpr"
Cohesion: 0.60
Nodes (3): parseVerifiedGdprRequest(), readRawBody(), verifyShopifyWebhookHmac()

### Community 45 - "Developer Autodev"
Cohesion: 0.83
Nodes (3): main(), runCommand(), startCloudflareTunnel()

### Community 46 - "Wishlist Extensions"
Cohesion: 0.83
Nodes (3): heart(), setHeart(), spinner()

### Community 48 - "Pages Api"
Cohesion: 0.67
Nodes (3): ASSETS, escapeHtml(), handler()

### Community 49 - "Pages Api"
Cohesion: 0.67
Nodes (3): buffer(), config, handler()

### Community 53 - "Scripts Migrate"
Cohesion: 0.67
Nodes (3): getMigrationFiles(), main(), migrationsRoot

## Knowledge Gaps
- **966 isolated node(s):** `shopifyFilePath`, `eventsTopicFilePath`, `appUrl`, `config`, `availableTopics` (+961 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `storesDelegate` connect `Prisma Client` to `Prisma Client`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `wishlist_itemDelegate` connect `Wishlist Prisma` to `Item Prisma`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `wishlist_sync_operationDelegate` connect `Wishlist Sync` to `Sync Wishlist`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `shopifyFilePath`, `eventsTopicFilePath`, `appUrl` to the rest of the system?**
  _966 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Prisma Client` be split into smaller, more focused modules?**
  _Cohesion score 0.017391304347826087 - nodes in this community are weakly interconnected._
- **Should `Prisma Client` be split into smaller, more focused modules?**
  _Cohesion score 0.018867924528301886 - nodes in this community are weakly interconnected._
- **Should `Wishlist Prisma` be split into smaller, more focused modules?**
  _Cohesion score 0.0196078431372549 - nodes in this community are weakly interconnected._