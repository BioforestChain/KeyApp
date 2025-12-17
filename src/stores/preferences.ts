import { Store } from '@tanstack/react-store'
import { useStore } from '@tanstack/react-store'
import i18n from '@/i18n/index'
import { type LanguageCode, languages, defaultLanguage, getLanguageDirection } from '@/i18n/index'

// Storage key
const PREFERENCES_KEY = 'bfmpay_preferences'

type ThemePreference = 'light' | 'dark' | 'system'
type ResolvedTheme = Exclude<ThemePreference, 'system'>

// Currency types
export type CurrencyCode = 'USD' | 'CNY' | 'EUR' | 'JPY' | 'KRW'

export const currencies: Record<CurrencyCode, { symbol: string; name: string }> = {
  USD: { symbol: '$', name: 'US Dollar' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  EUR: { symbol: '€', name: 'Euro' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  KRW: { symbol: '₩', name: 'Korean Won' },
}

// State type
export interface PreferencesState {
  language: LanguageCode
  currency: CurrencyCode
  theme: ThemePreference
}

// Default state
const defaultState: PreferencesState = {
  language: defaultLanguage,
  currency: 'USD',
  theme: 'system',
}

let systemThemeMediaQuery: MediaQueryList | null = null
let systemThemeListener: ((event: MediaQueryListEvent) => void) | null = null

function getSystemThemeMediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined') return null
  if (typeof window.matchMedia !== 'function') return null
  return window.matchMedia('(prefers-color-scheme: dark)')
}

function resolveTheme(theme: ThemePreference): ResolvedTheme {
  if (theme === 'dark' || theme === 'light') return theme
  const mediaQuery = getSystemThemeMediaQuery()
  return mediaQuery?.matches ? 'dark' : 'light'
}

function applyThemeToDocument(theme: ThemePreference): void {
  if (typeof document === 'undefined') return
  const resolved = resolveTheme(theme)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

function stopSystemThemeSync(): void {
  if (!systemThemeMediaQuery || !systemThemeListener) return

  if (typeof systemThemeMediaQuery.removeEventListener === 'function') {
    systemThemeMediaQuery.removeEventListener('change', systemThemeListener)
  } else if (typeof systemThemeMediaQuery.removeListener === 'function') {
    systemThemeMediaQuery.removeListener(systemThemeListener)
  }

  systemThemeMediaQuery = null
  systemThemeListener = null
}

function startSystemThemeSync(): void {
  const mediaQuery = getSystemThemeMediaQuery()
  if (!mediaQuery) return

  // Ensure idempotency: don't attach multiple listeners.
  if (systemThemeMediaQuery === mediaQuery && systemThemeListener) return

  stopSystemThemeSync()
  systemThemeMediaQuery = mediaQuery
  systemThemeListener = (event) => {
    if (preferencesStore.state.theme !== 'system') return
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('dark', event.matches)
  }

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', systemThemeListener)
  } else if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(systemThemeListener)
  }
}

function syncTheme(theme: ThemePreference): void {
  applyThemeToDocument(theme)
  if (theme === 'system') startSystemThemeSync()
  else stopSystemThemeSync()
}

// Load from localStorage
function loadFromStorage(): PreferencesState {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...defaultState, ...parsed }
    }
  } catch {
    // Ignore parse errors
  }
  return defaultState
}

// Save to localStorage
function saveToStorage(state: PreferencesState): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors
  }
}

// Create store with persisted state
export const preferencesStore = new Store<PreferencesState>(loadFromStorage())

// Actions
export const preferencesActions = {
  setLanguage(lang: LanguageCode): void {
    // Update i18n
    i18n.changeLanguage(lang)
    // Update document direction for RTL support
    document.documentElement.dir = getLanguageDirection(lang)
    // Update store
    preferencesStore.setState((state) => {
      const newState = { ...state, language: lang }
      saveToStorage(newState)
      return newState
    })
  },

  setCurrency(currency: CurrencyCode): void {
    preferencesStore.setState((state) => {
      const newState = { ...state, currency }
      saveToStorage(newState)
      return newState
    })
  },

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    preferencesStore.setState((state) => {
      const newState = { ...state, theme }
      saveToStorage(newState)
      return newState
    })
    syncTheme(theme)
  },

  /** 初始化 - 同步 i18n 语言和文字方向 */
  initialize(): void {
    const state = preferencesStore.state
    if (state.language !== i18n.language) {
      i18n.changeLanguage(state.language)
    }
    // Set document direction for RTL support
    document.documentElement.dir = getLanguageDirection(state.language)
    syncTheme(state.theme)
  },
}

// Hooks
export function usePreferences(): PreferencesState {
  return useStore(preferencesStore)
}

export function useLanguage(): LanguageCode {
  return useStore(preferencesStore, (s) => s.language)
}

export function useCurrency(): CurrencyCode {
  return useStore(preferencesStore, (s) => s.currency)
}

export function useTheme(): 'light' | 'dark' | 'system' {
  return useStore(preferencesStore, (s) => s.theme)
}

// Re-export language config
export { languages, type LanguageCode }
