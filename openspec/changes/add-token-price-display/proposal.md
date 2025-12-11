# Change: Add Token Price Display

## Why
Users need to see the fiat value of their token holdings. Currently `AssetItem` only displays token balance without USD/fiat equivalent. This is a core financial UX feature expected in any wallet application.

## What Changes
- Extend `AssetInfo` type with `priceUsd` and `priceChange24h` fields
- Enhance `AssetItem` component to display fiat value and 24h change percentage
- Create `usePriceService` hook for fetching/caching price data (mock data MVP)
- Integrate with `preferencesStore.currency` for localized formatting

## Impact
- Affected specs: `asset-display`, `types`
- Affected code: `src/types/asset.ts`, `src/components/asset/asset-item.tsx`, `src/hooks/use-price-service.ts` (new)
- Tests: ~15-20 new tests expected
