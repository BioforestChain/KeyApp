# BioForest Chain API Client

> 源码: [`src/services/bioforest-api/`](https://github.com/BioforestChain/KeyApp/blob/main/src/services/bioforest-api/)

## 概述

BioForest API Client 提供类型安全的 BioForest 链钱包 API 访问，自动处理 `{ success, result }` 响应格式。

## 快速开始

```typescript
import { BioForestApiClient, createMainnetClient } from '@/services/bioforest-api'

// 使用默认主网配置
const client = createMainnetClient()

// 或自定义配置
const client = new BioForestApiClient({
  rpcUrl: 'https://walletapi.bfmeta.info',
  chainId: 'bfm',
  timeout: 30000,
})

// 获取最新区块
const block = await client.getLastBlock()
console.log(`Height: ${block.height}`)

// 获取余额
const balance = await client.getBalance('bXXX...', 'BFM')
console.log(`Balance: ${balance.amount}`)
```

## 配置选项

```typescript
interface BioForestApiClientConfig {
  rpcUrl: string      // API 基础 URL
  chainId: string     // 链 ID (如 'bfm')
  timeout?: number    // 超时时间 (默认 30000ms)
  fetch?: typeof fetch  // 自定义 fetch (用于测试)
}
```

## Block API

### getLastBlock

获取最新区块：

```typescript
const block = await client.getLastBlock()
// { height, timestamp, ... }
```

### getBlockHeightAndTimestamp

获取区块高度和时间戳（交易创建优化）：

```typescript
const { height, timestamp } = await client.getBlockHeightAndTimestamp()
```

## Address/Account API

### getBalance

获取指定资产余额：

```typescript
const balance = await client.getBalance(
  'bXXX...',     // 地址
  'BFM',         // 资产类型
  'nxOGQ'        // Magic (可选，默认主网)
)
// { amount, ... }
```

### getAddressInfo

获取地址信息（含安全密码公钥）：

```typescript
const info = await client.getAddressInfo('bXXX...')
// { address, secondPublicKey?, accountStatus? }
```

### hasTwoStepSecret

检查是否设置安全密码：

```typescript
const hasPay = await client.hasTwoStepSecret('bXXX...')
// true / false
```

### getAccountAssets

获取账户所有资产：

```typescript
const assets = await client.getAccountAssets({
  address: 'bXXX...',
  // 可选参数
})
```

## Transaction API

### getTransactionHistory

获取交易历史：

```typescript
const history = await client.getTransactionHistory('bXXX...', {
  page: 1,
  pageSize: 20,
  maxHeight: 123456,  // 可选，默认最新高度
})
```

### queryTransactions

高级交易查询：

```typescript
const result = await client.queryTransactions({
  address: 'bXXX...',
  maxHeight: 123456,
  page: 1,
  pageSize: 20,
  sort: -1,  // -1 降序, 1 升序
})
```

### getPendingTransactions

获取待确认交易：

```typescript
const pending = await client.getPendingTransactions()

// 或指定发送者
const pending = await client.getPendingTransactionsForSender('bXXX...')
```

### broadcastTransaction

广播交易：

```typescript
const txHash = await client.broadcastTransaction(signedTx)
```

## Fee API

### calculateMinFee

计算最小手续费：

```typescript
const minFee = await client.calculateMinFee({
  type: 'TRA-TRANS',
  senderId: 'bXXX...',
  timestamp: 1705312800,
  applyBlockHeight: 123456,
  effectiveBlockHeight: 123556,
  recipientId: 'bYYY...',
  amount: '100000000',
  assetType: 'BFM',
  sourceChainMagic: 'nxOGQ',
  sourceChainName: 'bfmeta',
})
```

## 工具方法

### formatAmount

链单位转显示单位：

```typescript
BioForestApiClient.formatAmount('100000000', 8)
// '1'

BioForestApiClient.formatAmount('150000000', 8)
// '1.5'
```

### parseAmount

显示单位转链单位：

```typescript
BioForestApiClient.parseAmount('1.5', 8)
// '150000000'
```

## 错误处理

```typescript
import { BioForestApiError } from '@/services/bioforest-api'

try {
  const balance = await client.getBalance(address, 'BFM')
} catch (error) {
  if (error instanceof BioForestApiError) {
    console.error('API Error:', error.message)
    console.error('Code:', error.code)
    console.error('Response:', error.response)
  }
}
```

## 类型定义

```typescript
// API 响应
interface ApiResponse<T> {
  success: true
  result: T
}

interface ApiError {
  success: false
  error?: string
  message?: string
  code?: number
}

// 区块信息
interface BlockInfo {
  height: number
  timestamp: number
  // ...
}

// 余额信息
interface BalanceInfo {
  amount: string
  // ...
}

// 地址信息
interface AddressInfo {
  address: string
  secondPublicKey: string | null
  accountStatus?: number
}

// 交易
interface Transaction {
  signature: string
  type: string
  senderId: string
  recipientId?: string
  amount?: string
  fee: string
  timestamp: number
  // ...
}
```

## URL 构建

```typescript
// 内部实现
private url(path: string): string {
  return `${this.rpcUrl}/wallet/${this.chainId}${path}`
}

// 示例
// rpcUrl: https://walletapi.bfmeta.info
// chainId: bfm
// path: /lastblock
// 结果: https://walletapi.bfmeta.info/wallet/bfm/lastblock
```

## 与 SDK 的关系

```
BioForestApiClient (本模块)
    │
    └── 提供底层 HTTP API 访问
    
bioforest-sdk
    │
    ├── 使用 BnqklWalletBioforestApi (内部封装)
    ├── 交易创建和签名
    └── 依赖 API 获取区块信息
```

建议：
- 简单查询使用 `BioForestApiClient`
- 交易创建使用 `bioforest-sdk`
