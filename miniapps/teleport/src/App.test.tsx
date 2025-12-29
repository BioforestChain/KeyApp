import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

// Mock the API client
vi.mock('./api/client', () => ({
  getTransmitAssetTypeList: vi.fn().mockResolvedValue({
    transmitSupport: {
      ETH: {
        ETH: {
          enable: true,
          isAirdrop: false,
          assetType: 'ETH',
          recipientAddress: '0x123',
          targetChain: 'BFMCHAIN',
          targetAsset: 'BFM',
          ratio: { numerator: 1, denominator: 1 },
          transmitDate: {
            startDate: '2020-01-01',
            endDate: '2030-12-31',
          },
        },
      },
    },
  }),
  transmit: vi.fn(),
  getTransmitRecords: vi.fn(),
  getTransmitRecordDetail: vi.fn(),
}))

// Mock bio SDK
const mockBio = {
  request: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  isConnected: vi.fn(() => true),
}

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('Teleport App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(window as unknown as { bio: typeof mockBio }).bio = mockBio
  })

  it('should render initial connect step', async () => {
    render(<App />, { wrapper: createWrapper() })

    expect(screen.getByText('一键传送')).toBeInTheDocument()
    expect(screen.getByText('跨钱包传送')).toBeInTheDocument()
    
    // Wait for the button to change from loading to ready
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动传送门' })).toBeInTheDocument()
    })
  })

  it('should show loading state when connecting', async () => {
    mockBio.request.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ address: '0x123', chain: 'bioforest' }), 1000))
    )

    render(<App />, { wrapper: createWrapper() })

    // Wait for the button to be ready
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动传送门' }))

    expect(screen.getByRole('button', { name: '连接中...' })).toBeInTheDocument()
  })

  it('should proceed to select-asset after connecting', async () => {
    mockBio.request.mockResolvedValue({ address: '0x123', chain: 'ETH' })

    render(<App />, { wrapper: createWrapper() })

    // Wait for the button to be ready
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动传送门' }))

    await waitFor(() => {
      expect(screen.getByText('选择资产')).toBeInTheDocument()
    })
  })

  it('should show error when bio SDK not initialized', async () => {
    ;(window as unknown as { bio: undefined }).bio = undefined

    render(<App />, { wrapper: createWrapper() })

    // Wait for the button to be ready
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动传送门' }))

    await waitFor(() => {
      expect(screen.getByText('Bio SDK 未初始化')).toBeInTheDocument()
    })
  })

  it('should show error when connection fails', async () => {
    mockBio.request.mockRejectedValue(new Error('Network error'))

    render(<App />, { wrapper: createWrapper() })

    // Wait for the button to be ready
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动传送门' }))

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('should call bio_selectAccount on connect', async () => {
    mockBio.request.mockResolvedValue({ address: '0x123', chain: 'ETH' })

    render(<App />, { wrapper: createWrapper() })

    // Wait for the button to be ready
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动传送门' }))

    await waitFor(() => {
      expect(mockBio.request).toHaveBeenCalledWith({
        method: 'bio_selectAccount',
        params: [{}],
      })
    })
  })
})
