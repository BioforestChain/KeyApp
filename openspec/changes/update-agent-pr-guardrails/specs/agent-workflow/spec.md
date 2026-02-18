# agent-workflow Specification (Delta)

## ADDED Requirements

### Requirement: Conventional PR titles (strict by default)
The system SHALL enforce conventional commit-style PR titles by default.

#### Scenario: Auto-normalize PR title
- **GIVEN** a task PR is created or updated
- **WHEN** the title is non-conforming
- **THEN** the system auto-normalizes it to `feat(<type>): <issue title>`
- **AND** rejects submission if strict mode is enabled and normalization fails

### Requirement: Auto-close linked issues
The system SHALL ensure PR bodies include `Closes #<issueId>`.

#### Scenario: Issue auto-closure
- **GIVEN** a PR is created for an issue
- **WHEN** the PR is merged to main
- **THEN** the linked issue is auto-closed by GitHub

### Requirement: Loose mode override
The system SHALL provide a `--loose` mode to bypass strict PR title enforcement.

#### Scenario: Loose mode accepts non-standard titles
- **GIVEN** a developer runs `task submit --loose`
- **WHEN** the PR title is non-conforming
- **THEN** the workflow proceeds without blocking
