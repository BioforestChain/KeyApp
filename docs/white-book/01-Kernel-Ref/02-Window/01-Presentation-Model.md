<!--
Type: Reference
Area: Kernel
Code Source: src/services/miniapp-runtime/runtime-refs.ts
-->

# 01. 窗口模型 (Presentation Model)

KeyApp 的窗口管理器负责管理所有微应用在屏幕上的几何位置、层级 (Z-Order) 和动画上下文。它采用了 **Presentation-Desktop** 模型。

## 核心数据结构

### 1. Presentation (`MiniappPresentation`)

`Presentation` 是应用在视觉层的投影。一个应用可能有实例 (`MiniappInstance`) 但没有呈现（例如纯后台服务，虽然目前 KeyApp 尚未支持无头应用）。

```typescript
export interface MiniappPresentation {
  appId: string;
  
  /** 目标桌面 (stack | grid) */
  desktop: MiniappTargetDesktop;
  
  /** 视觉状态 (hidden | presenting | presented | dismissing) */
  state: MiniappPresentationState;
  
  /** Z 轴层级 */
  zOrder: number;
  
  /** 当前关联的过渡动画 ID */
  transitionId: string | null;
  
  /** 过渡类型 (present | dismiss) */
  transitionKind: MiniappTransitionKind | null;
}
```

### 2. Runtime Refs

为了实现高性能的 **FLIP 动画**，内核必须直接持有 DOM 元素的引用。这是通过 `runtime-refs.ts` 中的注册表实现的。

| 引用类型 | 获取函数 | 描述 |
| :--- | :--- | :--- |
| **IconRef** | `getIconRef(appId)` | 桌面图标元素。动画的起点/终点。 |
| **SlotRef** | `getDesktopAppSlotRef(desktop, appId)` | 窗口在桌面布局中的占位容器。 |
| **IframeRef** | `app.iframeRef` | 实际的内容载体。 |

## 窗口层级管理 (Z-Order Strategy)

KeyApp 使用简单的 **自增种子 (Incremental Seed)** 策略来管理窗口层级，模仿原生 OS 的行为。

1.  **全局种子**: Store 中维护一个 `zOrderSeed`，初始为 1。
2.  **聚焦 (Focus)**: 当应用被点击、激活或启动时，内核调用 `requestFocus(appId)`。
3.  **提升**: 
    *   `zOrderSeed` 自增 1。
    *   目标应用的 `presentation.zOrder` 被更新为新的种子值。
    *   这保证了该应用永远处于所有其他窗口之上。

```typescript
// src/services/miniapp-runtime/index.ts

export function requestFocus(appId: string): void {
  miniappRuntimeStore.setState((s) => {
    // ...
    const nextZ = s.zOrderSeed + 1
    // ...
    return {
      ...s,
      activeAppId: appId,
      zOrderSeed: nextZ, // 全局种子递增
    }
  })
}
```

## 桌面模式 (Desktops)

目前支持两种桌面模式：

1.  **Stack Desktop (默认)**:
    *   类似 iOS 的多任务堆叠视图。
    *   窗口全屏显示，支持手势滑动切换。
    *   适用于大多数 DApp。

2.  **Grid Desktop**:
    *   传统桌面网格布局。
    *   (预留) 支持小组件或悬浮窗模式。

## 视觉配置 (Visual Config)

窗口的外观可以通过 `MiniappVisualConfig` 进行系统级配置：

*   **胶囊 (Capsule)**: 这里的"胶囊"是指右上角的控制按钮（关闭、更多）。应用可以请求 `dark` 或 `light` 主题的胶囊以适配自身背景。
*   **圆角 (Radius)**: 窗口圆角半径。
*   **遮罩 (Mask)**: 背景遮罩的透明度。

这些配置不仅影响静态布局，也会参与 FLIP 动画的补间计算。
