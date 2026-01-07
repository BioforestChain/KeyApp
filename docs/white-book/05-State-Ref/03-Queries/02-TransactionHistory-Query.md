# Transaction History Query

> Source: [src/queries/use-transaction-history-query.ts](https://github.com/BioforestChain/KeyApp/blob/main/src/queries/use-transaction-history-query.ts)

## 概览

`useTransactionHistoryQuery` 管理交易历史的获取、筛选和缓存。

---

## Query Keys

```typescript
export const transactionHistoryKeys = {
  all: ['transactionHistory'] as const,
  wallet: (walletId: string) => ['transactionHistory', walletId] as const,
  filtered: (walletId: string, filter: TransactionFilter) =>
    ['transactionHistory', walletId, filter] as const,
}
```

---

## 类型定义

### TransactionFilter

```typescript
interface TransactionFilter {
  chain?: ChainType | 'all';
  period?: '7d' | '30d' | '90d' | 'all';
}
```

### TransactionRecord

```typescript
interface TransactionRecord extends TransactionInfo {
  chain: ChainType;
  fee: Amount | undefined;
  feeSymbol: string | undefined;
  feeDecimals: number | undefined;
  blockNumber: number | undefined;
  confirmations: number | undefined;
  from: AddressInfo;
  to: AddressInfo;
  action: 'send' | 'receive' | 'contract' | 'swap';
  direction: 'in' | 'out';
  assets: AssetTransfer[];
  contract?: ContractInfo;
}
```

---

## 主 Hook

```typescript
function useTransactionHistoryQuery(walletId?: string) {
  const [filter, setFilter] = useState<TransactionFilter>({
    chain: 'all',
    period: 'all',
  });
  
  const query = useQuery({
    queryKey: transactionHistoryKeys.filtered(walletId ?? '', filter),
    queryFn: async (): Promise<TransactionRecord[]> => {
      if (!walletId) return [];
      
      const records = await transactionService.getHistory({
        walletId,
        filter: {
          chain: filter.chain ?? 'all',
          period: filter.period ?? 'all',
        },
      });
      
      return records.map(convertToComponentFormat);
    },
    enabled: !!walletId,
    staleTime: 30 * 1000,      // 30秒
    gcTime: 5 * 60 * 1000,     // 5分钟
    refetchOnWindowFocus: true,
  });
  
  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message,
    filter,
    setFilter,
    refresh,
  };
}
```

---

## 配置说明

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `staleTime` | 30s | 数据新鲜期 |
| `gcTime` | 5min | 缓存保留时间 |
| `refetchOnWindowFocus` | true | 窗口聚焦时刷新 |

---

## 筛选功能

### 按链筛选

```typescript
const { filter, setFilter } = useTransactionHistoryQuery(walletId);

// 切换到 Ethereum
setFilter({ ...filter, chain: 'ethereum' });

// 显示所有链
setFilter({ ...filter, chain: 'all' });
```

### 按时间筛选

```typescript
// 最近 7 天
setFilter({ ...filter, period: '7d' });

// 最近 30 天
setFilter({ ...filter, period: '30d' });

// 全部时间
setFilter({ ...filter, period: 'all' });
```

---

## 手动刷新

```typescript
function useRefreshTransactionHistory() {
  const queryClient = useQueryClient();
  
  return {
    // 刷新特定钱包
    refresh: async (walletId: string) => {
      await queryClient.invalidateQueries({
        queryKey: transactionHistoryKeys.wallet(walletId),
      });
    },
    
    // 刷新所有
    refreshAll: async () => {
      await queryClient.invalidateQueries({
        queryKey: transactionHistoryKeys.all,
      });
    },
  };
}
```

---

## 使用示例

### 基本用法

```tsx
function TransactionHistory({ walletId }: Props) {
  const {
    transactions,
    isLoading,
    filter,
    setFilter,
    refresh,
  } = useTransactionHistoryQuery(walletId);
  
  return (
    <div>
      {/* 筛选器 */}
      <div className="flex gap-2">
        <ChainFilter
          value={filter.chain}
          onChange={(chain) => setFilter({ ...filter, chain })}
        />
        <PeriodFilter
          value={filter.period}
          onChange={(period) => setFilter({ ...filter, period })}
        />
      </div>
      
      {/* 列表 */}
      <TransactionList
        transactions={transactions}
        loading={isLoading}
        onRefresh={refresh}
      />
    </div>
  );
}
```

### 下拉刷新

```tsx
function HistoryPage() {
  const { transactions, isLoading, refresh } = useTransactionHistoryQuery(walletId);
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };
  
  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <TransactionList transactions={transactions} loading={isLoading} />
    </PullToRefresh>
  );
}
```

---

## 数据流

```
┌─────────────────────────────┐
│  useTransactionHistoryQuery │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐     Cache Hit?
│        Query Cache          │◀──────────────────┐
│  key: ['txHistory', id, f]  │                   │
└──────────────┬──────────────┘                   │ Yes
               │ Cache Miss                       │
               ▼                                  │
┌─────────────────────────────┐                   │
│   transactionService        │                   │
│   .getHistory()             │                   │
└──────────────┬──────────────┘                   │
               │                                  │
               ▼                                  │
┌─────────────────────────────┐                   │
│  Chain Adapter APIs         │                   │
│  (Etherscan, TronGrid...)   │                   │
└──────────────┬──────────────┘                   │
               │                                  │
               ▼                                  │
┌─────────────────────────────┐                   │
│  convertToComponentFormat   │                   │
└──────────────┬──────────────┘                   │
               │                                  │
               ▼                                  │
┌─────────────────────────────┐                   │
│  Return + Update Cache      │───────────────────┘
└─────────────────────────────┘
```

---

## 相关文档

- [Balance Query](./01-Balance-Query.md)
- [Transaction Components](../../03-UI-Ref/04-Domain/02-Transaction-Components.md)
- [API Providers](../../06-Service-Ref/03-Chain/06-Providers.md)
