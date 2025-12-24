## ADDED Requirements

### Requirement: Agent CLI subcommands
`pnpm agent` SHALL expose primary functions as subcommands (roadmap/claim/done/create/stats/toc/chapter/epic/worktree) and provide usage help when requested.

#### Scenario: Default usage
- **WHEN** the user runs `pnpm agent` without arguments
- **THEN** the CLI prints the agent index内容

#### Scenario: Help usage
- **WHEN** the user runs `pnpm agent --help` or `pnpm agent help`
- **THEN** the CLI prints subcommand usage说明

### Requirement: Worktree create workflow
`pnpm agent worktree create` SHALL create a new worktree under `.git-worktree/`, install dependencies, and copy `.env.local` from the repository root. The command MUST require `--branch` and print a detailed summary on success.

#### Scenario: Create worktree
- **WHEN** the user runs `pnpm agent worktree create issue-28 --branch feat/issue-28`
- **THEN** the worktree directory is created, dependencies are installed, and `.env.local` is copied into the new worktree

#### Scenario: Missing branch flag
- **WHEN** the user omits `--branch`
- **THEN** the command fails with an explicit error and does not proceed

#### Scenario: Missing env file
- **WHEN** `.env.local` does not exist in the repository root
- **THEN** the command fails with an explicit error and does not proceed

#### Scenario: Create summary
- **WHEN** worktree creation succeeds
- **THEN** the output includes worktree path, branch name, base reference, install result, env copy result, and next-step guidance

### Requirement: Worktree branch naming validation
`pnpm agent worktree create` SHALL reject branch names that do not start with an approved prefix (feat/, fix/, docs/, test/, refactor/, chore/, ci/, openspec/, release/).

#### Scenario: Invalid branch prefix
- **WHEN** the user provides a branch without an approved prefix
- **THEN** the command fails with an explicit error and does not proceed

### Requirement: Worktree delete safety
`pnpm agent worktree delete` SHALL verify whether the associated branch has an open or unmerged PR via `gh` and refuse deletion unless `--force` is provided.

#### Scenario: Delete with open PR
- **WHEN** a worktree’s branch has an open PR and the user runs delete without `--force`
- **THEN** the command stops with a warning and does not remove the worktree

#### Scenario: Forced delete
- **WHEN** the user runs delete with `--force`
- **THEN** the worktree is removed regardless of PR status

### Requirement: Worktree list visibility
`pnpm agent worktree list` SHALL enumerate worktrees under `.git-worktree` and display their branch, PR number, PR status, and CI/CD check status.

#### Scenario: List worktrees
- **WHEN** the user runs `pnpm agent worktree list`
- **THEN** the output includes each worktree path with branch name, PR number, PR status, and CI/CD check information
