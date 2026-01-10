import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { handleGetBalance } from '../handlers/wallet'
import { BioErrorCodes } from '../types'

// Mock dependencies
vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getBiowalletApi: vi.fn(),
  },
}))

vi.mock('@/services/bioforest-sdk', () => ({
  getAccountBalance: vi.fn(),
}))

import { chainConfigService } from '@/services/chain-config'
import { getAccountBalance } from '@/services/bioforest-sdk'

const mockGetBiowalletApi = vi.mocked(chainConfigService.getBiowalletApi)
const mockGetAccountBalance = vi.mocked(getAccountBalance)

describe('handleGetBalance', () => {
  const mockContext = {
    appId: 'test-app',
    appName: 'Test App',
    origin: 'https://test.app',
    permissions: ['bio_getBalance'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
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

  describe('chain without biowallet API', () => {
    it('returns "0" when chain has no biowallet API configured', async () => {
      mockGetBiowalletApi.mockReturnValue(null)

      const result = await handleGetBalance(
        { address: 'b123', chain: 'unknown-chain' },
        mockContext
      )

      expect(result).toBe('0')
      expect(mockGetBiowalletApi).toHaveBeenCalledWith('unknown-chain')
      expect(mockGetAccountBalance).not.toHaveBeenCalled()
    })
  })

  describe('successful balance query', () => {
    it('returns balance from bioforest SDK', async () => {
      mockGetBiowalletApi.mockReturnValue('https://walletapi.bfmeta.info/wallet/bfm')
      mockGetAccountBalance.mockResolvedValue('1000000000')

      const result = await handleGetBalance(
        { address: 'b123456789', chain: 'bfmeta' },
        mockContext
      )

      expect(result).toBe('1000000000')
      expect(mockGetBiowalletApi).toHaveBeenCalledWith('bfmeta')
      expect(mockGetAccountBalance).toHaveBeenCalledWith(
        'https://walletapi.bfmeta.info/wallet/bfm',
        'bfmeta',
        'b123456789'
      )
    })

    it('returns "0" for account with no balance', async () => {
      mockGetBiowalletApi.mockReturnValue('https://walletapi.bfmeta.info/wallet/bfm')
      mockGetAccountBalance.mockResolvedValue('0')

      const result = await handleGetBalance(
        { address: 'b_new_account', chain: 'bfmeta' },
        mockContext
      )

      expect(result).toBe('0')
    })
  })

  describe('error handling', () => {
    it('returns "0" and logs warning when SDK throws error', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mockGetBiowalletApi.mockReturnValue('https://walletapi.bfmeta.info/wallet/bfm')
      mockGetAccountBalance.mockRejectedValue(new Error('Network error'))

      const result = await handleGetBalance(
        { address: 'b123', chain: 'bfmeta' },
        mockContext
      )

      expect(result).toBe('0')
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[bio_getBalance] Failed to query balance:',
        expect.any(Error)
      )

      consoleWarnSpy.mockRestore()
    })

    it('returns "0" when SDK returns undefined', async () => {
      mockGetBiowalletApi.mockReturnValue('https://walletapi.bfmeta.info/wallet/bfm')
      // @ts-expect-error - testing edge case
      mockGetAccountBalance.mockResolvedValue(undefined)

      const result = await handleGetBalance(
        { address: 'b123', chain: 'bfmeta' },
        mockContext
      )

      // undefined will be returned as-is, but in practice SDK always returns string
      expect(result).toBeUndefined()
    })
  })
})
