# BFM Pay (KeyApp) - CCCC Pair Project Context

## Overview

BFM Pay 是 mpay 的技术重构版本，目标是构建一个现代化的多链钱包移动应用。

## Documentation Index

| Document             | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `TDD.md`             | Technical Design Document - 架构设计、技术选型、实现方案 |
| `PDR.md`             | Product Requirements Document - 产品需求、功能规格       |
| `SERVICE-SPEC.md`    | Service Interface Specification - 服务接口定义           |
| `CLAUDE.md`          | AI Assistant Instructions - 项目级 AI 指导               |
| `openspec/AGENTS.md` | OpenSpec Workflow Guide - 变更管理流程                   |

## Reference Code

| Path       | Description                           |
| ---------- | ------------------------------------- |
| `../legacy-apps/apps/mpay/` | Original mpay codebase - 原始实现参考 |
| `src/`     | Current implementation - 当前代码实现 |

## Quick Commands

```bash
pnpm dev              # Development server
pnpm storybook        # Component playground
pnpm test             # Unit tests
pnpm lint             # Oxlint check
pnpm typecheck        # TypeScript check
pnpm build            # Production build
```

<!--/b 你是PeerB ，你现在需要继续引导 PeerA完成我们的工作。接下来的主要工作就是确保mpay的用户能平滑地升级迁移到我们的新版App上。
接下来的任务主要是两点：
1. 继续把用户故事实现，并确保有配套的e2e测试和截图
2. 完善我们的配色、国际化，确保应用达到产品级可用性-->

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
