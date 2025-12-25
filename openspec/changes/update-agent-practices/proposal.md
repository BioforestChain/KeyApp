# Change: Extract best practices and add practice subcommand

## Why
最佳实践需要独立文件并可由子命令管理（读取/添加/删除/修改），当前实践内容散落在 `readme` 输出和 00-必读中，无法结构化维护。

## What Changes
- 新增独立文件 `docs/white-book/00-必读/best-practices.md`。
- 新增 `pnpm agent practice` 子命令，支持 list/add/remove/update。
- `pnpm agent readme` 的最佳实践从文件读取。
- 更新白皮书索引与文档提示，引用新的最佳实践文件与命令。

## Impact
- Affected specs: agent-cli
- Affected code: scripts/agent/cli.ts, scripts/agent/readme.ts, scripts/agent/practice.ts (new), scripts/agent/utils.ts, docs/white-book/00-必读/index.md, docs/white-book/00-必读/best-practices.md, AGENTS.md
