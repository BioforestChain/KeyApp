# 链服务实现规范

> 各链适配器的具体实现要求

---

## 概述

本文档定义各链适配器的实现规范，补充接口定义中未涵盖的链特有逻辑。

---

## 适配器架构

### 基础接口

```typescript
interface IChainAdapter {
  readonly chainId: string
  readonly chainType: ChainConfigType  // 'bioforest' | 'evm' | 'bip39' | 'custom'
  
  // 核心服务
  readonly identity: IIdentityService
  readonly asset: IAssetService
  readonly transaction: ITransactionService
  readonly chain: IChainService
  
  // 可选服务
  readonly staking: IStakingService | null
  
  // 生命周期
  initialize(config: ChainConfig): Promise<void>
  dispose(): void
}
```

### 适配器注册

```typescript
interface IAdapterRegistry {
  register(type: ChainConfigType, factory: AdapterFactory): void
  getAdapter(chainId: string): IChainAdapter
  hasAdapter(chainId: string): boolean
}

type AdapterFactory = (config: ChainConfig) => IChainAdapter
```

---

## BioForest 链

适用于：BFMeta, CCChain, PMChain, BFChainV2, BTGMeta, BIWMeta, ETHMeta, Malibu

### 密钥派生

| 项目 | 规范 |
|-----|------|
| 算法 | Ed25519 |
| 种子生成 | SHA256(secret) → 32 bytes |
| 地址格式 | {prefix} + Base58Check(RIPEMD160(SHA256(publicKey))) |
| 默认前缀 | `b` |

### 交易类型

| 类型 | 用途 | 手续费基准 |
|-----|------|-----------|
| 转账 | 原生代币/资产转移 | 动态（链上查询） |
| 设置交易密码 | 启用二次签名 | 固定 |
| 资产销毁 | 销毁代币 | 动态 |

### 交易密码（二次签名）

BioForest 链支持可选的交易密码机制：

```
交易创建流程:
1. 检查地址是否启用交易密码
2. 如已启用，签名时需提供 paySecret
3. 交易体包含 signSignature 字段
```

### API 端点

| 接口 | 路径 | 说明 |
|-----|------|------|
| 余额查询 | `/wallet/{chain}/address/balance` | 查询地址余额 |
| 地址信息 | `/wallet/{chain}/address/info` | 查询地址详情（含二次签名状态） |
| 交易广播 | `/wallet/{chain}/transactions/broadcast` | 广播签名交易 |
| 交易查询 | `/wallet/{chain}/transactions/query` | 查询历史交易 |
| 手续费查询 | `/wallet/{chain}/blockAveFee` | 获取建议手续费 |

### 特殊处理

- **MUST** 检查地址是否冻结（isFreezed）
- **MUST** 处理交易密码验证
- **SHOULD** 缓存区块高度用于交易构建

### SDK 集成

BioForest 链使用 `@bfchain/core` SDK 进行交易创建和签名。SDK 采用源代码集成 + 延迟加载架构。

#### 目录结构

```typescript
src/services/bioforest-sdk/
├── index.ts              // SDK 高层 API（公开接口）
├── types.ts              // 类型定义
├── genesis-block.json    // 创世块配置（~544KB，延迟加载）
└── internal/             // SDK 核心实现（从 @btgmeta-bundle 迁移）
    ├── index.ts          // setup() 入口函数
    ├── core/             // 核心类
    │   ├── @type.ts
    │   ├── const.ts
    │   └── core.ts       // BTGMetaBundleCore 类
    └── transaction/      // 交易控制器
        ├── @type.ts
        ├── index.ts
        ├── controller-base.ts  // 基础交易控制器
        ├── core.ts             // 核心交易逻辑
        └── exchange.ts         // 交换交易逻辑
```

#### 延迟加载架构

SDK 体积较大（~1MB），**MUST** 使用 `await import()` 延迟加载，避免影响首屏性能：

```typescript
// ❌ 错误：静态导入会打包进主 bundle
import { setup } from './internal'

// ✅ 正确：动态导入，按需加载
export async function getBioforestCore(): Promise<BioforestChainBundleCore> {
  const [{ setup }, genesis] = await Promise.all([
    import('./internal'),
    import('./genesis-block.json'),
  ])
  return setup(genesis.default, cryptoHelper, customRemark)
}
```

#### 构建产物分析

| Chunk | 大小 | 加载时机 |
|-------|------|---------|
| index.js | ~1.3MB | 首屏加载 |
| bioforest-sdk-internal.js | ~983KB | 创建交易时延迟加载 |
| genesis-block.js | ~544KB | 创建交易时延迟加载 |

#### 依赖关系

```
@bfchain/core         # BioForest 链核心库（npm 包）
├── @bfchain/util     # 工具函数
└── buffer            # Buffer polyfill（已在 vite.config.ts 全局配置）
```

#### 关键函数

```typescript
// 高层 API（src/services/bioforest-sdk/index.ts）
createTransferTransaction(params)   // 创建转账交易
broadcastTransaction(rpcUrl, tx)    // 广播交易
getAddressInfo(rpcUrl, address)     // 获取地址信息（含二次签名状态）
verifyPayPassword(secret, pay, pk)  // 验证交易密码
setPayPassword(params)              // 设置交易密码

// 底层 API（通过 getBioforestCore() 获取）
core.transactionController.createTransferTransactionJSON()
core.transactionController.createSignatureTransactionJSON()
core.transactionController.getTransferTransactionMinFee()
core.accountBaseHelper().createSecondSecretKeypairV2()
```

### 交易密码流程

```
用户发起转账
       │
       ▼
getAddressInfo() 检查 secondPublicKey
       │
       ├─ 无 secondPublicKey → 直接签名
       │
       └─ 有 secondPublicKey → 需要交易密码
              │
              ▼
       用户输入交易密码
              │
              ▼
       verifyPayPassword() 验证
              │
              ├─ 失败 → 提示错误
              │
              └─ 成功 → 使用 paySecret 签名
                     │
                     ▼
              createTransferTransaction()
                     │
                     ▼
              broadcastTransaction()
```

---

## EVM 链

适用于：Ethereum, BSC, Polygon 等 EVM 兼容链

### 密钥派生

| 项目 | 规范 |
|-----|------|
| 算法 | secp256k1 |
| 派生路径 | m/44'/60'/0'/0/{index} |
| 地址格式 | 0x + Keccak256(publicKey)[12:32] |
| Checksum | EIP-55 大小写校验 |

### Gas 估算

```typescript
interface GasEstimate {
  gasLimit: bigint      // 执行上限
  gasPrice: bigint      // Legacy 模式
  maxFeePerGas?: bigint // EIP-1559 模式
  maxPriorityFeePerGas?: bigint
}
```

### 手续费档位

| 档位 | 说明 | 时间预估 |
|-----|------|---------|
| slow | 基础价格 × 1.0 | ~1 分钟 |
| standard | 基础价格 × 1.5 | ~30 秒 |
| fast | 基础价格 × 2.0 | ~15 秒 |

### 代币转账（ERC-20）

```
1. 构建 transfer(to, amount) 调用数据
2. 估算 Gas（合约调用通常 ~65,000）
3. 设置 to = 合约地址
4. 设置 value = 0
5. 设置 data = 编码后的调用数据
```

### 特殊处理

- **MUST** 自动检测 EIP-1559 支持
- **MUST** 正确处理 nonce 冲突
- **SHOULD** 预留 20% Gas 余量

---

## Tron 链

### 密钥派生

| 项目 | 规范 |
|-----|------|
| 算法 | secp256k1 |
| 派生路径 | m/44'/195'/0'/0/{index} |
| 地址格式 | Base58Check(0x41 + Keccak256(publicKey)[12:32]) |
| 地址前缀 | T |

### 资源模型

Tron 使用带宽和能量而非 Gas：

| 资源 | 用途 | 获取方式 |
|-----|------|---------|
| 带宽 | 普通交易 | 免费额度 / 冻结 TRX |
| 能量 | 智能合约 | 冻结 TRX |

### 手续费估算

```typescript
interface TronFeeEstimate {
  bandwidth: number     // 所需带宽
  energy: number        // 所需能量（合约调用）
  feeLimit: bigint      // 最大费用（SUN）
  activationFee?: bigint // 地址激活费（1.1 TRX）
}
```

### 地址激活

- **MUST** 检查目标地址是否已激活
- **MUST** 未激活地址首次转入需额外 1.1 TRX
- **SHOULD** 在 UI 提示用户激活费用

### TRC-20 转账

类似 ERC-20，但需注意：
- 能量消耗通常 10,000-30,000
- 需预估 feeLimit 防止失败

---

## Bitcoin 链

### 密钥派生

| 项目 | 规范 |
|-----|------|
| 算法 | secp256k1 |
| 派生路径 | m/44'/0'/0'/0/{index} (Legacy) |
| 地址格式 | P2PKH (1xxx), P2WPKH (bc1xxx) |

### UTXO 模型

Bitcoin 使用 UTXO（未花费交易输出）模型：

```typescript
interface UTXO {
  txid: string
  vout: number
  value: bigint   // satoshi
  scriptPubKey: string
  txHex?: string  // 某些钱包需要完整交易
}
```

### 交易构建

```
1. 获取地址所有 UTXO
2. 选择足够的 UTXO（需覆盖金额 + 手续费）
3. 构建交易输入
4. 构建交易输出（收款地址 + 找零地址）
5. 签名所有输入
6. 广播交易
```

### 手续费估算

```typescript
// 手续费 = 交易大小(vbytes) × 费率(sat/vB)
const estimatedSize = inputs * 148 + outputs * 34 + 10
const fee = estimatedSize * feeRate
```

### 特殊处理

- **MUST** 正确处理 UTXO 选择
- **MUST** 计算找零输出
- **SHOULD** 支持 RBF（Replace-By-Fee）

---

## 错误处理

### 通用错误码

| 错误码 | 说明 |
|-------|------|
| CHAIN_NOT_SUPPORTED | 不支持的链类型 |
| NETWORK_ERROR | 网络请求失败 |
| INSUFFICIENT_BALANCE | 余额不足 |
| INSUFFICIENT_FEE | 手续费不足 |
| INVALID_ADDRESS | 地址格式错误 |
| TRANSACTION_REJECTED | 交易被拒绝 |

### 链特有错误

| 链 | 错误码 | 说明 |
|---|-------|------|
| BioForest | ADDRESS_FROZEN | 地址已冻结 |
| BioForest | PAYSECRET_REQUIRED | 需要交易密码 |
| Tron | ADDRESS_NOT_ACTIVATED | 地址未激活 |
| Tron | ENERGY_INSUFFICIENT | 能量不足 |
| EVM | NONCE_TOO_LOW | Nonce 冲突 |
| Bitcoin | UTXO_INSUFFICIENT | 可用 UTXO 不足 |

---

## 参考实现

参考 mpay 项目中的实现：

| 链 | 文件路径 |
|---|---------|
| BFMeta | `libs/wallet-base/services/wallet/bfmeta/` |
| Ethereum | `libs/wallet-base/services/wallet/ethereum/` |
| Tron | `libs/wallet-base/services/wallet/tron/` |
| BSC | `libs/wallet-base/services/wallet/binance/` |
| Bitcoin | `libs/wallet-base/services/wallet/bitcoin/` |
