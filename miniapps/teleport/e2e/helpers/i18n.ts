/**
 * Teleport E2E 测试国际化辅助
 */

import type { Page, Locator } from '@playwright/test'

export const UI_TEXT = {
  connect: {
    button: /选择源钱包|启动传送门|Select Source Wallet/i,
    loading: /连接中|Connecting/i,
  },
  asset: {
    select: /选择要传送的资产|Select asset/i,
  },
  amount: {
    next: /下一步|Next/i,
    max: /全部|Max/i,
  },
  target: {
    title: /选择目标钱包|Select Target Wallet/i,
    button: /选择目标钱包|Select Target Wallet/i,
  },
  confirm: {
    title: /确认传送|Confirm Transfer/i,
    button: /确认传送|Confirm Transfer/i,
  },
  success: {
    title: /传送成功|Transfer Successful/i,
    done: /完成|Done/i,
  },
} as const

export const TEST_IDS = {
  connectButton: 'connect-button',
  assetList: 'asset-list',
  assetCard: 'asset-card',
  amountInput: 'amount-input',
  nextButton: 'next-button',
  targetButton: 'target-button',
  confirmButton: 'confirm-button',
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
