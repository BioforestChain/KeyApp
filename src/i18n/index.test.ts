import { describe, it, expect } from 'vitest'
import { languages, getLanguageDirection, isRTL, defaultLanguage } from './index'

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
})
