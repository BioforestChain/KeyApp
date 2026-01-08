/**
 * BioForest 转账流程测试
 */

import { test, expect } from '@playwright/test'
import * as crypto from 'crypto'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const FUND_MNEMONIC = process.env.E2E_TEST_MNEMONIC ?? ''
const FUND_ADDRESS = process.env.E2E_TEST_ADDRESS ?? ''
const WALLET_PATTERN = '0,1,2,5,8' // 钱包锁图案：L形
const API_BASE = 'https://walletapi.bfmeta.info'
const CHAIN_PATH = 'bfm'
const CHAIN_MAGIC = 'nxOGQ'

const BIP39_WORDS = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract']
function randomMnemonic(): string {
  return Array.from({ length: 12 }, () => BIP39_WORDS[crypto.randomInt(0, 8)]).join(' ')
}

async function getBalance(address: string): Promise<number> {
  const res = await fetch(`${API_BASE}/wallet/${CHAIN_PATH}/address/balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, magic: CHAIN_MAGIC, assetType: 'BFM' }),
  })
  const json = await res.json() as { success: boolean; result?: { amount: string } }
  return json.success ? Number(json.result?.amount ?? 0) : 0
}

async function getTxCount(address: string): Promise<number> {
  const res = await fetch(`${API_BASE}/wallet/${CHAIN_PATH}/transactions/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderId: address, offset: 0, limit: 1 }),
  })
  const json = await res.json() as { success: boolean; result?: { count: number } }
  return json.success ? json.result?.count ?? 0 : 0
}

const describeOrSkip = FUND_MNEMONIC ? test.describe : test.describe.skip

describeOrSkip('BioForest 转账测试', () => {
  test.setTimeout(150000) // 2.5 分钟

  let tempMnemonic: string
  let tempAddress: string

  test.afterEach(async ({ page }) => {
    if (!tempAddress) return
    const balance = await getBalance(tempAddress)
    if (balance <= 1000) {
      console.log('💰 余额不足，无需归还')
      return
    }
    console.log(`💰 归还 ${balance / 1e8} BFM...`)
    try {
      await page.evaluate(async ({ mnemonic, toAddr, amt }) => {
        // @ts-expect-error
        const sdk = await import('/src/services/bioforest-sdk/index.ts')
        const baseUrl = `${API_BASE}/wallet/${CHAIN_PATH}`
        const core = await sdk.getBioforestCore('bfmeta')
        const fromAddr = await core.accountBaseHelper().getAddressFromSecret(mnemonic)
        const tx = await sdk.createTransferTransaction({
          baseUrl,
          chainId: 'bfmeta',
          mainSecret: mnemonic,
          from: fromAddr,
          to: toAddr,
          amount: String(amt - 500),
          assetType: 'BFM',
          fee: '500',
        })
        await sdk.broadcastTransaction(baseUrl, tx).catch(() => {})
      }, { mnemonic: tempMnemonic, toAddr: FUND_ADDRESS, amt: balance, API_BASE, CHAIN_PATH })
      console.log('✅ 归还完成')
    } catch (e) {
      console.log('⚠️ 归还失败:', e)
    }
  })

  test('完整转账流程', async ({ page }) => {
    page.on('console', msg => {
      const text = msg.text()
      if (msg.type() === 'error' || text.includes('submit') || text.includes('Transfer')) {
        console.log('[Browser]', text)
      }
    })

    // 1. 生成临时地址作为转账目标
    console.log('1. 生成临时地址...')
    tempMnemonic = randomMnemonic()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    tempAddress = await page.evaluate(async (m) => {
      // @ts-expect-error
      const { getBioforestCore } = await import('/src/services/bioforest-sdk/index.ts')
      const core = await getBioforestCore('bfmeta')
      return await core.accountBaseHelper().getAddressFromSecret(m)
    }, tempMnemonic)
    console.log(`   临时地址: ${tempAddress.slice(0, 10)}...`)

    // 2. 检查资金账户
    console.log('2. 检查资金账户...')
    const fundBalance = await getBalance(FUND_ADDRESS)
    console.log(`   余额: ${fundBalance / 1e8} BFM`)
    expect(fundBalance).toBeGreaterThan(10000)

    const txCountBefore = await getTxCount(FUND_ADDRESS)
    console.log(`   交易数: ${txCountBefore}`)

    // 3. 导入资金账户钱包
    console.log('3. 导入钱包...')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForLoadState('networkidle')

    await page.locator('[data-testid="import-wallet-button"]').click()
    await page.locator('[data-testid="continue-button"]').click()
    await page.locator('[data-testid="mnemonic-textarea"]').fill(FUND_MNEMONIC)
    await page.locator('[data-testid="continue-button"]').click()
    await page.locator('[data-testid="pattern-lock-input"]').fill(WALLET_PATTERN)
    const confirmInput = page.locator('[data-testid="pattern-lock-confirm"]')
    if (await confirmInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmInput.fill(WALLET_PATTERN)
    }
    await page.locator('[data-testid="continue-button"]').click()
    await page.locator('[data-testid="enter-wallet-button"]').click()
    await page.waitForLoadState('networkidle')
    console.log('   ✅ 钱包导入完成')

    // 4. 切换到 BFMeta 链
    console.log('4. 切换到 BFMeta...')
    const chainSelector = page.locator('[data-testid="chain-selector"]')
    if (await chainSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
      await chainSelector.click()
      const bfmetaOption = page.locator('[data-testid="chain-option-bfmeta"]')
      if (await bfmetaOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await bfmetaOption.click()
        await page.waitForTimeout(500)
      }
    }
    console.log('   ✅ 链切换完成')

    // 5. 进入发送页面并填写
    console.log('5. 填写转账信息...')
    await page.locator('[data-testid="send-button"]:visible').click()
    await page.waitForTimeout(500)
    
    await page.locator('[data-testid="address-input"]').fill(tempAddress)
    await page.locator('[data-testid="amount-input"]').fill('0.00001')
    console.log('   ✅ 信息填写完成')

    // 6. 等待手续费并继续
    console.log('6. 等待手续费...')
    const continueBtn = page.locator('[data-testid="send-continue-button"]')
    await expect(continueBtn).toBeEnabled({ timeout: 15000 })
    await continueBtn.click()
    console.log('   ✅ 继续到确认页')

    // 7. 确认转账
    console.log('7. 确认转账...')
    const confirmBtn = page.locator('[data-testid="confirm-transfer-button"]')
    await expect(confirmBtn).toBeVisible({ timeout: 5000 })
    await confirmBtn.click()
    console.log('   ✅ 点击确认')

    // 8. 验证钱包锁
    console.log('8. 验证钱包锁...')
    const pwdInput = page.locator('[data-testid="wallet-pattern-input"]')
    await expect(pwdInput).toBeVisible({ timeout: 5000 })
    await pwdInput.fill(WALLET_PATTERN)
    await page.locator('[data-testid="wallet-lock-confirm-button"]').click()
    console.log('   ✅ 钱包锁验证')

    // 9. 等待结果
    console.log('9. 等待交易处理...')
    await page.waitForTimeout(3000)

    // 10. 检查交易是否上链
    console.log('10. 等待上链（最多 45 秒）...')
    let confirmed = false
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(15000)
      const newCount = await getTxCount(FUND_ADDRESS)
      console.log(`   检查 ${i + 1}/3: 交易数 ${newCount}`)
      if (newCount > txCountBefore) {
        confirmed = true
        break
      }
    }

    if (confirmed) {
      console.log('✅ 交易已上链!')
      const newBalance = await getBalance(tempAddress)
      console.log(`   临时账户余额: ${newBalance / 1e8} BFM`)
      expect(newBalance).toBeGreaterThan(0)
    } else {
      console.log('⚠️ 交易未确认，检查临时账户余额...')
      const newBalance = await getBalance(tempAddress)
      console.log(`   临时账户余额: ${newBalance / 1e8} BFM`)
      // 即使 txCount 没变，余额变了也算成功
      expect(newBalance).toBeGreaterThan(0)
    }

    console.log('🎉 转账测试完成!')
  })
})
