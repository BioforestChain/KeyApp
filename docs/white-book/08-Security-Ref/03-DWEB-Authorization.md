# DWEB 授权

> 源码: [`src/services/authorize/`](https://github.com/BioforestChain/KeyApp/blob/main/src/services/authorize/)

---

## DWEB 协议概述

BFM Pay 通过 Plaoc 协议与其他 DWEB 应用进行跨应用通讯：

```
┌─────────────────┐     Plaoc 协议      ┌─────────────────┐
│   DApp (请求方)  │ ◄─────────────────► │  BFM Pay (钱包)  │
│                 │   getAddress        │                 │
│  商城/游戏/DeFi  │   signature         │  授权/签名/查询   │
│                 │   assetBalance      │                 │
└─────────────────┘                     └─────────────────┘
```

---

## 请求类型

| 请求 | 说明 | 风险等级 |
|------|------|----------|
| getAddress | 获取钱包地址 | 低 |
| signature | 签名消息/交易 | 高 |
| assetBalance | 查询资产余额 | 低 |

---

## 地址授权 (getAddress)

### 请求格式

```typescript
interface GetAddressRequest {
  type: 'main' | 'network' | 'all'
  chainName?: string  // type='network' 时必须
}
```

### 授权类型

| 类型 | 说明 | 返回数据 |
|------|------|----------|
| main | 当前钱包所有链地址 | 钱包名、各链地址、公钥 |
| network | 指定链的所有钱包地址 | 该链下所有地址 |
| all | 所有钱包所有地址 | 完整地址列表 |

### 授权页面实现

```tsx
export function AuthorizeAddressPage() {
  const { eventId } = useActivityParams<{ eventId: string }>()
  const type = useSearchParams().get('type') as 'main' | 'network' | 'all'
  
  const handleAuthorize = async () => {
    // MUST: 验证钱包锁
    const patternKey = await requestWalletLock()
    if (!patternKey) return
    
    // 返回地址给 DApp
    await sendAddressResponse(eventId, selectedAddresses)
  }
  
  return (
    <div>
      <DappInfoCard dapp={dappInfo} />
      <AddressList type={type} onSelect={setSelectedAddresses} />
      <Button onClick={handleAuthorize}>授权</Button>
    </div>
  )
}
```

---

## 签名授权 (signature)

### 签名类型

| 类型 | 场景 | 显示内容 |
|------|------|----------|
| message | 登录验证 | 原始消息文本 |
| transfer | 转账 | 收款地址、金额、手续费 |
| contract | 合约调用 | 合约地址、方法、参数 |
| entity | NFT 操作 | 操作类型、资产详情 |

### 签名数据格式

```typescript
interface SignatureData {
  type: 'message' | 'transfer' | 'contract' | 'entity'
  chainName: string
  senderAddress: string
  
  // type='message'
  message?: string
  
  // type='transfer'
  receiveAddress?: string
  balance?: string
  fee?: string
  assetType?: string
  
  // type='contract'
  contractAddress?: string
  methodName?: string
  params?: unknown
}
```

### 签名流程

```
用户确认签名请求
    │
    ▼
验证钱包锁
    │
    ▼
解密助记词
    │
    ▼
派生对应链的私钥
    │
    ▼
签名数据
    │
    ▼
清除内存中的私钥 ← MUST
    │
    ▼
返回签名给 DApp
```

---

## Deep Link 处理

### URL 格式

```
bfmpay://authorize/address/{eventId}?type=main
bfmpay://authorize/signature/{eventId}?signaturedata=...
```

### 路由配置

```typescript
historySyncPlugin({
  routes: {
    AuthorizeAddressActivity: '/authorize/address/:eventId',
    AuthorizeSignatureActivity: '/authorize/signature/:eventId',
  },
})
```

### Deep Link 解析

```typescript
export function parseAuthorizeDeepLink(url: string): AuthorizeRequest | null {
  const parsed = new URL(url)
  
  if (parsed.pathname.startsWith('/authorize/address/')) {
    return {
      type: 'address',
      eventId: parsed.pathname.split('/').pop(),
      params: Object.fromEntries(parsed.searchParams),
    }
  }
  
  if (parsed.pathname.startsWith('/authorize/signature/')) {
    return {
      type: 'signature',
      eventId: parsed.pathname.split('/').pop(),
      signatureData: JSON.parse(
        decodeURIComponent(parsed.searchParams.get('signaturedata') ?? '[]')
      ),
    }
  }
  
  return null
}
```

---

## 安全考虑

### DApp 来源验证

```typescript
interface DappInfo {
  name: string
  icon: string
  domain: string
  verified: boolean
}
```

### 安全约束

| 约束级别 | 要求 |
|----------|------|
| **MUST** | 显示 DApp 来源信息 |
| **MUST** | 签名前显示完整内容 |
| **MUST** | 大额转账额外警告 |
| **SHOULD** | 未知 DApp 显示风险提示 |
| **SHOULD** | 批量签名需逐一展示 |

### 风险提示

| 场景 | 提示 |
|------|------|
| 未验证 DApp | ⚠️ 此应用未经验证 |
| 大额转账 | ⚠️ 请确认转账金额和地址 |
| 批量签名 | ⚠️ 您正在签署多笔交易 |
| 合约调用 | ⚠️ 请确认合约操作内容 |

---

## 相关文档

- [密钥管理](./01-Key-Management.md)
- [身份认证](./02-Authentication.md)
- [安全审计](./04-Security-Audit.md)
