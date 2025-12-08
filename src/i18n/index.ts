import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'
import ar from './locales/ar.json'

// 语言配置
export const languages = {
  'zh-CN': { name: '简体中文', dir: 'ltr' as const },
  'en': { name: 'English', dir: 'ltr' as const },
  'ar': { name: 'العربية', dir: 'rtl' as const },
} as const

export type LanguageCode = keyof typeof languages

export const defaultLanguage: LanguageCode = 'zh-CN'

// 获取语言的文字方向
export function getLanguageDirection(lang: LanguageCode): 'ltr' | 'rtl' {
  return languages[lang]?.dir ?? 'ltr'
}

// 是否为 RTL 语言
export function isRTL(lang: LanguageCode): boolean {
  return getLanguageDirection(lang) === 'rtl'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en': { translation: en },
      'ar': { translation: ar },
    },
    lng: defaultLanguage,
    fallbackLng: defaultLanguage,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n
