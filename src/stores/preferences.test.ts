import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { preferencesStore, preferencesActions } from './preferences'

// Mock i18n
vi.mock('@/i18n', () => ({
  default: {
    changeLanguage: vi.fn(),
    language: 'zh-CN',
  },
  languages: {
    'zh-CN': { name: '简体中文', dir: 'ltr' },
    en: { name: 'English', dir: 'ltr' },
    ar: { name: 'العربية', dir: 'rtl' },
  },
  defaultLanguage: 'zh-CN',
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('preferencesStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    // Reset store state
    preferencesStore.setState(() => ({
      language: 'zh-CN',
      currency: 'USD',
      theme: 'system',
    }))
  })

  describe('initial state', () => {
    it('has default language', () => {
      expect(preferencesStore.state.language).toBe('zh-CN')
    })

    it('has default currency', () => {
      expect(preferencesStore.state.currency).toBe('USD')
    })

    it('has default theme', () => {
      expect(preferencesStore.state.theme).toBe('system')
    })
  })

  describe('setLanguage', () => {
    it('updates language in store', () => {
      preferencesActions.setLanguage('en')
      expect(preferencesStore.state.language).toBe('en')
    })

    it('persists to localStorage', () => {
      preferencesActions.setLanguage('en')
      expect(localStorageMock.setItem).toHaveBeenCalled()
      const savedValue = localStorageMock.setItem.mock.calls[0][1]
      expect(JSON.parse(savedValue).language).toBe('en')
    })
  })

  describe('setCurrency', () => {
    it('updates currency in store', () => {
      preferencesActions.setCurrency('CNY')
      expect(preferencesStore.state.currency).toBe('CNY')
    })

    it('persists to localStorage', () => {
      preferencesActions.setCurrency('EUR')
      expect(localStorageMock.setItem).toHaveBeenCalled()
      const savedValue = localStorageMock.setItem.mock.calls[0][1]
      expect(JSON.parse(savedValue).currency).toBe('EUR')
    })
  })

  describe('setTheme', () => {
    it('updates theme in store', () => {
      preferencesActions.setTheme('dark')
      expect(preferencesStore.state.theme).toBe('dark')
    })

    it('persists to localStorage', () => {
      preferencesActions.setTheme('light')
      expect(localStorageMock.setItem).toHaveBeenCalled()
      const savedValue = localStorageMock.setItem.mock.calls[0][1]
      expect(JSON.parse(savedValue).theme).toBe('light')
    })
  })
})
