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

const mockEthereum = {
  request: vi.fn(),
}

describe('Forge App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(window as unknown as { bio: typeof mockBio }).bio = mockBio

    mockBio.request.mockImplementation(({ method }: { method: string }) => {
      if (method === 'bio_closeSplashScreen') return Promise.resolve(null)
      if (method === 'bio_selectAccount') return Promise.resolve({ address: 'bfmeta123', chain: 'bfmeta' })
      return Promise.resolve(null)
    })

    // Default EVM provider mock (ETH in test config)
    ;(window as unknown as { ethereum: typeof mockEthereum }).ethereum = mockEthereum
    mockEthereum.request.mockImplementation(({ method }: { method: string }) => {
      if (method === 'eth_requestAccounts') return Promise.resolve(['0xexternal123'])
      return Promise.resolve(null)
    })
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
      expect(screen.getByTestId('connect-button')).toBeInTheDocument()
    })

    // Ensure option auto-selected and button enabled
    await waitFor(() => {
      expect(screen.getByTestId('connect-button')).not.toBeDisabled()
    })

    fireEvent.click(screen.getByTestId('connect-button'))

    await waitFor(() => {
      expect(screen.getByTestId('connect-button')).toHaveTextContent('连接中...')
    })
  })

  it('should proceed to swap step after selecting wallet', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('connect-button')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByTestId('connect-button')).not.toBeDisabled()
    })

    fireEvent.click(screen.getByTestId('connect-button'))

    await waitFor(() => {
      expect(screen.getByText(/支付/)).toBeInTheDocument()
    })
  })

  it('should show error when bio SDK not initialized', async () => {
    ;(window as unknown as { bio: undefined }).bio = undefined

    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('connect-button')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByTestId('connect-button')).not.toBeDisabled()
    })

    fireEvent.click(screen.getByTestId('connect-button'))

    await waitFor(() => {
      expect(screen.getByText('Bio SDK 未初始化')).toBeInTheDocument()
    })
  })

  it('should show error when connection fails', async () => {
    mockBio.request.mockImplementation(({ method }: { method: string }) => {
      if (method === 'bio_closeSplashScreen') return Promise.resolve(null)
      return Promise.reject(new Error('Connection failed'))
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('connect-button')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByTestId('connect-button')).not.toBeDisabled()
    })

    fireEvent.click(screen.getByTestId('connect-button'))

    await waitFor(() => {
      expect(screen.getByText('Connection failed')).toBeInTheDocument()
    })
  })

  it('should call bio_selectAccount on connect', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('connect-button')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByTestId('connect-button')).not.toBeDisabled()
    })

    fireEvent.click(screen.getByTestId('connect-button'))

    await waitFor(() => {
      // Should call bio_selectAccount at least once (internal account)
      expect(mockBio.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'bio_selectAccount',
        })
      )
    })
  })
})
