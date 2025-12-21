## ADDED Requirements

### Requirement: Bioforest Transaction History
The system SHALL load Bioforest transaction history from BioforestTransactionService for the current wallet.

#### Scenario: Load history
- **WHEN** the user opens the transaction history screen
- **THEN** the system fetches and displays Bioforest transactions for the wallet addresses

### Requirement: Chain Filter Options
The system SHALL list enabled chain configurations in the history chain filter.

#### Scenario: Enabled chain filter
- **WHEN** chain configurations are enabled
- **THEN** the chain selector includes those chain names

### Requirement: Explorer Link Resolution
The system SHALL use chain-config explorer URLs when opening transaction details.

#### Scenario: Open explorer
- **WHEN** a transaction has a matching chain-config explorer URL
- **THEN** the system opens that explorer URL for the transaction hash
