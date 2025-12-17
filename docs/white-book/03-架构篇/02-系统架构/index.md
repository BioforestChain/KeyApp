# 第八章：系统架构

> 定义分层架构和模块划分

---

## 8.1 分层架构

```
┌──────────────────────────────────────────────────────────────┐
│                      UI Layer (React)                         │
│               Stackflow + Components + Pages                  │
├──────────────────────────────────────────────────────────────┤
│                    State Layer                                │
│        TanStack Store (Client) + TanStack Query (Server)      │
├──────────────────────────────────────────────────────────────┤
│                   Service Layer                               │
│         Chain Adapters + Platform Services + Utils            │
├──────────────────────────────────────────────────────────────┤
│                   Platform Layer                              │
│              Web APIs / DWEB (Plaoc) Plugins                  │
└──────────────────────────────────────────────────────────────┘
```

### 各层职责

| 层 | 职责 | 示例 |
|---|------|------|
| UI Layer | 界面渲染、用户交互 | 页面组件、表单、列表 |
| State Layer | 状态管理、数据缓存 | 钱包状态、余额缓存 |
| Service Layer | 业务逻辑、链交互 | 转账、签名、余额查询 |
| Platform Layer | 平台能力抽象 | 存储、生物识别、剪贴板 |

---

## 8.2 目录结构

```
src/
├── stackflow/                  # 导航系统
│   ├── activities/             # Activity 定义
│   ├── components/             # 导航组件 (TabBar)
│   ├── hooks/                  # 导航 Hooks
│   └── stackflow.ts            # Stackflow 配置
│
├── pages/                      # 页面组件
│   ├── home/                   # 首页
│   ├── wallet/                 # 钱包相关
│   ├── send/                   # 发送
│   ├── receive/                # 收款
│   ├── settings/               # 设置
│   └── authorize/              # DWEB 授权
│
├── components/                 # 通用组件
│   ├── ui/                     # shadcn/ui 组件
│   ├── common/                 # 业务通用组件
│   ├── wallet/                 # 钱包相关组件
│   └── layout/                 # 布局组件
│
├── stores/                     # TanStack Store
│   ├── wallet.ts               # 钱包状态
│   ├── preferences.ts          # 用户偏好
│   └── ui.ts                   # UI 状态
│
├── services/                   # 服务层
│   ├── adapters/               # 链适配器
│   ├── platform/               # 平台服务
│   └── utils/                  # 工具函数
│
├── hooks/                      # 通用 Hooks
├── i18n/                       # 国际化
├── lib/                        # 库封装
│   ├── crypto/                 # 加密相关
│   └── utils/                  # 工具函数
│
├── styles/                     # 全局样式
│   └── globals.css
│
├── main.tsx                    # 入口文件
└── StackflowApp.tsx            # App 根组件
```

---

## 8.3 模块依赖关系

```
                    ┌─────────────┐
                    │    main     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ StackflowApp│
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
│   stackflow   │ │    stores     │ │   services    │
│  (activities) │ │   (state)     │ │   (logic)     │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                  │
        │         ┌───────▼───────┐          │
        │         │    hooks      │          │
        │         └───────────────┘          │
        │                                    │
┌───────▼───────────────────────────────────▼───────┐
│                    pages                           │
└───────────────────────┬───────────────────────────┘
                        │
            ┌───────────▼───────────┐
            │      components       │
            └───────────────────────┘
```

### 依赖规则

1. **单向依赖**：上层可以依赖下层，下层不能依赖上层
2. **同层隔离**：同层模块尽量不相互依赖
3. **抽象接口**：通过接口而非实现依赖

---

## 8.4 关键模块设计

### Stackflow 模块

```
stackflow/
├── stackflow.ts           # 核心配置
│   └── 定义 activities、routes、plugins
│
├── activities/            # Activity 定义
│   ├── tabs/              # Tab 页面
│   │   ├── HomeTab.tsx
│   │   ├── HistoryTab.tsx
│   │   └── SettingsTab.tsx
│   │
│   ├── WalletDetailActivity.tsx
│   ├── SendActivity.tsx
│   └── ...
│
├── components/
│   └── TabBar.tsx         # 底部导航栏
│
└── hooks/
    ├── use-flow.ts        # 导航 Hook
    └── use-activity-params.ts
```

### Stores 模块

```
stores/
├── wallet.ts              # 钱包状态
│   ├── wallets[]          # 钱包列表
│   ├── currentWalletId    # 当前钱包
│   └── selectedChain      # 当前链
│
├── preferences.ts         # 用户偏好
│   ├── language           # 语言
│   ├── currency           # 货币单位
│   └── theme              # 主题
│
├── ui.ts                  # UI 状态 (非持久化)
│   ├── activeSheet        # 当前弹窗
│   └── toastMessage       # Toast 消息
│
└── index.ts               # 统一导出
```

### Services 模块

```
services/
├── adapters/              # 链适配器
│   ├── types.ts           # 接口定义
│   ├── registry.ts        # 适配器注册表
│   ├── evm/               # EVM 链
│   ├── tron/              # Tron 链
│   └── bioforest/         # BioForest 链
│
├── platform/              # 平台服务
│   ├── biometric/         # 生物识别
│   ├── storage/           # 安全存储
│   ├── clipboard/         # 剪贴板
│   └── toast/             # Toast
│
└── utils/                 # 工具函数
    ├── address.ts         # 地址处理
    ├── format.ts          # 格式化
    └── validate.ts        # 验证
```

---

## 8.5 数据流

### 读取流程

```
用户操作
    │
    ▼
┌─────────────┐
│  Component  │  ─── useQuery() ───►  缓存命中？
└─────────────┘                           │
                                  ┌───────┴───────┐
                                  │               │
                                 Yes             No
                                  │               │
                                  ▼               ▼
                              返回缓存       调用 Service
                                              │
                                              ▼
                                         Chain Adapter
                                              │
                                              ▼
                                          区块链节点
```

### 写入流程

```
用户提交表单
    │
    ▼
┌─────────────┐
│  Component  │  ─── useMutation() ───►  Service
└─────────────┘                              │
                                             ▼
                                       Chain Adapter
                                             │
                                             ▼
                                        签名交易
                                             │
                                             ▼
                                        广播交易
                                             │
                                             ▼
                                       更新缓存
                                             │
                                             ▼
                                        UI 更新
```

---

## 8.6 错误处理策略

### 错误分类

| 类型 | 处理方式 | 用户反馈 |
|-----|---------|---------|
| 网络错误 | 重试机制 | Toast + 重试按钮 |
| 验证错误 | 表单级处理 | 字段级错误提示 |
| 业务错误 | 页面级处理 | 错误页面/弹窗 |
| 系统错误 | 全局处理 | 错误边界 |

### 错误边界

```tsx
// src/components/error-boundary.tsx
export function ErrorBoundary({ children }) {
  return (
    <ReactErrorBoundary
      fallback={<ErrorPage />}
      onError={(error) => {
        // 上报错误
        console.error(error)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
```

### Query 错误处理

```tsx
const { data, error, isError, refetch } = useQuery({
  queryKey: ['balance', address],
  queryFn: () => getBalance(address),
  retry: 3,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
})

if (isError) {
  return <ErrorState error={error} onRetry={refetch} />
}
```

---

## 8.7 性能优化策略

### 代码分割

```tsx
// 路由级别懒加载
const SendPage = lazy(() => import('./pages/send'))
const StakingPage = lazy(() => import('./pages/staking'))
```

### 查询优化

```tsx
// 预取数据
queryClient.prefetchQuery({
  queryKey: ['wallet', walletId],
  queryFn: () => getWallet(walletId),
})

// 并行查询
const results = useQueries({
  queries: tokens.map(token => ({
    queryKey: ['balance', token],
    queryFn: () => getBalance(token),
  })),
})
```

### 渲染优化

```tsx
// 细粒度订阅
const activeWalletId = useStore(walletStore, (s) => s.currentWalletId)

// 记忆化组件
const WalletCard = memo(function WalletCard({ wallet }) {
  // ...
})
```

---

## 本章小结

- 四层架构：UI、State、Service、Platform
- 目录结构清晰，职责分明
- 模块单向依赖，便于维护
- 数据流清晰，读写分离
- 错误处理分类明确
- 性能优化策略完备

---

## 下一章

继续阅读 [第九章：导航系统](../03-导航系统/)，了解 Stackflow 配置。
