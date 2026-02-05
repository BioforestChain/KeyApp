## Context
release 流程由 `scripts/release.ts` 负责编排，构建与发布细节已在 `scripts/build.ts` 中实现（web/dweb 构建、gh-pages 准备、release 产物与上传）。当前脚本在主分支受保护时中断，之后需要人工创建 PR、等待检查、合并、触发 stable workflow，导致流程不可重复、不可恢复。

## Goals / Non-Goals
- Goals:
  - 在保持现有 `scripts/release.ts`/`scripts/build.ts` 架构的前提下拆分工具脚本，`pnpm release` 只负责编排。
  - `pnpm release` 可识别当前发布进度并自动继续。
  - 主分支受保护时自动转为 PR 模式，合并后继续触发 stable workflow。
  - gh-pages 上 `dweb/metadata.json` 与目标版本一致。
- Non-Goals:
  - 不改变构建产物格式。
  - 不引入新的外部服务依赖。

## Decisions
- Decision: 以“版本号 + GitHub 状态”为核心的状态机，复用现有 build 工具，不重复实现构建/上传细节。
  - 通过 `package.json` 版本、`release/vX` 分支、PR 状态、tag/release 存在性、gh-pages metadata 版本进行阶段识别。
- Decision: 在 PR 模式下使用 gh CLI 自动等待 checks 并合并。
- Decision: 将 stable workflow 触发和 gh-pages metadata 校验纳入 release 流程。
- Decision: 将 release 逻辑拆分为多个工具文件（状态检测、PR 管理、workflow 触发、gh-pages 校验），由 `scripts/release.ts` 编排。
- Decision: 同时提供 `pnpm release:resume`，复用与 `pnpm release` 相同的原子化步骤实现（共享同一套工具函数）。 

## Risks / Trade-offs
- 依赖 gh CLI：需要明确提示缺失时的降级行为。
- 自动合并需要权限：无权限时需中断并提示手动合并。

## Migration Plan
1. 先更新 release 脚本并在测试仓库验证。
2. 在 CI 中验证 gh-pages metadata 版本同步。
3. 文档更新后推广为默认 release 方式。

## Open Questions
- 是否需要单独的 `pnpm release:resume` 命令，还是统一在 `pnpm release` 中自动识别？
