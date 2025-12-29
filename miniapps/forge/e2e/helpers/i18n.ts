/**
 * Forge E2E 测试国际化辅助
 */

import type { Page, Locator } from '@playwright/test'

export const UI_TEXT = {
  connect: {
    button: /连接钱包|Connect Wallet/i,
    loading: /连接中|Connecting/i,
  },
  swap: {
    pay: /支付|Pay/i,
    receive: /获得|Receive/i,
    button: /兑换|Swap/i,
    confirm: /确认兑换|Confirm Swap/i,
    preview: /预览交易|Preview|预览/i,
    max: /全部|Max/i,
  },
  confirm: {
    title: /确认兑换|Confirm Swap/i,
    button: /确认|Confirm/i,
    cancel: /取消|Cancel/i,
  },
  success: {
    title: /兑换成功|Swap Successful/i,
    done: /完成|Done/i,
  },
  token: {
    select: /选择代币|Select Token/i,
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
