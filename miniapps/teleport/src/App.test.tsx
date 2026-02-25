import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { getTransmitAssetTypeList, transmit } from './api/client'

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
  getTransmitRecordDetail: vi.fn().mockResolvedValue({}),
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
      expect(screen.getByRole('button', { name: '启动 ETH 传送门' })).toBeInTheDocument()
    })
  })

  it('should show loading state when connecting', async () => {
    mockBio.request.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ address: '0x123', chain: 'bioforest' }), 1000))
    )

    render(<App />, { wrapper: createWrapper() })

    // Wait for the button to be ready
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动 ETH 传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动 ETH 传送门' }))

    expect(screen.getByRole('button', { name: '连接 ETH 中...' })).toBeInTheDocument()
  })

  it('should proceed to select-asset after connecting', async () => {
    mockBio.request.mockImplementation(({ method, params }: { method: string; params?: Array<{ chain?: string }> }) => {
      if (method === 'bio_selectAccount') {
        return Promise.resolve({ address: '0x123', chain: params?.[0]?.chain ?? 'ETH' })
      }
      return Promise.resolve(null)
    })

    render(<App />, { wrapper: createWrapper() })

    // Wait for the button to be ready
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动 ETH 传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动 ETH 传送门' }))

    await waitFor(() => {
      expect(screen.getByText('选择资产')).toBeInTheDocument()
    })
  })

  it('should show error when bio SDK not initialized', async () => {
    ;(window as unknown as { bio: undefined }).bio = undefined

    render(<App />, { wrapper: createWrapper() })

    // Wait for the button to be ready
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动 ETH 传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动 ETH 传送门' }))

    await waitFor(() => {
      expect(screen.getByText('Bio SDK 未初始化')).toBeInTheDocument()
    })
  })

  it('should show error when connection fails', async () => {
    mockBio.request.mockRejectedValue(new Error('Network error'))

    render(<App />, { wrapper: createWrapper() })

    // Wait for the button to be ready
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动 ETH 传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动 ETH 传送门' }))

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('should call bio_selectAccount on connect', async () => {
    mockBio.request.mockImplementation(({ method, params }: { method: string; params?: Array<{ chain?: string }> }) => {
      if (method === 'bio_selectAccount') {
        return Promise.resolve({ address: '0x123', chain: params?.[0]?.chain ?? 'ETH' })
      }
      return Promise.resolve(null)
    })

    render(<App />, { wrapper: createWrapper() })

    // Wait for the button to be ready
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动 ETH 传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动 ETH 传送门' }))

    await waitFor(() => {
      expect(mockBio.request).toHaveBeenCalledWith({
        method: 'bio_selectAccount',
        params: [{ chain: 'ETH' }],
      })
    })
  })

  it('should render per-asset available balance instead of reusing native balance', async () => {
    const mockedGetTransmitAssetTypeList = vi.mocked(getTransmitAssetTypeList)
    mockedGetTransmitAssetTypeList.mockResolvedValueOnce({
      transmitSupport: {
        BFCHAINV2: {
          BFT: {
            enable: true,
            isAirdrop: false,
            assetType: 'BFT',
            recipientAddress: 'bReceiver',
            targetChain: 'BFMETAV2',
            targetAsset: 'BFM',
            ratio: { numerator: 10, denominator: 104 },
            transmitDate: {
              startDate: '2020-01-01',
              endDate: '2030-12-31',
            },
          },
          NBT: {
            enable: true,
            isAirdrop: false,
            assetType: 'NBT',
            recipientAddress: 'bReceiver',
            targetChain: 'BFMETAV2',
            targetAsset: 'BFM',
            ratio: { numerator: 2, denominator: 100 },
            transmitDate: {
              startDate: '2020-01-01',
              endDate: '2030-12-31',
            },
          },
        },
      },
    })

    mockBio.request.mockImplementation(({ method, params }: { method: string; params?: Array<{ chain?: string; asset?: string }> }) => {
      if (method === 'bio_selectAccount') {
        return Promise.resolve({ address: 'bSource', chain: params?.[0]?.chain ?? 'BFCHAINV2', name: 'Source' })
      }
      if (method === 'bio_getBalance') {
        const asset = params?.[0]?.asset
        if (asset === 'BFT') return Promise.resolve('10251002641395')
        if (asset === 'NBT') return Promise.resolve('0')
        return Promise.resolve('0')
      }
      if (method === 'bio_closeSplashScreen') {
        return Promise.resolve(null)
      }
      return Promise.resolve(null)
    })

    render(<App />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动 BFCHAINV2 传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动 BFCHAINV2 传送门' }))

    await waitFor(() => {
      expect(screen.getByTestId('asset-card-BFT')).toBeInTheDocument()
      expect(screen.getByTestId('asset-card-NBT')).toBeInTheDocument()
    })

    expect(screen.getByText(/102,510\.02641395 BFT 可用/)).toBeInTheDocument()
    expect(screen.getByText(/0 NBT 可用/)).toBeInTheDocument()
  })

  it('should not exclude source address when selecting cross-chain target wallet', async () => {
    mockBio.request.mockImplementation(({ method, params }: { method: string; params?: Array<{ chain?: string }> }) => {
      if (method === 'bio_selectAccount') {
        return Promise.resolve({ address: '0x123', chain: params?.[0]?.chain ?? 'ETH', name: 'Source' })
      }
      if (method === 'bio_getBalance') {
        return Promise.resolve('100000000')
      }
      if (method === 'bio_pickWallet') {
        return Promise.resolve({ address: '0xabc', chain: 'BFMCHAIN', name: 'Target' })
      }
      if (method === 'bio_closeSplashScreen') {
        return Promise.resolve(null)
      }
      return Promise.resolve(null)
    })

    render(<App />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动 ETH 传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动 ETH 传送门' }))

    await waitFor(() => {
      expect(screen.getByTestId('asset-card-ETH')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('asset-card-ETH'))
    await waitFor(() => {
      expect(screen.getByTestId('amount-input')).toBeInTheDocument()
    })
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '1' } })
    fireEvent.click(screen.getByTestId('next-button'))
    await waitFor(() => {
      expect(screen.getByTestId('target-button')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('target-button'))

    await waitFor(() => {
      expect(mockBio.request).toHaveBeenCalledWith({
        method: 'bio_pickWallet',
        params: [{ chain: 'BFMCHAIN' }],
      })
    })
  })

  it('should show sender/receiver addresses on confirm step and remove free-fee badge', async () => {
    mockBio.request.mockImplementation(({ method, params }: { method: string; params?: Array<{ chain?: string }> }) => {
      if (method === 'bio_selectAccount') {
        return Promise.resolve({ address: '0xSourceAddr', chain: params?.[0]?.chain ?? 'ETH', name: 'Source' })
      }
      if (method === 'bio_getBalance') {
        return Promise.resolve('100000000')
      }
      if (method === 'bio_pickWallet') {
        return Promise.resolve({ address: '0xTargetAddr', chain: 'BFMCHAIN', name: 'Target' })
      }
      if (method === 'bio_closeSplashScreen') {
        return Promise.resolve(null)
      }
      return Promise.resolve(null)
    })

    render(<App />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动 ETH 传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动 ETH 传送门' }))

    await waitFor(() => {
      expect(screen.getByTestId('asset-card-ETH')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('asset-card-ETH'))
    await waitFor(() => {
      expect(screen.getByTestId('amount-input')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '1' } })
    fireEvent.click(screen.getByTestId('next-button'))

    await waitFor(() => {
      expect(screen.getByTestId('target-button')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('target-button'))

    await waitFor(() => {
      expect(screen.getByText('0xSourceAddr')).toBeInTheDocument()
      expect(screen.getByText('0xTargetAddr')).toBeInTheDocument()
    })

    expect(screen.queryByText('免费')).not.toBeInTheDocument()
  })

  it('should accept internal signed transaction payload and submit transmit', async () => {
    const mockedGetTransmitAssetTypeList = vi.mocked(getTransmitAssetTypeList)
    mockedGetTransmitAssetTypeList.mockResolvedValueOnce({
      transmitSupport: {
        BFMCHAIN: {
          BFM: {
            enable: true,
            isAirdrop: false,
            assetType: 'BFM',
            recipientAddress: 'bReceiver',
            targetChain: 'BFMETAV2',
            targetAsset: 'BFM',
            ratio: { numerator: 1, denominator: 1 },
            transmitDate: {
              startDate: '2020-01-01',
              endDate: '2030-12-31',
            },
          },
        },
      },
    })

    const mockedTransmit = vi.mocked(transmit)
    mockedTransmit.mockResolvedValue({
      orderId: 'order-1',
    })

    mockBio.request.mockImplementation(
      ({ method, params }: { method: string; params?: Array<{ chain?: string }> }) => {
        if (method === 'bio_selectAccount') {
          return Promise.resolve({ address: 'bSource', chain: 'bfmeta', name: 'Source' })
        }
        if (method === 'bio_getBalance') {
          return Promise.resolve('100000000')
        }
        if (method === 'bio_pickWallet') {
          return Promise.resolve({ address: 'bTarget', chain: 'BFMETAV2', name: 'Target' })
        }
        if (method === 'bio_createTransaction') {
          return Promise.resolve({ chainId: 'bfmeta', data: { unsigned: true } })
        }
        if (method === 'bio_signTransaction') {
          return Promise.resolve({
            chainId: 'bfmeta',
            signature: 'sig',
            data: {
              type: 'BSE-01',
              senderId: 'bSource',
              recipientId: 'bRecipient',
              timestamp: 1,
              fee: '100000',
              signature: 'tx-signature',
                asset: {
                  transferAsset: {
                    amount: '100000000',
                    assetType: 'BFM',
                  },
                },
              },
          })
        }
        if (method === 'bio_closeSplashScreen') {
          return Promise.resolve(null)
        }
        return Promise.resolve(null)
      },
    )

    render(<App />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动 BFMCHAIN 传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动 BFMCHAIN 传送门' }))

    await waitFor(() => {
      expect(screen.getByTestId('asset-card-BFM')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('asset-card-BFM'))

    await waitFor(() => {
      expect(screen.getByTestId('amount-input')).toBeInTheDocument()
    })
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '1' } })

    fireEvent.click(screen.getByTestId('next-button'))

    await waitFor(() => {
      expect(screen.getByTestId('target-button')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('target-button'))

    await waitFor(() => {
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('confirm-button'))

    await waitFor(() => {
      expect(mockedTransmit).toHaveBeenCalledTimes(1)
      expect(mockedTransmit).toHaveBeenCalledWith(
        expect.objectContaining({
          fromTrJson: expect.objectContaining({
            bcf: expect.objectContaining({
              chainName: 'BFMCHAIN',
              trJson: expect.objectContaining({
                asset: expect.objectContaining({
                  transferAsset: expect.objectContaining({
                    amount: '100000000',
                    assetType: 'BFM',
                  }),
                }),
              }),
            }),
          }),
        }),
      )
    })
  })

  it('should submit BSC rawTx as signTransData for external transmit', async () => {
    const mockedGetTransmitAssetTypeList = vi.mocked(getTransmitAssetTypeList)
    mockedGetTransmitAssetTypeList.mockResolvedValueOnce({
      transmitSupport: {
        BSC: {
          USDT: {
            enable: true,
            isAirdrop: false,
            assetType: 'USDT',
            recipientAddress: '0xReceiver',
            targetChain: 'BFMETAV2',
            targetAsset: 'BFM',
            ratio: { numerator: 1, denominator: 1 },
            transmitDate: {
              startDate: '2020-01-01',
              endDate: '2030-12-31',
            },
          },
        },
      },
    })

    const mockedTransmit = vi.mocked(transmit)
    mockedTransmit.mockResolvedValue({
      orderId: 'order-bsc-1',
    })

    mockBio.request.mockImplementation(
      ({ method, params }: { method: string; params?: Array<{ chain?: string }> }) => {
        if (method === 'bio_selectAccount') {
          return Promise.resolve({ address: '0xSourceBsc', chain: params?.[0]?.chain ?? 'BSC', name: 'Source' })
        }
        if (method === 'bio_getBalance') {
          return Promise.resolve('1000000000')
        }
        if (method === 'bio_pickWallet') {
          return Promise.resolve({ address: 'bTarget', chain: 'BFMETAV2', name: 'Target' })
        }
        if (method === 'bio_createTransaction') {
          return Promise.resolve({ chainId: 'bsc', data: { unsigned: true } })
        }
        if (method === 'bio_signTransaction') {
          return Promise.resolve({
            chainId: 'bsc',
            data: {
              rawTx: '0xbscRawTxHex',
              detail: { nonce: '1' },
            },
          })
        }
        if (method === 'bio_closeSplashScreen') {
          return Promise.resolve(null)
        }
        return Promise.resolve(null)
      },
    )

    render(<App />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '启动 BSC 传送门' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '启动 BSC 传送门' }))

    await waitFor(() => {
      expect(screen.getByTestId('asset-card-USDT')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('asset-card-USDT'))

    await waitFor(() => {
      expect(screen.getByTestId('amount-input')).toBeInTheDocument()
    })
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '10' } })

    fireEvent.click(screen.getByTestId('next-button'))

    await waitFor(() => {
      expect(screen.getByTestId('target-button')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('target-button'))

    await waitFor(() => {
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('confirm-button'))

    await waitFor(() => {
      expect(mockedTransmit).toHaveBeenCalledTimes(1)
      expect(mockedTransmit).toHaveBeenCalledWith(
        expect.objectContaining({
          fromTrJson: expect.objectContaining({
            bsc: expect.objectContaining({
              signTransData: '0xbscRawTxHex',
            }),
          }),
        }),
      )
    })
  })
})
