# BFM Pay - Service 接口规范 (强类型安全版)

---

## 1. 设计原则

### 1.1 第一性原理

钱包应用的本质是**数字资产的管理界面**，其核心能力可分解为：

```
用户意图 → 密钥签名 → 链上执行 → 状态同步 → 界面反馈
```

我们的 Service 层设计围绕这个核心流程，但不强求所有链使用同一套接口。

### 1.2 核心设计理念

| 理念 | 说明 |
|-----|------|
| **模块化** | 功能按领域划分为独立 Service 模块，适配器可选择性提供 |
| **强类型安全** | 编译时验证能力实现，重构时自动追踪依赖 |
| **引用依赖** | 能力与接口通过类型系统建立强关联，非字符串反射 |
| **事件驱动** | 统一的事件分发机制，底层实现细节由适配器封装 |
| **链特性保留** | 不抹杀链的独特能力，通过扩展服务暴露 |

### 1.3 类型安全保证

```typescript
// ❌ 弱类型（旧设计）- 编译器无法验证
service as unknown as INativeBalance  // 危险的类型断言
capabilities.add('asset.native-balance')  // 字符串，无法追踪

// ✅ 强类型（新设计）- 编译时完全验证
const assetService = adapter.asset  // 返回 IAssetService | null
if (assetService) {
  await assetService.getNativeBalance(params)  // 类型安全
}
```

### 1.4 架构分层

```
┌──────────────────────────────────────────────────────────────┐
│                      UI Layer (React)                         │
│              TanStack Router + Query + Store                  │
├──────────────────────────────────────────────────────────────┤
│                    Service Hooks                              │  ← 类型安全 Hooks
│              useAssetService() / useTransactionService()      │
├──────────────────────────────────────────────────────────────┤
│                   Adapter Registry                            │  ← 适配器注册
│              按 ChainId 注册/获取 Adapter 实例                  │
├──────────────────────────────────────────────────────────────┤
│                    Chain Adapter                              │  ← 服务容器
│         通过 getter 暴露各 Service 模块 (null = 不支持)          │
├──────────────────────────────────────────────────────────────┤
│                  Service Modules                              │  ← 接口标准
│    IAssetService | ITransactionService | IStakingService      │
├──────────────────────────────────────────────────────────────┤
│                   Provider Layer                              │  ← 第三方
│          viem | tronweb | bitcoinjs-lib | REST APIs          │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. 基础类型定义

### 2.1 核心类型

```typescript
// src/services/types/core.ts

/**
 * 链标识 - Branded Type 确保类型安全
 */
export type ChainId = string & { readonly __brand: unique symbol }

/**
 * 地址 (通用)
 */
export type Address = string & { readonly __brand: unique symbol }

/**
 * 交易哈希
 */
export type TransactionHash = string & { readonly __brand: unique symbol }

/**
 * 十六进制字符串
 */
export type Hex = `0x${string}`

/**
 * 类型安全的构造函数
 */
export const ChainId = (value: string): ChainId => value as ChainId
export const Address = (value: string): Address => value as Address
export const TransactionHash = (value: string): TransactionHash => value as TransactionHash
```

### 2.2 资产类型

```typescript
// src/services/types/asset.ts

import type { ChainId, Address } from './core'

export type TokenStandard =
  | 'native'
  | 'ERC20' | 'ERC721' | 'ERC1155'
  | 'TRC20' | 'TRC721'
  | 'BEP20'
  | 'SPL'

export interface TokenMetadata {
  readonly chainId: ChainId
  readonly address: Address | null // null = 原生代币
  readonly name: string
  readonly symbol: string
  readonly decimals: number
  readonly logoUri?: string
  readonly standard: TokenStandard
}

export interface AssetBalance {
  readonly token: TokenMetadata
  readonly balance: bigint
  readonly formatted: string
}

export interface AssetValuation extends AssetBalance {
  readonly price: number
  readonly value: number
  readonly currency: string
  readonly change24h?: number
}

export interface NFTAsset {
  readonly chainId: ChainId
  readonly contractAddress: Address
  readonly tokenId: string
  readonly standard: 'ERC721' | 'ERC1155' | 'TRC721'
  readonly name?: string
  readonly description?: string
  readonly imageUri?: string
  readonly balance: bigint
}
```

### 2.3 交易类型

```typescript
// src/services/types/transaction.ts

import type { ChainId, Address, TransactionHash, Hex } from './core'

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'dropped'

export interface TransactionRequest {
  readonly chainId: ChainId
  readonly from: Address
  readonly to: Address | null
  readonly value: bigint
  readonly data?: Hex
  readonly nonce?: number
}

export interface SignedTransaction {
  readonly chainId: ChainId
  readonly raw: Hex
  readonly hash: TransactionHash
}

export interface TransactionReceipt {
  readonly chainId: ChainId
  readonly hash: TransactionHash
  readonly status: 'success' | 'failed'
  readonly blockNumber: bigint
  readonly gasUsed: bigint
}

export interface TransactionRecord {
  readonly chainId: ChainId
  readonly hash: TransactionHash
  readonly from: Address
  readonly to: Address | null
  readonly value: bigint
  readonly status: TransactionStatus
  readonly blockNumber?: bigint
  readonly timestamp?: number
  readonly type: 'transfer' | 'contract-call' | 'approval' | 'swap' | 'stake' | 'unknown'
}
```

### 2.4 Fee 类型

```typescript
// src/services/types/fee.ts

export type FeeModel =
  | EIP1559Fee
  | LegacyFee
  | TronResourceFee
  | UTXOFee
  | FixedFee

export interface EIP1559Fee {
  readonly type: 'eip1559'
  readonly maxFeePerGas: bigint
  readonly maxPriorityFeePerGas: bigint
  readonly gasLimit: bigint
}

export interface LegacyFee {
  readonly type: 'legacy'
  readonly gasPrice: bigint
  readonly gasLimit: bigint
}

export interface TronResourceFee {
  readonly type: 'tron-resource'
  readonly bandwidth: number
  readonly energy: number
  readonly trxBurn: bigint
}

export interface UTXOFee {
  readonly type: 'utxo'
  readonly feeRate: number // sat/vB
  readonly estimatedSize: number
  readonly totalFee: bigint
}

export interface FixedFee {
  readonly type: 'fixed'
  readonly amount: bigint
}

export interface FeeEstimation {
  readonly slow: FeeModel
  readonly standard: FeeModel
  readonly fast: FeeModel
  readonly estimatedTimes: {
    readonly slow: number
    readonly standard: number
    readonly fast: number
  }
}
```

---

## 3. 事件系统

### 3.1 类型安全的事件定义

```typescript
// src/services/events/types.ts

export interface Subscription {
  unsubscribe(): void
  readonly closed: boolean
}

/**
 * 可订阅数据源 - 类型安全的 Observable 简化版
 */
export interface Subscribable<T> {
  subscribe(observer: SubscribeObserver<T>): Subscription
  getCurrentValue?(): T | undefined
}

export interface SubscribeObserver<T> {
  next: (value: T) => void
  error?: (error: Error) => void
  complete?: () => void
}

/**
 * 创建简单的 Subscribable
 */
export function createSubscribable<T>(
  setup: (emit: (value: T) => void) => () => void
): Subscribable<T> {
  return {
    subscribe(observer) {
      let closed = false
      const cleanup = setup((value) => {
        if (!closed) observer.next(value)
      })
      return {
        get closed() { return closed },
        unsubscribe() {
          closed = true
          cleanup()
        },
      }
    },
  }
}
```

### 3.2 服务事件类型

```typescript
// src/services/events/definitions.ts

import type { ChainId, Address, TransactionHash } from '../types/core'
import type { AssetBalance } from '../types/asset'
import type { TransactionReceipt } from '../types/transaction'

/**
 * 余额变化事件
 */
export interface BalanceChangeEvent {
  readonly chainId: ChainId
  readonly address: Address
  readonly tokenAddress: Address | null
  readonly newBalance: AssetBalance
  readonly previousBalance: AssetBalance
}

/**
 * 交易状态变化事件
 */
export interface TransactionStatusEvent {
  readonly chainId: ChainId
  readonly hash: TransactionHash
  readonly status: 'pending' | 'confirmed' | 'failed' | 'dropped'
  readonly receipt?: TransactionReceipt
}

/**
 * 新区块事件
 */
export interface NewBlockEvent {
  readonly chainId: ChainId
  readonly blockNumber: bigint
  readonly blockHash: string
  readonly timestamp: number
}
```

---

## 4. Service 模块接口

### 4.1 设计原则

每个 Service 模块是一个**独立的接口**，适配器通过 getter 返回实例或 `null`：

```typescript
// ✅ 强类型：编译器知道返回类型
const assetService: IAssetService | null = adapter.asset

// ✅ 类型收窄：if 检查后类型安全
if (assetService) {
  const balance = await assetService.getNativeBalance(params)
}

// ✅ 重构友好：重命名方法会触发编译错误
```

### 4.2 资产服务 (IAssetService)

```typescript
// src/services/modules/asset.ts

import type { ChainId, Address } from '../types/core'
import type { AssetBalance, AssetValuation, TokenMetadata, NFTAsset } from '../types/asset'
import type { Subscribable } from '../events/types'

/**
 * 余额查询参数
 */
export interface BalanceQuery {
  readonly address: Address
}

/**
 * 代币余额查询参数
 */
export interface TokenBalanceQuery extends BalanceQuery {
  readonly tokenAddresses?: readonly Address[]
}

/**
 * 资产服务接口
 */
export interface IAssetService {
  /**
   * 获取原生代币余额
   */
  getNativeBalance(query: BalanceQuery): Promise<AssetBalance>

  /**
   * 获取代币余额列表
   * @param query.tokenAddresses 指定代币地址，不传则返回所有持有代币
   */
  getTokenBalances(query: TokenBalanceQuery): Promise<readonly AssetBalance[]>

  /**
   * 获取代币元数据
   */
  getTokenMetadata(tokenAddress: Address): Promise<TokenMetadata>

  /**
   * 搜索代币
   */
  searchTokens(query: string, limit?: number): Promise<readonly TokenMetadata[]>
}

/**
 * 资产订阅服务（可选扩展）
 */
export interface IAssetSubscription {
  /**
   * 订阅原生代币余额变化
   */
  subscribeNativeBalance(query: BalanceQuery): Subscribable<AssetBalance>

  /**
   * 订阅代币余额变化
   */
  subscribeTokenBalance(
    query: BalanceQuery & { tokenAddress: Address }
  ): Subscribable<AssetBalance>
}

/**
 * 资产估值服务（可选扩展）
 */
export interface IAssetValuationService {
  /**
   * 获取资产估值（含法币价格）
   */
  getValuations(query: BalanceQuery, currency?: string): Promise<readonly AssetValuation[]>

  /**
   * 获取单个代币价格
   */
  getTokenPrice(
    tokenAddress: Address | null,
    currency?: string
  ): Promise<{ price: number; change24h?: number }>
}

/**
 * NFT 服务（可选扩展）
 */
export interface INFTService {
  /**
   * 获取地址持有的 NFT
   */
  getNFTs(query: BalanceQuery): Promise<readonly NFTAsset[]>

  /**
   * 获取 NFT 详情
   */
  getNFTMetadata(contractAddress: Address, tokenId: string): Promise<NFTAsset>
}
```

### 4.3 交易服务 (ITransactionService)

```typescript
// src/services/modules/transaction.ts

import type { Address, TransactionHash, Hex } from '../types/core'
import type {
  TransactionRequest,
  SignedTransaction,
  TransactionReceipt,
  TransactionRecord,
  TransactionStatus,
} from '../types/transaction'
import type { FeeModel, FeeEstimation } from '../types/fee'
import type { Subscribable } from '../events/types'

/**
 * 构建交易参数
 */
export interface BuildTransactionParams {
  readonly request: TransactionRequest
  readonly fee?: FeeModel
}

/**
 * 构建结果
 */
export interface BuiltTransaction {
  readonly unsigned: Hex
  readonly estimatedFee: FeeModel
  readonly simulation?: {
    readonly success: boolean
    readonly gasUsed?: bigint
    readonly error?: string
  }
}

/**
 * 交易历史查询参数
 */
export interface TransactionHistoryQuery {
  readonly address: Address
  readonly cursor?: string
  readonly limit?: number
  readonly type?: TransactionRecord['type']
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  readonly items: readonly T[]
  readonly nextCursor?: string
  readonly hasMore: boolean
}

/**
 * 交易服务接口
 */
export interface ITransactionService {
  /**
   * 构建交易
   */
  buildTransaction(params: BuildTransactionParams): Promise<BuiltTransaction>

  /**
   * 签名交易
   */
  signTransaction(unsigned: Hex, signer: Address): Promise<SignedTransaction>

  /**
   * 广播交易
   */
  broadcastTransaction(signed: SignedTransaction): Promise<TransactionHash>

  /**
   * 获取交易状态
   */
  getTransactionStatus(hash: TransactionHash): Promise<TransactionStatus>

  /**
   * 获取交易回执
   */
  getTransactionReceipt(hash: TransactionHash): Promise<TransactionReceipt | null>

  /**
   * 等待交易确认
   */
  waitForTransaction(
    hash: TransactionHash,
    confirmations?: number
  ): Promise<TransactionReceipt>
}

/**
 * Fee 估算服务（可选扩展）
 */
export interface IFeeEstimationService {
  /**
   * 估算交易费用
   */
  estimateFee(request: TransactionRequest): Promise<FeeEstimation>

  /**
   * 获取当前网络费率
   */
  getCurrentFeeRate(): Promise<FeeEstimation>
}

/**
 * 交易加速/取消服务（EVM 可选扩展）
 */
export interface ITransactionSpeedUpService {
  /**
   * 加速交易
   */
  speedUp(hash: TransactionHash, newFee: FeeModel): Promise<TransactionHash>

  /**
   * 取消交易
   */
  cancel(hash: TransactionHash, fee?: FeeModel): Promise<TransactionHash>
}

/**
 * 交易历史服务（可选扩展）
 */
export interface ITransactionHistoryService {
  /**
   * 获取交易历史
   */
  getHistory(query: TransactionHistoryQuery): Promise<PaginatedResult<TransactionRecord>>
}

/**
 * 交易订阅服务（可选扩展）
 */
export interface ITransactionSubscription {
  /**
   * 订阅交易状态
   */
  subscribeTransactionStatus(
    hash: TransactionHash
  ): Subscribable<{ status: TransactionStatus; receipt?: TransactionReceipt }>
}
```

### 4.4 身份服务 (IIdentityService)

```typescript
// src/services/modules/identity.ts

import type { Address, Hex } from '../types/core'

/**
 * 地址派生参数
 */
export interface DeriveAddressParams {
  /** 助记词或种子 */
  readonly seed: Uint8Array
  /** 派生路径 */
  readonly path?: string
  /** 地址索引 */
  readonly index?: number
}

/**
 * 派生结果
 */
export interface DerivedAddress {
  readonly address: Address
  readonly publicKey: Hex
  readonly path: string
}

/**
 * 签名消息参数
 */
export interface SignMessageParams {
  readonly message: string | Uint8Array
  readonly signer: Address
}

/**
 * 身份服务接口
 */
export interface IIdentityService {
  /**
   * 派生地址
   */
  deriveAddress(params: DeriveAddressParams): Promise<DerivedAddress>

  /**
   * 批量派生地址
   */
  deriveAddresses(params: DeriveAddressParams, count: number): Promise<readonly DerivedAddress[]>

  /**
   * 验证地址格式
   */
  isValidAddress(address: string): boolean

  /**
   * 规范化地址（如 EVM 的 checksum）
   */
  normalizeAddress(address: string): Address

  /**
   * 签名消息
   */
  signMessage(params: SignMessageParams): Promise<Hex>

  /**
   * 验证签名
   */
  verifyMessage(params: SignMessageParams & { signature: Hex }): Promise<boolean>
}

/**
 * EIP-712 类型数据签名（EVM 扩展）
 */
export interface ITypedDataSigningService {
  /**
   * 签名类型化数据
   */
  signTypedData(params: {
    signer: Address
    domain: TypedDataDomain
    types: Record<string, readonly TypedDataField[]>
    primaryType: string
    message: Record<string, unknown>
  }): Promise<Hex>
}

export interface TypedDataDomain {
  readonly name?: string
  readonly version?: string
  readonly chainId?: number
  readonly verifyingContract?: Address
}

export interface TypedDataField {
  readonly name: string
  readonly type: string
}
```

### 4.5 链信息服务 (IChainService)

```typescript
// src/services/modules/chain.ts

import type { Subscribable } from '../events/types'

/**
 * 区块信息
 */
export interface BlockInfo {
  readonly number: bigint
  readonly hash: string
  readonly parentHash: string
  readonly timestamp: number
  readonly transactionCount: number
}

/**
 * 网络状态
 */
export interface NetworkStatus {
  readonly connected: boolean
  readonly latestBlock: bigint
  readonly syncing: boolean
  readonly latency?: number
}

/**
 * 链信息服务接口
 */
export interface IChainService {
  /**
   * 获取最新区块
   */
  getLatestBlock(): Promise<BlockInfo>

  /**
   * 获取指定区块
   */
  getBlock(numberOrHash: bigint | string): Promise<BlockInfo>

  /**
   * 获取网络状态
   */
  getNetworkStatus(): Promise<NetworkStatus>
}

/**
 * 区块订阅服务（可选扩展）
 */
export interface IBlockSubscription {
  /**
   * 订阅新区块
   */
  subscribeNewBlocks(): Subscribable<BlockInfo>
}
```

### 4.6 智能合约服务 (IContractService) - EVM 扩展

```typescript
// src/services/modules/contract.ts

import type { Address, Hex } from '../types/core'
import type { Subscribable } from '../events/types'

/**
 * 合约调用参数
 */
export interface ContractCallParams {
  readonly to: Address
  readonly data: Hex
  readonly from?: Address
  readonly value?: bigint
  readonly blockNumber?: bigint
}

/**
 * 事件日志
 */
export interface EventLog {
  readonly address: Address
  readonly topics: readonly Hex[]
  readonly data: Hex
  readonly blockNumber: bigint
  readonly transactionHash: string
  readonly logIndex: number
}

/**
 * 事件查询参数
 */
export interface EventLogQuery {
  readonly address?: Address
  readonly topics?: readonly (Hex | readonly Hex[] | null)[]
  readonly fromBlock?: bigint
  readonly toBlock?: bigint
}

/**
 * 智能合约服务接口（EVM 链专用）
 */
export interface IContractService {
  /**
   * 调用合约（只读）
   */
  call(params: ContractCallParams): Promise<Hex>

  /**
   * 批量调用
   */
  multicall(params: readonly ContractCallParams[]): Promise<readonly Hex[]>

  /**
   * 查询事件日志
   */
  getLogs(query: EventLogQuery): Promise<readonly EventLog[]>

  /**
   * 编码函数调用
   */
  encodeFunctionData(
    abi: readonly unknown[],
    functionName: string,
    args: readonly unknown[]
  ): Hex

  /**
   * 解码函数返回值
   */
  decodeFunctionResult(
    abi: readonly unknown[],
    functionName: string,
    data: Hex
  ): unknown

  /**
   * 解码事件日志
   */
  decodeEventLog(
    abi: readonly unknown[],
    eventName: string,
    log: EventLog
  ): Record<string, unknown>
}

/**
 * 事件订阅服务（可选扩展）
 */
export interface IEventSubscription {
  /**
   * 订阅合约事件
   */
  subscribeToLogs(query: EventLogQuery): Subscribable<EventLog>
}
```

### 4.7 DeFi 服务 (IDeFiService)

```typescript
// src/services/modules/defi.ts

import type { Address, TransactionHash } from '../types/core'
import type { TokenMetadata } from '../types/asset'

/**
 * 授权信息
 */
export interface AllowanceInfo {
  readonly owner: Address
  readonly spender: Address
  readonly tokenAddress: Address
  readonly allowance: bigint
  readonly isUnlimited: boolean
}

/**
 * Swap 路由
 */
export interface SwapRoute {
  readonly tokenIn: TokenMetadata
  readonly tokenOut: TokenMetadata
  readonly amountIn: bigint
  readonly amountOut: bigint
  readonly minAmountOut: bigint
  readonly priceImpact: number
  readonly path: readonly Address[]
  readonly protocol: string
}

/**
 * DeFi 服务接口
 */
export interface IDeFiService {
  /**
   * 查询授权额度
   */
  getAllowance(
    tokenAddress: Address,
    owner: Address,
    spender: Address
  ): Promise<AllowanceInfo>

  /**
   * 获取所有授权
   */
  getAllAllowances(owner: Address): Promise<readonly AllowanceInfo[]>

  /**
   * 授权代币
   */
  approve(
    tokenAddress: Address,
    spender: Address,
    amount: bigint,
    from: Address
  ): Promise<TransactionHash>

  /**
   * 撤销授权
   */
  revokeApproval(
    tokenAddress: Address,
    spender: Address,
    from: Address
  ): Promise<TransactionHash>
}

/**
 * Swap 服务（可选扩展）
 */
export interface ISwapService {
  /**
   * 获取 Swap 路由
   */
  getSwapRoute(params: {
    tokenIn: Address | null
    tokenOut: Address | null
    amountIn?: bigint
    amountOut?: bigint
    slippageTolerance: number
  }): Promise<SwapRoute | null>

  /**
   * 执行 Swap
   */
  executeSwap(route: SwapRoute, from: Address): Promise<TransactionHash>
}
```

### 4.8 质押服务 (IStakingService) - 链特定

```typescript
// src/services/modules/staking.ts

import type { Address, TransactionHash } from '../types/core'

/**
 * 质押信息
 */
export interface StakingInfo {
  readonly stakedAmount: bigint
  readonly pendingRewards: bigint
  readonly unbondingAmount: bigint
  readonly unbondingEndTime?: number
}

/**
 * 验证者信息
 */
export interface ValidatorInfo {
  readonly address: Address
  readonly name: string
  readonly commission: number
  readonly totalStaked: bigint
  readonly status: 'active' | 'inactive' | 'jailed'
  readonly apr?: number
}

/**
 * 委托信息
 */
export interface DelegationInfo {
  readonly validator: ValidatorInfo
  readonly amount: bigint
  readonly rewards: bigint
}

/**
 * 基础质押服务
 */
export interface IStakingService {
  /**
   * 获取质押信息
   */
  getStakingInfo(address: Address): Promise<StakingInfo>

  /**
   * 获取最小质押额
   */
  getMinimumStake(): Promise<bigint>

  /**
   * 获取解锁期（秒）
   */
  getUnbondingPeriod(): Promise<number>

  /**
   * 质押
   */
  stake(amount: bigint, from: Address): Promise<TransactionHash>

  /**
   * 解除质押
   */
  unstake(amount: bigint, from: Address): Promise<TransactionHash>

  /**
   * 领取奖励
   */
  claimRewards(from: Address): Promise<TransactionHash>
}

/**
 * 委托服务（PoS 链扩展）
 */
export interface IDelegationService {
  /**
   * 获取验证者列表
   */
  getValidators(): Promise<readonly ValidatorInfo[]>

  /**
   * 获取我的委托
   */
  getDelegations(address: Address): Promise<readonly DelegationInfo[]>

  /**
   * 委托
   */
  delegate(
    validator: Address,
    amount: bigint,
    from: Address
  ): Promise<TransactionHash>

  /**
   * 解除委托
   */
  undelegate(
    validator: Address,
    amount: bigint,
    from: Address
  ): Promise<TransactionHash>

  /**
   * 重新委托
   */
  redelegate(
    fromValidator: Address,
    toValidator: Address,
    amount: bigint,
    from: Address
  ): Promise<TransactionHash>
}

/**
 * 投票服务（治理扩展）
 */
export interface IVotingService {
  /**
   * 投票
   */
  vote(
    proposalId: string,
    option: 'yes' | 'no' | 'abstain' | 'veto',
    from: Address
  ): Promise<TransactionHash>
}
```

---

## 5. Chain Adapter（服务容器）

### 5.1 Adapter 接口定义

```typescript
// src/services/adapter/types.ts

import type { ChainId } from '../types/core'
import type { IAssetService, IAssetSubscription, IAssetValuationService, INFTService } from '../modules/asset'
import type { ITransactionService, IFeeEstimationService, ITransactionSpeedUpService, ITransactionHistoryService, ITransactionSubscription } from '../modules/transaction'
import type { IIdentityService, ITypedDataSigningService } from '../modules/identity'
import type { IChainService, IBlockSubscription } from '../modules/chain'
import type { IContractService, IEventSubscription } from '../modules/contract'
import type { IDeFiService, ISwapService } from '../modules/defi'
import type { IStakingService, IDelegationService, IVotingService } from '../modules/staking'

/**
 * Adapter 元数据
 */
export interface AdapterMetadata {
  readonly id: string
  readonly chainId: ChainId
  readonly name: string
  readonly version: string
}

/**
 * Chain Adapter 接口
 * 
 * 通过 getter 暴露各 Service 模块
 * 返回 null 表示该链不支持此功能
 * 
 * 这是强类型安全的核心：
 * - 编译器知道每个 getter 的返回类型
 * - 重构时自动追踪所有依赖
 * - 不需要类型断言或反射
 */
export interface IChainAdapter {
  readonly metadata: AdapterMetadata

  // ============================================================
  // 核心服务（大多数链都应实现）
  // ============================================================

  /** 身份服务 */
  readonly identity: IIdentityService | null

  /** 资产服务 */
  readonly asset: IAssetService | null

  /** 交易服务 */
  readonly transaction: ITransactionService | null

  /** 链信息服务 */
  readonly chain: IChainService | null

  // ============================================================
  // 可选扩展服务
  // ============================================================

  /** 资产订阅 */
  readonly assetSubscription: IAssetSubscription | null

  /** 资产估值 */
  readonly assetValuation: IAssetValuationService | null

  /** NFT */
  readonly nft: INFTService | null

  /** Fee 估算 */
  readonly feeEstimation: IFeeEstimationService | null

  /** 交易加速/取消 */
  readonly transactionSpeedUp: ITransactionSpeedUpService | null

  /** 交易历史 */
  readonly transactionHistory: ITransactionHistoryService | null

  /** 交易订阅 */
  readonly transactionSubscription: ITransactionSubscription | null

  /** 区块订阅 */
  readonly blockSubscription: IBlockSubscription | null

  // ============================================================
  // EVM 扩展
  // ============================================================

  /** EIP-712 签名 */
  readonly typedDataSigning: ITypedDataSigningService | null

  /** 智能合约 */
  readonly contract: IContractService | null

  /** 事件订阅 */
  readonly eventSubscription: IEventSubscription | null

  /** DeFi */
  readonly defi: IDeFiService | null

  /** Swap */
  readonly swap: ISwapService | null

  // ============================================================
  // 质押扩展
  // ============================================================

  /** 基础质押 */
  readonly staking: IStakingService | null

  /** 委托 */
  readonly delegation: IDelegationService | null

  /** 投票 */
  readonly voting: IVotingService | null

  // ============================================================
  // 生命周期
  // ============================================================

  /** 初始化 */
  initialize(): Promise<void>

  /** 销毁 */
  destroy(): Promise<void>

  /** 健康检查 */
  healthCheck(): Promise<{ healthy: boolean; latency?: number }>
}
```

### 5.2 类型安全的服务键

```typescript
// src/services/adapter/service-keys.ts

import type { IChainAdapter } from './types'

/**
 * 所有服务键（从 IChainAdapter 接口自动推导）
 * 
 * 这保证了：
 * 1. 服务键与接口属性完全同步
 * 2. 重命名属性会自动更新所有使用处
 * 3. 添加新服务时类型自动推导
 */
export type ServiceKey = {
  [K in keyof IChainAdapter]: IChainAdapter[K] extends ((...args: never[]) => unknown) | AdapterMetadata
    ? never
    : K
}[keyof IChainAdapter]

// 自动推导的结果类似于：
// type ServiceKey = 
//   | 'identity' | 'asset' | 'transaction' | 'chain'
//   | 'assetSubscription' | 'assetValuation' | 'nft'
//   | 'feeEstimation' | 'transactionSpeedUp' | ...

/**
 * 获取特定服务的类型
 */
export type ServiceType<K extends ServiceKey> = NonNullable<IChainAdapter[K]>

/**
 * 检查服务是否可用的类型守卫
 */
export function hasService<K extends ServiceKey>(
  adapter: IChainAdapter,
  key: K
): adapter is IChainAdapter & { readonly [P in K]: ServiceType<K> } {
  return adapter[key] !== null
}
```

### 5.3 Adapter 基类

```typescript
// src/services/adapter/base-adapter.ts

import type { IChainAdapter, AdapterMetadata } from './types'
import type { IIdentityService, ITypedDataSigningService } from '../modules/identity'
import type { IAssetService, IAssetSubscription, IAssetValuationService, INFTService } from '../modules/asset'
// ... 其他 imports

/**
 * Adapter 基类
 * 
 * 所有服务默认返回 null
 * 子类只需 override 自己支持的服务
 */
export abstract class BaseAdapter implements IChainAdapter {
  abstract readonly metadata: AdapterMetadata

  // 默认都返回 null（不支持）
  get identity(): IIdentityService | null { return null }
  get asset(): IAssetService | null { return null }
  get transaction(): ITransactionService | null { return null }
  get chain(): IChainService | null { return null }

  get assetSubscription(): IAssetSubscription | null { return null }
  get assetValuation(): IAssetValuationService | null { return null }
  get nft(): INFTService | null { return null }

  get feeEstimation(): IFeeEstimationService | null { return null }
  get transactionSpeedUp(): ITransactionSpeedUpService | null { return null }
  get transactionHistory(): ITransactionHistoryService | null { return null }
  get transactionSubscription(): ITransactionSubscription | null { return null }
  get blockSubscription(): IBlockSubscription | null { return null }

  get typedDataSigning(): ITypedDataSigningService | null { return null }
  get contract(): IContractService | null { return null }
  get eventSubscription(): IEventSubscription | null { return null }
  get defi(): IDeFiService | null { return null }
  get swap(): ISwapService | null { return null }

  get staking(): IStakingService | null { return null }
  get delegation(): IDelegationService | null { return null }
  get voting(): IVotingService | null { return null }

  abstract initialize(): Promise<void>
  abstract destroy(): Promise<void>
  abstract healthCheck(): Promise<{ healthy: boolean; latency?: number }>
}
```

---

## 6. Adapter 实现示例

### 6.1 EVM Adapter

```typescript
// src/services/adapters/evm/evm-adapter.ts

import { createPublicClient, createWalletClient, http, type Chain, type PublicClient } from 'viem'
import { BaseAdapter } from '../../adapter/base-adapter'
import type { AdapterMetadata } from '../../adapter/types'
import type { ChainId } from '../../types/core'
import { EvmIdentityService } from './services/identity'
import { EvmAssetService } from './services/asset'
import { EvmTransactionService } from './services/transaction'
import { EvmChainService } from './services/chain'
import { EvmContractService } from './services/contract'
import { EvmDeFiService } from './services/defi'

export interface EvmAdapterConfig {
  chainId: ChainId
  chain: Chain
  rpcUrl: string
  name?: string
}

/**
 * EVM 链适配器
 * 
 * 实现了 EVM 链支持的所有服务
 * 类型完全安全，无需断言
 */
export class EvmAdapter extends BaseAdapter {
  readonly metadata: AdapterMetadata

  private publicClient: PublicClient
  
  // 服务实例（惰性初始化）
  private _identity?: EvmIdentityService
  private _asset?: EvmAssetService
  private _transaction?: EvmTransactionService
  private _chain?: EvmChainService
  private _contract?: EvmContractService
  private _defi?: EvmDeFiService

  constructor(private config: EvmAdapterConfig) {
    super()
    
    this.metadata = {
      id: `evm-${config.chainId}`,
      chainId: config.chainId,
      name: config.name ?? config.chain.name,
      version: '1.0.0',
    }

    this.publicClient = createPublicClient({
      chain: config.chain,
      transport: http(config.rpcUrl),
    })
  }

  // ============================================================
  // 服务 Getters（类型安全！）
  // ============================================================

  override get identity(): EvmIdentityService {
    return this._identity ??= new EvmIdentityService(this.config.chain)
  }

  override get asset(): EvmAssetService {
    return this._asset ??= new EvmAssetService(this.publicClient, this.config.chainId)
  }

  override get transaction(): EvmTransactionService {
    return this._transaction ??= new EvmTransactionService(this.publicClient)
  }

  override get chain(): EvmChainService {
    return this._chain ??= new EvmChainService(this.publicClient)
  }

  override get contract(): EvmContractService {
    return this._contract ??= new EvmContractService(this.publicClient)
  }

  override get defi(): EvmDeFiService {
    return this._defi ??= new EvmDeFiService(this.publicClient)
  }

  // EVM 支持 EIP-712
  override get typedDataSigning() {
    return this.identity // EvmIdentityService 实现了 ITypedDataSigningService
  }

  // EVM 支持交易加速/取消
  override get transactionSpeedUp() {
    return this.transaction // EvmTransactionService 实现了 ITransactionSpeedUpService
  }

  // EVM 支持 Fee 估算
  override get feeEstimation() {
    return this.transaction // EvmTransactionService 实现了 IFeeEstimationService
  }

  // ============================================================
  // 生命周期
  // ============================================================

  async initialize(): Promise<void> {
    await this.publicClient.getBlockNumber()
  }

  async destroy(): Promise<void> {
    // 清理资源
  }

  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    const start = Date.now()
    try {
      await this.publicClient.getBlockNumber()
      return { healthy: true, latency: Date.now() - start }
    } catch {
      return { healthy: false }
    }
  }
}
```

### 6.2 Tron Adapter

```typescript
// src/services/adapters/tron/tron-adapter.ts

import TronWeb from 'tronweb'
import { BaseAdapter } from '../../adapter/base-adapter'
import type { AdapterMetadata } from '../../adapter/types'
import type { ChainId } from '../../types/core'
import { TronIdentityService } from './services/identity'
import { TronAssetService } from './services/asset'
import { TronTransactionService } from './services/transaction'
import { TronStakingService } from './services/staking'

export interface TronAdapterConfig {
  chainId: ChainId
  fullHost: string
  name?: string
}

/**
 * Tron 链适配器
 * 
 * 注意 Tron 不支持的功能：
 * - EIP-712 类型签名 (typedDataSigning = null)
 * - 交易加速/取消 (transactionSpeedUp = null)
 * - 智能合约 multicall (contract = null)
 * 
 * Tron 特有功能：
 * - 资源质押 (staking)
 * - 投票 (voting)
 */
export class TronAdapter extends BaseAdapter {
  readonly metadata: AdapterMetadata

  private tronWeb: TronWeb

  private _identity?: TronIdentityService
  private _asset?: TronAssetService
  private _transaction?: TronTransactionService
  private _staking?: TronStakingService

  constructor(private config: TronAdapterConfig) {
    super()

    this.metadata = {
      id: `tron-${config.chainId}`,
      chainId: config.chainId,
      name: config.name ?? 'Tron',
      version: '1.0.0',
    }

    this.tronWeb = new TronWeb({ fullHost: config.fullHost })
  }

  // ============================================================
  // Tron 支持的服务
  // ============================================================

  override get identity(): TronIdentityService {
    return this._identity ??= new TronIdentityService(this.tronWeb)
  }

  override get asset(): TronAssetService {
    return this._asset ??= new TronAssetService(this.tronWeb, this.config.chainId)
  }

  override get transaction(): TronTransactionService {
    return this._transaction ??= new TronTransactionService(this.tronWeb)
  }

  override get feeEstimation() {
    return this.transaction // TronTransactionService 实现了 IFeeEstimationService
  }

  // Tron 特有：资源质押
  override get staking(): TronStakingService {
    return this._staking ??= new TronStakingService(this.tronWeb)
  }

  // Tron 特有：投票
  override get voting() {
    return this.staking // TronStakingService 实现了 IVotingService
  }

  // ============================================================
  // Tron 不支持的服务（保持 null，继承自 BaseAdapter）
  // ============================================================
  // typedDataSigning = null (不支持 EIP-712)
  // transactionSpeedUp = null (Tron 不支持)
  // contract = null (Tron 合约模型不同)

  // ============================================================
  // 生命周期
  // ============================================================

  async initialize(): Promise<void> {
    await this.tronWeb.trx.getBlock('latest')
  }

  async destroy(): Promise<void> {}

  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    const start = Date.now()
    try {
      await this.tronWeb.trx.getBlock('latest')
      return { healthy: true, latency: Date.now() - start }
    } catch {
      return { healthy: false }
    }
  }
}
```

### 6.3 价格服务适配器（仅提供估值）

```typescript
// src/services/adapters/price/coingecko-adapter.ts

import { BaseAdapter } from '../../adapter/base-adapter'
import type { AdapterMetadata } from '../../adapter/types'
import type { ChainId, Address } from '../../types/core'
import type { IAssetValuationService } from '../../modules/asset'
import type { AssetValuation, BalanceQuery } from '../../types/asset'

/**
 * CoinGecko 价格适配器
 * 
 * 这是一个"部分适配器"示例：
 * 只实现 assetValuation，其他服务都是 null
 */
export class CoinGeckoAdapter extends BaseAdapter {
  readonly metadata: AdapterMetadata

  constructor(
    private chainId: ChainId,
    private apiKey?: string
  ) {
    super()
    this.metadata = {
      id: `coingecko-${chainId}`,
      chainId,
      name: 'CoinGecko Price Service',
      version: '1.0.0',
    }
  }

  // 只实现价格服务
  override get assetValuation(): CoinGeckoPriceService {
    return new CoinGeckoPriceService(this.chainId, this.apiKey)
  }

  // 其他服务保持 null（继承自 BaseAdapter）

  async initialize(): Promise<void> {}
  async destroy(): Promise<void> {}
  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    return { healthy: true }
  }
}

class CoinGeckoPriceService implements IAssetValuationService {
  constructor(
    private chainId: ChainId,
    private apiKey?: string
  ) {}

  async getValuations(query: BalanceQuery, currency = 'usd'): Promise<readonly AssetValuation[]> {
    // 实现...
    return []
  }

  async getTokenPrice(
    tokenAddress: Address | null,
    currency = 'usd'
  ): Promise<{ price: number; change24h?: number }> {
    // 实现...
    return { price: 0 }
  }
}
```

---

## 7. Adapter Registry

### 7.1 类型安全的注册表

```typescript
// src/services/registry.ts

import type { ChainId } from './types/core'
import type { IChainAdapter } from './adapter/types'
import type { ServiceKey, ServiceType } from './adapter/service-keys'
import { hasService } from './adapter/service-keys'

/**
 * Adapter 注册表
 */
class AdapterRegistry {
  private adapters = new Map<ChainId, IChainAdapter>()
  private aliases = new Map<string, ChainId>()

  /**
   * 注册适配器
   */
  register(adapter: IChainAdapter): void {
    const { chainId } = adapter.metadata
    if (this.adapters.has(chainId)) {
      throw new Error(`Adapter for chain ${chainId} already registered`)
    }
    this.adapters.set(chainId, adapter)
  }

  /**
   * 注销适配器
   */
  unregister(chainId: ChainId): void {
    const adapter = this.adapters.get(chainId)
    if (adapter) {
      adapter.destroy()
      this.adapters.delete(chainId)
    }
  }

  /**
   * 获取适配器
   */
  get(chainId: ChainId): IChainAdapter | undefined {
    return this.adapters.get(chainId)
  }

  /**
   * 获取适配器（必须存在）
   */
  getOrThrow(chainId: ChainId): IChainAdapter {
    const adapter = this.get(chainId)
    if (!adapter) {
      throw new Error(`No adapter registered for chain ${chainId}`)
    }
    return adapter
  }

  /**
   * 获取特定服务（类型安全）
   */
  getService<K extends ServiceKey>(
    chainId: ChainId,
    serviceKey: K
  ): ServiceType<K> | null {
    const adapter = this.get(chainId)
    if (!adapter) return null
    return adapter[serviceKey] as ServiceType<K> | null
  }

  /**
   * 获取特定服务（必须存在）
   */
  getServiceOrThrow<K extends ServiceKey>(
    chainId: ChainId,
    serviceKey: K
  ): ServiceType<K> {
    const service = this.getService(chainId, serviceKey)
    if (!service) {
      throw new Error(`Service ${serviceKey} not available for chain ${chainId}`)
    }
    return service
  }

  /**
   * 查找支持特定服务的所有链
   */
  findChainsWithService<K extends ServiceKey>(serviceKey: K): ChainId[] {
    const result: ChainId[] = []
    for (const [chainId, adapter] of this.adapters) {
      if (hasService(adapter, serviceKey)) {
        result.push(chainId)
      }
    }
    return result
  }

  /**
   * 注册链别名
   */
  registerAlias(alias: string, chainId: ChainId): void {
    this.aliases.set(alias.toLowerCase(), chainId)
  }

  /**
   * 解析链标识
   */
  resolveChainId(aliasOrId: string): ChainId | undefined {
    return this.aliases.get(aliasOrId.toLowerCase()) ?? (aliasOrId as ChainId)
  }

  /**
   * 获取所有已注册的链
   */
  getRegisteredChains(): ChainId[] {
    return Array.from(this.adapters.keys())
  }
}

export const adapterRegistry = new AdapterRegistry()
```

---

## 8. 与 TanStack 集成

### 8.1 类型安全的 Query 定义

```typescript
// src/services/integration/queries.ts

import { queryOptions } from '@tanstack/react-query'
import type { ChainId, Address } from '../types/core'
import { adapterRegistry } from '../registry'

/**
 * Query Keys - 类型安全
 */
export const serviceQueryKeys = {
  asset: {
    nativeBalance: (chainId: ChainId, address: Address) =>
      ['service', 'asset', 'native-balance', chainId, address] as const,
    
    tokenBalances: (chainId: ChainId, address: Address) =>
      ['service', 'asset', 'token-balances', chainId, address] as const,
  },
  
  transaction: {
    status: (chainId: ChainId, hash: string) =>
      ['service', 'transaction', 'status', chainId, hash] as const,
    
    history: (chainId: ChainId, address: Address, cursor?: string) =>
      ['service', 'transaction', 'history', chainId, address, cursor] as const,
  },
  
  chain: {
    networkStatus: (chainId: ChainId) =>
      ['service', 'chain', 'network-status', chainId] as const,
  },
}

/**
 * Asset Queries
 */
export const assetQueries = {
  nativeBalance: (chainId: ChainId, address: Address) =>
    queryOptions({
      queryKey: serviceQueryKeys.asset.nativeBalance(chainId, address),
      queryFn: async () => {
        const assetService = adapterRegistry.getServiceOrThrow(chainId, 'asset')
        return assetService.getNativeBalance({ address })
      },
      staleTime: 30_000,
    }),

  tokenBalances: (chainId: ChainId, address: Address) =>
    queryOptions({
      queryKey: serviceQueryKeys.asset.tokenBalances(chainId, address),
      queryFn: async () => {
        const assetService = adapterRegistry.getServiceOrThrow(chainId, 'asset')
        return assetService.getTokenBalances({ address })
      },
      staleTime: 30_000,
    }),
}
```

### 8.2 类型安全的 Hooks

```typescript
// src/services/integration/hooks.ts

import { useMemo } from 'react'
import { useQuery, useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import type { ChainId, Address } from '../types/core'
import type { ServiceKey, ServiceType } from '../adapter/service-keys'
import { adapterRegistry } from '../registry'
import { assetQueries, serviceQueryKeys } from './queries'
import { walletStore } from '@/stores/wallet.store'

/**
 * 获取服务（类型安全）
 * 
 * @returns 服务实例或 null
 */
export function useService<K extends ServiceKey>(
  chainId: ChainId | null,
  serviceKey: K
): ServiceType<K> | null {
  return useMemo(() => {
    if (!chainId) return null
    return adapterRegistry.getService(chainId, serviceKey)
  }, [chainId, serviceKey])
}

/**
 * 检查服务是否可用
 */
export function useServiceAvailable<K extends ServiceKey>(
  chainId: ChainId | null,
  serviceKey: K
): boolean {
  const service = useService(chainId, serviceKey)
  return service !== null
}

/**
 * 检查多个服务是否都可用
 */
export function useServicesAvailable(
  chainId: ChainId | null,
  serviceKeys: readonly ServiceKey[]
): boolean {
  return useMemo(() => {
    if (!chainId) return false
    return serviceKeys.every((key) => adapterRegistry.getService(chainId, key) !== null)
  }, [chainId, serviceKeys])
}

/**
 * 获取原生代币余额
 */
export function useNativeBalance(chainId: ChainId, address: Address) {
  const assetService = useService(chainId, 'asset')
  
  return useQuery({
    ...assetQueries.nativeBalance(chainId, address),
    enabled: assetService !== null,
  })
}

/**
 * 获取代币余额（Suspense）
 */
export function useTokenBalances(chainId: ChainId, address: Address) {
  return useSuspenseQuery(assetQueries.tokenBalances(chainId, address))
}

/**
 * 转账 Mutation
 */
export function useTransfer(chainId: ChainId) {
  const queryClient = useQueryClient()
  const transactionService = useService(chainId, 'transaction')

  return useMutation({
    mutationFn: async (params: {
      from: Address
      to: Address
      value: bigint
    }) => {
      if (!transactionService) {
        throw new Error('Transaction service not available')
      }

      // 构建交易
      const built = await transactionService.buildTransaction({
        request: {
          chainId,
          from: params.from,
          to: params.to,
          value: params.value,
        },
      })

      // 签名
      const signed = await transactionService.signTransaction(
        built.unsigned,
        params.from
      )

      // 广播
      const hash = await transactionService.broadcastTransaction(signed)

      return { hash, signed }
    },
    onSuccess: (_, params) => {
      // 刷新余额
      queryClient.invalidateQueries({
        queryKey: serviceQueryKeys.asset.nativeBalance(chainId, params.from),
      })
    },
  })
}
```

### 8.3 服务门控组件

```typescript
// src/components/common/service-gate.tsx

import type { ReactNode } from 'react'
import { useStore } from '@tanstack/react-store'
import { walletStore } from '@/stores/wallet.store'
import { useServicesAvailable } from '@/services/integration/hooks'
import type { ServiceKey } from '@/services/adapter/service-keys'
import type { ChainId } from '@/services/types/core'

interface ServiceGateProps {
  /** 需要的服务列表 */
  requires: readonly ServiceKey[]
  /** 服务可用时渲染 */
  children: ReactNode
  /** 服务不可用时渲染 */
  fallback?: ReactNode
  /** 指定链 ID，不传则使用当前激活链 */
  chainId?: ChainId
}

/**
 * 服务门控组件
 * 
 * 类型安全：requires 只能传入有效的 ServiceKey
 */
export function ServiceGate({
  requires,
  children,
  fallback = null,
  chainId: propChainId,
}: ServiceGateProps) {
  const activeChain = useStore(walletStore, (s) => s.activeChain)
  const chainId = propChainId ?? activeChain

  const available = useServicesAvailable(chainId, requires)

  if (!available) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// ============================================================
// 使用示例
// ============================================================

// 转账页面 - 需要交易服务
// <ServiceGate 
//   requires={['transaction', 'feeEstimation']}
//   fallback={<UnavailableMessage />}
// >
//   <TransferForm />
// </ServiceGate>

// Swap 页面 - 需要 DeFi 服务
// <ServiceGate requires={['swap', 'defi']}>
//   <SwapPanel />
// </ServiceGate>

// 质押页面 - 需要质押服务
// <ServiceGate requires={['staking']}>
//   <StakingPanel />
// </ServiceGate>
```

---

## 9. 类型安全保证总结

### 9.1 编译时验证

| 场景 | 旧设计（弱类型） | 新设计（强类型） |
|-----|-----------------|-----------------|
| 获取服务 | `service as unknown as IAssetService` | `adapter.asset` |
| 检查能力 | `capabilities.has('asset.native-balance')` | `adapter.asset !== null` |
| 重命名方法 | ❌ 运行时崩溃 | ✅ 编译错误 |
| 删除服务 | ❌ 运行时崩溃 | ✅ 编译错误 |
| IDE 自动补全 | ❌ 无 | ✅ 完整 |
| 重构追踪 | ❌ 手动搜索 | ✅ 自动更新 |

### 9.2 类型流转

```typescript
// 1. 从 Registry 获取 Adapter
const adapter: IChainAdapter | undefined = adapterRegistry.get(chainId)

// 2. 获取特定服务（类型安全）
const assetService: IAssetService | null = adapter?.asset ?? null

// 3. 类型收窄后调用方法
if (assetService) {
  // TypeScript 知道 assetService 是 IAssetService
  const balance = await assetService.getNativeBalance({ address })
  //                                 ^^^^^^^^^^^^^^^^ 方法签名完全已知
}

// 4. Hooks 中同样类型安全
const service = useService(chainId, 'asset')
//    ^^^^^^^ IAssetService | null

const available = useServiceAvailable(chainId, 'swap')
//    ^^^^^^^^^ boolean
```

### 9.3 重构安全性

```typescript
// 假设我们要重命名 IAssetService.getNativeBalance -> getBalance

// ❌ 旧设计：
// 1. 适配器实现方法名不变，运行时崩溃
// 2. 调用处使用字符串，无法追踪

// ✅ 新设计：
// 1. 修改接口定义
interface IAssetService {
  getBalance(query: BalanceQuery): Promise<AssetBalance> // 重命名
}

// 2. 所有实现处立即报错（编译时）
class EvmAssetService implements IAssetService {
  getNativeBalance(...) // ❌ Error: 'getNativeBalance' does not exist in type 'IAssetService'
}

// 3. 所有调用处立即报错（编译时）
const balance = await assetService.getNativeBalance(...)
//                                 ^^^^^^^^^^^^^^^^ ❌ Error: Property 'getNativeBalance' does not exist
```

---

## 10. 文件结构

```
src/services/
├── types/
│   ├── core.ts                  # ChainId, Address, Hex 等
│   ├── asset.ts                 # 资产相关类型
│   ├── transaction.ts           # 交易相关类型
│   ├── fee.ts                   # Fee 相关类型
│   └── index.ts
│
├── events/
│   ├── types.ts                 # Subscribable, Subscription
│   ├── definitions.ts           # 事件类型定义
│   └── index.ts
│
├── modules/                     # Service 模块接口
│   ├── asset.ts                 # IAssetService, IAssetValuationService...
│   ├── transaction.ts           # ITransactionService, IFeeEstimationService...
│   ├── identity.ts              # IIdentityService, ITypedDataSigningService
│   ├── chain.ts                 # IChainService, IBlockSubscription
│   ├── contract.ts              # IContractService (EVM)
│   ├── defi.ts                  # IDeFiService, ISwapService
│   ├── staking.ts               # IStakingService, IDelegationService
│   └── index.ts
│
├── adapter/
│   ├── types.ts                 # IChainAdapter, AdapterMetadata
│   ├── service-keys.ts          # ServiceKey 类型工具
│   ├── base-adapter.ts          # BaseAdapter 基类
│   └── index.ts
│
├── adapters/                    # 具体适配器实现
│   ├── evm/
│   │   ├── evm-adapter.ts
│   │   └── services/
│   │       ├── identity.ts
│   │       ├── asset.ts
│   │       ├── transaction.ts
│   │       ├── chain.ts
│   │       └── contract.ts
│   ├── tron/
│   │   ├── tron-adapter.ts
│   │   └── services/
│   ├── bfmeta/
│   │   └── bfmeta-adapter.ts
│   └── price/
│       └── coingecko-adapter.ts
│
├── integration/                 # TanStack 集成
│   ├── queries.ts               # Query 定义
│   ├── hooks.ts                 # React Hooks
│   └── index.ts
│
├── registry.ts                  # AdapterRegistry
└── index.ts                     # 统一导出
```

---

## 11. 与旧设计的对比

| 方面 | 旧设计 | 新设计 |
|-----|-------|-------|
| 能力声明 | `capabilities.add('string')` | `get service(): T \| null` |
| 能力检测 | `capabilities.has('string')` | `adapter.service !== null` |
| 服务获取 | `service as unknown as T` | `adapter.service` |
| 类型关联 | 字符串映射（运行时） | 接口属性（编译时） |
| 重构安全 | ❌ 需手动搜索 | ✅ 自动追踪 |
| IDE 支持 | ❌ 无自动补全 | ✅ 完整支持 |
| 部分实现 | CapabilitySet 手动维护 | Getter 返回 null |

---

## 12. Platform Services（平台服务层）

### 12.1 概述

Platform Services 是与运行平台相关的服务，提供设备能力抽象，支持 Web 和 DWEB 两种运行环境。

**设计目标：**
- **编译时实现选择**：通过 Vite alias 实现完美 tree-shaking
- **统一 API**：上层代码无需关心运行环境
- **Mock 支持**：开发和测试时可使用 Mock 实现

### 12.2 服务列表

| 服务 | 说明 | Web 实现 | DWEB 实现 |
|-----|------|---------|----------|
| BiometricService | 生物识别认证 | WebAuthn API | @plaoc/plugins biometricsPlugin |
| SecureStorageService | 安全存储 | localStorage + AES | @plaoc/plugins keyValuePlugin |
| ClipboardService | 剪贴板操作 | Clipboard API | @plaoc/plugins clipboardPlugin |
| ToastService | 轻提示 | DOM 注入 | @plaoc/plugins toastPlugin |
| CameraService | 相机/扫码 | MediaDevices API | @plaoc/plugins barcodeScannerPlugin |
| HapticsService | 触觉反馈 | Vibration API | @plaoc/plugins hapticsPlugin |

### 12.3 目标架构（每服务独立文件夹）

```
src/services/
├── biometric/
│   ├── index.ts          # 统一导出 + ServiceProvider
│   ├── types.ts          # 接口定义
│   ├── web.ts            # Web 实现
│   ├── dweb.ts           # DWEB 实现
│   └── mock.ts           # Mock 实现
│
├── storage/
│   ├── index.ts
│   ├── types.ts
│   ├── web.ts
│   ├── dweb.ts
│   └── mock.ts
│
├── clipboard/
│   ├── index.ts
│   ├── types.ts
│   ├── web.ts
│   ├── dweb.ts
│   └── mock.ts
│
├── toast/
│   ├── index.ts
│   ├── types.ts
│   ├── web.ts
│   ├── dweb.ts
│   └── mock.ts
│
├── camera/
│   ├── index.ts
│   ├── types.ts
│   ├── web.ts
│   ├── dweb.ts
│   └── mock.ts
│
├── haptics/
│   ├── index.ts
│   ├── types.ts
│   ├── web.ts
│   ├── dweb.ts
│   └── mock.ts
│
└── index.ts              # 统一导出所有服务
```

### 12.4 接口定义示例

```typescript
// src/services/biometric/types.ts

export interface BiometricOptions {
  reason?: string
  fallbackToPassword?: boolean
}

export interface BiometricResult {
  success: boolean
  error?: string
}

export interface IBiometricService {
  /** 检查是否可用 */
  isAvailable(): Promise<boolean>
  
  /** 执行认证 */
  authenticate(options?: BiometricOptions): Promise<BiometricResult>
}
```

```typescript
// src/services/clipboard/types.ts

export interface IClipboardService {
  /** 写入文本 */
  writeText(text: string): Promise<void>
  
  /** 读取文本 */
  readText(): Promise<string>
}
```

```typescript
// src/services/toast/types.ts

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number
}

export interface IToastService {
  /** 显示 toast */
  show(options: ToastOptions): void
  
  /** 快捷方法 */
  success(message: string): void
  error(message: string): void
  warning(message: string): void
  info(message: string): void
}
```

### 12.5 编译时实现选择

**Vite 配置：**

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      // 根据 SERVICE_IMPL 环境变量选择实现
      '#biometric-impl': `./src/services/biometric/${process.env.SERVICE_IMPL || 'web'}.ts`,
      '#storage-impl': `./src/services/storage/${process.env.SERVICE_IMPL || 'web'}.ts`,
      '#clipboard-impl': `./src/services/clipboard/${process.env.SERVICE_IMPL || 'web'}.ts`,
      '#toast-impl': `./src/services/toast/${process.env.SERVICE_IMPL || 'web'}.ts`,
      '#camera-impl': `./src/services/camera/${process.env.SERVICE_IMPL || 'web'}.ts`,
      '#haptics-impl': `./src/services/haptics/${process.env.SERVICE_IMPL || 'web'}.ts`,
    }
  }
})
```

**服务入口文件：**

```typescript
// src/services/biometric/index.ts
import type { IBiometricService } from './types'
import { BiometricService } from '#biometric-impl'

export type { IBiometricService, BiometricOptions, BiometricResult } from './types'
export { BiometricService }

// 创建单例
export const biometricService: IBiometricService = new BiometricService()
```

**构建脚本：**

```json
{
  "scripts": {
    "dev": "SERVICE_IMPL=web vite",
    "dev:mock": "SERVICE_IMPL=mock vite",
    "build:web": "SERVICE_IMPL=web vite build",
    "build:dweb": "SERVICE_IMPL=dweb vite build"
  }
}
```

### 12.6 React Hooks

```typescript
// src/services/hooks.ts
import { biometricService } from './biometric'
import { clipboardService } from './clipboard'
import { toastService } from './toast'
import { hapticsService } from './haptics'

export function useBiometric() {
  return biometricService
}

export function useClipboard() {
  return clipboardService
}

export function useToast() {
  return toastService
}

export function useHaptics() {
  return hapticsService
}
```

**使用示例：**

```typescript
function WalletAddress({ address }: { address: string }) {
  const clipboard = useClipboard()
  const toast = useToast()
  const haptics = useHaptics()
  
  const handleCopy = async () => {
    await clipboard.writeText(address)
    await haptics.impact('light')
    toast.success('地址已复制')
  }
  
  return (
    <button onClick={handleCopy}>
      {address}
    </button>
  )
}
```

### 12.7 Mock 实现（测试用）

```typescript
// src/services/biometric/mock.ts
import type { IBiometricService, BiometricOptions, BiometricResult } from './types'

// 通过 window 暴露控制接口，供 E2E 测试使用
declare global {
  interface Window {
    __MOCK_BIOMETRIC__?: {
      available: boolean
      shouldSucceed: boolean
    }
  }
}

export class BiometricService implements IBiometricService {
  async isAvailable(): Promise<boolean> {
    return window.__MOCK_BIOMETRIC__?.available ?? true
  }
  
  async authenticate(options?: BiometricOptions): Promise<BiometricResult> {
    const shouldSucceed = window.__MOCK_BIOMETRIC__?.shouldSucceed ?? true
    return {
      success: shouldSucceed,
      error: shouldSucceed ? undefined : 'Mock authentication failed'
    }
  }
}
```

### 12.8 E2E 测试集成

```typescript
// e2e/services.spec.ts
import { test, expect } from '@playwright/test'

test('biometric authentication', async ({ page }) => {
  // 配置 mock
  await page.evaluate(() => {
    window.__MOCK_BIOMETRIC__ = { available: true, shouldSucceed: true }
  })
  
  // 触发认证
  await page.click('[data-testid="biometric-auth-button"]')
  
  // 验证结果
  await expect(page.locator('[data-testid="auth-success"]')).toBeVisible()
})

test('clipboard copy', async ({ page }) => {
  await page.click('[data-testid="copy-address-button"]')
  
  // 验证 toast 提示
  await expect(page.locator('.toast-success')).toContainText('已复制')
  
  // 验证剪贴板内容（通过 mock）
  const clipboardContent = await page.evaluate(() => window.__CLIPBOARD__)
  expect(clipboardContent).toBe('0x...')
})
```

---

*文档版本: 3.0 (强类型安全版 + Platform Services)*
*配套文档: PDR.md (产品需求) / TDD.md (技术设计)*
