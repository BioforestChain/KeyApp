# BFM Pay (KeyApp) - Project Context

## Overview

BFM Pay 是 mpay 的技术重构版本，目标是构建一个现代化的多链钱包移动应用。

## Documentation Index

| Document             | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `docs/white-book/`   | 软件开发说明书（白皮书）- 完整技术文档                    |
| `CLAUDE.md`          | AI Assistant Instructions - 项目级 AI 指导               |
| `openspec/AGENTS.md` | OpenSpec Workflow Guide - 变更管理流程                   |

### 白皮书结构

| 章节 | 内容 |
|-----|------|
| `01-产品篇` | 产品愿景、用户画像、用户故事 |
| `02-设计篇` | 交互设计、视觉设计、设计原则 |
| `03-架构篇` | 技术选型、系统架构、导航系统、状态管理 |
| `04-服务篇` | 服务架构、链服务接口、平台服务 |
| `05-组件篇` | 基础组件、通用组件、钱包组件、布局组件 |
| `06-安全篇` | 密钥管理、身份认证、DWEB授权 |
| `07-国际化篇` | 多语言支持、本地化规范 |
| `08-测试篇` | 测试策略、Vitest/Playwright配置 |
| `09-部署篇` | 构建配置、发布流程、数据迁移 |
| `附录` | 术语表、链网络列表、mpay迁移指南、API参考 |

## Reference Code

| Path                        | Description                           |
| --------------------------- | ------------------------------------- |
| `../legacy-apps/apps/mpay/` | Original mpay codebase - 原始实现参考 |
| `src/`                      | Current implementation - 当前代码实现 |

## Quick Commands

```bash
pnpm dev              # Development server
pnpm storybook        # Component playground
pnpm test             # Unit tests
pnpm lint             # Oxlint check
pnpm typecheck        # TypeScript check
pnpm build            # Production build
```

## 开发工作流

**重要：任何开发任务开始前，必须按以下顺序执行：**

1. **更新白皮书** - 如果需要新增功能或修改现有设计，先更新 `docs/white-book/` 对应章节
2. **创建 openspec change** - 基于白皮书内容，创建具体的变更提案
3. **创建 Git Worktree** - 在 `.git-worktree/` 下创建独立工作目录
4. **开始编码** - 在 worktree 中根据 openspec 的 tasks.md 执行开发

### Git Worktree 命令

```bash
# 创建 worktree
git worktree add .git-worktree/<feature-name> -b <branch-name>

# 进入开发
cd .git-worktree/<feature-name>
pnpm install

# 完成后合并
cd ../..
git merge --no-ff <branch-name>

# 清理
git worktree remove .git-worktree/<feature-name>
```

## 职责

1. PeerB主要负责编写计划与规范、代码审查、响应用户提出的问题和需求（包括收集并处理github-issues）
2. PeerA主要负责编程（包括文档项目的编程也是PeerA负责）、向上管理（向PeerB提出意见和建议，因为PeerB虽然也会读代码，但是并不做具体的测试和深入调查）
   1. PeerA 也可以自己创建 openspec-change 并完成它，但它必须经过 PeerB 的同意，这也是向上管理的方式之一

## 协作方式

1. PeerB负责管理openspec-change（生成 与 归档），然后委派给PeerA来进行编码，然后PeerA开始工作，不停向B汇报工作进度，从而B自己不停调整工作内容。
2. 之后PeerA完成工作进度后，由PeerB审核PeerA的代码，然后检查 openspec-change，如果全部完成就archive。形成一种循环。
3. 最后的代码提交也是PeerB来做。提交代码的时候，PeerA不要去写代码工作，否则可能导致提交冲突。但是PeerA可以去为下一个工作去做调研。
   - commit到了一定的程度，如果PeerB觉得当前的代码值得发布出来，那么就执行git-push。因为github-actions会自动执行编译出代码
   - 代码提交，必须使用 codex-cli 来提交:`codex exec --yolo --config model_reasoning_effort="low" [PROMPT]`通过提示词，委托提交任务给codex
4. 为了避免过度开发，PeerA必须审查是否出现意义重复的 组件、服务、页面，并提出重构方案，确保代码的质量高效可靠，符合工程师直觉
5. PeerB空闲的时候，需要不停挖掘项目的潜在问题，去解决 4. 提到的问题
