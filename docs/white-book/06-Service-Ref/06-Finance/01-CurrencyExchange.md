# Currency Exchange Service

> 源码: [`src/services/currency-exchange/`](https://github.com/BioforestChain/KeyApp/blob/main/src/services/currency-exchange/)

## 概述

Currency Exchange Service 提供法币汇率查询，用于将加密货币价值转换为用户偏好的本地货币显示。

## 服务元信息

```typescript
// types.ts
import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'

const ExchangeRateResponseSchema = z.object({
  base: z.string(),              // 基准货币 (如 'USD')
  date: z.string(),              // 汇率日期 (如 '2024-01-15')
  rates: z.record(z.string(), z.number()),  // 目标货币 -> 汇率
})

export const currencyExchangeServiceMeta = defineServiceMeta('currencyExchange', (s) =>
  s
    .description('货币兑换服务 - 获取汇率')
    .api('getExchangeRates', {
      description: '获取汇率',
      input: z.object({
        baseCurrency: z.string(),
        targetCurrencies: z.array(z.string()),
      }),
      output: ExchangeRateResponseSchema,
    })
)
```

## API

### getExchangeRates

获取汇率数据：

```typescript
import { currencyExchangeService } from '@/services/currency-exchange'

const result = await currencyExchangeService.getExchangeRates({
  baseCurrency: 'USD',
  targetCurrencies: ['CNY', 'EUR', 'JPY'],
})

// 返回值
// {
//   base: 'USD',
//   date: '2024-01-15',
//   rates: { CNY: 7.24, EUR: 0.92, JPY: 148.5 }
// }
```

## 类型定义

```typescript
/** API 响应 */
interface ExchangeRateResponse {
  base: string
  date: string
  rates: Record<string, number>
}

/** 带缓存时间戳的汇率数据 */
interface ExchangeRateData extends ExchangeRateResponse {
  updatedAt: number
}

/** Frankfurter API 原始响应 */
interface FrankfurterApiResponse {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}
```

## 数据源

使用 [Frankfurter API](https://www.frankfurter.app/) 获取汇率：

```
GET https://api.frankfurter.app/latest?from=USD&to=CNY,EUR,JPY
```

**优点**:
- 免费、无需 API Key
- 支持 30+ 货币
- 每日更新 (ECB 数据源)

## 平台实现

### Web (web.ts)

```typescript
export const currencyExchangeService = currencyExchangeServiceMeta.impl({
  async getExchangeRates({ baseCurrency, targetCurrencies }) {
    const targets = targetCurrencies.join(',')
    const url = `https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targets}`
    
    const response = await fetch(url)
    const data: FrankfurterApiResponse = await response.json()
    
    return {
      base: data.base,
      date: data.date,
      rates: data.rates,
    }
  },
})
```

### Mock (mock.ts)

测试环境使用固定汇率：

```typescript
const MOCK_RATES = {
  CNY: 7.24,
  EUR: 0.92,
  JPY: 148.5,
  KRW: 1320,
}
```

## 使用场景

### 资产价值显示

```typescript
function AssetValue({ usdValue }: { usdValue: number }) {
  const currency = useCurrency() // 从 preferencesStore 获取
  const { data } = useExchangeRateQuery('USD', [currency])
  
  const rate = data?.rates[currency] ?? 1
  const localValue = usdValue * rate
  
  return <span>{currencies[currency].symbol}{localValue.toFixed(2)}</span>
}
```

### 配合 Price Query

```typescript
// 1. 获取代币 USD 价格
const { prices } = usePriceQuery(['ETH'])
const ethPriceUsd = prices.get('ETH')?.priceUsd ?? 0

// 2. 获取 USD → CNY 汇率
const { data } = useExchangeRateQuery('USD', ['CNY'])
const cnyRate = data?.rates.CNY ?? 7.24

// 3. 计算 CNY 价值
const ethPriceCny = ethPriceUsd * cnyRate
```

## 支持的货币

| 代码 | 货币名称 | 符号 |
|------|---------|------|
| USD | 美元 | $ |
| CNY | 人民币 | ¥ |
| EUR | 欧元 | € |
| JPY | 日元 | ¥ |
| KRW | 韩元 | ₩ |
| GBP | 英镑 | £ |
| ... | (30+) | ... |

## 缓存策略

配合 `useExchangeRateQuery` 使用：

| 配置 | 值 | 说明 |
|------|-----|------|
| staleTime | 5 min | 汇率变化缓慢 |
| gcTime | 10 min | 缓存保留时间 |
| refetchOnWindowFocus | true | 窗口聚焦刷新 |
