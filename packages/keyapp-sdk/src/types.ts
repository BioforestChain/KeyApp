/**
 * KeyApp SDK 类型定义
 */

export type ColorMode = 'light' | 'dark'
export type Platform = 'ios' | 'android' | 'web' | 'dweb'

export interface ThemeContext {
  colorMode: ColorMode
  primaryHue: number
  primarySaturation: number
}

export interface LocaleContext {
  lang: string
  rtl: boolean
}

export interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

export interface EnvContext {
  platform: Platform
  version: string
  safeAreaInsets: SafeAreaInsets
}

export interface A11yContext {
  fontScale: number
  reduceMotion: boolean
}

export interface KeyAppContextState {
  theme: ThemeContext
  locale: LocaleContext
  env: EnvContext
  a11y: A11yContext
}

export interface KeyAppContextEventMap {
  change: CustomEvent<KeyAppContextState>
  themechange: CustomEvent<ThemeContext>
  localechange: CustomEvent<LocaleContext>
  envchange: CustomEvent<EnvContext>
  a11ychange: CustomEvent<A11yContext>
}

export type KeyAppContextEventType = keyof KeyAppContextEventMap
