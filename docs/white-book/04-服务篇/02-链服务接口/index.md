# 第十二章：链服务接口

> 定义与区块链交互的标准接口

---

## 12.1 接口概览

| 服务 | 职责 | 必需性 |
|-----|------|-------|
| IIdentityService | 地址派生、签名 | 核心 |
| IAssetService | 资产查询 | 核心 |
| ITransactionService | 交易构建与广播 | 核心 |
| IChainService | 链信息查询 | 核心 |
| IStakingService | 质押操作 | 可选 |
| INFTService | NFT 查询 | 可选 |
| IDeFiService | DeFi 操作 | 可选 |

---

## 12.2 IIdentityService (身份服务)

### 接口定义

```typescript
// src/services/modules/identity.ts

interface DeriveAddressParams {
  seed: Uint8Array        // 助记词种子
  path?: string           // 派生路径
  index?: number          // 地址索引
}

interface DerivedAddress {
  address: Address
  publicKey: Hex
  path: string
}

interface SignMessageParams {
  message: string | Uint8Array
  signer: Address
}

export interface IIdentityService {
  // 派生地址
  deriveAddress(params: DeriveAddressParams): Promise<DerivedAddress>
  
  // 批量派生
  deriveAddresses(params: DeriveAddressParams, count: number): Promise<DerivedAddress[]>
  
  // 验证地址格式
  isValidAddress(address: string): boolean
  
  // 规范化地址
  normalizeAddress(address: string): Address
  
  // 签名消息
  signMessage(params: SignMessageParams): Promise<Hex>
  
  // 验证签名
  verifyMessage(params: SignMessageParams & { signature: Hex }): Promise<boolean>
}
```

### 实现示例 (EVM)

```typescript
// src/services/adapters/evm/services/identity.ts
import { mnemonicToAccount } from 'viem/accounts'
import { isAddress, getAddress } from 'viem'

export class EvmIdentityService implements IIdentityService {
  async deriveAddress({ seed, path, index = 0 }: DeriveAddressParams) {
    const derivationPath = path ?? `m/44'/60'/0'/0/${index}`
    const account = mnemonicToAccount(seed, { path: derivationPath })
    
    return {
      address: Address(account.address),
      publicKey: account.publicKey,
      path: derivationPath,
    }
  }
  
  async deriveAddresses(params: DeriveAddressParams, count: number) {
    const addresses: DerivedAddress[] = []
    for (let i = 0; i < count; i++) {
      addresses.push(await this.deriveAddress({ ...params, index: i }))
    }
    return addresses
  }
  
  isValidAddress(address: string): boolean {
    return isAddress(address)
  }
  
  normalizeAddress(address: string): Address {
    return Address(getAddress(address))  // checksum 格式
  }
  
  async signMessage({ message, signer }: SignMessageParams) {
    // 实现签名逻辑
  }
  
  async verifyMessage(params: SignMessageParams & { signature: Hex }) {
    // 实现验证逻辑
  }
}
```

---

## 12.3 IAssetService (资产服务)

### 接口定义

```typescript
// src/services/modules/asset.ts

interface BalanceQuery {
  address: Address
}

interface TokenBalanceQuery extends BalanceQuery {
  tokenAddresses?: Address[]  // 不传则返回所有持有代币
}

interface AssetBalance {
  token: TokenMetadata
  balance: bigint
  formatted: string
}

interface TokenMetadata {
  chainId: ChainId
  address: Address | null  // null = 原生代币
  name: string
  symbol: string
  decimals: number
  logoUri?: string
}

export interface IAssetService {
  // 获取原生代币余额
  getNativeBalance(query: BalanceQuery): Promise<AssetBalance>
  
  // 获取代币余额列表
  getTokenBalances(query: TokenBalanceQuery): Promise<AssetBalance[]>
  
  // 获取代币元数据
  getTokenMetadata(tokenAddress: Address): Promise<TokenMetadata>
  
  // 搜索代币
  searchTokens(query: string, limit?: number): Promise<TokenMetadata[]>
}
```

### 实现示例 (EVM)

```typescript
// src/services/adapters/evm/services/asset.ts
import { formatUnits } from 'viem'

export class EvmAssetService implements IAssetService {
  constructor(private client: PublicClient, private chainId: ChainId) {}
  
  async getNativeBalance({ address }: BalanceQuery): Promise<AssetBalance> {
    const balance = await this.client.getBalance({ address })
    
    return {
      token: {
        chainId: this.chainId,
        address: null,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      balance,
      formatted: formatUnits(balance, 18),
    }
  }
  
  async getTokenBalances({ address, tokenAddresses }: TokenBalanceQuery) {
    // 使用 multicall 批量查询 ERC20 余额
    const balances = await this.client.multicall({
      contracts: tokenAddresses.map(token => ({
        address: token,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      })),
    })
    
    // 组装返回结果
    return balances.map((result, index) => ({
      token: /* 代币元数据 */,
      balance: result.result as bigint,
      formatted: formatUnits(result.result as bigint, decimals),
    }))
  }
  
  async getTokenMetadata(tokenAddress: Address): Promise<TokenMetadata> {
    const [name, symbol, decimals] = await this.client.multicall({
      contracts: [
        { address: tokenAddress, abi: erc20Abi, functionName: 'name' },
        { address: tokenAddress, abi: erc20Abi, functionName: 'symbol' },
        { address: tokenAddress, abi: erc20Abi, functionName: 'decimals' },
      ],
    })
    
    return {
      chainId: this.chainId,
      address: tokenAddress,
      name: name.result as string,
      symbol: symbol.result as string,
      decimals: decimals.result as number,
    }
  }
  
  async searchTokens(query: string, limit = 10) {
    // 从代币列表中搜索
  }
}
```

---

## 12.4 ITransactionService (交易服务)

### 接口定义

```typescript
// src/services/modules/transaction.ts

interface TransactionRequest {
  chainId: ChainId
  from: Address
  to: Address | null
  value: bigint
  data?: Hex
}

interface BuiltTransaction {
  unsigned: Hex
  estimatedFee: FeeModel
}

interface SignedTransaction {
  chainId: ChainId
  raw: Hex
  hash: TransactionHash
}

interface TransactionReceipt {
  chainId: ChainId
  hash: TransactionHash
  status: 'success' | 'failed'
  blockNumber: bigint
  gasUsed: bigint
}

export interface ITransactionService {
  // 构建交易
  buildTransaction(params: {
    request: TransactionRequest
    fee?: FeeModel
  }): Promise<BuiltTransaction>
  
  // 签名交易
  signTransaction(unsigned: Hex, signer: Address): Promise<SignedTransaction>
  
  // 广播交易
  broadcastTransaction(signed: SignedTransaction): Promise<TransactionHash>
  
  // 获取交易状态
  getTransactionStatus(hash: TransactionHash): Promise<TransactionStatus>
  
  // 获取交易回执
  getTransactionReceipt(hash: TransactionHash): Promise<TransactionReceipt | null>
  
  // 等待交易确认
  waitForTransaction(hash: TransactionHash, confirmations?: number): Promise<TransactionReceipt>
}
```

### Fee 模型

```typescript
// src/services/types/fee.ts

// EIP-1559 费用
interface EIP1559Fee {
  type: 'eip1559'
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  gasLimit: bigint
}

// Legacy 费用
interface LegacyFee {
  type: 'legacy'
  gasPrice: bigint
  gasLimit: bigint
}

// Tron 资源费用
interface TronResourceFee {
  type: 'tron-resource'
  bandwidth: number
  energy: number
  trxBurn: bigint
}

// 固定费用
interface FixedFee {
  type: 'fixed'
  amount: bigint
}

type FeeModel = EIP1559Fee | LegacyFee | TronResourceFee | FixedFee
```

---

## 12.5 IStakingService (质押服务)

### 接口定义

```typescript
// src/services/modules/staking.ts

interface StakingInfo {
  stakedAmount: bigint
  pendingRewards: bigint
  unbondingAmount: bigint
  unbondingEndTime?: number
}

export interface IStakingService {
  // 获取质押信息
  getStakingInfo(address: Address): Promise<StakingInfo>
  
  // 获取最小质押额
  getMinimumStake(): Promise<bigint>
  
  // 获取解锁期
  getUnbondingPeriod(): Promise<number>
  
  // 质押
  stake(amount: bigint, from: Address): Promise<TransactionHash>
  
  // 解除质押
  unstake(amount: bigint, from: Address): Promise<TransactionHash>
  
  // 领取奖励
  claimRewards(from: Address): Promise<TransactionHash>
}
```

---

## 12.6 各链服务支持矩阵

| 服务 | Ethereum | Tron | BFMeta | Bitcoin |
|-----|----------|------|--------|---------|
| identity | ✅ | ✅ | ✅ | ✅ |
| asset | ✅ | ✅ | ✅ | ✅ |
| transaction | ✅ | ✅ | ✅ | ✅ |
| chain | ✅ | ✅ | ✅ | ✅ |
| staking | ❌ | ✅ | ✅ | ❌ |
| nft | ✅ | ✅ | ❌ | ❌ |
| defi | ✅ | ✅ | ❌ | ❌ |

---

## 12.7 与 TanStack Query 集成

### Query 定义

```typescript
// src/features/wallet/queries.ts
import { queryOptions } from '@tanstack/react-query'
import { adapterRegistry } from '@/services/registry'

export const assetQueries = {
  nativeBalance: (chainId: ChainId, address: Address) =>
    queryOptions({
      queryKey: ['asset', 'native', chainId, address],
      queryFn: async () => {
        const service = adapterRegistry.getServiceOrThrow(chainId, 'asset')
        return service.getNativeBalance({ address })
      },
      staleTime: 30_000,
    }),
  
  tokenBalances: (chainId: ChainId, address: Address) =>
    queryOptions({
      queryKey: ['asset', 'tokens', chainId, address],
      queryFn: async () => {
        const service = adapterRegistry.getServiceOrThrow(chainId, 'asset')
        return service.getTokenBalances({ address })
      },
      staleTime: 30_000,
    }),
}
```

### 在组件中使用

```typescript
function BalanceCard({ chainId, address }) {
  const { data: balance, isLoading } = useQuery(
    assetQueries.nativeBalance(chainId, address)
  )
  
  if (isLoading) return <Skeleton />
  
  return (
    <div>
      <span>{balance.formatted}</span>
      <span>{balance.token.symbol}</span>
    </div>
  )
}
```

---

## 本章小结

- 核心服务：Identity、Asset、Transaction、Chain
- 可选服务：Staking、NFT、DeFi
- 每条链实现自己支持的服务
- 通过 TanStack Query 集成到 UI 层

---

## 下一章

继续阅读 [第十三章：平台服务](../03-平台服务/)，了解平台能力抽象。
