/**
 * BioBridge E2E 测试国际化辅助
 */

import type { Page, Locator } from '@playwright/test'

export const UI_TEXT = {
  app: {
    title: { source: '跨链通', pattern: /跨链通|BioBridge/i },
    subtitle: { source: '跨链桥接', pattern: /跨链桥接|Cross-chain Bridge/i },
  },
  mode: {
    recharge: { source: '锻造', pattern: /锻造|Forge/i },
    redemption: { source: '赎回', pattern: /赎回|Redemption/i },
  },
  connect: {
    button: { source: '连接钱包', pattern: /连接钱包|Connect Wallet/i },
    loading: { source: '连接中', pattern: /连接中|Connecting/i },
    configError: { source: 'Network Error', pattern: /Network Error|Failed to load config/i },
  },
  swap: {
    pay: { source: '支付', pattern: /支付|Pay/i },
    receive: { source: '获得', pattern: /获得|Receive/i },
    button: { source: '兑换', pattern: /兑换|Swap/i },
    preview: { source: '预览交易', pattern: /预览交易|Preview/i },
  },
  confirm: {
    title: { source: '确认锻造', pattern: /确认锻造|Confirm Recharge/i },
    button: { source: '确认锻造', pattern: /确认锻造|Confirm/i },
  },
  success: {
    title: { source: '完成', pattern: /完成|Complete/i },
    continue: { source: '继续', pattern: /继续|Continue/i },
  },
  token: {
    select: { source: '选择币种', pattern: /选择币种|Select Token/i },
    selected: { source: '已选', pattern: /已选|Selected/i },
  },
  processing: {
    signingExternal: { source: '签名外链交易', pattern: /签名外链交易|Signing External/i },
    signingInternal: { source: '签名内链消息', pattern: /签名内链消息|Signing Internal/i },
    submitting: { source: '提交请求', pattern: /提交请求|Submitting/i },
  },
  error: {
    sdkNotInit: { source: 'Bio SDK not initialized', pattern: /Bio SDK not initialized|Bio SDK 未初始化/i },
  },
  redemption: {
    title: { source: '赎回', pattern: /赎回|Redemption/i },
    from: { source: '从', pattern: /从|From/i },
    to: { source: '到', pattern: /到|To/i },
    fee: { source: '手续费', pattern: /手续费|Fee/i },
    preview: { source: '预览赎回', pattern: /预览赎回|Preview Redemption/i },
    confirm: { source: '确认赎回', pattern: /确认赎回|Confirm Redemption/i },
  },
} as const

export const TEST_IDS = {
  connectButton: 'connect-button',
  swapForm: 'swap-form',
  payAmountInput: 'pay-amount-input',
  receiveAmountInput: 'receive-amount-input',
  payTokenSelector: 'pay-token-selector',
  receiveTokenSelector: 'receive-token-selector',
  swapButton: 'swap-button',
  confirmButton: 'confirm-button',
  cancelButton: 'cancel-button',
  tokenPicker: 'token-picker',
  tokenList: 'token-list',
  successDialog: 'success-dialog',
  doneButton: 'done-button',
} as const

export function byTestId(page: Page, testId: string): Locator {
  return page.locator(`[data-testid="${testId}"]`)
}

export function i18nLocator(page: Page, selector: string, text: RegExp): Locator {
  return page.locator(`${selector}:has-text("${text.source}")`)
}

export async function setLanguage(page: Page, lang: string) {
  await page.addInitScript((language) => {
    localStorage.setItem('i18nextLng', language)
  }, lang)
}
