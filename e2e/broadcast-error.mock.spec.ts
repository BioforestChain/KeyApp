/**
 * 广播错误处理 E2E 测试
 * 
 * 测试场景：
 * 1. 广播失败时正确显示错误信息
 * 2. 错误信息使用 i18n 翻译
 * 3. 用户可以看到具体的错误原因
 * 
 * 使用 Mock API 模拟各种广播错误
 */

import { test, expect, type Page } from './fixtures'

// 模拟钱包数据
const TEST_WALLET_DATA = {
  wallets: [
    {
      id: 'test-wallet-1',
      name: '测试钱包',
      address: 'bXXXtestaddressXXX',
      chain: 'bfmeta',
      chainAddresses: [
        {
          chain: 'bfmeta',
          address: 'bXXXtestaddressXXX',
          tokens: [
            { symbol: 'BFM', balance: '0.001', decimals: 8 }, // 极少余额，容易触发余额不足
          ],
        },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test' },
      createdAt: Date.now(),
      tokens: [],
    },
  ],
  currentWalletId: 'test-wallet-1',
  selectedChain: 'bfmeta',
}

async function setupTestWallet(page: Page, targetUrl: string = '/', language: string = 'zh-CN') {
  await page.addInitScript((data) => {
    localStorage.setItem('bfm_wallets', JSON.stringify(data.wallet))
    localStorage.setItem('bfm_preferences', JSON.stringify({ language: data.lang, currency: 'USD' }))
  }, { wallet: TEST_WALLET_DATA, lang: language })

  const hashUrl = targetUrl === '/' ? '/' : `/#${targetUrl}`
  await page.goto(hashUrl)
  await page.waitForLoadState('networkidle')
}

test.describe('广播错误处理测试', () => {
  test.describe('BroadcastError 类测试', () => {
    test('BroadcastError 正确解析错误码 001-11028', async ({ page }) => {
      await page.goto('/')
      
      // 在浏览器中测试 BroadcastError 类
      const result = await page.evaluate(async () => {
        // @ts-expect-error - 动态导入
        const { BroadcastError, translateBroadcastError } = await import('/src/services/bioforest-sdk/errors.ts')
        
        const error = new BroadcastError('001-11028', 'Asset not enough', '500')
        const translated = translateBroadcastError(error)
        
        return {
          code: error.code,
          message: error.message,
          minFee: error.minFee,
          translated,
        }
      })
      
      expect(result.code).toBe('001-11028')
      expect(result.message).toBe('Asset not enough')
      expect(result.minFee).toBe('500')
      // 翻译后应该是中文（因为 i18n 默认是中文）
      expect(result.translated).toContain('余额')
    })

    test('BroadcastError 正确解析错误码 001-11029 (手续费不足)', async ({ page }) => {
      await page.goto('/')
      
      const result = await page.evaluate(async () => {
        // @ts-expect-error - 动态导入
        const { BroadcastError, translateBroadcastError } = await import('/src/services/bioforest-sdk/errors.ts')
        
        const error = new BroadcastError('001-11029', 'Fee not enough', '1000')
        const translated = translateBroadcastError(error)
        
        return { translated }
      })
      
      expect(result.translated).toContain('手续费')
    })

    test('未知错误码使用原始消息', async ({ page }) => {
      await page.goto('/')
      
      const result = await page.evaluate(async () => {
        // @ts-expect-error - 动态导入
        const { BroadcastError, translateBroadcastError } = await import('/src/services/bioforest-sdk/errors.ts')
        
        const error = new BroadcastError('999-99999', 'Unknown error from server')
        const translated = translateBroadcastError(error)
        
        return { translated }
      })
      
      // 未知错误码应该返回原始消息
      expect(result.translated).toBe('Unknown error from server')
    })
  })

  test.describe('PendingTxService 测试', () => {
    test('创建 pending tx 并更新状态', async ({ page }) => {
      await page.goto('/')
      
      const result = await page.evaluate(async () => {
        // @ts-expect-error - 动态导入
        const { pendingTxService } = await import('/src/services/transaction/index.ts')
        
        // 创建
        const created = await pendingTxService.create({
          walletId: 'test-wallet',
          chainId: 'bfmeta',
          fromAddress: 'bXXXtestXXX',
          rawTx: { signature: 'test-sig-123' },
          meta: {
            type: 'transfer',
            displayAmount: '1.5',
            displaySymbol: 'BFM',
            displayToAddress: 'bYYYtargetYYY',
          },
        })
        
        // 验证创建
        const initialStatus = created.status
        const hasRawTx = !!created.rawTx
        const hasMeta = !!created.meta
        
        // 更新状态为 broadcasting
        await pendingTxService.updateStatus({
          id: created.id,
          status: 'broadcasting',
        })
        
        // 模拟广播失败
        const failed = await pendingTxService.updateStatus({
          id: created.id,
          status: 'failed',
          errorCode: '001-11028',
          errorMessage: '资产余额不足',
        })
        
        // 获取并验证
        const retrieved = await pendingTxService.getById({ id: created.id })
        
        // 清理
        await pendingTxService.delete({ id: created.id })
        
        return {
          initialStatus,
          hasRawTx,
          hasMeta,
          finalStatus: retrieved?.status,
          errorCode: retrieved?.errorCode,
          errorMessage: retrieved?.errorMessage,
        }
      })
      
      expect(result.initialStatus).toBe('created')
      expect(result.hasRawTx).toBe(true)
      expect(result.hasMeta).toBe(true)
      expect(result.finalStatus).toBe('failed')
      expect(result.errorCode).toBe('001-11028')
      expect(result.errorMessage).toBe('资产余额不足')
    })

    test('getPending 返回所有未确认交易', async ({ page }) => {
      await page.goto('/')
      
      const result = await page.evaluate(async () => {
        // @ts-expect-error - 动态导入
        const { pendingTxService } = await import('/src/services/transaction/index.ts')
        
        const walletId = 'test-wallet-pending'
        
        // 创建多个不同状态的交易
        const tx1 = await pendingTxService.create({
          walletId,
          chainId: 'bfmeta',
          fromAddress: 'bXXX1',
          rawTx: { sig: '1' },
        })
        await pendingTxService.updateStatus({ id: tx1.id, status: 'broadcasting' })
        
        const tx2 = await pendingTxService.create({
          walletId,
          chainId: 'bfmeta',
          fromAddress: 'bXXX2',
          rawTx: { sig: '2' },
        })
        await pendingTxService.updateStatus({ id: tx2.id, status: 'failed', errorMessage: 'test error' })
        
        const tx3 = await pendingTxService.create({
          walletId,
          chainId: 'bfmeta',
          fromAddress: 'bXXX3',
          rawTx: { sig: '3' },
        })
        await pendingTxService.updateStatus({ id: tx3.id, status: 'confirmed' })
        
        // 获取 pending（应该不包含 confirmed）
        const pending = await pendingTxService.getPending({ walletId })
        
        // 清理
        await pendingTxService.deleteAll({ walletId })
        
        return {
          pendingCount: pending.length,
          statuses: pending.map((tx: { status: string }) => tx.status).sort(),
        }
      })
      
      // confirmed 不应该出现在 pending 列表中
      expect(result.pendingCount).toBe(2)
      expect(result.statuses).toEqual(['broadcasting', 'failed'])
    })
  })

  test.describe('i18n 翻译测试', () => {
    test('中文环境显示中文错误信息', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('bfm_preferences', JSON.stringify({ language: 'zh-CN' }))
      })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const result = await page.evaluate(async () => {
        // @ts-expect-error - 动态导入
        const i18n = (await import('/src/i18n/index.ts')).default
        await i18n.changeLanguage('zh-CN')
        
        return {
          assetNotEnough: i18n.t('transaction:broadcast.assetNotEnough'),
          feeNotEnough: i18n.t('transaction:broadcast.feeNotEnough'),
          rejected: i18n.t('transaction:broadcast.rejected'),
          unknown: i18n.t('transaction:broadcast.unknown'),
        }
      })
      
      expect(result.assetNotEnough).toBe('资产余额不足')
      expect(result.feeNotEnough).toBe('手续费不足')
      expect(result.rejected).toBe('交易被拒绝')
      expect(result.unknown).toBe('广播失败，请稍后重试')
    })

    test('英文环境显示英文错误信息', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('bfm_preferences', JSON.stringify({ language: 'en' }))
      })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const result = await page.evaluate(async () => {
        // @ts-expect-error - 动态导入
        const i18n = (await import('/src/i18n/index.ts')).default
        await i18n.changeLanguage('en')
        
        return {
          assetNotEnough: i18n.t('transaction:broadcast.assetNotEnough'),
          feeNotEnough: i18n.t('transaction:broadcast.feeNotEnough'),
        }
      })
      
      expect(result.assetNotEnough).toBe('Insufficient asset balance')
      expect(result.feeNotEnough).toBe('Insufficient fee')
    })
  })
})
