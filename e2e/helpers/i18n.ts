/**
 * E2E 测试国际化辅助
 * 
 * 提供双语文本匹配，确保测试不依赖特定语言
 */

import type { Page, Locator } from '@playwright/test'

/**
 * 常用 UI 文本的多语言映射
 * 
 * 使用方式：
 * - 优先使用 data-testid
 * - 必须用文本时，使用此映射的正则表达式
 */
export const UI_TEXT = {
  // 按钮
  confirm: /确认|Confirm/i,
  cancel: /取消|Cancel/i,
  continue: /继续|Continue|Next/i,
  back: /返回|Back/i,
  save: /保存|Save/i,
  delete: /删除|Delete/i,
  edit: /编辑|Edit/i,
  add: /添加|Add/i,
  send: /发送|转账|Send|Transfer/i,
  receive: /收款|Receive/i,
  copy: /复制|Copy|Copied/i,
  refresh: /刷新|Refresh/i,
  
  // 导航
  home: /首页|Home/i,
  settings: /设置|Settings/i,
  history: /历史|History/i,
  wallet: /钱包|Wallet/i,
  
  // 钱包操作
  createWallet: /创建钱包|Create Wallet/i,
  importWallet: /导入钱包|Import Wallet/i,
  recoverWallet: /恢复钱包|Recover Wallet/i,
  exportMnemonic: /导出助记词|Export Mnemonic/i,
  
  // 状态
  loading: /加载中|Loading/i,
  empty: /暂无|empty|no.*data|no.*record/i,
  success: /成功|Success/i,
  error: /错误|失败|Error|Failed/i,
  
  // 授权
  confirmTransaction: /确认.*交易|请确认|Confirm.*Transaction/i,
  drawPattern: /绘制图案|Draw Pattern/i,
  insufficientBalance: /余额不足|Insufficient Balance/i,
  
  // 安全
  setWalletLock: /设置钱包锁|Set Wallet Lock/i,
  enterPatternLock: /设置图案|Draw Pattern/i,
  confirmPattern: /确认图案|Confirm Pattern/i,
  
  // 链相关
  selectChain: /选择链|Select Chain/i,
  chainConfig: /链配置|Chain Config/i,
} as const

/**
 * 根据语言获取 aria-label 的正则
 */
export function getAriaLabel(key: keyof typeof UI_TEXT): RegExp {
  return UI_TEXT[key]
}

/**
 * 创建多语言文本定位器
 * 
 * @example
 * const btn = i18nLocator(page, 'button', UI_TEXT.confirm)
 * await btn.click()
 */
export function i18nLocator(page: Page, selector: string, text: RegExp): Locator {
  return page.locator(`${selector}:has-text("${text.source}")`)
}

/**
 * 等待多语言文本出现
 */
export async function waitForI18nText(page: Page, text: RegExp, options?: { timeout?: number }) {
  await page.waitForSelector(`text=${text.source}`, options)
}

/**
 * 设置页面语言
 * 
 * @param page Playwright 页面
 * @param lang 语言代码: 'en' | 'zh-CN' | 'zh-TW' | 'ar'
 */
export async function setLanguage(page: Page, lang: string) {
  await page.addInitScript((language) => {
    localStorage.setItem('bfm_preferences', JSON.stringify({ 
      language, 
      currency: 'USD' 
    }))
  }, lang)
}

/**
 * 获取当前测试的语言设置
 * 从环境变量 TEST_LOCALE 中提取
 */
export function getTestLocale(): string {
  return process.env.TEST_LOCALE || 'en-US'
}

/**
 * 创建带语言后缀的截图名称
 * 
 * @example
 * await expect(page).toHaveScreenshot(screenshotName('home', lang))
 * // 生成: home-en.png 或 home-zh-CN.png
 */
export function screenshotName(name: string, lang: string): string {
  return `${name}-${lang}.png`
}

/**
 * 常用的 data-testid 列表
 * 优先使用这些，避免依赖文本
 */
export const TEST_IDS = {
  // 按钮
  createWalletButton: 'create-wallet-button',
  importWalletButton: 'import-wallet-button',
  continueButton: 'continue-button',
  confirmButton: 'confirm-button',
  cancelButton: 'cancel-button',
  sendButton: 'send-button',
  receiveButton: 'receive-button',
  copyButton: 'copy-button',
  
  // 表单
  sendForm: 'send-form',
  addressInput: 'address-input',
  amountInput: 'amount-input',
  
  // 组件
  chainSelector: 'chain-selector',
  chainSheet: 'chain-sheet',
  walletName: 'wallet-name',
  patternLockSetGrid: 'pattern-lock-set-grid',
  patternLockConfirmGrid: 'pattern-lock-confirm-grid',
  
  // 步骤
  mnemonicStep: 'mnemonic-step',
  patternStep: 'pattern-step',
  chainSelectorStep: 'chain-selector-step',
  
  // 页面
  homePage: 'home-page',
  sendPage: 'send-page',
  receivePage: 'receive-page',
  settingsPage: 'settings-page',
  historyPage: 'history-page',
} as const

/**
 * 通过 testid 获取定位器
 */
export function byTestId(page: Page, testId: string): Locator {
  return page.locator(`[data-testid="${testId}"]`)
}
