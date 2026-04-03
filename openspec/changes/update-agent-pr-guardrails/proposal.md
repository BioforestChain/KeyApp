# Change: Agent PR guardrails (strict by default, loose override)

## Why
- 当前主分支出现大量泛化 commit（例如 "feat: complete implementation"），根因是工具链默认 PR 标题和提交信息过于宽松。
- Issue 未自动关闭，主要因为 PR body 缺少 `Closes #ID` 或未强制校验。

## What Changes
- **默认严格校验**：PR 标题必须符合 conventional commit 规范。
- **自动修正**：若不规范，自动生成规范化标题和 PR body（含 `Closes #ID`）。
- **宽松模式**：提供 `--loose` 允许跳过严格校验（但仍尽力修正）。

## Impact
- Affected specs: agent-workflow (new)
- Affected code:
  - `scripts/agent-flow/workflows/task.workflow.ts`
  - `scripts/agent-flow/mcps/git-workflow.mcp.ts`
  - CI (新增 PR title lint 逻辑)
