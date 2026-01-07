# 01. 窗口模型 (Presentation Model)

Code: `src/services/miniapp-runtime/runtime-refs.ts`

KeyApp 支持多窗口管理，每个窗口由一个 `MiniappPresentation` 对象描述。

## 核心概念

### 1. Presentation
描述了一个应用在屏幕上的呈现状态：
*   `state`: `hidden` | `presenting` | `presented` | `dismissing`
*   `desktop`: 目标桌面 (`stack` | `grid`)。大多数 DApp 运行在 `stack` 桌面。
*   `zOrder`: Z 轴层级。激活的应用会自动获得最高的 `zOrder`。

### 2. Runtime Refs
为了实现精细的动画控制，内核维护了一组 DOM 引用 (`runtime-refs`)：
*   `IconRef`: 桌面图标的 DOM 元素。
*   `SlotRef`: 应用窗口的目标容器位置。
*   `IframeRef`: 实际的内容载体。

## 窗口层级管理 (Z-Order)

内核维护一个全局递增的 `zOrderSeed`。
*   每当应用被激活 (`activateApp`) 或请求聚焦 (`requestFocus`)，它会被分配 `zOrderSeed + 1`。
*   这确保了当前操作的应用总是覆盖在其他应用之上。
