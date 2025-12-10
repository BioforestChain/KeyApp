import { Store } from '@tanstack/react-store'
import { useStore } from '@tanstack/react-store'
import i18n from '@/i18n'
import { type LanguageCode, languages, defaultLanguage } from '@/i18n'

// Storage key
const PREFERENCES_KEY = 'bfmpay_preferences'

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
  theme: 'light' | 'dark' | 'system'
}

// Default state
const defaultState: PreferencesState = {
  language: defaultLanguage,
  currency: 'USD',
  theme: 'system',
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
  },

  /** 初始化 - 同步 i18n 语言 */
  initialize(): void {
    const state = preferencesStore.state
    if (state.language !== i18n.language) {
      i18n.changeLanguage(state.language)
    }
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
