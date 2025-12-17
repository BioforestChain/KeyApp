import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationCenterPage } from './index'
import { notificationStore, notificationActions, type Notification } from '@/stores/notification'
import { TestI18nProvider } from '@/test/i18n-mock'

// Mock router
const mockNavigate = vi.fn()
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: vi.fn() }),
  useActivityParams: () => ({}),
}))

// Test notifications
const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'transaction',
    title: '交易成功',
    message: '您的转账已确认',
    timestamp: Date.now(),
    read: false,
  },
  {
    id: 'n2',
    type: 'security',
    title: '安全提醒',
    message: '检测到新设备登录',
    timestamp: Date.now() - 86400000, // Yesterday
    read: true,
  },
  {
    id: 'n3',
    type: 'system',
    title: '系统通知',
    message: '应用已更新',
    timestamp: Date.now() - 3600000, // 1 hour ago
    read: false,
  },
]

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('NotificationCenterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.removeItem('bfm_notifications')
    notificationActions.clearAll()
  })

  describe('Empty State', () => {
    it('renders page header', () => {
      renderWithProviders(<NotificationCenterPage />)
      expect(screen.getByText('通知中心')).toBeInTheDocument()
    })

    it('shows empty state when no notifications', () => {
      renderWithProviders(<NotificationCenterPage />)
      expect(screen.getByText('暂无通知')).toBeInTheDocument()
      expect(screen.getByText('您的所有通知都会显示在这里')).toBeInTheDocument()
    })

    it('shows no unread message', () => {
      renderWithProviders(<NotificationCenterPage />)
      expect(screen.getByText('没有未读通知')).toBeInTheDocument()
    })
  })

  describe('With Notifications', () => {
    beforeEach(() => {
      // Add mock notifications
      mockNotifications.forEach((n) => {
        notificationStore.setState((state) => ({
          ...state,
          notifications: [...state.notifications, n],
          unreadCount: state.unreadCount + (n.read ? 0 : 1),
          isInitialized: true,
        }))
      })
    })

    it('displays notification list', () => {
      renderWithProviders(<NotificationCenterPage />)
      expect(screen.getByText('交易成功')).toBeInTheDocument()
      expect(screen.getByText('安全提醒')).toBeInTheDocument()
      expect(screen.getByText('系统通知')).toBeInTheDocument()
    })

    it('displays notification messages', () => {
      renderWithProviders(<NotificationCenterPage />)
      expect(screen.getByText('您的转账已确认')).toBeInTheDocument()
      expect(screen.getByText('检测到新设备登录')).toBeInTheDocument()
      expect(screen.getByText('应用已更新')).toBeInTheDocument()
    })

    it('shows unread count', () => {
      renderWithProviders(<NotificationCenterPage />)
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('条未读')).toBeInTheDocument()
    })

    it('shows mark all read button when unread exists', () => {
      renderWithProviders(<NotificationCenterPage />)
      expect(screen.getByText('全部已读')).toBeInTheDocument()
    })

    it('marks notification as read when clicked', async () => {
      renderWithProviders(<NotificationCenterPage />)

      // Click on unread notification
      const notification = screen.getByText('交易成功').closest('div[class*="cursor-pointer"]')
      expect(notification).toBeInTheDocument()
      if (notification) {
        await userEvent.click(notification)
      }

      // Store should be updated
      const state = notificationStore.state
      const n1 = state.notifications.find((n) => n.id === 'n1')
      expect(n1?.read).toBe(true)
    })

    it('removes notification when delete clicked', async () => {
      renderWithProviders(<NotificationCenterPage />)

      // Find delete buttons
      const deleteButtons = screen.getAllByLabelText('删除')
      expect(deleteButtons.length).toBeGreaterThan(0)

      // Click first delete button
      await userEvent.click(deleteButtons[0]!)

      // Should have one less notification
      const state = notificationStore.state
      expect(state.notifications.length).toBe(2)
    })

    it('marks all as read when button clicked', async () => {
      renderWithProviders(<NotificationCenterPage />)

      const markAllButton = screen.getByText('全部已读')
      await userEvent.click(markAllButton)

      const state = notificationStore.state
      expect(state.unreadCount).toBe(0)
      expect(state.notifications.every((n) => n.read)).toBe(true)
    })

    it('clears all when clear button clicked', async () => {
      renderWithProviders(<NotificationCenterPage />)

      const clearButton = screen.getByText('清空')
      await userEvent.click(clearButton)

      const state = notificationStore.state
      expect(state.notifications).toHaveLength(0)
    })
  })

  describe('Navigation', () => {
    it('navigates back when back button is clicked', async () => {
      renderWithProviders(<NotificationCenterPage />)

      const backButton = screen.getByRole('button', { name: /返回/i })
      await userEvent.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })

  describe('Date Grouping', () => {
    it('groups notifications by date', () => {
      // Add notifications with different dates
      notificationStore.setState(() => ({
        notifications: mockNotifications,
        unreadCount: 2,
        isInitialized: true,
      }))

      renderWithProviders(<NotificationCenterPage />)
      expect(screen.getByText('今天')).toBeInTheDocument()
      expect(screen.getByText('昨天')).toBeInTheDocument()
    })
  })
})
