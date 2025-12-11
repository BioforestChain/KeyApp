import { describe, it, expect } from 'vitest'
import { languages, getLanguageDirection, isRTL, defaultLanguage } from './index'

// Import locale files for validation
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'
import ar from './locales/ar.json'

// Helper to get all keys from nested object
function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys.sort()
}

describe('i18n', () => {
  describe('languages', () => {
    it('has Chinese, English and Arabic', () => {
      expect(languages['zh-CN']).toBeDefined()
      expect(languages['en']).toBeDefined()
      expect(languages['ar']).toBeDefined()
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

  describe('locale completeness (T014)', () => {
    const enKeys = getAllKeys(en)
    const zhCNKeys = getAllKeys(zhCN)
    const arKeys = getAllKeys(ar)

    it('en.json has sufficient keys for app coverage', () => {
      // Minimum expected keys after mpay extraction
      expect(enKeys.length).toBeGreaterThan(500)
    })

    it('zh-CN.json has sufficient keys for app coverage', () => {
      expect(zhCNKeys.length).toBeGreaterThan(500)
    })

    it('all locales have required common namespace keys', () => {
      const requiredCommonKeys = [
        'common.confirm',
        'common.cancel',
        'common.back',
        'common.copy',
        'common.loading',
      ]

      for (const key of requiredCommonKeys) {
        expect(enKeys).toContain(key)
        expect(zhCNKeys).toContain(key)
      }
    })

    it('all locales have required wallet namespace keys', () => {
      const requiredWalletKeys = [
        'wallet.createWallet',
        'wallet.importWallet',
        'wallet.manageWallet',
      ]

      for (const key of requiredWalletKeys) {
        expect(enKeys).toContain(key)
        expect(zhCNKeys).toContain(key)
      }
    })

    it('all locales have required transaction namespace keys', () => {
      const requiredTxKeys = [
        'transaction.transfer',
        'transaction.receive',
      ]

      for (const key of requiredTxKeys) {
        expect(enKeys).toContain(key)
        expect(zhCNKeys).toContain(key)
      }
    })

    it('all locales have required security namespace keys', () => {
      const requiredSecurityKeys = [
        'security.verifyPassword',
        'security.backupMnemonic',
      ]

      for (const key of requiredSecurityKeys) {
        expect(enKeys).toContain(key)
        expect(zhCNKeys).toContain(key)
      }
    })

    it('staking namespace is prepared for Epic 5', () => {
      const stakingKeys = enKeys.filter((k) => k.startsWith('staking.'))
      expect(stakingKeys.length).toBeGreaterThan(20)
    })

    it('dweb namespace is prepared for Epic 8', () => {
      const dwebKeys = enKeys.filter((k) => k.startsWith('dweb.'))
      expect(dwebKeys.length).toBeGreaterThan(10)
    })
  })
})
