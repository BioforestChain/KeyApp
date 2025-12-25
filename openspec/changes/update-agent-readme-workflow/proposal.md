# Change: Update agent readme entrypoint and workflow guidance

## Why
新的 AI 使用规范要求通过子命令启动（`pnpm agent readme`），并提供多角色、多场景的完整工作流程。现有 AGENTS.md 仅覆盖单一程序员流程且入口仍指向 `pnpm agent`。

## What Changes
- 新增 `pnpm agent readme` 子命令作为 AI 启动入口。
- 调整 `pnpm agent` 默认行为为提示使用子命令。
- 重构 AGENTS.md：先说明元意识，再说明 agent 工具，再提供多角色/多场景工作流闭环。
- 同步相关文档与 CLI 帮助文本。

## Impact
- Affected specs: agent-cli
- Affected code: scripts/agent/cli.ts, scripts/agent/readme.ts (usage text), AGENTS.md, CLAUDE.md, docs/white-book/附录/H-开发规范/index.md
