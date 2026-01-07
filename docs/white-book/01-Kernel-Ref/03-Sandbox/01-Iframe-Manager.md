# 01. Iframe 管理 (Iframe Manager)

Code: `src/services/miniapp-runtime/iframe-manager.ts`

Iframe 是 DApp 的容器。KeyApp 对 Iframe 进行了深度的定制管理。

## 创建策略

*   **URL 构造**: 基础 URL + 上下文参数 (Context Params)。
*   **Sandbox**: 启用严格的沙箱模式：
    ```typescript
    iframe.sandbox.add('allow-scripts', 'allow-forms', 'allow-same-origin')
    ```
    注意：通常不开启 `allow-top-navigation`，防止 DApp 篡改主页面。

## 挂载策略

为了支持后台保活，KeyApp 使用了 **双容器策略**：

1.  **Visible Container**: 用于存放前台 Active 应用的 iframe。
2.  **Hidden Container**: 用于存放后台 Background 应用的 iframe。
    *   样式: `position: fixed; top: -9999px; visibility: hidden`。
    *   目的: 保持 DOM 节点存在，不触发 reload，但移出可视区域。

当应用在 前台/后台 切换时，我们只是简单地将 iframe 节点在两个容器之间 `appendChild` (移动节点)，而不是销毁重建。这保证了 DApp 状态不丢失。
