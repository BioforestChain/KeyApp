# 第十二章：链服务接口

> 定义与区块链交互的标准接口规范

---

## 12.1 接口总览

### 服务分类

| 服务 | 职责 | 必需性 |
|-----|------|-------|
| IIdentityService | 地址派生、消息签名 | MUST |
| IAssetService | 资产余额查询 | MUST |
| ITransactionService | 交易构建、签名、广播 | MUST |
| IChainService | 链信息查询 | MUST |
| IStakingService | 质押操作 | MAY |
| INFTService | NFT 资产查询 | MAY |

### 接口设计原则

1. **异步优先**：所有涉及网络/计算的方法 **MUST** 返回 Promise
2. **错误明确**：失败时 **MUST** 抛出带有错误码的异常
3. **可取消**：长时间操作 **SHOULD** 支持 AbortSignal
4. **类型安全**：参数和返回值 **MUST** 有明确类型定义

---

## 12.2 IIdentityService (身份服务)

### 职责

管理用户身份，包括地址派生和消息签名。

### 接口定义

```
IIdentityService {
  // 从种子派生地址
  deriveAddress(seed: bytes, index?: number): Address
  
  // 批量派生地址
  deriveAddresses(seed: bytes, startIndex: number, count: number): Address[]
  
  // 验证地址格式
  isValidAddress(address: string): boolean
  
  // 规范化地址（如 EVM 的 checksum）
  normalizeAddress(address: string): Address
  
  // 签名消息
  signMessage(message: string | bytes, privateKey: bytes): Signature
  
  // 验证消息签名
  verifyMessage(message: string | bytes, signature: Signature, address: Address): boolean
}
```

### 派生路径规范

| 链类型 | 派生路径 | 说明 |
|-------|---------|------|
| EVM 兼容 | m/44'/60'/0'/0/{index} | BIP44 标准 |
| Bitcoin | m/44'/0'/0'/0/{index} | BIP44 标准 |
| BFM 链 | m/44'/9999'/0'/0/{index} | 自定义 coin type |

### 错误码

| 错误码 | 说明 |
|-------|------|
| INVALID_SEED | 种子格式无效 |
| INVALID_ADDRESS | 地址格式无效 |
| SIGNATURE_FAILED | 签名失败 |
| VERIFICATION_FAILED | 签名验证失败 |

---

## 12.3 IAssetService (资产服务)

### 职责

查询用户资产余额和代币信息。

### 接口定义

```
IAssetService {
  // 获取原生代币余额
  getNativeBalance(address: Address): Balance
  
  // 获取代币余额
  getTokenBalance(address: Address, tokenAddress: Address): Balance
  
  // 获取所有代币余额
  getTokenBalances(address: Address): Balance[]
  
  // 获取代币元数据
  getTokenMetadata(tokenAddress: Address): TokenMetadata
  
  // 订阅余额变化
  subscribeBalance(address: Address, callback: (balance: Balance) => void): Unsubscribe
}
```

### 数据结构

```
Balance {
  raw: bigint           // 原始值（最小单位）
  formatted: string     // 格式化值（人类可读）
  symbol: string        // 代币符号
  decimals: number      // 小数位数
}

TokenMetadata {
  address: Address
  name: string
  symbol: string
  decimals: number
  logoUri?: string
  standard: 'native' | 'ERC20' | 'TRC20' | 'BFM-TOKEN'
}
```

### 错误码

| 错误码 | 说明 |
|-------|------|
| ADDRESS_NOT_FOUND | 地址不存在 |
| TOKEN_NOT_FOUND | 代币不存在 |
| NETWORK_ERROR | 网络请求失败 |

---

## 12.4 ITransactionService (交易服务)

### 职责

构建、签名、广播交易，查询交易状态。

### 接口定义

```
ITransactionService {
  // 估算交易费用
  estimateFee(params: TransferParams): FeeEstimate
  
  // 构建未签名交易
  buildTransaction(params: TransferParams): UnsignedTransaction
  
  // 签名交易
  signTransaction(unsignedTx: UnsignedTransaction, privateKey: bytes): SignedTransaction
  
  // 广播交易
  broadcastTransaction(signedTx: SignedTransaction): TransactionHash
  
  // 查询交易状态
  getTransactionStatus(hash: TransactionHash): TransactionStatus
  
  // 查询交易详情
  getTransaction(hash: TransactionHash): Transaction
  
  // 查询交易历史
  getTransactionHistory(address: Address, options?: PaginationOptions): Transaction[]
  
  // 订阅交易状态
  subscribeTransaction(hash: TransactionHash, callback: (status: TransactionStatus) => void): Unsubscribe
}
```

### 数据结构

```
TransferParams {
  from: Address
  to: Address
  amount: bigint
  tokenAddress?: Address    // 原生代币时为空
  memo?: string
  gasLimit?: bigint
  gasPrice?: bigint
}

FeeEstimate {
  slow: Fee                 // 慢速（低费用）
  standard: Fee             // 标准
  fast: Fee                 // 快速（高费用）
}

Fee {
  amount: bigint
  formatted: string
  estimatedTime: number     // 预估确认时间（秒）
}

TransactionStatus {
  status: 'pending' | 'confirming' | 'confirmed' | 'failed'
  confirmations: number
  requiredConfirmations: number
}

Transaction {
  hash: TransactionHash
  from: Address
  to: Address
  amount: bigint
  fee: bigint
  status: TransactionStatus
  timestamp: number
  blockNumber?: bigint
  memo?: string
}
```

### 交易流程状态机

```
          buildTransaction
                │
                ▼
        ┌───────────────┐
        │   Unsigned    │
        └───────┬───────┘
                │ signTransaction
                ▼
        ┌───────────────┐
        │    Signed     │
        └───────┬───────┘
                │ broadcastTransaction
                ▼
        ┌───────────────┐
        │    Pending    │
        └───────┬───────┘
                │
        ┌───────┴───────┐
        ▼               ▼
   ┌─────────┐    ┌─────────┐
   │Confirming│   │  Failed │
   └────┬────┘    └─────────┘
        │
        ▼
   ┌─────────┐
   │Confirmed│
   └─────────┘
```

### 错误码

| 错误码 | 说明 |
|-------|------|
| INSUFFICIENT_BALANCE | 余额不足 |
| INSUFFICIENT_FEE | 手续费不足 |
| INVALID_RECIPIENT | 收款地址无效 |
| NONCE_TOO_LOW | Nonce 过低（交易已存在） |
| TRANSACTION_REJECTED | 交易被拒绝 |
| TRANSACTION_TIMEOUT | 交易超时 |

---

## 12.5 IChainService (链信息服务)

### 职责

查询链的基本信息和状态。

### 接口定义

```
IChainService {
  // 获取链信息
  getChainInfo(): ChainInfo
  
  // 获取当前区块高度
  getBlockHeight(): bigint
  
  // 获取 Gas 价格
  getGasPrice(): GasPrice
  
  // 检查节点健康状态
  healthCheck(): HealthStatus
}
```

### 数据结构

```
ChainInfo {
  chainId: string
  name: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  blockTime: number         // 平均出块时间（秒）
  confirmations: number     // 建议确认数
}

GasPrice {
  slow: bigint
  standard: bigint
  fast: bigint
  baseFee?: bigint          // EIP-1559 链
}

HealthStatus {
  isHealthy: boolean
  latency: number           // 响应延迟（ms）
  blockHeight: bigint
  lastUpdated: number
}
```

---

## 12.6 IStakingService (质押服务) [可选]

### 职责

管理代币质押操作。

### 接口定义

```
IStakingService {
  // 获取质押信息
  getStakingInfo(address: Address): StakingInfo
  
  // 获取可用验证者
  getValidators(): Validator[]
  
  // 质押
  stake(params: StakeParams): UnsignedTransaction
  
  // 解除质押
  unstake(params: UnstakeParams): UnsignedTransaction
  
  // 领取奖励
  claimRewards(address: Address): UnsignedTransaction
  
  // 重新委托
  redelegate(params: RedelegateParams): UnsignedTransaction
}
```

### 数据结构

```
StakingInfo {
  stakedAmount: bigint
  rewards: bigint
  unbonding: UnbondingEntry[]
  delegations: Delegation[]
}

Validator {
  address: Address
  name: string
  commission: number        // 0-1
  votingPower: bigint
  status: 'active' | 'inactive' | 'jailed'
}

Delegation {
  validator: Address
  amount: bigint
  rewards: bigint
}

UnbondingEntry {
  amount: bigint
  completionTime: number
}
```

---

## 12.7 事件订阅规范

### 订阅模式

所有 `subscribe*` 方法 **MUST** 遵循以下规范：

1. 返回 `Unsubscribe` 函数用于取消订阅
2. 立即调用一次 callback 返回当前状态
3. 状态变化时调用 callback
4. 网络错误时通过 callback 第二个参数传递错误

```
type Unsubscribe = () => void

type SubscribeCallback<T> = (data: T, error?: Error) => void
```

### 重连策略

| 场景 | 策略 |
|-----|------|
| 网络断开 | 指数退避重连（1s, 2s, 4s, 8s, max 30s） |
| 服务端错误 | 延迟 5s 后重试 |
| 认证失败 | 不重试，通知上层 |

---

## 12.8 错误处理规范

### 错误结构

```
ChainServiceError {
  code: string              // 机器可读错误码
  message: string           // 人类可读错误信息
  details?: object          // 额外错误详情
  cause?: Error             // 原始错误
}
```

### 错误分类

| 类别 | 前缀 | 处理策略 |
|-----|------|---------|
| 网络错误 | NETWORK_ | 可重试 |
| 验证错误 | VALIDATION_ | 不可重试，需用户修改输入 |
| 业务错误 | BUSINESS_ | 根据具体情况 |
| 系统错误 | SYSTEM_ | 记录日志，提示用户联系支持 |

---

## 本章小结

- 定义了 6 个核心服务接口
- IIdentityService、IAssetService、ITransactionService、IChainService 为必需
- IStakingService、INFTService 为可选扩展
- 所有接口异步、类型安全、错误码明确
- 订阅接口遵循统一的取消和重连规范

---

## 下一章

继续阅读 [第十三章：平台服务](../03-平台服务/)。
