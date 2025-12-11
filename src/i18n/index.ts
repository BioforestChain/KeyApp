import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Namespace imports - en
import enCommon from './locales/en/common.json'
import enWallet from './locales/en/wallet.json'
import enTransaction from './locales/en/transaction.json'
import enSecurity from './locales/en/security.json'
import enStaking from './locales/en/staking.json'
import enDweb from './locales/en/dweb.json'
import enError from './locales/en/error.json'
import enSettings from './locales/en/settings.json'
import enToken from './locales/en/token.json'
import enTime from './locales/en/time.json'
import enEmpty from './locales/en/empty.json'
import enScanner from './locales/en/scanner.json'

// Namespace imports - zh-CN
import zhCNCommon from './locales/zh-CN/common.json'
import zhCNWallet from './locales/zh-CN/wallet.json'
import zhCNTransaction from './locales/zh-CN/transaction.json'
import zhCNSecurity from './locales/zh-CN/security.json'
import zhCNStaking from './locales/zh-CN/staking.json'
import zhCNDweb from './locales/zh-CN/dweb.json'
import zhCNError from './locales/zh-CN/error.json'
import zhCNSettings from './locales/zh-CN/settings.json'
import zhCNToken from './locales/zh-CN/token.json'
import zhCNTime from './locales/zh-CN/time.json'
import zhCNEmpty from './locales/zh-CN/empty.json'
import zhCNScanner from './locales/zh-CN/scanner.json'

// Namespace imports - zh-TW
import zhTWCommon from './locales/zh-TW/common.json'
import zhTWWallet from './locales/zh-TW/wallet.json'
import zhTWTransaction from './locales/zh-TW/transaction.json'
import zhTWSecurity from './locales/zh-TW/security.json'
import zhTWStaking from './locales/zh-TW/staking.json'
import zhTWDweb from './locales/zh-TW/dweb.json'
import zhTWError from './locales/zh-TW/error.json'
import zhTWSettings from './locales/zh-TW/settings.json'
import zhTWToken from './locales/zh-TW/token.json'
import zhTWTime from './locales/zh-TW/time.json'
import zhTWEmpty from './locales/zh-TW/empty.json'
import zhTWScanner from './locales/zh-TW/scanner.json'

// Namespace imports - ar
import arCommon from './locales/ar/common.json'
import arWallet from './locales/ar/wallet.json'
import arTransaction from './locales/ar/transaction.json'
import arSecurity from './locales/ar/security.json'
import arStaking from './locales/ar/staking.json'
import arDweb from './locales/ar/dweb.json'
import arError from './locales/ar/error.json'
import arSettings from './locales/ar/settings.json'
import arToken from './locales/ar/token.json'
import arTime from './locales/ar/time.json'
import arEmpty from './locales/ar/empty.json'
import arScanner from './locales/ar/scanner.json'

// 语言配置
export const languages = {
  'zh-CN': { name: '简体中文', dir: 'ltr' as const },
  'zh-TW': { name: '中文（繁體）', dir: 'ltr' as const },
  'en': { name: 'English', dir: 'ltr' as const },
  'ar': { name: 'العربية', dir: 'rtl' as const },
} as const

export type LanguageCode = keyof typeof languages

export const defaultLanguage: LanguageCode = 'zh-CN'

// 命名空间定义
export const namespaces = [
  'common',
  'wallet',
  'transaction',
  'security',
  'staking',
  'dweb',
  'error',
  'settings',
  'token',
  'time',
  'empty',
  'scanner',
] as const

export type Namespace = (typeof namespaces)[number]

export const defaultNS: Namespace = 'common'

// 获取语言的文字方向
export function getLanguageDirection(lang: LanguageCode): 'ltr' | 'rtl' {
  return languages[lang]?.dir ?? 'ltr'
}

// 是否为 RTL 语言
export function isRTL(lang: LanguageCode): boolean {
  return getLanguageDirection(lang) === 'rtl'
}

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      wallet: enWallet,
      transaction: enTransaction,
      security: enSecurity,
      staking: enStaking,
      dweb: enDweb,
      error: enError,
      settings: enSettings,
      token: enToken,
      time: enTime,
      empty: enEmpty,
      scanner: enScanner,
    },
    'zh-CN': {
      common: zhCNCommon,
      wallet: zhCNWallet,
      transaction: zhCNTransaction,
      security: zhCNSecurity,
      staking: zhCNStaking,
      dweb: zhCNDweb,
      error: zhCNError,
      settings: zhCNSettings,
      token: zhCNToken,
      time: zhCNTime,
      empty: zhCNEmpty,
      scanner: zhCNScanner,
    },
    'zh-TW': {
      common: zhTWCommon,
      wallet: zhTWWallet,
      transaction: zhTWTransaction,
      security: zhTWSecurity,
      staking: zhTWStaking,
      dweb: zhTWDweb,
      error: zhTWError,
      settings: zhTWSettings,
      token: zhTWToken,
      time: zhTWTime,
      empty: zhTWEmpty,
      scanner: zhTWScanner,
    },
    ar: {
      common: arCommon,
      wallet: arWallet,
      transaction: arTransaction,
      security: arSecurity,
      staking: arStaking,
      dweb: arDweb,
      error: arError,
      settings: arSettings,
      token: arToken,
      time: arTime,
      empty: arEmpty,
      scanner: arScanner,
    },
  },
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  ns: namespaces,
  defaultNS,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

export default i18n
