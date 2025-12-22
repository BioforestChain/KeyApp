import { test, expect } from '@playwright/test'
import { getWalletDataFromIndexedDB } from './utils/indexeddb-helper'

/**
 * 钱包创建 E2E 测试
 *
 * 包含视觉回归测试和功能验证测试
 */

// ==================== 视觉回归测试 ====================

test.describe('钱包创建流程 - 截图测试', () => {
  test.beforeEach(async ({ page }) => {
    // 清除本地存储，确保干净状态
    await page.addInitScript(() => localStorage.clear())
  })

  test('完整创建流程 - 截图对比', async ({ page }) => {
    // 1. 首页 - 无钱包状态
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('01-home-empty.png')

    // 2. 点击创建钱包
    await page.click('[data-testid="create-wallet-button"]')
    // Stackflow 使用 hash 路由，等待密码页面加载即可
    await page.waitForSelector('[data-testid="password-step"]')
    await expect(page).toHaveScreenshot('02-create-password-step.png')

    // 3. 填写密码
    await page.fill('input[placeholder="输入密码"]', 'Test1234!')
    await expect(page).toHaveScreenshot('03-password-entered.png')

    // 4. 填写确认密码
    await page.fill('input[placeholder="再次输入密码"]', 'Test1234!')
    await expect(page).toHaveScreenshot('04-password-confirmed.png')

    // 5. 进入助记词步骤
    await page.click('[data-testid="next-step-button"]')
    await page.waitForSelector('[data-testid="mnemonic-step"]')
    await expect(page).toHaveScreenshot('05-mnemonic-hidden.png')

    // 6. 显示助记词
    await page.click('[data-testid="toggle-mnemonic-button"]')
    await expect(page).toHaveScreenshot('06-mnemonic-visible.png', {
      // 助记词会变化，忽略该区域
      mask: [page.locator('[data-testid="mnemonic-display"]')],
    })

    // 7. 点击"我已备份"
    await page.click('[data-testid="mnemonic-backed-up-button"]')
    await page.waitForSelector('[data-testid="verify-step"]')
    await expect(page).toHaveScreenshot('07-verify-step.png', {
      mask: [page.locator('input')], // 输入框位置会变化
    })
  })

  test('密码验证 - 错误状态', async ({ page }) => {
    await page.goto('/#/wallet/create')
    await page.waitForLoadState('networkidle')

    // 输入不匹配的密码
    await page.fill('input[placeholder="输入密码"]', 'Test1234!')
    await page.fill('input[placeholder="再次输入密码"]', 'DifferentPassword')

    await expect(page).toHaveScreenshot('error-password-mismatch.png')
  })
})

// ==================== 功能验证测试 ====================

test.describe('钱包创建流程 - 功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
  })

  test('完整创建流程 - 验证钱包已创建', async ({ page }) => {
    // 1. 导航到创建页面
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.click('[data-testid="create-wallet-button"]')

    // 2. 填写密码步骤 (Stackflow hash 路由，直接等待内容)
    await page.waitForSelector('[data-testid="password-step"]')
    await page.fill('input[placeholder="输入密码"]', 'Test1234!')
    await page.fill('input[placeholder="再次输入密码"]', 'Test1234!')

    // 验证下一步按钮可点击
    const nextBtn = page.locator('[data-testid="next-step-button"]')
    await expect(nextBtn).toBeEnabled()
    await nextBtn.click()

    // 3. 备份助记词步骤
    await page.waitForSelector('[data-testid="mnemonic-step"]')

    // 点击显示助记词
    await page.click('[data-testid="toggle-mnemonic-button"]')

    // 获取生成的助记词
    const mnemonicDisplay = page.locator('[data-testid="mnemonic-display"]')
    await expect(mnemonicDisplay).toBeVisible()

    // 提取所有助记词单词
    const wordElements = mnemonicDisplay.locator('span.font-medium:not(.blur-sm)')
    const wordCount = await wordElements.count()
    expect(wordCount).toBe(12)

    // 保存助记词用于验证步骤
    const words: string[] = []
    for (let i = 0; i < wordCount; i++) {
      const word = await wordElements.nth(i).textContent()
      if (word) words.push(word.trim())
    }
    expect(words.length).toBe(12)

    // 点击"我已备份"
    await page.click('[data-testid="mnemonic-backed-up-button"]')

    // 4. 验证助记词步骤
    await page.waitForSelector('[data-testid="verify-step"]')

    // 找到需要验证的单词位置 - 通过 input 元素的 data-testid
    const verifyLabels = page.locator('label:has-text("第")')
    const labelsCount = await verifyLabels.count()
    expect(labelsCount).toBe(3)

    // 填写验证单词
    for (let i = 0; i < labelsCount; i++) {
      const labelText = await verifyLabels.nth(i).textContent()
      const match = labelText?.match(/第 (\d+) 个单词/)
      if (match) {
        const wordIndex = parseInt(match[1]) - 1
        const input = page.locator(`input[placeholder="输入第 ${wordIndex + 1} 个单词"]`)
        await input.fill(words[wordIndex])
      }
    }

    // 5. 完成创建
    const completeBtn = page.locator('[data-testid="complete-button"]')
    await expect(completeBtn).toBeEnabled()
    await completeBtn.click()

    // 6. 验证跳转到首页且钱包已创建
    await page.waitForURL(/.*#\/$/)
    // HomeTab 的 chain-selector 可见
    await page.waitForSelector('[data-testid="chain-selector"]:visible', { timeout: 10000 })

    // 验证 IndexedDB 中有钱包数据
    const wallets = await getWalletDataFromIndexedDB(page)
    expect(wallets).toHaveLength(1)
    expect(wallets[0].name).toBe('主钱包')
  })

  test('创建钱包派生多链地址', async ({ page }) => {
    // 先手动添加一个新的 BioForest 链配置，验证 chain-config 能驱动地址派生
    await page.goto('/#/settings/chains')
    await page.waitForSelector('[data-testid="manual-add-section"]')

    const manualConfig = JSON.stringify({
      id: 'bf-demo',
      version: '1.0',
      type: 'bioforest',
      name: 'BF Demo',
      symbol: 'BFD',
      decimals: 8,
      prefix: 'c',
    })

    await page.fill('[data-testid="manual-config-textarea"]', manualConfig)
    await page.click('[data-testid="add-chain-button"]')
    await expect(page.locator('[data-testid="chain-item-bf-demo"]')).toBeVisible()

    // 快速创建钱包流程 - Stackflow 需要从首页导航
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.click('[data-testid="create-wallet-button"]')
    await page.waitForSelector('[data-testid="password-step"]')

    // 密码步骤
    await page.fill('input[placeholder="输入密码"]', 'Test1234!')
    await page.fill('input[placeholder="再次输入密码"]', 'Test1234!')
    await page.click('[data-testid="next-step-button"]')

    // 助记词步骤
    await page.waitForSelector('[data-testid="mnemonic-step"]')
    await page.click('[data-testid="toggle-mnemonic-button"]')

    // 获取助记词
    const mnemonicDisplay = page.locator('[data-testid="mnemonic-display"]')
    const wordElements = mnemonicDisplay.locator('span.font-medium:not(.blur-sm)')
    const words: string[] = []
    const wordCount = await wordElements.count()
    for (let i = 0; i < wordCount; i++) {
      const word = await wordElements.nth(i).textContent()
      if (word) words.push(word.trim())
    }

    await page.click('[data-testid="mnemonic-backed-up-button"]')

    // 验证步骤
    await page.waitForSelector('[data-testid="verify-step"]')
    const verifyLabels = page.locator('label:has-text("第")')
    const labelsCount = await verifyLabels.count()
    for (let i = 0; i < labelsCount; i++) {
      const labelText = await verifyLabels.nth(i).textContent()
      const match = labelText?.match(/第 (\d+) 个单词/)
      if (match) {
        const wordIndex = parseInt(match[1]) - 1
        const input = page.locator(`input[placeholder="输入第 ${wordIndex + 1} 个单词"]`)
        await input.fill(words[wordIndex])
      }
    }

    await page.click('[data-testid="complete-button"]')
    await page.waitForURL(/.*#\/$/)

    // 验证多链地址派生 (从 IndexedDB 读取)
    const wallets = await getWalletDataFromIndexedDB(page)
    const wallet = wallets[0]

    // 验证外部链地址 (BIP44)
    const externalChains = ['ethereum', 'bitcoin', 'tron']
    for (const chain of externalChains) {
      const chainAddr = wallet.chainAddresses.find((ca: { chain: string }) => ca.chain === chain)
      expect(chainAddr, `应该有 ${chain} 地址`).toBeDefined()
      expect(chainAddr.address.length).toBeGreaterThan(10)
    }

    // 验证 BioForest 链地址 (Ed25519)
    const bioforestChains = ['bfmeta', 'pmchain', 'ccchain', 'bf-demo']
    for (const chain of bioforestChains) {
      const chainAddr = wallet.chainAddresses.find((ca: { chain: string }) => ca.chain === chain)
      expect(chainAddr, `应该有 ${chain} 地址`).toBeDefined()
      const expectedPrefix = chain === 'bf-demo' ? 'c' : 'b'
      // BioForest 地址以 chain-config 的 prefix 开头（默认生产链是 'b'，手动添加可用 'c'）
      expect(chainAddr.address.startsWith(expectedPrefix)).toBe(true)
    }
  })

  test('密码强度不足时禁用下一步', async ({ page }) => {
    await page.goto('/#/wallet/create')
    await page.waitForSelector('[data-testid="password-step"]')

    const nextBtn = page.locator('[data-testid="next-step-button"]')

    // 空密码 - 禁用
    await expect(nextBtn).toBeDisabled()

    // 短密码 - 禁用
    await page.fill('input[placeholder="输入密码"]', '123')
    await page.fill('input[placeholder="再次输入密码"]', '123')
    await expect(nextBtn).toBeDisabled()

    // 7 字符 - 禁用
    await page.fill('input[placeholder="输入密码"]', '1234567')
    await page.fill('input[placeholder="再次输入密码"]', '1234567')
    await expect(nextBtn).toBeDisabled()

    // 8 字符 - 启用
    await page.fill('input[placeholder="输入密码"]', '12345678')
    await page.fill('input[placeholder="再次输入密码"]', '12345678')
    await expect(nextBtn).toBeEnabled()
  })

  test('密码不匹配时禁用下一步', async ({ page }) => {
    await page.goto('/#/wallet/create')
    await page.waitForSelector('[data-testid="password-step"]')

    await page.fill('input[placeholder="输入密码"]', 'Test1234!')
    await page.fill('input[placeholder="再次输入密码"]', 'DifferentPassword')

    const nextBtn = page.locator('[data-testid="next-step-button"]')
    await expect(nextBtn).toBeDisabled()

    // 验证错误提示显示 - 通过 data-testid 确认 error 存在
    await expect(page.locator('[data-testid="password-step"] .text-destructive')).toBeVisible()
  })

  test('助记词验证错误时禁用完成按钮', async ({ page }) => {
    // 快速到达验证步骤
    await page.goto('/#/wallet/create')
    await page.fill('input[placeholder="输入密码"]', 'Test1234!')
    await page.fill('input[placeholder="再次输入密码"]', 'Test1234!')
    await page.click('[data-testid="next-step-button"]')
    await page.waitForSelector('[data-testid="mnemonic-step"]')
    await page.click('[data-testid="toggle-mnemonic-button"]')
    await page.click('[data-testid="mnemonic-backed-up-button"]')
    await page.waitForSelector('[data-testid="verify-step"]')

    // 输入错误的单词 - 使用 data-testid 选择器
    const inputs = page.locator('[data-testid^="verify-word-input-"]')
    const inputCount = await inputs.count()
    for (let i = 0; i < inputCount; i++) {
      await inputs.nth(i).fill('wrongword')
    }

    // 完成按钮应该禁用
    const completeBtn = page.locator('[data-testid="complete-button"]')
    await expect(completeBtn).toBeDisabled()
  })
})

// ==================== 导入流程截图测试 ====================

test.describe('钱包导入流程 - 截图测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
  })

  test('导入页面截图', async ({ page }) => {
    await page.goto('/#/wallet/import')
    await page.waitForLoadState('networkidle')
    // WalletImportPage 直接显示助记词输入步骤
    await page.waitForSelector('[data-testid="mnemonic-step"]')
    await expect(page).toHaveScreenshot('import-01-mnemonic-input.png')
  })
})
