# Change: Update release flow to be resumable and self-contained

## Why
当前 `pnpm release` 在主分支受保护时会中断，且后续步骤需要手动执行，导致 stable 资产与 GitHub Pages 的 `metadata.json` 不一致（例如仍停留在旧版本）。需要将“发布进度识别 + 自动衔接”内置到 release 流程，保证一次命令即可完成。

## What Changes
- 在 `pnpm release` 中加入发布进度识别（基于分支/PR/Tag/Release/gh-pages 版本），提供可恢复的流程。
- 当直推 main 失败时自动切换为 PR 模式，等待检查通过并合并，再自动触发 stable workflow。
- 将 gh-pages `dweb/metadata.json` 与目标版本的对齐检查加入 release 流程，确保 stable 资产跟随新版本。
- 提供 `pnpm release:resume` 命令，复用相同的原子化步骤以便恢复执行。

## Impact
- Affected specs: `release-workflow`
- Affected code: `scripts/release.ts`, `.github/workflows/cd.yml` (必要时), 新增 release 状态检测脚本
