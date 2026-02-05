## ADDED Requirements

### Requirement: Resumable release flow
The release tooling MUST detect release progress based on Git and GitHub state and resume remaining steps without manual scripting.

#### Scenario: Release resumes after PR merge
- **WHEN** a release commit has been merged into `main`
- **AND** the stable workflow has not been triggered
- **THEN** the release command triggers the stable workflow automatically

#### Scenario: Release resumes after PR creation
- **WHEN** a release branch and PR exist
- **AND** required checks have passed
- **THEN** the release command merges the PR and continues

### Requirement: Metadata synchronization check
The release tooling MUST verify that GitHub Pages `dweb/metadata.json` matches the target release version.

#### Scenario: Metadata is stale
- **WHEN** the gh-pages metadata version differs from the release version
- **THEN** the release command triggers a stable workflow rebuild to refresh gh-pages assets

### Requirement: Resume release command
The release tooling MUST expose a `release:resume` command that reuses the same atomic steps as `release`.

#### Scenario: Resume uses shared steps
- **WHEN** operators run `pnpm release:resume`
- **THEN** the command detects progress and continues using the same step implementations as `pnpm release`
