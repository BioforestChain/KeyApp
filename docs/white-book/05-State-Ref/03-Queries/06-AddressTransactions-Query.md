# Address Transactions Query

> 源码: [`src/queries/use-address-transactions-query.ts`](https://github.com/BioforestChain/KeyApp/blob/main/src/queries/use-address-transactions-query.ts)

## 概述

查询任意地址在任意链上的交易历史，支持多链适配器。

## 接口定义

```typescript
interface UseAddressTransactionsQueryOptions {
  chainId: string
  address: string
  limit?: number           // 默认 20
  enabled?: boolean        // 默认 true
}

interface AddressTransactionsResult {
  transactions: Transaction[]
  supported: boolean       // 是否成功查询
  fallbackReason?: string  // 失败原因
}

// Query Keys
const addressTransactionsQueryKeys = {
  all: ['addressTransactions'] as const,
  address: (chainId: string, address: string) => 
    ['addressTransactions', chainId, address] as const,
}
```

## 使用方式

```typescript
import { useAddressTransactionsQuery } from '@/queries/use-address-transactions-query'

function AddressTransactionsActivity({ chainId, address }) {
  const { data, isLoading, error } = useAddressTransactionsQuery({
    chainId,
    address,
    limit: 50,
  })
  
  if (!data?.supported) {
    return <div>不支持查询: {data?.fallbackReason}</div>
  }
  
  return <TransactionList transactions={data.transactions} />
}
```

## 缓存策略

| 配置 | 值 | 说明 |
|------|-----|------|
| `staleTime` | 30s | 30 秒内不重新请求 |
| `gcTime` | 5 min | 5 分钟缓存 |

## 数据流

```
useAddressTransactionsQuery({ chainId, address })
    │
    ├── getChainProvider(chainId)
    │   └── 获取链适配器
    │
    ├── chainProvider.getTransactionHistory(address, limit)
    │   │
    │   ├── EVM: Etherscan API
    │   ├── Bitcoin: BlockCypher API
    │   ├── Tron: TronGrid API
    │   └── BioForest: Wallet API
    │
    └── 返回 AddressTransactionsResult
        │
        ├── supported=true: 正常数据
        └── supported=false: fallback + 原因
```

## 支持检测

使用 `isSupported()` 检测链是否支持该功能：

```typescript
import { isSupported } from '@/services/chain-adapter/providers'

const result = await chainProvider.getTransactionHistory(address, limit)

if (isSupported(result)) {
  // result.data 是真实数据
} else {
  // result.data 是 fallback 数据
  // result.reason 说明原因
}
```
