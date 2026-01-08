# 00. 设计系统概览 (Overview)

Code: `src/styles/globals.css`, `tailwind.config.js`

KeyApp 使用了一套基于 **Tailwind CSS 4** 和 **CSS Variables** 的动态主题系统。

## 核心原则

1.  **Semantic Naming**: 不使用具体的颜色名 (e.g., `blue-500`)，而是使用语义名 (e.g., `primary`, `destructive`)。
2.  **Dark Mode First**: 设计系统原生支持深色模式。所有颜色 Token 都有对应的 `dark:` 变体（通过 CSS 变量自动处理）。
3.  **Mobile First**: 默认样式针对移动端，使用 `@md:` 等前缀适配桌面端。

## 技术栈

*   **Styling**: Tailwind CSS
*   **Component Base**: Radix UI (Headless)
*   **Component Lib**: shadcn/ui (Customized)
*   **Icons**: Tabler Icons
