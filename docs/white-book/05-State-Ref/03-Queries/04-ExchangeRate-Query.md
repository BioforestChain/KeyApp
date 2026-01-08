# Exchange Rate Query

> 源码: [`src/queries/use-exchange-rate-query.ts`](https://github.com/AInewsAPP/KeyApp/blob/main/src/queries/use-exchange-rate-query.ts)

## 概述

Exchange Rate Query 提供法币汇率查询，用于资产价值的本地化显示（USD → CNY/EUR/JPY 等）。

## 接口定义

```typescript
interface ExchangeRateResponse {
  base: string                    // 基准货币 (e.g., 'USD')
  date: string                    // 汇率日期
  rates: Record<string, number>   // 目标货币 -> 汇率
}

// Query Keys
const exchangeRateQueryKeys = {
  all: ['exchangeRate'] as const,
  rate: (baseCurrency: string, targetCurrencies: string[]) =>
    ['exchangeRate', baseCurrency.toUpperCase(), targetCurrencies.sort().join(',')] as const,
}
```

## 使用方式

```typescript
import { useExchangeRateQuery, getExchangeRate } from '@/queries/use-exchange-rate-query'

function AssetValue() {
  const { data, isLoading, error } = useExchangeRateQuery('USD', ['CNY', 'EUR'])
  
  const cnyRate = getExchangeRate(data, 'CNY')
  // cnyRate = 7.24
  
  const usdValue = 100
  const cnyValue = usdValue * (cnyRate ?? 1)
}
```

## 缓存策略

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `staleTime` | 5 min | 汇率变化较慢，5分钟内复用 |
| `gcTime` | 10 min | 缓存保留时间 |
| `refetchOnWindowFocus` | true | 窗口聚焦时更新 |

## 数据流

```
useExchangeRateQuery('USD', ['CNY', 'EUR'])
    │
    ├── 规范化基准货币: 'USD'
    │
    ├── 规范化目标货币: ['CNY', 'EUR'] (去重、排序、排除基准)
    │
    ├── QueryKey: ['exchangeRate', 'USD', 'CNY,EUR']
    │
    ├── targets 为空? ─Yes─→ 返回空 rates
    │       │
    │      No
    │       ↓
    └── currencyExchangeService.getExchangeRates()
            │
            └── { base: 'USD', date: '2024-01-01', rates: { CNY: 7.24, EUR: 0.92 } }
```

## 服务依赖

```typescript
import { currencyExchangeService } from '@/services'

// 调用示例
currencyExchangeService.getExchangeRates({
  baseCurrency: 'USD',
  targetCurrencies: ['CNY', 'EUR'],
})
```

## 边界处理

1. **空目标货币**: 返回空 rates 对象
2. **基准货币同时在目标中**: 自动过滤
3. **货币代码规范化**: 自动转大写、去空格
