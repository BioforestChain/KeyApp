import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

// Initialize i18n before tests
import './i18n'

// Mock the API module
vi.mock('@/api', () => ({
  rechargeApi: {
    getSupport: vi.fn().mockResolvedValue({
      recharge: {
        bfmeta: {
          BFM: {
            enable: true,
            chainName: 'bfmeta',
            assetType: 'BFM',
            applyAddress: 'b0000000000000000000000000000000000000000',
            supportChain: {
              ETH: {
                enable: true,
                assetType: 'ETH',
                depositAddress: '0x1234567890123456789012345678901234567890',
              },
            },
          },
        },
      },
    }),
    submitRecharge: vi.fn(),
  },
}))

// Mock bio SDK
const mockBio = {
  request: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  isConnected: vi.fn(() => true),
}

describe('Forge App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(window as unknown as { bio: typeof mockBio }).bio = mockBio
  })

  it('should render initial connect step after config loads', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('多链熔炉')).toBeInTheDocument()
    })
    expect(screen.getByText(/将其他链资产锻造为/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '连接钱包' })).toBeInTheDocument()
  })

  it('should show loading state when connecting', async () => {
    mockBio.request.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ address: '0x123', chain: 'ethereum' }), 1000))
    )

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '连接钱包' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '连接中...' })).toBeInTheDocument()
    })
  })

  it('should proceed to swap step after selecting wallet', async () => {
    mockBio.request.mockResolvedValue({ address: '0x123', chain: 'ethereum' })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '连接钱包' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    await waitFor(() => {
      expect(screen.getByText(/支付/)).toBeInTheDocument()
    })
  })

  it('should show error when bio SDK not initialized', async () => {
    ;(window as unknown as { bio: undefined }).bio = undefined

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '连接钱包' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    await waitFor(() => {
      expect(screen.getByText('Bio SDK 未初始化')).toBeInTheDocument()
    })
  })

  it('should show error when connection fails', async () => {
    mockBio.request.mockRejectedValue(new Error('Connection failed'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '连接钱包' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    await waitFor(() => {
      expect(screen.getByText('Connection failed')).toBeInTheDocument()
    })
  })

  it('should call bio_selectAccount on connect', async () => {
    mockBio.request.mockResolvedValue({ address: '0x123', chain: 'eth' })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '连接钱包' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    await waitFor(() => {
      // Should call bio_selectAccount at least once (for external and internal accounts)
      expect(mockBio.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'bio_selectAccount',
        })
      )
    })
  })
})
