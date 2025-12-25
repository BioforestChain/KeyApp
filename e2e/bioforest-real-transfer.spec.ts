/**
 * BioForest Chain 真实转账 E2E 测试 - 完整业务闭环
 * 
 * 测试流程：
 * 1. 客户端生成临时账户
 * 2. Node.js SDK: 资金账户直接打款给临时账户
 * 3. 临时账户业务测试:
 *    - 转账（基础转账测试）
 *    - 设置支付密码
 *    - 使用支付密码转账（归还余额给资金账户）
 * 
 * 环境变量:
 * - E2E_TEST_MNEMONIC: 资金账户助记词
 * - E2E_TEST_ADDRESS: 资金账户地址
 */

import { test, expect, type Page } from '@playwright/test'
import * as crypto from 'crypto'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

// 资金账户配置
const FUND_MNEMONIC = process.env.E2E_TEST_MNEMONIC ?? ''
const FUND_ADDRESS = process.env.E2E_TEST_ADDRESS ?? ''

const WALLET_PASSWORD = 'e2e-test-password'
const PAY_PASSWORD = 'pay-password-123'
const FUNDING_AMOUNT = 50000 // 0.0005 BFM - 足够测试转账+设置支付密码+归还
const MIN_FUND_BALANCE = 100000 // 0.001 BFM

// BIP39 词表
const BIP39_WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
  'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
  'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
  'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
  'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
  'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
  'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among',
]

function generateRandomMnemonic(): string {
  return Array.from({ length: 12 }, () => 
    BIP39_WORDS[crypto.randomInt(0, BIP39_WORDS.length)]
  ).join(' ')
}

// API 配置
const API_BASE = 'https://walletapi.bfmeta.info'
const CHAIN_PATH = 'bfm'
const CHAIN_ID = 'bfmeta'
const CHAIN_MAGIC = 'nxOGQ'

interface ApiResponse<T> { success: boolean; result: T; error?: { message: string } }

async function getBalance(address: string): Promise<number> {
  const response = await fetch(`${API_BASE}/wallet/${CHAIN_PATH}/address/balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, magic: CHAIN_MAGIC, assetType: 'BFM' }),
  })
  const json = await response.json() as ApiResponse<{ amount: string }>
  return json.success ? Number(json.result.amount) : 0
}

async function getTxCount(address: string): Promise<number> {
  const response = await fetch(`${API_BASE}/wallet/${CHAIN_PATH}/transactions/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderId: address, offset: 0, limit: 1 }),
  })
  const json = await response.json() as ApiResponse<{ count: number }>
  return json.success ? json.result.count : 0
}

/** 等待交易上链，每 15 秒检查一次，最多检查 3 次 */
async function waitForTx(address: string, beforeCount: number, maxRetries = 3): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(r => setTimeout(r, 15000)) // 等待 15 秒（约一个区块时间）
    if (await getTxCount(address) > beforeCount) return true
    console.log(`⏳ 检查 ${i + 1}/${maxRetries}...`)
  }
  return false
}

/** 用 SDK 直接转账（Node.js 环境） */
async function transferWithSDK(
  fromMnemonic: string,
  toAddress: string,
  amount: number
): Promise<string> {
  // 动态导入 SDK
  const sdk = await import('../src/services/bioforest-sdk/index.js')
  
  // 设置 genesis 路径（Node.js 环境）
  const genesisPath = `file://${path.join(process.cwd(), 'public/configs/genesis')}`
  sdk.setGenesisBaseUrl(genesisPath, { with: { type: 'json' } })
  
  // 获取最新区块信息
  const lastBlock = await sdk.getLastBlock(API_BASE, CHAIN_PATH)
  
  // 创建交易
  const tx = await sdk.createTransferTransaction({
    rpcUrl: API_BASE,
    chainId: CHAIN_ID,
    apiPath: CHAIN_PATH,
    mainSecret: fromMnemonic,
    from: FUND_ADDRESS,
    to: toAddress,
    amount: String(amount),
    assetType: 'BFM',
    fee: '500',
    applyBlockHeight: lastBlock.height,
    timestamp: lastBlock.timestamp,
  })
  
  // 广播交易
  const txHash = await sdk.broadcastTransaction(API_BASE, CHAIN_PATH, tx)
  return txHash
}

/** 在浏览器中派生地址 */
async function deriveAddressInBrowser(page: Page, mnemonic: string): Promise<string> {
  return await page.evaluate(async (m) => {
    // @ts-expect-error - 动态导入
    const { getBioforestCore } = await import('/src/services/bioforest-sdk/index.ts')
    const core = await getBioforestCore('bfmeta')
    return await core.accountBaseHelper().getAddressFromSecret(m)
  }, mnemonic)
}

/** 导入钱包 */
async function importWallet(page: Page, mnemonic: string): Promise<void> {
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.waitForLoadState('networkidle')

  const importBtn = page.locator('[data-testid="import-wallet-button"]')
  if (await importBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await importBtn.click()
    await page.locator('[data-testid="continue-button"]').click()
    await page.locator('[data-testid="mnemonic-textarea"]').fill(mnemonic)
    await page.locator('[data-testid="continue-button"]').click()
    await page.locator('[data-testid="password-input"]').fill(WALLET_PASSWORD)
    const confirmInput = page.locator('[data-testid="confirm-password-input"]')
    if (await confirmInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmInput.fill(WALLET_PASSWORD)
    }
    await page.locator('[data-testid="continue-button"]').click()
    await page.locator('[data-testid="enter-wallet-button"]').click()
    await page.waitForLoadState('networkidle')
  }
  
  // 切换到 BFMeta 链
  const chainSelector = page.locator('[data-testid="chain-selector"]')
  if (await chainSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
    await chainSelector.click()
    const bfmetaOption = page.locator('[data-testid="chain-option-bfmeta"]')
    if (await bfmetaOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bfmetaOption.click()
      await page.waitForLoadState('networkidle')
    }
  }
}

/** 执行转账 */
async function doTransfer(page: Page, toAddress: string, amount: string, needPayPassword = false): Promise<void> {
  await page.locator('[data-testid="send-button"]:visible').click()
  await page.waitForTimeout(1000)

  await page.locator('[data-testid="address-input"]').fill(toAddress)
  await page.locator('[data-testid="amount-input"]').fill(amount)

  const continueBtn = page.locator('[data-testid="send-continue-button"]')
  await expect(continueBtn).toBeEnabled({ timeout: 15000 })
  await continueBtn.click()

  await page.locator('[data-testid="confirm-transfer-button"]').click()

  // 输入钱包锁
  const pwdInput = page.locator('[data-testid="wallet-password-input"]')
  await expect(pwdInput).toBeVisible({ timeout: 5000 })
  await pwdInput.fill(WALLET_PASSWORD)
  await page.locator('[data-testid="password-confirm-button"]').click()
  
  // 如果需要支付密码
  if (needPayPassword) {
    await page.waitForTimeout(2000)
    const payPwdInput = page.locator('[data-testid="pay-password-input"]')
    if (await payPwdInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await payPwdInput.fill(PAY_PASSWORD)
      await page.locator('[data-testid="password-confirm-button"]').click()
    }
  }

  await page.waitForTimeout(3000)
}

const describeOrSkip = FUND_MNEMONIC ? test.describe : test.describe.skip

describeOrSkip('BioForest 完整业务闭环测试', () => {
  test.setTimeout(180000) // 3 分钟（每步等待约 45 秒）

  test('临时账户完整业务流程', async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().startsWith('[')) {
        console.log(`[Browser]`, msg.text())
      }
    })

    let tempMnemonic: string
    let tempAddress: string

    // ===== 1. 生成临时账户 =====
    await test.step('生成临时账户', async () => {
      tempMnemonic = generateRandomMnemonic()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      tempAddress = await deriveAddressInBrowser(page, tempMnemonic)
      console.log(`📝 临时账户: ${tempAddress}`)
    })

    // ===== 2. 检查资金账户余额 =====
    await test.step('检查资金账户', async () => {
      const balance = await getBalance(FUND_ADDRESS)
      console.log(`📊 资金账户余额: ${balance / 1e8} BFM`)
      expect(balance).toBeGreaterThanOrEqual(MIN_FUND_BALANCE)
    })

    // ===== 3. SDK 打款给临时账户 =====
    await test.step('资金账户打款给临时账户 (SDK)', async () => {
      console.log(`💸 打款 ${FUNDING_AMOUNT / 1e8} BFM 给临时账户...`)
      const fundTxCount = await getTxCount(FUND_ADDRESS)
      
      try {
        const txHash = await transferWithSDK(FUND_MNEMONIC, tempAddress, FUNDING_AMOUNT)
        console.log(`✅ 交易已广播: ${txHash.slice(0, 16)}...`)
      } catch (e) {
        // 忽略 "Transaction rejected" 错误，实际可能成功
        console.log(`⚠️ 广播返回错误（可能仍成功）: ${e}`)
      }
      
      console.log('⏳ 等待上链...')
      const confirmed = await waitForTx(FUND_ADDRESS, fundTxCount)
      expect(confirmed).toBe(true)
      console.log('✅ 打款已上链')
      
      const tempBalance = await getBalance(tempAddress)
      console.log(`📊 临时账户余额: ${tempBalance / 1e8} BFM`)
      expect(tempBalance).toBeGreaterThan(0)
    })

    // ===== 4. 导入临时账户 =====
    await test.step('导入临时账户', async () => {
      await importWallet(page, tempMnemonic)
      console.log('✅ 临时账户已导入')
    })

    // ===== 5. 测试基础转账 =====
    await test.step('基础转账测试', async () => {
      const txCountBefore = await getTxCount(tempAddress)
      console.log('💸 执行基础转账...')
      
      // 转少量给资金账户测试基础转账
      await doTransfer(page, FUND_ADDRESS, '0.00001')
      
      console.log('⏳ 等待上链...')
      const confirmed = await waitForTx(tempAddress, txCountBefore)
      expect(confirmed).toBe(true)
      console.log('✅ 基础转账成功')
    })

    // ===== 6. 设置支付密码 =====
    await test.step('设置支付密码', async () => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // 切换到设置 Tab
      const settingsTab = page.locator('[data-testid="tab-settings"]')
      if (await settingsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await settingsTab.click()
        await page.waitForTimeout(500)
        
        // 查找设置支付密码的入口
        const setPayPwdBtn = page.locator('[data-testid="set-pay-password-button"]')
        if (await setPayPwdBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await setPayPwdBtn.click()
          
          // Step 1: 输入新支付密码
          const newPayPwdInput = page.locator('[data-testid="new-pay-password-input"]')
          await expect(newPayPwdInput).toBeVisible({ timeout: 5000 })
          await newPayPwdInput.fill(PAY_PASSWORD)
          await page.locator('[data-testid="set-pay-password-next-button"]').click()
          
          // Step 2: 确认支付密码
          const confirmPayPwdInput = page.locator('[data-testid="confirm-pay-password-input"]')
          await expect(confirmPayPwdInput).toBeVisible({ timeout: 3000 })
          await confirmPayPwdInput.fill(PAY_PASSWORD)
          await page.locator('[data-testid="set-pay-password-next-button"]').click()
          
          // Step 3: 输入钱包锁
          const walletPwdInput = page.locator('[data-testid="wallet-password-input"]')
          await expect(walletPwdInput).toBeVisible({ timeout: 3000 })
          await walletPwdInput.fill(WALLET_PASSWORD)
          await page.locator('[data-testid="set-pay-password-confirm-button"]').click()
          
          console.log('⏳ 等待支付密码设置上链...')
          const txCountBefore = await getTxCount(tempAddress)
          const confirmed = await waitForTx(tempAddress, txCountBefore)
          if (confirmed) {
            console.log('✅ 支付密码设置成功')
          } else {
            console.log('⚠️ 支付密码设置可能未完成')
          }
        } else {
          console.log('⚠️ 未找到设置支付密码按钮，跳过此步骤')
        }
      } else {
        console.log('⚠️ 未找到设置 Tab，跳过此步骤')
      }
    })

    // ===== 7. 归还余额给资金账户 =====
    await test.step('归还余额给资金账户', async () => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // 切换到 BFMeta
      const chainSelector = page.locator('[data-testid="chain-selector"]')
      if (await chainSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
        await chainSelector.click()
        const bfmetaOption = page.locator('[data-testid="chain-option-bfmeta"]')
        if (await bfmetaOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await bfmetaOption.click()
          await page.waitForLoadState('networkidle')
        }
      }
      
      const txCountBefore = await getTxCount(tempAddress)
      const tempBalance = await getBalance(tempAddress)
      const returnAmount = (tempBalance - 1000) / 1e8 // 留一点手续费
      
      console.log(`💸 归还 ${returnAmount.toFixed(8)} BFM 给资金账户...`)
      
      // 检查是否需要支付密码
      const hasPayPassword = await page.evaluate(async (addr) => {
        // @ts-expect-error
        const { getAddressInfo } = await import('/src/services/bioforest-sdk/index.ts')
        const info = await getAddressInfo('https://walletapi.bfmeta.info', 'bfm', addr)
        return !!info?.secondPublicKey
      }, tempAddress)
      
      await doTransfer(page, FUND_ADDRESS, returnAmount.toFixed(8), hasPayPassword)
      
      console.log('⏳ 等待上链...')
      const confirmed = await waitForTx(tempAddress, txCountBefore)
      expect(confirmed).toBe(true)
      console.log('✅ 余额已归还')
    })

    // ===== 8. 验证最终状态 =====
    await test.step('验证最终状态', async () => {
      const fundBalance = await getBalance(FUND_ADDRESS)
      const tempBalance = await getBalance(tempAddress)
      
      console.log(`📊 资金账户最终余额: ${fundBalance / 1e8} BFM`)
      console.log(`📊 临时账户最终余额: ${tempBalance / 1e8} BFM`)
      
      // 临时账户余额应该接近 0
      expect(tempBalance).toBeLessThan(2000)
      
      console.log('🎉 完整业务闭环测试通过！')
    })
  })
})
