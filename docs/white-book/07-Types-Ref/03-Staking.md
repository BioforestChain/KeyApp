# Staking 类型

> 源码: [`src/types/staking.ts`](https://github.com/BioforestChain/KeyApp/blob/main/src/types/staking.ts)

## 概述

跨链质押相关类型定义，基于 mpay CotPaymentService。

## 链类型

### 外部链 (External Chain)

```typescript
const ExternalChainSchema = z.enum(['ETH', 'BSC', 'TRON'])
type ExternalChain = 'ETH' | 'BSC' | 'TRON'
```

### 内部链 (Internal Chain)

```typescript
const InternalChainSchema = z.enum(['BFMeta', 'BFChain', 'CCChain', 'PMChain'])
type InternalChain = 'BFMeta' | 'BFChain' | 'CCChain' | 'PMChain'
```

## 核心类型

### StakingTransaction

质押交易记录。

```typescript
interface StakingTransaction {
  id: string
  type: 'mint' | 'burn'
  
  // 来源
  sourceChain: string
  sourceAsset: string
  sourceAmount: Amount
  
  // 目标
  targetChain: string
  targetAsset: string
  targetAmount: Amount
  
  // 状态
  status: 'pending' | 'confirming' | 'confirmed' | 'failed'
  txHash?: string
  errorMessage?: string
  
  // 时间戳
  createdAt: number
  updatedAt: number
}
```

### MintRequest

铸造请求 (外部链 → 内部链)。

```typescript
interface MintRequest {
  sourceChain: ExternalChain    // ETH, BSC, TRON
  sourceAsset: string           // USDT, ETH, etc.
  amount: Amount
  targetChain: InternalChain    // BFMeta, BFChain, etc.
  targetAsset: string           // wUSDT, wETH, etc.
}
```

### BurnRequest

销毁请求 (内部链 → 外部链)。

```typescript
interface BurnRequest {
  sourceChain: InternalChain    // BFMeta, BFChain, etc.
  sourceAsset: string           // wUSDT, wETH, etc.
  amount: Amount
  targetChain: ExternalChain    // ETH, BSC, TRON
  targetAsset: string           // USDT, ETH, etc.
}
```

### StakingOverviewItem

质押池概览。

```typescript
interface StakingOverviewItem {
  chain: InternalChain
  assetType: string
  
  // 用户数据
  stakedAmount: Amount
  stakedFiat: string
  
  // 可用链
  availableChains: ExternalChain[]
  
  // 资产信息
  logoUrl?: string
  externalChain: ExternalChain
  externalAssetType: string
  
  // 池统计
  totalMinted: Amount
  totalCirculation: Amount
  totalBurned: Amount
  totalStaked: Amount
}
```

## 配置类型

### ExternalAssetInfo

外部链资产信息。

```typescript
interface ExternalAssetInfo {
  assetType: string
  contract?: string      // 合约地址
  decimals: number       // 0-18
  logo?: string
}
```

### ChainSupport

链支持配置。

```typescript
interface ChainSupport {
  BSC?: ExternalAssetInfo
  ETH?: ExternalAssetInfo
  TRON?: ExternalAssetInfo
}
```

### RechargeConfig

充值/质押配置。

```typescript
type RechargeConfig = Record<
  string,  // 内部链名 (bfmeta, bfchain, etc.)
  Record<
    string,  // 资产类型 (wUSDT, wETH, etc.)
    {
      assetType: string
      logo?: string
      supportChain: ChainSupport
    }
  >
>
```

### LogoUrlMap

Logo URL 映射。

```typescript
type LogoUrlMap = Record<
  string,  // 链
  Record<string, string>  // 资产 → URL
>
```

## 状态类型

### StakingState

质押状态。

```typescript
interface StakingState {
  config: RechargeConfig | null
  overview: StakingOverviewItem[]
  transactions: StakingTransaction[]
  isLoading: boolean
  error: string | null
}
```

## 使用示例

### Mint 流程

```typescript
// 1. 从 ETH 链 Mint USDT 到 BFMeta
const mintRequest: MintRequest = {
  sourceChain: 'ETH',
  sourceAsset: 'USDT',
  amount: Amount.fromFormatted('100', 6, 'USDT'),
  targetChain: 'BFMeta',
  targetAsset: 'wUSDT',
}

// 2. 提交请求
const tx = await stakingService.submitMint(mintRequest)
// tx.status = 'pending'

// 3. 等待确认
// tx.status = 'confirming' → 'confirmed'
```

### Burn 流程

```typescript
// 1. 从 BFMeta Burn wUSDT 回 ETH
const burnRequest: BurnRequest = {
  sourceChain: 'BFMeta',
  sourceAsset: 'wUSDT',
  amount: Amount.fromFormatted('100', 8, 'wUSDT'),
  targetChain: 'ETH',
  targetAsset: 'USDT',
}

// 2. 提交请求
const tx = await stakingService.submitBurn(burnRequest)
```

### 显示质押池

```tsx
function StakingPoolCard({ item }: { item: StakingOverviewItem }) {
  return (
    <div>
      <TokenIcon symbol={item.assetType} imageUrl={item.logoUrl} />
      <div>{item.chain} - {item.assetType}</div>
      <div>
        已质押: {item.stakedAmount.toFormatted()} ({item.stakedFiat})
      </div>
      <div>
        可赎回到: {item.availableChains.join(', ')}
      </div>
      <div>
        全网: 铸造 {item.totalMinted.toFormatted()} | 
        流通 {item.totalCirculation.toFormatted()}
      </div>
    </div>
  )
}
```

## Zod Schema

所有类型都有对应的 Zod Schema 用于运行时验证：

```typescript
import { 
  ExternalChainSchema,
  InternalChainSchema,
  StakingTxTypeSchema,
  StakingTxStatusSchema,
  RechargeConfigSchema,
} from '@/types/staking'

// 验证外部链
ExternalChainSchema.parse('ETH')  // OK
ExternalChainSchema.parse('SOL')  // throws

// 验证配置
RechargeConfigSchema.parse(apiResponse)
```
