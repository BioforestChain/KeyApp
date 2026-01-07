# Address Balance Query

> 源码: [`src/queries/use-address-balance-query.ts`](https://github.com/BioforestChain/KeyApp/blob/main/src/queries/use-address-balance-query.ts)

## 概述

查询任意地址在任意链上的原生代币余额。

## 接口定义

```typescript
interface AddressBalanceResult {
  balance: Balance | null
  error: string | null
  supported: boolean       // 是否成功查询
}

interface Balance {
  amount: string           // 原始金额 (最小单位)
  decimals: number
  symbol: string
}

// Query Keys
const addressBalanceKeys = {
  all: ['addressBalance'] as const,
  query: (chainId: string, address: string) => 
    ['addressBalance', chainId, address] as const,
}
```

## 使用方式

```typescript
import { useAddressBalanceQuery } from '@/queries/use-address-balance-query'

function AddressBalanceDisplay({ chainId, address }) {
  const { data, isLoading } = useAddressBalanceQuery(chainId, address)
  
  if (isLoading) return <Skeleton />
  
  if (!data?.supported) {
    return <span>--</span>
  }
  
  return (
    <AmountDisplay 
      value={data.balance?.amount ?? '0'} 
      decimals={data.balance?.decimals ?? 8}
      symbol={data.balance?.symbol}
    />
  )
}
```

## 缓存策略

| 配置 | 值 | 说明 |
|------|-----|------|
| `staleTime` | 30s | 30 秒内不重新请求 |
| `gcTime` | 5 min | 5 分钟缓存 |

## 数据流

```
useAddressBalanceQuery(chainId, address)
    │
    ├── getChainProvider(chainId)
    │
    ├── chainProvider.getNativeBalance(address)
    │   │
    │   ├── EVM: eth_getBalance RPC
    │   ├── Bitcoin: BlockCypher API
    │   ├── Tron: TronGrid API
    │   └── BioForest: Wallet API
    │
    └── 返回 AddressBalanceResult
```

## 与其他 Query 的区别

| Query | 用途 | 数据 |
|-------|------|------|
| `useBalanceQuery` | 当前钱包余额 | 所有资产 |
| `useAddressBalanceQuery` | 任意地址余额 | 仅原生代币 |
