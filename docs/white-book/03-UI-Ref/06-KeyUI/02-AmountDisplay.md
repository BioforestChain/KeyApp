# AmountDisplay 组件

> 源码: [`packages/key-ui/src/amount-display/`](https://github.com/BioforestChain/KeyApp/tree/main/packages/key-ui/src/amount-display)

## 概述

金额显示组件，支持动画数字、紧凑模式、隐私模式。

## 显示模式

| 模式 | 格式 | 适用场景 |
|------|------|---------|
| 完整精度 | `1,234.56789012` | 转账确认 |
| 自适应 | `1,234.5679` | 余额显示 |
| 隐藏尾零 | `1,234.5` | 一般显示 |
| 紧凑 | `1.5M` / `12.5K` | 列表概览 |

## 使用

### 基础用法

```tsx
import { AmountDisplay } from '@biochain/key-ui/amount-display'

// 基础
<AmountDisplay value={1234.5678} symbol="ETH" />

// 紧凑模式
<AmountDisplay value={1500000} compact /> // 显示 1.5M

// 带正负号
<AmountDisplay value={-2.3} sign="always" color="auto" />

// 隐私模式
<AmountDisplay value={100} hidden /> // 显示 ••••••

// 加载态
<AmountDisplay value={0} loading />
```

### 带法币显示

```tsx
import { AmountWithFiat } from '@biochain/key-ui/amount-display'

<AmountWithFiat
  value={1.5}
  symbol="ETH"
  fiatValue={3750}
  fiatSymbol="$"
  layout="vertical"
/>

// 渲染:
// 1.5 ETH
// ≈ $3,750
```

## Props

### AmountDisplay

```typescript
interface AmountDisplayProps {
  value: string | number
  symbol?: string           // 代币符号
  decimals?: number         // 小数位 (默认 8)
  sign?: 'auto' | 'always' | 'never'  // 正负号
  color?: 'auto' | 'default' | 'positive' | 'negative'
  compact?: boolean         // 紧凑模式 (1K, 1M, 1B)
  hidden?: boolean          // 隐私模式
  loading?: boolean         // 加载态
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  mono?: boolean            // 等宽字体 (默认 true)
  animated?: boolean        // 动画 (默认 true)
  fixedDecimals?: boolean | 'auto'  // 小数位模式
  className?: string | ((state: State) => string)
  style?: CSSProperties | ((state: State) => CSSProperties)
}

interface AmountDisplayState {
  isNegative: boolean
  isZero: boolean
  isLoading: boolean
  isHidden: boolean
}
```

### AmountWithFiat

```typescript
interface AmountWithFiatProps extends AmountDisplayProps {
  fiatValue?: string | number
  fiatSymbol?: string       // 默认 '$'
  fiatDecimals?: number     // 默认 2
  layout?: 'vertical' | 'horizontal'
}
```

## 紧凑模式阈值

```typescript
if (value >= 1_000_000_000) return `${value / 1e9}B`
if (value >= 1_000_000)     return `${value / 1e6}M`
if (value >= 1_000)         return `${value / 1e3}K`
```

## 小数位规则

| 资产类型 | 默认精度 | 最大精度 |
|---------|---------|---------|
| 法币 (USD, CNY) | 2 | 2 |
| 主流币 (ETH, BTC) | 4 | 8 |
| 代币 (ERC20) | 4 | 18 |
| BioForest 链 | 4 | 8 |

## fixedDecimals 模式

| 值 | 行为 |
|---|------|
| `false` | 隐藏尾随零 |
| `true` | 显示完整小数位 |
| `'auto'` | 根据容器宽度自适应 |

## 场景对照表

| 场景 | 推荐配置 |
|------|---------|
| 转账确认 | `fixedDecimals={true}` |
| 钱包余额 | `fixedDecimals="auto"` |
| 交易列表 | `fixedDecimals={false}` |
| 资产统计 | `compact={true}` |
