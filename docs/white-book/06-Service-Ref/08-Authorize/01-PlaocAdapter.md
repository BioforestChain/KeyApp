# Authorize Service (Plaoc Adapter)

> 源码: [`src/services/authorize/`](https://github.com/BioforestChain/KeyApp/blob/main/src/services/authorize/)

## 概述

Authorize Service 提供 DWEB/Plaoc 平台的授权功能，处理外部 DApp 的地址授权和签名请求。

## 架构

```
外部 DApp (MiniApp)
    │
    ├── 地址授权请求
    │   └── AddressAuthService
    │
    └── 签名请求
        └── SignatureAuthService
            │
            └── plaocAdapter (IPC)
                    │
                    ├── Web: mock 实现
                    ├── DWeb: 原生 IPC
                    └── Mock: 测试实现
```

## 地址授权类型

```typescript
type AddressAuthType = 
  | 'main'     // 仅当前钱包地址
  | 'network'  // 指定链的所有地址
  | 'all'      // 所有钱包所有地址
```

## 地址授权请求

```typescript
interface AddressAuthRequest {
  eventId: string           // IPC 回调句柄
  chainName: string         // 目标链
  type: AddressAuthType     // 授权范围
  signMessage?: string      // 可选：签名消息
  getMain?: string          // 可选：请求主密钥（敏感）
  appName: string           // 请求方名称
  appHome: string           // 请求方首页
  appLogo: string           // 请求方 Logo
}
```

## 地址授权响应

```typescript
interface AddressAuthResponse {
  name: string              // 钱包名称
  address: string           // 地址
  chainName: string         // 链名
  publicKey: string         // 公钥
  magic: string             // Magic 标识
  signMessage: string       // 签名结果
  main?: string             // 主密钥（仅在批准后）
}
```

## 签名类型

```typescript
type SignatureType =
  | 'message'      // 消息签名
  | 'json'         // JSON 对象签名
  | 'transfer'     // 转账签名
  | 'destory'      // 资产销毁（注：保留 mpay 拼写）
  | 'bioforestChainCertificateTransfer'  // 凭证转账
  | 'ENTITY'       // NFT 操作
  | 'assetTypeBalance'  // 资产余额查询
  | 'contract'     // 合约调用
```

## 签名请求

```typescript
interface SignatureRequest {
  eventId: string
  type: SignatureType
  payload: TransferPayload | MessagePayload | DestroyPayload | unknown
  appName: string
  appHome: string
  appLogo: string
}

// 转账载荷
interface TransferPayload {
  chainName: string
  senderAddress: string
  receiveAddress: string
  balance: string
  fee?: string
  assetType?: string
  contractInfo?: {
    assetType: string
    decimals: number
    contractAddress: string
  }
}

// 消息载荷
interface MessagePayload {
  chainName: string
  senderAddress: string
  message: string
}
```

## Plaoc Adapter 接口

```typescript
interface IPlaocAdapter {
  /** 获取调用方应用信息 */
  getCallerAppInfo(eventId: string): Promise<CallerAppInfo>
  
  /** 响应请求 */
  respondWith(eventId: string, path: string, data: unknown): Promise<void>
  
  /** 移除事件 */
  removeEventId(eventId: string): Promise<void>
  
  /** 检查可用性 */
  isAvailable(): boolean
}

interface CallerAppInfo {
  appId: string
  appName: string
  appIcon: string
  origin: string
}
```

## 使用示例

### 检查 Plaoc 可用性

```typescript
import { isPlaocAvailable } from '@/services/authorize'

if (isPlaocAvailable()) {
  // 在 DWeb 环境中
}
```

### 处理地址授权

```typescript
import { AddressAuthService } from '@/services/authorize'

const authService = new AddressAuthService()

// 处理授权请求
async function handleAddressAuth(request: AddressAuthRequest) {
  // 显示授权 UI
  const approved = await showAuthDialog(request)
  
  if (approved) {
    const addresses = await getWalletAddresses(request.type, request.chainName)
    await authService.approve(request.eventId, addresses)
  } else {
    await authService.reject(request.eventId)
  }
}
```

### 处理签名请求

```typescript
import { SignatureAuthService } from '@/services/authorize'

const signService = new SignatureAuthService()

async function handleSignature(request: SignatureRequest) {
  // 显示签名确认 UI
  const approved = await showSignDialog(request)
  
  if (approved) {
    const signature = await signTransaction(request.payload)
    await signService.respond(request.eventId, signature)
  } else {
    await signService.reject(request.eventId, 'User rejected')
  }
}
```

## 数据流

```
MiniApp 发起授权请求
    │
    └── postMessage → KeyApp
            │
            ├── 解析 AddressAuthRequest
            │
            ├── 显示授权 UI
            │   └── 用户确认/拒绝
            │
            ├── 获取钱包地址
            │   └── 可选：签名消息
            │
            └── plaocAdapter.respondWith()
                    │
                    └── postMessage → MiniApp
```

## 安全考虑

1. **敏感权限**: `getMain` 请求主密钥需要额外确认
2. **签名验证**: 转账签名需要显示完整交易详情
3. **来源验证**: 通过 `CallerAppInfo` 验证请求来源
4. **权限缓存**: 可通过 `ecosystemStore` 缓存已授权权限
