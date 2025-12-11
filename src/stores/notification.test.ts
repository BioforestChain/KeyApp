import { describe, it, expect, beforeEach } from 'vitest'
import {
  notificationStore,
  notificationActions,
  notificationSelectors,
  type Notification,
} from './notification'

describe('NotificationStore', () => {
  beforeEach(() => {
    localStorage.removeItem('bfm_notifications')
    notificationActions.clearAll()
  })

  describe('add', () => {
    it('adds a new notification', () => {
      const notification = notificationActions.add({
        type: 'transaction',
        title: '交易成功',
        message: '您的转账已确认',
      })

      expect(notification.id).toBeDefined()
      expect(notification.title).toBe('交易成功')
      expect(notification.read).toBe(false)
      expect(notification.timestamp).toBeDefined()

      const state = notificationStore.state
      expect(state.notifications).toHaveLength(1)
      expect(state.unreadCount).toBe(1)
    })

    it('adds notification with data', () => {
      const notification = notificationActions.add({
        type: 'transaction',
        title: '交易成功',
        message: '您的转账已确认',
        data: { txHash: '0x123', status: 'success' },
      })

      expect(notification.data?.txHash).toBe('0x123')
      expect(notification.data?.status).toBe('success')
    })

    it('prepends new notifications (newest first)', () => {
      notificationActions.add({ type: 'system', title: '通知1', message: '消息1' })
      notificationActions.add({ type: 'system', title: '通知2', message: '消息2' })

      const state = notificationStore.state
      // Safe: we just added 2 notifications
      expect(state.notifications[0]!.title).toBe('通知2')
      expect(state.notifications[1]!.title).toBe('通知1')
    })
  })

  describe('markRead', () => {
    it('marks a notification as read', () => {
      const notification = notificationActions.add({
        type: 'transaction',
        title: '交易成功',
        message: '您的转账已确认',
      })

      expect(notificationStore.state.unreadCount).toBe(1)

      notificationActions.markRead(notification.id)

      const state = notificationStore.state
      // Safe: we just added 1 notification
      expect(state.notifications[0]!.read).toBe(true)
      expect(state.unreadCount).toBe(0)
    })
  })

  describe('markAllRead', () => {
    it('marks all notifications as read', () => {
      notificationActions.add({ type: 'system', title: '通知1', message: '消息1' })
      notificationActions.add({ type: 'system', title: '通知2', message: '消息2' })

      expect(notificationStore.state.unreadCount).toBe(2)

      notificationActions.markAllRead()

      const state = notificationStore.state
      expect(state.notifications.every((n) => n.read)).toBe(true)
      expect(state.unreadCount).toBe(0)
    })
  })

  describe('initialize', () => {
    it('loads notifications from localStorage', () => {
      notificationActions.clearAll()

      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'system',
          title: '欢迎',
          message: '欢迎使用',
          timestamp: Date.now(),
          read: false,
        },
      ]
      localStorage.setItem('bfm_notifications', JSON.stringify(mockNotifications))

      notificationActions.initialize()

      const state = notificationStore.state
      expect(state.notifications).toHaveLength(1)
      // Safe: length is already checked
      expect(state.notifications[0]!.title).toBe('欢迎')
      expect(state.unreadCount).toBe(1)
      expect(state.isInitialized).toBe(true)
    })
  })

  describe('selectors', () => {
    it('getUnread returns only unread notifications', () => {
      const n1 = notificationActions.add({ type: 'system', title: '通知1', message: '消息1' })
      notificationActions.add({ type: 'system', title: '通知2', message: '消息2' })
      notificationActions.markRead(n1.id)

      const unread = notificationSelectors.getUnread(notificationStore.state)
      expect(unread).toHaveLength(1)
      // Safe: length is already checked
      expect(unread[0]!.title).toBe('通知2')
    })

    it('getByType filters by notification type', () => {
      notificationActions.add({ type: 'transaction', title: '交易', message: '交易消息' })
      notificationActions.add({ type: 'security', title: '安全', message: '安全消息' })
      notificationActions.add({ type: 'system', title: '系统', message: '系统消息' })

      const transactions = notificationSelectors.getByType(notificationStore.state, 'transaction')
      expect(transactions).toHaveLength(1)
      // Safe: length is already checked
      expect(transactions[0]!.title).toBe('交易')
    })
  })
})
