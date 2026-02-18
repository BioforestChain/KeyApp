import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGetMnemonic } = vi.hoisted(() => ({
  mockGetMnemonic: vi.fn(),
}))

vi.mock('@/services/wallet-storage', () => ({
  walletStorageService: {
    getMnemonic: mockGetMnemonic,
  },
}))

import { verifyCryptoAuthorizePattern } from '../crypto-authorize-pattern'

describe('verifyCryptoAuthorizePattern', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns false when walletId is missing', async () => {
    const result = await verifyCryptoAuthorizePattern(undefined, '0-1-2-5-8')
    expect(result).toBe(false)
    expect(mockGetMnemonic).not.toHaveBeenCalled()
  })

  it('validates pattern against target wallet only', async () => {
    mockGetMnemonic.mockResolvedValueOnce('mnemonic')

    const result = await verifyCryptoAuthorizePattern('wallet-target', '0-1-2-5-8')

    expect(result).toBe(true)
    expect(mockGetMnemonic).toHaveBeenCalledTimes(1)
    expect(mockGetMnemonic).toHaveBeenCalledWith('wallet-target', '0-1-2-5-8')
  })

  it('returns false when target wallet pattern is invalid', async () => {
    mockGetMnemonic.mockRejectedValueOnce(new Error('Failed to decrypt mnemonic'))

    const result = await verifyCryptoAuthorizePattern('wallet-target', '0-1-2-5-8')

    expect(result).toBe(false)
    expect(mockGetMnemonic).toHaveBeenCalledTimes(1)
    expect(mockGetMnemonic).toHaveBeenCalledWith('wallet-target', '0-1-2-5-8')
  })
})
