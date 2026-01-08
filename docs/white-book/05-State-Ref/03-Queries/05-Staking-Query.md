# Staking Query

> 源码: [`src/queries/use-staking-query.ts`](https://github.com/AInewsAPP/KeyApp/blob/main/src/queries/use-staking-query.ts)

## 概述

Staking Query 提供质押功能的数据查询，包括质押池列表、质押交易记录。

## 接口定义

```typescript
interface StakingOverviewItem {
  // 质押池信息（由 types/staking 定义）
}

interface StakingTransaction {
  // 质押交易记录（由 types/staking 定义）
}

// Query Keys
const stakingQueryKeys = {
  all: ['staking'] as const,
  overview: () => ['staking', 'overview'] as const,
  transactions: () => ['staking', 'transactions'] as const,
  transaction: (id: string) => ['staking', 'transaction', id] as const,
}
```

## Hooks

### useStakingOverviewQuery

获取质押池列表：

```typescript
import { useStakingOverviewQuery } from '@/queries/use-staking-query'

function StakingPools() {
  const { data: pools, isLoading } = useStakingOverviewQuery()
  
  return pools?.map(pool => (
    <PoolCard key={pool.id} pool={pool} />
  ))
}
```

### useStakingTransactionsQuery

获取质押交易历史：

```typescript
import { useStakingTransactionsQuery } from '@/queries/use-staking-query'

function StakingHistory() {
  const { data: transactions } = useStakingTransactionsQuery()
  // 质押/解质押/收益领取记录
}
```

### useStakingTransactionQuery

获取单笔质押交易详情：

```typescript
import { useStakingTransactionQuery } from '@/queries/use-staking-query'

function TransactionDetail({ id }: { id: string }) {
  const { data: tx } = useStakingTransactionQuery(id)
}
```

## 缓存策略

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `staleTime` | 30s | Tab 切换不重复请求 |
| `gcTime` | 5 min | 缓存保留时间 |
| `refetchOnWindowFocus` | true | 窗口聚焦时更新 |

## 刷新控制

```typescript
import { useRefreshStaking } from '@/queries/use-staking-query'

function StakingPage() {
  const { refreshOverview, refreshTransactions, refreshAll } = useRefreshStaking()
  
  // 质押操作后刷新
  const handleStake = async () => {
    await stakingService.stake(...)
    await refreshAll()
  }
}
```

## 服务依赖

```typescript
import { stakingService } from '@/services/staking'

// API 方法
stakingService.getOverview()           // 质押池列表
stakingService.getTransactions()       // 交易列表
stakingService.getTransaction({ id })  // 单笔交易
```

## 数据流

```
useStakingOverviewQuery()
    │
    ├── QueryKey: ['staking', 'overview']
    │
    ├── stakingService.getOverview()
    │
    └── StakingOverviewItem[]

useRefreshStaking().refreshAll()
    │
    └── invalidateQueries(['staking'])
            │
            ├── overview 失效 → 重新请求
            └── transactions 失效 → 重新请求
```
