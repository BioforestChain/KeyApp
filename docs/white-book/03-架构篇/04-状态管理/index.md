# 第十章：状态管理

> 定义 TanStack Store/Query 使用方案

---

## 10.1 状态分类

### 三类状态

| 类型 | 特点 | 工具 | 示例 |
|-----|------|------|------|
| 客户端状态 | 本地、持久化 | TanStack Store | 钱包列表、用户偏好 |
| 服务端状态 | 远程、缓存 | TanStack Query | 余额、交易历史 |
| 表单状态 | 临时、可重置 | TanStack Form | 转账表单、创建钱包 |

### 状态层次图

```
┌──────────────────────────────────────────┐
│              TanStack Form               │
│          (表单级，组件内生命周期)          │
├──────────────────────────────────────────┤
│              TanStack Query              │
│         (应用级，自动缓存和同步)           │
├──────────────────────────────────────────┤
│              TanStack Store              │
│          (应用级，持久化到本地)            │
└──────────────────────────────────────────┘
```

---

## 10.2 TanStack Store (客户端状态)

### 创建 Store

```typescript
// src/stores/wallet.ts
import { Store } from '@tanstack/store'

// 状态类型定义
interface WalletState {
  wallets: Wallet[]
  currentWalletId: string | null
  selectedChain: ChainId | null
}

// 初始状态
const initialState: WalletState = {
  wallets: [],
  currentWalletId: null,
  selectedChain: null,
}

// 从 localStorage 恢复
function loadState(): Partial<WalletState> {
  try {
    const saved = localStorage.getItem('bfm_wallets')
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

// 创建 Store
export const walletStore = new Store<WalletState>({
  ...initialState,
  ...loadState(),
})

// 持久化订阅
walletStore.subscribe(() => {
  localStorage.setItem('bfm_wallets', JSON.stringify(walletStore.state))
})
```

### 定义 Actions

```typescript
// src/stores/wallet.ts (续)
export const walletActions = {
  // 添加钱包
  addWallet: (wallet: Wallet) => {
    walletStore.setState((prev) => ({
      ...prev,
      wallets: [...prev.wallets, wallet],
      currentWalletId: wallet.id,
    }))
  },
  
  // 切换当前钱包
  setCurrentWallet: (walletId: string) => {
    walletStore.setState((prev) => ({
      ...prev,
      currentWalletId: walletId,
    }))
  },
  
  // 切换链
  setSelectedChain: (chain: ChainId) => {
    walletStore.setState((prev) => ({
      ...prev,
      selectedChain: chain,
    }))
  },
  
  // 删除钱包
  removeWallet: (walletId: string) => {
    walletStore.setState((prev) => {
      const wallets = prev.wallets.filter((w) => w.id !== walletId)
      return {
        ...prev,
        wallets,
        currentWalletId: wallets[0]?.id ?? null,
      }
    })
  },
}
```

### 在组件中使用

```typescript
import { useStore } from '@tanstack/react-store'
import { walletStore, walletActions } from '@/stores/wallet'

function WalletSelector() {
  // 细粒度订阅（只在 wallets 变化时重渲染）
  const wallets = useStore(walletStore, (s) => s.wallets)
  const currentId = useStore(walletStore, (s) => s.currentWalletId)
  
  return (
    <select
      value={currentId ?? ''}
      onChange={(e) => walletActions.setCurrentWallet(e.target.value)}
    >
      {wallets.map((w) => (
        <option key={w.id} value={w.id}>{w.name}</option>
      ))}
    </select>
  )
}
```

---

## 10.3 TanStack Query (服务端状态)

### Query Client 配置

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,        // 1 分钟内不重新请求
      gcTime: 1000 * 60 * 5,       // 5 分钟后清理缓存
      retry: 2,                    // 失败重试 2 次
      refetchOnWindowFocus: false, // 切换窗口不刷新
      refetchOnReconnect: true,    // 网络恢复时刷新
    },
    mutations: {
      retry: 1,
    },
  },
})
```

### 定义 Query Keys

```typescript
// src/features/wallet/queries.ts
export const walletKeys = {
  all: ['wallets'] as const,
  lists: () => [...walletKeys.all, 'list'] as const,
  detail: (id: string) => [...walletKeys.all, 'detail', id] as const,
  balances: (address: string, chain: string) =>
    [...walletKeys.all, 'balances', address, chain] as const,
}
```

### 定义 Query Options

```typescript
// src/features/wallet/queries.ts
import { queryOptions } from '@tanstack/react-query'

export const walletQueries = {
  // 获取余额
  balances: (address: string, chain: string) =>
    queryOptions({
      queryKey: walletKeys.balances(address, chain),
      queryFn: () => chainService.getBalances(address, chain),
      staleTime: 30_000,  // 30 秒
      refetchInterval: 60_000,  // 每分钟刷新
    }),
  
  // 获取交易历史
  history: (address: string) =>
    queryOptions({
      queryKey: ['transactions', address],
      queryFn: () => chainService.getTransactions(address),
      staleTime: 60_000,
    }),
}
```

### 在组件中使用

```typescript
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { walletQueries } from '@/features/wallet/queries'

// 普通查询
function BalanceDisplay({ address, chain }) {
  const { data, isLoading, error, refetch } = useQuery(
    walletQueries.balances(address, chain)
  )
  
  if (isLoading) return <Skeleton />
  if (error) return <ErrorState onRetry={refetch} />
  
  return <AmountDisplay value={data.balance} />
}

// Suspense 查询
function BalanceDisplaySuspense({ address, chain }) {
  const { data } = useSuspenseQuery(
    walletQueries.balances(address, chain)
  )
  
  return <AmountDisplay value={data.balance} />
}
```

---

## 10.4 Mutations (写入操作)

### 定义 Mutation

```typescript
// src/features/transfer/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useTransfer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (params: TransferParams) => {
      // 1. 构建交易
      const tx = await chainService.buildTransaction(params)
      // 2. 签名
      const signed = await chainService.signTransaction(tx)
      // 3. 广播
      return chainService.broadcastTransaction(signed)
    },
    
    // 成功后刷新余额
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({
        queryKey: walletKeys.balances(params.from, params.chain),
      })
    },
    
    // 错误处理
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
```

### 使用 Mutation

```typescript
function TransferForm() {
  const transfer = useTransfer()
  
  const handleSubmit = async (data: FormData) => {
    await transfer.mutateAsync({
      from: data.from,
      to: data.to,
      amount: data.amount,
      chain: data.chain,
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <Button
        type="submit"
        disabled={transfer.isPending}
      >
        {transfer.isPending ? '发送中...' : '发送'}
      </Button>
    </form>
  )
}
```

---

## 10.5 状态持久化

### Store 持久化策略

```typescript
// src/stores/wallet.ts
const STORAGE_KEY = 'bfm_wallets'

// 加载
function loadState(): Partial<WalletState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return {}
    
    const parsed = JSON.parse(saved)
    // 版本迁移检查
    return migrateState(parsed)
  } catch {
    return {}
  }
}

// 保存
walletStore.subscribe(() => {
  const state = walletStore.state
  // 只持久化必要字段
  const persisted = {
    wallets: state.wallets,
    currentWalletId: state.currentWalletId,
    selectedChain: state.selectedChain,
    _version: 1,  // 版本号，用于迁移
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
})
```

### Query 缓存持久化

```typescript
// 可选：使用 persistQueryClient 持久化查询缓存
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'bfm_query_cache',
})

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 小时
})
```

---

## 10.6 派生状态

### 计算属性

```typescript
// src/stores/derived.ts
import { walletStore } from './wallet'

// 当前钱包
export function getCurrentWallet() {
  const { wallets, currentWalletId } = walletStore.state
  return wallets.find((w) => w.id === currentWalletId) ?? null
}

// 当前地址
export function getCurrentAddress() {
  const wallet = getCurrentWallet()
  const { selectedChain } = walletStore.state
  if (!wallet || !selectedChain) return null
  
  return wallet.chainAddresses.find(
    (a) => a.chain === selectedChain
  )?.address ?? null
}

// 作为 Hook 使用
export function useCurrentWallet() {
  const wallets = useStore(walletStore, (s) => s.wallets)
  const currentId = useStore(walletStore, (s) => s.currentWalletId)
  
  return useMemo(
    () => wallets.find((w) => w.id === currentId) ?? null,
    [wallets, currentId]
  )
}
```

---

## 10.7 状态调试

### React Query DevTools

```typescript
// src/main.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StackflowApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### Store 调试

```typescript
// 开发环境日志
if (import.meta.env.DEV) {
  walletStore.subscribe(() => {
    console.log('[WalletStore]', walletStore.state)
  })
}
```

---

## 10.8 最佳实践

### 1. 选择正确的状态类型

| 问题 | 选择 |
|-----|------|
| 需要从服务器获取？ | TanStack Query |
| 需要持久化到本地？ | TanStack Store |
| 只在表单生命周期内？ | TanStack Form |
| 只在组件内使用？ | useState |

### 2. 细粒度订阅

```typescript
// ✅ 好：只订阅需要的字段
const wallets = useStore(walletStore, (s) => s.wallets)

// ❌ 差：订阅整个 store
const state = useStore(walletStore, (s) => s)
```

### 3. 合理设置缓存时间

```typescript
// 频繁变化的数据：短缓存
balances: queryOptions({
  staleTime: 30_000,  // 30 秒
  refetchInterval: 60_000,
})

// 不常变化的数据：长缓存
tokenMetadata: queryOptions({
  staleTime: 1000 * 60 * 60,  // 1 小时
})
```

### 4. 统一的 Key 管理

```typescript
// 所有 Query Key 集中定义
export const queryKeys = {
  wallet: walletKeys,
  token: tokenKeys,
  transaction: transactionKeys,
}
```

---

## 本章小结

- 三类状态分别使用 Store、Query、Form 管理
- Store 用于本地持久化状态
- Query 用于服务端数据缓存
- 细粒度订阅避免不必要的重渲染
- 合理配置缓存策略提升性能

---

## 下一篇

完成架构篇后，继续阅读 [第四篇：服务篇](../../04-服务篇/)，了解服务层设计。
