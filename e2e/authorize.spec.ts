import { test, expect } from '@playwright/test'

/**
 * DWEB/Plaoc Authorize E2E screenshot tests (mock-first)
 *
 * Covers OpenSpec add-dweb-authorize Phase A 8.x screenshots.
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

async function setupTestWallet(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate((data) => {
    localStorage.clear()
    localStorage.setItem('bfm_wallets', JSON.stringify(data))
  }, TEST_WALLET_DATA)
  await page.reload()
  await page.waitForSelector('[data-testid="chain-selector"]', { timeout: 10000 })
}

test.describe('DWEB 授权 - 截图测试', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestWallet(page)
  })

  test('地址授权页面', async ({ page }) => {
    await page.goto('/#/authorize/address/test-event?type=main')
    await page.waitForSelector('text=Mock DApp')
    await expect(page).toHaveScreenshot('authorize-address-page.png')
  })

  test('钱包选择器（main）', async ({ page }) => {
    await page.goto('/#/authorize/address/test-event?type=main')
    await page.waitForSelector('text=Mock DApp')
    await expect(page).toHaveScreenshot('authorize-wallet-selector-main.png')
  })

  test('链选择器（network）', async ({ page }) => {
    await page.goto('/#/authorize/address/test-event?type=network&chainName=ethereum')
    await page.waitForSelector('text=Mock DApp')

    const addressList = page.locator('[aria-label="Select address"]')
    await addressList.waitFor()
    await addressList.locator('button').first().click()

    await expect(page).toHaveScreenshot('authorize-chain-selector-network.png')
  })

  test('签名授权页面（transfer）', async ({ page }) => {
    const signaturedata = encodeURIComponent(SIGNATURE_DATA.transfer)
    await page.goto(`/#/authorize/signature/sufficient-balance?signaturedata=${signaturedata}`)
    await page.waitForSelector('text=Mock DApp')
    await page.waitForSelector('text=请确认该交易')
    await expect(page).toHaveScreenshot('authorize-signature-transfer.png')
  })

  test('密码确认弹窗', async ({ page }) => {
    const signaturedata = encodeURIComponent(SIGNATURE_DATA.transfer)
    await page.goto(`/#/authorize/signature/sufficient-balance?signaturedata=${signaturedata}`)
    await page.waitForSelector('text=Mock DApp')

    await page.click('button:has-text("输入密码确认")')
    await page.waitForSelector('input[placeholder="请输入密码"]')

    await expect(page).toHaveScreenshot('authorize-password-confirm.png')
  })

  test('错误状态：余额不足', async ({ page }) => {
    const signaturedata = encodeURIComponent(SIGNATURE_DATA.insufficientBalance)
    await page.goto(`/#/authorize/signature/insufficient-balance?signaturedata=${signaturedata}`)
    await page.waitForSelector('text=Mock DApp')
    await page.waitForSelector('text=余额不足')

    await expect(page).toHaveScreenshot('authorize-error-balance.png')
  })
})

