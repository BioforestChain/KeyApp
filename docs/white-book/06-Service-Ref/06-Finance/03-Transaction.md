# Transaction Service

> 源码: [`src/services/transaction/`](https://github.com/BioforestChain/KeyApp/blob/main/src/services/transaction/)

## 概述

Transaction Service 提供交易历史查询和管理功能，支持多链交易记录的统一访问。

## 服务元信息

```typescript
export const transactionServiceMeta = defineServiceMeta('transaction', (s) =>
  s.description('交易服务')
    .api('getHistory', z.object({ 
      walletId: z.string(), 
      filter: TransactionFilterSchema.optional() 
    }), z.array(TransactionRecordSchema))
    .api('getTransaction', z.object({ id: z.string() }), TransactionRecordSchema.nullable())
    .api('refresh', z.object({ walletId: z.string() }), z.void())
)
```

## 交易类型

```typescript
type TransactionType =
  // 基础转账
  | 'send' | 'receive'
  // 安全
  | 'signature'        // 设置安全密码
  // 权益操作
  | 'stake' | 'unstake' | 'destroy'
  | 'gift' | 'grab'    // 赠送/接受
  | 'trust' | 'signFor' // 委托/签收
  | 'emigrate' | 'immigrate' // 迁出/迁入
  | 'exchange' | 'swap'
  // 资产发行
  | 'issueAsset' | 'increaseAsset' | 'mint'
  // NFT
  | 'issueEntity' | 'destroyEntity'
  // 位名
  | 'locationName'
  // DApp
  | 'dapp'
  // 凭证
  | 'certificate'
  // EVM/Tron 合约
  | 'approve' | 'interaction'
  // 其他
  | 'mark' | 'other'
```

## 交易状态

```typescript
type TransactionStatus = 'pending' | 'confirmed' | 'failed'
```

## 交易记录

```typescript
interface TransactionRecord {
  id: string
  type: TransactionType
  status: TransactionStatus
  amount: Amount
  symbol: string
  decimals: number
  address: string           // 关联地址
  timestamp: Date
  hash?: string             // 交易哈希
  chain: ChainType
  fee?: Amount
  feeSymbol?: string
  feeDecimals?: number
  blockNumber?: number
  confirmations?: number
  from?: string
  to?: string
  action?: Action           // 详细操作类型
  direction?: Direction     // 'in' | 'out' | 'self'
  assets?: Asset[]          // 涉及的资产
  contract?: ContractInfo   // 合约信息
}
```

## 交易过滤器

```typescript
interface TransactionFilter {
  chain: ChainType | 'all' | undefined
  period: '7d' | '30d' | '90d' | 'all' | undefined
  type: TransactionType | 'all' | undefined
  status: TransactionStatus | 'all' | undefined
}
```

## API 使用

### 获取交易历史

```typescript
import { transactionService } from '@/services/transaction'

// 获取所有交易
const history = await transactionService.getHistory({ walletId: 'wallet-123' })

// 带过滤条件
const filtered = await transactionService.getHistory({
  walletId: 'wallet-123',
  filter: {
    chain: 'evm',
    period: '30d',
    type: 'send',
    status: 'confirmed',
  },
})
```

### 获取单笔交易

```typescript
const tx = await transactionService.getTransaction({ id: 'tx-456' })
```

### 刷新交易

```typescript
await transactionService.refresh({ walletId: 'wallet-123' })
```

## 数据流

```
transactionService.getHistory({ walletId })
    │
    ├── 从本地缓存读取
    │
    ├── 调用链适配器获取最新交易
    │   ├── EVM: Etherscan API
    │   ├── Bitcoin: BlockCypher API
    │   ├── Tron: TronGrid API
    │   └── BioForest: Wallet API
    │
    ├── 合并去重
    │
    ├── 应用过滤条件
    │
    └── 返回 TransactionRecord[]
```

## Mock 控制器

```typescript
interface ITransactionMockController {
  _resetData(): void
  _addTransaction(tx: TransactionRecord): void
  _setDelay(ms: number): void
  _simulateError(error: Error | null): void
}

// 测试使用
const mockCtrl = transactionService as ITransactionMockController
mockCtrl._addTransaction({
  id: 'test-tx',
  type: 'send',
  status: 'confirmed',
  amount: Amount.fromDisplay('1.5', 18),
  symbol: 'ETH',
  // ...
})
```

## 配合 Query 使用

```typescript
import { useTransactionHistoryQuery } from '@/queries/use-transaction-history-query'

function TransactionList({ walletId }: { walletId: string }) {
  const { data: transactions, isLoading } = useTransactionHistoryQuery(walletId, {
    chain: 'all',
    period: '30d',
  })
  
  return (
    <List>
      {transactions?.map(tx => (
        <TransactionItem key={tx.id} transaction={tx} />
      ))}
    </List>
  )
}
```

## 交易类型映射

| 链类型 | 原始类型 | TransactionType |
|--------|---------|-----------------|
| EVM | transfer | send/receive |
| EVM | approve | approve |
| EVM | swap | swap |
| Bitcoin | transfer | send/receive |
| Tron | TransferContract | send/receive |
| Tron | TriggerSmartContract | interaction |
| BioForest | TRA-TRANS | send/receive |
| BioForest | BSE-01 | signature |
| BioForest | AST-12 | stake |
