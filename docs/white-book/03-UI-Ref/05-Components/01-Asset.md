# Asset 组件

> 源码: [`src/components/asset/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/asset/)

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| `AssetItem` | `asset-item.tsx` | 单个资产行 |
| `AssetList` | `asset-list.tsx` | 资产列表 |

---

## AssetItem

单个资产行组件，显示代币图标、名称、余额、法币价值和 24h 涨跌。

### Props

```typescript
interface AssetItemProps {
  asset: AssetInfo           // 资产信息
  onClick?: () => void       // 点击回调
  showChevron?: boolean      // 显示箭头 (默认 true)
  currency?: string          // 货币代码 (默认 USD)
  exchangeRate?: number      // 汇率
  className?: string
}

interface AssetInfo {
  assetType: string          // 代币符号
  name?: string              // 代币名称
  amount: Amount             // 余额
  decimals: number           // 精度
  logoUrl?: string           // 图标 URL
  priceUsd?: number          // USD 价格
  priceChange24h?: number    // 24h 涨跌幅 (%)
  contractAddress?: string   // 合约地址
}
```

### 使用示例

```tsx
<AssetItem
  asset={{
    assetType: 'ETH',
    name: 'Ethereum',
    amount: Amount.fromDisplay('1.5', 18),
    decimals: 18,
    priceUsd: 2500,
    priceChange24h: 2.3,
  }}
  onClick={() => navigate('TokenDetail', { symbol: 'ETH' })}
  currency="CNY"
  exchangeRate={7.24}
/>
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ [🔷]  Ethereum              1.5 ETH    >   │
│       ETH                   ≈¥27,150 +2.3% │
└─────────────────────────────────────────────┘
```

---

## AssetList

资产列表组件，支持加载态、空态、点击事件。

### Props

```typescript
interface AssetListProps {
  assets: AssetInfo[]
  onAssetClick?: (asset: AssetInfo) => void
  isLoading?: boolean
  currency?: string
  exchangeRate?: number
  className?: string
}
```

### 使用示例

```tsx
<AssetList
  assets={assets}
  isLoading={isLoading}
  onAssetClick={(asset) => navigate('TokenDetail', { symbol: asset.assetType })}
  currency={currency}
  exchangeRate={exchangeRate}
/>
```

### 状态

| 状态 | 渲染 |
|------|------|
| `isLoading=true` | 3 个骨架屏 |
| `assets.length === 0` | 空态图标 + "无资产" |
| 正常 | AssetItem 列表 |

---

## 依赖组件

- `TokenIcon` - 代币图标
- `AmountDisplay` - 金额显示
- `ChevronRight` - 箭头图标

## 样式特性

- 圆角卡片 (`rounded-xl`)
- 悬停高亮 (`hover:bg-muted/50`)
- 点击反馈 (`active:bg-muted`)
- 等宽数字 (`tabular-nums`)
- 涨跌配色 (`text-green-600` / `text-red-600`)
