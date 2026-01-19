import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BioErrorCodes } from '../types'

describe('handleGetBalance', () => {
  const mockContext = {
    appId: 'test-app',
    appName: 'Test App',
    origin: 'https://test.app',
    permissions: ['bio_getBalance'],
  }

  let handleGetBalance: typeof import('../handlers/wallet').handleGetBalance
  let mockFetch: ReturnType<typeof vi.fn>
  let mockGetChainProvider: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    // Reset modules for clean state
    vi.resetModules()
    
    // Create fresh mocks
    mockFetch = vi.fn()
    mockGetChainProvider = vi.fn(() => ({
      nativeBalance: {
        fetch: mockFetch,
      },
    }))
    
    // Mock chain-adapter/providers (the actual import path used by handler)
    vi.doMock('@/services/chain-adapter/providers', () => ({
      getChainProvider: mockGetChainProvider,
    }))
    
    // Now import the handler module
    const walletModule = await import('../handlers/wallet')
    handleGetBalance = walletModule.handleGetBalance
  })

  afterEach(() => {
    vi.doUnmock('@/services/chain-adapter/providers')
  })

  describe('parameter validation', () => {
    it('throws INVALID_PARAMS when address is missing', async () => {
      await expect(handleGetBalance({ chain: 'bfmeta' }, mockContext)).rejects.toMatchObject({
        message: 'Missing address or chain',
        code: BioErrorCodes.INVALID_PARAMS,
      })
    })

    it('throws INVALID_PARAMS when chain is missing', async () => {
      await expect(handleGetBalance({ address: 'b123' }, mockContext)).rejects.toMatchObject({
        message: 'Missing address or chain',
        code: BioErrorCodes.INVALID_PARAMS,
      })
    })

    it('throws INVALID_PARAMS when params is undefined', async () => {
      await expect(handleGetBalance(undefined, mockContext)).rejects.toMatchObject({
        message: 'Missing address or chain',
        code: BioErrorCodes.INVALID_PARAMS,
      })
    })

    it('throws INVALID_PARAMS when params is empty object', async () => {
      await expect(handleGetBalance({}, mockContext)).rejects.toMatchObject({
        message: 'Missing address or chain',
        code: BioErrorCodes.INVALID_PARAMS,
      })
    })
  })

  describe('successful balance query', () => {
    it('returns balance from chain provider', async () => {
      mockFetch.mockResolvedValue({
        amount: { toRawString: () => '1000000000' },
      })

      const result = await handleGetBalance(
        { address: 'b123456789', chain: 'bfmeta' },
        mockContext
      )

      expect(result).toBe('1000000000')
      expect(mockGetChainProvider).toHaveBeenCalledWith('bfmeta')
      expect(mockFetch).toHaveBeenCalledWith({ address: 'b123456789' })
    })

    it('returns "0" for account with no balance', async () => {
      mockFetch.mockResolvedValue({
        amount: { toRawString: () => '0' },
      })

      const result = await handleGetBalance(
        { address: 'b_new_account', chain: 'bfmeta' },
        mockContext
      )

      expect(result).toBe('0')
    })

    it('returns "0" when balance is null', async () => {
      mockFetch.mockResolvedValue(null)

      const result = await handleGetBalance(
        { address: 'b123', chain: 'bfmeta' },
        mockContext
      )

      expect(result).toBe('0')
    })
  })

  describe('error handling', () => {
    it('returns "0" when provider throws error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await handleGetBalance(
        { address: 'b123', chain: 'bfmeta' },
        mockContext
      )

      expect(result).toBe('0')
    })

    it('returns "0" when amount is undefined', async () => {
      mockFetch.mockResolvedValue({ amount: undefined })

      const result = await handleGetBalance(
        { address: 'b123', chain: 'bfmeta' },
        mockContext
      )

      expect(result).toBe('0')
    })
  })

  describe('different chains', () => {
    it('works with ethereum chain', async () => {
      mockFetch.mockResolvedValue({
        amount: { toRawString: () => '5000000000000000000' },
      })

      const result = await handleGetBalance(
        { address: '0x1234567890abcdef', chain: 'ethereum' },
        mockContext
      )

      expect(result).toBe('5000000000000000000')
      expect(mockGetChainProvider).toHaveBeenCalledWith('ethereum')
    })

    it('works with tron chain', async () => {
      mockFetch.mockResolvedValue({
        amount: { toRawString: () => '100000000' },
      })

      const result = await handleGetBalance(
        { address: 'TXyz123', chain: 'tron' },
        mockContext
      )

      expect(result).toBe('100000000')
      expect(mockGetChainProvider).toHaveBeenCalledWith('tron')
    })
  })
})
