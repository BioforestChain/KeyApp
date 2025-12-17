# 第九章：导航系统

> 定义 Stackflow 导航配置

---

## 9.1 Stackflow 概述

### 什么是 Stackflow

Stackflow 是一个为移动优先应用设计的栈式导航库，提供：
- 原生 App 般的页面过渡动画
- 手势返回支持
- Activity 模式的参数传递
- URL 同步 (可选)

### 核心概念

| 概念 | 说明 |
|-----|------|
| Activity | 一个页面/屏幕，可以接收参数 |
| Stack | 页面栈，管理导航历史 |
| Plugin | 扩展功能（如 URL 同步） |

---

## 9.2 基础配置

### stackflow.ts

```typescript
// src/stackflow/stackflow.ts
import { stackflow } from '@stackflow/react'
import { basicRendererPlugin } from '@stackflow/plugin-renderer-basic'
import { basicUIPlugin } from '@stackflow/plugin-basic-ui'
import { historySyncPlugin } from '@stackflow/plugin-history-sync'

// Activity 导入
import { MainTabsActivity } from './activities/MainTabsActivity'
import { WalletDetailActivity } from './activities/WalletDetailActivity'
import { SendActivity } from './activities/SendActivity'
import { ReceiveActivity } from './activities/ReceiveActivity'
// ... 更多 Activity

export const { Stack, useFlow, activities } = stackflow({
  // 过渡动画时长
  transitionDuration: 270,
  
  // 插件
  plugins: [
    basicRendererPlugin(),
    basicUIPlugin({ theme: 'cupertino' }),
    historySyncPlugin({
      routes: {
        // Activity 与 URL 映射
        MainTabsActivity: '/',
        WalletDetailActivity: '/wallet/:walletId',
        SendActivity: '/send',
        ReceiveActivity: '/receive',
        TokenDetailActivity: '/token/:tokenId',
        SettingsActivity: '/settings',
        SettingsLanguageActivity: '/settings/language',
        SettingsCurrencyActivity: '/settings/currency',
        SettingsChainsActivity: '/settings/chains',
        WalletCreateActivity: '/wallet/create',
        WalletImportActivity: '/wallet/import',
        AuthorizeAddressActivity: '/authorize/address/:eventId',
        AuthorizeSignatureActivity: '/authorize/signature/:eventId',
      },
      fallbackActivity: () => 'MainTabsActivity',
      // 使用 hash 路由（兼容静态部署）
      useHash: true,
    }),
  ],
  
  // Activity 注册
  activities: {
    MainTabsActivity,
    WalletDetailActivity,
    SendActivity,
    ReceiveActivity,
    TokenDetailActivity,
    SettingsActivity,
    SettingsLanguageActivity,
    SettingsCurrencyActivity,
    SettingsChainsActivity,
    WalletCreateActivity,
    WalletImportActivity,
    AuthorizeAddressActivity,
    AuthorizeSignatureActivity,
  },
  
  // 初始 Activity
  initialActivity: () => 'MainTabsActivity',
})
```

---

## 9.3 Activity 定义

### Activity 结构

```typescript
// src/stackflow/activities/WalletDetailActivity.tsx
import type { ActivityComponentType } from '@stackflow/react'
import { AppScreen } from '@stackflow/plugin-basic-ui'
import { WalletDetailPage } from '@/pages/wallet/detail'

// 定义参数类型
type WalletDetailParams = {
  walletId: string
}

// Activity 组件
export const WalletDetailActivity: ActivityComponentType<WalletDetailParams> = ({
  params,
}) => {
  return (
    <AppScreen
      appBar={{
        title: '钱包详情',
        backButton: { render: () => <BackButton /> },
      }}
    >
      <WalletDetailPage walletId={params.walletId} />
    </AppScreen>
  )
}

// 设置 Activity 名称（用于调试）
WalletDetailActivity.displayName = 'WalletDetailActivity'
```

### Tab Activity

```typescript
// src/stackflow/activities/MainTabsActivity.tsx
import type { ActivityComponentType } from '@stackflow/react'
import { AppScreen } from '@stackflow/plugin-basic-ui'
import { TabBar } from '../components/TabBar'
import { HomePage } from '@/pages/home'
import { HistoryPage } from '@/pages/history'
import { SettingsPage } from '@/pages/settings'

type TabType = 'home' | 'history' | 'settings'

export const MainTabsActivity: ActivityComponentType = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home')
  
  return (
    <AppScreen appBar={null}>
      <div className="flex-1 overflow-auto">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'history' && <HistoryPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </AppScreen>
  )
}
```

---

## 9.4 导航 Hooks

### useFlow

```typescript
// 原生 Stackflow 导航
import { useFlow } from '@/stackflow'

function MyComponent() {
  const { push, pop, replace } = useFlow()
  
  // Push 新页面
  const goToWallet = () => {
    push('WalletDetailActivity', { walletId: '123' })
  }
  
  // 返回上一页
  const goBack = () => {
    pop()
  }
  
  // 替换当前页面
  const replaceTo = () => {
    replace('SendActivity', {})
  }
}
```

### useNavigation (兼容层)

为了便于从 TanStack Router 迁移，提供兼容 API：

```typescript
// src/stackflow/hooks/use-navigation.ts
import { useFlow } from '../stackflow'

export function useNavigation() {
  const { push, pop, replace } = useFlow()
  
  return {
    navigate: ({ to, search, replace: shouldReplace }) => {
      // 根据 path 映射到 Activity
      const activity = pathToActivity(to)
      const params = search ?? {}
      
      if (shouldReplace) {
        replace(activity, params)
      } else {
        push(activity, params)
      }
    },
    goBack: () => pop(),
  }
}
```

### useActivityParams

```typescript
// src/stackflow/hooks/use-activity-params.ts
import { useActivityParams as useStackflowParams } from '@stackflow/react'

export function useActivityParams<T>(): T {
  return useStackflowParams() as T
}

// 使用
function WalletDetailPage() {
  const { walletId } = useActivityParams<{ walletId: string }>()
  // ...
}
```

---

## 9.5 页面组件组织

### Activity vs Page 分离

```
src/
├── stackflow/
│   └── activities/
│       └── WalletDetailActivity.tsx    # Activity 包装
│
└── pages/
    └── wallet/
        └── detail/
            └── index.tsx               # 页面组件
```

**Activity 职责**：
- 定义 AppScreen 配置（标题、返回按钮）
- 接收参数，传递给 Page
- 处理导航相关逻辑

**Page 职责**：
- 渲染页面内容
- 处理业务逻辑
- 可独立测试

### 示例

```typescript
// Activity - 只负责包装
export const WalletDetailActivity: ActivityComponentType<Params> = ({ params }) => (
  <AppScreen appBar={{ title: '钱包详情' }}>
    <WalletDetailPage walletId={params.walletId} />
  </AppScreen>
)

// Page - 负责内容
export function WalletDetailPage({ walletId }: Props) {
  const { data: wallet } = useWallet(walletId)
  
  return (
    <div>
      <WalletCard wallet={wallet} />
      <AddressList addresses={wallet.addresses} />
    </div>
  )
}
```

---

## 9.6 URL 同步

### Hash 路由

使用 hash 路由以兼容静态部署（GitHub Pages 等）：

```typescript
historySyncPlugin({
  useHash: true,  // ← 启用 hash 路由
  routes: { ... },
})
```

URL 格式：
```
https://example.com/#/wallet/123
https://example.com/#/send
https://example.com/#/settings/language
```

### 路由参数

```typescript
// 定义
routes: {
  WalletDetailActivity: '/wallet/:walletId',
  TokenDetailActivity: '/token/:tokenId',
  AuthorizeAddressActivity: '/authorize/address/:eventId',
}

// URL 示例
/#/wallet/abc123          → { walletId: 'abc123' }
/#/token/usdt             → { tokenId: 'usdt' }
/#/authorize/address/evt1 → { eventId: 'evt1' }
```

### Query 参数

```typescript
// 通过 search 传递额外参数
push('AuthorizeSignatureActivity', {
  eventId: 'evt1',
  signaturedata: '...',  // 会编码到 URL search
})

// URL: /#/authorize/signature/evt1?signaturedata=...
```

---

## 9.7 过渡动画

### 内置动画

Stackflow 提供两种主题：
- `cupertino`：iOS 风格（从右滑入）
- `android`：Android 风格（从底部滑入）

```typescript
basicUIPlugin({ theme: 'cupertino' })
```

### 手势返回

在移动端自动启用，用户可以从屏幕左边缘向右滑动返回。

### 自定义动画

```typescript
// 自定义过渡动画
transitionDuration: 270,  // 动画时长 (ms)
```

---

## 9.8 最佳实践

### 1. Activity 命名规范

```
{功能名}Activity

示例：
- WalletDetailActivity
- SendActivity
- SettingsLanguageActivity
```

### 2. 参数类型定义

```typescript
// 始终定义参数类型
type SendParams = {
  tokenId?: string
  toAddress?: string
  amount?: string
}

export const SendActivity: ActivityComponentType<SendParams> = ({ params }) => {
  // ...
}
```

### 3. 导航封装

```typescript
// 封装常用导航操作
export function useWalletNavigation() {
  const { push } = useFlow()
  
  return {
    goToWallet: (walletId: string) => {
      push('WalletDetailActivity', { walletId })
    },
    goToSend: (tokenId?: string) => {
      push('SendActivity', { tokenId })
    },
    goToReceive: () => {
      push('ReceiveActivity', {})
    },
  }
}
```

---

## 本章小结

- Stackflow 提供栈式导航，适合移动优先应用
- Activity 定义页面入口，Page 定义页面内容
- historySyncPlugin 实现 URL 同步
- 使用 hash 路由兼容静态部署
- 手势返回和过渡动画提升用户体验

---

## 下一章

继续阅读 [第十章：状态管理](../04-状态管理/)，了解 TanStack Store/Query 使用。
