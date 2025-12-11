## 1. Types & Data Layer
- [x] 1.1 Extend `AssetInfo` in `src/types/asset.ts` with `priceUsd?: number`, `priceChange24h?: number`
- [x] 1.2 Add `formatFiatValue(amount: string, decimals: number, priceUsd: number): string` utility
- [x] 1.3 Add type tests for new fields

## 2. Price Service Hook
- [x] 2.1 Create `src/hooks/use-price-service.ts` with mock price data
- [x] 2.2 Implement `usePriceService(symbols: string[])` returning `{ prices: Map<string, PriceData>, isLoading, error }`
- [x] 2.3 Add Vitest tests for hook (loading state, error handling, cache behavior)

## 3. UI Enhancement
- [x] 3.1 Update `AssetItem` to display fiat value (`$123.45`) below balance
- [x] 3.2 Add 24h change indicator with color coding (green positive, red negative)
- [x] 3.3 Integrate with `preferencesStore.currency` for symbol/locale
- [x] 3.4 Update Storybook stories with price variations
- [x] 3.5 Add component tests for price display states

## 4. Validation
- [x] 4.1 Run `pnpm lint && pnpm test --run`
- [x] 4.2 Verify Storybook renders correctly
