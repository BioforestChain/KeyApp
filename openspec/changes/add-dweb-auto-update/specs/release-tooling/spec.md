## ADDED Requirements
### Requirement: Environment Configuration Registry
The project SHALL define a machine-readable environment configuration registry describing each env/secret field.

#### Scenario: Registry includes metadata
- **GIVEN** the registry is loaded
- **WHEN** iterating over fields
- **THEN** each field provides key, type (env/secret), and display policy metadata

### Requirement: set-env Local and GitHub Sync
The set-env tool SHALL support syncing values to local `.env.local`, GitHub Variables, and GitHub Secrets based on the registry.

#### Scenario: Local-only update
- **GIVEN** a field is marked for local sync
- **WHEN** the user saves
- **THEN** `.env.local` is updated with the provided value

#### Scenario: GitHub variable update
- **GIVEN** a field is marked as GitHub variable
- **WHEN** the user syncs to GitHub
- **THEN** `gh variable set` is used to update the repository variable

#### Scenario: GitHub secret update
- **GIVEN** a field is marked as GitHub secret
- **WHEN** the user syncs to GitHub
- **THEN** `gh secret set` is used to update the repository secret

### Requirement: Release Main-Only Guard
The release tool SHALL only run when the target source equals `origin/main`.

#### Scenario: Non-main invocation
- **GIVEN** the release tool is invoked outside `origin/main`
- **WHEN** validation runs
- **THEN** the tool aborts with a clear error

### Requirement: Origin/Main Parity
The release tool SHALL ensure the release is created from the latest `origin/main` without relying on the current working tree state.

#### Scenario: Local working tree differs
- **GIVEN** local changes exist
- **WHEN** release is initiated
- **THEN** the release process uses a clean `origin/main` source and does not modify the local tree

### Requirement: Protected Branch Admin Path
When branch protection blocks direct updates, the release tool SHALL provide an admin path to complete the release.

#### Scenario: Protection blocks direct push
- **GIVEN** branch protection rejects a direct push
- **WHEN** the operator enables admin mode
- **THEN** the release completes using administrator privileges
