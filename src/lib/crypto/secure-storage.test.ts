import { describe, it, expect, beforeEach } from 'vitest'
import {
  SecureStorage,
  BiometricAuth,
  isDwebEnvironment,
  storeMnemonic,
  retrieveMnemonic,
} from './secure-storage'

describe('secure-storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('isDwebEnvironment', () => {
    it('returns false in test environment', () => {
      expect(isDwebEnvironment()).toBe(false)
    })
  })

  describe('BiometricAuth', () => {
    it('isAvailable returns false in non-DWEB environment', async () => {
      const available = await BiometricAuth.isAvailable()
      expect(available).toBe(false)
    })

    it('authenticate returns error in non-DWEB environment', async () => {
      const result = await BiometricAuth.authenticate()
      expect(result.success).toBe(false)
      expect(result.code).toBe(-1)
    })
  })

  describe('SecureStorage', () => {
    const testKey = 'test-wallet'
    const testData = 'abandon ability able about above absent absorb abstract absurd abuse access accident'
    const testPassword = 'test-password-123'

    describe('isAvailable', () => {
      it('returns web: true, dweb: false in test environment', async () => {
        const availability = await SecureStorage.isAvailable()
        expect(availability.web).toBe(true)
        expect(availability.dweb).toBe(false)
      })
    })

    describe('store and retrieve (Web mode)', () => {
      it('stores and retrieves data with password', async () => {
        await SecureStorage.store(testKey, testData, { password: testPassword })
        const retrieved = await SecureStorage.retrieve(testKey, { password: testPassword })
        expect(retrieved).toBe(testData)
      })

      it('throws error when storing without password in web mode', async () => {
        await expect(
          SecureStorage.store(testKey, testData, {})
        ).rejects.toThrow('Web 模式需要提供密码')
      })

      it('throws error when retrieving without password', async () => {
        await SecureStorage.store(testKey, testData, { password: testPassword })
        await expect(
          SecureStorage.retrieve(testKey, {})
        ).rejects.toThrow('需要提供密码解密')
      })

      it('throws error with wrong password', async () => {
        await SecureStorage.store(testKey, testData, { password: testPassword })
        await expect(
          SecureStorage.retrieve(testKey, { password: 'wrong-password' })
        ).rejects.toThrow()
      })

      it('returns null for non-existent key', async () => {
        const retrieved = await SecureStorage.retrieve('non-existent', { password: testPassword })
        expect(retrieved).toBeNull()
      })
    })

    describe('delete', () => {
      it('deletes stored data', async () => {
        await SecureStorage.store(testKey, testData, { password: testPassword })
        expect(await SecureStorage.exists(testKey)).toBe(true)
        
        await SecureStorage.delete(testKey)
        expect(await SecureStorage.exists(testKey)).toBe(false)
      })
    })

    describe('exists', () => {
      it('returns true for existing key', async () => {
        await SecureStorage.store(testKey, testData, { password: testPassword })
        expect(await SecureStorage.exists(testKey)).toBe(true)
      })

      it('returns false for non-existent key', async () => {
        expect(await SecureStorage.exists('non-existent')).toBe(false)
      })
    })

    describe('getType', () => {
      it('returns web-encrypted for password-stored data', async () => {
        await SecureStorage.store(testKey, testData, { password: testPassword })
        const type = await SecureStorage.getType(testKey)
        expect(type).toBe('web-encrypted')
      })

      it('returns null for non-existent key', async () => {
        const type = await SecureStorage.getType('non-existent')
        expect(type).toBeNull()
      })
    })
  })

  describe('storeMnemonic and retrieveMnemonic', () => {
    const walletId = 'wallet-123'
    const mnemonic = 'abandon ability able about above absent absorb abstract absurd abuse access accident'
    const password = 'test-password'

    it('stores and retrieves mnemonic with password', async () => {
      await storeMnemonic(walletId, mnemonic, { password })
      const retrieved = await retrieveMnemonic(walletId, { password })
      expect(retrieved).toBe(mnemonic)
    })

    it('throws error without password in web mode', async () => {
      await expect(
        storeMnemonic(walletId, mnemonic, {})
      ).rejects.toThrow('需要提供密码')
    })
  })
})
