# 02. 调度与保活 (Scheduling)

Code: `src/services/miniapp-runtime/iframe-manager.ts`

为了防止浏览器内存溢出，KeyApp 实现了一套简单的调度策略来管理后台应用。

## 后台限制 (Background Limit)

*   **最大后台数**: 默认为 **4** 个 (`MAX_BACKGROUND_IFRAMES`)。
*   **淘汰策略**: **LRU (Least Recently Used)**。当后台应用数量超过限制时，最久未使用的应用会被强行销毁。

## Watchdog 机制

为了防止应用在关闭过程中卡死（例如动画回调未触发），内核启动了一个 **Watchdog Timer**。
*   **超时时间**: 30秒 (`DISMISS_WATCHDOG_DELAY`)。
*   **行为**: 如果在超时后应用仍未完成关闭流程，Watchdog 会强制执行 `finalizeCloseApp` 进行资源清理。

## 准备阶段超时

在 `preparing` 阶段，内核会等待 DOM 元素（图标、插槽）就绪。为了防止无限等待：
*   **超时时间**: 2.5秒 (`PREPARING_TIMEOUT`)。
*   **行为**: 超时后自动取消启动，并提示用户错误信息。
