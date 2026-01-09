# MiniApp Runtime Service

> Source: [src/services/miniapp-runtime/](https://github.com/BioforestChain/KeyApp/tree/main/src/services/miniapp-runtime)

## 概览

`miniapp-runtime` 是小程序的"微型操作系统内核"，管理小程序的生命周期、iframe 渲染和动画系统。

---

## 文件结构

```
miniapp-runtime/
├── types.ts              # 类型定义 (180 行)
├── index.ts              # 核心 Store + Actions (932 行)
├── hooks.ts              # React Hooks
├── iframe-manager.ts     # iframe 生命周期管理
├── runtime-refs.ts       # DOM Ref 管理
├── visual-config.ts      # 视觉/动画配置
├── MiniappVisualProvider.tsx  # Context Provider
├── miniapp-launch-motion.stories.tsx
└── motion-experiment.stories.tsx
```

---

## 核心概念

### MiniappState (应用状态)

```typescript
type MiniappState = 
  | 'preparing'   // 准备中 (加载 manifest)
  | 'launching'   // 启动中 (创建 iframe)
  | 'splash'      // 显示启动画面
  | 'active'      // 活跃 (前台运行)
  | 'background'  // 后台运行
  | 'closing'     // 关闭中
  | 'closed'      // 已关闭
```

### MiniappFlow (动画流向)

```typescript
type MiniappFlow =
  | 'opening'        // 打开动画
  | 'splash'         // 启动画面
  | 'opened'         // 打开完成
  | 'backgrounding'  // 进入后台
  | 'foregrounding'  // 返回前台
  | 'closing'        // 关闭动画
  | 'closed'         // 关闭完成
  | 'stacked'        // 进入堆叠视图
  | 'unstacked'      // 退出堆叠视图
```

### MiniappInstance (应用实例)

```typescript
interface MiniappInstance {
  appId: string
  manifest: MiniappManifest
  state: MiniappState
  flow: MiniappFlow
  zOrder: number              // 堆叠顺序
  iframeRef: HTMLIFrameElement | null
  readinessState: MiniappReadinessState
  processStatus: MiniappProcessStatus
  launchedAt: number
  lastActiveAt: number
}
```

---

## Store 结构

```typescript
interface MiniappRuntimeState {
  apps: Map<string, MiniappInstance>
  visualConfig: MiniappVisualConfig
  activeAppId: string | null      // 当前活跃的 appId
  focusedAppId: string | null     // 当前聚焦的 appId
  presentations: Map<string, MiniappPresentation>
  zOrderSeed: number
  isStackViewOpen: boolean
  maxBackgroundApps: number       // 后台应用数量限制
}
```

---

## 核心 Actions

### 应用启动

```typescript
// 启动小程序
function launchApp(manifest: MiniappManifest, target?: MiniappTargetDesktop): void

// 内部流程:
// 1. 检查是否已存在
// 2. 创建 MiniappInstance
// 3. 创建 iframe
// 4. 注入 BioProvider bridge
// 5. 触发 splash 动画
// 6. 等待 iframe 就绪
// 7. 切换到 active 状态
```

### 应用切换

```typescript
// 激活应用 (从后台切换到前台)
function activateApp(appId: string): void

// 将应用移至后台
function backgroundApp(appId: string): void

// 聚焦应用
function focusApp(appId: string): void
```

### 应用关闭

```typescript
// 请求关闭 (触发动画)
function requestDismiss(appId: string): void

// 关闭完成回调
function didDismiss(appId: string): void

// 强制关闭所有
function closeAllApps(): void
```

### Splash 控制

```typescript
// 请求关闭启动画面
function requestDismissSplash(appId: string): void
```

### 堆叠视图

```typescript
// 打开堆叠视图 (应用切换器)
function openStackView(): void

// 关闭堆叠视图
function closeStackView(): void
```

---

## iframe 管理

```typescript
// iframe-manager.ts

// 创建 iframe
function createIframe(appId: string, src: string): HTMLIFrameElement

// 挂载并显示
function mountIframeVisible(iframe: HTMLIFrameElement, container: HTMLElement): void

// 移至后台 (隐藏但保持运行)
function moveIframeToBackground(iframe: HTMLIFrameElement): void

// 移至前台
function moveIframeToForeground(iframe: HTMLIFrameElement): void

// 移除 iframe
function removeIframe(iframe: HTMLIFrameElement): void

// 强制限制后台数量
function enforceBackgroundLimit(maxApps: number): void

// 清理所有
function cleanupAllIframes(): void
```

---

## DOM Ref 管理

```typescript
// runtime-refs.ts

// 注册 refs
function registerIconRef(appId: string, ref: HTMLElement): void
function registerWindowRef(appId: string, ref: HTMLElement): void
function registerSplashBgRef(appId: string, ref: HTMLElement): void
function registerSplashIconRef(appId: string, ref: HTMLElement): void
function registerDesktopAppSlotRef(appId: string, ref: HTMLElement): void

// 获取 refs
function getIconRef(appId: string): HTMLElement | null
function getWindowRef(appId: string): HTMLElement | null
function getDesktopAppSlotRect(appId: string): DOMRect | null

// Slot 状态订阅
function subscribeSlotStatus(appId: string, callback: (status: SlotStatus) => void): () => void
```

---

## 视觉配置

```typescript
interface MiniappVisualConfig {
  motion: {
    timeScale: number          // 动画速度倍率
    splashDuration: number     // 启动画面持续时间
    openDuration: number       // 打开动画时长
    closeDuration: number      // 关闭动画时长
  }
  layout: {
    windowRadius: number       // 窗口圆角
    capsuleHeight: number      // 胶囊栏高度
  }
}

// 修改配置
function setMiniappVisualConfig(update: MiniappVisualConfigUpdate): void
function setMiniappMotionTimeScale(timeScale: number): void
function resetMiniappVisualConfig(): void
```

---

## 生命周期流程

```
┌─────────────┐
│  launchApp  │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  preparing  │────▶│  launching  │
└─────────────┘     └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   splash    │ (显示启动画面)
                    └──────┬──────┘
                           │ (iframe 加载完成 / 超时)
                           ▼
                    ┌─────────────┐
              ┌────▶│   active    │◀────┐
              │     └──────┬──────┘     │
              │            │            │
              │            ▼            │
              │     ┌─────────────┐     │
              │     │ background  │─────┘
              │     └──────┬──────┘ (activateApp)
              │            │
(relaunch)    │            ▼
              │     ┌─────────────┐
              └─────│   closing   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   closed    │
                    └─────────────┘
```

---

## 与 Ecosystem Bridge 集成

```typescript
// 启动时自动注入 BioProvider
function attachBioProvider(appId: string): void {
  const app = miniappRuntimeStore.state.apps.get(appId);
  const iframe = app?.iframeRef;
  if (!app || !iframe) return;
  
  getBridge().attach(
    iframe,
    appId,
    app.manifest.name,
    app.manifest.permissions ?? []
  );
}
```

---

## React Hooks

```typescript
// 恢复可见性 (用于 Popover 等场景)
function useMiniappVisibilityRestore(appId: string): void

// 监听 Slot 状态
function useSlotStatus(appId: string): SlotStatus
```

---

## Selectors

```typescript
const miniappRuntimeSelectors = {
  getApp: (appId: string) => (state) => state.apps.get(appId),
  getActiveApp: (state) => state.apps.get(state.activeAppId),
  getFocusedAppId: (state) => state.focusedAppId,
  getPresentations: (state) => Array.from(state.presentations.values()),
  getVisualConfig: (state) => state.visualConfig,
  isStackViewOpen: (state) => state.isStackViewOpen,
}
```

---

## 相关文档

- [Ecosystem Components](../../03-UI-Ref/04-Domain/04-Ecosystem.md)
- [PostMessage Bridge](./02-Ecosystem.md)
- [Authorize Service](../08-Authorize/01-PlaocAdapter.md)
