# Change: Align agent help behavior with --help

## Why
当前 CLI 仍支持 `pnpm agent help` 且无参数时仅提示入口，而最新规范要求：帮助只能通过 `--help`，且 `pnpm agent` 无子命令时直接输出完整帮助内容。

## What Changes
- `pnpm agent` 无参数直接打印 `--help` 内容。
- 移除 `pnpm agent help` 入口，改为提示使用 `--help`。
- 同步相关文档与 CLI 使用说明。

## Impact
- Affected specs: agent-cli
- Affected code: scripts/agent/cli.ts, AGENTS.md (help 指引), CLAUDE.md (入口提示), docs/white-book/附录/H-开发规范/index.md
