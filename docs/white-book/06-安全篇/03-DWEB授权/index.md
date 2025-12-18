# 第二十章：DWEB 授权

> 定义 Plaoc 协议的授权流程

---

## 20.1 DWEB 协议概述

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

## 20.2 请求类型

| 请求 | 说明 | 风险等级 |
|-----|------|---------|
| getAddress | 获取钱包地址 | 低 |
| signature | 签名消息/交易 | 高 |
| assetBalance | 查询资产余额 | 低 |

---

## 20.3 地址授权 (getAddress)

### 请求格式

```typescript
interface GetAddressRequest {
  type: 'main' | 'network' | 'all'
  chainName?: string  // type='network' 时必须
}
```

### 授权类型

| 类型 | 说明 | 返回数据 |
|-----|------|---------|
| main | 当前钱包所有链地址 | 钱包名、各链地址、公钥 |
| network | 指定链的所有钱包地址 | 该链下所有地址 |
| all | 所有钱包所有地址 | 完整地址列表 |

### 授权页面

```typescript
// src/pages/authorize/address.tsx
export function AuthorizeAddressPage() {
  const { eventId } = useActivityParams<{ eventId: string }>()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') as 'main' | 'network' | 'all'
  const chainName = searchParams.get('chainName')
  
  const dappInfo = useDappInfo(eventId)
  const wallets = useStore(walletStore, (s) => s.wallets)
  
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([])
  
  const handleAuthorize = async () => {
    // 验证密码
    const password = await requestPassword()
    if (!password) return
    
    // 返回地址给 DApp
    await sendAddressResponse(eventId, selectedAddresses)
  }
  
  const handleReject = () => {
    sendRejectResponse(eventId, 'User rejected')
  }
  
  return (
    <div className="p-4 space-y-6">
      {/* DApp 信息 */}
      <DappInfoCard dapp={dappInfo} />
      
      {/* 授权说明 */}
      <Alert>
        <IconInfoCircle />
        <AlertDescription>
          {type === 'main' && '该应用请求获取您当前钱包的地址'}
          {type === 'network' && `该应用请求获取您在 ${chainName} 上的地址`}
          {type === 'all' && '该应用请求获取您所有钱包的地址'}
        </AlertDescription>
      </Alert>
      
      {/* 地址选择 */}
      <AddressList
        type={type}
        chainName={chainName}
        selected={selectedAddresses}
        onSelect={setSelectedAddresses}
      />
      
      {/* 操作按钮 */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleReject} className="flex-1">
          拒绝
        </Button>
        <Button onClick={handleAuthorize} className="flex-1">
          授权
        </Button>
      </div>
    </div>
  )
}
```

---

## 20.4 签名授权 (signature)

### 签名类型

| 类型 | 场景 | 显示内容 |
|-----|------|---------|
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

### 签名页面

```typescript
// src/pages/authorize/signature.tsx
export function AuthorizeSignaturePage() {
  const { eventId } = useActivityParams<{ eventId: string }>()
  const searchParams = useSearchParams()
  const signatureData = JSON.parse(
    decodeURIComponent(searchParams.get('signaturedata') ?? '[]')
  ) as SignatureData[]
  
  const dappInfo = useDappInfo(eventId)
  
  const handleSign = async () => {
    // 验证密码
    const password = await requestPassword()
    if (!password) return
    
    // 解密助记词
    const wallet = getCurrentWallet()
    const mnemonic = await decryptMnemonic(wallet.encryptedMnemonic, password)
    
    // 签名每个请求
    const signatures = await Promise.all(
      signatureData.map(async (data) => {
        const privateKey = await derivePrivateKey(mnemonic, data.chainName)
        return sign(data, privateKey)
      })
    )
    
    // 返回签名给 DApp
    await sendSignatureResponse(eventId, signatures)
  }
  
  return (
    <div className="p-4 space-y-6">
      <DappInfoCard dapp={dappInfo} />
      
      {/* 签名内容预览 */}
      {signatureData.map((data, index) => (
        <SignaturePreview key={index} data={data} />
      ))}
      
      {/* 风险提示 */}
      {signatureData.some(d => d.type === 'transfer') && (
        <Alert variant="warning">
          <IconAlertTriangle />
          <AlertDescription>
            请确认转账金额和收款地址正确
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleReject} className="flex-1">
          拒绝
        </Button>
        <Button onClick={handleSign} className="flex-1">
          输入密码确认
        </Button>
      </div>
    </div>
  )
}
```

### 签名内容预览

```typescript
// src/components/authorize/signature-preview.tsx
function SignaturePreview({ data }: { data: SignatureData }) {
  if (data.type === 'message') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>消息签名</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-muted p-3 rounded overflow-auto">
            {data.message}
          </pre>
        </CardContent>
      </Card>
    )
  }
  
  if (data.type === 'transfer') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>转账签名</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">发送</span>
            <AddressDisplay address={data.senderAddress} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">接收</span>
            <AddressDisplay address={data.receiveAddress!} />
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">金额</span>
            <AmountDisplay value={data.balance!} symbol={data.assetType!} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">手续费</span>
            <AmountDisplay value={data.fee!} symbol={data.assetType!} />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // ... 其他类型
}
```

---

## 20.5 Deep Link 处理

### URL 格式

```
bfmpay://authorize/address/{eventId}?type=main
bfmpay://authorize/signature/{eventId}?signaturedata=...
```

### 路由配置

```typescript
// src/stackflow/stackflow.ts
historySyncPlugin({
  routes: {
    AuthorizeAddressActivity: '/authorize/address/:eventId',
    AuthorizeSignatureActivity: '/authorize/signature/:eventId',
  },
})
```

### Deep Link 解析

```typescript
// src/services/authorize/deep-link.ts
export function parseAuthorizeDeepLink(url: string): AuthorizeRequest | null {
  const parsed = new URL(url)
  
  if (parsed.pathname.startsWith('/authorize/address/')) {
    const eventId = parsed.pathname.split('/').pop()
    return {
      type: 'address',
      eventId,
      params: Object.fromEntries(parsed.searchParams),
    }
  }
  
  if (parsed.pathname.startsWith('/authorize/signature/')) {
    const eventId = parsed.pathname.split('/').pop()
    const signatureData = JSON.parse(
      decodeURIComponent(parsed.searchParams.get('signaturedata') ?? '[]')
    )
    return {
      type: 'signature',
      eventId,
      signatureData,
    }
  }
  
  return null
}
```

---

## 20.6 安全考虑

### DApp 来源验证

```typescript
interface DappInfo {
  name: string
  icon: string
  domain: string
  verified: boolean
}

// 显示 DApp 信息，让用户确认来源
function DappInfoCard({ dapp }: { dapp: DappInfo }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <img src={dapp.icon} className="size-12 rounded-lg" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{dapp.name}</span>
            {dapp.verified && (
              <IconBadgeCheck className="size-4 text-primary" />
            )}
          </div>
          <span className="text-sm text-muted-foreground">{dapp.domain}</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 风险提示

- ⚠️ 转账签名显示完整交易详情
- ⚠️ 大额转账额外警告
- ⚠️ 未知 DApp 显示风险提示
- ⚠️ 批量签名需逐一展示

---

## 本章小结

- 支持地址授权和签名授权两种请求
- 签名前显示完整内容供用户确认
- 通过 Deep Link 接收授权请求
- 验证 DApp 来源，提示潜在风险

---

## 下一篇

完成安全篇后，继续阅读 [第七篇：国际化篇](../../07-国际化篇/)，了解多语言支持。
