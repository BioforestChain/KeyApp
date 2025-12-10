import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, verifyPassword } from './encryption'

describe('encryption', () => {
  const testPassword = 'test-password-123'
  const testData = 'abandon ability able about above absent absorb abstract absurd abuse access accident'

  describe('encrypt', () => {
    it('returns encrypted data with all required fields', async () => {
      const result = await encrypt(testData, testPassword)
      
      expect(result).toHaveProperty('ciphertext')
      expect(result).toHaveProperty('salt')
      expect(result).toHaveProperty('iv')
      expect(result).toHaveProperty('iterations')
      expect(result.iterations).toBe(100000)
    })

    it('produces different ciphertext each time (random salt/iv)', async () => {
      const result1 = await encrypt(testData, testPassword)
      const result2 = await encrypt(testData, testPassword)
      
      expect(result1.ciphertext).not.toBe(result2.ciphertext)
      expect(result1.salt).not.toBe(result2.salt)
      expect(result1.iv).not.toBe(result2.iv)
    })
  })

  describe('decrypt', () => {
    it('decrypts data correctly with correct password', async () => {
      const encrypted = await encrypt(testData, testPassword)
      const decrypted = await decrypt(encrypted, testPassword)
      
      expect(decrypted).toBe(testData)
    })

    it('throws error with wrong password', async () => {
      const encrypted = await encrypt(testData, testPassword)
      
      await expect(decrypt(encrypted, 'wrong-password')).rejects.toThrow()
    })

    it('handles unicode text', async () => {
      const unicodeText = '这是中文测试 🎉 émoji'
      const encrypted = await encrypt(unicodeText, testPassword)
      const decrypted = await decrypt(encrypted, testPassword)
      
      expect(decrypted).toBe(unicodeText)
    })

    it('handles empty string', async () => {
      const encrypted = await encrypt('', testPassword)
      const decrypted = await decrypt(encrypted, testPassword)
      
      expect(decrypted).toBe('')
    })

    it('handles long text', async () => {
      const longText = testData.repeat(100)
      const encrypted = await encrypt(longText, testPassword)
      const decrypted = await decrypt(encrypted, testPassword)
      
      expect(decrypted).toBe(longText)
    })
  })

  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      const encrypted = await encrypt(testData, testPassword)
      const isValid = await verifyPassword(encrypted, testPassword)
      
      expect(isValid).toBe(true)
    })

    it('returns false for wrong password', async () => {
      const encrypted = await encrypt(testData, testPassword)
      const isValid = await verifyPassword(encrypted, 'wrong-password')
      
      expect(isValid).toBe(false)
    })
  })
})
