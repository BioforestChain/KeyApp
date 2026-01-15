import { Store } from '@tanstack/react-store'

// 通知类型
export type NotificationType = 'transaction' | 'security' | 'system'

// 通知状态（用于交易通知）
export type NotificationStatus = 'pending' | 'success' | 'failed'

// 通知数据结构
export interface Notification {
  id: string
  /** 通知类型 */
  type: NotificationType
  /** 标题 */
  title: string
  /** 消息内容 */
  message: string
  /** 创建时间 */
  timestamp: number
  /** 是否已读 */
  read: boolean
  /** 附加数据（如交易哈希、钱包ID等） */
  data?: {
    txHash?: string
    walletId?: string
    status?: NotificationStatus
    [key: string]: unknown
  }
}

export interface NotificationState {
  notifications: Notification[]
  /** 未读数量 */
  unreadCount: number
  isInitialized: boolean
}

// 初始状态
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isInitialized: false,
}

// 创建 Store
export const notificationStore = new Store<NotificationState>(initialState)

// 持久化键
const STORAGE_KEY = 'bfm_notifications'

// 持久化辅助函数
function persistNotifications(notifications: Notification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  } catch (error) {
    
  }
}

// 计算未读数量
function calcUnreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => !n.read).length
}

// Actions
export const notificationActions = {
  /** 初始化（从存储加载） */
  initialize: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const notifications = JSON.parse(stored) as Notification[]
        notificationStore.setState(() => ({
          notifications,
          unreadCount: calcUnreadCount(notifications),
          isInitialized: true,
        }))
      } else {
        notificationStore.setState((state) => ({
          ...state,
          isInitialized: true,
        }))
      }
    } catch (error) {
      
      notificationStore.setState((state) => ({
        ...state,
        isInitialized: true,
      }))
    }
  },

  /** 添加通知 */
  add: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      read: false,
    }

    notificationStore.setState((state) => {
      const notifications = [newNotification, ...state.notifications]
      persistNotifications(notifications)
      return {
        ...state,
        notifications,
        unreadCount: calcUnreadCount(notifications),
      }
    })

    return newNotification
  },

  /** 标记为已读 */
  markRead: (id: string) => {
    notificationStore.setState((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      persistNotifications(notifications)
      return {
        ...state,
        notifications,
        unreadCount: calcUnreadCount(notifications),
      }
    })
  },

  /** 标记全部已读 */
  markAllRead: () => {
    notificationStore.setState((state) => {
      const notifications = state.notifications.map((n) => ({ ...n, read: true }))
      persistNotifications(notifications)
      return {
        ...state,
        notifications,
        unreadCount: 0,
      }
    })
  },

  /** 删除通知 */
  remove: (id: string) => {
    notificationStore.setState((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id)
      persistNotifications(notifications)
      return {
        ...state,
        notifications,
        unreadCount: calcUnreadCount(notifications),
      }
    })
  },

  /** 清除所有通知 */
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY)
    notificationStore.setState(() => initialState)
  },
}

// Selectors
export const notificationSelectors = {
  /** 获取未读通知 */
  getUnread: (state: NotificationState): Notification[] => {
    return state.notifications.filter((n) => !n.read)
  },

  /** 按类型过滤 */
  getByType: (state: NotificationState, type: NotificationType): Notification[] => {
    return state.notifications.filter((n) => n.type === type)
  },

  /** 按日期分组 */
  groupByDate: (state: NotificationState): Map<string, Notification[]> => {
    const grouped = new Map<string, Notification[]>()

    for (const notification of state.notifications) {
      const date = new Date(notification.timestamp).toLocaleDateString('zh-CN')
      const existing = grouped.get(date) || []
      grouped.set(date, [...existing, notification])
    }

    return grouped
  },
}
