# 附录 D：API 参考

本附录提供 BFM Pay 核心 API 的快速参考。

---

## 一、服务接口

### 1.1 IAssetService

资产查询服务接口。

```typescript
interface IAssetService {
  // 获取原生代币余额
  getNativeBalance(params: {
    chainId: ChainId
    address: Address
  }): Promise<AssetBalance>
  
  // 获取代币余额
  getTokenBalance(params: {
    chainId: ChainId
    address: Address
    tokenAddress: Address
  }): Promise<AssetBalance>
  
  // 批量获取余额
  getBalances(params: {
    chainId: ChainId
    address: Address
    tokens?: Address[]
  }): Promise<AssetBalance[]>
  
  // 获取 NFT 列表
  getNFTs?(params: {
    chainId: ChainId
    address: Address
  }): Promise<NFTAsset[]>
  
  // 余额变动订阅
  subscribeBalance?(params: {
    chainId: ChainId
    address: Address
  }): Subscribable<AssetBalance>
}
```

### 1.2 ITransactionService

交易服务接口。

```typescript
interface ITransactionService {
  // 估算交易费用
  estimateFee(params: {
    chainId: ChainId
    from: Address
    to: Address
    value: bigint
    data?: Hex
  }): Promise<FeeEstimate>
  
  // 发送已签名交易
  sendTransaction(params: {
    chainId: ChainId
    signedTx: Hex
  }): Promise<TransactionHash>
  
  // 获取交易状态
  getTransactionStatus(params: {
    chainId: ChainId
    hash: TransactionHash
  }): Promise<TransactionStatus>
  
  // 获取交易历史
  getTransactionHistory(params: {
    chainId: ChainId
    address: Address
    page?: number
    limit?: number
  }): Promise<TransactionRecord[]>
  
  // 交易状态订阅
  subscribeTransaction?(params: {
    chainId: ChainId
    hash: TransactionHash
  }): Subscribable<TransactionStatus>
}
```

### 1.3 IIdentityService

身份与签名服务接口。

```typescript
interface IIdentityService {
  // 派生地址
  deriveAddress(params: {
    chainId: ChainId
    publicKey: Uint8Array
    index?: number
  }): Promise<Address>
  
  // 签名消息
  signMessage(params: {
    chainId: ChainId
    message: string | Uint8Array
    privateKey: Uint8Array
  }): Promise<Hex>
  
  // 签名交易
  signTransaction(params: {
    chainId: ChainId
    transaction: TransactionRequest
    privateKey: Uint8Array
  }): Promise<SignedTransaction>
  
  // 验证签名
  verifySignature?(params: {
    chainId: ChainId
    message: string | Uint8Array
    signature: Hex
    address: Address
  }): Promise<boolean>
}
```

### 1.4 IStakingService

质押服务接口 (可选)。

```typescript
interface IStakingService {
  // 获取质押信息
  getStakingInfo(params: {
    chainId: ChainId
    address: Address
  }): Promise<StakingInfo>
  
  // 质押
  stake(params: {
    chainId: ChainId
    amount: bigint
    validator?: Address
  }): Promise<TransactionRequest>
  
  // 解除质押
  unstake(params: {
    chainId: ChainId
    amount: bigint
  }): Promise<TransactionRequest>
  
  // 领取奖励
  claimRewards(params: {
    chainId: ChainId
  }): Promise<TransactionRequest>
}
```

---

## 二、Store API

### 2.1 walletStore

钱包状态管理。

```typescript
// 类型定义
interface WalletState {
  wallets: Wallet[]
  activeWalletId: string | null
}

interface Wallet {
  id: string
  name: string
  type: 'mnemonic' | 'privateKey' | 'watch'
  encryptedSecret?: string
  accounts: Account[]
  createdAt: number
}

// 使用方式
import { walletStore } from '@/stores/wallet'

// 读取状态
const wallets = useStore(walletStore, s => s.wallets)
const activeWallet = useStore(walletStore, s => 
  s.wallets.find(w => w.id === s.activeWalletId)
)

// 更新状态
walletStore.setState(state => ({
  activeWalletId: walletId
}))
```

### 2.2 settingsStore

应用设置状态。

```typescript
interface SettingsState {
  language: string
  currency: string
  theme: 'light' | 'dark' | 'system'
  autoLockTimeout: number  // 分钟
  biometricEnabled: boolean
}

// 使用方式
import { settingsStore } from '@/stores/settings'

const language = useStore(settingsStore, s => s.language)

settingsStore.setState({ language: 'zh-CN' })
```

### 2.3 chainConfigStore

链配置状态。

```typescript
interface ChainConfigState {
  chains: ChainConfig[]
  subscriptionUrl: string | null
  lastSync: number | null
}

// 使用方式
import { chainConfigStore } from '@/stores/chain-config'

const enabledChains = useStore(chainConfigStore, s => 
  s.chains.filter(c => c.enabled)
)
```

---

## 三、Hook API

### 3.1 导航 Hooks

```typescript
// 获取导航控制器
import { useNavigation } from '@/stackflow/hooks'

const { push, pop, replace } = useNavigation()

// 页面跳转
push('WalletDetailActivity', { walletId: '123' })
pop()
replace('HomeActivity', {})

// 获取路由参数
import { useActivityParams } from '@stackflow/react'

const { walletId } = useActivityParams<{ walletId: string }>()
```

### 3.2 服务 Hooks

```typescript
// 资产服务
import { useAssetService } from '@/hooks/use-services'

const assetService = useAssetService(chainId)
const { data } = useQuery({
  queryKey: ['balance', chainId, address],
  queryFn: () => assetService?.getNativeBalance({ chainId, address })
})

// 交易服务
import { useTransactionService } from '@/hooks/use-services'

const txService = useTransactionService(chainId)
```

### 3.3 表单 Hooks

```typescript
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'

const form = useForm({
  defaultValues: { amount: '', recipient: '' },
  validatorAdapter: zodValidator(),
  onSubmit: async ({ value }) => {
    await sendTransaction(value)
  }
})
```

---

## 四、组件 API

### 4.1 WalletCard

钱包卡片组件。

```tsx
interface WalletCardProps {
  wallet: Wallet
  balance?: AssetBalance
  onPress?: () => void
  selected?: boolean
}

<WalletCard
  wallet={wallet}
  balance={balance}
  onPress={() => push('WalletDetail', { id: wallet.id })}
  selected={wallet.id === activeId}
/>
```

### 4.2 TokenListItem

代币列表项组件。

```tsx
interface TokenListItemProps {
  token: TokenMetadata
  balance: AssetBalance
  valuation?: AssetValuation
  onPress?: () => void
}

<TokenListItem
  token={token}
  balance={balance}
  valuation={valuation}
  onPress={() => push('TokenDetail', { tokenAddress })}
/>
```

### 4.3 TransactionItem

交易记录项组件。

```tsx
interface TransactionItemProps {
  transaction: TransactionRecord
  onPress?: () => void
}

<TransactionItem
  transaction={tx}
  onPress={() => openExplorer(tx.hash)}
/>
```

### 4.4 AmountInput

金额输入组件。

```tsx
interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  token: TokenMetadata
  maxAmount?: bigint
  showMax?: boolean
  error?: string
}

<AmountInput
  value={amount}
  onChange={setAmount}
  token={selectedToken}
  maxAmount={balance}
  showMax
  error={form.errors.amount}
/>
```

---

## 五、工具函数

### 5.1 格式化

```typescript
// 格式化余额
formatBalance(balance: bigint, decimals: number): string
formatBalance(1000000000000000000n, 18) // "1.0"

// 格式化货币
formatCurrency(value: number, currency: string): string
formatCurrency(1234.56, 'USD') // "$1,234.56"

// 格式化地址
formatAddress(address: string, chars?: number): string
formatAddress('0x1234...5678', 6) // "0x1234...5678"

// 格式化哈希
formatHash(hash: string, chars?: number): string
formatHash('0xabcd...ef12', 8) // "0xabcdef...12345678"
```

### 5.2 验证

```typescript
// 验证地址
isValidAddress(address: string, chainType: ChainType): boolean

// 验证金额
isValidAmount(amount: string, decimals: number): boolean

// 验证助记词
isValidMnemonic(mnemonic: string): boolean
```

### 5.3 加密

```typescript
// 加密数据
encryptData(data: string, password: string): Promise<string>

// 解密数据
decryptData(encrypted: string, password: string): Promise<string>

// 派生密钥
deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey>
```

---

## 六、常量

### 6.1 错误码

```typescript
enum ErrorCode {
  // 通用错误
  UNKNOWN = 'UNKNOWN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // 钱包错误
  INVALID_MNEMONIC = 'INVALID_MNEMONIC',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  
  // 交易错误
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  TX_FAILED = 'TX_FAILED',
  
  // 链错误
  CHAIN_NOT_SUPPORTED = 'CHAIN_NOT_SUPPORTED',
  RPC_ERROR = 'RPC_ERROR'
}
```

### 6.2 事件类型

```typescript
enum EventType {
  // 钱包事件
  WALLET_CREATED = 'wallet:created',
  WALLET_DELETED = 'wallet:deleted',
  WALLET_SWITCHED = 'wallet:switched',
  
  // 交易事件
  TX_SENT = 'tx:sent',
  TX_CONFIRMED = 'tx:confirmed',
  TX_FAILED = 'tx:failed',
  
  // 余额事件
  BALANCE_UPDATED = 'balance:updated'
}
```

### 6.3 默认配置

```typescript
const DEFAULT_CONFIG = {
  autoLockTimeout: 5,           // 5 分钟
  defaultCurrency: 'USD',
  defaultLanguage: 'en',
  maxGasMultiplier: 1.2,        // Gas 上限倍数
  txConfirmations: 12,          // 确认区块数
  rpcTimeout: 30000,            // RPC 超时 (ms)
  maxRetries: 3                 // 最大重试次数
}
```

---

## 七、类型导出

所有类型定义从 `@/types` 统一导出：

```typescript
// 核心类型
export type { ChainId, Address, TransactionHash, Hex } from './core'

// 资产类型
export type { TokenMetadata, AssetBalance, AssetValuation, NFTAsset } from './asset'

// 交易类型
export type { TransactionRequest, TransactionRecord, TransactionStatus } from './transaction'

// 服务接口
export type { IAssetService, ITransactionService, IIdentityService } from './services'

// Store 类型
export type { WalletState, SettingsState, ChainConfigState } from './stores'
```
