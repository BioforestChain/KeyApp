# Ecosystem 组件

> 源码: [`src/components/ecosystem/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/ecosystem/)

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| `EcosystemDesktop` | `ecosystem-desktop.tsx` | 生态桌面 |
| `EcosystemTabIndicator` | `ecosystem-tab-indicator.tsx` | Tab 指示器 |
| `DiscoverPage` | `discover-page.tsx` | 发现页 |
| `MyAppsPage` | `my-apps-page.tsx` | 我的应用 |
| `AppStackPage` | `app-stack-page.tsx` | 应用堆栈 |
| `MiniappIcon` | `miniapp-icon.tsx` | MiniApp 图标 |
| `MiniappCapsule` | `miniapp-capsule.tsx` | MiniApp 胶囊 |
| `MiniappWindow` | `miniapp-window.tsx` | MiniApp 窗口 |
| `MiniappWindowStack` | `miniapp-window-stack.tsx` | 窗口堆栈 |
| `MiniappStackCard` | `miniapp-stack-card.tsx` | 堆栈卡片 |
| `MiniappStackView` | `miniapp-stack-view.tsx` | 堆栈视图 |
| `MiniappSplashScreen` | `miniapp-splash-screen.tsx` | 启动屏 |
| `MiniappSheetHeader` | `miniapp-sheet-header.tsx` | Sheet 头部 |
| `IosSearchCapsule` | `ios-search-capsule.tsx` | iOS 搜索胶囊 |
| `IosWallpaper` | `ios-wallpaper.tsx` | iOS 壁纸 |

---

## EcosystemDesktop

MiniApp 生态系统桌面，iOS 风格布局。

### Props

```typescript
interface EcosystemDesktopProps {
  apps: MiniApp[]
  runningApps: string[]
  onAppClick: (app: MiniApp) => void
  onAppLongPress?: (app: MiniApp) => void
  className?: string
}
```

### 子页面

| 页面 | 索引 | 说明 |
|------|------|------|
| `discover` | 0 | 发现 - 应用市场 |
| `mine` | 1 | 我的 - 已安装应用 |
| `stack` | 2 | 堆栈 - 运行中应用 |

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ [搜索]                                      │
│─────────────────────────────────────────────│
│                                             │
│  [App1]  [App2]  [App3]  [App4]            │
│                                             │
│  [App5]  [App6]  [App7]  [App8]            │
│                                             │
│─────────────────────────────────────────────│
│      ●      ○      ○                        │
│   发现    我的    堆栈                      │
└─────────────────────────────────────────────┘
```

---

## MiniappIcon

MiniApp 图标组件。

### Props

```typescript
interface MiniappIconProps {
  app: MiniApp
  size?: 'sm' | 'md' | 'lg'
  showBadge?: boolean
  showName?: boolean
  onClick?: () => void
  onLongPress?: () => void
  className?: string
}
```

### 渲染结构

```
┌─────────┐
│  [🔷]   │
│         │
│  Name   │
└─────────┘
```

---

## MiniappWindow

MiniApp 运行窗口，包含 iframe 和控制栏。

### Props

```typescript
interface MiniappWindowProps {
  app: MiniApp
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onFullscreen?: () => void
  className?: string
}
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ [🔷] App Name                    [−] [✗]   │
│─────────────────────────────────────────────│
│                                             │
│              <iframe>                       │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## MiniappSplashScreen

MiniApp 启动屏，显示加载动画。

### Props

```typescript
interface MiniappSplashScreenProps {
  app: MiniApp
  progress?: number
  status?: 'loading' | 'ready' | 'error'
  errorMessage?: string
  onRetry?: () => void
  className?: string
}
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│              [🔷]                           │
│            App Name                         │
│                                             │
│        ████████░░░░░░░░░░  60%              │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## MiniappWindowStack

多窗口堆栈管理。

### Props

```typescript
interface MiniappWindowStackProps {
  windows: Array<{ app: MiniApp; id: string }>
  activeWindowId: string
  onWindowActivate: (id: string) => void
  onWindowClose: (id: string) => void
  className?: string
}
```

### 功能

- 窗口层叠显示
- 点击切换活动窗口
- 拖拽排序
- 滑动关闭

---

## MiniappStackCard

应用堆栈卡片 (任务管理器视图)。

### Props

```typescript
interface MiniappStackCardProps {
  app: MiniApp
  screenshot?: string
  isActive?: boolean
  onClick: () => void
  onClose: () => void
  className?: string
}
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ [Screenshot Preview]                   [✗] │
│                                             │
│ [🔷] App Name                               │
└─────────────────────────────────────────────┘
```

---

## IosSearchCapsule

iOS 风格搜索胶囊。

```tsx
<IosSearchCapsule
  placeholder="搜索应用"
  value={search}
  onChange={setSearch}
/>
```

---

## IosWallpaper

iOS 风格动态壁纸背景。

```tsx
<IosWallpaper variant="gradient" blur={20} />
```

---

## 生态系统架构

```
EcosystemDesktop
    │
    ├── IosWallpaper (背景)
    │
    ├── IosSearchCapsule (搜索)
    │
    ├── Swiper
    │   ├── DiscoverPage (发现)
    │   │   └── MiniappIcon[]
    │   │
    │   ├── MyAppsPage (我的)
    │   │   └── MiniappIcon[]
    │   │
    │   └── AppStackPage (堆栈)
    │       └── MiniappStackCard[]
    │
    ├── EcosystemTabIndicator (底部 Tab)
    │
    └── MiniappWindowStack (运行窗口)
        └── MiniappWindow[]
            └── iframe + MiniappSheetHeader
```
