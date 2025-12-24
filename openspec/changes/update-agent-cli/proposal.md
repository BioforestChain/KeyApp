# Change: Update agent CLI subcommands and worktree workflow

## Why
当前 `pnpm agent` 仍以 flag 方式组织功能，命令结构可读性和可扩展性不足，同时缺少统一的 worktree 管理入口。

## What Changes
- 将 `pnpm agent` 主要功能调整为子命令形式（roadmap/claim/done/create/stats/toc/chapter/epic/worktree）。
- 新增 `pnpm agent worktree` 子命令，支持 create/delete/list，并联动依赖安装与 `.env.local` 同步。
- worktree list 输出包含 PR 编号、状态与 CI/CD 检查概况；create 缺失 `.env.local` 时直接失败。
- worktree create 对分支前缀进行严格校验，避免不符合规范的命名。
- 更新 AGENTS.md 与白皮书中与 agent/worktree 相关的工作流指引。

## Impact
- Affected specs: agent-cli (new)
- Affected code: scripts/agent/cli.ts, scripts/agent/readme.ts, scripts/agent/roadmap.ts, scripts/agent/whitebook.ts (usage text), AGENTS.md, docs/white-book/附录/H-开发规范/index.md
