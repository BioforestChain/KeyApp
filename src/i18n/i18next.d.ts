import 'i18next'

import type authorize from './locales/zh-CN/authorize.json'
import type common from './locales/zh-CN/common.json'
import type currency from './locales/zh-CN/currency.json'
import type dweb from './locales/zh-CN/dweb.json'
import type empty from './locales/zh-CN/empty.json'
import type error from './locales/zh-CN/error.json'
import type guide from './locales/zh-CN/guide.json'
import type home from './locales/zh-CN/home.json'
import type migration from './locales/zh-CN/migration.json'
import type notification from './locales/zh-CN/notification.json'
import type onboarding from './locales/zh-CN/onboarding.json'
import type scanner from './locales/zh-CN/scanner.json'
import type security from './locales/zh-CN/security.json'
import type settings from './locales/zh-CN/settings.json'
import type staking from './locales/zh-CN/staking.json'
import type time from './locales/zh-CN/time.json'
import type token from './locales/zh-CN/token.json'
import type transaction from './locales/zh-CN/transaction.json'
import type wallet from './locales/zh-CN/wallet.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      authorize: typeof authorize
      common: typeof common
      currency: typeof currency
      dweb: typeof dweb
      empty: typeof empty
      error: typeof error
      guide: typeof guide
      home: typeof home
      migration: typeof migration
      notification: typeof notification
      onboarding: typeof onboarding
      scanner: typeof scanner
      security: typeof security
      settings: typeof settings
      staking: typeof staking
      time: typeof time
      token: typeof token
      transaction: typeof transaction
      wallet: typeof wallet
    }
  }
}
