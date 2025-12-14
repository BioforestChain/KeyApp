# chain-config Specification

## Purpose
TBD - created by archiving change add-chain-config-management. Update Purpose after archive.
## Requirements
### Requirement: Default Chain Configuration

The system SHALL load default chain configurations from a JSON file at app startup.

#### Scenario: Load default chains on first launch

- **WHEN** the app starts for the first time
- **THEN** the system loads chain configs from `public/configs/default-chains.json`
- **AND** all 8 BioForest chains are available (BFMeta, CCChain, PMChain, BFChainV2, BTGMeta, BIWMeta, ETHMeta, Malibu)
- **AND** each chain config includes id, version, type, name, symbol, prefix, and decimals

#### Scenario: Default chains have version and type

- **GIVEN** the default-chains.json file exists
- **WHEN** the system parses the chain configs
- **THEN** each chain config has a version field in "major.minor" format
- **AND** each chain config has a type field (e.g., "bioforest")

### Requirement: Subscription URL Configuration

The system SHALL allow users to configure a subscription URL for remote chain configs.

#### Scenario: Use default subscription

- **GIVEN** the user has not configured a custom subscription URL
- **WHEN** the system loads chain configs
- **THEN** it uses the local default-chains.json file

#### Scenario: Configure custom subscription URL

- **GIVEN** the user is on the chain config settings page
- **WHEN** the user enters a valid subscription URL
- **AND** clicks save
- **THEN** the system stores the subscription URL preference
- **AND** fetches chain configs from the remote URL

#### Scenario: Subscription fetch with caching

- **GIVEN** a subscription URL is configured
- **WHEN** the system fetches remote configs
- **THEN** it uses ETag headers for conditional requests
- **AND** caches the response in IndexedDB
- **AND** shows the last updated timestamp in settings

#### Scenario: Subscription fetch failure

- **GIVEN** a subscription URL is configured
- **WHEN** the network request fails
- **THEN** the system uses cached configs if available
- **AND** displays an error toast to the user
- **AND** does not block app functionality

### Requirement: Chain Enable/Disable Control

The system SHALL allow users to enable or disable individual chain configurations.

#### Scenario: Disable a chain

- **GIVEN** the user is on the chain config settings page
- **WHEN** the user toggles a chain to disabled
- **THEN** the chain is hidden from wallet creation/import flows
- **AND** the chain is hidden from chain selectors
- **AND** existing wallet data for that chain is preserved

#### Scenario: Enable a previously disabled chain

- **GIVEN** a chain was previously disabled
- **WHEN** the user toggles the chain to enabled
- **THEN** the chain appears in wallet creation/import flows
- **AND** existing wallet data for that chain becomes accessible

#### Scenario: Disabled chains show in settings

- **GIVEN** some chains are disabled
- **WHEN** the user views the chain config settings page
- **THEN** all chains (enabled and disabled) are listed
- **AND** disabled chains show a clear visual indicator (toggle off)

### Requirement: Manual Chain Configuration

The system SHALL allow users to manually add chain configurations via JSON input.

#### Scenario: Add valid manual chain config

- **GIVEN** the user is on the chain config settings page
- **WHEN** the user enters valid JSON for a new chain config
- **AND** clicks the "Add" button
- **THEN** the system validates the JSON against the schema
- **AND** stores the config as a manual addition
- **AND** the chain appears in the chain list
- **AND** shows a success toast

#### Scenario: Add multiple chains via JSON array

- **GIVEN** the user enters a JSON array with multiple chain configs
- **WHEN** the user clicks "Add"
- **THEN** all valid configs are added
- **AND** shows count of successfully added chains

#### Scenario: Reject invalid JSON syntax

- **GIVEN** the user enters malformed JSON
- **WHEN** the user clicks "Add"
- **THEN** the system shows a JSON syntax error message
- **AND** does not add any configs

#### Scenario: Reject invalid config schema

- **GIVEN** the user enters valid JSON but missing required fields
- **WHEN** the user clicks "Add"
- **THEN** the system shows validation error with missing fields
- **AND** does not add the config

#### Scenario: Warn on duplicate chain ID

- **GIVEN** a chain with id "bfmeta" already exists
- **WHEN** the user tries to add a manual config with id "bfmeta"
- **THEN** the system shows a duplicate ID warning
- **AND** offers to replace or cancel

### Requirement: Version-Based Config Compatibility

The system SHALL validate chain config versions and handle incompatible versions gracefully.

#### Scenario: Compatible version accepted

- **GIVEN** the app supports version 1.x configs
- **WHEN** a chain config with version "1.2" is loaded
- **THEN** the config is used normally

#### Scenario: Incompatible major version hidden

- **GIVEN** the app supports version 1.x configs
- **WHEN** a chain config with version "2.0" is loaded
- **THEN** the config is hidden from the UI
- **AND** a warning is shown that app update may be required

#### Scenario: Unknown type handled

- **GIVEN** a chain config has type "future-chain"
- **WHEN** the config is loaded
- **THEN** the config is treated as "custom" type
- **AND** basic functionality is available

### Requirement: Chain Config Persistence

The system SHALL persist chain configs and user preferences across app restarts.

#### Scenario: User preferences survive restart

- **GIVEN** the user has disabled some chains
- **WHEN** the app is closed and reopened
- **THEN** the disable preferences are restored
- **AND** the same chains are hidden

#### Scenario: Manual configs survive restart

- **GIVEN** the user has added manual chain configs
- **WHEN** the app is closed and reopened
- **THEN** the manual configs are restored
- **AND** appear in the chain list

#### Scenario: Subscription cache survives offline

- **GIVEN** configs were fetched from a subscription URL
- **WHEN** the app starts without network
- **THEN** the cached subscription configs are used
- **AND** a stale cache indicator is shown if cache is old

### Requirement: Chain Config Settings UI

The system SHALL provide a settings page for managing chain configurations.

#### Scenario: Access chain config settings

- **GIVEN** the user is on the settings page
- **WHEN** the user taps "Chain Configuration"
- **THEN** the chain config settings page opens
- **AND** shows subscription URL input, chain list, and manual add section

#### Scenario: Chain list shows source badge

- **GIVEN** chains from different sources exist
- **WHEN** the user views the chain list
- **THEN** each chain shows its source (Default, Subscription, Manual)
- **AND** version number is visible

#### Scenario: Refresh subscription manually

- **GIVEN** a subscription URL is configured
- **WHEN** the user taps the refresh button
- **THEN** the system fetches fresh configs from the URL
- **AND** shows loading indicator during fetch
- **AND** updates the chain list with new data

