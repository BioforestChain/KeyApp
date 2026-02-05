## 1. Implementation
- [ ] 1.1 梳理现有 `scripts/release.ts`/`scripts/build.ts` 的职责边界，确认可复用点与需要拆分的工具能力
- [ ] 1.2 设计 release 进度检测模型（基于版本号、release 分支、PR 状态、tag/release、gh-pages metadata 版本）
- [ ] 1.3 在 `scripts/release.ts` 增加进度检测与恢复逻辑（支持自动创建/更新 PR、等待 checks、自动合并）
- [ ] 1.4 增加 gh-pages `dweb/metadata.json` 对齐校验与自动触发 stable workflow
- [ ] 1.5 增加 `pnpm release:resume` 命令（复用 release 原子化步骤）
- [ ] 1.6 更新 README/文档说明新的 release 流程（白皮书或相关文档）
- [ ] 1.7 添加必要的测试或脚本自检（如 release 状态检测输出）
