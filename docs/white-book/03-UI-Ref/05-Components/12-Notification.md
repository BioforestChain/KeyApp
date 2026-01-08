# Notification 组件

> 源码: [`src/components/notification/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/notification/)

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| `NotificationPermissionSheet` | `notification-permission-sheet.tsx` | 通知权限请求 |
| `TransactionToast` | `transaction-toast.tsx` | 交易通知 Toast |

---

## NotificationPermissionSheet

通知权限请求底部弹窗。

### Props

```typescript
interface NotificationPermissionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAllow: () => void
  onDeny: () => void
}
```

### 内容

- 解释通知用途
- 提供允许/拒绝选项

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ 🔔 开启通知                                │
│                                             │
│ 开启通知以接收:                             │
│ • 交易状态更新                              │
│ • 安全提醒                                  │
│ • 重要公告                                  │
│                                             │
│ [允许]                                      │
│ [稍后再说]                                  │
└─────────────────────────────────────────────┘
```

---

## TransactionToast

交易状态通知 Toast。

### Props

```typescript
interface TransactionToastProps {
  type: 'pending' | 'success' | 'failed'
  title: string
  message?: string
  txHash?: string
  explorerUrl?: string
  onClose?: () => void
  duration?: number
  className?: string
}
```

### 状态样式

| 类型 | 图标 | 颜色 |
|------|------|------|
| `pending` | 🔄 | 蓝色 |
| `success` | ✓ | 绿色 |
| `failed` | ✗ | 红色 |

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ ✓ 发送成功                            [✗] │
│   1.5 ETH 已发送到 0x742d...               │
│   [查看详情]                               │
└─────────────────────────────────────────────┘
```

### 使用示例

```tsx
// 显示交易 Toast
showTransactionToast({
  type: 'success',
  title: '发送成功',
  message: '1.5 ETH 已发送到 Alice',
  txHash: '0x...',
  explorerUrl: 'https://etherscan.io/tx/0x...',
})

// 或作为组件使用
<TransactionToast
  type="pending"
  title="交易确认中"
  message="预计 30 秒内确认"
  duration={0}  // 不自动关闭
/>
```
