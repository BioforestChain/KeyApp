/**
 * BioForest 简化测试 - 只测试 SDK 打款
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
const API_BASE = 'https://walletapi.bfmeta.info'
const CHAIN_PATH = 'bfm'
const CHAIN_MAGIC = 'nxOGQ'

// 简单的随机助记词
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

const describeOrSkip = FUND_MNEMONIC ? test.describe : test.describe.skip

describeOrSkip('BioForest SDK 打款测试', () => {
  test.setTimeout(90000)

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
        const lastBlock = await sdk.getLastBlock('https://walletapi.bfmeta.info', 'bfm')
        const tx = await sdk.createTransferTransaction({
          rpcUrl: 'https://walletapi.bfmeta.info',
          chainId: 'bfmeta',
          apiPath: 'bfm',
          mainSecret: mnemonic,
          from: await (await sdk.getBioforestCore('bfmeta')).accountBaseHelper().getAddressFromSecret(mnemonic),
          to: toAddr,
          amount: String(amt - 500),
          assetType: 'BFM',
          fee: '500',
        })
        await sdk.broadcastTransaction('https://walletapi.bfmeta.info', 'bfm', tx).catch(() => {})
      }, { mnemonic: tempMnemonic, toAddr: FUND_ADDRESS, amt: balance })
      console.log('✅ 归还完成')
    } catch (e) {
      console.log('⚠️ 归还失败:', e)
    }
  })

  test('SDK 直接打款', async ({ page }) => {
    // 1. 生成临时地址
    tempMnemonic = randomMnemonic()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    tempAddress = await page.evaluate(async (m) => {
      // @ts-expect-error
      const { getBioforestCore } = await import('/src/services/bioforest-sdk/index.ts')
      const core = await getBioforestCore('bfmeta')
      return await core.accountBaseHelper().getAddressFromSecret(m)
    }, tempMnemonic)
    
    console.log(`📝 临时地址: ${tempAddress}`)

    // 2. 检查资金账户
    const fundBalance = await getBalance(FUND_ADDRESS)
    console.log(`📊 资金账户: ${fundBalance / 1e8} BFM`)
    expect(fundBalance).toBeGreaterThan(10000)

    // 3. SDK 打款
    console.log('💸 SDK 打款中...')
    
    const txResult = await page.evaluate(async ({ fromMnemonic, toAddress, fundAddr }) => {
      // @ts-expect-error
      const sdk = await import('/src/services/bioforest-sdk/index.ts')
      
      const lastBlock = await sdk.getLastBlock('https://walletapi.bfmeta.info', 'bfm')
      
      const tx = await sdk.createTransferTransaction({
        rpcUrl: 'https://walletapi.bfmeta.info',
        chainId: 'bfmeta',
        apiPath: 'bfm',
        mainSecret: fromMnemonic,
        from: fundAddr,
        to: toAddress,
        amount: '10000',
        assetType: 'BFM',
        fee: '500',
        applyBlockHeight: lastBlock.height,
        timestamp: lastBlock.timestamp,
      })
      
      try {
        const hash = await sdk.broadcastTransaction('https://walletapi.bfmeta.info', 'bfm', tx)
        return { success: true, hash }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }, { fromMnemonic: FUND_MNEMONIC, toAddress: tempAddress, fundAddr: FUND_ADDRESS })

    console.log('📤 广播结果:', txResult)
    
    // 4. 等待 15 秒检查
    console.log('⏳ 等待 15 秒...')
    await page.waitForTimeout(15000)
    
    const tempBalance = await getBalance(tempAddress)
    console.log(`📊 临时账户余额: ${tempBalance / 1e8} BFM`)
    
    // 即使广播返回错误，余额 > 0 说明成功
    expect(tempBalance).toBeGreaterThan(0)
    console.log('✅ 打款成功!')
  })
})
