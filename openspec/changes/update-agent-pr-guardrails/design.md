# Design: PR title guardrails and auto-close

## Overview
将 PR 标题规范与 Issue 关闭规则内化到 agent 工具链：默认严格校验，自动修正，必要时使用 `--loose` 放宽。

## Behavior
- **Strict (default):**
  - PR 标题必须匹配 conventional commit 格式。
  - 若不符合，自动生成并覆盖：`feat(<type>): <issue title>`。
  - PR body 必须包含 `Closes #<issueId>`。
- **Loose (`--loose`):**
  - 不阻断提交，但仍尝试修正 PR body 的 `Closes #ID`。

## Title Derivation
- `<type>` 来源：`type/<type>` label（fallback 为 `hybrid`）。
- `<issue title>` 来源：Issue 标题。

## CI Lint
- 增加 PR title lint（默认 strict），从 CI 阶段防止不规范 PR 被合并。

## Scope
- 仅作用于 `pnpm agent task start/submit` 与 PR 创建/更新。
