# Balance Query

> Source: [src/queries/use-balance-query.ts](https://github.com/BioforestChain/KeyApp/blob/main/src/queries/use-balance-query.ts)

## 概览

`useBalanceQuery` 管理代币余额的异步获取、缓存和自动刷新。

---

## Query Keys

```typescript
export const balanceQueryKeys = {
  all: ['balance'] as const,
  wallet: (walletId: string) => ['balance', walletId] as const,
  chain: (walletId: string, chain: ChainType) => ['balance', walletId, chain] as const,
}
```

**用途**:
- `all`: 失效所有余额缓存
- `wallet`: 失效某个钱包的所有链余额
- `chain`: 失效特定钱包特定链的余额

---

## 主 Hook

```typescript
function useBalanceQuery(
  walletId: string | undefined,
  chain: ChainType | undefined
) {
  return useQuery({
    queryKey: balanceQueryKeys.chain(walletId ?? '', chain ?? ''),
    queryFn: async (): Promise<Token[]> => {
      if (!walletId || !chain) return [];
      
      await walletActions.refreshBalance(walletId, chain);
      
      const state = walletStore.state;
      const wallet = state.wallets.find(w => w.id === walletId);
      const chainAddress = wallet?.chainAddresses.find(ca => ca.chain === chain);
      
      return chainAddress?.tokens ?? [];
    },
    enabled: !!walletId && !!chain,
    staleTime: 30 * 1000,           // 30秒内认为数据新鲜
    gcTime: 5 * 60 * 1000,          // 5分钟缓存
    refetchInterval: 60 * 1000,     // 60秒轮询
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}
```

---

## 配置说明

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `staleTime` | 30s | Tab 切换时不会重复请求 |
| `gcTime` | 5min | 缓存保留时间 |
| `refetchInterval` | 60s | 自动刷新间隔 |
| `refetchIntervalInBackground` | false | 后台时停止轮询 |
| `refetchOnWindowFocus` | true | 窗口聚焦时刷新 |

---

## 手动刷新

```typescript
function useRefreshBalance() {
  const queryClient = useQueryClient();
  
  return {
    // 刷新特定链
    refresh: async (walletId: string, chain: ChainType) => {
      await queryClient.invalidateQueries({
        queryKey: balanceQueryKeys.chain(walletId, chain),
      });
    },
    
    // 刷新钱包所有链
    refreshAll: async (walletId: string) => {
      await queryClient.invalidateQueries({
        queryKey: balanceQueryKeys.wallet(walletId),
      });
    },
  };
}
```

---

## 使用示例

### 基本用法

```typescript
function TokenList({ walletId, chain }: Props) {
  const { 
    data: tokens, 
    isLoading, 
    error,
    isFetching,  // 后台刷新中
  } = useBalanceQuery(walletId, chain);
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorView error={error} />;
  
  return (
    <div>
      {isFetching && <RefreshingIndicator />}
      {tokens?.map(token => (
        <TokenItem key={token.id} token={token} />
      ))}
    </div>
  );
}
```

### 下拉刷新

```typescript
function WalletPage({ walletId, chain }: Props) {
  const { data, isLoading } = useBalanceQuery(walletId, chain);
  const { refresh } = useRefreshBalance();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handlePullRefresh = async () => {
    setIsRefreshing(true);
    await refresh(walletId, chain);
    setIsRefreshing(false);
  };
  
  return (
    <PullToRefresh onRefresh={handlePullRefresh} isRefreshing={isRefreshing}>
      <TokenList tokens={data} />
    </PullToRefresh>
  );
}
```

### 获取 Query Key

```typescript
function BalanceDebug({ walletId, chain }: Props) {
  const queryKey = useBalanceQueryKey(walletId, chain);
  const queryClient = useQueryClient();
  
  const cacheStatus = queryClient.getQueryState(queryKey);
  
  return (
    <div>
      <p>Status: {cacheStatus?.status}</p>
      <p>Last Updated: {cacheStatus?.dataUpdatedAt}</p>
    </div>
  );
}
```

---

## 数据流

```
┌─────────────────┐
│  useBalanceQuery │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     Cache Hit?
│  Query Cache    │◀────────────────┐
└────────┬────────┘                 │
         │ Cache Miss               │ Yes
         ▼                          │
┌─────────────────┐                 │
│  queryFn()      │                 │
└────────┬────────┘                 │
         │                          │
         ▼                          │
┌─────────────────┐                 │
│ walletActions   │                 │
│ .refreshBalance │                 │
└────────┬────────┘                 │
         │                          │
         ▼                          │
┌─────────────────┐                 │
│  Chain Adapter  │                 │
│  (API 调用)     │                 │
└────────┬────────┘                 │
         │                          │
         ▼                          │
┌─────────────────┐                 │
│  walletStore    │                 │
│  (状态更新)     │                 │
└────────┬────────┘                 │
         │                          │
         ▼                          │
┌─────────────────┐                 │
│  Return tokens  │─────────────────┘
│  + Update Cache │
└─────────────────┘
```

---

## 相关文档

- [Wallet Store](../02-Stores/01-Wallet-Store.md)
- [Chain Adapter](../../06-Service-Ref/03-Chain/01-Adapter.md)
- [Token Components](../../03-UI-Ref/04-Domain/01-Wallet-Asset.md)
