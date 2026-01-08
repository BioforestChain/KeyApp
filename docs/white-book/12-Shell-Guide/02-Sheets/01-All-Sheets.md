# Sheets (底部弹窗) 完整列表

> 源码: [`src/stackflow/activities/sheets/`](https://github.com/BioforestChain/KeyApp/blob/main/src/stackflow/activities/sheets/)

## Sheet 列表 (28个)

### 钱包相关

| Sheet | 文件 | 说明 |
|-------|------|------|
| `WalletListJob` | `WalletListJob.tsx` | 钱包列表选择 |
| `WalletPickerJob` | `WalletPickerJob.tsx` | 钱包选择器 |
| `WalletAddJob` | `WalletAddJob.tsx` | 添加钱包 |
| `WalletRenameJob` | `WalletRenameJob.tsx` | 重命名钱包 |
| `WalletDeleteJob` | `WalletDeleteJob.tsx` | 删除钱包确认 |
| `WalletLockConfirmJob` | `WalletLockConfirmJob.tsx` | 钱包锁定确认 |

### 链相关

| Sheet | 文件 | 说明 |
|-------|------|------|
| `ChainSelectorJob` | `ChainSelectorJob.tsx` | 链选择器 |
| `ChainSwitchConfirmJob` | `ChainSwitchConfirmJob.tsx` | 切换链确认 |

### 转账相关

| Sheet | 文件 | 说明 |
|-------|------|------|
| `TransferConfirmJob` | `TransferConfirmJob.tsx` | 转账确认 |
| `TransferWalletLockJob` | `TransferWalletLockJob.tsx` | 转账解锁 |
| `FeeEditJob` | `FeeEditJob.tsx` | 手续费编辑 |

### 联系人相关

| Sheet | 文件 | 说明 |
|-------|------|------|
| `ContactPickerJob` | `ContactPickerJob.tsx` | 联系人选择 |
| `ContactEditJob` | `ContactEditJob.tsx` | 联系人编辑 |
| `ContactShareJob` | `ContactShareJob.tsx` | 联系人分享 |
| `ContactAddConfirmJob` | `ContactAddConfirmJob.tsx` | 添加联系人确认 |

### 安全相关

| Sheet | 文件 | 说明 |
|-------|------|------|
| `SecurityWarningJob` | `SecurityWarningJob.tsx` | 安全警告 |
| `SetTwoStepSecretJob` | `SetTwoStepSecretJob.tsx` | 设置安全密码 |
| `TwoStepSecretConfirmJob` | `TwoStepSecretConfirmJob.tsx` | 安全密码确认 |
| `MnemonicOptionsJob` | `MnemonicOptionsJob.tsx` | 助记词选项 |

### DApp 授权相关

| Sheet | 文件 | 说明 |
|-------|------|------|
| `PermissionRequestJob` | `PermissionRequestJob.tsx` | 权限请求 |
| `SigningConfirmJob` | `SigningConfirmJob.tsx` | 签名确认 |
| `MiniappTransferConfirmJob` | `MiniappTransferConfirmJob.tsx` | MiniApp 转账确认 |
| `MiniappSignTransactionJob` | `MiniappSignTransactionJob.tsx` | MiniApp 签名交易 |

### 工具

| Sheet | 文件 | 说明 |
|-------|------|------|
| `ScannerJob` | `ScannerJob.tsx` | 二维码扫描 |
| `ClearDataConfirmJob` | `ClearDataConfirmJob.tsx` | 清除数据确认 |

---

## 详细文档

### WalletListJob

钱包列表弹窗，用于切换当前钱包。

```typescript
interface WalletListJobProps {
  // 无 props，使用 store 数据
}

// 打开方式
actions.push('WalletListJob', {})
```

### ChainSelectorJob

链选择弹窗。

```typescript
interface ChainSelectorJobParams {
  walletId: string
  currentChain?: string
}

// 打开方式
actions.push('ChainSelectorJob', { walletId, currentChain })
```

### TransferConfirmJob

转账确认弹窗，显示交易详情并确认。

```typescript
interface TransferConfirmJobParams {
  from: string
  to: string
  amount: string
  symbol: string
  fee: string
  chain: ChainType
  memo?: string
}

// 打开方式
actions.push('TransferConfirmJob', {
  from: wallet.address,
  to: recipient,
  amount: '1.5',
  symbol: 'ETH',
  fee: '0.002',
  chain: 'evm',
})
```

### ContactPickerJob

联系人选择弹窗。

```typescript
interface ContactPickerJobParams {
  chainType?: ChainType       // 过滤链类型
  onSelect?: (contact: Contact, address: ContactAddress) => void
}
```

### FeeEditJob

手续费编辑弹窗。

```typescript
interface FeeEditJobParams {
  chain: ChainType
  currentFee: string
  estimatedFee: string
  minFee: string
  maxFee: string
  onConfirm: (fee: string) => void
}
```

### ScannerJob

二维码扫描弹窗。

```typescript
interface ScannerJobParams {
  onScan: (result: string) => void
  title?: string
}
```

### SigningConfirmJob

签名确认弹窗 (DApp 调用)。

```typescript
interface SigningConfirmJobParams {
  appInfo: CallerAppInfo
  request: SignatureRequest
  onApprove: () => void
  onReject: () => void
}
```

---

## Sheet 打开方式

```typescript
import { useActions } from '@/stackflow'

function MyComponent() {
  const actions = useActions()
  
  // 打开 Sheet
  const openChainSelector = () => {
    actions.push('ChainSelectorJob', { walletId })
  }
  
  // 带回调的 Sheet
  const openContactPicker = () => {
    actions.push('ContactPickerJob', {
      chainType: 'evm',
      onSelect: (contact, address) => {
        setRecipient(address.address)
      },
    })
  }
}
```

---

## Sheet vs Activity

| 特性 | Sheet | Activity |
|------|-------|----------|
| 显示方式 | 底部弹出 | 全屏页面 |
| 背景 | 半透明遮罩 | 不透明 |
| 关闭方式 | 下滑/点击遮罩 | 返回按钮 |
| 用途 | 快捷操作/确认 | 完整流程 |
| 命名 | `*Job` | `*Activity` |
