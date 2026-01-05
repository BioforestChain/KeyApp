import { test, expect } from '@playwright/test'
import { UI_TEXT } from './helpers/i18n'

/**
 * DWEB/Plaoc Authorize E2E screenshot tests (mock-first)
 *
 * Covers OpenSpec add-dweb-authorize Phase A 8.x screenshots.
 * 
 * 注意：使用 data-testid 和多语言正则，避免硬编码文本
 */

const TEST_WALLET_DATA = {
  wallets: [
    {
      id: 'test-wallet-1',
      name: '测试钱包 A',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      chain: 'ethereum',
      chainAddresses: [
        { chain: 'ethereum', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', tokens: [{ id: 'ETH', symbol: 'ETH', balance: '10.0', decimals: 18 }] },
        { chain: 'bfmeta', address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3', tokens: [] },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test', iterations: 100000 },
      createdAt: 1700000000000,
      tokens: [],
    },
    {
      id: 'test-wallet-2',
      name: '测试钱包 B',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'ethereum',
      chainAddresses: [
        { chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] },
        { chain: 'ccchain', address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3', tokens: [] },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test', iterations: 100000 },
      createdAt: 1700000000000,
      tokens: [],
    },
  ],
  currentWalletId: 'test-wallet-1',
  selectedChain: 'ethereum',
}

// signaturedata fixtures for E2E tests
const SIGNATURE_DATA = {
  transfer: JSON.stringify([{
    type: 1,
    chainName: 'ethereum',
    senderAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    receiveAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    balance: '0.5',
    fee: '0.002',
    assetType: 'ETH',
  }]),
  insufficientBalance: JSON.stringify([{
    type: 1,
    chainName: 'ethereum',
    senderAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    receiveAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    balance: '999999',
    fee: '0.002',
    assetType: 'ETH',
  }]),
}

async function injectTestWallet(page: import('@playwright/test').Page) {
  // Use addInitScript to inject localStorage BEFORE the page loads.
  await page.addInitScript((data) => {
    localStorage.clear()
    localStorage.setItem('bfm_wallets', JSON.stringify(data))
  }, TEST_WALLET_DATA)
}

test.describe('DWEB 授权 - 截图测试', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestWallet(page)
  })

  test('地址授权页面', async ({ page }) => {
    await page.goto('/#/authorize/address/test-event?type=main')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500) // 等待页面渲染完成
    await expect(page).toHaveScreenshot('authorize-address-page.png')
  })

  test('钱包选择器（main）', async ({ page }) => {
    await page.goto('/#/authorize/address/test-event?type=main')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('authorize-wallet-selector-main.png')
  })

  test('链选择器（network）', async ({ page }) => {
    await page.goto('/#/authorize/address/test-event?type=network&chainName=ethereum')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('authorize-chain-selector-network.png')
  })

  test('签名授权页面（transfer）', async ({ page }) => {
    const signaturedata = encodeURIComponent(SIGNATURE_DATA.transfer)
    await page.goto(`/#/authorize/signature/sufficient-balance?signaturedata=${signaturedata}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('authorize-signature-transfer.png')
  })

  test('钱包锁确认弹窗', async ({ page }) => {
    const signaturedata = encodeURIComponent(SIGNATURE_DATA.transfer)
    await page.goto(`/#/authorize/signature/sufficient-balance?signaturedata=${signaturedata}`)
    await page.waitForLoadState('networkidle')

    // 点击确认按钮（使用多语言正则）
    await page.getByRole('button', { name: UI_TEXT.drawPattern }).click()
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('authorize-wallet-lock-confirm.png')
  })

  test('错误状态：余额不足', async ({ page }) => {
    const signaturedata = encodeURIComponent(SIGNATURE_DATA.insufficientBalance)
    await page.goto(`/#/authorize/signature/insufficient-balance?signaturedata=${signaturedata}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('authorize-error-balance.png')
  })
})

