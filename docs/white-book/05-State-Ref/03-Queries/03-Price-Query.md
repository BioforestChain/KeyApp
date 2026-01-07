# Price Query

> 源码: [`src/queries/use-price-query.ts`](https://github.com/AInewsAPP/KeyApp/blob/main/src/queries/use-price-query.ts)

## 概述

Price Query 提供代币价格数据查询，支持多币种批量查询、自动轮询刷新、共享缓存。

## 接口定义

```typescript
interface PriceData {
  priceUsd: number        // USD 价格
  priceChange24h: number  // 24h 涨跌幅 (%)
  updatedAt: number       // 更新时间戳
}

// Query Keys
const priceQueryKeys = {
  all: ['prices'] as const,
  symbols: (symbols: string[]) => ['prices', symbols.sort().join(',')] as const,
}
```

## 使用方式

```typescript
import { usePriceQuery, getPrice } from '@/queries/use-price-query'

function AssetList() {
  const { prices, isLoading, isFetching, error } = usePriceQuery(['ETH', 'BTC', 'USDT'])
  
  const ethPrice = getPrice(prices, 'ETH')
  // ethPrice?.priceUsd = 2500
  // ethPrice?.priceChange24h = 2.3
}
```

## 缓存策略

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `staleTime` | 5 min | 数据新鲜期，期内不重新请求 |
| `gcTime` | 10 min | 垃圾回收时间 |
| `refetchInterval` | 60s | 自动轮询间隔 |
| `refetchIntervalInBackground` | false | 后台不轮询 |
| `refetchOnWindowFocus` | true | 窗口聚焦时刷新 |

## Mock 数据

开发环境使用 Mock 价格：

```typescript
const MOCK_PRICES: Record<string, PriceData> = {
  ETH: { priceUsd: 2500, priceChange24h: 2.3 },
  BTC: { priceUsd: 45000, priceChange24h: -1.5 },
  USDT: { priceUsd: 1, priceChange24h: 0.01 },
  USDC: { priceUsd: 1, priceChange24h: -0.02 },
  BFM: { priceUsd: 0.05, priceChange24h: 5.2 },
  TRX: { priceUsd: 0.12, priceChange24h: 3.1 },
  BNB: { priceUsd: 320, priceChange24h: 1.8 },
}
```

## 数据流

```
usePriceQuery(['ETH', 'BTC'])
    │
    ├── 规范化: ['ETH', 'BTC'] (大写、去空)
    │
    ├── QueryKey: ['prices', 'BTC,ETH'] (排序后拼接)
    │
    ├── 缓存命中? ─Yes─→ 返回缓存
    │       │
    │      No
    │       ↓
    ├── fetchPrices() → API 请求
    │
    └── 返回 Map<string, PriceData>
```

## 特性

1. **请求去重**: 相同 symbols 的并发请求自动合并
2. **共享缓存**: 多组件使用相同 symbols 共享数据
3. **自动刷新**: 60s 轮询 + 窗口聚焦刷新
4. **Symbol 规范化**: 自动转大写，排序后生成 QueryKey
