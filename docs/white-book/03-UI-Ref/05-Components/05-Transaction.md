# Transaction 组件

> 源码: [`src/components/transaction/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/transaction/)

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| `TransactionItem` | `transaction-item.tsx` | 交易行 |
| `TransactionList` | `transaction-list.tsx` | 交易列表 (按日期分组) |
| `TransactionStatus` | `transaction-status.tsx` | 交易状态 |
| `FeeDisplay` | `fee-display.tsx` | 手续费显示 |
| `TxStatusDisplay` | `tx-status-display.tsx` | 交易状态展示 |

---

## TransactionItem

单条交易记录显示。

### Props

```typescript
interface TransactionItemProps {
  transaction: TransactionRecord
  onClick?: () => void
  className?: string
}

interface TransactionRecord {
  id: string
  type: TransactionType
  status: 'pending' | 'confirmed' | 'failed'
  amount: Amount
  symbol: string
  timestamp: Date
  hash?: string
  from?: string
  to?: string
  direction?: 'in' | 'out' | 'self'
}
```

### 交易类型图标

| 类型 | 图标 | 说明 |
|------|------|------|
| `send` | ↑ 红色 | 发送 |
| `receive` | ↓ 绿色 | 接收 |
| `swap` | ⇄ | 兑换 |
| `stake` | 📌 | 质押 |
| `approve` | ✓ | 授权 |
| `interaction` | 📄 | 合约交互 |

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ [↑]  发送                    -1.5 ETH      │
│      To: 0x8ba1...           ≈$3,750       │
└─────────────────────────────────────────────┘
```

---

## TransactionList

交易列表，自动按日期分组。

### Props

```typescript
interface TransactionListProps {
  transactions: TransactionRecord[]
  onItemClick?: (tx: TransactionRecord) => void
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}
```

### 日期分组

```typescript
// 自动分组:
// - 今天
// - 昨天
// - 本周
// - 本月
// - 更早
```

### 使用示例

```tsx
<TransactionList
  transactions={transactions}
  isLoading={isLoading}
  onItemClick={(tx) => navigate('TransactionDetail', { id: tx.id })}
  emptyMessage="暂无交易记录"
/>
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ 今天                                        │
│─────────────────────────────────────────────│
│ [↑] 发送        -1.5 ETH                   │
│ [↓] 接收        +0.5 ETH                   │
│─────────────────────────────────────────────│
│ 昨天                                        │
│─────────────────────────────────────────────│
│ [⇄] 兑换        1 ETH → 1800 USDT          │
└─────────────────────────────────────────────┘
```

---

## TransactionStatus

交易状态徽章。

### Props

```typescript
interface TransactionStatusProps {
  status: 'pending' | 'confirmed' | 'failed'
  confirmations?: number
  className?: string
}
```

### 状态样式

| 状态 | 颜色 | 图标 |
|------|------|------|
| `pending` | 黄色 | 旋转加载 |
| `confirmed` | 绿色 | ✓ |
| `failed` | 红色 | ✗ |

```tsx
<TransactionStatus status="pending" />
// 渲染: 🔄 确认中

<TransactionStatus status="confirmed" confirmations={12} />
// 渲染: ✓ 已确认 (12)

<TransactionStatus status="failed" />
// 渲染: ✗ 失败
```

---

## FeeDisplay

手续费显示组件。

### Props

```typescript
interface FeeDisplayProps {
  fee: Amount
  symbol: string
  fiatValue?: number
  fiatSymbol?: string
  editable?: boolean
  onEdit?: () => void
  className?: string
}
```

### 使用示例

```tsx
<FeeDisplay
  fee={Amount.fromDisplay('0.002', 18)}
  symbol="ETH"
  fiatValue={5}
  fiatSymbol="$"
  editable
  onEdit={() => openFeeEditor()}
/>

// 渲染:
// 网络费用  0.002 ETH (≈$5)  [编辑]
```

---

## TxStatusDisplay

交易状态详情展示 (用于详情页)。

```tsx
<TxStatusDisplay
  status="confirmed"
  txHash="0x..."
  blockNumber={12345678}
  confirmations={24}
  timestamp={new Date()}
/>
```

---

## 交易类型完整列表

```typescript
type TransactionType =
  | 'send' | 'receive'           // 基础转账
  | 'signature'                   // 设置安全密码
  | 'stake' | 'unstake'          // 质押
  | 'destroy'                     // 销毁
  | 'gift' | 'grab'              // 赠送/接受
  | 'trust' | 'signFor'          // 委托/签收
  | 'emigrate' | 'immigrate'     // 迁出/迁入
  | 'exchange' | 'swap'          // 交换
  | 'issueAsset' | 'increaseAsset' | 'mint'  // 资产发行
  | 'issueEntity' | 'destroyEntity'          // NFT
  | 'locationName'               // 位名
  | 'dapp'                       // DApp
  | 'certificate'                // 凭证
  | 'approve' | 'interaction'    // 合约
  | 'mark' | 'other'             // 其他
```
