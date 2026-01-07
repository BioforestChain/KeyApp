# BioForest Chain SDK

> 源码: [`src/services/bioforest-sdk/`](https://github.com/BioforestChain/KeyApp/blob/main/src/services/bioforest-sdk/)

## 概述

BioForest Chain SDK 是 BioForest 链交易创建和签名的唯一入口，封装了 SDK Bundle 加载、Genesis Block 获取、交易构建等功能。

## 架构

```
bioforest-sdk (本模块)
    │
    ├── SDK Bundle (预编译 .cjs)
    │   └── 动态加载 bioforest-chain-bundle.js
    │
    ├── Genesis Blocks
    │   └── /configs/genesis/{chainId}.json
    │
    ├── Crypto Helper
    │   └── @noble/hashes (SHA-256, MD5, RIPEMD-160)
    │
    └── Network API
        └── BnqklWalletBioforestApi
```

## 支持的链

| Chain ID | Magic | API Path | 说明 |
|----------|-------|----------|------|
| bfmeta | nxOGQ | bfm | BFMeta 主网 |
| bfchain | ... | bfchain | BFChain |
| ccchain | ... | ccchain | CCChain |
| pmchain | ... | pmchain | PMChain |

## 核心 API

### getBioforestCore

获取链核心实例：

```typescript
import { getBioforestCore } from '@/services/bioforest-sdk'

const core = await getBioforestCore('bfmeta')
// core.transactionController - 交易控制器
// core.accountBaseHelper() - 账户助手
// core.getAssetType() - 获取主资产类型
// core.getChainName() - 获取链名
// core.getMagic() - 获取 Magic
```

### getLastBlock

获取最新区块信息：

```typescript
import { getLastBlock } from '@/services/bioforest-sdk'

const block = await getLastBlock(
  'https://walletapi.bfmeta.info',
  'bfm'  // API path, not chainId
)
// { height: 123456, timestamp: 1705312800 }
```

### getAddressInfo

获取地址信息（含安全密码公钥）：

```typescript
import { getAddressInfo } from '@/services/bioforest-sdk'

const info = await getAddressInfo(
  'https://walletapi.bfmeta.info',
  'bfm',
  'bXXX...'
)
// { address, secondPublicKey?, accountStatus? }
```

### getAccountBalance

获取账户余额：

```typescript
import { getAccountBalance } from '@/services/bioforest-sdk'

const balance = await getAccountBalance(
  'https://walletapi.bfmeta.info',
  'bfmeta',  // chainId for genesis
  'bXXX...'
)
// '100000000' (in chain units, 1e8)
```

### createTransferTransaction

创建转账交易：

```typescript
import { createTransferTransaction } from '@/services/bioforest-sdk'

const tx = await createTransferTransaction({
  rpcUrl: 'https://walletapi.bfmeta.info',
  chainId: 'bfmeta',
  apiPath: 'bfm',        // 可选，默认根据 chainId 推断
  mainSecret: 'mnemonic or private key',
  paySecret: 'pay password',  // 可选，如果设置了安全密码
  from: 'bXXX...',
  to: 'bYYY...',
  amount: '100000000',   // 1 BFM (1e8)
  assetType: 'BFM',
  fee: '10000',          // 可选，自动计算
  remark: { memo: 'test' },
})
```

### broadcastTransaction

广播交易：

```typescript
import { broadcastTransaction } from '@/services/bioforest-sdk'

const txHash = await broadcastTransaction(
  'https://walletapi.bfmeta.info',
  'bfm',
  signedTransaction
)
```

### verifyTwoStepSecret

验证安全密码：

```typescript
import { verifyTwoStepSecret } from '@/services/bioforest-sdk'

const version = await verifyTwoStepSecret(
  'bfmeta',
  mainSecret,
  paySecret,
  secondPublicKey
)
// 'v2' | 'v1' | false
```

### setTwoStepSecret

设置安全密码：

```typescript
import { setTwoStepSecret } from '@/services/bioforest-sdk'

const result = await setTwoStepSecret({
  rpcUrl: 'https://walletapi.bfmeta.info',
  chainId: 'bfmeta',
  mainSecret: 'mnemonic...',
  newPaySecret: 'new pay password',
})
// { txHash, success: true }
```

## Genesis Block 加载

```typescript
// 浏览器环境
// 从 /configs/genesis/bfmeta.json 加载

// Node.js 环境
import { setGenesisBaseUrl } from '@/services/bioforest-sdk'

setGenesisBaseUrl(
  'file:///path/to/public/configs/genesis',
  { with: { type: 'json' } }
)
```

## 缓存机制

| 缓存 | Key | 说明 |
|------|-----|------|
| API Client | `${baseUrl}|${chainPath}` | 按 URL+路径缓存 |
| Genesis Block | chainId | 按链 ID 缓存 |
| Core Instance | chainMagic | 按链 Magic 缓存 |
| SDK Bundle | singleton | 全局单例 |

## 交易流程

```
createTransferTransaction()
    │
    ├── getBioforestCore(chainId)
    │   ├── 加载 Genesis Block
    │   ├── 加载 SDK Bundle
    │   └── 初始化 Core
    │
    ├── getLastBlock()
    │   └── 获取 applyBlockHeight + timestamp
    │
    ├── 计算手续费 (如未提供)
    │
    ├── 处理安全密码
    │   ├── getAddressInfo() → secondPublicKey
    │   └── verifyTwoStepSecret() → v1/v2
    │
    └── core.transactionController.createTransferTransactionJSON()
```

## Crypto Helper

使用 @noble/hashes 实现跨平台兼容：

```typescript
const cryptoHelper: BFChainCore.CryptoHelperInterface = {
  sha256(data) { /* @noble/hashes/sha2 */ },
  md5(data) { /* @noble/hashes/legacy */ },
  ripemd160(data) { /* @noble/hashes/legacy */ },
}
```

## 注意事项

1. **API Path vs Chain ID**: 
   - `bfmeta` 链的 API 路径是 `bfm`，不是 `bfmeta`
   - 其他链 API 路径与 Chain ID 相同

2. **安全密码版本**:
   - V2: 新算法 `createSecondSecretKeypairV2`
   - V1: 旧算法 `createSecondSecretKeypair`
   - 验证时先尝试 V2，失败再尝试 V1

3. **单位转换**:
   - 链上单位: 1e8 (8位小数)
   - 显示单位: 实际数量
