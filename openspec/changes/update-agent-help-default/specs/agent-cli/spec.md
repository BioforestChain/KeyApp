## MODIFIED Requirements

### Requirement: Agent CLI subcommands
`pnpm agent` SHALL expose primary functions as subcommands (readme/roadmap/claim/done/create/stats/toc/chapter/epic/worktree) and provide usage help when requested.

#### Scenario: Default usage
- **WHEN** the user runs `pnpm agent` without arguments
- **THEN** the CLI prints the same help content as `pnpm agent --help`

#### Scenario: Help usage
- **WHEN** the user runs `pnpm agent --help`
- **THEN** the CLI prints subcommand usage说明

#### Scenario: Legacy help command
- **WHEN** the user runs `pnpm agent help`
- **THEN** the CLI exits with an explicit message to use `--help`
