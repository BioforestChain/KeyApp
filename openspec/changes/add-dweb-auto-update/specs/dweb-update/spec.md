## ADDED Requirements
### Requirement: DWEB Update Source Resolution
The DWEB build SHALL resolve the update metadata URL using the configured site origin and build channel.

#### Scenario: Stable channel metadata URL
- **GIVEN** the app runs in DWEB and `__DEV_MODE__` is false
- **WHEN** resolving the update metadata URL
- **THEN** the path MUST be `/dweb/metadata.json` under the configured site origin

#### Scenario: Dev channel metadata URL
- **GIVEN** the app runs in DWEB and `__DEV_MODE__` is true
- **WHEN** resolving the update metadata URL
- **THEN** the path MUST be `/dweb-dev/metadata.json` under the configured site origin

### Requirement: Automatic Update Check
The DWEB build SHALL perform a delayed update check after startup without blocking initial render.

#### Scenario: Deferred startup check
- **GIVEN** the application has started in DWEB mode
- **WHEN** the delayed timer elapses
- **THEN** the update check runs without blocking initial rendering

### Requirement: Manual Update Check
The user SHALL be able to trigger a manual update check from the Settings > About view.

#### Scenario: User-initiated check
- **GIVEN** the user opens Settings > About
- **WHEN** the user triggers the update check action
- **THEN** the app fetches the update metadata and reports the result

### Requirement: Update Prompt
When a higher version is available, the DWEB build SHALL present an upgrade prompt with a DWEB install link.

#### Scenario: Update available
- **GIVEN** the remote metadata version is higher than the local version
- **WHEN** the update check completes
- **THEN** an upgrade dialog is shown
- **AND** the dialog includes a `dweb://install?url=` link pointing to the metadata URL

### Requirement: Changelog Display
The upgrade dialog SHALL display changelog content when available from metadata/manifest.

#### Scenario: Changelog present
- **GIVEN** update metadata contains a changelog field
- **WHEN** the upgrade dialog is shown
- **THEN** the changelog is displayed in the dialog
