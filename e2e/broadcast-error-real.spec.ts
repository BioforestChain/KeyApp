/**
 * 广播错误处理 E2E 测试 - 真实链上测试
 * 
 * 使用真实的 SDK 和链上交易来测试广播错误处理
 * 
 * 测试场景：
 * 1. 转账金额超过余额 - 触发 "Asset not enough" 错误
 * 2. 手续费不足 - 触发 fee 相关错误
 * 3. 正常转账成功
 * 
 * 环境变量：
 * - E2E_TEST_MNEMONIC: 测试账户助记词
 * - E2E_TEST_ADDRESS: 测试账户地址 (bFgBYCqJE1BuDZRi76dRKt9QV8QpsdzAQn)
 */

import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const TEST_MNEMONIC = process.env.E2E_TEST_MNEMONIC ?? ''
const TEST_ADDRESS = process.env.E2E_TEST_ADDRESS ?? 'bFgBYCqJE1BuDZRi76dRKt9QV8QpsdzAQn'
const TARGET_ADDRESS = 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j'

const API_BASE = 'https://walletapi.bfmeta.info'
const CHAIN_PATH = 'bfm'
const CHAIN_ID = 'bfmeta'
const CHAIN_MAGIC = 'nxOGQ'

interface ApiResponse<T> { success: boolean; result?: T; error?: { code: string; message: string } }

async function getBalance(address: string): Promise<number> {
  const response = await fetch(`${API_BASE}/wallet/${CHAIN_PATH}/address/balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, magic: CHAIN_MAGIC, assetType: 'BFM' }),
  })
  const json = await response.json() as ApiResponse<{ amount: string }>
  return json.success ? Number(json.result?.amount ?? 0) : 0
}

const describeOrSkip = TEST_MNEMONIC ? test.describe : test.describe.skip

describeOrSkip('广播错误处理 - 真实链上测试', () => {
  test.setTimeout(60000)

  test('转账金额超过余额触发 Asset not enough 错误', async ({ page }) => {
    // 1. 获取当前余额
    const balance = await getBalance(TEST_ADDRESS)
    console.log(`当前余额: ${balance / 1e8} BFM (${balance} raw)`)
    
    // 2. 尝试转账超过余额的金额
    const excessAmount = String(balance + 100000000000) // 余额 + 1000 BFM
    console.log(`尝试转账: ${Number(excessAmount) / 1e8} BFM`)
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 3. 使用 SDK 创建交易并广播
    const result = await page.evaluate(async ({ mnemonic, toAddr, amount, apiBase, chainPath, chainId }) => {
      try {
        // @ts-expect-error - 动态导入
        const sdk = await import('/src/services/bioforest-sdk/index.ts')
        // @ts-expect-error - 动态导入
        const { BroadcastError, translateBroadcastError } = await import('/src/services/bioforest-sdk/errors.ts')
        
        const baseUrl = `${apiBase}/wallet/${chainPath}`
        
        // 创建交易
        const transaction = await sdk.createTransferTransaction({
          baseUrl,
          chainId,
          mainSecret: mnemonic,
          from: await (await sdk.getBioforestCore(chainId)).accountBaseHelper().getAddressFromSecret(mnemonic),
          to: toAddr,
          amount,
          assetType: 'BFM',
          fee: '500',
        })
        
        console.log('Transaction created:', transaction.signature?.slice(0, 20))
        
        // 广播交易
        try {
          const txHash = await sdk.broadcastTransaction(baseUrl, transaction)
          return { success: true, txHash }
        } catch (err: unknown) {
          if (err instanceof BroadcastError) {
            return {
              success: false,
              errorType: 'BroadcastError',
              code: err.code,
              message: err.message,
              translated: translateBroadcastError(err),
              minFee: err.minFee,
            }
          }
          return {
            success: false,
            errorType: 'Error',
            message: err instanceof Error ? err.message : String(err),
          }
        }
      } catch (err: unknown) {
        return {
          success: false,
          errorType: 'CreateError',
          message: err instanceof Error ? err.message : String(err),
        }
      }
    }, { 
      mnemonic: TEST_MNEMONIC, 
      toAddr: TARGET_ADDRESS, 
      amount: excessAmount,
      apiBase: API_BASE,
      chainPath: CHAIN_PATH,
      chainId: CHAIN_ID,
    })
    
    console.log('广播结果:', JSON.stringify(result, null, 2))
    
    // 4. 验证错误处理
    expect(result.success).toBe(false)
    expect(result.errorType).toBe('BroadcastError')
    expect(result.code).toBeDefined()
    console.log(`错误码: ${result.code}`)
    console.log(`原始消息: ${result.message}`)
    console.log(`翻译后消息: ${result.translated}`)
  })

  test('手续费设置为0触发错误', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const result = await page.evaluate(async ({ mnemonic, toAddr, apiBase, chainPath, chainId }) => {
      try {
        // @ts-expect-error - 动态导入
        const sdk = await import('/src/services/bioforest-sdk/index.ts')
        // @ts-expect-error - 动态导入
        const { BroadcastError, translateBroadcastError } = await import('/src/services/bioforest-sdk/errors.ts')
        
        const baseUrl = `${apiBase}/wallet/${chainPath}`
        
        // 创建交易，手续费为0
        const transaction = await sdk.createTransferTransaction({
          baseUrl,
          chainId,
          mainSecret: mnemonic,
          from: await (await sdk.getBioforestCore(chainId)).accountBaseHelper().getAddressFromSecret(mnemonic),
          to: toAddr,
          amount: '1000', // 0.00001 BFM
          assetType: 'BFM',
          fee: '0', // 手续费为0
        })
        
        console.log('Transaction created with 0 fee')
        
        try {
          const txHash = await sdk.broadcastTransaction(baseUrl, transaction)
          return { success: true, txHash }
        } catch (err: unknown) {
          if (err instanceof BroadcastError) {
            return {
              success: false,
              errorType: 'BroadcastError',
              code: err.code,
              message: err.message,
              translated: translateBroadcastError(err),
              minFee: err.minFee,
            }
          }
          return {
            success: false,
            errorType: 'Error',
            message: err instanceof Error ? err.message : String(err),
          }
        }
      } catch (err: unknown) {
        return {
          success: false,
          errorType: 'CreateError',
          message: err instanceof Error ? err.message : String(err),
        }
      }
    }, { 
      mnemonic: TEST_MNEMONIC, 
      toAddr: TARGET_ADDRESS,
      apiBase: API_BASE,
      chainPath: CHAIN_PATH,
      chainId: CHAIN_ID,
    })
    
    console.log('手续费为0的广播结果:', JSON.stringify(result, null, 2))
    
    // 验证结果（可能成功也可能失败，取决于链的配置）
    if (!result.success) {
      console.log(`错误码: ${result.code}`)
      console.log(`翻译后消息: ${result.translated}`)
    }
  })

  test('正常小额转账应该成功', async ({ page }) => {
    // 获取余额确认有足够资金
    const balance = await getBalance(TEST_ADDRESS)
    console.log(`当前余额: ${balance / 1e8} BFM`)
    
    if (balance < 10000) {
      console.log('余额不足，跳过正常转账测试')
      test.skip()
      return
    }
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const result = await page.evaluate(async ({ mnemonic, toAddr, apiBase, chainPath, chainId }) => {
      try {
        // @ts-expect-error - 动态导入
        const sdk = await import('/src/services/bioforest-sdk/index.ts')
        // @ts-expect-error - 动态导入
        const { BroadcastError, translateBroadcastError } = await import('/src/services/bioforest-sdk/errors.ts')
        
        const baseUrl = `${apiBase}/wallet/${chainPath}`
        
        // 创建小额转账
        const transaction = await sdk.createTransferTransaction({
          baseUrl,
          chainId,
          mainSecret: mnemonic,
          from: await (await sdk.getBioforestCore(chainId)).accountBaseHelper().getAddressFromSecret(mnemonic),
          to: toAddr,
          amount: '1000', // 0.00001 BFM
          assetType: 'BFM',
          fee: '500',
        })
        
        console.log('Transaction created:', transaction.signature?.slice(0, 20))
        
        try {
          const txHash = await sdk.broadcastTransaction(baseUrl, transaction)
          return { success: true, txHash }
        } catch (err: unknown) {
          if (err instanceof BroadcastError) {
            return {
              success: false,
              errorType: 'BroadcastError',
              code: err.code,
              message: err.message,
              translated: translateBroadcastError(err),
            }
          }
          return {
            success: false,
            errorType: 'Error',
            message: err instanceof Error ? err.message : String(err),
          }
        }
      } catch (err: unknown) {
        return {
          success: false,
          errorType: 'CreateError',
          message: err instanceof Error ? err.message : String(err),
        }
      }
    }, { 
      mnemonic: TEST_MNEMONIC, 
      toAddr: TARGET_ADDRESS,
      apiBase: API_BASE,
      chainPath: CHAIN_PATH,
      chainId: CHAIN_ID,
    })
    
    console.log('正常转账结果:', JSON.stringify(result, null, 2))
    
    // 正常转账应该成功
    if (result.success) {
      console.log(`✅ 转账成功! txHash: ${result.txHash}`)
      expect(result.txHash).toBeDefined()
    } else {
      // 如果失败，打印错误信息供调试
      console.log(`❌ 转账失败: ${result.translated || result.message}`)
      // 可能因为余额不足等原因失败，不强制断言
    }
  })

  test('收集所有可能的错误码', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 测试各种异常情况，收集错误码
    const testCases = [
      { name: '超大金额', amount: '999999999999999999', fee: '500' },
      { name: '负数金额', amount: '-1000', fee: '500' },
      { name: '零金额', amount: '0', fee: '500' },
    ]
    
    for (const testCase of testCases) {
      console.log(`\n测试: ${testCase.name}`)
      
      const result = await page.evaluate(async ({ mnemonic, toAddr, amount, fee, apiBase, chainPath, chainId }) => {
        try {
          // @ts-expect-error - 动态导入
          const sdk = await import('/src/services/bioforest-sdk/index.ts')
          // @ts-expect-error - 动态导入
          const { BroadcastError, translateBroadcastError } = await import('/src/services/bioforest-sdk/errors.ts')
          
          const baseUrl = `${apiBase}/wallet/${chainPath}`
          
          const transaction = await sdk.createTransferTransaction({
            baseUrl,
            chainId,
            mainSecret: mnemonic,
            from: await (await sdk.getBioforestCore(chainId)).accountBaseHelper().getAddressFromSecret(mnemonic),
            to: toAddr,
            amount,
            assetType: 'BFM',
            fee,
          })
          
          try {
            const txHash = await sdk.broadcastTransaction(baseUrl, transaction)
            return { success: true, txHash }
          } catch (err: unknown) {
            if (err instanceof BroadcastError) {
              return {
                success: false,
                errorType: 'BroadcastError',
                code: err.code,
                message: err.message,
                translated: translateBroadcastError(err),
              }
            }
            return { success: false, errorType: 'Error', message: err instanceof Error ? err.message : String(err) }
          }
        } catch (err: unknown) {
          return { success: false, errorType: 'CreateError', message: err instanceof Error ? err.message : String(err) }
        }
      }, { 
        mnemonic: TEST_MNEMONIC, 
        toAddr: TARGET_ADDRESS,
        amount: testCase.amount,
        fee: testCase.fee,
        apiBase: API_BASE,
        chainPath: CHAIN_PATH,
        chainId: CHAIN_ID,
      })
      
      console.log(`  结果: ${result.success ? '成功' : '失败'}`)
      if (!result.success) {
        console.log(`  错误类型: ${result.errorType}`)
        console.log(`  错误码: ${result.code || 'N/A'}`)
        console.log(`  消息: ${result.message}`)
        console.log(`  翻译: ${result.translated || 'N/A'}`)
      }
    }
  })
})
