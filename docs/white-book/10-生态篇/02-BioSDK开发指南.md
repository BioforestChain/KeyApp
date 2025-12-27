# BioSDK 开发指南

## 安装

```bash
npm install @aspect-aspect/bio-sdk
# 或
pnpm add @aspect-aspect/bio-sdk
```

## 快速开始

```typescript
import '@aspect-aspect/bio-sdk'

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
import type { BioAccount, BioProvider } from '@aspect-aspect/bio-sdk'

declare global {
  interface Window {
    bio?: BioProvider
  }
}
```
