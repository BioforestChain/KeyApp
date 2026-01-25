import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Namespace imports - en
import enCommon from './locales/en/common.json';
import enWallet from './locales/en/wallet.json';
import enTransaction from './locales/en/transaction.json';
import enSecurity from './locales/en/security.json';
import enStaking from './locales/en/staking.json';
import enDweb from './locales/en/dweb.json';
import enError from './locales/en/error.json';
import enSettings from './locales/en/settings.json';
import enToken from './locales/en/token.json';
import enTime from './locales/en/time.json';
import enEmpty from './locales/en/empty.json';
import enScanner from './locales/en/scanner.json';
import enGuide from './locales/en/guide.json';
import enMigration from './locales/en/migration.json';
import enAuthorize from './locales/en/authorize.json';
import enCurrency from './locales/en/currency.json';
import enOnboarding from './locales/en/onboarding.json';
import enNotification from './locales/en/notification.json';
import enHome from './locales/en/home.json';
import enEcosystem from './locales/en/ecosystem.json';
import enPermission from './locales/en/permission.json';
import enDevtools from './locales/en/devtools.json';

// Namespace imports - zh-CN
import zhCNCommon from './locales/zh-CN/common.json';
import zhCNWallet from './locales/zh-CN/wallet.json';
import zhCNTransaction from './locales/zh-CN/transaction.json';
import zhCNSecurity from './locales/zh-CN/security.json';
import zhCNStaking from './locales/zh-CN/staking.json';
import zhCNDweb from './locales/zh-CN/dweb.json';
import zhCNError from './locales/zh-CN/error.json';
import zhCNSettings from './locales/zh-CN/settings.json';
import zhCNToken from './locales/zh-CN/token.json';
import zhCNTime from './locales/zh-CN/time.json';
import zhCNEmpty from './locales/zh-CN/empty.json';
import zhCNScanner from './locales/zh-CN/scanner.json';
import zhCNGuide from './locales/zh-CN/guide.json';
import zhCNMigration from './locales/zh-CN/migration.json';
import zhCNAuthorize from './locales/zh-CN/authorize.json';
import zhCNCurrency from './locales/zh-CN/currency.json';
import zhCNOnboarding from './locales/zh-CN/onboarding.json';
import zhCNNotification from './locales/zh-CN/notification.json';
import zhCNHome from './locales/zh-CN/home.json';
import zhCNEcosystem from './locales/zh-CN/ecosystem.json';
import zhCNPermission from './locales/zh-CN/permission.json';
import zhCNDevtools from './locales/zh-CN/devtools.json';

// Namespace imports - zh-TW
import zhTWCommon from './locales/zh-TW/common.json';
import zhTWWallet from './locales/zh-TW/wallet.json';
import zhTWTransaction from './locales/zh-TW/transaction.json';
import zhTWSecurity from './locales/zh-TW/security.json';
import zhTWStaking from './locales/zh-TW/staking.json';
import zhTWDweb from './locales/zh-TW/dweb.json';
import zhTWError from './locales/zh-TW/error.json';
import zhTWSettings from './locales/zh-TW/settings.json';
import zhTWToken from './locales/zh-TW/token.json';
import zhTWTime from './locales/zh-TW/time.json';
import zhTWEmpty from './locales/zh-TW/empty.json';
import zhTWScanner from './locales/zh-TW/scanner.json';
import zhTWGuide from './locales/zh-TW/guide.json';
import zhTWMigration from './locales/zh-TW/migration.json';
import zhTWAuthorize from './locales/zh-TW/authorize.json';
import zhTWCurrency from './locales/zh-TW/currency.json';
import zhTWOnboarding from './locales/zh-TW/onboarding.json';
import zhTWNotification from './locales/zh-TW/notification.json';
import zhTWHome from './locales/zh-TW/home.json';
import zhTWEcosystem from './locales/zh-TW/ecosystem.json';
import zhTWPermission from './locales/zh-TW/permission.json';
import zhTWDevtools from './locales/zh-TW/devtools.json';

// Namespace imports - ar
import arCommon from './locales/ar/common.json';
import arWallet from './locales/ar/wallet.json';
import arTransaction from './locales/ar/transaction.json';
import arSecurity from './locales/ar/security.json';
import arStaking from './locales/ar/staking.json';
import arDweb from './locales/ar/dweb.json';
import arError from './locales/ar/error.json';
import arSettings from './locales/ar/settings.json';
import arToken from './locales/ar/token.json';
import arTime from './locales/ar/time.json';
import arEmpty from './locales/ar/empty.json';
import arScanner from './locales/ar/scanner.json';
import arGuide from './locales/ar/guide.json';
import arMigration from './locales/ar/migration.json';
import arAuthorize from './locales/ar/authorize.json';
import arCurrency from './locales/ar/currency.json';
import arOnboarding from './locales/ar/onboarding.json';
import arNotification from './locales/ar/notification.json';
import arHome from './locales/ar/home.json';
import arEcosystem from './locales/ar/ecosystem.json';
import arPermission from './locales/ar/permission.json';
import arDevtools from './locales/ar/devtools.json';

// 语言配置
export const languages = {
  'zh-CN': { name: '简体中文', dir: 'ltr' as const },
  'zh-TW': { name: '中文（繁體）', dir: 'ltr' as const },
  en: { name: 'English', dir: 'ltr' as const },
  ar: { name: 'العربية', dir: 'rtl' as const },
} as const;

export type LanguageCode = keyof typeof languages;

export const defaultLanguage: LanguageCode = 'zh-CN';

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
  'guide',
  'onboarding',
  'migration',
  'authorize',
  'currency',
  'notification',
  'home',
  'ecosystem',
  'permission',
  'devtools',
] as const;

export type Namespace = (typeof namespaces)[number];

export const defaultNS: Namespace = 'common';

// 获取语言的文字方向
export function getLanguageDirection(lang: LanguageCode): 'ltr' | 'rtl' {
  return languages[lang]?.dir ?? 'ltr';
}

// 是否为 RTL 语言
export function isRTL(lang: LanguageCode): boolean {
  return getLanguageDirection(lang) === 'rtl';
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
      guide: enGuide,
      onboarding: enOnboarding,
      migration: enMigration,
      authorize: enAuthorize,
      currency: enCurrency,
      notification: enNotification,
      home: enHome,
      ecosystem: enEcosystem,
      permission: enPermission,
      devtools: enDevtools,
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
      guide: zhCNGuide,
      onboarding: zhCNOnboarding,
      migration: zhCNMigration,
      authorize: zhCNAuthorize,
      currency: zhCNCurrency,
      notification: zhCNNotification,
      home: zhCNHome,
      ecosystem: zhCNEcosystem,
      permission: zhCNPermission,
      devtools: zhCNDevtools,
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
      guide: zhTWGuide,
      onboarding: zhTWOnboarding,
      migration: zhTWMigration,
      authorize: zhTWAuthorize,
      currency: zhTWCurrency,
      notification: zhTWNotification,
      home: zhTWHome,
      ecosystem: zhTWEcosystem,
      permission: zhTWPermission,
      devtools: zhTWDevtools,
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
      guide: arGuide,
      onboarding: arOnboarding,
      migration: arMigration,
      authorize: arAuthorize,
      currency: arCurrency,
      notification: arNotification,
      home: arHome,
      ecosystem: arEcosystem,
      permission: arPermission,
      devtools: arDevtools,
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
});

export default i18n;
