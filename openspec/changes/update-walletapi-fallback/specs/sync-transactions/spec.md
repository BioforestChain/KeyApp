## ADDED Requirements
### Requirement: WalletAPI logical failures trigger txHistory fallback
The system SHALL treat WalletAPI `success:true` responses with `result.status != "1"` or `message == "NOTOK"` as failures for transaction history and trigger fallback providers without caching the failed response.

#### Scenario: NOTOK response triggers fallback
- **GIVEN** a WalletAPI tx history request returns `success:true` with `result.status:"0"` or `message:"NOTOK"`
- **WHEN** the provider processes the response
- **THEN** the txHistory source surfaces an error to trigger fallback
- **AND** the response is not cached

### Requirement: Token history queries are suppressed on base failure
The system SHALL skip token-history requests when the base (normal) txHistory request fails, to avoid unnecessary upstream traffic.

#### Scenario: Base history failure suppresses token queries
- **GIVEN** the normal txHistory request fails (network or NOTOK)
- **WHEN** the provider would otherwise fetch token histories
- **THEN** token-history requests are not executed

### Requirement: Transaction history emits incrementally
The system SHALL emit merged txHistory updates as each individual source resolves, without waiting for all sources to complete.

#### Scenario: Incremental merge updates
- **GIVEN** multiple txHistory sources (native + token)
- **WHEN** any source returns a new result
- **THEN** a merged txHistory update is emitted immediately

### Requirement: Cache policy respects canCache across strategies
The system SHALL apply `canCache` checks for all httpFetchCached strategies to prevent caching logical failures.

#### Scenario: canCache prevents caching NOTOK
- **GIVEN** `canCache` rejects a response
- **WHEN** a request uses network-first or other cache strategies
- **THEN** the response is not cached and future requests are not served from cache

### Requirement: Balance refresh is independent of txHistory failure
The system SHALL continue balance refresh even when txHistory requests fail or fall back.

#### Scenario: Balance refresh continues on txHistory error
- **GIVEN** txHistory failed or is using a fallback
- **WHEN** balance refresh is due
- **THEN** balance and token balances are still refreshed
