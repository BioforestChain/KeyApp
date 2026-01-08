# Chain Adapter 架构

> Source: [src/services/chain-adapter/](https://github.com/BioforestChain/KeyApp/tree/main/src/services/chain-adapter)

## 概览

Chain Adapter 是多链钱包的核心抽象层，为不同区块链提供统一的操作接口。

---

## 目录结构

```
chain-adapter/
├── types.ts                    # 核心类型定义
├── registry.ts                 # 适配器注册表
├── derive-wallet-chain-addresses.ts  # 地址派生
├── index.ts                    # 导出
├── bioforest/                  # BioForest 链实现
├── bitcoin/                    # Bitcoin 实现
├── evm/                        # EVM 链实现
├── tron/                       # Tron 实现
├── providers/                  # API Provider 实现
└── __tests__/                  # 测试
```

---

## 核心接口

### IChainAdapter (主接口)

```typescript
interface IChainAdapter {
  readonly chainId: string
  readonly chainType: ChainKind  // 'bioforest' | 'evm' | 'bitcoin' | 'tron'
  
  // 子服务
  readonly identity: IIdentityService
  readonly asset: IAssetService
  readonly transaction: ITransactionService
  readonly chain: IChainService
  readonly staking: IStakingService | null
  
  initialize(): Promise<void>
  dispose(): void
}
```

### IIdentityService (身份服务)

```typescript
interface IIdentityService {
  // 地址派生
  deriveAddress(seed: Uint8Array, index?: number): Promise<Address>
  deriveAddresses(seed: Uint8Array, startIndex: number, count: number): Promise<Address[]>
  
  // 地址验证
  isValidAddress(address: string): boolean
  normalizeAddress(address: string): Address
  
  // 签名
  signMessage(message: string | Uint8Array, privateKey: Uint8Array): Promise<Signature>
  verifyMessage(message: string | Uint8Array, signature: Signature, address: Address): Promise<boolean>
}
```

### IAssetService (资产服务)

```typescript
interface IAssetService {
  getNativeBalance(address: Address): Promise<Balance>
  getTokenBalance(address: Address, tokenAddress: Address): Promise<Balance>
  getTokenBalances(address: Address): Promise<Balance[]>
  getTokenMetadata(tokenAddress: Address): Promise<TokenMetadata>
}
```

### ITransactionService (交易服务)

```typescript
interface ITransactionService {
  // 手续费估算
  estimateFee(params: TransferParams): Promise<FeeEstimate>
  
  // 交易构建
  buildTransaction(params: TransferParams): Promise<UnsignedTransaction>
  signTransaction(unsignedTx: UnsignedTransaction, privateKey: Uint8Array): Promise<SignedTransaction>
  broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash>
  
  // 交易查询
  getTransactionStatus(hash: TransactionHash): Promise<TransactionStatus>
  getTransaction(hash: TransactionHash): Promise<Transaction | null>
  getTransactionHistory(address: Address, limit?: number): Promise<Transaction[]>
}
```

### IChainService (链服务)

```typescript
interface IChainService {
  getChainInfo(): ChainInfo
  getBlockHeight(): Promise<bigint>
  getGasPrice(): Promise<GasPrice>
  healthCheck(): Promise<HealthStatus>
}
```

---

## 类型定义

### 交易相关

```typescript
interface TransferParams {
  from: Address
  to: Address
  amount: Amount
  tokenAddress?: Address  // undefined = 原生代币
  memo?: string
}

interface Transaction {
  hash: TransactionHash
  from: Address
  to: Address
  amount: Amount
  fee: Amount
  status: TransactionStatus
  timestamp: number
  blockNumber?: bigint
  memo?: string
  type: TransactionType
  rawType?: string  // 链原生类型 (如 'BSE-01')
}

type TransactionType = 'transfer' | 'token-transfer' | 'contract-call' | 'stake' | 'unstake'
type TransactionStatusType = 'pending' | 'confirming' | 'confirmed' | 'failed'
```

### 手续费相关

```typescript
interface FeeEstimate {
  slow: Fee
  standard: Fee
  fast: Fee
}

interface Fee {
  amount: Amount
  estimatedTime: number  // 预计确认时间 (秒)
}

interface GasPrice {
  slow: Amount
  standard: Amount
  fast: Amount
  baseFee?: Amount  // EIP-1559
  lastUpdated: number
}
```

---

## 适配器注册表

```typescript
interface IAdapterRegistry {
  register(type: ChainKind, factory: AdapterFactory): void
  registerChain(chainId: string, type: ChainKind): void
  getAdapter(chainId: string): IChainAdapter | null
  hasAdapter(chainId: string): boolean
  listAdapters(): string[]
  disposeAll(): void
}

// 使用示例
registry.register('evm', (chainId) => new EvmAdapter(chainId));
registry.registerChain('ethereum', 'evm');
registry.registerChain('bsc', 'evm');
registry.registerChain('polygon', 'evm');

const adapter = registry.getAdapter('ethereum');
```

---

## 错误处理

```typescript
class ChainServiceError extends Error {
  code: string
  details?: Record<string, unknown>
}

const ChainErrorCodes = {
  // 通用错误
  CHAIN_NOT_SUPPORTED: 'CHAIN_NOT_SUPPORTED',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_FEE: 'INSUFFICIENT_FEE',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  TRANSACTION_REJECTED: 'TRANSACTION_REJECTED',
  TRANSACTION_TIMEOUT: 'TRANSACTION_TIMEOUT',
  TX_BUILD_FAILED: 'TX_BUILD_FAILED',
  TX_BROADCAST_FAILED: 'TX_BROADCAST_FAILED',
  SIGNATURE_FAILED: 'SIGNATURE_FAILED',
  
  // BioForest 特有
  ADDRESS_FROZEN: 'ADDRESS_FROZEN',
  PAYSECRET_REQUIRED: 'PAYSECRET_REQUIRED',
  
  // Tron 特有
  ADDRESS_NOT_ACTIVATED: 'ADDRESS_NOT_ACTIVATED',
  ENERGY_INSUFFICIENT: 'ENERGY_INSUFFICIENT',
  
  // EVM 特有
  NONCE_TOO_LOW: 'NONCE_TOO_LOW',
  GAS_TOO_LOW: 'GAS_TOO_LOW',
  
  // Bitcoin 特有
  UTXO_INSUFFICIENT: 'UTXO_INSUFFICIENT',
}
```

---

## 链实现对比

| 特性 | EVM | Bitcoin | Tron | BioForest |
|------|-----|---------|------|-----------|
| 账户模型 | Account | UTXO | Account | Account |
| 地址格式 | 0x... | 1.../3.../bc1... | T... | BFM... |
| Gas 模型 | Gas * GasPrice | Fee Rate | Energy + Bandwidth | Fixed Fee |
| Token 标准 | ERC-20 | - | TRC-20 | AST |
| 签名算法 | ECDSA secp256k1 | ECDSA secp256k1 | ECDSA secp256k1 | Ed25519 |

---

## 使用流程

```
┌─────────────────┐
│  用户发起转账   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ registry.get()  │  获取适配器
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  estimateFee()  │  估算手续费
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│buildTransaction()│ 构建交易
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│signTransaction() │ 签名交易
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│broadcastTransaction()│ 广播交易
└────────┬────────────┘
         │
         ▼
┌─────────────────┐
│getTransactionStatus()│ 查询状态
└─────────────────┘
```

---

## 相关文档

- [EVM Adapter](./02-EVM.md)
- [Bitcoin Adapter](./03-Bitcoin.md)
- [Tron Adapter](./04-Tron.md)
- [BioForest Adapter](./05-BioForest.md)
- [API Providers](./06-Providers.md)
