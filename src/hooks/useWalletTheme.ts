import { useCallback, useEffect } from 'react'
import { useStore } from '@tanstack/react-store'
import { walletStore } from '@/stores'

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
 * 将主题色应用到 CSS 变量
 */
function applyThemeColor(hue: number) {
  const root = document.documentElement
  root.style.setProperty('--primary-hue', String(hue))
}

/**
 * 钱包主题 Hook
 * 管理当前钱包的主题色，自动应用到全局CSS变量
 */
export function useWalletTheme() {
  const wallets = useStore(walletStore, (s) => s.wallets)
  const currentWalletId = useStore(walletStore, (s) => s.currentWalletId)

  // 获取当前钱包的主题色
  const currentWallet = wallets.find((w) => w.id === currentWalletId)
  const themeHue = (currentWallet as { themeHue?: number } | undefined)?.themeHue ?? WALLET_THEME_PRESETS.purple

  // 应用主题色
  useEffect(() => {
    applyThemeColor(themeHue)
  }, [themeHue])

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
    /** 获取指定钱包的主题色（如果没有设置，根据钱包索引生成稳定的颜色） */
    getWalletTheme: (walletId: string) => {
      const walletIndex = wallets.findIndex((w) => w.id === walletId)
      const wallet = wallets[walletIndex]
      const storedHue = (wallet as { themeHue?: number } | undefined)?.themeHue
      if (storedHue !== undefined) return storedHue
      // 没有存储的主题色时，根据索引从预设中选择
      const presetHues = Object.values(WALLET_THEME_PRESETS)
      return presetHues[walletIndex % presetHues.length]
    },
  }
}
