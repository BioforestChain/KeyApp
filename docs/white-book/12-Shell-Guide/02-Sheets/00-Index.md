# Sheets/Jobs 完整索引

> Source: [src/stackflow/activities/sheets/](https://github.com/BioforestChain/KeyApp/tree/main/src/stackflow/activities/sheets)

## 概览

Sheets (也称 Jobs) 是底部弹出的模态页面，共 **27 个**。

---

## 按功能分类

### 💰 钱包操作

| Job | 文件 | 路由 | 参数 |
|-----|------|------|------|
| WalletAddJob | `WalletAddJob.tsx` | `/job/wallet-add` | - |
| WalletListJob | `WalletListJob.tsx` | `/job/wallet-list` | - |
| WalletPickerJob | `WalletPickerJob.tsx` | `/job/wallet-picker` | `onSelect?` |
| WalletRenameJob | `WalletRenameJob.tsx` | `/job/wallet-rename/:walletId` | `walletId` |
| WalletDeleteJob | `WalletDeleteJob.tsx` | `/job/wallet-delete/:walletId` | `walletId` |
| WalletLockConfirmJob | `WalletLockConfirmJob.tsx` | `/job/wallet-lock-confirm` | - |

### ⛓️ 链选择

| Job | 文件 | 路由 | 参数 |
|-----|------|------|------|
| ChainSelectorJob | `ChainSelectorJob.tsx` | `/job/chain-selector` | `selectedChains?, onSelect` |
| ChainSwitchConfirmJob | `ChainSwitchConfirmJob.tsx` | `/job/chain-switch-confirm` | `fromChain, toChain` |

### 💸 转账确认

| Job | 文件 | 路由 | 参数 |
|-----|------|------|------|
| TransferConfirmJob | `TransferConfirmJob.tsx` | `/job/transfer-confirm` | `transfer: TransferParams` |
| TransferWalletLockJob | `TransferWalletLockJob.tsx` | `/job/transfer-wallet-lock` | `onUnlock` |
| FeeEditJob | `FeeEditJob.tsx` | `/job/fee-edit` | `fee, onConfirm` |
| SigningConfirmJob | `SigningConfirmJob.tsx` | `/job/signing-confirm` | `message, onSign` |

### 📷 扫码

| Job | 文件 | 路由 | 描述 |
|-----|------|------|------|
| ScannerJob | `ScannerJob.tsx` | `/job/scanner` | 底部扫码弹窗 |

**辅助文件**: `scanner-validators.ts` - 扫码结果验证器

### 📒 联系人

| Job | 文件 | 路由 | 参数 |
|-----|------|------|------|
| ContactEditJob | `ContactEditJob.tsx` | `/job/contact-edit` | `contact?, onSave` |
| ContactPickerJob | `ContactPickerJob.tsx` | `/job/contact-picker` | `chainId?, onSelect` |
| ContactAddConfirmJob | `ContactAddConfirmJob.tsx` | `/job/contact-add-confirm` | `address, chainId` |
| ContactShareJob | `ContactShareJob.tsx` | `/job/contact-share` | `contact` |

### 🔐 安全设置

| Job | 文件 | 路由 | 参数 |
|-----|------|------|------|
| MnemonicOptionsJob | `MnemonicOptionsJob.tsx` | `/job/mnemonic-options` | - |
| SecurityWarningJob | `SecurityWarningJob.tsx` | `/job/security-warning` | `warningType, onConfirm` |
| SetTwoStepSecretJob | `SetTwoStepSecretJob.tsx` | `/job/set-two-step-secret` | `onSet` |
| TwoStepSecretConfirmJob | `TwoStepSecretConfirmJob.tsx` | `/job/two-step-secret-confirm` | `onConfirm` |
| ClearDataConfirmJob | `ClearDataConfirmJob.tsx` | `/job/clear-data-confirm` | `onConfirm` |

### 📱 小程序授权

| Job | 文件 | 路由 | 参数 |
|-----|------|------|------|
| PermissionRequestJob | `PermissionRequestJob.tsx` | `/job/permission-request` | `appId, permissions` |
| MiniappTransferConfirmJob | `MiniappTransferConfirmJob.tsx` | `/job/miniapp-transfer-confirm` | `appId, transfer` |
| MiniappSignTransactionJob | `MiniappSignTransactionJob.tsx` | `/job/miniapp-sign-transaction` | `appId, transaction` |

---

## Job 通用结构

```tsx
// 典型 Job 结构
import { ActivityComponentType } from '@stackflow/react';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';

interface Props {
  // 路由参数
}

const MyJob: ActivityComponentType<Props> = ({ params }) => {
  const { pop } = useFlow();
  
  return (
    <Sheet open onOpenChange={() => pop()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>标题</SheetTitle>
        </SheetHeader>
        {/* 内容 */}
      </SheetContent>
    </Sheet>
  );
};

export { MyJob };
```

---

## 核心 Job 详解

### TransferConfirmJob

**功能**: 转账最终确认页

```tsx
interface TransferConfirmJobProps {
  transfer: {
    from: string;
    to: string;
    amount: Amount;
    chainId: string;
    tokenAddress?: string;
    fee: Fee;
  };
}

// 显示内容:
// - 发送方/接收方地址
// - 金额 + 法币价值
// - 手续费
// - 总计
// - 确认/取消按钮
// - 生物识别/密码验证
```

### ChainSelectorJob

**功能**: 多链选择器

```tsx
interface ChainSelectorJobProps {
  selectedChains?: string[];
  onSelect: (chainIds: string[]) => void;
}

// 使用 ChainSelector 组件
// 支持多选
// 按链类型分组
```

### MiniappTransferConfirmJob

**功能**: 小程序发起的转账确认

```tsx
interface MiniappTransferConfirmJobProps {
  appId: string;          // 请求方小程序
  transfer: TransferParams;
}

// 额外显示:
// - 发起方应用信息
// - 权限说明
// - 风险提示
```

---

## 导航调用示例

```typescript
import { useFlow } from '@/stackflow';

function SendPage() {
  const { push } = useFlow();
  
  // 打开手续费编辑
  const editFee = () => {
    push('FeeEditJob', {
      fee: currentFee,
      onConfirm: (newFee) => setFee(newFee),
    });
  };
  
  // 打开转账确认
  const confirmTransfer = () => {
    push('TransferConfirmJob', {
      transfer: {
        from: selectedAddress,
        to: recipientAddress,
        amount: sendAmount,
        chainId: selectedChain,
        fee: selectedFee,
      },
    });
  };
  
  // 打开联系人选择
  const pickContact = () => {
    push('ContactPickerJob', {
      chainId: selectedChain,
      onSelect: (contact) => setRecipient(contact.address),
    });
  };
}
```

---

## 相关文档

- [Navigation Map](../00-Navigation-Map.md)
- [Activities](../01-Activities/00-Index.md)
- [Transfer Components](../../03-UI-Ref/04-Domain/02-Transaction-Transfer.md)
