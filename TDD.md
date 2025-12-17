# BFM Pay - 技术设计文档 (TDD)

---

## 重要：原始代码参考指南

> **⚠️ 阅读本节后再开始开发**

本项目是对原始 mpay 应用的技术重构。在开发过程中，应参考原始代码以理解业务逻辑和实现细节。

### 原始代码位置

```
/Users/kzf/Dev/bioforestChain/legacy-apps/apps/mpay/
```

### 参考原则

1. **参考，而非复制**
   - mpay 代码仅作为理解业务需求的参考
   - 不要盲目复制 Angular 代码到 React
   - 理解"做什么"比"怎么做"更重要

2. **质疑原始实现**
   - 原始代码可能存在 Bug
   - 原始代码可能使用了过时的模式
   - 原始代码可能有未完成的功能
   - 遇到可疑之处，优先查阅本文档和 PDR.md

3. **现代化改进**
   - 使用 TypeScript 类型安全替代运行时检查
   - 使用 TanStack 全家桶替代 Angular 服务
   - 使用函数组件 + Hooks 替代 Class 组件
   - 使用 CSS-in-JS / Tailwind 替代 SCSS

4. **参考优先级**
   ```
   本文档 (TDD.md) > PDR.md > SERVICE-SPEC.md > mpay 原始代码
   ```

### 何时查看 mpay 代码

- 需要理解复杂业务流程时
- 需要了解与链服务交互的细节时
- 需要参考 UI 布局和交互时
- 需要理解 DWEB/Plaoc 协议实现时

### mpay 项目结构速览

```
mpay/src/
├── pages/              # 页面组件 (Angular)
│   ├── home/           # 首页、钱包管理
│   ├── authorize/      # DWEB 授权（重要参考）
│   ├── staking/        # 质押功能
│   ├── mime/           # "我的"页面、设置
│   └── mnemonic/       # 助记词、密码管理
├── services/           # 业务服务
├── components/         # 共享组件
└── helpers/            # 工具函数
```

---

## 1. 技术架构概览

### 1.1 技术栈选型

| 领域 | 技术选择 | 版本 | 说明 |
|-----|---------|------|------|
| 框架 | React + Vite | 19.x / 6.x | 现代构建工具 |
| 路由 | TanStack Router | 1.x | 类型安全的文件路由 |
| 服务端状态 | TanStack Query | 5.x | 异步状态管理 |
| 客户端状态 | TanStack Store | 0.x | 响应式状态管理 |
| 表单 | TanStack Form | 1.x | 类型安全表单 |
| UI组件 | shadcn/ui | latest | 可定制的组件库 |
| 样式 | Tailwind CSS | 4.x | CSS-first 配置 |
| 验证 | Zod | 4.x | 类型安全验证 |
| 组件文档 | Storybook | 10.x | 组件开发与文档，集成 Vitest |
| 测试 | Vitest | 4.x | 快速单元测试 |
| E2E测试 | Playwright | 1.x | 端到端测试 |
| 区块链 | viem / tronweb / bitcoinjs-lib | - | 多链支持 |

### 1.2 TanStack 全家桶优势
- **类型安全**：端到端 TypeScript 支持
- **统一心智模型**：相似的 API 设计模式
- **细粒度响应式**：高性能更新
- **DevTools**：完善的调试工具

### 1.3 原始代码参考
```
/Users/kzf/Dev/bioforestChain/legacy-apps/apps/mpay/
```

---

## 2. 项目结构

> **📁 mpay → KeyApp 目录映射**
> | mpay (Angular) | KeyApp (React) | 说明 |
> |----------------|----------------|------|
> | `pages/` | `routes/` | 页面路由 |
> | `pages/home/` | `routes/_authenticated/_tabs/home.tsx` | 首页 |
> | `pages/mime/` | `routes/_authenticated/_tabs/me.tsx` | "我的"页面 |
> | `pages/staking/` | `routes/_authenticated/staking/` | 质押功能 |
> | `pages/authorize/` | `routes/authorize/` | DWEB 授权 |
> | `pages/mnemonic/` | `routes/wallet/` + `features/security/` | 钱包安全 |
> | `components/` | `components/` | 共享组件 |
> | `services/` | `services/` + `features/*/queries.ts` | 服务层 |

```
keyapp/
├── .storybook/                 # Storybook 10 配置
│   ├── main.ts
│   ├── preview.tsx
│   └── vitest.setup.ts
│
├── src/
│   ├── routes/                 # TanStack Router 文件路由
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── guide.tsx
│   │   ├── unlock.tsx
│   │   ├── _authenticated.tsx  # 认证布局
│   │   ├── _authenticated/
│   │   │   ├── _tabs.tsx
│   │   │   ├── _tabs/
│   │   │   │   ├── home.tsx
│   │   │   │   └── me.tsx
│   │   │   ├── transfer.tsx
│   │   │   ├── receive.tsx
│   │   │   └── staking/
│   │   └── wallet/
│   │       ├── create.tsx
│   │       └── import.tsx
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 组件
│   │   ├── layout/
│   │   ├── wallet/
│   │   ├── token/
│   │   └── common/
│   │
│   ├── stores/                 # TanStack Store
│   │   ├── auth.store.ts
│   │   ├── wallet.store.ts
│   │   ├── ui.store.ts
│   │   └── index.ts
│   │
│   ├── features/               # 功能模块
│   │   ├── wallet/
│   │   │   ├── queries.ts      # TanStack Query
│   │   │   ├── mutations.ts
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   ├── transfer/
│   │   ├── staking/
│   │   └── settings/
│   │
│   ├── lib/
│   │   ├── chains/
│   │   ├── crypto/
│   │   ├── storage/
│   │   └── utils/
│   │
│   ├── hooks/
│   ├── i18n/
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── main.tsx
│   ├── router.ts
│   └── routeTree.gen.ts        # 自动生成
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── setup.ts
│
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── vitest.workspace.ts
├── tailwind.config.ts
└── components.json
```

---

## 3. TanStack Router 配置

> **📁 mpay 参考文件**
> ```
> app/app.routes.ts                                # 主路由配置
> pages/home/home.component.ts                     # 首页组件
> pages/home/pages/                                # 首页子页面
>   ├── home-create-wallet/                        # 创建钱包
>   ├── home-import-wallet/                        # 导入钱包
>   ├── home-manage-wallets/                       # 钱包管理
>   ├── home-transfer/                             # 转账（在 mnemonic 目录下）
>   └── home-receive/                              # 收款
> pages/staking/staking.routes.ts                  # 质押路由
> pages/mnemonic/mnemonic.routes.ts                # 助记词相关路由
> ```

### 3.1 路由器初始化

```typescript
// src/router.ts
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { queryClient } from './lib/query-client'
import { authStore } from './stores/auth.store'

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
    auth: authStore,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

### 3.2 根路由

```typescript
// src/routes/__root.tsx
import { 
  createRootRouteWithContext, 
  Outlet,
  ScrollRestoration 
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'
import type { AuthStore } from '@/stores/auth.store'

interface RouterContext {
  queryClient: QueryClient
  auth: AuthStore
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <ScrollRestoration />
      <div className="min-h-screen bg-grey font-sans antialiased">
        <Outlet />
      </div>
      {import.meta.env.DEV && (
        <>
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </>
      )}
    </>
  )
}
```

### 3.3 认证保护路由

```typescript
// src/routes/_authenticated.tsx
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    const { auth } = context
    const state = auth.state
    
    if (!state.hasWallet) {
      throw redirect({ to: '/wallet/create' })
    }
    
    if (state.isLocked && state.isPasswordLockEnabled) {
      throw redirect({ to: '/unlock' })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return <Outlet />
}
```

### 3.4 Tab 路由

```typescript
// src/routes/_authenticated/_tabs.tsx
import { createFileRoute, Outlet, Link } from '@tanstack/react-router'
import { TabBar } from '@/components/layout/tab-bar'

export const Route = createFileRoute('/_authenticated/_tabs')({
  component: TabsLayout,
})

function TabsLayout() {
  return (
    <div className="flex h-dvh flex-col">
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
```

### 3.5 首页路由（带数据预加载）

```typescript
// src/routes/_authenticated/_tabs/home.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { walletQueries } from '@/features/wallet/queries'
import { useStore } from '@tanstack/react-store'
import { walletStore } from '@/stores/wallet.store'
import { WalletCard } from '@/components/wallet/wallet-card'
import { TokenList } from '@/components/token/token-list'
import { PageLayout } from '@/components/layout/page-layout'

export const Route = createFileRoute('/_authenticated/_tabs/home')({
  loader: ({ context }) => {
    const { queryClient } = context
    return Promise.all([
      queryClient.ensureQueryData(walletQueries.active()),
      queryClient.ensureQueryData(walletQueries.balances()),
    ])
  },
  component: HomePage,
  pendingComponent: HomePageSkeleton,
})

function HomePage() {
  const activeAddressKey = useStore(walletStore, (s) => s.activeAddressKey)
  const { data: wallet } = useSuspenseQuery(walletQueries.active())
  const { data: assets } = useSuspenseQuery(
    walletQueries.balances(activeAddressKey!)
  )

  return (
    <PageLayout>
      <WalletCard wallet={wallet} />
      <TokenList assets={assets} />
    </PageLayout>
  )
}

function HomePageSkeleton() {
  return (
    <PageLayout>
      <div className="animate-pulse">
        <div className="h-44 rounded-3xl bg-gray-200" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
```

### 3.6 带参数和搜索的路由

```typescript
// src/routes/_authenticated/token.$chain.$symbol.tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  tab: z.enum(['transactions', 'info']).default('transactions'),
})

export const Route = createFileRoute('/_authenticated/token/$chain/$symbol')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ tab: search.tab }),
  loader: async ({ params, deps, context }) => {
    const { chain, symbol } = params
    const { queryClient } = context
    
    await queryClient.ensureQueryData(
      tokenQueries.detail({ chain, symbol })
    )
    
    if (deps.tab === 'transactions') {
      await queryClient.ensureQueryData(
        tokenQueries.transactions({ chain, symbol })
      )
    }
  },
  component: TokenDetailPage,
})
```

---

## 4. TanStack Store 状态管理

> **📁 mpay 参考文件**
> ```
> services/expansion-tools/wallet-data-stroage.ts  # 钱包状态存储
> pages/mime/pages/application-lock/               # 应用锁设置
> pages/mnemonic/pages/set-wallet-password/        # 密码设置
> pages/mnemonic/pages/set-wallet-fingerprint-pay/ # 指纹支付设置
> ```
> 
> **状态迁移**: mpay 使用 Angular Service + localStorage，
> KeyApp 使用 TanStack Store + localStorage 实现相同功能。

### 4.1 创建 Store

```typescript
// src/stores/auth.store.ts
import { Store } from '@tanstack/store'

interface AuthState {
  hasWallet: boolean
  isLocked: boolean
  isPasswordLockEnabled: boolean
  isFingerprintEnabled: boolean
  lastUnlockTime: number | null
}

const initialState: AuthState = {
  hasWallet: false,
  isLocked: true,
  isPasswordLockEnabled: false,
  isFingerprintEnabled: false,
  lastUnlockTime: null,
}

// 从 localStorage 恢复状态
function loadPersistedState(): Partial<AuthState> {
  try {
    const saved = localStorage.getItem('auth-store')
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

export const authStore = new Store<AuthState>({
  ...initialState,
  ...loadPersistedState(),
})

// 持久化订阅
authStore.subscribe(() => {
  const state = authStore.state
  localStorage.setItem('auth-store', JSON.stringify({
    hasWallet: state.hasWallet,
    isPasswordLockEnabled: state.isPasswordLockEnabled,
    isFingerprintEnabled: state.isFingerprintEnabled,
  }))
})

// Actions
export const authActions = {
  setHasWallet: (has: boolean) => {
    authStore.setState((prev) => ({ ...prev, hasWallet: has }))
  },
  
  lock: () => {
    authStore.setState((prev) => ({ ...prev, isLocked: true }))
  },
  
  unlock: () => {
    authStore.setState((prev) => ({ 
      ...prev, 
      isLocked: false,
      lastUnlockTime: Date.now(),
    }))
  },
  
  setPasswordLock: (enabled: boolean) => {
    authStore.setState((prev) => ({ 
      ...prev, 
      isPasswordLockEnabled: enabled 
    }))
  },
  
  setFingerprintEnabled: (enabled: boolean) => {
    authStore.setState((prev) => ({ 
      ...prev, 
      isFingerprintEnabled: enabled 
    }))
  },
}

export type AuthStore = typeof authStore
```

### 4.2 钱包 UI Store

```typescript
// src/stores/wallet.store.ts
import { Store } from '@tanstack/store'
import type { ChainName } from '@/features/wallet/types'

interface WalletUIState {
  activeWalletId: string | null
  activeAddressKey: string | null
  activeChain: ChainName | null
  assetViewMode: 'assets' | 'dp'
}

const initialState: WalletUIState = {
  activeWalletId: null,
  activeAddressKey: null,
  activeChain: null,
  assetViewMode: 'assets',
}

export const walletStore = new Store<WalletUIState>({
  ...initialState,
  ...loadFromStorage('wallet-store'),
})

// 持久化
walletStore.subscribe(() => {
  saveToStorage('wallet-store', walletStore.state)
})

export const walletActions = {
  setActiveWallet: (walletId: string) => {
    walletStore.setState((prev) => ({ 
      ...prev, 
      activeWalletId: walletId 
    }))
  },
  
  setActiveAddress: (addressKey: string, chain: ChainName) => {
    walletStore.setState((prev) => ({
      ...prev,
      activeAddressKey: addressKey,
      activeChain: chain,
    }))
  },
  
  setAssetViewMode: (mode: 'assets' | 'dp') => {
    walletStore.setState((prev) => ({ 
      ...prev, 
      assetViewMode: mode 
    }))
  },
}
```

### 4.3 UI Store（非持久化）

```typescript
// src/stores/ui.store.ts
import { Store } from '@tanstack/store'

type SheetType = 
  | 'wallet-selector' 
  | 'chain-selector' 
  | 'fee-selector'
  | 'token-selector'
  | null

interface UIState {
  activeSheet: SheetType
  sheetData: unknown
  toastMessage: string | null
}

export const uiStore = new Store<UIState>({
  activeSheet: null,
  sheetData: null,
  toastMessage: null,
})

export const uiActions = {
  openSheet: <T>(sheet: SheetType, data?: T) => {
    uiStore.setState((prev) => ({ 
      ...prev, 
      activeSheet: sheet, 
      sheetData: data 
    }))
  },
  
  closeSheet: () => {
    uiStore.setState((prev) => ({ 
      ...prev, 
      activeSheet: null, 
      sheetData: null 
    }))
  },
  
  showToast: (message: string) => {
    uiStore.setState((prev) => ({ ...prev, toastMessage: message }))
    setTimeout(() => {
      uiStore.setState((prev) => ({ ...prev, toastMessage: null }))
    }, 3000)
  },
}
```

### 4.4 组件中使用 Store

```typescript
// src/components/wallet/wallet-selector.tsx
import { useStore } from '@tanstack/react-store'
import { walletStore, walletActions } from '@/stores/wallet.store'
import { uiStore, uiActions } from '@/stores/ui.store'

export function WalletSelector() {
  // 订阅特定字段，细粒度更新
  const activeWalletId = useStore(walletStore, (s) => s.activeWalletId)
  const isOpen = useStore(uiStore, (s) => s.activeSheet === 'wallet-selector')
  
  const handleSelect = (walletId: string) => {
    walletActions.setActiveWallet(walletId)
    uiActions.closeSheet()
  }
  
  return (
    <BottomSheet open={isOpen} onOpenChange={() => uiActions.closeSheet()}>
      <WalletList 
        activeId={activeWalletId} 
        onSelect={handleSelect} 
      />
    </BottomSheet>
  )
}
```

### 4.5 派生状态

```typescript
// src/stores/derived.ts
import { Store } from '@tanstack/store'
import { authStore } from './auth.store'
import { walletStore } from './wallet.store'

// 创建派生 store
export const derivedStore = new Store({
  get canTransfer() {
    const auth = authStore.state
    const wallet = walletStore.state
    return !auth.isLocked && wallet.activeAddressKey !== null
  },
  
  get shouldShowBackupWarning() {
    // 复杂的派生逻辑
    return false // 简化示例
  },
})

// 当依赖变化时更新派生状态
authStore.subscribe(() => derivedStore.setState((s) => ({ ...s })))
walletStore.subscribe(() => derivedStore.setState((s) => ({ ...s })))
```

---

## 5. TanStack Query 数据层

### 5.1 Query Client 配置

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,         // 1分钟
      gcTime: 1000 * 60 * 5,        // 5分钟
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})
```

### 5.2 Query 定义

```typescript
// src/features/wallet/queries.ts
import { queryOptions } from '@tanstack/react-query'
import { walletService } from '@/lib/services/wallet'

export const walletKeys = {
  all: ['wallets'] as const,
  lists: () => [...walletKeys.all, 'list'] as const,
  detail: (id: string) => [...walletKeys.all, 'detail', id] as const,
  active: () => [...walletKeys.all, 'active'] as const,
  balances: (addressKey: string) => 
    [...walletKeys.all, 'balances', addressKey] as const,
}

export const walletQueries = {
  all: () => queryOptions({
    queryKey: walletKeys.lists(),
    queryFn: walletService.getAllWallets,
  }),
  
  detail: (id: string) => queryOptions({
    queryKey: walletKeys.detail(id),
    queryFn: () => walletService.getWallet(id),
    enabled: !!id,
  }),
  
  active: () => queryOptions({
    queryKey: walletKeys.active(),
    queryFn: walletService.getActiveWallet,
  }),
  
  balances: (addressKey: string) => queryOptions({
    queryKey: walletKeys.balances(addressKey),
    queryFn: () => walletService.getBalances(addressKey),
    refetchInterval: 30_000,
    enabled: !!addressKey,
  }),
}
```

### 5.3 Mutations

```typescript
// src/features/wallet/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { walletService } from '@/lib/services/wallet'
import { walletKeys } from './queries'
import { authActions } from '@/stores/auth.store'
import { walletActions } from '@/stores/wallet.store'

export function useCreateWallet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: walletService.createWallet,
    onSuccess: (wallet) => {
      // 更新 Query 缓存
      queryClient.setQueryData(walletKeys.active(), wallet)
      queryClient.invalidateQueries({ queryKey: walletKeys.lists() })
      
      // 更新 Store
      authActions.setHasWallet(true)
      walletActions.setActiveWallet(wallet.id)
      walletActions.setActiveAddress(
        wallet.addresses[0].key, 
        wallet.addresses[0].chain
      )
    },
  })
}

export function useTransfer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: transferService.send,
    onMutate: async (params) => {
      // 乐观更新可以在这里实现
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ 
        queryKey: walletKeys.balances(params.fromAddressKey) 
      })
    },
    onError: (error) => {
      uiActions.showToast(error.message)
    },
  })
}
```

---

## 6. TanStack Form 表单

### 6.1 转账表单

```typescript
// src/features/transfer/transfer-form.tsx
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { useStore } from '@tanstack/react-store'
import { walletStore } from '@/stores/wallet.store'
import { useTransfer } from './mutations'

const transferSchema = z.object({
  toAddress: z.string().min(1, 'Address is required'),
  amount: z.string().min(1, 'Amount is required'),
  memo: z.string().max(24).optional(),
})

export function TransferForm({ assetType }: { assetType: string }) {
  const activeAddressKey = useStore(walletStore, (s) => s.activeAddressKey)
  const activeChain = useStore(walletStore, (s) => s.activeChain)
  const transfer = useTransfer()
  
  const form = useForm({
    defaultValues: {
      toAddress: '',
      amount: '',
      memo: '',
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: transferSchema,
    },
    onSubmit: async ({ value }) => {
      await transfer.mutateAsync({
        ...value,
        fromAddressKey: activeAddressKey!,
        chain: activeChain!,
        assetType,
      })
    },
  })
  
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="toAddress"
        validators={{
          onChangeAsync: async ({ value }) => {
            const isValid = await chainService.isValidAddress(value, activeChain!)
            return isValid ? undefined : 'Invalid address'
          },
          onChangeAsyncDebounceMs: 500,
        }}
      >
        {(field) => (
          <div>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Enter recipient address"
            />
            {field.state.meta.errors && (
              <p className="text-error text-sm mt-1">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>
      
      <form.Field name="amount">
        {(field) => (
          <AmountInput
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={field.state.meta.errors?.[0]}
          />
        )}
      </form.Field>
      
      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
```

---

## 7. shadcn/ui 组件

### 7.1 配置

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "hooks": "@/hooks"
  }
}
```

### 7.2 Tailwind CSS 4.x 配置

Tailwind 4.x 采用 CSS-first 配置方式，不再需要 `tailwind.config.js`。

```css
/* src/styles/globals.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

:root {
  /* 主色 - Bioforest green */
  --primary: oklch(0.6 0.13 163);
  --primary-foreground: oklch(0.98 0.02 166);
}

.dark {
  --primary: oklch(0.7 0.15 162);
  --primary-foreground: oklch(0.26 0.05 173);
}

@theme inline {
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
}

/* 其他 tokens 见 globals.css */
```

```typescript
// vite.config.ts - Tailwind 4.x 配置
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

### 7.3 自定义组件

```typescript
// src/components/ui/gradient-button.tsx
import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const gradientButtonVariants = cva(
  'inline-flex items-center justify-center rounded-full text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50',
  {
    variants: {
      variant: {
        blue: 'bg-gradient-to-b from-[#6de7fe] to-[#44b5f7]',
        purple: 'bg-gradient-to-b from-[#a694f8] to-[#8970ff]',
        red: 'bg-gradient-to-b from-[#f77fa2] to-[#ea4879]',
        mint: 'bg-gradient-to-b from-[#e298ff] to-[#8b46ff]',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-12 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'purple',
      size: 'md',
    },
  }
)

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  asChild?: boolean
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(gradientButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

```typescript
// src/components/ui/bottom-sheet.tsx
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export function BottomSheet({ 
  open, 
  onOpenChange, 
  children,
  className,
}: BottomSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] rounded-t-3xl bg-white',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            'duration-300',
            className
          )}
        >
          <div className="mx-auto my-3 h-1.5 w-12 rounded-full bg-gray-300" />
          <div className="overflow-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### 7.4 响应式设计策略

> **核心原则**：页面用媒体查询，组件用容器查询

随着折叠屏设备和小平板的普及，BFM Pay 采用双层响应式策略：

| 层级 | 技术 | 适用场景 | 断点 |
|-----|------|---------|------|
| **页面级** | Media Query (`@media`) | 整体布局、导航结构 | 640px / 768px / 1024px |
| **组件级** | Container Query (`@container`) | 组件自适应 | 280px / 320px / 480px |

#### 7.4.1 为什么组件使用容器查询

传统媒体查询基于**视口尺寸**，但组件可能被放置在不同宽度的容器中：
- 侧边栏（窄）
- 主内容区（宽）
- 弹窗/Sheet（中等）
- 卡片内部（可变）

容器查询让组件根据**自身容器尺寸**响应，实现真正的组件自包含。

#### 7.4.2 Tailwind 4.x 容器查询配置

```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  /* 容器查询断点 */
  --container-3xs: 16rem;   /* 256px - 极窄 */
  --container-2xs: 18rem;   /* 288px - 窄 */
  --container-xs: 20rem;    /* 320px - 小 */
  --container-sm: 24rem;    /* 384px - 中 */
  --container-md: 28rem;    /* 448px - 标准 */
  --container-lg: 32rem;    /* 512px - 大 */
  --container-xl: 36rem;    /* 576px - 宽 */
}
```

#### 7.4.3 组件容器查询示例

```tsx
// src/components/wallet/wallet-card.tsx
export function WalletCard({ wallet }: WalletCardProps) {
  return (
    // 定义容器上下文
    <div className="@container">
      <div className={cn(
        // 默认（窄容器）：垂直布局
        "flex flex-col gap-2 p-3",
        // 中等容器（>320px）：水平布局
        "@xs:flex-row @xs:items-center @xs:gap-4 @xs:p-4",
        // 宽容器（>480px）：显示更多信息
        "@md:p-6"
      )}>
        {/* 钱包头像 - 根据容器调整尺寸 */}
        <Avatar className="size-10 @xs:size-12 @md:size-14" />
        
        {/* 钱包信息 */}
        <div className="flex-1">
          <h3 className="text-sm @xs:text-base @md:text-lg font-medium">
            {wallet.name}
          </h3>
          {/* 宽容器时显示完整地址 */}
          <p className="text-xs text-muted-@md:text-sm">
            <span className="@md:hidden">{shortenAddress(wallet.address)}</span>
            <span className="hidden @md:inline">{wallet.address}</span>
          </p>
        </div>
        
        {/* 余额 - 宽容器时显示更多细节 */}
        <div className="text-right">
          <p className="text-sm @xs:text-base @md:text-lg font-bold">
            {formatBalance(wallet.balance)}
          </p>
          <p className="hidden @md:block text-xs text-muted-foreground">
            ≈ ${wallet.fiatValue}
          </p>
        </div>
      </div>
    </div>
  )
}
```

#### 7.4.4 Storybook 容器尺寸测试

```tsx
// src/components/wallet/wallet-card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { WalletCard } from './wallet-card'

const meta: Meta<typeof WalletCard> = {
  component: WalletCard,
  decorators: [
    (Story, context) => {
      const width = context.args.containerWidth || 360
      return (
        <div 
          style={{ width, resize: 'horizontal', overflow: 'auto' }}
          className="border border-dashed border-gray-300 p-2"
        >
          <Story />
        </div>
      )
    }
  ],
}

export default meta
type Story = StoryObj<typeof WalletCard>

// 不同容器尺寸变体
export const NarrowContainer: Story = {
  args: { wallet: mockWallet, containerWidth: 280 },
}

export const StandardContainer: Story = {
  args: { wallet: mockWallet, containerWidth: 360 },
}

export const WideContainer: Story = {
  args: { wallet: mockWallet, containerWidth: 500 },
}

export const Resizable: Story = {
  args: { wallet: mockWallet, containerWidth: 360 },
  parameters: {
    docs: { description: { story: '拖拽右下角调整容器宽度' } },
  },
}
```

#### 7.4.5 组件响应式设计清单

开发组件时，考虑以下断点下的表现：

| 断点 | 宽度 | 布局建议 |
|-----|------|---------|
| `@3xs` | < 256px | 最小化，仅保留核心信息 |
| `@2xs` | < 288px | 紧凑模式，堆叠布局 |
| `@xs` | < 320px | 小型手机，单列 |
| `@sm` | < 384px | 标准手机，可水平布局 |
| `@md` | < 448px | 大屏手机，显示更多 |
| `@lg` | < 512px | 小平板/折叠屏展开 |
| `@xl` | > 576px | 平板横屏，多列布局 |

### 7.5 组件编码规范

#### 7.5.1 正方形元素使用 aspect-square

所有需要 1:1 比例的元素（如图标、头像、徽章）必须使用 `aspect-square` 而非同时指定 `w-X h-X`：

```tsx
// ✅ 正确：使用 aspect-square
<div className="w-10 aspect-square rounded-full" />
<svg className="w-5 aspect-square" />

// ❌ 错误：同时指定宽高
<div className="w-10 h-10 rounded-full" />
<svg className="w-5 h-5" />
```

**原因**：
- 统一维护：只需修改宽度，高度自动跟随
- 响应式友好：容器查询下更易适配
- 代码一致性：减少心智负担

**例外情况**：
- 非正方形元素（如拖动条 `w-10 h-1`）
- Skeleton 骨架屏占位符（需要明确尺寸）

#### 7.5.2 基础组件统一原则

所有涉及以下数据类型的显示，必须使用对应的基础组件：

| 数据类型 | 基础组件 | 位置 |
|---------|---------|------|
| 地址 | `AddressDisplay` | `@/components/wallet` |
| 金额 | `AmountDisplay` / `AmountWithFiat` | `@/components/common` |
| 时间 | `TimeDisplay` | `@/components/common` |

```tsx
// ✅ 正确：使用基础组件
<AddressDisplay address={wallet.address} />
<AmountDisplay value={100} symbol="USDT" sign="always" color="auto" />
<TimeDisplay value={timestamp} format="relative" />

// ❌ 错误：内联格式化
<span>{address.slice(0, 6)}...{address.slice(-4)}</span>
<span>{amount.toFixed(2)} USDT</span>
<span>{formatTime(timestamp)}</span>
```

#### 7.5.3 图标 padding 规范

带图标的按钮使用 `has-[svg]:ps-*` 自动调整左侧内边距：

```tsx
// ✅ 正确：条件 padding
<button className="px-4 has-[svg]:ps-3">
  <Icon />
  <span>按钮文字</span>
</button>

// ❌ 错误：固定 padding
<button className="ps-3 pe-4">
  <Icon />
  <span>按钮文字</span>
</button>
```

#### 7.5.4 表单间距规范

| 元素关系 | 间距类 | 说明 |
|---------|-------|------|
| label → input | `space-y-2` | 8px 垂直间距 |
| input → error | `-mt-0.5` | 6px 间距（负边距补偿） |
| field → field | `space-y-4` | 16px 垂直间距 |

```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label>用户名</Label>
    <Input />
    {error && <p className="-mt-0.5 text-destructive">{error}</p>}
  </div>
</div>
```

#### 7.5.5 页面复用基础组件

页面开发必须优先使用基础组件库中的组件，避免在页面中内联实现相同功能：

| UI 模式 | 基础组件 | 位置 |
|---------|---------|------|
| 圆形图标背景 | `IconCircle` | `@/components/common` |
| 表单字段包装 | `FormField` | `@/components/common` |
| 提示/警告信息 | `Alert` | `@/components/common` |
| 多步骤指示器 | `StepIndicator` | `@/components/common` |
| 简化进度条 | `ProgressSteps` | `@/components/common` |
| 二维码显示 | `QRCode` / `AddressQRCode` | `@/components/common` |

```tsx
// ✅ 正确：使用基础组件
import { IconCircle, FormField, Alert, ProgressSteps } from '@/components/common'

<IconCircle icon={ShieldCheck} variant="primary" size="lg" />

<FormField label="密码" error={error} required>
  <PasswordInput value={password} onChange={...} />
</FormField>

<Alert variant="warning">
  助记词是恢复钱包的唯一方式
</Alert>

<ProgressSteps total={3} current={2} />

// ❌ 错误：内联实现
<div className="mx-auto size-16 rounded-full bg-primary/10">
  <ShieldCheck className="size-8 text-primary" />
</div>

<div className="space-y-2">
  <label className="text-sm font-medium">密码</label>
  <PasswordInput ... />
  {error && <p className="text-xs text-destructive">{error}</p>}
</div>

<div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
  <p className="text-sm text-destructive">⚠️ 警告信息</p>
</div>
```

**基础组件优势**：
- 统一样式和行为
- 内置无障碍支持
- 类型安全的 Props
- 易于全局调整

#### 7.5.6 品牌字体系统

使用 DM 系列字体（Google Fonts / Fontsource 本地化）确保跨平台一致性：

| 字体 | CSS 类 | 用途 |
|------|--------|------|
| DM Sans | `font-sans` | UI 文本、按钮、标签（默认） |
| DM Mono | `font-mono` | 地址、金额、代码 |
| DM Serif Display | `font-serif` | 协议、提示、正式内容 |

```tsx
// UI 文本（默认使用 DM Sans）
<p className="text-lg font-medium">账户余额</p>

// 地址和数字（等宽字体）
<span className="font-mono">0x71C7...976F</span>
<span className="font-mono tabular-nums">1,234.56 USDT</span>

// 正式内容（衬线字体）
<div className="font-serif prose">
  <h3>用户协议</h3>
  <p>在使用本服务前，请仔细阅读以下条款...</p>
</div>

// 提示信息（衬线 + 斜体）
<p className="font-serif italic text-muted-foreground">
  助记词是恢复钱包的唯一方式，请妥善保管。
</p>
```

**DM Serif Text vs Display 的区别**：
- **DM Serif Text**：为小尺寸正文优化，x-height 更高
- **DM Serif Display**：为大尺寸标题优化，对比度更强

本项目选用 Display 版本，因为协议/提示通常是较大字号的独立区块。

---

## 8. Storybook 10.x 配置

### 8.1 主配置

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    '@storybook/addon-coverage',
  ],
  
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  
  docs: {},
  
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  
  viteFinal: async (config) => {
    return {
      ...config,
      resolve: {
        alias: {
          '@': new URL('../src', import.meta.url).pathname,
        },
      },
    }
  },
}

export default config
```

### 8.2 Preview 配置

```typescript
// .storybook/preview.tsx
import type { Preview } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '../src/styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Infinity },
  },
})

// 移动端视口
const viewports = {
  iPhone14: { name: 'iPhone 14', styles: { width: '390px', height: '844px' } },
  iPhone14ProMax: { name: 'iPhone 14 Pro Max', styles: { width: '430px', height: '932px' } },
  pixel7: { name: 'Pixel 7', styles: { width: '412px', height: '915px' } },
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports,
      defaultViewport: 'iPhone14',
    },
    backgrounds: {
      default: 'grey',
      values: [
        { name: 'white', value: '#ffffff' },
        { name: 'grey', value: '#f4f4fc' },
      ],
    },
    layout: 'fullscreen',
  },
  
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="font-sans antialiased">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  
  tags: ['autodocs'],
}

export default preview
```

### 8.3 组件 Story

```typescript
// src/components/wallet/wallet-card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { WalletCard } from './wallet-card'

const meta = {
  title: 'Wallet/WalletCard',
  component: WalletCard,
  parameters: {
    layout: 'padded',
  },
  args: {
    onTransfer: fn(),
    onMint: fn(),
    onReceive: fn(),
  },
  argTypes: {
    chain: {
      control: 'select',
      options: ['Ethereum', 'Tron', 'Binance', 'Bitcoin', 'BFMeta'],
    },
  },
} satisfies Meta<typeof WalletCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'My Wallet',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    chain: 'Ethereum',
    symbol: 'ETH',
    isBackedUp: true,
  },
}

export const NotBackedUp: Story = {
  args: {
    ...Default.args,
    isBackedUp: false,
  },
}

export const Frozen: Story = {
  args: {
    ...Default.args,
    chain: 'BFMeta',
    isFrozen: true,
  },
}
```

### 8.4 交互测试

```typescript
// src/components/common/password-input.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { PasswordInput } from './password-input'

const meta = {
  title: 'Common/PasswordInput',
  component: PasswordInput,
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>

export const ToggleVisibility: Story = {
  args: {
    placeholder: 'Enter password',
    showToggle: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Enter password')
    const toggleButton = canvas.getByRole('button')
    
    await step('Type password', async () => {
      await userEvent.type(input, 'secret123')
      await expect(input).toHaveAttribute('type', 'password')
    })
    
    await step('Show password', async () => {
      await userEvent.click(toggleButton)
      await expect(input).toHaveAttribute('type', 'text')
    })
    
    await step('Hide password again', async () => {
      await userEvent.click(toggleButton)
      await expect(input).toHaveAttribute('type', 'password')
    })
  },
}
```

---

## 9. Vitest 4.x 测试

### 9.1 Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/*.test.{ts,tsx}',
        'src/**/types.ts',
        'src/routeTree.gen.ts',
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
    reporters: ['default', 'html'],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

### 9.2 Workspace 配置

```typescript
// vitest.workspace.ts
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      name: 'unit',
      include: ['src/**/*.test.{ts,tsx}'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'integration',
      include: ['tests/integration/**/*.test.{ts,tsx}'],
      setupFiles: ['./tests/integration/setup.ts'],
    },
  },
])
```

### 9.3 测试 Setup

```typescript
// tests/setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

// Mock matchMedia
vi.stubGlobal('matchMedia', vi.fn((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)
```

### 9.4 Store 测试

```typescript
// src/stores/auth.store.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authStore, authActions } from './auth.store'

describe('Auth Store', () => {
  beforeEach(() => {
    // 重置 store 状态
    authStore.setState(() => ({
      hasWallet: false,
      isLocked: true,
      isPasswordLockEnabled: false,
      isFingerprintEnabled: false,
      lastUnlockTime: null,
    }))
  })

  it('should initialize with default state', () => {
    expect(authStore.state.hasWallet).toBe(false)
    expect(authStore.state.isLocked).toBe(true)
  })

  it('should update hasWallet', () => {
    authActions.setHasWallet(true)
    expect(authStore.state.hasWallet).toBe(true)
  })

  it('should unlock and set timestamp', () => {
    const before = Date.now()
    authActions.unlock()
    const after = Date.now()
    
    expect(authStore.state.isLocked).toBe(false)
    expect(authStore.state.lastUnlockTime).toBeGreaterThanOrEqual(before)
    expect(authStore.state.lastUnlockTime).toBeLessThanOrEqual(after)
  })

  it('should lock', () => {
    authActions.unlock()
    authActions.lock()
    expect(authStore.state.isLocked).toBe(true)
  })
})
```

### 9.5 组件测试

```typescript
// src/components/wallet/wallet-card.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalletCard } from './wallet-card'

describe('WalletCard', () => {
  const defaultProps = {
    name: 'Test Wallet',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    chain: 'Ethereum' as const,
    symbol: 'ETH',
    isBackedUp: true,
    onTransfer: vi.fn(),
    onMint: vi.fn(),
    onReceive: vi.fn(),
  }

  it('renders wallet info correctly', () => {
    render(<WalletCard {...defaultProps} />)
    
    expect(screen.getByText('Test Wallet')).toBeInTheDocument()
    expect(screen.getByText(/0x1234.*5678/)).toBeInTheDocument()
  })

  it('shows backup warning when not backed up', () => {
    render(<WalletCard {...defaultProps} isBackedUp={false} />)
    expect(screen.getByText(/no backup/i)).toBeInTheDocument()
  })

  it('calls action handlers on button click', async () => {
    const user = userEvent.setup()
    render(<WalletCard {...defaultProps} />)
    
    await user.click(screen.getByRole('button', { name: /transfer/i }))
    expect(defaultProps.onTransfer).toHaveBeenCalledOnce()
    
    await user.click(screen.getByRole('button', { name: /receive/i }))
    expect(defaultProps.onReceive).toHaveBeenCalledOnce()
  })
})
```

### 9.6 Query Hook 测试

```typescript
// src/features/wallet/queries.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { walletQueries } from './queries'
import { walletService } from '@/lib/services/wallet'

vi.mock('@/lib/services/wallet')

describe('Wallet Queries', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  it('fetches active wallet', async () => {
    const mockWallet = { id: '1', name: 'Test' }
    vi.mocked(walletService.getActiveWallet).mockResolvedValue(mockWallet)

    const { result } = renderHook(
      () => useSuspenseQuery(walletQueries.active()),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.data).toEqual(mockWallet)
    })
  })
})
```

---

## 10. 数据模型

> **📁 mpay 参考文件**
> ```
> services/expansion-tools/wallet-data-stroage.ts  # 钱包数据存储服务
> services/expansion-tools/wallet.ts               # 钱包工具函数
> services/expansion-tools/chain.ts                # 链配置
> ```
> 
> **注意**: mpay 使用 `WalletDataStorageV2Service` 管理钱包数据，参考其数据结构设计，
> 但使用 TanStack Store + localStorage 替代 Angular 服务。

```typescript
// src/features/wallet/types.ts

export type ChainName = 
  | 'BFMeta' | 'BTGMeta' | 'ETHMeta' | 'BFChainV2' | 'CCChain' | 'PMChain'
  | 'Ethereum' | 'Tron' | 'Binance' | 'Bitcoin'

export type WalletImportType = 'mnemonic' | 'privateKey'

export interface MainWallet {
  id: string
  name: string
  avatar: string
  importType: WalletImportType
  isBackedUp: boolean
  addresses: AddressKey[]
  createdAt: number
}

export interface AddressKey {
  key: string
  chain: ChainName
  purpose?: number
  index?: number
}

export interface ChainAddress {
  key: string
  walletId: string
  chain: ChainName
  address: string
  name: string
  symbol: string
  isFrozen: boolean
  assets: Asset[]
}

export interface Asset {
  type: string
  amount: string
  decimals: number
  contractAddress?: string
  logoUrl?: string
}
```

---

## 11. 依赖清单

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    
    "@tanstack/react-router": "^1.45.0",
    "@tanstack/react-query": "^5.50.0",
    "@tanstack/react-store": "^0.5.0",
    "@tanstack/react-form": "^1.0.0",
    "@tanstack/zod-form-adapter": "^1.0.0",
    
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    
    "tailwindcss": "^4.0.0",
    "tailwind-merge": "^2.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    
    "zod": "^4.0.0",
    "viem": "^2.17.0",
    "tronweb": "^5.3.0",
    "bitcoinjs-lib": "^6.1.0",
    "bip39": "^3.1.0",
    
    "i18next": "^23.12.0",
    "react-i18next": "^15.0.0",
    "i18next-browser-languagedetector": "^8.0.0",
    "i18next-http-backend": "^2.6.0",
    "lucide-react": "^0.408.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@tailwindcss/vite": "^4.0.0",
    "typescript": "^5.5.0",
    
    "@tanstack/router-vite-plugin": "^1.45.0",
    "@tanstack/router-devtools": "^1.45.0",
    "@tanstack/react-query-devtools": "^5.50.0",
    
    "@storybook/react-vite": "^9.0.0",
    "@storybook/addon-essentials": "^9.0.0",
    "@storybook/addon-interactions": "^9.0.0",
    "@storybook/addon-a11y": "^9.0.0",
    "@storybook/addon-coverage": "^9.0.0",
    "@storybook/test": "^9.0.0",
    "@chromatic-com/storybook": "^2.0.0",
    
    "vitest": "^4.0.0",
    "@vitest/coverage-v8": "^4.0.0",
    "@vitest/ui": "^4.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.45.0",
    
    "i18next-scanner": "^4.5.0"
  }
}
```

---

## 12. 国际化 (i18n)

> **📁 mpay 参考文件**
> ```
> pages/mime/pages/mime-language/                  # 语言切换页面
> src/i18n/                                        # 语言包目录（如存在）
> ```
> 
> **注意**: mpay 使用 Angular i18n，KeyApp 使用 i18next。
> 翻译文本可以参考 mpay 中的 `$localize` 模板字符串提取。

### 12.1 技术选型

| 库 | 版本 | 用途 |
|----|------|------|
| i18next | ^23.x | 国际化核心框架 |
| react-i18next | ^15.x | React 绑定 |
| i18next-browser-languagedetector | ^8.x | 浏览器语言检测 |
| i18next-http-backend | ^2.x | 动态加载语言包 |
| @formatjs/intl-numberformat | ^8.x | 数字/货币格式化 |
| @formatjs/intl-datetimeformat | ^6.x | 日期/时间格式化 |

### 12.2 支持的语言

| 语言代码 | 语言名称 | 方向 | 优先级 |
|---------|---------|------|--------|
| `zh-CN` | 简体中文 | LTR | P0 |
| `zh-TW` | 繁体中文 | LTR | P0 |
| `en` | English | LTR | P0 |
| `ja` | 日本語 | LTR | P1 |
| `ko` | 한국어 | LTR | P1 |
| `ar` | العربية | RTL | P2 |

### 12.3 目录结构

```
src/
├── i18n/
│   ├── index.ts                 # i18next 配置
│   ├── types.ts                 # 类型定义
│   ├── resources.ts             # 静态资源（首屏必需）
│   │
│   ├── locales/
│   │   ├── zh-CN/
│   │   │   ├── common.json      # 通用文案
│   │   │   ├── wallet.json      # 钱包相关
│   │   │   ├── transfer.json    # 转账相关
│   │   │   ├── staking.json     # 质押相关
│   │   │   ├── settings.json    # 设置相关
│   │   │   └── errors.json      # 错误提示
│   │   ├── zh-TW/
│   │   ├── en/
│   │   ├── ja/
│   │   ├── ko/
│   │   └── ar/
│   │
│   └── utils/
│       ├── format-number.ts     # 数字格式化
│       ├── format-date.ts       # 日期格式化
│       └── format-currency.ts   # 货币格式化
```

### 12.4 i18next 配置

```typescript
// src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'
import { resources } from './resources'

export const supportedLanguages = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ar'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

export const rtlLanguages: SupportedLanguage[] = ['ar']

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // 首屏必需的翻译内联加载
    resources,
    
    // 其他命名空间动态加载
    ns: ['common', 'wallet', 'transfer', 'staking', 'settings', 'errors'],
    defaultNS: 'common',
    
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    
    // 语言检测配置
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18n-language',
    },
    
    // 动态加载配置
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    interpolation: {
      escapeValue: false, // React 已处理 XSS
    },
    
    react: {
      useSuspense: true,
    },
  })

export default i18n

// 语言方向检测
export function isRTL(lang: string): boolean {
  return rtlLanguages.includes(lang as SupportedLanguage)
}
```

### 12.5 类型安全的翻译

```typescript
// src/i18n/types.ts
import type { resources } from './resources'

// 从资源文件自动推导类型
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: (typeof resources)['en']
  }
}

// 翻译键类型（用于类型检查）
export type TranslationKey = 
  | `common:${keyof (typeof resources)['en']['common']}`
  | `wallet:${keyof (typeof resources)['en']['wallet']}`
  | `transfer:${keyof (typeof resources)['en']['transfer']}`
  // ... 其他命名空间
```

```typescript
// src/i18n/resources.ts
// 首屏必需的翻译（内联打包，无网络请求）

export const resources = {
  en: {
    common: {
      loading: 'Loading...',
      confirm: 'Confirm',
      cancel: 'Cancel',
      back: 'Back',
      next: 'Next',
      done: 'Done',
      retry: 'Retry',
      copy: 'Copy',
      copied: 'Copied!',
      share: 'Share',
      settings: 'Settings',
    },
    wallet: {
      createWallet: 'Create Wallet',
      importWallet: 'Import Wallet',
      backup: 'Backup',
      noBackup: 'Not backed up',
      totalAssets: 'Total Assets',
    },
  },
  'zh-CN': {
    common: {
      loading: '加载中...',
      confirm: '确认',
      cancel: '取消',
      back: '返回',
      next: '下一步',
      done: '完成',
      retry: '重试',
      copy: '复制',
      copied: '已复制！',
      share: '分享',
      settings: '设置',
    },
    wallet: {
      createWallet: '创建钱包',
      importWallet: '导入钱包',
      backup: '备份',
      noBackup: '未备份',
      totalAssets: '总资产',
    },
  },
  // ... 其他语言
} as const
```

### 12.6 翻译文件示例

```json
// src/i18n/locales/zh-CN/transfer.json
{
  "title": "转账",
  "recipient": "收款地址",
  "recipientPlaceholder": "输入或粘贴地址",
  "amount": "金额",
  "amountPlaceholder": "0.00",
  "available": "可用: {{amount}} {{symbol}}",
  "all": "全部",
  "memo": "备注",
  "memoPlaceholder": "可选，最多 {{max}} 字符",
  "fee": "网络费用",
  "feeEstimating": "估算中...",
  "feeLevels": {
    "slow": "慢速 (约 {{time}})",
    "standard": "标准 (约 {{time}})",
    "fast": "快速 (约 {{time}})"
  },
  "total": "合计",
  "send": "发送",
  "sending": "发送中...",
  "success": "转账成功",
  "viewTransaction": "查看交易",
  "errors": {
    "invalidAddress": "无效的地址格式",
    "insufficientBalance": "余额不足",
    "amountTooSmall": "金额过小，最小 {{min}} {{symbol}}",
    "amountTooLarge": "金额超出可用余额",
    "networkError": "网络错误，请稍后重试"
  }
}
```

```json
// src/i18n/locales/en/transfer.json
{
  "title": "Transfer",
  "recipient": "Recipient Address",
  "recipientPlaceholder": "Enter or paste address",
  "amount": "Amount",
  "amountPlaceholder": "0.00",
  "available": "Available: {{amount}} {{symbol}}",
  "all": "Max",
  "memo": "Memo",
  "memoPlaceholder": "Optional, up to {{max}} characters",
  "fee": "Network Fee",
  "feeEstimating": "Estimating...",
  "feeLevels": {
    "slow": "Slow (~{{time}})",
    "standard": "Standard (~{{time}})",
    "fast": "Fast (~{{time}})"
  },
  "total": "Total",
  "send": "Send",
  "sending": "Sending...",
  "success": "Transfer Successful",
  "viewTransaction": "View Transaction",
  "errors": {
    "invalidAddress": "Invalid address format",
    "insufficientBalance": "Insufficient balance",
    "amountTooSmall": "Amount too small, minimum {{min}} {{symbol}}",
    "amountTooLarge": "Amount exceeds available balance",
    "networkError": "Network error, please try again"
  }
}
```

### 12.7 React 组件中使用

```typescript
// src/features/transfer/transfer-form.tsx
import { useTranslation } from 'react-i18next'
import { Trans } from 'react-i18next'

export function TransferForm() {
  const { t } = useTranslation('transfer')
  
  return (
    <div>
      <h1>{t('title')}</h1>
      
      {/* 简单文本 */}
      <label>{t('recipient')}</label>
      <input placeholder={t('recipientPlaceholder')} />
      
      {/* 带插值 */}
      <span>{t('available', { amount: '100.00', symbol: 'ETH' })}</span>
      
      {/* 嵌套键 */}
      <span>{t('feeLevels.standard', { time: '30s' })}</span>
      
      {/* 带 React 组件的复杂插值 */}
      <Trans
        i18nKey="transfer:confirmMessage"
        values={{ amount: '1.5', symbol: 'ETH' }}
        components={{
          strong: <strong className="text-primary" />,
        }}
      />
      
      {/* 错误消息 */}
      {error && <p className="text-destructive">{t(`errors.${error}`)}</p>}
    </div>
  )
}
```

### 12.8 数字/日期/货币格式化

```typescript
// src/i18n/utils/format-number.ts
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'

/**
 * 数字格式化 Hook
 */
export function useNumberFormat() {
  const { i18n } = useTranslation()
  const locale = i18n.language
  
  return useMemo(() => ({
    /**
     * 格式化整数
     */
    integer: (value: number | bigint) => {
      return new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }).format(value)
    },
    
    /**
     * 格式化小数
     */
    decimal: (value: number, decimals = 2) => {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value)
    },
    
    /**
     * 格式化百分比
     */
    percent: (value: number, decimals = 2) => {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value)
    },
    
    /**
     * 格式化紧凑数字 (1K, 1M, 1B)
     */
    compact: (value: number) => {
      return new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value)
    },
  }), [locale])
}

/**
 * 货币格式化 Hook
 */
export function useCurrencyFormat() {
  const { i18n } = useTranslation()
  const locale = i18n.language
  
  return useMemo(() => ({
    /**
     * 格式化法币
     */
    fiat: (value: number, currency = 'USD') => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    },
    
    /**
     * 格式化加密货币（保留精度）
     */
    crypto: (value: number | string, symbol: string, decimals = 8) => {
      const num = typeof value === 'string' ? parseFloat(value) : value
      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      }).format(num)
      return `${formatted} ${symbol}`
    },
  }), [locale])
}

/**
 * 日期/时间格式化 Hook
 */
export function useDateFormat() {
  const { i18n } = useTranslation()
  const locale = i18n.language
  
  return useMemo(() => ({
    /**
     * 格式化日期
     */
    date: (value: Date | number) => {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(value)
    },
    
    /**
     * 格式化时间
     */
    time: (value: Date | number) => {
      return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }).format(value)
    },
    
    /**
     * 格式化日期时间
     */
    datetime: (value: Date | number) => {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(value)
    },
    
    /**
     * 相对时间（3 分钟前）
     */
    relative: (value: Date | number) => {
      const now = Date.now()
      const then = typeof value === 'number' ? value : value.getTime()
      const diff = now - then
      
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
      
      if (diff < 60_000) return rtf.format(-Math.floor(diff / 1000), 'second')
      if (diff < 3600_000) return rtf.format(-Math.floor(diff / 60_000), 'minute')
      if (diff < 86400_000) return rtf.format(-Math.floor(diff / 3600_000), 'hour')
      return rtf.format(-Math.floor(diff / 86400_000), 'day')
    },
  }), [locale])
}
```

### 12.9 语言切换

```typescript
// src/stores/settings.store.ts
import { Store } from '@tanstack/store'
import i18n, { type SupportedLanguage, supportedLanguages, isRTL } from '@/i18n'

interface SettingsState {
  language: SupportedLanguage
  isRTL: boolean
}

const getInitialLanguage = (): SupportedLanguage => {
  const saved = localStorage.getItem('i18n-language')
  if (saved && supportedLanguages.includes(saved as SupportedLanguage)) {
    return saved as SupportedLanguage
  }
  return 'en'
}

export const settingsStore = new Store<SettingsState>({
  language: getInitialLanguage(),
  isRTL: isRTL(getInitialLanguage()),
})

export const settingsActions = {
  setLanguage: async (lang: SupportedLanguage) => {
    await i18n.changeLanguage(lang)
    settingsStore.setState((prev) => ({
      ...prev,
      language: lang,
      isRTL: isRTL(lang),
    }))
  },
}
```

```typescript
// src/components/settings/language-selector.tsx
import { useTranslation } from 'react-i18next'
import { useStore } from '@tanstack/react-store'
import { settingsStore, settingsActions } from '@/stores/settings.store'
import { supportedLanguages, type SupportedLanguage } from '@/i18n'

const languageNames: Record<SupportedLanguage, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',
  'ar': 'العربية',
}

export function LanguageSelector() {
  const { t } = useTranslation('settings')
  const currentLang = useStore(settingsStore, (s) => s.language)
  
  return (
    <div>
      <h3>{t('language')}</h3>
      <ul>
        {supportedLanguages.map((lang) => (
          <li key={lang}>
            <button
              onClick={() => settingsActions.setLanguage(lang)}
              className={currentLang === lang ? 'font-bold' : ''}
            >
              {languageNames[lang]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 12.10 RTL 支持

```typescript
// src/components/providers/direction-provider.tsx
import { useStore } from '@tanstack/react-store'
import { settingsStore } from '@/stores/settings.store'
import { useEffect } from 'react'

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const isRTL = useStore(settingsStore, (s) => s.isRTL)
  
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = settingsStore.state.language
  }, [isRTL])
  
  return <>{children}</>
}
```

```css
/* src/styles/globals.css - Tailwind 4.x RTL 支持 */
@import "tailwindcss";

@theme {
  /* ... 其他主题配置 */
}

/* RTL 逻辑属性 */
@utility ps-* {
  padding-inline-start: *;
}

@utility pe-* {
  padding-inline-end: *;
}

@utility ms-* {
  margin-inline-start: *;
}

@utility me-* {
  margin-inline-end: *;
}

/* RTL 翻转图标 */
[dir="rtl"] .rtl\:flip {
  transform: scaleX(-1);
}
```

### 12.11 与 TanStack Router 集成

```typescript
// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { settingsStore } from '@/stores/settings.store'
import { DirectionProvider } from '@/components/providers/direction-provider'
import { Suspense } from 'react'

export const Route = createRootRouteWithContext()({
  component: RootComponent,
})

function RootComponent() {
  const language = useStore(settingsStore, (s) => s.language)
  
  return (
    <DirectionProvider>
      <Suspense fallback={<LoadingScreen />}>
        <div 
          className="min-h-screen bg-grey font-sans antialiased"
          // 确保字体支持当前语言
          style={{ fontFamily: getFontFamily(language) }}
        >
          <Outlet />
        </div>
      </Suspense>
    </DirectionProvider>
  )
}

function getFontFamily(lang: string): string {
  switch (lang) {
    case 'zh-CN':
    case 'zh-TW':
      return 'system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'
    case 'ja':
      return 'system-ui, "Hiragino Sans", "Meiryo", sans-serif'
    case 'ko':
      return 'system-ui, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
    case 'ar':
      return 'system-ui, "Geeza Pro", "Traditional Arabic", sans-serif'
    default:
      return 'system-ui, -apple-system, sans-serif'
  }
}
```

### 12.12 翻译提取与管理

```json
// package.json 脚本
{
  "scripts": {
    "i18n:extract": "i18next-scanner --config i18next-scanner.config.js",
    "i18n:check": "i18next-scanner --config i18next-scanner.config.js --fail-on-warnings"
  }
}
```

```javascript
// i18next-scanner.config.js
module.exports = {
  input: ['src/**/*.{ts,tsx}'],
  output: './',
  options: {
    debug: true,
    func: {
      list: ['t', 'i18next.t'],
      extensions: ['.ts', '.tsx'],
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      extensions: ['.tsx'],
    },
    lngs: ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'ar'],
    defaultLng: 'en',
    defaultNs: 'common',
    resource: {
      loadPath: 'src/i18n/locales/{{lng}}/{{ns}}.json',
      savePath: 'src/i18n/locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
    },
    keySeparator: '.',
    nsSeparator: ':',
  },
}
```

---

## 13. DWEB 跨应用通讯（Plaoc 协议）

> **📁 mpay 参考文件**
> ```
> pages/authorize/                           # 授权页面入口
> pages/authorize/pages/address/             # 地址授权
>   ├── address.component.ts                 # 地址授权组件
>   └── address.resolver.ts                  # 数据解析
> pages/authorize/pages/signature/           # 签名授权（核心参考）
>   ├── signature.component.ts               # 签名处理逻辑（800+行，重要）
>   └── signature.resolver.ts                # 请求参数解析
> ```
> 
> **注意**: `signature.component.ts` 包含完整的签名流程实现，包括：
> - 各类签名类型处理（消息/转账/合约/实体）
> - 手续费估算逻辑
> - 余额校验
> - 多链签名差异处理

### 13.1 概述

DWEB（Decentralized Web）是分布式应用运行环境，Plaoc 是 DWEB 应用间通讯的协议。BFM Pay 作为钱包应用，接收其他 DApp 的授权和签名请求。

```
┌─────────────────────────────────────────────────────────────┐
│                    DWEB 运行时环境                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐   Plaoc IPC    ┌─────────────────────┐    │
│  │   DApp A    │ ◄────────────► │                     │    │
│  └─────────────┘                │                     │    │
│                                 │     BFM Pay         │    │
│  ┌─────────────┐   Plaoc IPC    │     (钱包服务)       │    │
│  │   DApp B    │ ◄────────────► │                     │    │
│  └─────────────┘                │                     │    │
│                                 └─────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 13.2 Plaoc 协议路径

```typescript
// src/services/plaoc/types.ts

/**
 * Plaoc 协议路径
 */
export const PLAOC_PATH = {
  /** 获取钱包地址 */
  getAddress: 'getAddress',
  /** 签名请求 */
  signature: 'signature',
  /** 查询资产余额 */
  assetBalance: 'assetBalance',
} as const

export type PlaocPath = (typeof PLAOC_PATH)[keyof typeof PLAOC_PATH]

/**
 * 地址授权类型
 */
export const ADDRESS_AUTH_TYPE = {
  /** 单钱包授权 - 当前钱包的所有链地址 */
  main: 'main',
  /** 单链授权 - 指定链的所有钱包地址 */
  network: 'network',
  /** 全部授权 - 所有钱包的所有地址 */
  all: 'all',
} as const

export type AddressAuthType = (typeof ADDRESS_AUTH_TYPE)[keyof typeof ADDRESS_AUTH_TYPE]

/**
 * 签名类型
 */
export const SIGNATURE_TYPE = {
  /** 消息签名 */
  message: 'message',
  /** JSON 签名 */
  json: 'json',
  /** 转账签名 */
  transfer: 'transfer',
  /** 凭证转账 (BioforestChain) */
  certificateTransfer: 'certificateTransfer',
  /** 实体/NFT 操作 */
  entity: 'entity',
  /** 智能合约 */
  contract: 'contract',
  /** 资产余额查询 */
  assetTypeBalance: 'assetTypeBalance',
  /** 销毁资产 */
  destroy: 'destroy',
} as const

export type SignatureType = (typeof SIGNATURE_TYPE)[keyof typeof SIGNATURE_TYPE]
```

### 13.3 请求/响应类型

```typescript
// src/services/plaoc/request-types.ts

import type { ChainId, Address, Hex } from '@/services/types/core'

/**
 * DApp 信息
 */
export interface DAppInfo {
  /** 应用名称 */
  name: string
  /** 应用图标 */
  logo: string
  /** 应用域名 */
  home: string
}

/**
 * 获取地址请求
 */
export interface GetAddressRequest extends DAppInfo {
  /** 授权类型 */
  type: AddressAuthType
  /** 指定链（type=network 时必填） */
  chainName?: ChainId
  /** 是否需要签名消息证明身份 */
  signMessage?: string
  /** 是否返回助记词（危险，需特殊权限） */
  getMain?: boolean
}

/**
 * 获取地址响应
 */
export interface GetAddressResponse {
  /** 钱包名称 */
  name: string
  /** 链名称 */
  chainName: ChainId
  /** 地址 */
  address: Address
  /** 公钥 */
  publicKey: Hex
  /** 链标识 (BioforestChain) */
  magic?: string
  /** 身份签名 */
  signMessage?: string
}

/**
 * 签名请求基类
 */
export interface SignatureRequestBase extends DAppInfo {
  /** 签名类型 */
  type: SignatureType
  /** 链名称 */
  chainName: ChainId
  /** 发送地址 */
  senderAddress: Address
}

/**
 * 消息签名请求
 */
export interface MessageSignatureRequest extends SignatureRequestBase {
  type: typeof SIGNATURE_TYPE.message
  /** 要签名的消息 */
  message: string
}

/**
 * JSON 签名请求
 */
export interface JsonSignatureRequest extends SignatureRequestBase {
  type: typeof SIGNATURE_TYPE.json
  /** 要签名的 JSON */
  json: Record<string, unknown>
  /** JSON 插值配置（用于引用其他签名结果） */
  jsonInterpolation?: Array<{
    index: number
    path: string
  }>
}

/**
 * 转账签名请求
 */
export interface TransferSignatureRequest extends SignatureRequestBase {
  type: typeof SIGNATURE_TYPE.transfer
  /** 接收地址 */
  receiveAddress: Address
  /** 金额（最小单位） */
  balance: string
  /** 资产类型 */
  assetType?: string
  /** 手续费 */
  fee?: string
  /** 备注 */
  remark?: string
  /** 合约信息（代币转账） */
  contractInfo?: {
    contractAddress: Address
    assetType: string
    decimals: number
  }
  /** EVM Gas 配置 */
  ethereumGasInfo?: {
    maxPriorityFeePerGas: string
  }
  /** BSC Gas 配置 */
  binanceGasInfo?: {
    gasLimit: number | string
    gasPrice: number | string
  }
}

/**
 * 合约签名请求
 */
export interface ContractSignatureRequest extends SignatureRequestBase {
  type: typeof SIGNATURE_TYPE.contract
  /** 合约地址 */
  receiveAddress: Address
  /** 调用金额 */
  amount?: string
  /** 调用数据 */
  data: Hex
  /** Gas 配置 */
  binanceGasInfo?: {
    gasLimit: number | string
    gasPrice: number | string
  }
  /** 是否广播 */
  broadcast?: boolean
  /** 是否等待上链 */
  waitTrsInBlock?: boolean
  /** 等待超时（毫秒） */
  waitTime?: number
}

/**
 * 资产余额查询请求
 */
export interface AssetBalanceRequest extends SignatureRequestBase {
  type: typeof SIGNATURE_TYPE.assetTypeBalance
  /** 要查询的资产类型列表 */
  assetTypes: Array<{
    assetType: string
    contractAddress?: Address
  }>
}

/**
 * 签名请求联合类型
 */
export type SignatureRequest =
  | MessageSignatureRequest
  | JsonSignatureRequest
  | TransferSignatureRequest
  | ContractSignatureRequest
  | AssetBalanceRequest
  // ... 其他类型

/**
 * 签名响应
 */
export type SignatureResponse =
  | string // 消息签名结果
  | { txId: string; transaction: string } // 交易签名结果
  | { error: boolean; message: string } // 错误
  | Record<string, { assetType: string; decimals: number; balance: string }> // 余额查询结果
```

### 13.4 Plaoc Service

```typescript
// src/services/plaoc/plaoc-service.ts

import { createSubscribable, type Subscribable } from '@/services/events/types'
import type {
  GetAddressRequest,
  GetAddressResponse,
  SignatureRequest,
  SignatureResponse,
  DAppInfo,
} from './request-types'
import type { PlaocPath } from './types'

/**
 * Plaoc 事件
 */
export interface PlaocEvent<T = unknown> {
  /** 事件 ID */
  eventId: string
  /** 协议路径 */
  path: PlaocPath
  /** 请求数据 */
  data: T
  /** DApp 信息 */
  appInfo: DAppInfo
}

/**
 * Plaoc Service
 * 处理 DWEB 应用间通讯
 */
export class PlaocService {
  private pendingRequests = new Map<string, {
    resolve: (value: unknown) => void
    reject: (error: Error) => void
  }>()

  private eventListeners = new Map<string, Set<(event: PlaocEvent) => void>>()

  /**
   * 监听 Plaoc 请求
   */
  onRequest<T extends PlaocPath>(
    path: T,
    handler: (event: PlaocEvent) => void
  ): () => void {
    if (!this.eventListeners.has(path)) {
      this.eventListeners.set(path, new Set())
    }
    this.eventListeners.get(path)!.add(handler)

    return () => {
      this.eventListeners.get(path)?.delete(handler)
    }
  }

  /**
   * 响应请求
   */
  respondWith<T>(eventId: string, path: PlaocPath, data: T): void {
    // 发送响应给 DWEB 运行时
    this.sendToRuntime({
      type: 'response',
      eventId,
      path,
      data,
    })

    // 清理
    this.pendingRequests.delete(eventId)
  }

  /**
   * 拒绝请求
   */
  reject(eventId: string, reason: string): void {
    this.sendToRuntime({
      type: 'reject',
      eventId,
      reason,
    })

    this.pendingRequests.delete(eventId)
  }

  /**
   * 移除事件（清理）
   */
  removeEventId(eventId: string): void {
    this.pendingRequests.delete(eventId)
  }

  /**
   * 最大化应用窗口（DWEB 环境）
   */
  async appMaximize(): Promise<void> {
    // 调用 DWEB 运行时 API
  }

  private sendToRuntime(message: unknown): void {
    // 与 DWEB 运行时通讯
    // 具体实现依赖于 DWEB SDK
  }
}

export const plaocService = new PlaocService()
```

### 13.5 授权页面路由

```typescript
// src/routes/authorize/address.tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AuthorizeAddressPage } from '@/features/authorize/address-page'

const searchSchema = z.object({
  eventId: z.string(),
  type: z.enum(['main', 'network', 'all']),
  chainName: z.string().optional(),
  appName: z.string(),
  appHome: z.string(),
  appLogo: z.string(),
  signMessage: z.string().optional(),
})

export const Route = createFileRoute('/authorize/address')({
  validateSearch: searchSchema,
  component: AuthorizeAddressPage,
})

// src/routes/authorize/signature.tsx
import { createFileRoute } from '@tanstack/react-router'
import { AuthorizeSignaturePage } from '@/features/authorize/signature-page'

export const Route = createFileRoute('/authorize/signature')({
  component: AuthorizeSignaturePage,
})
```

### 13.6 授权确认组件

```typescript
// src/features/authorize/components/authorize-card.tsx

import { useTranslation } from 'react-i18next'
import type { DAppInfo } from '@/services/plaoc/request-types'

interface AuthorizeCardProps {
  appInfo: DAppInfo
  title: string
  description: string
  children: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  isLoading?: boolean
}

export function AuthorizeCard({
  appInfo,
  title,
  description,
  children,
  onConfirm,
  onCancel,
  confirmText,
  isLoading,
}: AuthorizeCardProps) {
  const { t } = useTranslation('authorize')

  return (
    <div className="flex flex-col h-full">
      {/* DApp 来源信息 */}
      <div className="flex items-center gap-3 p-4 border-b">
        <img 
          src={appInfo.logo} 
          alt={appInfo.name}
          className="w-12 h-12 rounded-xl"
        />
        <div>
          <h3 className="font-medium">{appInfo.name}</h3>
          <p className="text-sm text-muted-foreground">{appInfo.home}</p>
        </div>
      </div>

      {/* 授权内容 */}
      <div className="flex-1 p-4 overflow-auto">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-subtext mb-4">{description}</p>
        {children}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 p-4 border-t">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <GradientButton 
          className="flex-1" 
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? t('confirming') : (confirmText ?? t('confirm'))}
        </GradientButton>
      </div>
    </div>
  )
}
```

### 13.7 签名类型展示

```typescript
// src/features/authorize/components/signature-detail.tsx

import { useTranslation } from 'react-i18next'
import { useCurrencyFormat } from '@/i18n/utils/format-number'
import type { SignatureRequest } from '@/services/plaoc/request-types'
import { SIGNATURE_TYPE } from '@/services/plaoc/types'

interface SignatureDetailProps {
  request: SignatureRequest
}

export function SignatureDetail({ request }: SignatureDetailProps) {
  const { t } = useTranslation('authorize')
  const { crypto } = useCurrencyFormat()

  switch (request.type) {
    case SIGNATURE_TYPE.message:
      return (
        <div className="space-y-3">
          <Label>{t('messageToSign')}</Label>
          <div className="p-3 bg-grey rounded-lg font-mono text-sm break-all">
            {request.message}
          </div>
        </div>
      )

    case SIGNATURE_TYPE.transfer:
      return (
        <div className="space-y-4">
          <DetailRow label={t('from')} value={request.senderAddress} />
          <DetailRow label={t('to')} value={request.receiveAddress} />
          <DetailRow 
            label={t('amount')} 
            value={crypto(
              request.balance, 
              request.assetType ?? 'TOKEN',
              request.contractInfo?.decimals ?? 8
            )} 
          />
          {request.fee && (
            <DetailRow label={t('fee')} value={`${request.fee} (estimated)`} />
          )}
          {request.remark && (
            <DetailRow label={t('memo')} value={request.remark} />
          )}
        </div>
      )

    case SIGNATURE_TYPE.contract:
      return (
        <div className="space-y-4">
          <DetailRow label={t('contract')} value={request.receiveAddress} />
          <DetailRow label={t('data')} value={request.data} truncate />
          {request.amount && request.amount !== '0' && (
            <DetailRow label={t('value')} value={request.amount} />
          )}
        </div>
      )

    default:
      return <div>{t('unknownSignatureType')}</div>
  }
}

function DetailRow({ 
  label, 
  value, 
  truncate 
}: { 
  label: string
  value: string
  truncate?: boolean 
}) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-subtext">{label}</span>
      <span className={`text-right ${truncate ? 'truncate max-w-[200px]' : ''}`}>
        {value}
      </span>
    </div>
  )
}
```

### 13.8 DWEB 环境检测

```typescript
// src/lib/dweb/detect.ts

import { isMobile } from '@plaoc/is-dweb'

/**
 * 是否在 DWEB 环境中运行
 */
export function isDwebEnvironment(): boolean {
  return typeof window !== 'undefined' && 
         'DWEB_APP' in (window as any) &&
         (window as any).DWEB_APP === true
}

/**
 * 是否在移动端 DWEB 环境
 */
export function isMobileDweb(): boolean {
  return isDwebEnvironment() && isMobile()
}

/**
 * 获取 DWEB 渠道
 */
export function getDwebChannel(): 'dweb' | 'dwebalpha' | 'alpha' | 'beta' | null {
  if (!isDwebEnvironment()) return null
  return (window as any).APP_CHANNEL ?? null
}
```

### 13.9 与 TanStack Router 集成

```typescript
// src/lib/dweb/router-integration.ts

import { router } from '@/router'
import { plaocService } from '@/services/plaoc/plaoc-service'
import { PLAOC_PATH } from '@/services/plaoc/types'
import type { GetAddressRequest, SignatureRequest } from '@/services/plaoc/request-types'

/**
 * 初始化 Plaoc 路由集成
 */
export function initPlaocRouterIntegration(): void {
  // 监听地址授权请求
  plaocService.onRequest(PLAOC_PATH.getAddress, (event) => {
    const request = event.data as GetAddressRequest
    
    router.navigate({
      to: '/authorize/address',
      search: {
        eventId: event.eventId,
        type: request.type,
        chainName: request.chainName,
        appName: request.name,
        appHome: request.home,
        appLogo: request.logo,
        signMessage: request.signMessage,
      },
    })
  })

  // 监听签名请求
  plaocService.onRequest(PLAOC_PATH.signature, (event) => {
    const requests = event.data as SignatureRequest[]
    
    // 存储签名请求到 Store
    authorizeStore.setState((s) => ({
      ...s,
      pendingSignatures: requests,
      currentEventId: event.eventId,
      appInfo: {
        name: requests[0]?.appName ?? '',
        home: requests[0]?.appHome ?? '',
        logo: requests[0]?.appLogo ?? '',
      },
    }))

    router.navigate({ to: '/authorize/signature' })
  })
}
```

### 13.10 依赖

```json
{
  "dependencies": {
    "@plaoc/is-dweb": "^1.0.0",
    "@plaoc/plugins": "^1.0.0"
  }
}
```

---

## 14. 密钥派生与加密

### 14.1 双轨密钥派生体系

BFM Pay 支持两种不同的密钥派生方式，分别服务于不同的区块链生态：

| 特性 | BIP39/BIP44 (外部链) | BioForestChain (内部链) |
|-----|---------------------|------------------------|
| 输入 | 12/24 词 BIP39 助记词 | **任意字符串** |
| 种子生成 | PBKDF2 (2048轮) | SHA256 (单次) |
| 椭圆曲线 | secp256k1 | **Ed25519** |
| 派生路径 | BIP44 (m/44'/coin'/0'/0/x) | 无派生路径 |
| 支持链 | Ethereum, Bitcoin, Tron | BFMeta, CCChain, PMChain 等 |

### 14.2 BIP39/BIP44 派生 (外部链)

用于主流区块链，遵循行业标准：

```typescript
import { deriveKey, deriveMultiChainKeys } from '@/lib/crypto'

// 单链派生
const ethKey = deriveKey(mnemonic, 'ethereum', 0)
// { privateKey, publicKey, address, path: "m/44'/60'/0'/0/0", chain: 'ethereum' }

// 多链批量派生
const keys = deriveMultiChainKeys(mnemonic, ['ethereum', 'bitcoin', 'tron'])
```

**支持的链与 BIP44 路径:**

| 链 | Coin Type | 路径示例 | 地址格式 |
|---|-----------|---------|---------|
| Ethereum | 60 | m/44'/60'/0'/0/0 | 0x... (EIP-55 checksum) |
| Bitcoin | 0 | m/44'/0'/0'/0/0 | 1... / 3... (P2PKH/P2SH) |
| Tron | 195 | m/44'/195'/0'/0/0 | T... (Base58Check) |

### 14.3 BioForestChain 派生 (内部链)

BioForestChain 生态使用独特的密钥派生方式，**允许任意字符串作为密钥种子**：

```typescript
import { 
  deriveBioforestKey, 
  deriveBioforestMultiChainKeys,
  createBioforestKeypair,
  isBioforestChain 
} from '@/lib/crypto'

// 从任意字符串派生（可以是助记词、密码、或任何文本）
const bfmetaKey = deriveBioforestKey('my secret phrase', 'bfmeta')
// { privateKey, publicKey, address: 'c...', chain: 'bfmeta' }

// 多链派生（所有 BioForest 链共享同一密钥对）
const keys = deriveBioforestMultiChainKeys('my secret', ['bfmeta', 'pmchain', 'ccchain'])

// 底层 API
const keypair = createBioforestKeypair('any string')
// { secretKey: Uint8Array(64), publicKey: Uint8Array(32) }
```

**算法详解:**

```
┌─────────────────────────────────────────────────────────────┐
│                    BioForest 密钥派生                        │
├─────────────────────────────────────────────────────────────┤
│  Input: 任意字符串 (UTF-8)                                   │
│    ↓                                                        │
│  SHA256(input) → 32字节 seed                                │
│    ↓                                                        │
│  Ed25519.getPublicKey(seed) → 32字节 publicKey              │
│    ↓                                                        │
│  secretKey = seed || publicKey (64字节)                     │
├─────────────────────────────────────────────────────────────┤
│                    地址生成                                  │
├─────────────────────────────────────────────────────────────┤
│  publicKey                                                  │
│    ↓                                                        │
│  SHA256(publicKey) → 32字节                                 │
│    ↓                                                        │
│  RIPEMD160(sha256Result) → 20字节                           │
│    ↓                                                        │
│  Base58Encode(ripemd160Result) → 地址主体                   │
│    ↓                                                        │
│  prefix + base58Address → 最终地址 (如 "c3nqGnt...")        │
└─────────────────────────────────────────────────────────────┘
```

**支持的 BioForest 链:**

| 链 | 前缀 | 精度 | 符号 | 说明 |
|---|------|------|------|------|
| bfmeta | c | 8 | BFT | BFMeta 主链 |
| pmchain | c | 8 | PM | PMChain |
| ccchain | c | 8 | CC | CCChain |
| bfchainv2 | c | 8 | BFT | BFChain V2 |
| btgmeta | c | 8 | BTG | BTGMeta |
| biwmeta | c | 8 | BIW | BIWMeta |
| ethmeta | c | 8 | ETM | ETHMeta |
| malibu | c | 8 | MLB | Malibu |

### 14.4 签名与验证

**BioForest 链签名:**

```typescript
import { signMessage, verifySignature, createBioforestKeypair } from '@/lib/crypto'

const keypair = createBioforestKeypair('my secret')

// 签名消息
const signature = signMessage('Hello BioForest', keypair.secretKey)
// Uint8Array(64) - Ed25519 签名

// 验证签名
const isValid = verifySignature('Hello BioForest', signature, keypair.publicKey)
// true
```

### 14.5 加密存储

钱包密钥使用 AES-256-GCM 加密后存储：

```typescript
import { encrypt, decrypt, storeMnemonic, retrieveMnemonic } from '@/lib/crypto'

// 底层加密 API
const encrypted = await encrypt('sensitive data', 'user password')
// { ciphertext, iv, salt, tag }

const decrypted = await decrypt(encrypted, 'user password')
// 'sensitive data'

// 高级 API（自动处理 DWEB 生物识别）
await storeMnemonic('my mnemonic phrase', 'password123')
const mnemonic = await retrieveMnemonic('password123')
```

**加密参数:**
- 算法: AES-256-GCM
- 密钥派生: PBKDF2 (100,000 轮)
- Salt: 32字节随机
- IV: 12字节随机

### 14.6 判断链类型

```typescript
import { isBioforestChain } from '@/lib/crypto'

isBioforestChain('bfmeta')    // true
isBioforestChain('ethereum')  // false
isBioforestChain('bitcoin')   // false

// 在钱包创建流程中使用
function deriveAddress(secret: string, chain: string) {
  if (isBioforestChain(chain)) {
    return deriveBioforestKey(secret, chain)
  } else {
    // 需要验证 secret 是有效的 BIP39 助记词
    return deriveKey(secret, chain as DeriveChainType)
  }
}
```

### 14.7 mpay 原始实现参考

BioForest 密钥派生的原始实现位于：

| 功能 | mpay 路径 |
|-----|----------|
| 密钥派生 | `@bfmeta/sign-util` (内部包) |
| 链服务基类 | `libs/wallet-base/services/wallet/chain-base/bioforest-chain.base.ts` |
| 链服务调用 | `libs/wallet-base/services/wallet/chain/chain.service.ts` |

核心方法:
```typescript
// mpay 中的调用方式
const { secretKey, publicKey } = await chainApiService.createKeypair(mnemonic)
const address = await chainApiService.getAddressByPublicKeyBuffer(publicKey)
```

---

## 15. 脚本命令

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    
    "storybook": "storybook dev -p 6006",
    "storybook:build": "storybook build",
    "storybook:test": "test-storybook",
    
    "lint": "oxlint .",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write src",
    
    "i18n:extract": "i18next-scanner --config i18next-scanner.config.js",
    "i18n:check": "i18next-scanner --config i18next-scanner.config.js --fail-on-warnings"
  }
}
```

---

## 16. 多链配置（Chain Config Management）

> **Acceptance #4**：链配置必须可订阅、可手动添加、可启用/禁用，并驱动钱包/资产相关流程（不再硬编码链白名单）。

### 16.1 数据来源与合并

- 默认配置：`public/configs/default-chains.json`
- 订阅配置：Settings → Chains 填入 URL，点击“刷新订阅”拉取（带 ETag 缓存），结果持久化到 IndexedDB
- 手动配置：Settings → Chains 粘贴 JSON（单对象或数组），点击“添加”，结果持久化到 IndexedDB
- 合并优先级：`manual > subscription > default`（按 `id` 覆盖）
- 启用状态：`enabledMap (id -> boolean)` 独立存储；`enabled=false` 的链不会进入 `getEnabledChains()`
- 版本兼容：`version` 为 `major.minor`；当前所有 `type` 仅支持 `major <= 1`，不兼容会被标记为 warning 且不会被启用

### 16.2 JSON 格式（Power Users）

输入可以是单个对象或数组，字段如下：

- `id`: 必须匹配 `/^[a-z0-9-]+$/`（建议全小写 + `-`，避免使用 `:` 等字符）
- `version`: `"major.minor"`（例如 `"1.0"`）
- `type`: `"bioforest" | "evm" | "bip39" | "custom"`（订阅 JSON 中的未知 `type` 会被归一化为 `custom`）
- `name`: 显示名称
- `symbol`: 代币符号
- `decimals`: 精度（0–18）
- 可选字段：
  - `prefix`：BioForest 地址前缀（默认 `c`）
  - `rpcUrl`：EVM RPC URL
  - `explorerUrl`：浏览器 URL
  - `icon`：图标（URL 或标识）

示例（单条）：

```json
{
  "id": "bf-demo",
  "version": "1.0",
  "type": "bioforest",
  "name": "BF Demo",
  "symbol": "BFD",
  "decimals": 8,
  "prefix": "c"
}
```

示例（多条）：

```json
[
  {
    "id": "bf-sub",
    "version": "1.0",
    "type": "bioforest",
    "name": "BF Sub",
    "symbol": "BFS",
    "decimals": 8,
    "prefix": "c"
  },
  {
    "id": "eth-mainnet",
    "version": "1.0",
    "type": "evm",
    "name": "Ethereum",
    "symbol": "ETH",
    "decimals": 18,
    "rpcUrl": "https://rpc.ankr.com/eth"
  }
]
```

### 16.3 关键实现位置（KeyApp）

- Schema：`src/services/chain-config/schema.ts`
- Service：`src/services/chain-config/index.ts`（initialize/merge/addManual/setSubscriptionUrl/refreshSubscription）
- Store：`src/stores/chain-config.ts`
- Settings UI：`src/pages/settings/chain-config.tsx`

### 16.4 钱包派生与 `type=bioforest`

- `type === "bioforest"` 的链配置会参与 BioForest 地址派生（Ed25519），并支持自定义 `id`（只要满足 `id` 正则）。
- 钱包 create/import 使用 `chainConfigSelectors.getEnabledBioforestChainConfigs()`，为每个启用的 bioforest config 派生 `{ chainId, address }`。

---

## 附录 A：mpay 关键文件参考索引

> **使用说明**: 开发特定功能前，先阅读对应的 mpay 文件以理解业务逻辑。
> 路径基于: `/Users/kzf/Dev/bioforestChain/legacy-apps/apps/mpay/src/`

### A.1 页面组件

| 功能 | mpay 文件路径 | 说明 |
|-----|--------------|------|
| **首页** | `pages/home/home.component.ts` | 钱包列表、资产展示 |
| **钱包列表** | `pages/home/components/wallet-list/` | 钱包列表组件 |
| **创建钱包** | `pages/home/pages/home-create-wallet/` | 新钱包创建流程 |
| **导入钱包** | `pages/home/pages/home-import-wallet/` | 助记词/私钥导入 |
| **钱包管理** | `pages/home/pages/home-manage-wallets/` | 编辑、删除钱包 |
| **收款** | `pages/home/pages/home-receive/` | 二维码生成、地址展示 |
| **转账** | `pages/mnemonic/pages/home-transfer/` | 转账表单、手续费计算 |
| **代币详情** | `pages/mnemonic/pages/home-token-details/` | 资产详情、交易历史 |
| **交易详情** | `pages/mnemonic/pages/home-token-transaction-details/` | 单笔交易详情 |

### A.2 质押功能

| 功能 | mpay 文件路径 | 说明 |
|-----|--------------|------|
| **质押入口** | `pages/staking/staking.component.ts` | 质押概览 |
| **质押路由** | `pages/staking/staking.routes.ts` | 质押子路由 |
| **铸造** | `pages/staking/pages/mint/` | 质押铸造 |
| **销毁** | `pages/staking/pages/burn/` | 赎回销毁 |
| **记录** | `pages/staking/pages/record-list/` | 质押历史 |

### A.3 安全与密码

| 功能 | mpay 文件路径 | 说明 |
|-----|--------------|------|
| **设置密码** | `pages/mnemonic/pages/set-wallet-password/` | 首次设置密码 |
| **修改密码** | `pages/mnemonic/pages/change-password/` | 修改钱包密码 |
| **重置密码** | `pages/mnemonic/pages/reset-password/` | 通过助记词重置 |
| **备份助记词** | `pages/mnemonic/pages/mnemonics-backup/` | 助记词备份流程 |
| **确认备份** | `pages/mnemonic/pages/mnemonic-confirm-backup/` | 验证备份正确性 |
| **应用锁** | `pages/mime/pages/application-lock/` | 应用锁开关 |
| **指纹支付** | `pages/mnemonic/pages/set-wallet-fingerprint-pay/` | 生物识别设置 |

### A.4 "我的"页面

| 功能 | mpay 文件路径 | 说明 |
|-----|--------------|------|
| **我的主页** | `pages/mime/mime.component.ts` | 设置页面入口 |
| **地址簿** | `pages/mime/pages/address-book/` | 联系人管理 |
| **语言设置** | `pages/mime/pages/mime-language/` | 多语言切换 |
| **添加地址** | `pages/mime/pages/operate-address/` | 新增联系人 |

### A.5 DWEB 授权（核心）

| 功能 | mpay 文件路径 | 说明 |
|-----|--------------|------|
| **授权路由** | `pages/authorize/authorize.routes.ts` | 授权入口路由 |
| **地址授权** | `pages/authorize/pages/address/` | 返回钱包地址给 DApp |
| **签名授权** | `pages/authorize/pages/signature/` | **核心**：签名处理逻辑 |
| **签名解析** | `pages/authorize/pages/signature/signature.resolver.ts` | 请求参数解析 |

### A.6 服务层

| 功能 | mpay 文件路径 | 说明 |
|-----|--------------|------|
| **钱包存储** | `services/expansion-tools/wallet-data-stroage.ts` | 钱包数据持久化 |
| **钱包工具** | `services/expansion-tools/wallet.ts` | 钱包操作工具 |
| **链配置** | `services/expansion-tools/chain.ts` | 多链配置 |
| **权限服务** | `services/permission/permission.service.ts` | 权限管理 |

### A.7 共享组件

| 组件 | mpay 文件路径 | 说明 |
|-----|--------------|------|
| **图标组件** | `components/icon/icon.component.ts` | 统一图标渲染 |
| **底部标签** | `components/tab-nav/tab-nav.component.ts` | 底部导航栏 |
| **版本升级** | `components/version-upgrade/` | 版本检测与升级提示 |
| **表单提示** | `components/form-validation-top-tips/` | 表单验证提示 |

### A.8 工具函数

| 功能 | mpay 文件路径 | 说明 |
|-----|--------------|------|
| **通用工具** | `helpers/utils/index.ts` | 各种工具函数 |
| **管道** | `pipes/` | Angular 管道（参考转换逻辑） |
| **环境配置** | `environments/` | 环境变量配置 |

---

*文档版本: 7.0*
*技术栈: React 19 + Vite 7 + TanStack + shadcn/ui + Tailwind 4 + Zod 4 + i18next + DWEB/Plaoc + Storybook 10 + Vitest 4*
*配套文档: PDR.md (产品需求) / SERVICE-SPEC.md (服务接口规范)*
