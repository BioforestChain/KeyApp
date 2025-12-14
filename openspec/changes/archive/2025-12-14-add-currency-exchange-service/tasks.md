## 1. Service Interface & Types

- [x] 1.1 Define `ICurrencyExchangeService` interface in `src/services/types.ts`
- [x] 1.2 Define `ExchangeRateResponse` and `ExchangeRateData` types in `src/services/currency-exchange/types.ts`
- [x] 1.3 Add `currencyExchange` to `IServices` aggregate interface

## 2. Service Implementations

- [x] 2.1 Create `src/services/currency-exchange/mock.ts` with static rates for testing
- [x] 2.2 Create `src/services/currency-exchange/web.ts` with Frankfurter API integration
- [x] 2.3 Create `src/services/currency-exchange/index.ts` with platform detection and export
- [x] 2.4 Register service in `src/services/index.ts`

## 3. React Hook

- [x] 3.1 Create `src/hooks/use-exchange-rate.ts` with caching (5-minute TTL)
- [x] 3.2 Implement `useExchangeRate(baseCurrency: string, targetCurrencies: string[])` signature
- [x] 3.3 Handle loading, error, and cached states

## 4. Integration with Existing Code

- [x] 4.1 Extend `formatFiatValue()` in `src/types/asset.ts` to accept optional exchange rate
- [x] 4.2 Create `convertFiat(usdAmount: number, rate: number)` utility function
- [x] 4.3 Update `TokenItem` component to use exchange rates when currency is not USD

## 5. Testing

- [x] 5.1 Add unit tests for mock service implementation
- [x] 5.2 Add unit tests for web service implementation (with mocked fetch)
- [x] 5.3 Add unit tests for `useExchangeRate` hook (cache behavior, error handling)
- [x] 5.4 Add integration tests for `formatFiatValue` with exchange rates
- [x] 5.5 Update Storybook stories with multi-currency display

## 6. i18n

- [x] 6.1 Add currency-related i18n keys (loading, error messages)
- [x] 6.2 Verify currency symbol formatting for all supported currencies

## 7. Validation

- [x] 7.1 Run `pnpm lint && pnpm test --run`
- [x] 7.2 Verify Storybook renders correctly for all currency options
- [x] 7.3 Manual test: USD, CNY, EUR, JPY, KRW display
