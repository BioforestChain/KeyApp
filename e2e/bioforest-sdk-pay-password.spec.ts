/**
 * SDK 设置支付密码测试（不经过 UI）
 */

import { test, expect } from '@playwright/test'
import * as bip39 from 'bip39'
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

async function getBalance(address: string): Promise<number> {
  const res = await fetch(`${API_BASE}/wallet/${CHAIN_PATH}/address/balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, magic: CHAIN_MAGIC, assetType: 'BFM' }),
  })
  const json = await res.json() as { success: boolean; result?: { amount: string } }
  return json.success ? Number(json.result?.amount ?? 0) : 0
}

async function hasSecondPublicKey(address: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/wallet/${CHAIN_PATH}/address/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  })
  const json = await res.json() as { success: boolean; result?: { secondPublicKey?: string } }
  return !!json.result?.secondPublicKey
}

const describeOrSkip = FUND_MNEMONIC ? test.describe : test.describe.skip

describeOrSkip('SDK 设置支付密码', () => {
  test.setTimeout(120000)

  test('SDK 设置支付密码', async ({ page }) => {
    // 捕获控制台日志
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('[DEBUG]')) console.log('[Browser]', text)
    })

    // 生成临时账户
    console.log('1. 生成临时账户...')
    const tempMnemonic = bip39.generateMnemonic()
    const payPassword = 'test-pay-pwd'
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const tempAddress = await page.evaluate(async (m) => {
      // @ts-expect-error
      const { getBioforestCore } = await import('/src/services/bioforest-sdk/index.ts')
      const core = await getBioforestCore('bfmeta')
      return await core.accountBaseHelper().getAddressFromSecret(m)
    }, tempMnemonic)
    console.log(`   地址: ${tempAddress}`)

    // 检查是否已有支付密码
    const hasKey = await hasSecondPublicKey(tempAddress)
    console.log(`   已有支付密码: ${hasKey}`)
    expect(hasKey).toBe(false)

    // 检查资金账户余额
    const fundBalance = await getBalance(FUND_ADDRESS)
    console.log(`   资金账户余额: ${fundBalance / 1e8} BFM`)
    if (fundBalance < 50000) {
      console.log('⚠️ 资金账户余额不足，跳过测试')
      test.skip()
      return
    }

    // SDK 打款
    console.log('2. SDK 打款 0.0003 BFM...')
    await page.evaluate(async ({ fromMnemonic, toAddress, fundAddr }) => {
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
        amount: '30000', // 0.0003 BFM (足够设置支付密码)
        assetType: 'BFM',
        fee: '500',
        applyBlockHeight: lastBlock.height,
        timestamp: lastBlock.timestamp,
      })
      const result = await sdk.broadcastTransaction('https://walletapi.bfmeta.info', 'bfm', tx).catch(e => e)
      console.log('[DEBUG] 打款广播结果:', result)
    }, { fromMnemonic: FUND_MNEMONIC, toAddress: tempAddress, fundAddr: FUND_ADDRESS })

    // 等待上链（最多 45 秒）
    console.log('   等待上链...')
    let balance = 0
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(15000)
      balance = await getBalance(tempAddress)
      console.log(`   检查 ${i + 1}/3: ${balance / 1e8} BFM`)
      if (balance > 0) break
    }
    expect(balance).toBeGreaterThan(0)

    // SDK 设置支付密码
    console.log('3. SDK 设置支付密码...')
    await page.evaluate(async ({ mnemonic, payPwd }) => {
      // @ts-expect-error
      const sdk = await import('/src/services/bioforest-sdk/index.ts')
      const lastBlock = await sdk.getLastBlock('https://walletapi.bfmeta.info', 'bfm')
      const core = await sdk.getBioforestCore('bfmeta')
      
      const fee = await core.transactionController.getSignatureTransactionMinFee({
        newPaySecret: payPwd,
        applyBlockHeight: lastBlock.height,
        timestamp: lastBlock.timestamp,
      })
      
      const tx = await core.transactionController.createSignatureTransactionJSON(
        { mainSecret: mnemonic },
        {
          newPaySecret: payPwd,
          fee,
          applyBlockHeight: lastBlock.height,
          timestamp: lastBlock.timestamp,
          effectiveBlockHeight: lastBlock.height + 100,
        },
      )
      
      // 广播可能返回 "rejected" 但交易实际成功，忽略异常
      await sdk.broadcastTransaction('https://walletapi.bfmeta.info', 'bfm', tx).catch(() => {})
    }, { mnemonic: tempMnemonic, payPwd: payPassword })
    console.log('   广播完成')

    // 等待上链
    console.log('4. 等待上链...')
    await page.waitForTimeout(15000)

    // 验证
    const hasKeyAfter = await hasSecondPublicKey(tempAddress)
    console.log(`   设置后有支付密码: ${hasKeyAfter}`)
    
    if (!hasKeyAfter) {
      // 再等一次
      await page.waitForTimeout(15000)
      const hasKeyAfter2 = await hasSecondPublicKey(tempAddress)
      console.log(`   再次检查: ${hasKeyAfter2}`)
      expect(hasKeyAfter2).toBe(true)
    } else {
      expect(hasKeyAfter).toBe(true)
    }

    // 归还资金
    console.log('5. 归还资金...')
    const finalBalance = await getBalance(tempAddress)
    if (finalBalance > 1000) {
      await page.evaluate(async ({ mnemonic, payPwd, toAddr, balance }) => {
        // @ts-expect-error
        const sdk = await import('/src/services/bioforest-sdk/index.ts')
        const lastBlock = await sdk.getLastBlock('https://walletapi.bfmeta.info', 'bfm')
        
        // @ts-expect-error
        const { getBioforestCore } = await import('/src/services/bioforest-sdk/index.ts')
        const core = await getBioforestCore('bfmeta')
        const fromAddr = await core.accountBaseHelper().getAddressFromSecret(mnemonic)
        
        const returnAmount = String(Math.max(0, balance - 5000))
        
        // 使用支付密码转账
        const tx = await sdk.createTransferTransaction({
          rpcUrl: 'https://walletapi.bfmeta.info',
          chainId: 'bfmeta',
          apiPath: 'bfm',
          mainSecret: mnemonic,
          paySecret: payPwd, // 使用支付密码
          from: fromAddr,
          to: toAddr,
          amount: returnAmount,
          assetType: 'BFM',
          fee: '500',
          applyBlockHeight: lastBlock.height,
          timestamp: lastBlock.timestamp,
        })
        await sdk.broadcastTransaction('https://walletapi.bfmeta.info', 'bfm', tx).catch(() => {})
      }, { mnemonic: tempMnemonic, payPwd: payPassword, toAddr: FUND_ADDRESS, balance: finalBalance })

      await page.waitForTimeout(15000)
      const remaining = await getBalance(tempAddress)
      console.log(`   剩余: ${remaining / 1e8} BFM`)
    }

    console.log('🎉 测试完成!')
  })
})
