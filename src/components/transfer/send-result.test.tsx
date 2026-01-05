import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SendResult } from './send-result'
import { TestI18nProvider } from '@/test/i18n-mock'

// Mock clipboard service
const { mockClipboardWrite } = vi.hoisted(() => ({
  mockClipboardWrite: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/services/clipboard', () => ({
  clipboardService: {
    write: mockClipboardWrite,
    read: vi.fn().mockResolvedValue(''),
  },
}))

// 包装组件以提供 i18n
function renderWithProvider(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('SendResult', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const defaultProps = {
    status: 'success' as const,
    amount: '100',
    symbol: 'USDT',
    toAddress: '0x1234567890abcdef1234567890abcdef12345678',
  }

  describe('Success state', () => {
    it('shows success title and icon', () => {
      renderWithProvider(<SendResult {...defaultProps} />)
      expect(screen.getByText('转账成功')).toBeInTheDocument()
    })

    it('displays amount and symbol', () => {
      renderWithProvider(<SendResult {...defaultProps} />)
      expect(screen.getByText('100 USDT')).toBeInTheDocument()
    })

    it('displays truncated recipient address', () => {
      renderWithProvider(<SendResult {...defaultProps} />)
      expect(screen.getByText(/发送至/)).toBeInTheDocument()
      expect(screen.getByText(/0x123456.*5678/)).toBeInTheDocument()
    })

    it('shows transaction hash when provided', () => {
      const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      renderWithProvider(<SendResult {...defaultProps} txHash={txHash} />)
      expect(screen.getByText('交易哈希:')).toBeInTheDocument()
      expect(screen.getByText(/0xabcdef12.*67890/)).toBeInTheDocument()
    })

    it('copies hash to clipboard', async () => {
      mockClipboardWrite.mockClear()
      const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      renderWithProvider(<SendResult {...defaultProps} txHash={txHash} />)

      const hashButton = screen.getByText(/0xabcdef12.*67890/)
      await userEvent.click(hashButton)

      expect(mockClipboardWrite).toHaveBeenCalledWith({ text: txHash })
    })

    it('shows view explorer button when callback provided', () => {
      const onViewExplorer = vi.fn()
      renderWithProvider(<SendResult {...defaultProps} onViewExplorer={onViewExplorer} />)
      expect(screen.getByText('在浏览器中查看')).toBeInTheDocument()
    })

    it('calls onViewExplorer when clicked', async () => {
      const onViewExplorer = vi.fn()
      renderWithProvider(<SendResult {...defaultProps} onViewExplorer={onViewExplorer} />)

      await userEvent.click(screen.getByText('在浏览器中查看'))
      expect(onViewExplorer).toHaveBeenCalled()
    })

    it('shows done button', () => {
      renderWithProvider(<SendResult {...defaultProps} />)
      expect(screen.getByText('完成')).toBeInTheDocument()
    })

    it('calls onDone when done clicked', async () => {
      const onDone = vi.fn()
      renderWithProvider(<SendResult {...defaultProps} onDone={onDone} />)

      await userEvent.click(screen.getByText('完成'))
      expect(onDone).toHaveBeenCalled()
    })
  })

  describe('Failed state', () => {
    const failedProps = {
      ...defaultProps,
      status: 'failed' as const,
    }

    it('shows failure title', () => {
      renderWithProvider(<SendResult {...failedProps} />)
      expect(screen.getByText('转账失败')).toBeInTheDocument()
    })

    it('displays error message when provided', () => {
      renderWithProvider(<SendResult {...failedProps} errorMessage="余额不足" />)
      expect(screen.getByText('余额不足')).toBeInTheDocument()
    })

    it('shows retry button when callback provided', () => {
      const onRetry = vi.fn()
      renderWithProvider(<SendResult {...failedProps} onRetry={onRetry} />)
      expect(screen.getByText('重试')).toBeInTheDocument()
    })

    it('calls onRetry when clicked', async () => {
      const onRetry = vi.fn()
      renderWithProvider(<SendResult {...failedProps} onRetry={onRetry} />)

      await userEvent.click(screen.getByText('重试'))
      expect(onRetry).toHaveBeenCalled()
    })

    it('shows back button instead of done', () => {
      renderWithProvider(<SendResult {...failedProps} />)
      expect(screen.getByText('返回')).toBeInTheDocument()
      expect(screen.queryByText('完成')).not.toBeInTheDocument()
    })

    it('does not show view explorer button', () => {
      const onViewExplorer = vi.fn()
      renderWithProvider(<SendResult {...failedProps} onViewExplorer={onViewExplorer} />)
      expect(screen.queryByText('在浏览器中查看')).not.toBeInTheDocument()
    })
  })

  describe('Pending state', () => {
    const pendingProps = {
      ...defaultProps,
      status: 'pending' as const,
    }

    it('shows pending title', () => {
      renderWithProvider(<SendResult {...pendingProps} />)
      expect(screen.getByText('处理中...')).toBeInTheDocument()
    })

    it('shows transaction status indicator', () => {
      renderWithProvider(<SendResult {...pendingProps} />)
      // TransactionStatus uses English labels
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })

    it('shows done button', () => {
      renderWithProvider(<SendResult {...pendingProps} />)
      expect(screen.getByText('完成')).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('handles short address without truncation', () => {
      renderWithProvider(<SendResult {...defaultProps} toAddress="0x1234" />)
      expect(screen.getByText('发送至')).toBeInTheDocument()
      expect(screen.getByLabelText('0x1234')).toBeInTheDocument()
    })

    it('handles short tx hash without truncation', () => {
      renderWithProvider(<SendResult {...defaultProps} txHash="0x123456789012345678" />)
      expect(screen.getByTitle('0x123456789012345678')).toBeInTheDocument()
    })
  })
})
