import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import zh from './locales/zh.json'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'

export const languages = {
  'zh-CN': { name: '简体中文', dir: 'ltr' as const },
  'zh-TW': { name: '中文（繁體）', dir: 'ltr' as const },
  'en': { name: 'English', dir: 'ltr' as const },
} as const

export type LanguageCode = keyof typeof languages

export const defaultLanguage: LanguageCode = 'zh-CN'

export function getLanguageDirection(lang: LanguageCode): 'ltr' | 'rtl' {
  return languages[lang]?.dir ?? 'ltr'
}

export function isRTL(lang: LanguageCode): boolean {
  return getLanguageDirection(lang) === 'rtl'
}

i18n.use(initReactI18next).init({
  resources: {
    'en': { translation: en },
    'zh': { translation: zh },
    'zh-CN': { translation: zhCN },
    'zh-TW': { translation: zhTW },
  },
  lng: defaultLanguage,
  fallbackLng: {
    'zh-CN': ['zh'],
    'zh-TW': ['zh'],
    'zh-HK': ['zh'],
    'default': ['en'],
  },
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

export default i18n
