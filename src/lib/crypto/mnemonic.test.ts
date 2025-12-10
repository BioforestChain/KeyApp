import { describe, it, expect } from 'vitest'
import {
  generateMnemonic,
  validateMnemonic,
  isValidWord,
  searchWords,
  getWordList,
} from './mnemonic'

describe('mnemonic', () => {
  describe('generateMnemonic', () => {
    it('generates 12 words by default', () => {
      const words = generateMnemonic()
      expect(words).toHaveLength(12)
    })

    it('generates 24 words with strength 256', () => {
      const words = generateMnemonic(256)
      expect(words).toHaveLength(24)
    })

    it('generates valid mnemonic', () => {
      const words = generateMnemonic()
      expect(validateMnemonic(words)).toBe(true)
    })

    it('generates different mnemonics each time', () => {
      const words1 = generateMnemonic()
      const words2 = generateMnemonic()
      expect(words1.join(' ')).not.toBe(words2.join(' '))
    })
  })

  describe('validateMnemonic', () => {
    it('returns true for valid mnemonic', () => {
      const validMnemonic = [
        'abandon', 'abandon', 'abandon', 'abandon',
        'abandon', 'abandon', 'abandon', 'abandon',
        'abandon', 'abandon', 'abandon', 'about',
      ]
      expect(validateMnemonic(validMnemonic)).toBe(true)
    })

    it('returns false for invalid mnemonic', () => {
      const invalidMnemonic = [
        'invalid', 'word', 'list', 'that',
        'should', 'not', 'work', 'at',
        'all', 'because', 'it', 'fake',
      ]
      expect(validateMnemonic(invalidMnemonic)).toBe(false)
    })

    it('returns false for wrong checksum', () => {
      const wrongChecksum = [
        'abandon', 'abandon', 'abandon', 'abandon',
        'abandon', 'abandon', 'abandon', 'abandon',
        'abandon', 'abandon', 'abandon', 'abandon',
      ]
      expect(validateMnemonic(wrongChecksum)).toBe(false)
    })

    it('handles case insensitivity', () => {
      const mixedCase = [
        'ABANDON', 'Abandon', 'abandon', 'abandon',
        'abandon', 'abandon', 'abandon', 'abandon',
        'abandon', 'abandon', 'abandon', 'about',
      ]
      expect(validateMnemonic(mixedCase)).toBe(true)
    })
  })

  describe('isValidWord', () => {
    it('returns true for valid BIP39 word', () => {
      expect(isValidWord('abandon')).toBe(true)
      expect(isValidWord('zoo')).toBe(true)
    })

    it('returns false for invalid word', () => {
      expect(isValidWord('xyz123')).toBe(false)
      expect(isValidWord('notaword')).toBe(false)
    })

    it('is case insensitive', () => {
      expect(isValidWord('ABANDON')).toBe(true)
      expect(isValidWord('Zoo')).toBe(true)
    })
  })

  describe('searchWords', () => {
    it('returns matching words', () => {
      const results = searchWords('ab')
      expect(results.length).toBeGreaterThan(0)
      expect(results.every((w) => w.startsWith('ab'))).toBe(true)
    })

    it('returns empty array for empty prefix', () => {
      expect(searchWords('')).toEqual([])
    })

    it('limits results', () => {
      const results = searchWords('a', 3)
      expect(results.length).toBeLessThanOrEqual(3)
    })

    it('is case insensitive', () => {
      const lower = searchWords('ab')
      const upper = searchWords('AB')
      expect(lower).toEqual(upper)
    })
  })

  describe('getWordList', () => {
    it('returns 2048 words', () => {
      const wordList = getWordList()
      expect(wordList).toHaveLength(2048)
    })

    it('contains common BIP39 words', () => {
      const wordList = getWordList()
      expect(wordList).toContain('abandon')
      expect(wordList).toContain('zoo')
    })
  })
})
