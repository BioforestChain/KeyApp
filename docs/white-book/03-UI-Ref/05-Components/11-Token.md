# Token 组件

> 源码: [`src/components/token/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/token/)

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| `TokenIcon` | `token-icon.tsx` | 代币图标 |
| `TokenItem` | `token-item.tsx` | 代币行 |
| `TokenList` | `token-list.tsx` | 代币列表 |
| `BalanceDisplay` | `balance-display.tsx` | 余额显示 |

---

## TokenIcon

代币图标组件。

### Props

```typescript
interface TokenIconProps {
  symbol: string
  imageUrl?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}
```

### 尺寸

| Size | 像素 |
|------|------|
| `sm` | 24px |
| `md` | 32px |
| `lg` | 40px |
| `xl` | 48px |

### 回退逻辑

1. 优先使用 `imageUrl`
2. 图片加载失败显示符号首字母
3. 使用符号对应的预设颜色

### 使用示例

```tsx
<TokenIcon symbol="ETH" imageUrl="/icons/eth.png" size="lg" />
<TokenIcon symbol="UNKNOWN" />  // 显示 "U" + 灰色背景
```

---

## TokenItem

单个代币行显示。

### Props

```typescript
interface TokenItemProps {
  symbol: string
  name?: string
  balance: Amount
  imageUrl?: string
  priceUsd?: number
  priceChange24h?: number
  onClick?: () => void
  className?: string
}
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ [🔷]  Ethereum                1.5 ETH      │
│       ETH                     $3,750 +2.3% │
└─────────────────────────────────────────────┘
```

---

## TokenList

代币列表组件。

### Props

```typescript
interface TokenListProps {
  tokens: TokenInfo[]
  onItemClick?: (token: TokenInfo) => void
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}
```

### 使用示例

```tsx
<TokenList
  tokens={tokens}
  isLoading={isLoading}
  onItemClick={(token) => navigate('TokenDetail', { symbol: token.symbol })}
  emptyMessage="暂无代币"
/>
```

---

## BalanceDisplay

余额显示组件，大字号突出显示。

### Props

```typescript
interface BalanceDisplayProps {
  balance: Amount
  symbol: string
  fiatValue?: number
  fiatSymbol?: string
  hidden?: boolean
  loading?: boolean
  className?: string
}
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│            1.5 ETH                          │
│           ≈ $3,750                          │
└─────────────────────────────────────────────┘
```

### 使用示例

```tsx
<BalanceDisplay
  balance={Amount.fromDisplay('1.5', 18)}
  symbol="ETH"
  fiatValue={3750}
  fiatSymbol="$"
  hidden={isPrivacyMode}
  loading={isLoading}
/>
```
