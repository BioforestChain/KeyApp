## ADDED Requirements

### Requirement: Currency Exchange Service Interface

The system SHALL provide an `ICurrencyExchangeService` interface for fetching foreign exchange rates with multiple implementations (mock, web).

#### Scenario: Fetch latest exchange rates from USD

- **GIVEN** the default base currency is USD
- **WHEN** the service fetches exchange rates for target currencies (CNY, EUR, JPY, KRW)
- **THEN** it SHALL return a map of currency codes to exchange rates

#### Scenario: Mock implementation returns static rates

- **GIVEN** the platform is in test/development mode
- **WHEN** the mock service is used
- **THEN** it SHALL return predictable static rates for testing

#### Scenario: Web implementation calls Frankfurter API

- **GIVEN** the platform is in production web mode
- **WHEN** the web service fetches rates
- **THEN** it SHALL call `https://api.frankfurter.app/latest?from=USD&to={currencies}`
- **AND** it SHALL parse the JSON response with `amount`, `base`, `date`, and `rates` fields

### Requirement: Exchange Rate Caching

The system SHALL cache exchange rate responses to minimize API calls and improve performance.

#### Scenario: Cache hit within TTL

- **GIVEN** exchange rates were fetched less than 5 minutes ago
- **WHEN** a new rate request is made for the same currencies
- **THEN** the system SHALL return cached data without making an API call

#### Scenario: Cache miss after TTL expiration

- **GIVEN** exchange rates were fetched more than 5 minutes ago
- **WHEN** a new rate request is made
- **THEN** the system SHALL make a fresh API call and update the cache

#### Scenario: Cache invalidation for different currency sets

- **GIVEN** cached rates exist for CNY and EUR
- **WHEN** a request is made for CNY, EUR, and JPY
- **THEN** the system SHALL fetch fresh data including JPY

### Requirement: useExchangeRate Hook

The system SHALL provide a React hook `useExchangeRate` for components to access exchange rates with loading and error states.

#### Scenario: Initial loading state

- **WHEN** the hook is first called
- **THEN** it SHALL return `{ rates: null, isLoading: true, error: null }`

#### Scenario: Successful rate fetch

- **GIVEN** the service returns valid exchange rates
- **WHEN** the fetch completes
- **THEN** the hook SHALL return `{ rates: Map<string, number>, isLoading: false, error: null }`

#### Scenario: Error handling

- **GIVEN** the API request fails (network error, invalid response)
- **WHEN** the fetch fails
- **THEN** the hook SHALL return `{ rates: null, isLoading: false, error: string }`

### Requirement: Fiat Value Conversion

The system SHALL support converting crypto-to-USD values into the user's preferred fiat currency using exchange rates.

#### Scenario: Convert USD to CNY

- **GIVEN** a crypto asset worth $100 USD
- **AND** the USD/CNY exchange rate is 7.05
- **WHEN** the user's preferred currency is CNY
- **THEN** the displayed value SHALL be approximately 705 CNY

#### Scenario: Display in USD (no conversion needed)

- **GIVEN** a crypto asset worth $100 USD
- **WHEN** the user's preferred currency is USD
- **THEN** the displayed value SHALL be $100.00 without exchange rate lookup

#### Scenario: Fallback when exchange rate unavailable

- **GIVEN** exchange rate fetch fails or times out
- **WHEN** displaying fiat values
- **THEN** the system SHALL fallback to USD display with appropriate indication

### Requirement: Supported Currencies

The system SHALL support the following fiat currencies for display, matching the existing `preferencesStore.currency` options.

#### Scenario: Currency list matches settings options

- **GIVEN** the settings page offers USD, CNY, EUR, JPY, KRW currency options
- **WHEN** the exchange service is configured
- **THEN** it SHALL support converting to all five currencies

#### Scenario: Default to USD

- **GIVEN** no currency preference is set
- **WHEN** displaying fiat values
- **THEN** the system SHALL default to USD regardless of user interface language
