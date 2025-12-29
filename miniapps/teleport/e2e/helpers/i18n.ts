/**
 * Teleport E2E 测试国际化辅助
 */

import type { Page, Locator } from '@playwright/test'

export const UI_TEXT = {
  connect: {
    button: /启动传送门|Start Teleport/i,
    loading: /连接中|加载配置中|Connecting|Loading/i,
  },
  asset: {
    select: /选择资产|Select Asset/i,
    noAssets: /当前链暂无可传送资产|No assets available/i,
  },
  amount: {
    next: /下一步|Next/i,
    max: /MAX/i,
    expected: /预计获得|Expected to receive/i,
  },
  target: {
    title: /目标钱包|Target Wallet/i,
    button: /选择目标钱包|Select Target Wallet/i,
    willTransfer: /即将传送|Will transfer/i,
  },
  confirm: {
    send: /发送|Send/i,
    receive: /接收|Receive/i,
    button: /确认传送|Confirm Transfer/i,
    free: /免费|Free/i,
  },
  processing: {
    title: /传送中|Transferring/i,
    waitingFrom: /等待发送方|Waiting for sender/i,
    waitingTo: /等待接收方|Waiting for receiver/i,
  },
  success: {
    title: /传送成功|Transfer Successful/i,
    newTransfer: /发起新传送|New Transfer/i,
  },
  error: {
    title: /传送失败|Transfer Failed/i,
    restart: /重新开始|Start Over/i,
    retry: /重试|Retry/i,
    sdkNotInit: /Bio SDK 未初始化|Bio SDK not initialized/i,
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
