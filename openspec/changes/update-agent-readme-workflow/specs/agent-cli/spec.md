## MODIFIED Requirements

### Requirement: Agent CLI subcommands
`pnpm agent` SHALL expose primary functions as subcommands (readme/roadmap/claim/done/create/stats/toc/chapter/epic/worktree) and provide usage help when requested.

#### Scenario: Default usage
- **WHEN** the user runs `pnpm agent` without arguments
- **THEN** the CLI prints a short help message that points to `pnpm agent readme`

#### Scenario: Readme usage
- **WHEN** the user runs `pnpm agent readme`
- **THEN** the CLI prints the agent index内容

#### Scenario: Help usage
- **WHEN** the user runs `pnpm agent --help` or `pnpm agent help`
- **THEN** the CLI prints subcommand usage说明
