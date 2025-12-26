import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWalletTheme, WALLET_THEME_PRESETS } from './useWalletTheme'

// 默认主题色 (purple)
const DEFAULT_THEME_HUE = WALLET_THEME_PRESETS.purple

// Mock walletStore
vi.mock('@/stores', () => {
  let mockState = {
    wallets: [] as Array<{ id: string; name: string; themeHue?: number }>,
    currentWalletId: null as string | null,
  }

  return {
    walletStore: {
      getState: () => mockState,
      setState: (updater: (state: typeof mockState) => typeof mockState) => {
        mockState = updater(mockState)
      },
      subscribe: () => () => {},
      __reset: () => {
        mockState = { wallets: [], currentWalletId: null }
      },
      __setWallets: (wallets: typeof mockState.wallets) => {
        mockState.wallets = wallets
      },
    },
  }
})

// Mock @tanstack/react-store
vi.mock('@tanstack/react-store', () => ({
  useStore: (store: any, selector: (state: any) => any) => selector(store.getState()),
}))

describe('useWalletTheme', () => {
  beforeEach(async () => {
    // Reset mock store
    const { walletStore } = await import('@/stores')
    ;(walletStore as any).__reset?.()

    // Mock document.documentElement.style
    vi.spyOn(document.documentElement.style, 'setProperty').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns default theme hue for unknown wallet', () => {
    const { result } = renderHook(() => useWalletTheme())

    const hue = result.current.getWalletTheme('unknown-wallet-id')
    expect(hue).toBe(DEFAULT_THEME_HUE)
  })

  it('returns themeHue property', () => {
    const { result } = renderHook(() => useWalletTheme())
    expect(typeof result.current.themeHue).toBe('number')
  })

  it('returns presets object', () => {
    const { result } = renderHook(() => useWalletTheme())
    expect(result.current.presets).toBe(WALLET_THEME_PRESETS)
  })

  it('provides setThemeColor function', () => {
    const { result } = renderHook(() => useWalletTheme())
    expect(typeof result.current.setThemeColor).toBe('function')
  })

  it('provides setThemePreset function', () => {
    const { result } = renderHook(() => useWalletTheme())
    expect(typeof result.current.setThemePreset).toBe('function')
  })

  it('provides getWalletTheme function', () => {
    const { result } = renderHook(() => useWalletTheme())
    expect(typeof result.current.getWalletTheme).toBe('function')
  })

  it('provides all preset colors', () => {
    expect(WALLET_THEME_PRESETS).toHaveProperty('purple')
    expect(WALLET_THEME_PRESETS).toHaveProperty('blue')
    expect(WALLET_THEME_PRESETS).toHaveProperty('cyan')
    expect(WALLET_THEME_PRESETS).toHaveProperty('green')
    expect(WALLET_THEME_PRESETS).toHaveProperty('yellow')
    expect(WALLET_THEME_PRESETS).toHaveProperty('orange')
    expect(WALLET_THEME_PRESETS).toHaveProperty('red')
    expect(WALLET_THEME_PRESETS).toHaveProperty('pink')
    expect(WALLET_THEME_PRESETS).toHaveProperty('magenta')
  })

  it('preset values are valid hue angles', () => {
    Object.values(WALLET_THEME_PRESETS).forEach((hue) => {
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThanOrEqual(360)
    })
  })

  it('default theme is purple', () => {
    expect(WALLET_THEME_PRESETS.purple).toBe(323)
  })

  it('getWalletTheme returns wallet themeHue when available', async () => {
    const { walletStore } = await import('@/stores')
    ;(walletStore as any).__setWallets([
      { id: 'wallet-1', name: 'Test', themeHue: 200 },
    ])

    const { result } = renderHook(() => useWalletTheme())
    const hue = result.current.getWalletTheme('wallet-1')
    expect(hue).toBe(200)
  })
})
