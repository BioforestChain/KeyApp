import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  mockWalletStorageInitialize: vi.fn(),
  mockGetWalletChainAddresses: vi.fn(),
  mockInitializeChainConfigs: vi.fn(),
  mockGetEnabledChains: vi.fn(),
  mockGetChainById: vi.fn(),
  mockCreateBioforestAdapter: vi.fn(),
  mockGetTransactionHistory: vi.fn(),
  mockGetChainProvider: vi.fn(),
}))

vi.mock('@/services/wallet-storage', () => ({
  walletStorageService: {
    initialize: mocks.mockWalletStorageInitialize,
    getWalletChainAddresses: mocks.mockGetWalletChainAddresses,
  },
}))

vi.mock('@/services/chain-config', () => ({
  initialize: mocks.mockInitializeChainConfigs,
  getEnabledChains: mocks.mockGetEnabledChains,
  getChainById: mocks.mockGetChainById,
}))

vi.mock('@/services/chain-adapter', () => ({
  createBioforestAdapter: mocks.mockCreateBioforestAdapter,
}))

vi.mock('@/services/chain-adapter/providers', () => ({
  getChainProvider: mocks.mockGetChainProvider,
}))

import { transactionService } from './web'

describe('transactionService(web)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads EVM history via ChainProvider.getTransactionHistory', async () => {
    mocks.mockWalletStorageInitialize.mockResolvedValue(undefined)
    mocks.mockGetWalletChainAddresses.mockResolvedValue([
      {
        chain: 'ethereum',
        address: '0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa',
      },
    ])

    mocks.mockInitializeChainConfigs.mockResolvedValue({})

    const ethereumConfig = {
      id: 'ethereum',
      enabled: true,
      type: 'evm',
      symbol: 'ETH',
      decimals: 18,
    }
    mocks.mockGetEnabledChains.mockReturnValue([ethereumConfig])
    mocks.mockGetChainById.mockReturnValue(null)

    mocks.mockGetChainProvider.mockReturnValue({
      supportsTransactionHistory: true,
      getTransactionHistory: mocks.mockGetTransactionHistory,
    })

    mocks.mockGetTransactionHistory.mockResolvedValue([
      {
        hash: '0xdeadbeef',
        from: '0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa',
        to: '0xBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb',
        value: '1000000000000000000',
        symbol: 'ETH',
        timestamp: 1_700_000_000_000,
        status: 'confirmed',
        blockNumber: 123n,
      },
    ])

    const records = await transactionService.getHistory({
      walletId: 'w1',
      filter: { chain: 'ethereum', period: 'all', type: 'all', status: 'all' } as any,
    })

    expect(records).toHaveLength(1)
    expect(records[0]?.id).toBe('ethereum--0xdeadbeef')
    expect(records[0]?.chain).toBe('ethereum')
    expect(records[0]?.type).toBe('send')
    expect(records[0]?.status).toBe('confirmed')
    expect(records[0]?.amount.toRawString()).toBe('1000000000000000000')
    expect(records[0]?.blockNumber).toBe(123)

    const cached = await transactionService.getTransaction({ id: 'ethereum--0xdeadbeef' })
    expect(cached?.id).toBe('ethereum--0xdeadbeef')
  })
})
