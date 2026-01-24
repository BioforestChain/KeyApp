## ADDED Requirements
### Requirement: Provider txHistory reacts to pending confirmations
The system SHALL refresh transaction history for any provider when a pending transaction is confirmed for the same chainId and address.

#### Scenario: Pending confirmation triggers refresh
- **WHEN** a tx:confirmed event is emitted for a chainId/address
- **THEN** the provider transactionHistory source refreshes for that chainId/address

### Requirement: Shared wallet event bus for provider events
The system SHALL use a shared wallet event bus so pendingTx updates and provider sources observe the same events.

#### Scenario: Shared bus used by provider sources
- **GIVEN** a provider creates a transactionHistory source with walletEvents
- **WHEN** an event is emitted on the shared wallet event bus
- **THEN** the provider source reacts without provider-specific event bus instances
