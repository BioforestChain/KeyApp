import { describe, it, expect } from 'vitest'
import { languages, getLanguageDirection, isRTL, defaultLanguage, namespaces, defaultNS } from './index'

// Import namespace files for validation
import enCommon from './locales/en/common.json'
import enWallet from './locales/en/wallet.json'
import enTransaction from './locales/en/transaction.json'
import enSecurity from './locales/en/security.json'
import enStaking from './locales/en/staking.json'
import enDweb from './locales/en/dweb.json'

import zhCNCommon from './locales/zh-CN/common.json'
import zhCNWallet from './locales/zh-CN/wallet.json'
import zhCNTransaction from './locales/zh-CN/transaction.json'
import zhCNSecurity from './locales/zh-CN/security.json'

import arCommon from './locales/ar/common.json'
import arWallet from './locales/ar/wallet.json'

// Helper to count keys in a namespace object
function countKeys(obj: Record<string, unknown>): number {
  let count = 0
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      count += countKeys(value as Record<string, unknown>)
    } else {
      count += 1
    }
  }
  return count
}

describe('i18n', () => {
  describe('languages', () => {
    it('has Chinese, English and Arabic', () => {
      expect(languages['zh-CN']).toBeDefined()
      expect(languages['en']).toBeDefined()
      expect(languages['ar']).toBeDefined()
    })

    it('has Traditional Chinese', () => {
      expect(languages['zh-TW']).toBeDefined()
    })

    it('Chinese and English are LTR', () => {
      expect(languages['zh-CN'].dir).toBe('ltr')
      expect(languages['en'].dir).toBe('ltr')
    })

    it('Arabic is RTL', () => {
      expect(languages['ar'].dir).toBe('rtl')
    })
  })

  describe('getLanguageDirection', () => {
    it('returns ltr for Chinese', () => {
      expect(getLanguageDirection('zh-CN')).toBe('ltr')
    })

    it('returns ltr for English', () => {
      expect(getLanguageDirection('en')).toBe('ltr')
    })

    it('returns rtl for Arabic', () => {
      expect(getLanguageDirection('ar')).toBe('rtl')
    })
  })

  describe('isRTL', () => {
    it('returns false for Chinese', () => {
      expect(isRTL('zh-CN')).toBe(false)
    })

    it('returns false for English', () => {
      expect(isRTL('en')).toBe(false)
    })

    it('returns true for Arabic', () => {
      expect(isRTL('ar')).toBe(true)
    })
  })

  describe('defaultLanguage', () => {
    it('is Chinese', () => {
      expect(defaultLanguage).toBe('zh-CN')
    })
  })

  describe('namespaces', () => {
    it('has all expected namespaces', () => {
      const expected = ['common', 'wallet', 'transaction', 'security', 'staking', 'dweb', 'error', 'settings', 'token', 'time', 'empty']
      for (const ns of expected) {
        expect(namespaces).toContain(ns)
      }
    })

    it('defaultNS is common', () => {
      expect(defaultNS).toBe('common')
    })
  })

  describe('locale completeness (T014.5)', () => {
    it('en common namespace has sufficient keys', () => {
      const keyCount = countKeys(enCommon)
      expect(keyCount).toBeGreaterThan(150)
    })

    it('zh-CN common namespace has sufficient keys', () => {
      const keyCount = countKeys(zhCNCommon)
      expect(keyCount).toBeGreaterThan(150)
    })

    it('all locales have required common keys', () => {
      const requiredKeys = ['confirm', 'cancel', 'back', 'copy', 'loading']
      for (const key of requiredKeys) {
        expect(enCommon).toHaveProperty(key)
        expect(zhCNCommon).toHaveProperty(key)
      }
    })

    it('all locales have required wallet keys', () => {
      const requiredKeys = ['createWallet', 'importWallet', 'manageWallet']
      for (const key of requiredKeys) {
        expect(enWallet).toHaveProperty(key)
        expect(zhCNWallet).toHaveProperty(key)
      }
    })

    it('all locales have required transaction keys', () => {
      const requiredKeys = ['transfer', 'receive']
      for (const key of requiredKeys) {
        expect(enTransaction).toHaveProperty(key)
        expect(zhCNTransaction).toHaveProperty(key)
      }
    })

    it('all locales have required security keys', () => {
      const requiredKeys = ['patternLock', 'walletLock', 'backupMnemonic']
      for (const key of requiredKeys) {
        expect(enSecurity).toHaveProperty(key)
        expect(zhCNSecurity).toHaveProperty(key)
      }
    })

    it('staking namespace is prepared for Epic 5', () => {
      const keyCount = countKeys(enStaking)
      expect(keyCount).toBeGreaterThan(20)
    })

    it('dweb namespace is prepared for Epic 8', () => {
      const keyCount = countKeys(enDweb)
      expect(keyCount).toBeGreaterThan(10)
    })

    it('Arabic placeholders have same structure as English', () => {
      // ar should have same keys as en (placeholders copied from en)
      expect(Object.keys(arCommon).length).toBe(Object.keys(enCommon).length)
      expect(Object.keys(arWallet).length).toBe(Object.keys(enWallet).length)
    })
  })
})
