import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import zh from './locales/zh.json'
import en from './locales/en.json'

/**
 * Miniapp i18n 配置
 * 
 * Fallback 规则：
 * - zh-CN, zh-TW, zh-HK, zh-* → zh
 * - 其他语言 → en
 */

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: 'zh',
  fallbackLng: {
    'zh-CN': ['zh'],
    'zh-TW': ['zh'],
    'zh-HK': ['zh'],
    'zh': ['zh'],
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
