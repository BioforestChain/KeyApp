import { describe, it, expect, vi, beforeEach } from 'vitest'
import { preferencesStore, preferencesActions } from './preferences'
import i18n from '@/i18n/index'

// Mock i18n
vi.mock('@/i18n/index', () => ({
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
  getLanguageDirection: (lang: string) => {
    const dirs: Record<string, 'ltr' | 'rtl'> = {
      'zh-CN': 'ltr',
      en: 'ltr',
      ar: 'rtl',
    }
    return dirs[lang] ?? 'ltr'
  },
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

function mockMatchMedia(initialMatches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()

  const mql = {
    matches: initialMatches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: (type: string, listener: (event: MediaQueryListEvent) => void) => {
      if (type === 'change') listeners.add(listener)
    },
    removeEventListener: (type: string, listener: (event: MediaQueryListEvent) => void) => {
      if (type === 'change') listeners.delete(listener)
    },
    addListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
    dispatchEvent: () => true,
  }

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => mql as unknown as MediaQueryList),
  })

  return {
    setMatches(next: boolean) {
      mql.matches = next
      const event = { matches: next } as MediaQueryListEvent
      for (const listener of listeners) listener(event)
    },
  }
}

describe('preferencesStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    localStorageMock.clear()
    document.documentElement.classList.remove('dark')
    // Ensure any previous system-theme listener is detached (initialize() handles cleanup).
    preferencesStore.setState(() => ({
      language: 'zh-CN',
      currency: 'USD',
      theme: 'light',
      recentContactIds: [],
    }))
    preferencesActions.initialize()
    vi.clearAllMocks()
    localStorageMock.clear()
    // Reset store state
    preferencesStore.setState(() => ({
      language: 'zh-CN',
      currency: 'USD',
      theme: 'system',
      recentContactIds: [],
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
      // Safe: setItem was just called, mock.calls[0] exists
      const savedValue = localStorageMock.setItem.mock.calls[0]![1]
      expect(JSON.parse(savedValue).language).toBe('en')
    })

    it('sets document direction to RTL for Arabic', () => {
      preferencesActions.setLanguage('ar')
      expect(document.documentElement.dir).toBe('rtl')
    })

    it('sets document direction to LTR for English', () => {
      preferencesActions.setLanguage('en')
      expect(document.documentElement.dir).toBe('ltr')
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
      // Safe: setItem was just called, mock.calls[0] exists
      const savedValue = localStorageMock.setItem.mock.calls[0]![1]
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
      // Safe: setItem was just called, mock.calls[0] exists
      const savedValue = localStorageMock.setItem.mock.calls[0]![1]
      expect(JSON.parse(savedValue).theme).toBe('light')
    })

    it('syncs document dark class', () => {
      preferencesActions.setTheme('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      preferencesActions.setTheme('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('initialize', () => {
    it('syncs i18n language + document direction from store state', () => {
      preferencesStore.setState(() => ({
        language: 'ar',
        currency: 'USD',
        theme: 'system',
        recentContactIds: [],
      }))

      preferencesActions.initialize()

      expect(vi.mocked(i18n.changeLanguage)).toHaveBeenCalledWith('ar')
      expect(document.documentElement.dir).toBe('rtl')
    })

    it('does not change language when already synced', () => {
      preferencesStore.setState(() => ({
        language: 'zh-CN',
        currency: 'USD',
        theme: 'system',
        recentContactIds: [],
      }))

      preferencesActions.initialize()

      expect(vi.mocked(i18n.changeLanguage)).not.toHaveBeenCalled()
      expect(document.documentElement.dir).toBe('ltr')
    })

    it('applies system theme and tracks prefers-color-scheme changes', () => {
      const media = mockMatchMedia(true)

      preferencesStore.setState(() => ({
        language: 'zh-CN',
        currency: 'USD',
        theme: 'system',
        recentContactIds: [],
      }))

      preferencesActions.initialize()
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      media.setMatches(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('trackRecentContact', () => {
    it('adds contact ID to the front of the list', () => {
      preferencesActions.trackRecentContact('contact-1')
      expect(preferencesStore.state.recentContactIds).toEqual(['contact-1'])

      preferencesActions.trackRecentContact('contact-2')
      expect(preferencesStore.state.recentContactIds).toEqual(['contact-2', 'contact-1'])
    })

    it('moves existing contact ID to the front', () => {
      preferencesActions.trackRecentContact('contact-1')
      preferencesActions.trackRecentContact('contact-2')
      preferencesActions.trackRecentContact('contact-1')
      expect(preferencesStore.state.recentContactIds).toEqual(['contact-1', 'contact-2'])
    })

    it('limits the list to 10 items', () => {
      for (let i = 1; i <= 15; i++) {
        preferencesActions.trackRecentContact(`contact-${i}`)
      }
      expect(preferencesStore.state.recentContactIds).toHaveLength(10)
      expect(preferencesStore.state.recentContactIds[0]).toBe('contact-15')
      expect(preferencesStore.state.recentContactIds[9]).toBe('contact-6')
    })

    it('persists to localStorage', () => {
      preferencesActions.trackRecentContact('contact-1')
      expect(localStorageMock.setItem).toHaveBeenCalled()
      const savedValue = localStorageMock.setItem.mock.calls[0]![1]
      expect(JSON.parse(savedValue).recentContactIds).toEqual(['contact-1'])
    })
  })
})
