import { useCallback, useEffect } from 'react'
import { useStore } from '@tanstack/react-store'
import { walletStore } from '@/stores'

const THEME_HUE_CACHE_KEY = 'wallet_theme_hue_cache'

/** 预设主题色 (oklch hue 角度) */
export const WALLET_THEME_PRESETS = {
  purple: 323,    // 默认紫色
  blue: 250,      // 蓝色
  cyan: 200,      // 青色
  green: 145,     // 绿色
  yellow: 85,     // 黄色
  orange: 45,     // 橙色
  red: 25,        // 红色
  pink: 350,      // 粉色
  magenta: 310,   // 洋红
} as const

export type WalletThemePreset = keyof typeof WALLET_THEME_PRESETS

/** 主题色配置（包含名称和展示色） */
export const WALLET_THEME_COLORS = [
  { name: '紫色', hue: 323, color: 'oklch(0.6 0.25 323)' },
  { name: '蓝色', hue: 250, color: 'oklch(0.55 0.25 250)' },
  { name: '青色', hue: 200, color: 'oklch(0.65 0.2 200)' },
  { name: '绿色', hue: 145, color: 'oklch(0.6 0.2 145)' },
  { name: '黄色', hue: 85, color: 'oklch(0.75 0.18 85)' },
  { name: '橙色', hue: 45, color: 'oklch(0.7 0.2 45)' },
  { name: '红色', hue: 25, color: 'oklch(0.6 0.25 25)' },
  { name: '粉色', hue: 350, color: 'oklch(0.7 0.2 350)' },
  { name: '洋红', hue: 310, color: 'oklch(0.6 0.25 310)' },
] as const

/**
 * 基于助记词/密钥稳定派生主题色 hue
 * 使用简单哈希算法生成 0-360 的色相值
 */
export function deriveThemeHue(secret: string): number {
  let hash = 0
  for (let i = 0; i < secret.length; i++) {
    const char = secret.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Map to 0-360 range
  return Math.abs(hash) % 360
}

/**
 * 将主题色应用到 CSS 变量
 */
function applyThemeColor(hue: number) {
  const root = document.documentElement
  root.style.setProperty('--primary-hue', String(hue))
}

/**
 * 保存主题色到 localStorage 缓存
 */
function saveThemeHueCache(hue: number) {
  try {
    localStorage.setItem(THEME_HUE_CACHE_KEY, String(hue))
  } catch {
    // ignore storage errors
  }
}

/**
 * 从 localStorage 读取缓存的主题色
 */
function loadThemeHueCache(): number | null {
  try {
    const cached = localStorage.getItem(THEME_HUE_CACHE_KEY)
    if (cached) {
      const hue = parseInt(cached, 10)
      if (!isNaN(hue) && hue >= 0 && hue <= 360) {
        return hue
      }
    }
  } catch {
    // ignore
  }
  return null
}

/**
 * 初始化主题色（应用启动时调用）
 * 立即从缓存读取并应用，避免白屏闪烁
 */
export function initializeThemeHue() {
  const cached = loadThemeHueCache()
  if (cached !== null) {
    applyThemeColor(cached)
  } else {
    // 没有缓存时使用默认紫色
    applyThemeColor(WALLET_THEME_PRESETS.purple)
  }
}

/**
 * 根据钱包ID获取主题色
 */
function getThemeHueForWallet(wallets: { id: string; themeHue: number }[], walletId: string | null): number {
  if (!walletId) return WALLET_THEME_PRESETS.purple
  
  const wallet = wallets.find((w) => w.id === walletId)
  return wallet?.themeHue ?? WALLET_THEME_PRESETS.purple
}

/**
 * 钱包主题 Hook
 * 管理当前钱包的主题色，自动应用到全局CSS变量
 */
export function useWalletTheme() {
  const wallets = useStore(walletStore, (s) => s.wallets)
  const currentWalletId = useStore(walletStore, (s) => s.currentWalletId)

  // 获取当前钱包的主题色
  const walletThemeHue = currentWalletId 
    ? getThemeHueForWallet(wallets as { id: string; themeHue: number }[], currentWalletId)
    : null

  // 实际使用的主题色：有钱包用钱包的，没有用缓存的，都没有用默认的
  const themeHue = walletThemeHue ?? loadThemeHueCache() ?? WALLET_THEME_PRESETS.purple

  // 应用主题色并缓存（只有当钱包真正加载后才缓存）
  useEffect(() => {
    applyThemeColor(themeHue)
    // 只有当从钱包获取到主题色时才保存缓存
    if (walletThemeHue !== null) {
      saveThemeHueCache(walletThemeHue)
    }
  }, [themeHue, walletThemeHue])

  // 设置主题色
  const setThemeColor = useCallback((walletId: string, hue: number) => {
    walletStore.setState((state) => ({
      ...state,
      wallets: state.wallets.map((w) =>
        w.id === walletId ? { ...w, themeHue: hue } : w
      ),
    }))
  }, [])

  // 设置预设主题
  const setThemePreset = useCallback((walletId: string, preset: WalletThemePreset) => {
    setThemeColor(walletId, WALLET_THEME_PRESETS[preset])
  }, [setThemeColor])

  return {
    themeHue,
    presets: WALLET_THEME_PRESETS,
    setThemeColor,
    setThemePreset,
    /** 获取指定钱包的主题色 */
    getWalletTheme: (walletId: string) => 
      getThemeHueForWallet(wallets as { id: string; themeHue: number }[], walletId),
  }
}
