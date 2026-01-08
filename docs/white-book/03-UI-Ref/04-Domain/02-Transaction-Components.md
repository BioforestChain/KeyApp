# Transaction Components 详解

> Source: [src/components/transaction/](https://github.com/BioforestChain/KeyApp/tree/main/src/components/transaction)

## 概览

交易组件库包含 **6 个组件**，用于交易历史展示和状态显示。

---

## 组件清单

| 组件 | 文件 | 描述 |
|------|------|------|
| TransactionList | `transaction-list.tsx` | 交易列表 (按日期分组) |
| TransactionItem | `transaction-item.tsx` | 单条交易 |
| TransactionStatus | `transaction-status.tsx` | 状态指示器 |
| TxStatusDisplay | `tx-status-display.tsx` | 状态文字显示 |
| FeeDisplay | `fee-display.tsx` | 手续费显示 |

---

## TransactionList

按日期分组的交易列表。

### Props

```typescript
interface TransactionListProps {
  transactions: TransactionInfo[];
  loading?: boolean;
  onTransactionClick?: (transaction: TransactionInfo) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  showChainIcon?: boolean;
  className?: string;
  testId?: string;
}
```

### 日期分组逻辑

```typescript
function groupByDate(transactions: TransactionInfo[]): Map<string, TransactionInfo[]> {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  
  // 分组键: "今天" | "昨天" | "1月15日"
  transactions.forEach((tx) => {
    const dateStr = tx.timestamp.toDateString();
    let key: string;
    
    if (dateStr === today) {
      key = '今天';
    } else if (dateStr === yesterday) {
      key = '昨天';
    } else {
      key = date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
    }
    
    groups.get(key).push(tx);
  });
}
```

### 视觉结构

```
┌────────────────────────────────────────────────────────────┐
│  今天                                                      │
│  ├─ TransactionItem (发送 0.5 ETH)                        │
│  └─ TransactionItem (接收 100 USDT)                       │
│                                                            │
│  昨天                                                      │
│  ├─ TransactionItem (发送 0.1 BTC)                        │
│  └─ TransactionItem (合约调用)                            │
│                                                            │
│  1月15日                                                   │
│  └─ TransactionItem (接收 500 TRX)                        │
└────────────────────────────────────────────────────────────┘
```

### 空状态

```tsx
<TransactionList
  transactions={[]}
  emptyTitle="暂无交易记录"
  emptyDescription="您的交易记录将显示在这里"
  emptyAction={<Button onClick={goToSend}>发起转账</Button>}
/>
```

---

## TransactionItem

单条交易显示组件。

### Props

```typescript
interface TransactionInfo {
  id: string;
  type: 'send' | 'receive' | 'contract' | 'swap';
  status: 'pending' | 'confirming' | 'confirmed' | 'failed';
  amount: string;
  symbol: string;
  address: string;           // 对方地址
  timestamp: Date | string;
  hash: string;
}

interface TransactionItemProps {
  transaction: TransactionInfo;
  onClick?: () => void;
  showChainIcon?: boolean;
  chainId?: string;
}
```

### 视觉布局

```
┌────────────────────────────────────────────────────────────┐
│  ┌────┐                                                    │
│  │ ↑  │  发送到 0x1234...5678              -0.5 ETH       │
│  │ 🔴 │  14:32 · 确认中                    ≈ $1,500       │
│  └────┘                                           [🔗]    │
└────────────────────────────────────────────────────────────┘

图标:
  ↑ 红色 = 发送
  ↓ 绿色 = 接收
  ⟳ 蓝色 = 合约
  ⇄ 紫色 = 兑换
```

---

## TransactionStatus

交易状态指示器。

### Props

```typescript
interface TransactionStatusProps {
  status: 'pending' | 'confirming' | 'confirmed' | 'failed';
  confirmations?: number;
  requiredConfirmations?: number;
}
```

### 状态映射

| Status | 图标 | 颜色 | 描述 |
|--------|------|------|------|
| pending | ⏳ | 黄色 | 等待确认 |
| confirming | ⟳ | 蓝色 | 确认中 (X/Y) |
| confirmed | ✓ | 绿色 | 已确认 |
| failed | ✗ | 红色 | 失败 |

### 进度显示

```tsx
// 确认中显示进度
<TransactionStatus
  status="confirming"
  confirmations={3}
  requiredConfirmations={12}
/>
// 显示: ⟳ 确认中 (3/12)
```

---

## FeeDisplay

手续费显示组件。

### Props

```typescript
interface FeeDisplayProps {
  fee: Amount;
  symbol: string;
  fiatValue?: number;
  speed?: 'slow' | 'normal' | 'fast';
  estimatedTime?: number;     // 秒
}
```

### 显示格式

```
┌────────────────────────────────────────┐
│  手续费                                │
│  0.002 ETH ≈ $4.00                    │
│  预计 30 秒确认                        │
└────────────────────────────────────────┘
```

---

## 使用示例

### 完整交易历史页

```tsx
function HistoryPage() {
  const { walletId, selectedChain } = useCurrentWallet();
  const { transactions, isLoading, filter, setFilter, refresh } = 
    useTransactionHistoryQuery(walletId);
  const { push } = useFlow();
  
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="交易记录" />
      
      {/* 筛选器 */}
      <div className="px-4 py-2 flex gap-2">
        <Select value={filter.chain} onValueChange={v => setFilter({ ...filter, chain: v })}>
          <SelectItem value="all">全部链</SelectItem>
          <SelectItem value="ethereum">Ethereum</SelectItem>
          <SelectItem value="bsc">BSC</SelectItem>
        </Select>
        
        <Select value={filter.period} onValueChange={v => setFilter({ ...filter, period: v })}>
          <SelectItem value="all">全部时间</SelectItem>
          <SelectItem value="7d">最近7天</SelectItem>
          <SelectItem value="30d">最近30天</SelectItem>
        </Select>
      </div>
      
      {/* 交易列表 */}
      <TransactionList
        transactions={transactions}
        loading={isLoading}
        showChainIcon={filter.chain === 'all'}
        onTransactionClick={(tx) => {
          push('TransactionDetailActivity', { txId: tx.id });
        }}
      />
    </div>
  );
}
```

---

## 相关文档

- [Transaction History Query](../../05-State-Ref/03-Queries/02-TransactionHistory-Query.md)
- [Transfer Components](./02-Transaction-Transfer.md)
- [Chain Adapter](../../06-Service-Ref/03-Chain/01-Adapter.md)
