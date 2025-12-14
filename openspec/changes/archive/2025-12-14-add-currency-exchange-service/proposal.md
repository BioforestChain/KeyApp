# Change: Add Currency Exchange Service (Frankfurter API)

## Why

Users need to view their crypto holdings converted to their preferred fiat currency. The existing `usePriceService` provides crypto-to-USD conversion, but does not support converting USD to other fiat currencies (CNY, EUR, JPY, KRW). This is required by CLAUDE.md acceptance criteria #7.

The Frankfurter API is a free, reliable, and key-free foreign exchange rate service that provides real-time rates for 30+ currencies.

## What Changes

- Add `src/services/currency-exchange/` service module with Adapter pattern (mock/web implementations)
- Create `ICurrencyExchangeService` interface for exchange rate fetching
- Implement `useExchangeRate()` hook with 5-minute TTL caching
- Integrate with existing `preferencesStore.currency` and `formatFiatValue()` utility
- Add new i18n keys for currency-related UI text

## Impact

- **Affected specs**: New `currency-exchange` capability (no existing specs modified)
- **Affected code**:
  - `src/services/currency-exchange/` (new)
  - `src/hooks/use-exchange-rate.ts` (new)
  - `src/types/asset.ts` (extend `formatFiatValue` to use exchange rates)
  - `src/services/index.ts` (register service)
  - `src/services/types.ts` (add interface)
- **Dependencies**: None (uses native fetch)
- **Tests**: ~20-25 new tests expected
