import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDuplicateDetection, checkDuplicates } from './use-duplicate-detection'
import type { IWalletQuery, WalletAddressInfo, MainWalletInfo } from '@/services/wallet/types'
import { deriveKey } from '@/lib/crypto/derivation'

// Test mnemonic (from BIP39 test vectors - never use in production)
const TEST_MNEMONIC = [
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'about',
]

// Different mnemonic for "existing" wallet tests
const EXISTING_MNEMONIC = [
  'zoo',
  'zoo',
  'zoo',
  'zoo',
  'zoo',
  'zoo',
  'zoo',
  'zoo',
  'zoo',
  'zoo',
  'zoo',
  'wrong',
]

// Create mock wallet query
function createMockWalletQuery(options?: {
  addresses?: WalletAddressInfo[]
  wallets?: MainWalletInfo[]
}): IWalletQuery {
  const addresses = options?.addresses ?? []
  const wallets = options?.wallets ?? []

  return {
    getAllAddresses: vi.fn().mockResolvedValue(addresses),
    getAllMainWallets: vi.fn().mockResolvedValue(wallets),
    findWalletByAddress: vi.fn().mockImplementation(async (addr: string) => {
      return wallets.find((w) => w.addresses.some((a) => a.address === addr)) ?? null
    }),
  }
}

describe('useDuplicateDetection', () => {
  it('initializes with no duplicate', () => {
    const query = createMockWalletQuery()
    const { result } = renderHook(() => useDuplicateDetection(query))

    expect(result.current.result.isDuplicate).toBe(false)
    expect(result.current.result.type).toBe('none')
    expect(result.current.isChecking).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('detects no duplicate for new mnemonic', async () => {
    const query = createMockWalletQuery()
    const { result } = renderHook(() => useDuplicateDetection(query))

    let checkResult: Awaited<ReturnType<typeof result.current.check>>

    await act(async () => {
      checkResult = await result.current.check(TEST_MNEMONIC)
    })

    expect(result.current.result.isDuplicate).toBe(false)
    expect(result.current.result.type).toBe('none')
  })

  it('detects Level 1: simple address duplicate', async () => {
    // Derive address from test mnemonic
    const derivedKey = deriveKey(TEST_MNEMONIC.join(' '), 'ethereum')

    const query = createMockWalletQuery({
      addresses: [
        {
          chain: 'ethereum',
          address: derivedKey.address,
          walletId: 'existing-wallet-1',
          walletName: 'My Wallet',
        },
      ],
    })

    const { result } = renderHook(() => useDuplicateDetection(query))

    await act(async () => {
      await result.current.check(TEST_MNEMONIC)
    })

    expect(result.current.result.isDuplicate).toBe(true)
    expect(result.current.result.type).toBe('address')
    expect(result.current.result.matchedWallet?.name).toBe('My Wallet')
  })

  it('detects Level 3: private key collision', async () => {
    // Derive address from test mnemonic
    const derivedKey = deriveKey(TEST_MNEMONIC.join(' '), 'ethereum')

    // Simulate a private key imported wallet with same address
    const pkWallet: MainWalletInfo = {
      id: 'pk-wallet-1',
      name: 'PK Wallet',
      importType: 'privateKey',
      skipBackup: true,
      addresses: [
        {
          chain: 'ethereum',
          address: derivedKey.address,
          walletId: 'pk-wallet-1',
          walletName: 'PK Wallet',
        },
      ],
      createdAt: Date.now(),
    }

    const query = createMockWalletQuery({
      addresses: [], // Not in regular addresses
      wallets: [pkWallet],
    })

    const { result } = renderHook(() => useDuplicateDetection(query))

    await act(async () => {
      await result.current.check(TEST_MNEMONIC)
    })

    expect(result.current.result.isDuplicate).toBe(true)
    expect(result.current.result.type).toBe('privateKey')
    expect(result.current.result.matchedWallet?.name).toBe('PK Wallet')
    expect(result.current.result.matchedWallet?.importType).toBe('privateKey')
  })

  it('handles case-insensitive address comparison', async () => {
    const derivedKey = deriveKey(TEST_MNEMONIC.join(' '), 'ethereum')

    // Store address in different case
    const query = createMockWalletQuery({
      addresses: [
        {
          chain: 'ethereum',
          address: derivedKey.address.toLowerCase(),
          walletId: 'existing-wallet-1',
          walletName: 'My Wallet',
        },
      ],
    })

    const { result } = renderHook(() => useDuplicateDetection(query))

    await act(async () => {
      await result.current.check(TEST_MNEMONIC)
    })

    expect(result.current.result.isDuplicate).toBe(true)
  })

  it('resets state correctly', async () => {
    const derivedKey = deriveKey(TEST_MNEMONIC.join(' '), 'ethereum')

    const query = createMockWalletQuery({
      addresses: [
        {
          chain: 'ethereum',
          address: derivedKey.address,
          walletId: 'existing-wallet-1',
          walletName: 'My Wallet',
        },
      ],
    })

    const { result } = renderHook(() => useDuplicateDetection(query))

    await act(async () => {
      await result.current.check(TEST_MNEMONIC)
    })

    expect(result.current.result.isDuplicate).toBe(true)

    act(() => {
      result.current.reset()
    })

    expect(result.current.result.isDuplicate).toBe(false)
    expect(result.current.result.type).toBe('none')
  })

  it('handles errors gracefully', async () => {
    const query: IWalletQuery = {
      getAllAddresses: vi.fn().mockRejectedValue(new Error('Storage error')),
      getAllMainWallets: vi.fn().mockResolvedValue([]),
      findWalletByAddress: vi.fn().mockResolvedValue(null),
    }

    const { result } = renderHook(() => useDuplicateDetection(query))

    await act(async () => {
      await result.current.check(TEST_MNEMONIC)
    })

    expect(result.current.error).toBe('Storage error')
    expect(result.current.result.isDuplicate).toBe(false)
  })
})

describe('checkDuplicates', () => {
  it('returns no duplicate for new mnemonic', async () => {
    const query = createMockWalletQuery()
    const result = await checkDuplicates(TEST_MNEMONIC, query)

    expect(result.isDuplicate).toBe(false)
    expect(result.type).toBe('none')
  })

  it('returns duplicate info for existing address', async () => {
    const derivedKey = deriveKey(TEST_MNEMONIC.join(' '), 'bfmeta')

    const query = createMockWalletQuery({
      addresses: [
        {
          chain: 'bfmeta',
          address: derivedKey.address,
          walletId: 'bfm-wallet',
          walletName: 'BFM Wallet',
        },
      ],
    })

    const result = await checkDuplicates(TEST_MNEMONIC, query)

    expect(result.isDuplicate).toBe(true)
    expect(result.type).toBe('address')
    expect(result.matchedWallet?.matchedAddress).toBeDefined()
  })

  it('checks all Bitcoin addresses', async () => {
    // Use Bitcoin purpose 84 (native segwit) address
    const derivedKey = deriveKey(TEST_MNEMONIC.join(' '), 'bitcoin')

    const query = createMockWalletQuery({
      addresses: [
        {
          chain: 'bitcoin',
          address: derivedKey.address,
          walletId: 'btc-wallet',
          walletName: 'BTC Wallet',
        },
      ],
    })

    const result = await checkDuplicates(TEST_MNEMONIC, query)

    expect(result.isDuplicate).toBe(true)
  })
})
