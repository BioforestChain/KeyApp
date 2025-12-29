import { describe, it, expect } from 'vitest'
import { languages, getLanguageDirection, isRTL, defaultLanguage } from './index'

import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'

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

describe('forge i18n', () => {
  describe('languages', () => {
    it('has Chinese and English', () => {
      expect(languages['zh-CN']).toBeDefined()
      expect(languages['zh-TW']).toBeDefined()
      expect(languages['en']).toBeDefined()
    })

    it('all languages are LTR', () => {
      expect(languages['zh-CN'].dir).toBe('ltr')
      expect(languages['zh-TW'].dir).toBe('ltr')
      expect(languages['en'].dir).toBe('ltr')
    })
  })

  describe('getLanguageDirection', () => {
    it('returns ltr for Chinese', () => {
      expect(getLanguageDirection('zh-CN')).toBe('ltr')
    })

    it('returns ltr for English', () => {
      expect(getLanguageDirection('en')).toBe('ltr')
    })
  })

  describe('isRTL', () => {
    it('returns false for all supported languages', () => {
      expect(isRTL('zh-CN')).toBe(false)
      expect(isRTL('zh-TW')).toBe(false)
      expect(isRTL('en')).toBe(false)
    })
  })

  describe('defaultLanguage', () => {
    it('is zh-CN', () => {
      expect(defaultLanguage).toBe('zh-CN')
    })
  })

  describe('locale completeness', () => {
    it('all locales have same number of keys', () => {
      const enKeys = countKeys(en)
      const zhCNKeys = countKeys(zhCN)
      const zhTWKeys = countKeys(zhTW)
      expect(zhCNKeys).toBe(enKeys)
      expect(zhTWKeys).toBe(enKeys)
    })

    it('all locales have required keys', () => {
      const requiredKeys = ['app', 'connect', 'forge', 'processing', 'success', 'error', 'picker', 'chain']
      for (const key of requiredKeys) {
        expect(en).toHaveProperty(key)
        expect(zhCN).toHaveProperty(key)
        expect(zhTW).toHaveProperty(key)
      }
    })
  })
})
