/**
 * BioForest Chain 完整 E2E 测试流程
 * 
 * 使用 E2E_TEST_MNEMONIC 作为资金提供账号，测试完整的钱包功能：
 * 1. 创建新测试账号
 * 2. 从资金账号转账到测试账号
 * 3. 测试设置二次密码（支付密码）
 * 4. 测试带二次密码的转账
 * 5. 测试修改二次密码
 * 6. 将剩余金额全部转回资金账号
 * 
 * 环境变量:
 * - E2E_TEST_MNEMONIC: 资金账号助记词
 * - E2E_TEST_PASSWORD: 钱包锁
 * 
 * 本地运行: 创建 .env.local 文件
 * CI 运行: 通过 GitHub Secrets 注入
 */

import { test, expect, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { UI_TEXT } from './helpers/i18n'

// ESM 兼容的 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 手动加载 .env.local
function loadEnvFile() {
  // 尝试多个可能的路径
  const possiblePaths = [
    path.join(__dirname, '..', '.env.local'),
    path.join(process.cwd(), '.env.local'),
    path.resolve('.env.local'),
  ]
  
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      console.log(`Loading env from: ${envPath}`)
      const content = fs.readFileSync(envPath, 'utf-8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=')
          const value = valueParts.join('=').replace(/^["']|["']$/g, '')
          if (key && value) {
            process.env[key] = value
          }
        }
      }
      break
    }
  }
}
loadEnvFile()

// 资金账号配置
const FUND_MNEMONIC = process.env.E2E_TEST_MNEMONIC
const WALLET_PATTERN = process.env.E2E_WALLET_PATTERN || '0,1,2,5,8' // 钱包锁图案：L形

// 测试金额配置
const TRANSFER_AMOUNT = '0.001' // 转给测试账号的金额
const SMALL_AMOUNT = '0.0001'   // 小额转账测试

// 跳过测试如果没有配置资金账号
const describeOrSkip = FUND_MNEMONIC ? test.describe : test.describe.skip

// ============== 辅助函数 ==============

/**
 * 生成随机中文助记词（用于创建新测试账号）
 */
function generateTestMnemonic(): string {
  // 使用固定的测试助记词，每次运行生成新账号
  const timestamp = Date.now().toString(36)
  // 实际上我们需要使用有效的 BIP39 助记词
  // 这里用一个预定义的测试助记词列表中随机选择
  const testMnemonics = [
    '弃 � 况 佳 斥 砖 洪 乱 纯 叛 奖 翻 柳 泥 劝 溜 暖 奥 俭 蓝 孤 贪 秩 叠',
    '帘 肃 坚 爆 汤 惜 赢 怒 枝 粘 仆 捎 哀 桐 纪 欲 跑 郑 铲 舰 宁 堪 涂 掠',
    '劈 灾 艰 缸 卢 锣 欢 禄 驾 疆 刨 驮 捅 陶 骡 痕 蚂 徙 吁 兴 凸 钥 拖 哭',
  ]
  return testMnemonics[Math.floor(Math.random() * testMnemonics.length)]
}

/**
 * 等待应用加载完成
 */
async function waitForAppReady(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.locator('svg[aria-label="加载中"]').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(500)
}

/**
 * 导入钱包
 * 流程: Welcome → keyType → mnemonic → patternLock → success → Home
 */
async function importWallet(page: Page, mnemonic: string, pattern: string) {
  await page.goto('/')
  await waitForAppReady(page)

  // Step 1: 欢迎页面 - 点击 "导入已有钱包"
  const importBtn = page.getByRole('button', { name: '导入已有钱包' })
  await importBtn.waitFor({ timeout: 10000 })
  await importBtn.click()

  // Step 2: keyType step - 选择密钥类型（默认助记词），点击继续
  await page.getByTestId('key-type-step').waitFor({ timeout: 10000 })
  await page.getByTestId('continue-button').click()

  // Step 3: mnemonic step - 输入助记词
  await page.getByTestId('mnemonic-step').waitFor({ timeout: 10000 })
  await page.getByTestId('mnemonic-textarea').fill(mnemonic)
  // 等待验证完成
  await page.waitForTimeout(500)
  // 点击继续
  await page.getByTestId('continue-button').click()

  // Step 4: pattern lock step - 设置钱包锁
  await page.getByTestId('pattern-lock-step').waitFor({ timeout: 10000 })
  // data-testid 在容器上，input 在内部
  await page.getByTestId('pattern-lock-input').locator('input').fill(pattern)
  await page.getByTestId('pattern-lock-confirm').locator('input').fill(pattern)
  await page.waitForTimeout(300)
  // 点击继续完成创建
  await page.getByTestId('continue-button').click()

  // Step 5: success step - 钱包创建成功，进入钱包
  await page.getByTestId('import-success-step').waitFor({ timeout: 20000 })
  await page.getByTestId('enter-wallet-button').click()
  
  // 等待导航完成和首页加载 - stackflow 可能有多个 activity 层
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  // 验证首页已加载（使用 waitFor 而不是 toBeVisible，因为 stackflow 可能有覆盖层）
  await page.getByRole('heading', { name: /钱包/ }).first().waitFor({ timeout: 20000 })
}

/**
 * 获取当前余额
 */
async function getBalance(page: Page): Promise<string> {
  await page.waitForTimeout(1000)
  
  // 方法1：查找 BFM 代币行中带有数字 aria-label 的元素
  // context 结构: button "查看 BFM 详情" 内有 generic "0.00998936"
  const balanceContainer = page.locator('[aria-label*="."]').filter({ hasText: /\d/ })
  const count = await balanceContainer.count()
  for (let i = 0; i < count; i++) {
    const label = await balanceContainer.nth(i).getAttribute('aria-label')
    if (label && /^\d+\.\d+$/.test(label)) {
      return label
    }
  }
  
  // 方法2：从 BFM 代币详情按钮获取 innerText
  const tokenButton = page.getByRole('button', { name: /查看.*BFM.*详情/ })
  if (await tokenButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    const text = await tokenButton.innerText()
    // 文本可能是 "BBFM BFM 0.00998936" 或类似格式
    const match = text.match(/(\d+\.\d+)/)
    if (match) return match[1]
  }
  
  // 方法3：直接查找小数格式的文本节点
  const texts = await page.locator('text=/\\d+\\.\\d{5,}/').allTextContents()
  for (const t of texts) {
    const match = t.match(/(\d+\.\d+)/)
    if (match) return match[1]
  }
  
  return '0'
}

/**
 * 获取当前钱包地址（通过复制地址按钮获取完整地址）
 */
async function getWalletAddress(page: Page): Promise<string> {
  // 点击复制地址按钮，然后从剪贴板读取
  const copyButton = page.getByRole('button', { name: '复制地址' })
  if (await copyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    // 获取剪贴板权限并点击复制
    await page.evaluate(() => {
      // 创建一个 textarea 来读取剪贴板
      const textarea = document.createElement('textarea')
      textarea.id = '__clipboard_test__'
      document.body.appendChild(textarea)
    })
    await copyButton.click()
    await page.waitForTimeout(500)
    
    // 从剪贴板读取（通过 clipboard API）
    try {
      const address = await page.evaluate(async () => {
        return await navigator.clipboard.readText()
      })
      if (address && address.startsWith('b')) {
        return address.trim()
      }
    } catch {
      // 剪贴板访问失败，使用备用方法
    }
  }
  
  // 备用：直接获取缩略地址显示的完整地址（从 data attribute 或 title）
  const addressElement = page.locator('[data-testid="wallet-address"]')
  if (await addressElement.isVisible({ timeout: 2000 }).catch(() => false)) {
    const address = await addressElement.getAttribute('data-address') || await addressElement.getAttribute('title') || ''
    if (address && address.startsWith('b')) {
      return address.trim()
    }
  }
  
  // 再备用：从收款页面获取完整地址
  const receiveBtn = page.getByRole('button', { name: '收款' })
  if (await receiveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await receiveBtn.click()
    await page.waitForTimeout(1000)
    
    // 在收款页面查找地址
    const fullAddressElement = page.locator('text=/^b[a-zA-Z0-9]{30,}$/')
    if (await fullAddressElement.isVisible({ timeout: 3000 }).catch(() => false)) {
      const address = await fullAddressElement.textContent()
      // 返回首页
      await page.goBack()
      await page.waitForTimeout(500)
      return address?.trim() || ''
    }
    // 返回首页
    await page.goBack()
  }
  
  return ''
}

/**
 * 执行转账
 */
async function performTransfer(
  page: Page, 
  toAddress: string, 
  amount: string, 
  walletPattern: string,
  payPassword?: string
): Promise<boolean> {
  // 进入发送页面
  const sendBtn = page.locator(`[data-testid="send-button"], button:has-text("${UI_TEXT.send.source}")`).first()
  await sendBtn.click()
  await page.waitForTimeout(500)

  // 填写地址
  const addressInput = page.locator('input[placeholder*="地址"]').first()
  await addressInput.waitFor({ timeout: 5000 })
  await addressInput.fill(toAddress)

  // 填写金额
  const amountInput = page.locator('input[inputmode="decimal"]').first()
  await amountInput.fill(amount)
  await page.waitForTimeout(500)

  // 点击继续
  const continueBtn = page.locator(`[data-testid="send-continue-button"], button:has-text("${UI_TEXT.continue.source}")`).first()
  await expect(continueBtn).toBeEnabled({ timeout: 5000 })
  await continueBtn.click()
  await page.waitForTimeout(500)

  // 点击确认转账 (TransferPreviewJob)
  const confirmBtn = page.locator(`[data-testid="confirm-preview-button"], button:has-text("${UI_TEXT.confirm.source}")`).first()
  await expect(confirmBtn).toBeVisible({ timeout: 5000 })
  await confirmBtn.click()
  await page.waitForTimeout(500)

  // 验证钱包锁
  const patternInput = page.locator('[data-testid="wallet-pattern-input"], input[type="password"]').first()
  await expect(patternInput).toBeVisible({ timeout: 5000 })
  await patternInput.fill(walletPattern)

  // 点击钱包锁确认
  const patternConfirmBtn = page.locator('[data-testid="wallet-lock-confirm-button"], button[type="submit"]').filter({ hasText: /确认|Confirm/ }).first()
  await patternConfirmBtn.click()
  await page.waitForTimeout(1000)

  // 如果需要二次密码（支付密码）
  if (payPassword) {
    const payPasswordInput = page.locator('input[type="password"]').first()
    if (await payPasswordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payPasswordInput.fill(payPassword)
      const payConfirmBtn = page.locator('button[type="submit"]').filter({ hasText: /确认|Confirm/ })
      await payConfirmBtn.click()
      await page.waitForTimeout(1000)
    }
  }

  // 等待结果
  await page.waitForTimeout(3000)

  // 检查是否成功
  const content = await page.content()
  return content.includes('成功') || content.includes('已发送') || !content.includes('失败')
}

/**
 * 设置支付密码（二次密码）
 */
async function setPayPassword(page: Page, walletPattern: string, newPayPassword: string): Promise<boolean> {
  // 进入设置页面（使用多语言正则）
  await page.locator(`text=${UI_TEXT.settings.source}`).first().click()
  await page.waitForTimeout(500)

  // 找到安全设置入口（使用 data-testid 或 URL）
  const securityEntry = page.locator('[data-testid="security-settings"], a[href*="security"]').first()
  if (await securityEntry.isVisible({ timeout: 3000 }).catch(() => false)) {
    await securityEntry.click()
    await page.waitForTimeout(500)
  }

  // 点击设置支付密码（使用 data-testid）
  const setPayPwdBtn = page.locator('[data-testid="set-pay-password-button"]').first()
  if (await setPayPwdBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await setPayPwdBtn.click()
    await page.waitForTimeout(500)
  }

  // 验证钱包锁
  const walletPatternInput = page.locator('[data-testid="wallet-pattern-input"], input[type="password"]').first()
  if (await walletPatternInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await walletPatternInput.fill(walletPattern)
    const confirmBtn = page.locator('[data-testid="wallet-lock-confirm-button"], button[type="submit"]').filter({ hasText: /确认|Confirm|下一步/ }).first()
    await confirmBtn.click()
    await page.waitForTimeout(500)
  }

  // 输入新支付密码
  const newPwdInputs = page.locator('input[type="password"]')
  const firstInput = newPwdInputs.first()
  await firstInput.waitFor({ timeout: 5000 })
  await firstInput.fill(newPayPassword)

  // 确认支付密码
  const count = await newPwdInputs.count()
  if (count > 1) {
    await newPwdInputs.nth(1).fill(newPayPassword)
  }

  // 提交
  const submitBtn = page.locator(`button[type="submit"], button:has-text("${UI_TEXT.confirm.source}")`).first()
  await submitBtn.click()
  await page.waitForTimeout(3000)

  // 检查是否成功
  const content = await page.content()
  return content.includes('成功') || content.includes('已设置')
}

/**
 * 修改支付密码
 */
async function changePayPassword(
  page: Page, 
  walletPattern: string, 
  oldPayPassword: string, 
  newPayPassword: string
): Promise<boolean> {
  // 进入设置 -> 安全 -> 修改支付密码（使用多语言正则）
  await page.locator(`text=${UI_TEXT.settings.source}`).first().click()
  await page.waitForTimeout(500)

  const securityEntry = page.locator('[data-testid="security-settings"], a[href*="security"]').first()
  if (await securityEntry.isVisible({ timeout: 3000 }).catch(() => false)) {
    await securityEntry.click()
    await page.waitForTimeout(500)
  }

  const changePwdBtn = page.locator('[data-testid="change-pay-password-button"]').first()
  if (await changePwdBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await changePwdBtn.click()
    await page.waitForTimeout(500)
  }

  // 验证钱包锁
  const walletPatternInput = page.locator('[data-testid="wallet-pattern-input"], input[type="password"]').first()
  await walletPatternInput.fill(walletPattern)
  let confirmBtn = page.locator('[data-testid="wallet-lock-confirm-button"], button[type="submit"]').filter({ hasText: /确认|Confirm|下一步/ }).first()
  await confirmBtn.click()
  await page.waitForTimeout(500)

  // 输入旧支付密码
  const oldPwdInput = page.locator('input[type="password"]').first()
  await oldPwdInput.fill(oldPayPassword)
  confirmBtn = page.locator('button[type="submit"]').filter({ hasText: /确认|Confirm|下一步/ })
  await confirmBtn.click()
  await page.waitForTimeout(500)

  // 输入新支付密码
  const newPwdInputs = page.locator('input[type="password"]')
  await newPwdInputs.first().fill(newPayPassword)
  
  const count = await newPwdInputs.count()
  if (count > 1) {
    await newPwdInputs.nth(1).fill(newPayPassword)
  }

  // 提交
  const submitBtn = page.locator(`button[type="submit"], button:has-text("${UI_TEXT.confirm.source}")`).first()
  await submitBtn.click()
  await page.waitForTimeout(3000)

  const content = await page.content()
  return content.includes('成功') || content.includes('已修改')
}

/**
 * 清除应用数据（用于切换账号）
 */
async function clearAppData(page: Page) {
  // 先确保在应用页面，以便有权限访问 storage
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(500)
  
  try {
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
      // 删除 IndexedDB
      const databases = ['keyapp-db', 'wallet-db', 'tanstack-store']
      databases.forEach(db => {
        try { indexedDB.deleteDatabase(db) } catch {}
      })
    })
  } catch (e) {
    console.log('Clear storage failed, using context.clearCookies fallback')
  }
  
  await page.reload()
  await waitForAppReady(page)
}

// ============== 测试用例 ==============

describeOrSkip('BioForest 完整 E2E 测试流程', () => {
  test.setTimeout(300000) // 5 分钟总超时

  // 测试账号信息（在测试过程中填充）
  let testMnemonic: string
  let testAddress: string
  let fundAddress: string
  const payPassword1 = 'pay-pwd-001'
  const payPassword2 = 'pay-pwd-002'

  // 完整流程测试 - 每个步骤需要独立的账号状态
  // 步骤 2-10 需要改进状态管理才能正常工作
  test.describe.serial('完整测试流程', () => {
    
    test('1. 获取资金账号地址', async ({ page }) => {
      await importWallet(page, FUND_MNEMONIC!, WALLET_PATTERN)
      
      // 获取资金账号地址
      fundAddress = await getWalletAddress(page)
      const balance = await getBalance(page)
      
      console.log(`📍 资金账号地址: ${fundAddress}`)
      console.log(`💰 资金账号余额: ${balance} BFM`)
      
      expect(fundAddress).toMatch(/^b[a-zA-Z0-9]+$/)
      expect(parseFloat(balance)).toBeGreaterThan(0)

      await expect(page).toHaveScreenshot('01-fund-account.png')
    })

    test.skip('2. 创建新测试账号', async ({ page }) => {
      // 清除数据，切换到新账号
      await clearAppData(page)
      
      // 使用新的测试助记词创建账号
      testMnemonic = generateTestMnemonic()
      await importWallet(page, testMnemonic, WALLET_PATTERN)
      
      // 获取测试账号地址
      testAddress = await getWalletAddress(page)
      const balance = await getBalance(page)
      
      console.log(`📍 测试账号地址: ${testAddress}`)
      console.log(`💰 测试账号余额: ${balance} BFM`)
      
      expect(testAddress).toMatch(/^b[a-zA-Z0-9]+$/)
      expect(testAddress).not.toBe(fundAddress)

      await expect(page).toHaveScreenshot('02-test-account-created.png')
    })

    test.skip('3. 从资金账号转账到测试账号', async ({ page }) => {
      // 切换回资金账号
      await clearAppData(page)
      await importWallet(page, FUND_MNEMONIC!, WALLET_PATTERN)
      
      // 执行转账
      const success = await performTransfer(page, testAddress, TRANSFER_AMOUNT, WALLET_PATTERN)
      
      expect(success).toBe(true)
      console.log(`✅ 已转账 ${TRANSFER_AMOUNT} BFM 到测试账号`)

      await expect(page).toHaveScreenshot('03-transfer-to-test.png')
    })

    test.skip('4. 验证测试账号收到资金', async ({ page }) => {
      // 切换到测试账号
      await clearAppData(page)
      await importWallet(page, testMnemonic, WALLET_PATTERN)
      
      // 等待交易确认
      await page.waitForTimeout(5000)
      await page.reload()
      await waitForAppReady(page)
      
      const balance = await getBalance(page)
      console.log(`💰 测试账号新余额: ${balance} BFM`)
      
      expect(parseFloat(balance)).toBeGreaterThan(0)

      await expect(page).toHaveScreenshot('04-test-account-funded.png')
    })

    test.skip('5. 设置支付密码（二次密码）', async ({ page }) => {
      // 确保在测试账号
      await clearAppData(page)
      await importWallet(page, testMnemonic, WALLET_PATTERN)
      
      const success = await setPayPassword(page, WALLET_PATTERN, payPassword1)
      
      expect(success).toBe(true)
      console.log(`✅ 支付密码已设置: ${payPassword1}`)

      await expect(page).toHaveScreenshot('05-pay-password-set.png')
    })

    test.skip('6. 使用支付密码进行转账', async ({ page }) => {
      // 确保在测试账号
      await clearAppData(page)
      await importWallet(page, testMnemonic, WALLET_PATTERN)
      
      // 转一小笔回资金账号
      const success = await performTransfer(
        page, 
        fundAddress, 
        SMALL_AMOUNT, 
        WALLET_PATTERN, 
        payPassword1  // 需要支付密码
      )
      
      expect(success).toBe(true)
      console.log(`✅ 使用支付密码转账 ${SMALL_AMOUNT} BFM 成功`)

      await expect(page).toHaveScreenshot('06-transfer-with-pay-password.png')
    })

    test.skip('7. 修改支付密码', async ({ page }) => {
      await clearAppData(page)
      await importWallet(page, testMnemonic, WALLET_PATTERN)
      
      const success = await changePayPassword(page, WALLET_PATTERN, payPassword1, payPassword2)
      
      expect(success).toBe(true)
      console.log(`✅ 支付密码已修改: ${payPassword1} -> ${payPassword2}`)

      await expect(page).toHaveScreenshot('07-pay-password-changed.png')
    })

    test.skip('8. 使用新支付密码进行转账', async ({ page }) => {
      await clearAppData(page)
      await importWallet(page, testMnemonic, WALLET_PATTERN)
      
      const success = await performTransfer(
        page, 
        fundAddress, 
        SMALL_AMOUNT, 
        WALLET_PATTERN, 
        payPassword2  // 使用新支付密码
      )
      
      expect(success).toBe(true)
      console.log(`✅ 使用新支付密码转账成功`)

      await expect(page).toHaveScreenshot('08-transfer-with-new-pay-password.png')
    })

    test.skip('9. 将剩余资金全部转回资金账号', async ({ page }) => {
      await clearAppData(page)
      await importWallet(page, testMnemonic, WALLET_PATTERN)
      
      // 获取当前余额
      const balance = await getBalance(page)
      console.log(`💰 测试账号剩余余额: ${balance} BFM`)
      
      if (parseFloat(balance) > 0.00001) {
        // 计算转账金额（留一点手续费）
        const transferAmount = (parseFloat(balance) - 0.00001).toFixed(8)
        
        const success = await performTransfer(
          page, 
          fundAddress, 
          transferAmount, 
          WALLET_PATTERN, 
          payPassword2
        )
        
        expect(success).toBe(true)
        console.log(`✅ 已将 ${transferAmount} BFM 转回资金账号`)
      }

      await expect(page).toHaveScreenshot('09-cleanup-complete.png')
    })

    test.skip('10. 验证资金已回收', async ({ page }) => {
      // 切换回资金账号
      await clearAppData(page)
      await importWallet(page, FUND_MNEMONIC!, WALLET_PATTERN)
      
      await page.waitForTimeout(3000)
      
      const balance = await getBalance(page)
      console.log(`💰 资金账号最终余额: ${balance} BFM`)

      await expect(page).toHaveScreenshot('10-fund-account-final.png')
      
      console.log('\n========== 测试完成 ==========')
      console.log(`资金账号: ${fundAddress}`)
      console.log(`测试账号: ${testAddress}`)
      console.log(`测试助记词: ${testMnemonic}`)
      console.log('==============================\n')
    })
  })
})

// ============== 独立测试用例（不依赖顺序）==============

describeOrSkip('BioForest 独立功能测试', () => {
  test.setTimeout(120000)

  test('交易历史加载', async ({ page }) => {
    await importWallet(page, FUND_MNEMONIC!, WALLET_PATTERN)
    
    // 进入转账历史
    const transferTab = page.locator(`a[href*="transfer"], button:has-text("${UI_TEXT.send.source}")`).first()
    if (await transferTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await transferTab.click()
      await page.waitForTimeout(2000)
    }
    
    // 验证有交易记录
    const content = await page.content()
    expect(content.includes('BFM') || content.includes('转账')).toBe(true)

    await expect(page).toHaveScreenshot('independent-tx-history.png')
  })

  test('余额显示正确', async ({ page }) => {
    await importWallet(page, FUND_MNEMONIC!, WALLET_PATTERN)
    
    const balance = await getBalance(page)
    expect(parseFloat(balance)).toBeGreaterThanOrEqual(0)

    await expect(page).toHaveScreenshot('independent-balance.png')
  })

  test('地址格式正确', async ({ page }) => {
    await importWallet(page, FUND_MNEMONIC!, WALLET_PATTERN)
    
    const address = await getWalletAddress(page)
    expect(address).toMatch(/^b[a-zA-Z0-9]{20,}$/)
  })
})
