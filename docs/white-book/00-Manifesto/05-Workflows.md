# 05. 开发工作流 (Workflows)

为了保证代码质量和 AI 协作的高效性，我们强制执行以下工作流。

## 1. Git Worktree 模式
永远不要在主目录直接开发。必须为每个任务创建一个独立的 worktree：

```bash
pnpm agent worktree create fix-bug-123 --branch fix/issue-123 --base main
cd .git-worktree/fix-bug-123
```

这保证了环境的隔离性，避免了 `node_modules` 污染和分支切换的开销。

## 2. Spec Mode (规划优先)
在开始编码之前，AI 必须进入 **Spec Mode**，撰写详细的实现计划。只有用户批准 Spec 后，才能退出 Spec Mode 开始写代码。

## 3. Pull Request 规范
*   **Title**: 遵循 Conventional Commits (e.g., `feat(wallet): add multi-chain support`).
*   **Body**: 清晰描述 Changes, Reason, 和 Test Plan。
*   **Review**: 所有 PR 必须经过 CI 检查并通过 Review 才能合并。

## 4. CD 流程
*   **gh-pages**: 我们使用 `gh-pages` 分支托管预览版。CD 流程会自动 force-push 构建产物到该分支。
