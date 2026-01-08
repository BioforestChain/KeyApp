# 🧭 Book E1: The Manifesto (开发者手册)

> **KeyApp 开发者的第一站**。这里包含了项目的愿景、架构概览、技术栈清单以及核心的编码准则。

## 📖 目录

*   [01-Vision.md](./01-Vision.md) - **WebOS for Crypto**：为什么 KeyApp 不仅仅是一个钱包？
*   [02-Tech-Stack.md](./02-Tech-Stack.md) - 技术栈清单 (React 19, Vite, TanStack, Stackflow)
*   [03-Architecture.md](./03-Architecture.md) - 宏观架构图 (Kernel - Shell - Driver - App)
*   [04-Get-Started.md](./04-Get-Started.md) - 从零开始：环境搭建与启动
*   [05-Product-Vision.md](./05-Product-Vision.md) - **产品愿景**：让数字资产管理变得安全、简单
*   [05-Workflows.md](./05-Workflows.md) - AI 协作流 (Worktree, Spec Mode, PR)
*   [06-Guidelines.md](./06-Guidelines.md) - 编码规范 (Hooks, i18n, Comments)

## 🎯 核心原则

1.  **AI-Native**: 所有代码和文档的首要读者是 AI Agent。保持上下文清晰、原子化。
2.  **WebOS 架构**: 我们在浏览器中构建操作系统。理解 Kernel (运行时)、Driver (链适配) 和 Shell (界面) 的分离。
3.  **Spec First**: 先思考 (Spec Mode)，再行动。所有复杂变更必须先产出 Spec。
