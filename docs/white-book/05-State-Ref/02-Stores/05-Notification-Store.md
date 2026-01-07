# Notification Store

> 源码: [`src/stores/notification.ts`](https://github.com/AInewsAPP/KeyApp/blob/main/src/stores/notification.ts)

## 概述

Notification Store 管理应用内通知：交易状态、安全提醒、系统消息。支持未读计数、按类型过滤、按日期分组。

## 数据结构

```typescript
type NotificationType = 'transaction' | 'security' | 'system'
type NotificationStatus = 'pending' | 'success' | 'failed'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: number
  read: boolean
  data?: {
    txHash?: string
    walletId?: string
    status?: NotificationStatus
    [key: string]: unknown
  }
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isInitialized: boolean
}
```

## Actions

```typescript
import { notificationActions } from '@/stores/notification'

// 初始化
notificationActions.initialize()

// 添加通知
const notification = notificationActions.add({
  type: 'transaction',
  title: '转账成功',
  message: '已发送 1.5 ETH 到 0x...',
  data: { txHash: '0x...', status: 'success' },
})

// 标记已读
notificationActions.markRead(id)

// 全部已读
notificationActions.markAllRead()

// 删除通知
notificationActions.remove(id)

// 清除所有
notificationActions.clearAll()
```

## Selectors

```typescript
import { notificationSelectors, notificationStore } from '@/stores/notification'
import { useStore } from '@tanstack/react-store'

function useNotifications() {
  const state = useStore(notificationStore)
  
  // 获取未读通知
  const unread = notificationSelectors.getUnread(state)
  
  // 按类型过滤
  const txNotifications = notificationSelectors.getByType(state, 'transaction')
  
  // 按日期分组
  const grouped = notificationSelectors.groupByDate(state)
  // Map<'2024/1/15', Notification[]>
}
```

## 通知类型

| 类型 | 场景 | 示例 |
|------|------|------|
| `transaction` | 交易状态变化 | 转账成功、转账失败、确认中 |
| `security` | 安全相关 | 登录提醒、密码修改 |
| `system` | 系统消息 | 版本更新、公告 |

## 使用示例

### 交易通知

```typescript
// 交易广播时
notificationActions.add({
  type: 'transaction',
  title: '交易已提交',
  message: '正在等待网络确认...',
  data: { txHash, walletId, status: 'pending' },
})

// 交易确认后
notificationActions.add({
  type: 'transaction',
  title: '转账成功',
  message: `已发送 ${amount} ${symbol}`,
  data: { txHash, walletId, status: 'success' },
})
```

### 通知中心 UI

```typescript
function NotificationCenter() {
  const { notifications, unreadCount } = useStore(notificationStore)
  const grouped = notificationSelectors.groupByDate({ notifications, unreadCount, isInitialized: true })
  
  return (
    <div>
      <Badge count={unreadCount} />
      {Array.from(grouped.entries()).map(([date, items]) => (
        <section key={date}>
          <h3>{date}</h3>
          {items.map(n => <NotificationItem key={n.id} notification={n} />)}
        </section>
      ))}
    </div>
  )
}
```

## 持久化

| Key | 存储位置 |
|-----|---------|
| `bfm_notifications` | localStorage |

```typescript
// 存储格式（Notification[] 数组）
[
  {
    "id": "uuid",
    "type": "transaction",
    "title": "转账成功",
    "message": "...",
    "timestamp": 1705312800000,
    "read": false,
    "data": { "txHash": "0x..." }
  }
]
```

## 数据流

```
交易完成
    │
    └── notificationActions.add({ type: 'transaction', ... })
            │
            ├── 生成 id + timestamp
            ├── 更新 notifications 数组
            ├── 更新 unreadCount
            └── 持久化到 localStorage
```
