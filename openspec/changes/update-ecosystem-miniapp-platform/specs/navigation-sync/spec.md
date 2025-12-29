# Navigation Sync (Delta)

## ADDED Requirements

### Requirement: URLPattern-based Route Matching
The system SHALL use `URLPattern` (via `urlpattern-polyfill`) for route parsing/matching in the navigation sync plugin.

#### Scenario: Route params include dots
- **GIVEN** a route contains a param `:appId`
- **AND** the appId value contains `.`
- **WHEN** the URL is parsed
- **THEN** the plugin SHALL match the route and extract the param correctly

### Requirement: Self-maintained Plugin Package
The system SHALL maintain its own navigation sync plugin package to avoid abandoned dependencies and enable future Navigation API adoption.

#### Scenario: Replace url-pattern dependency
- **GIVEN** the baseline plugin used `url-pattern`
- **WHEN** KeyApp uses the self-maintained plugin
- **THEN** `url-pattern` SHALL NOT be required by the plugin package

