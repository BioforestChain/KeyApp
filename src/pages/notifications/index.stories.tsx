import type { Meta, StoryObj } from '@storybook/react'
import { NotificationCenterPage } from './index'
import { notificationStore, notificationActions, type Notification } from '@/stores/notification'

const meta = {
  title: 'Pages/NotificationCenter',
  component: NotificationCenterPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      // Reset store before each story
      notificationActions.clearAll()
      return <Story />
    },
  ],
} satisfies Meta<typeof NotificationCenterPage>

export default meta
type Story = StoryObj<typeof meta>

// Empty state
export const Empty: Story = {}

// With notifications
const setupNotifications = () => {
  const notifications: Notification[] = [
    {
      id: 'n1',
      type: 'transaction',
      title: '交易成功',
      message: '您向 0x1234...5678 的转账已确认',
      timestamp: Date.now() - 300000, // 5 min ago
      read: false,
      data: { txHash: '0xabc123', status: 'success' },
    },
    {
      id: 'n2',
      type: 'transaction',
      title: '收款到账',
      message: '您收到来自 0xabcd...ef12 的 100 USDT',
      timestamp: Date.now() - 3600000, // 1 hour ago
      read: false,
    },
    {
      id: 'n3',
      type: 'security',
      title: '安全提醒',
      message: '检测到新设备登录，如非本人操作请立即修改密码',
      timestamp: Date.now() - 86400000, // Yesterday
      read: true,
    },
    {
      id: 'n4',
      type: 'system',
      title: '系统更新',
      message: 'BFM Pay 已更新至最新版本',
      timestamp: Date.now() - 172800000, // 2 days ago
      read: true,
    },
  ]

  notificationStore.setState(() => ({
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    isInitialized: true,
  }))
}

export const WithNotifications: Story = {
  decorators: [
    (Story) => {
      setupNotifications()
      return <Story />
    },
  ],
}

// All read
export const AllRead: Story = {
  decorators: [
    (Story) => {
      const notifications: Notification[] = [
        {
          id: 'n1',
          type: 'transaction',
          title: '交易成功',
          message: '您向 0x1234...5678 的转账已确认',
          timestamp: Date.now() - 300000,
          read: true,
        },
        {
          id: 'n2',
          type: 'system',
          title: '系统通知',
          message: '欢迎使用 BFM Pay',
          timestamp: Date.now() - 86400000,
          read: true,
        },
      ]
      notificationStore.setState(() => ({
        notifications,
        unreadCount: 0,
        isInitialized: true,
      }))
      return <Story />
    },
  ],
}

// Many notifications (stress test)
export const ManyNotifications: Story = {
  decorators: [
    (Story) => {
      const notifications: Notification[] = Array.from({ length: 20 }, (_, i) => ({
        id: `n${i}`,
        type: (['transaction', 'security', 'system'] as const)[i % 3],
        title: `通知 ${i + 1}`,
        message: `这是第 ${i + 1} 条通知的详细内容`,
        timestamp: Date.now() - i * 3600000, // Each 1 hour apart
        read: i >= 5, // First 5 unread
      }))
      notificationStore.setState(() => ({
        notifications,
        unreadCount: 5,
        isInitialized: true,
      }))
      return <Story />
    },
  ],
}
