# 02. 技术栈清单 (Tech Stack)

KeyApp 选用了最现代化的前端技术栈，以支撑 WebOS 的复杂性。

## Core Framework
*   **React 19**: 利用最新的 Hooks 和并发特性。
*   **Vite 6**: 极速构建工具，支持 ESM。
*   **TypeScript 5**: 严格类型安全。

## State Management
*   **TanStack Store**: 轻量级、原子化的全局状态管理 (替代 Redux/Zustand)。
*   **TanStack Query (v5)**: 异步数据管理，用于链上数据缓存和同步。

## Navigation & Shell
*   **Stackflow**: 仿原生 iOS/Android 的路由和页面栈管理。
    *   *Why?* React Router 无法提供原生 App 的页面堆叠和手势体验。

## UI System
*   **Tailwind CSS 4**: 原子化 CSS 引擎。
*   **shadcn/ui**: 基于 Radix UI 的可定制组件库。
*   **Framer Motion / Motion**: 负责复杂的 FLIP 动画和转场。

## Testing
*   **Vitest**: 单元测试 (兼容 Jest API)。
*   **Playwright**: 端到端 (E2E) 测试。

## Architecture Patterns
*   **Dependency Injection (DI)**: 通过 `context.tsx` 实现服务解耦。
*   **Adapter Pattern**: 用于多链适配 (`chain-adapter`)。
*   **Actor Model**: 用于 `miniapp-runtime` 的进程通信。
