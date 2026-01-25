## MODIFIED Requirements

### Requirement: Performance Targets

The application SHALL provide immediate perceived responses by hydrating UI from recent cached snapshots while preserving existing network cache strategies.

#### Scenario: Snapshot-first UI hydration
- **GIVEN** the user opens the app with previously cached data
- **WHEN** a data source hook initializes
- **THEN** the UI shows the cached snapshot as soon as it is available from storage
- **AND** the network request proceeds according to the configured cache strategy
- **AND** the UI updates again when fresh data arrives
