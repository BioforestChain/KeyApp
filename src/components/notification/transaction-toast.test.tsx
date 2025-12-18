import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionToast, ToastContainer } from './transaction-toast'
import { TestI18nProvider } from '@/test/i18n-mock'

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('TransactionToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const defaultProps = {
    id: 'toast-1',
    status: 'success' as const,
    title: '交易成功',
    onClose: vi.fn(),
  }

  describe('Rendering', () => {
    it('renders with title', () => {
      vi.useRealTimers() // Use real timers for render tests
      renderWithProviders(<TransactionToast {...defaultProps} />)
      expect(screen.getByText('交易成功')).toBeInTheDocument()
    })

    it('renders with message', () => {
      vi.useRealTimers()
      renderWithProviders(<TransactionToast {...defaultProps} message="您的转账已确认" />)
      expect(screen.getByText('您的转账已确认')).toBeInTheDocument()
    })

    it('renders with shortened tx hash', () => {
      vi.useRealTimers()
      render(
        <TransactionToast
          {...defaultProps}
          txHash="0x1234567890abcdef1234567890abcdef12345678"
        />
      )
      expect(screen.getByText('0x123456...345678')).toBeInTheDocument()
    })

    it('renders pending status with spinner', () => {
      vi.useRealTimers()
      renderWithProviders(<TransactionToast {...defaultProps} status="pending" title="交易处理中" />)
      expect(screen.getByText('交易处理中')).toBeInTheDocument()
      // Spinner has animate-spin class
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
    })

    it('renders success status', () => {
      vi.useRealTimers()
      renderWithProviders(<TransactionToast {...defaultProps} status="success" />)
      expect(screen.getByRole('alert')).toHaveClass('bg-green-50')
    })

    it('renders failed status', () => {
      vi.useRealTimers()
      renderWithProviders(<TransactionToast {...defaultProps} status="failed" title="交易失败" />)
      expect(screen.getByText('交易失败')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveClass('bg-red-50')
    })
  })

  describe('Interactions', () => {
    it('calls onClose when close button clicked', async () => {
      vi.useRealTimers()
      const onClose = vi.fn()
      renderWithProviders(<TransactionToast {...defaultProps} onClose={onClose} duration={0} />)

      const closeButton = screen.getByLabelText('关闭')
      await userEvent.click(closeButton)

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 250))
      expect(onClose).toHaveBeenCalledWith('toast-1')
    })

    it('calls onClick when toast clicked', async () => {
      vi.useRealTimers()
      const onClick = vi.fn()
      renderWithProviders(<TransactionToast {...defaultProps} onClick={onClick} duration={0} />)

      const alert = screen.getByRole('alert')
      await userEvent.click(alert)

      expect(onClick).toHaveBeenCalledWith('toast-1')
    })

    it('auto-closes after duration for success/failed', () => {
      const onClose = vi.fn()
      renderWithProviders(<TransactionToast {...defaultProps} status="success" onClose={onClose} duration={3000} />)

      expect(onClose).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      // Animation delay
      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(onClose).toHaveBeenCalledWith('toast-1')
    })

    it('does NOT auto-close for pending status', () => {
      const onClose = vi.fn()
      renderWithProviders(<TransactionToast {...defaultProps} status="pending" onClose={onClose} duration={3000} />)

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(onClose).not.toHaveBeenCalled()
    })
  })
})

describe('ToastContainer', () => {
  it('renders multiple toasts', () => {
    vi.useRealTimers()
    const toasts = [
      { id: '1', status: 'success' as const, title: 'Toast 1' },
      { id: '2', status: 'pending' as const, title: 'Toast 2' },
      { id: '3', status: 'failed' as const, title: 'Toast 3' },
    ]

    renderWithProviders(<ToastContainer toasts={toasts} onClose={vi.fn()} />)

    expect(screen.getByText('Toast 1')).toBeInTheDocument()
    expect(screen.getByText('Toast 2')).toBeInTheDocument()
    expect(screen.getByText('Toast 3')).toBeInTheDocument()
  })

  it('renders at specified position', () => {
    vi.useRealTimers()
    const toasts = [{ id: '1', status: 'success' as const, title: 'Toast 1' }]

    renderWithProviders(<ToastContainer toasts={toasts} onClose={vi.fn()} position="bottom-center" />)

    const container = screen.getByLabelText('通知')
    expect(container).toHaveClass('bottom-4')
  })
})
