/**
 * migration-service 单元测试
 *
 * 测试迁移服务的完整编排流程
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'

// Mock dependencies before importing the service
vi.mock('./mpay-reader', () => ({
  detectMpayData: vi.fn(),
  readMpayWallets: vi.fn(),
  readMpayAddresses: vi.fn(),
}))

vi.mock('./mpay-crypto', () => ({
  verifyMpayPassword: vi.fn(),
}))

vi.mock('./mpay-transformer', () => ({
  transformMpayData: vi.fn(),
}))

vi.mock('@/stores/wallet', () => ({
  walletActions: {
    importWallet: vi.fn(),
  },
}))

// Import after mocks
import { migrationService } from './migration-service'
import { detectMpayData, readMpayWallets, readMpayAddresses } from './mpay-reader'
import { verifyMpayPassword } from './mpay-crypto'
import { transformMpayData } from './mpay-transformer'
import { walletActions } from '@/stores/wallet'
import type { MpayDetectionResult, MpayMainWallet, MpayChainAddressInfo, MigrationProgress } from './types'
import type { TransformResult } from './mpay-transformer'
import type { Wallet } from '@/stores/wallet'

const MIGRATION_STATUS_KEY = 'keyapp_migration_status'

describe('migration-service', () => {
  // Mock data
  const mockDetectionResult: MpayDetectionResult = {
    hasData: true,
    walletCount: 2,
    addressCount: 4,
    hasSettings: true,
  }

  const mockWallet: MpayMainWallet = {
    mainWalletId: 'wallet-1',
    name: 'Test Wallet',
    importPhrase: 'encrypted-mnemonic-base64',
    importType: 'mnemonic',
    addressKeyList: [],
    headSculpture: '',
    createTimestamp: 1700000000000,
  }

  const mockAddress: MpayChainAddressInfo = {
    addressKey: 'addr-1',
    mainWalletId: 'wallet-1',
    chain: 'BFMeta',
    address: 'bfm123456',
    symbol: 'BFT',
    privateKey: 'encrypted-private-key',
    assets: [],
    name: 'BFMeta Address',
  }

  const mockTransformedWallet: Wallet = {
    id: 'wallet-1',
    name: 'Test Wallet',
    address: 'bfm123456',
    chain: 'bfmeta',
    chainAddresses: [
      {
        chain: 'bfmeta',
        address: 'bfm123456',
        tokens: [],
      },
    ],
    encryptedMnemonic: {
      ciphertext: 'encrypted',
      iv: 'iv',
      salt: 'salt',
      iterations: 100000,
    },
    createdAt: 1700000000000,
    tokens: [],
  }

  const mockTransformResult: TransformResult = {
    wallets: [mockTransformedWallet],
    skippedAddresses: [],
    stats: {
      totalWallets: 1,
      totalAddresses: 1,
      skippedAddresses: 0,
    },
  }

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Clear localStorage
    localStorage.clear()

    // Reset migration service state
    migrationService.reset()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('detect()', () => {
    it('should return detection result and set status to detected when hasData=true and status=idle', async () => {
      vi.mocked(detectMpayData).mockResolvedValue(mockDetectionResult)

      const result = await migrationService.detect()

      expect(result).toEqual(mockDetectionResult)
      expect(migrationService.getStatus()).toBe('detected')
      expect(localStorage.getItem(MIGRATION_STATUS_KEY)).toBe('detected')
    })

    it('should return detection result but not change status if hasData=false', async () => {
      const noDataResult: MpayDetectionResult = {
        hasData: false,
        walletCount: 0,
        addressCount: 0,
        hasSettings: false,
      }
      vi.mocked(detectMpayData).mockResolvedValue(noDataResult)

      const result = await migrationService.detect()

      expect(result).toEqual(noDataResult)
      expect(migrationService.getStatus()).toBe('idle')
    })

    it('should not change status if already not idle', async () => {
      // Set status to 'completed' first
      localStorage.setItem(MIGRATION_STATUS_KEY, 'completed')
      migrationService.reset() // This will load from localStorage then reset, so we need to set again
      localStorage.setItem(MIGRATION_STATUS_KEY, 'completed')
      // Force reload status by creating new instance behavior - we'll use skip() instead
      await migrationService.skip() // Sets to 'skipped'

      vi.mocked(detectMpayData).mockResolvedValue(mockDetectionResult)

      await migrationService.detect()

      // Status should remain 'skipped', not change to 'detected'
      expect(migrationService.getStatus()).toBe('skipped')
    })

    it('should call detectMpayData from mpay-reader', async () => {
      vi.mocked(detectMpayData).mockResolvedValue(mockDetectionResult)

      await migrationService.detect()

      expect(detectMpayData).toHaveBeenCalledTimes(1)
    })
  })

  describe('verifyPassword()', () => {
    it('should return false when no wallets exist', async () => {
      vi.mocked(readMpayWallets).mockResolvedValue([])

      const result = await migrationService.verifyPassword('password123')

      expect(result).toBe(false)
      expect(verifyMpayPassword).not.toHaveBeenCalled()
    })

    it('should return false when first wallet has no importPhrase', async () => {
      const walletWithoutPhrase: MpayMainWallet = {
        ...mockWallet,
        importPhrase: '',
      }
      vi.mocked(readMpayWallets).mockResolvedValue([walletWithoutPhrase])

      const result = await migrationService.verifyPassword('password123')

      expect(result).toBe(false)
      expect(verifyMpayPassword).not.toHaveBeenCalled()
    })

    it('should return true for correct password', async () => {
      vi.mocked(readMpayWallets).mockResolvedValue([mockWallet])
      vi.mocked(verifyMpayPassword).mockResolvedValue(true)

      const result = await migrationService.verifyPassword('correctPassword')

      expect(result).toBe(true)
      expect(verifyMpayPassword).toHaveBeenCalledWith('correctPassword', mockWallet.importPhrase)
    })

    it('should return false for wrong password', async () => {
      vi.mocked(readMpayWallets).mockResolvedValue([mockWallet])
      vi.mocked(verifyMpayPassword).mockResolvedValue(false)

      const result = await migrationService.verifyPassword('wrongPassword')

      expect(result).toBe(false)
      expect(verifyMpayPassword).toHaveBeenCalledWith('wrongPassword', mockWallet.importPhrase)
    })

    it('should increment retryCount on failure', async () => {
      vi.mocked(readMpayWallets).mockResolvedValue([mockWallet])
      vi.mocked(verifyMpayPassword).mockResolvedValue(false)

      expect(migrationService.getRemainingRetries()).toBe(3)

      await migrationService.verifyPassword('wrong1')
      expect(migrationService.getRemainingRetries()).toBe(2)

      await migrationService.verifyPassword('wrong2')
      expect(migrationService.getRemainingRetries()).toBe(1)
    })

    it('should reset retryCount on success', async () => {
      vi.mocked(readMpayWallets).mockResolvedValue([mockWallet])

      // First fail twice
      vi.mocked(verifyMpayPassword).mockResolvedValue(false)
      await migrationService.verifyPassword('wrong1')
      await migrationService.verifyPassword('wrong2')
      expect(migrationService.getRemainingRetries()).toBe(1)

      // Then succeed
      vi.mocked(verifyMpayPassword).mockResolvedValue(true)
      await migrationService.verifyPassword('correct')
      expect(migrationService.getRemainingRetries()).toBe(3)
    })

    it('should log warning after 3 failures', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      vi.mocked(readMpayWallets).mockResolvedValue([mockWallet])
      vi.mocked(verifyMpayPassword).mockResolvedValue(false)

      await migrationService.verifyPassword('wrong1')
      await migrationService.verifyPassword('wrong2')
      expect(consoleWarnSpy).not.toHaveBeenCalled()

      await migrationService.verifyPassword('wrong3')
      expect(consoleWarnSpy).toHaveBeenCalledWith('Password verification failed 3 times')

      consoleWarnSpy.mockRestore()
    })
  })

  describe('migrate()', () => {
    beforeEach(() => {
      // Setup common mocks for happy path
      vi.mocked(detectMpayData).mockResolvedValue(mockDetectionResult)
      vi.mocked(readMpayWallets).mockResolvedValue([mockWallet])
      vi.mocked(readMpayAddresses).mockResolvedValue([mockAddress])
      vi.mocked(verifyMpayPassword).mockResolvedValue(true)
      vi.mocked(transformMpayData).mockResolvedValue(mockTransformResult)
    })

    it('should complete happy path: call all steps in order and set status=completed', async () => {
      await migrationService.migrate('correctPassword')

      // Verify all steps were called
      expect(detectMpayData).toHaveBeenCalled()
      expect(verifyMpayPassword).toHaveBeenCalled()
      expect(readMpayWallets).toHaveBeenCalled()
      expect(readMpayAddresses).toHaveBeenCalled()
      expect(transformMpayData).toHaveBeenCalledWith([mockWallet], [mockAddress], 'correctPassword')
      expect(walletActions.importWallet).toHaveBeenCalled()

      // Verify final status
      expect(migrationService.getStatus()).toBe('completed')
      expect(localStorage.getItem(MIGRATION_STATUS_KEY)).toBe('completed')
    })

    it('should throw error when no mpay data found', async () => {
      vi.mocked(detectMpayData).mockResolvedValue({
        hasData: false,
        walletCount: 0,
        addressCount: 0,
        hasSettings: false,
      })

      await expect(migrationService.migrate('password')).rejects.toThrow('No mpay data found')
      expect(migrationService.getStatus()).toBe('error')
    })

    it('should throw error when password verification fails', async () => {
      vi.mocked(verifyMpayPassword).mockResolvedValue(false)

      await expect(migrationService.migrate('wrongPassword')).rejects.toThrow('Password verification failed')
      expect(migrationService.getStatus()).toBe('error')
    })

    it('should set status=error on any error', async () => {
      vi.mocked(transformMpayData).mockRejectedValue(new Error('Transform failed'))

      await expect(migrationService.migrate('password')).rejects.toThrow('Transform failed')
      expect(migrationService.getStatus()).toBe('error')
      expect(localStorage.getItem(MIGRATION_STATUS_KEY)).toBe('error')
    })

    it('should call onProgress callback with correct step/percent values', async () => {
      const progressCallback = vi.fn()

      await migrationService.migrate('correctPassword', progressCallback)

      // Verify progress callbacks were called
      expect(progressCallback).toHaveBeenCalled()

      const calls = progressCallback.mock.calls
      const steps = calls.map((call) => (call[0] as MigrationProgress).step)
      const percents = calls.map((call) => (call[0] as MigrationProgress).percent)

      // Verify step sequence
      expect(steps).toContain('detecting')
      expect(steps).toContain('verifying')
      expect(steps).toContain('reading')
      expect(steps).toContain('transforming')
      expect(steps).toContain('importing')
      expect(steps).toContain('complete')

      // Verify percent values are increasing
      expect(percents[0]).toBe(10) // detecting

      // Find complete step and verify it's 100%
      const completeCall = calls.find((call) => (call[0] as MigrationProgress).step === 'complete')
      expect((completeCall?.[0] as MigrationProgress).percent).toBe(100)
    })

    it('should call walletActions.importWallet for each transformed wallet', async () => {
      const multipleWallets: Wallet[] = [
        { ...mockTransformedWallet, id: 'wallet-1', name: 'Wallet 1' },
        { ...mockTransformedWallet, id: 'wallet-2', name: 'Wallet 2' },
        { ...mockTransformedWallet, id: 'wallet-3', name: 'Wallet 3' },
      ]

      vi.mocked(transformMpayData).mockResolvedValue({
        ...mockTransformResult,
        wallets: multipleWallets,
      })

      await migrationService.migrate('password')

      expect(walletActions.importWallet).toHaveBeenCalledTimes(3)

      // Verify each wallet was imported with correct data
      expect(walletActions.importWallet).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Wallet 1' })
      )
      expect(walletActions.importWallet).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Wallet 2' })
      )
      expect(walletActions.importWallet).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Wallet 3' })
      )
    })

    it('should pass wallet data with encryptedMnemonic when present', async () => {
      await migrationService.migrate('password')

      expect(walletActions.importWallet).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockTransformedWallet.name,
          address: mockTransformedWallet.address,
          chain: mockTransformedWallet.chain,
          chainAddresses: mockTransformedWallet.chainAddresses,
          encryptedMnemonic: mockTransformedWallet.encryptedMnemonic,
        })
      )
    })

    it('should pass wallet data without encryptedMnemonic when not present', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { encryptedMnemonic: _, ...walletWithoutMnemonic } = mockTransformedWallet

      vi.mocked(transformMpayData).mockResolvedValue({
        ...mockTransformResult,
        wallets: [walletWithoutMnemonic as Wallet],
      })

      await migrationService.migrate('password')

      const importCall = vi.mocked(walletActions.importWallet).mock.calls[0]?.[0]
      expect(importCall).not.toHaveProperty('encryptedMnemonic')
    })

    it('should set status to in_progress during migration', async () => {
      let capturedStatus: string | undefined

      vi.mocked(detectMpayData).mockImplementation(async () => {
        capturedStatus = migrationService.getStatus()
        return mockDetectionResult
      })

      await migrationService.migrate('password')

      expect(capturedStatus).toBe('in_progress')
    })

    it('should report progress with wallet counts during importing step', async () => {
      const progressCallback = vi.fn()
      const multipleWallets: Wallet[] = [
        { ...mockTransformedWallet, id: 'w1', name: 'Wallet 1' },
        { ...mockTransformedWallet, id: 'w2', name: 'Wallet 2' },
      ]

      vi.mocked(transformMpayData).mockResolvedValue({
        ...mockTransformResult,
        wallets: multipleWallets,
      })

      await migrationService.migrate('password', progressCallback)

      // Find importing step calls
      const importingCalls = progressCallback.mock.calls.filter(
        (call) => (call[0] as MigrationProgress).step === 'importing'
      )

      expect(importingCalls.length).toBeGreaterThan(0)

      // Verify totalWallets is set
      const firstImportingCall = importingCalls[0]?.[0] as MigrationProgress
      expect(firstImportingCall.totalWallets).toBe(2)
    })
  })

  describe('skip()', () => {
    it('should set status to skipped', async () => {
      await migrationService.skip()

      expect(migrationService.getStatus()).toBe('skipped')
      expect(localStorage.getItem(MIGRATION_STATUS_KEY)).toBe('skipped')
    })

    it('should persist skipped status', async () => {
      await migrationService.skip()

      // Verify localStorage was updated
      expect(localStorage.getItem(MIGRATION_STATUS_KEY)).toBe('skipped')
    })
  })

  describe('reset()', () => {
    it('should reset status to idle', async () => {
      // First set to a different status
      await migrationService.skip()
      expect(migrationService.getStatus()).toBe('skipped')

      // Then reset
      migrationService.reset()

      expect(migrationService.getStatus()).toBe('idle')
      expect(localStorage.getItem(MIGRATION_STATUS_KEY)).toBe('idle')
    })

    it('should reset retryCount to 0', async () => {
      vi.mocked(readMpayWallets).mockResolvedValue([mockWallet])
      vi.mocked(verifyMpayPassword).mockResolvedValue(false)

      // Fail a few times
      await migrationService.verifyPassword('wrong1')
      await migrationService.verifyPassword('wrong2')
      expect(migrationService.getRemainingRetries()).toBe(1)

      // Reset
      migrationService.reset()

      expect(migrationService.getRemainingRetries()).toBe(3)
    })
  })

  describe('getStatus()', () => {
    it('should return current status', () => {
      expect(migrationService.getStatus()).toBe('idle')
    })

    it('should reflect status changes', async () => {
      expect(migrationService.getStatus()).toBe('idle')

      await migrationService.skip()
      expect(migrationService.getStatus()).toBe('skipped')

      migrationService.reset()
      expect(migrationService.getStatus()).toBe('idle')
    })
  })

  describe('getRemainingRetries()', () => {
    it('should return 3 initially', () => {
      expect(migrationService.getRemainingRetries()).toBe(3)
    })

    it('should return 0 when maxRetries exceeded', async () => {
      vi.mocked(readMpayWallets).mockResolvedValue([mockWallet])
      vi.mocked(verifyMpayPassword).mockResolvedValue(false)

      await migrationService.verifyPassword('wrong1')
      await migrationService.verifyPassword('wrong2')
      await migrationService.verifyPassword('wrong3')

      expect(migrationService.getRemainingRetries()).toBe(0)
    })

    it('should not go below 0', async () => {
      vi.mocked(readMpayWallets).mockResolvedValue([mockWallet])
      vi.mocked(verifyMpayPassword).mockResolvedValue(false)

      // Try more than 3 times
      await migrationService.verifyPassword('wrong1')
      await migrationService.verifyPassword('wrong2')
      await migrationService.verifyPassword('wrong3')
      await migrationService.verifyPassword('wrong4')
      await migrationService.verifyPassword('wrong5')

      expect(migrationService.getRemainingRetries()).toBe(0)
    })
  })

  describe('status persistence', () => {
    it('should persist status to localStorage', async () => {
      await migrationService.skip()

      expect(localStorage.getItem(MIGRATION_STATUS_KEY)).toBe('skipped')
    })

    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage to throw
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage full')
      })

      // Should not throw
      await expect(migrationService.skip()).resolves.not.toThrow()

      // Restore
      localStorage.setItem = originalSetItem
    })
  })
})
