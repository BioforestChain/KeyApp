# BioSDK 开发指南

## 安装

```bash
npm install @biochain/bio-sdk
# 或
pnpm add @biochain/bio-sdk
```

## 快速开始

```typescript
import '@biochain/bio-sdk'

// window.bio 现在可用
async function connect() {
  const accounts = await window.bio.request({
    method: 'bio_requestAccounts'
  })
  console.log('Connected accounts:', accounts)
}
```

## API 参考

### request(args)

发起请求到钱包。

```typescript
const result = await window.bio.request<T>({
  method: string,
  params?: unknown[]
})
```

### on(event, handler) / off(event, handler)

订阅/取消订阅事件。

```typescript
window.bio.on('accountsChanged', (accounts) => {
  console.log('Accounts changed:', accounts)
})
```

## 方法列表

### 钱包连接

#### bio_requestAccounts

请求连接钱包，显示授权 UI。

```typescript
const accounts = await window.bio.request<BioAccount[]>({
  method: 'bio_requestAccounts'
})
// [{ address: '...', chain: 'bfmeta', name: 'My Wallet' }]
```

#### bio_accounts

获取已连接的账户（无 UI）。

```typescript
const accounts = await window.bio.request<BioAccount[]>({
  method: 'bio_accounts'
})
```

### 地址选择

#### bio_selectAccount

显示账户选择器。

```typescript
const account = await window.bio.request<BioAccount>({
  method: 'bio_selectAccount',
  params: [{ chain: 'ethereum' }]  // 可选：限制链类型
})
```

#### bio_pickWallet

选择另一个钱包地址（用于转账目标）。

```typescript
const target = await window.bio.request<BioAccount>({
  method: 'bio_pickWallet',
  params: [{
    chain: 'bfmeta',
    exclude: currentAddress  // 排除当前地址
  }]
})
```

### 签名

#### bio_signMessage

签名消息。

```typescript
const signature = await window.bio.request<string>({
  method: 'bio_signMessage',
  params: [{
    message: 'Hello, Bio!',
    address: '...'
  }]
})
```

### 转账

#### bio_sendTransaction

发起转账。

```typescript
const result = await window.bio.request<{ txHash: string }>({
  method: 'bio_sendTransaction',
  params: [{
    from: '...',
    to: '...',
    amount: '1.0',
    chain: 'bfmeta',
    asset: 'BFM'  // 可选，默认原生资产
  }]
})
```

### 交易流水线（必须）

对于更复杂的业务（例如：后端广播、合约调用、多步签名），需要将“创建交易 / 签名交易 / 广播交易”拆开：

1) `bio_createTransaction`：根据参数构造 **Unsigned Transaction**
2) `bio_signTransaction`：对 Unsigned Transaction 做签名，得到 **Signed Transaction**
3) 广播：可由 KeyApp（`bio_sendTransaction`）或 DApp 自己/后端负责（未来可扩展 `bio_sendRawTransaction`）

#### bio_createTransaction

创建未签名交易（不做签名、不做广播）。

```typescript
type BioUnsignedTransaction = {
  chain: string
  data: unknown
}

const unsignedTx = await window.bio.request<BioUnsignedTransaction>({
  method: 'bio_createTransaction',
  params: [{
    from: '0x...',
    to: '0x...',
    amount: '0.01',
    chain: 'ethereum'
  }]
})
```

#### bio_signTransaction

对未签名交易进行签名（需要用户确认 + 钱包锁验证）。

```typescript
type BioSignedTransaction = {
  chain: string
  raw: string // 链特定的 raw tx（例如 EVM 的 RLP hex）
  signature?: string
}

const signedTx = await window.bio.request<BioSignedTransaction>({
  method: 'bio_signTransaction',
  params: [{
    from: '0x...',
    chain: 'ethereum',
    unsignedTx
  }]
})
```

## 事件

### accountsChanged

账户变更时触发。

```typescript
window.bio.on('accountsChanged', (accounts: BioAccount[]) => {
  // 更新 UI
})
```

### chainChanged

链切换时触发。

```typescript
window.bio.on('chainChanged', (chainId: string) => {
  // 刷新数据
})
```

### connect / disconnect

连接状态变更。

```typescript
window.bio.on('connect', ({ chainId }) => {
  console.log('Connected to', chainId)
})

window.bio.on('disconnect', ({ code, message }) => {
  console.log('Disconnected:', message)
})
```

## 错误码

| 代码 | 名称 | 说明 |
|------|------|------|
| 4001 | USER_REJECTED | 用户拒绝 |
| 4100 | UNAUTHORIZED | 未授权 |
| 4200 | UNSUPPORTED_METHOD | 不支持的方法 |
| 4900 | DISCONNECTED | 断开连接 |
| -32602 | INVALID_PARAMS | 无效参数 |
| -32603 | INTERNAL_ERROR | 内部错误 |

## TypeScript 支持

```typescript
import type { BioAccount, BioProvider } from '@biochain/bio-sdk'

declare global {
  interface Window {
    bio?: BioProvider
  }
}
```
