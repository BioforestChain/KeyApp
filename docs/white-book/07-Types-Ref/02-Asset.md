# Asset 类型

> 源码: [`src/types/asset.ts`](https://github.com/BioforestChain/KeyApp/blob/main/src/types/asset.ts)

## 概述

资产相关类型定义，包括代币信息、链资产、法币换算等。

## 核心类型

### AssetInfo

单个资产/代币信息。

```typescript
interface AssetInfo {
  /** 代币标识 (ETH, USDT, BFM) */
  assetType: string
  
  /** 余额 (Amount 对象) */
  amount: Amount
  
  /** 小数位数 */
  decimals: number
  
  /** 图标 URL (可选，回退到首字母) */
  logoUrl?: string
  
  /** 合约地址 (ERC20 代币) */
  contractAddress?: string
  
  /** 显示名称 (可选，默认为 assetType) */
  name?: string
  
  /** USD 价格 */
  priceUsd?: number
  
  /** 24h 涨跌幅 (%) */
  priceChange24h?: number
}
```

### ChainAssets

链上资产集合。

```typescript
interface ChainAssets {
  /** 链标识 */
  chain: string
  
  /** 钱包地址 */
  address: string
  
  /** 该链上的资产列表 */
  assets: AssetInfo[]
}
```

### AssetState

资产状态。

```typescript
interface AssetState {
  /** 按链分组的资产 */
  chainAssets: ChainAssets[]
  
  /** 加载状态 */
  isLoading: boolean
  
  /** 错误信息 */
  error: string | null
}
```

## 货币配置

```typescript
interface CurrencyConfig {
  code: string    // 'USD', 'CNY', etc.
  locale: string  // 'en-US', 'zh-CN', etc.
}

const currencyConfigs: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', locale: 'en-US' },
  CNY: { code: 'CNY', locale: 'zh-CN' },
  EUR: { code: 'EUR', locale: 'de-DE' },
  JPY: { code: 'JPY', locale: 'ja-JP' },
  KRW: { code: 'KRW', locale: 'ko-KR' },
}
```

## 工具函数

### formatFiatValue

格式化法币价值。

```typescript
function formatFiatValue(
  amount: Amount | string,
  decimals: number,
  priceUsd: number,
  options?: FormatFiatOptions
): string

interface FormatFiatOptions {
  currency?: string      // 默认 'USD'
  exchangeRate?: number  // USD 到目标货币汇率
  locale?: string        // 数字格式化区域
}
```

**使用示例**:

```typescript
const balance = Amount.fromFormatted('1.5', 18, 'ETH')
const priceUsd = 2500

// USD 格式
formatFiatValue(balance, 18, priceUsd)
// "$3,750.00"

// CNY 格式 (汇率 7.24)
formatFiatValue(balance, 18, priceUsd, { 
  currency: 'CNY', 
  exchangeRate: 7.24 
})
// "¥27,150.00"
```

### formatPriceChange

格式化涨跌幅。

```typescript
function formatPriceChange(change: number | undefined): string

formatPriceChange(2.5)   // "+2.50%"
formatPriceChange(-1.3)  // "-1.30%"
formatPriceChange(0)     // "+0.00%"
formatPriceChange(undefined) // ""
```

### convertFiat

货币换算。

```typescript
function convertFiat(usdAmount: number, rate: number): number

convertFiat(100, 7.24)  // 724 (USD → CNY)
```

### createAssetInfo

从原始数据创建 AssetInfo。

```typescript
function createAssetInfo(data: {
  assetType: string
  amount: string        // raw 或 formatted
  decimals: number
  logoUrl?: string
  contractAddress?: string
  name?: string
  priceUsd?: number
  priceChange24h?: number
}): AssetInfo

// 使用
const asset = createAssetInfo({
  assetType: 'ETH',
  amount: '1500000000000000000', // 自动解析
  decimals: 18,
  priceUsd: 2500,
  priceChange24h: 2.3,
})
```

## 使用示例

### 资产列表组件

```tsx
function AssetList({ assets }: { assets: AssetInfo[] }) {
  return (
    <div>
      {assets.map(asset => (
        <div key={asset.assetType}>
          <TokenIcon symbol={asset.assetType} imageUrl={asset.logoUrl} />
          <span>{asset.name ?? asset.assetType}</span>
          <AmountDisplay value={asset.amount.toNumber()} decimals={asset.decimals} />
          <span>{formatFiatValue(asset.amount, asset.decimals, asset.priceUsd ?? 0)}</span>
          <span className={asset.priceChange24h >= 0 ? 'text-green' : 'text-red'}>
            {formatPriceChange(asset.priceChange24h)}
          </span>
        </div>
      ))}
    </div>
  )
}
```

### 总资产计算

```typescript
function calculateTotalValue(chainAssets: ChainAssets[]): number {
  let total = 0
  
  for (const chain of chainAssets) {
    for (const asset of chain.assets) {
      if (asset.priceUsd) {
        total += asset.amount.toNumber() * asset.priceUsd
      }
    }
  }
  
  return total
}
```
