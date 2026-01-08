# Chain Config Query

> 源码: [`src/queries/use-chain-config-query.ts`](https://github.com/BioforestChain/KeyApp/blob/main/src/queries/use-chain-config-query.ts)

## 概述

管理链配置的加载和订阅更新，支持本地存储和远程订阅。

## 接口定义

```typescript
// Query Keys
const chainConfigQueryKeys = {
  all: ['chainConfig'] as const,
  configs: () => ['chainConfig', 'configs'] as const,
  subscription: (url: string) => ['chainConfig', 'subscription', url] as const,
}
```

## Hooks

### useChainConfigsQuery

获取本地存储的链配置。

```typescript
function useChainConfigsQuery(): UseQueryResult<ChainConfig[]>
```

**使用示例**:

```typescript
import { useChainConfigsQuery } from '@/queries/use-chain-config-query'

function ChainList() {
  const { data: configs, isLoading } = useChainConfigsQuery()
  
  return (
    <div>
      {configs?.map(config => (
        <ChainItem key={config.id} config={config} />
      ))}
    </div>
  )
}
```

### useChainConfigSubscriptionQuery

从远程 URL 获取链配置订阅。

```typescript
function useChainConfigSubscriptionQuery(
  url: string,
  options?: {
    refetchInterval?: number  // 定期刷新间隔
    force?: boolean           // 强制刷新 (忽略 ETag)
  }
): UseQueryResult<FetchSubscriptionResult>
```

**使用示例**:

```typescript
import { useChainConfigSubscriptionQuery } from '@/queries/use-chain-config-query'

function SubscriptionStatus({ url }) {
  const { data, isLoading, isFetching } = useChainConfigSubscriptionQuery(url, {
    refetchInterval: 5 * 60 * 1000,  // 5 分钟刷新一次
  })
  
  return (
    <div>
      <span>状态: {data?.status}</span>
      <span>配置数: {data?.configs?.length ?? 0}</span>
    </div>
  )
}
```

### useRefreshChainConfig

手动刷新链配置。

```typescript
function useRefreshChainConfig(): {
  refreshConfigs: () => Promise<void>
  refreshSubscription: (url: string) => Promise<void>
  refreshAll: () => Promise<void>
}
```

**使用示例**:

```typescript
function RefreshButton() {
  const { refreshAll } = useRefreshChainConfig()
  
  return <Button onClick={refreshAll}>刷新配置</Button>
}
```

## 缓存策略

| 配置 | 值 | 说明 |
|------|-----|------|
| `staleTime` | 5 min | 5 分钟内不重新请求 |
| `gcTime` | 30 min | 30 分钟缓存 |
| `refetchOnWindowFocus` | true | 窗口聚焦时刷新 |

## 订阅机制

```
useChainConfigSubscriptionQuery(url)
    │
    ├── 检查 ETag 缓存
    │   │
    │   ├── 有缓存 + 未过期 → 返回 304 Not Modified
    │   │
    │   └── 无缓存 / 过期 → 请求远程
    │
    ├── fetchSubscription(url, { force })
    │   │
    │   ├── 请求 JSON
    │   ├── 解析 ChainConfig[]
    │   └── 保存 ETag
    │
    └── 返回 FetchSubscriptionResult
        │
        ├── status: 'updated' | 'not_modified' | 'error'
        ├── configs: ChainConfig[]
        └── etag?: string
```

## 数据结构

```typescript
interface ChainConfig {
  id: string               // 链 ID (如 'ethereum')
  name: string             // 显示名称
  type: 'evm' | 'bitcoin' | 'tron' | 'bioforest'
  chainKind: string
  symbol: string           // 原生代币符号
  decimals: number
  icon?: string
  testnet?: boolean
  apis: ApiProvider[]
}

interface ApiProvider {
  type: 'rpc' | 'etherscan' | 'blockcypher' | 'trongrid' | 'biowallet-v1'
  endpoint: string
  config?: Record<string, unknown>
}
```
