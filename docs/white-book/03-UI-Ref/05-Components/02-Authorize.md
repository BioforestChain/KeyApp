# Authorize 组件

> 源码: [`src/components/authorize/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/authorize/)

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| `AppInfoCard` | `AppInfoCard.tsx` | DApp 信息卡片 |
| `PermissionList` | `PermissionList.tsx` | 权限列表 |
| `TransactionDetails` | `TransactionDetails.tsx` | 交易详情 |
| `BalanceWarning` | `BalanceWarning.tsx` | 余额不足警告 |

---

## AppInfoCard

显示请求授权的 DApp 信息，包括图标、名称、来源。

### Props

```typescript
interface AppInfoCardProps {
  appInfo: CallerAppInfo
  className?: string
}

interface CallerAppInfo {
  appId: string
  appName: string
  appIcon: string
  origin: string
}
```

### 特性

- 自动检测未知来源 (非 HTTPS、localhost)
- 未知来源显示 ⚠️ Unknown 标签
- 图标加载失败时显示首字母

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ [🔷]  Example DApp           ⚠️ Unknown    │
│       https://example.com                   │
└─────────────────────────────────────────────┘
```

---

## PermissionList

显示 DApp 请求的权限列表。

### Props

```typescript
interface PermissionListProps {
  permissions: string[]
  className?: string
}
```

### 使用示例

```tsx
<PermissionList permissions={['read_address', 'sign_message']} />
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ ✓ 读取钱包地址                              │
│ ✓ 签名消息                                  │
└─────────────────────────────────────────────┘
```

---

## TransactionDetails

签名授权时的交易详情展示。

### Props

```typescript
interface TransactionDetailsProps {
  from: string              // 发送地址
  to: string                // 接收地址
  amount: string            // 金额 (含符号)
  fee?: string              // 手续费
  chainId?: string          // 链 ID (显示图标)
  className?: string
}
```

### 使用示例

```tsx
<TransactionDetails
  from="0x742d35Cc..."
  to="0x8ba1f109..."
  amount="1.5 ETH"
  fee="0.002 ETH"
  chainId="ethereum"
/>
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ [ETH] ethereum                              │
│─────────────────────────────────────────────│
│ From         0x742d...6634                  │
│ To           0x8ba1...f109                  │
│ Amount       1.5 ETH                        │
│ Fee          0.002 ETH                      │
└─────────────────────────────────────────────┘
```

---

## BalanceWarning

余额不足时的警告提示。

### Props

```typescript
interface BalanceWarningProps {
  balance: string           // 当前余额
  required: string          // 所需金额
  symbol: string            // 代币符号
  className?: string
}
```

### 使用示例

```tsx
<BalanceWarning
  balance="0.5"
  required="1.52"
  symbol="ETH"
/>
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ ⚠️ 余额不足                                 │
│    需要: 1.52 ETH                           │
│    当前: 0.5 ETH                            │
└─────────────────────────────────────────────┘
```

---

## 使用场景

这些组件用于 DApp 授权流程：

```tsx
function AuthorizeSignatureActivity() {
  return (
    <div>
      <AppInfoCard appInfo={callerApp} />
      <PermissionList permissions={['sign_transaction']} />
      <TransactionDetails from={from} to={to} amount={amount} />
      {isInsufficientBalance && (
        <BalanceWarning balance={balance} required={required} symbol={symbol} />
      )}
      <Button onClick={approve}>授权</Button>
      <Button variant="ghost" onClick={reject}>拒绝</Button>
    </div>
  )
}
```
