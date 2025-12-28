# Ecosystem Miniapp Platform (Delta)

## ADDED Requirements

### Requirement: Trusted Source Configuration
The system SHALL allow users to configure multiple trusted miniapp sources.

#### Scenario: Enable/disable multiple sources
- **GIVEN** the user has configured multiple sources
- **WHEN** they disable one source
- **THEN** apps from that source SHALL NOT appear in the ecosystem lists

### Requirement: SSR-style Subscription Cache
The system SHALL cache subscription source payloads locally and refresh incrementally.

#### Scenario: Use ETag / 304 to reuse cache
- **GIVEN** a source was fetched and cached with an ETag
- **WHEN** the system refreshes the same source without force
- **AND** the server responds `304 Not Modified`
- **THEN** the system SHALL use the cached payload

#### Scenario: Offline start uses cache
- **GIVEN** the device is offline
- **AND** cached payload exists for enabled sources
- **WHEN** the user opens the ecosystem tab
- **THEN** the system SHALL render apps from cache

### Requirement: Partial Listing With Scoring
The system SHALL provide partial listings instead of always rendering full lists.

#### Scenario: Featured apps are ranked by combined score
- **GIVEN** apps have `officialScore` and `communityScore`
- **WHEN** the ecosystem page renders featured section
- **THEN** it SHALL compute `featuredScore` by date-based dynamic weighting:
  - `officialWeightPct` cycles daily by `+15 mod 100` (e.g. `15,30,45,60,75,90,5,...`)
  - `communityWeightPct = 100 - officialWeightPct`
  - `featuredScore = (officialScore * officialWeightPct + communityScore * communityWeightPct) / 100`
- **AND** it SHALL sort by `featuredScore` (descending)
- **AND** it SHALL show only Top N

### Requirement: Search Beyond Subscription Lists
The system SHALL support searching apps beyond the cached subscription lists.

#### Scenario: Local search returns cached matches
- **GIVEN** cached apps exist
- **WHEN** the user searches with a keyword
- **THEN** matching cached apps SHALL be returned

#### Scenario: Remote search is optional per source
- **GIVEN** an enabled source declares `search.urlTemplate`
- **WHEN** the user searches with a keyword
- **THEN** the system MAY issue a GET request by replacing `%s` with the URL-encoded query
- **AND** it SHALL accept response shape `{ version: string; data: MiniappManifest[] }` and merge results

### Requirement: AppId Reverse-domain Rule
The system SHALL require appId to follow reverse-domain naming to avoid takeover/override.

#### Scenario: Reject invalid appId format
- **GIVEN** a subscription payload includes an app with invalid appId
- **WHEN** the registry parses apps
- **THEN** the system SHALL ignore the invalid entry and log a warning

### Requirement: Transaction Pipeline Is Available
The system SHALL provide `createTransaction` and `signTransaction` capabilities via `window.bio`.

#### Scenario: Create then sign an EVM transfer
- **GIVEN** the user has an EVM account in KeyApp
- **WHEN** a miniapp calls `bio_createTransaction` for a transfer
- **AND** then calls `bio_signTransaction`
- **THEN** the system SHALL return a signed raw transaction payload

## MODIFIED Requirements

### Requirement: Existing sendTransaction
The system SHALL keep supporting `bio_sendTransaction` as a high-level sign+send shortcut.

#### Scenario: sendTransaction still works
- **GIVEN** a miniapp calls `bio_sendTransaction`
- **THEN** the system SHALL continue to show transfer confirmation and return `{ txHash }`
