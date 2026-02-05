## ADDED Requirements

### Requirement: Manifest-driven Permissions Policy
The system SHALL allow miniapps to declare Permissions Policy directives in their manifest and enforce them at runtime.

#### Scenario: Miniapp declares clipboard write
- **GIVEN** a miniapp manifest includes `permissionsPolicy: ["clipboard-write"]`
- **WHEN** the miniapp is launched
- **THEN** the runtime injects `allow="clipboard-write"` into the miniapp iframe

### Requirement: Permissions Policy directive validation
The system SHALL validate declared Permissions Policy directives against the supported directive list.

#### Scenario: Invalid directive
- **GIVEN** a manifest includes an unknown directive
- **WHEN** the registry parses the manifest
- **THEN** the manifest is rejected or the invalid directive is ignored with diagnostics

### Requirement: Manifest refresh updates running apps
The system SHALL update running miniapp manifests and their iframe allowlists when source data is refreshed.

#### Scenario: Source update changes permissions
- **GIVEN** a running miniapp with `permissionsPolicy: ["camera"]`
- **WHEN** the source refresh updates the manifest to include `"clipboard-write"`
- **THEN** the runtime updates the iframe allowlist to include `clipboard-write`
