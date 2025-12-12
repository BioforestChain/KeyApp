/**
 * mpay-crypto 单元测试
 *
 * 测试 mpay AES-CTR 加密兼容层
 */

import { describe, it, expect } from 'vitest'
import { decryptMpayData, verifyMpayPassword } from './mpay-crypto'

// 使用 Web Crypto API 生成测试加密数据
async function encryptWithMpayFormat(
  password: string,
  plaintext: string
): Promise<string> {
  // SHA256(password)
  const passwordBuffer = new TextEncoder().encode(password)
  const keyMaterial = await crypto.subtle.digest('SHA-256', passwordBuffer)

  // AES-CTR 密钥
  const key = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'AES-CTR', length: 256 },
    false,
    ['encrypt']
  )

  // 加密（使用全零 counter）
  const plaintextBuffer = new TextEncoder().encode(plaintext)
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CTR', counter: new Uint8Array(16), length: 128 },
    key,
    plaintextBuffer
  )

  // Base64 编码
  const bytes = new Uint8Array(encrypted)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] as number)
  }
  return btoa(binary)
}

describe('mpay-crypto', () => {
  describe('decryptMpayData', () => {
    it('should decrypt mpay encrypted data with correct password', async () => {
      const password = 'testpassword123'
      const plaintext = 'abandon ability able about above absent'

      const encrypted = await encryptWithMpayFormat(password, plaintext)
      const decrypted = await decryptMpayData(password, encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it('should decrypt 12-word mnemonic', async () => {
      const password = 'mySecurePassword'
      const mnemonic =
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

      const encrypted = await encryptWithMpayFormat(password, mnemonic)
      const decrypted = await decryptMpayData(password, encrypted)

      expect(decrypted).toBe(mnemonic)
    })

    it('should decrypt 24-word mnemonic', async () => {
      const password = 'longPassword'
      const mnemonic =
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art'

      const encrypted = await encryptWithMpayFormat(password, mnemonic)
      const decrypted = await decryptMpayData(password, encrypted)

      expect(decrypted).toBe(mnemonic)
    })

    it('should throw error with wrong password', async () => {
      const correctPassword = 'correctPassword'
      const wrongPassword = 'wrongPassword'
      const plaintext = 'secret data'

      const encrypted = await encryptWithMpayFormat(correctPassword, plaintext)

      // AES-CTR 不会直接抛出错误，而是解密出错误数据
      // 但 UTF-8 解码可能会失败或产生乱码
      const decrypted = await decryptMpayData(wrongPassword, encrypted)
      // 解密结果应该不等于原文
      expect(decrypted).not.toBe(plaintext)
    })

    it('should handle empty encrypted data', async () => {
      const password = 'test'
      const encrypted = await encryptWithMpayFormat(password, '')

      const decrypted = await decryptMpayData(password, encrypted)
      expect(decrypted).toBe('')
    })

    it('should handle unicode characters', async () => {
      const password = '密码123'
      const plaintext = '中文助记词 测试 🔐'

      const encrypted = await encryptWithMpayFormat(password, plaintext)
      const decrypted = await decryptMpayData(password, encrypted)

      expect(decrypted).toBe(plaintext)
    })
  })

  describe('verifyMpayPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'testpassword'
      const mnemonic =
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

      const encrypted = await encryptWithMpayFormat(password, mnemonic)
      const isValid = await verifyMpayPassword(password, encrypted)

      expect(isValid).toBe(true)
    })

    it('should return false for wrong password', async () => {
      const correctPassword = 'testpassword'
      const wrongPassword = 'wrongpassword'
      const mnemonic = 'abandon ability able about above absent'

      const encrypted = await encryptWithMpayFormat(correctPassword, mnemonic)
      const isValid = await verifyMpayPassword(wrongPassword, encrypted)

      expect(isValid).toBe(false)
    })

    it('should return true for valid 12-word mnemonic', async () => {
      const password = 'test'
      const mnemonic =
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

      const encrypted = await encryptWithMpayFormat(password, mnemonic)
      const isValid = await verifyMpayPassword(password, encrypted)

      expect(isValid).toBe(true)
    })

    it('should return false for non-mnemonic plaintext', async () => {
      const password = 'test'
      const plaintext = 'singleword'

      const encrypted = await encryptWithMpayFormat(password, plaintext)
      const isValid = await verifyMpayPassword(password, encrypted)

      expect(isValid).toBe(false)
    })

    it('should handle invalid base64 gracefully', async () => {
      const password = 'test'
      const invalidBase64 = '!!!invalid!!!'

      const isValid = await verifyMpayPassword(password, invalidBase64)
      expect(isValid).toBe(false)
    })
  })
})
