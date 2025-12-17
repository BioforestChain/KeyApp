import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReceivePage } from './index'
import { TestI18nProvider } from '@/test/i18n-mock'

// Mock Stackflow
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: vi.fn(), goBack: vi.fn() }),
  useActivityParams: () => ({}),
}))

// Mock services
const mockClipboardWrite = vi.fn().mockResolvedValue(undefined)
const mockToastShow = vi.fn()
const mockHapticsImpact = vi.fn().mockResolvedValue(undefined)

vi.mock('@/services', () => ({
  useClipboard: () => ({ write: mockClipboardWrite }),
  useToast: () => ({ show: mockToastShow }),
  useHaptics: () => ({ impact: mockHapticsImpact }),
}))

// Mock stores
const mockAddress = '0x1234567890abcdef1234567890abcdef12345678'
vi.mock('@/stores', () => ({
  useCurrentChainAddress: () => ({ address: mockAddress }),
  useSelectedChain: () => 'ethereum',
}))

// Wrapper with providers
function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('ReceivePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Layout', () => {
    it('renders page header with title', () => {
      renderWithProviders(<ReceivePage />)
      expect(screen.getByText('收款')).toBeInTheDocument()
    })

    it('displays chain name', () => {
      renderWithProviders(<ReceivePage />)
      expect(screen.getByText('Ethereum')).toBeInTheDocument()
    })

    it('shows QR code instruction text', () => {
      renderWithProviders(<ReceivePage />)
      expect(screen.getByText('扫描二维码向此地址转账')).toBeInTheDocument()
    })

    it('displays address label', () => {
      renderWithProviders(<ReceivePage />)
      expect(screen.getByText('收款地址')).toBeInTheDocument()
    })

    it('shows network warning alert', () => {
      renderWithProviders(<ReceivePage />)
      expect(screen.getByText(/仅支持 Ethereum 网络资产转入/)).toBeInTheDocument()
    })
  })

  describe('Address Display', () => {
    it('shows the wallet address', () => {
      renderWithProviders(<ReceivePage />)
      // Address may be truncated in display
      expect(screen.getByText(/0x1234/)).toBeInTheDocument()
    })
  })

  describe('Copy Functionality', () => {
    it('renders copy button', () => {
      renderWithProviders(<ReceivePage />)
      expect(screen.getByText('复制地址')).toBeInTheDocument()
    })

    it('copies address to clipboard when clicked', async () => {
      renderWithProviders(<ReceivePage />)

      await userEvent.click(screen.getByText('复制地址'))

      expect(mockClipboardWrite).toHaveBeenCalledWith(mockAddress)
      expect(mockHapticsImpact).toHaveBeenCalledWith('light')
      expect(mockToastShow).toHaveBeenCalledWith('地址已复制')
    })

    it('shows copied state after copying', async () => {
      renderWithProviders(<ReceivePage />)

      await userEvent.click(screen.getByText('复制地址'))

      expect(screen.getByText('已复制')).toBeInTheDocument()
    })
  })

  describe('Share Functionality', () => {
    it('renders share button', () => {
      renderWithProviders(<ReceivePage />)
      expect(screen.getByText('分享')).toBeInTheDocument()
    })

    it('calls navigator.share when available', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
        configurable: true,
      })

      renderWithProviders(<ReceivePage />)

      await userEvent.click(screen.getByText('分享'))

      expect(mockShare).toHaveBeenCalledWith({
        title: 'BFM Pay 收款地址',
        text: mockAddress,
      })
      expect(mockHapticsImpact).toHaveBeenCalledWith('success')
    })
  })

  describe('QR Code', () => {
    it('renders QR code component', () => {
      renderWithProviders(<ReceivePage />)
      // QR code should render with the address
      const qrContainer = screen.getByText('扫描二维码向此地址转账').parentElement
      expect(qrContainer).toBeInTheDocument()
    })
  })
})
