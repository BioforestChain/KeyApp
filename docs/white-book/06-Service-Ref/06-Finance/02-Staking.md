# Staking Service

> 源码: [`src/services/staking/`](https://github.com/BioforestChain/KeyApp/blob/main/src/services/staking/)

## 概述

Staking Service 提供跨链质押功能，支持在 BioForest 链和外部链（ETH/BSC/TRON）之间进行资产的 Mint/Burn 操作。

## 服务元信息

```typescript
export const stakingServiceMeta = defineServiceMeta('staking', (s) =>
  s.description('质押服务')
    .api('getRechargeConfig', z.void(), RechargeConfigSchema)
    .api('getLogoUrls', z.void(), LogoUrlMapSchema)
    .api('getOverview', z.void(), z.array(StakingOverviewItemSchema))
    .api('getTransactions', z.void(), z.array(StakingTransactionSchema))
    .api('getTransaction', z.object({ id: z.string() }), StakingTransactionSchema.nullable())
    .api('submitMint', MintRequestSchema, StakingTransactionSchema)
    .api('submitBurn', BurnRequestSchema, StakingTransactionSchema)
)
```

## 核心类型

### 质押池概览

```typescript
interface StakingOverviewItem {
  chain: 'BFMeta' | 'BFChain' | 'CCChain' | 'PMChain'
  assetType: string
  stakedAmount: Amount      // 用户质押数量
  stakedFiat: string        // 法币价值
  availableChains: ('ETH' | 'BSC' | 'TRON')[]
  logoUrl?: string
  totalMinted: Amount       // 全网已铸造
  totalCirculation: Amount  // 流通量
  totalBurned: Amount       // 已销毁
  totalStaked: Amount       // 全网质押
  externalChain: 'ETH' | 'BSC' | 'TRON'
  externalAssetType: string
}
```

### 质押交易

```typescript
interface StakingTransaction {
  id: string
  type: 'mint' | 'burn'
  sourceChain: string
  sourceAsset: string
  sourceAmount: Amount
  targetChain: string
  targetAsset: string
  targetAmount: Amount
  status: 'pending' | 'confirming' | 'confirmed' | 'failed'
  txHash?: string
  createdAt: number
  updatedAt: number
  errorMessage?: string
}
```

### Mint/Burn 请求

```typescript
interface MintRequest {
  sourceChain: 'ETH' | 'BSC' | 'TRON'
  sourceAsset: string
  amount: Amount
  targetChain: 'BFMeta' | 'BFChain' | 'CCChain' | 'PMChain'
  targetAsset: string
}

interface BurnRequest {
  sourceChain: 'BFMeta' | 'BFChain' | 'CCChain' | 'PMChain'
  sourceAsset: string
  amount: Amount
  targetChain: 'ETH' | 'BSC' | 'TRON'
  targetAsset: string
}
```

## API 使用

### 获取质押池列表

```typescript
import { stakingService } from '@/services/staking'

const pools = await stakingService.getOverview()
// StakingOverviewItem[]
```

### 提交 Mint 请求

```typescript
// 从 ETH 链 Mint 到 BFMeta
const tx = await stakingService.submitMint({
  sourceChain: 'ETH',
  sourceAsset: 'USDT',
  amount: Amount.fromDisplay('100', 6),
  targetChain: 'BFMeta',
  targetAsset: 'wUSDT',
})
```

### 提交 Burn 请求

```typescript
// 从 BFMeta Burn 回 ETH
const tx = await stakingService.submitBurn({
  sourceChain: 'BFMeta',
  sourceAsset: 'wUSDT',
  amount: Amount.fromDisplay('100', 8),
  targetChain: 'ETH',
  targetAsset: 'USDT',
})
```

### 查询交易历史

```typescript
const transactions = await stakingService.getTransactions()
const tx = await stakingService.getTransaction({ id: 'tx-123' })
```

## 数据流

```
用户发起 Mint
    │
    ├── 外部链 (ETH/BSC/TRON)
    │   └── 锁定资产到跨链合约
    │
    ├── 跨链桥验证
    │   └── 确认外部链交易
    │
    └── BioForest 链
        └── 铸造对应的 wrapped 资产

用户发起 Burn
    │
    ├── BioForest 链
    │   └── 销毁 wrapped 资产
    │
    ├── 跨链桥验证
    │   └── 确认销毁交易
    │
    └── 外部链
        └── 释放锁定资产
```

## 充值配置

```typescript
type RechargeConfig = Record<
  string,  // BioForest 链 ID
  Record<
    string,  // 资产类型
    {
      assetType: string
      logo?: string
      supportChain: Record<
        string,  // 外部链
        {
          assetType: string
          contract?: string
          decimals: number
        }
      >
    }
  >
>
```

## Mock 控制器

测试环境提供 Mock 控制接口：

```typescript
interface IStakingMockController {
  _resetData(): void
  _setOverview(data: StakingOverviewItem[]): void
  _setDelay(ms: number): void
  _simulateError(error: Error | null): void
}

// 使用示例
const mockController = stakingService as IStakingMockController
mockController._setDelay(1000)  // 模拟 1s 延迟
mockController._simulateError(new Error('Network error'))
```

## 配合 Query 使用

```typescript
import { useStakingOverviewQuery, useStakingTransactionsQuery } from '@/queries/use-staking-query'

function StakingPage() {
  const { data: pools } = useStakingOverviewQuery()
  const { data: txs } = useStakingTransactionsQuery()
  
  return (
    <div>
      {pools?.map(pool => <PoolCard key={pool.assetType} pool={pool} />)}
      {txs?.map(tx => <TransactionItem key={tx.id} tx={tx} />)}
    </div>
  )
}
```
