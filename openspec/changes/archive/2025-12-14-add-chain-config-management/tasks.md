# Tasks: Multi-Chain Configuration Management

## 1. Foundation

- [x] 1.1 Create `public/configs/default-chains.json` with all 8 BioForest chains
- [x] 1.2 Create `src/services/chain-config/types.ts` with ChainConfig interfaces
- [x] 1.3 Create `src/services/chain-config/schema.ts` with Zod validation schemas
- [x] 1.4 Write unit tests for schema validation

## 2. Storage Layer

- [x] 2.1 Create `src/services/chain-config/storage.ts` for IndexedDB operations
- [x] 2.2 Implement `saveChainConfigs()` - persist configs by source
- [x] 2.3 Implement `loadChainConfigs()` - load all stored configs
- [x] 2.4 Implement `saveUserPreferences()` - persist enabled/disabled state
- [x] 2.5 Write unit tests for storage operations

## 3. Subscription Service

- [x] 3.1 Create `src/services/chain-config/subscription.ts`
- [x] 3.2 Implement `fetchSubscription(url)` with ETag caching
- [x] 3.3 Implement `parseAndValidate(json)` with error handling
- [x] 3.4 Implement `mergeWithExisting(fetched, cached)` logic
- [x] 3.5 Write unit tests for subscription fetch and parse

## 4. Main Service

- [x] 4.1 Create `src/services/chain-config/index.ts` as orchestration layer
- [x] 4.2 Implement `initialize()` - load all layers, merge (manual > subscription > default), emit; handle version/type downgrade rules
- [x] 4.3 Implement `getEnabledChains()` - filter by user preference
- [x] 4.4 Implement `getChainById(id)` - lookup helper
- [x] 4.5 Implement `addManualConfig(json)` - validate and store
- [x] 4.6 Implement `refreshSubscription()` - force fetch
- [x] 4.7 Implement `setChainEnabled(id, enabled)` - toggle preference
- [x] 4.8 Write integration tests for service

## 5. TanStack Store

- [x] 5.1 Create `src/stores/chain-config.ts` with TanStack Store
- [x] 5.2 Define state shape: `{ configs, subscription, loading, error }`
- [x] 5.3 Create derived state: `enabledChains`, `chainById`
- [x] 5.4 Create actions: `enable`, `disable`, `addManual`, `refresh`, `setSubscriptionUrl`
- [x] 5.5 Wire service to store via effects
- [x] 5.6 Write store tests

## 6. Migrate Existing Code

- [x] 6.1 Update `src/lib/crypto/bioforest.ts` to import from chain-config service
- [x] 6.2 Expose enabled BioForest configs (`chainConfigSelectors.getEnabledBioforestChainConfigs()` + `useEnabledBioforestChainConfigs()`)
- [x] 6.3 Ensure backward compatibility with existing `BIOFOREST_CHAINS` usage
- [x] 6.4 Update wallet creation/import to use new chain source
- [x] 6.5 Write migration tests

## 7. Settings UI

- [x] 7.1 Create `src/pages/settings/chain-config.tsx` page component
- [x] 7.2 Implement subscription URL input with "default" option
- [x] 7.3 Implement chain list with enable/disable toggles
- [x] 7.4 Implement manual JSON input textarea
- [x] 7.5 Implement "Add" button with validation feedback
- [x] 7.6 Add i18n keys for all UI text
- [x] 7.7 Add route `/settings/chains` to router
- [x] 7.8 Write component tests

## 8. i18n

- [x] 8.1 Add English translations (`src/i18n/locales/en/settings.json`)
- [x] 8.2 Add Chinese translations (`src/i18n/locales/zh-CN/settings.json`)
- [x] 8.3 Add Traditional Chinese translations (`src/i18n/locales/zh-TW/settings.json`)
- [x] 8.4 Add Arabic translations (`src/i18n/locales/ar/settings.json`)

## 9. Integration & Polish

- [x] 9.1 Add settings menu link to chain configuration
- [x] 9.2 Add loading states and error handling in UI
- [x] 9.3 Add toast notifications for success/error feedback
- [x] 9.4 Test offline behavior (cached configs)
- [x] 9.5 Test subscription update flow
- [x] 9.6 E2E test: add manual chain, verify in wallet creation

## 10. Documentation

- [x] 10.1 Update TDD.md with chain-config service documentation
- [x] 10.2 Add Storybook stories for chain-config settings page
- [x] 10.3 Document JSON config format for power users
