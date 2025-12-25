## ADDED Requirements

### Requirement: Practice subcommand
`pnpm agent practice` SHALL manage a standalone best-practices file and support list/add/remove/update.

#### Scenario: List practices
- **WHEN** the user runs `pnpm agent practice list`
- **THEN** the CLI prints the current best-practices items

#### Scenario: Add practice
- **WHEN** the user runs `pnpm agent practice add "..."`
- **THEN** the CLI appends the new practice item to the file

#### Scenario: Remove practice
- **WHEN** the user runs `pnpm agent practice remove 3`
- **THEN** the CLI removes the third practice item

#### Scenario: Update practice
- **WHEN** the user runs `pnpm agent practice update 2 "..."`
- **THEN** the CLI replaces the second practice item with the new content
