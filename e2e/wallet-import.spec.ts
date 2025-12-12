import { test, expect } from '@playwright/test'

/**
 * 钱包导入 E2E 测试
 *
 * 测试助记词导入功能，包括 12/24 词支持和多链地址派生
 */

// 标准测试助记词 (BIP39 测试向量)
const TEST_MNEMONIC_12 =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const TEST_MNEMONIC_12_WORDS = TEST_MNEMONIC_12.split(' ')

// 24 词测试助记词
const TEST_MNEMONIC_24 =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art'
const TEST_MNEMONIC_24_WORDS = TEST_MNEMONIC_24.split(' ')

// 辅助函数：填写助记词
async function fillMnemonic(page: import('@playwright/test').Page, words: string[]) {
  for (let i = 0; i < words.length; i++) {
    const input = page.locator(`[data-word-index="${i}"]`)
    await input.fill(words[i])
  }
}

test.describe('钱包导入流程 - 功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('12 词助记词导入成功', async ({ page }) => {
    await page.goto('/#/wallet/import')
    await page.waitForSelector('text=输入助记词')

    // 默认应该是 12 词模式
    const wordInputs = page.locator('[data-word-index]')
    await expect(wordInputs).toHaveCount(12)

    // 填写助记词
    await fillMnemonic(page, TEST_MNEMONIC_12_WORDS)

    // 点击下一步
    const nextBtn = page.locator('button:has-text("下一步")')
    await expect(nextBtn).toBeEnabled()
    await nextBtn.click()

    // 密码步骤
    await page.waitForSelector('text=设置密码')
    await page.fill('input[placeholder="输入密码"]', 'Test1234!')
    await page.fill('input[placeholder="再次输入密码"]', 'Test1234!')

    // 完成导入
    const completeBtn = page.locator('button:has-text("完成导入")')
    await expect(completeBtn).toBeEnabled()
    await completeBtn.click()

    // 验证跳转到首页
    await page.waitForURL(/\/#?\/?$/)
    await page.waitForSelector('[data-testid="chain-selector"]', { timeout: 10000 })

    // 验证钱包已创建
    const walletData = await page.evaluate(() => {
      return localStorage.getItem('bfm_wallets')
    })
    expect(walletData).not.toBeNull()

    const parsed = JSON.parse(walletData!)
    expect(parsed.wallets).toHaveLength(1)
    expect(parsed.wallets[0].name).toBe('导入钱包')

    // 验证地址派生正确 (BIP39 测试向量已知地址)
    const wallet = parsed.wallets[0]
    const ethAddr = wallet.chainAddresses.find((ca: { chain: string }) => ca.chain === 'ethereum')
    expect(ethAddr).toBeDefined()
    // "abandon" x11 + "about" 的已知以太坊地址
    expect(ethAddr.address.toLowerCase()).toBe('0x9858effd232b4033e47d90003d41ec34ecaeda94')
  })

  test('24 词助记词导入成功', async ({ page }) => {
    await page.goto('/#/wallet/import')
    await page.waitForSelector('text=输入助记词')

    // 切换到 24 词模式
    await page.click('text=24 个单词')

    // 应该显示 24 个输入框
    const wordInputs = page.locator('[data-word-index]')
    await expect(wordInputs).toHaveCount(24)

    // 填写助记词
    await fillMnemonic(page, TEST_MNEMONIC_24_WORDS)

    // 点击下一步
    const nextBtn = page.locator('button:has-text("下一步")')
    await expect(nextBtn).toBeEnabled()
    await nextBtn.click()

    // 密码步骤
    await page.waitForSelector('text=设置密码')
    await page.fill('input[placeholder="输入密码"]', 'Test1234!')
    await page.fill('input[placeholder="再次输入密码"]', 'Test1234!')

    // 完成导入
    await page.click('button:has-text("完成导入")')
    await page.waitForURL(/\/#?\/?$/)

    // 验证钱包已创建
    const walletData = await page.evaluate(() => {
      return localStorage.getItem('bfm_wallets')
    })
    const parsed = JSON.parse(walletData!)
    expect(parsed.wallets).toHaveLength(1)
  })

  test('导入钱包派生多链地址', async ({ page }) => {
    await page.goto('/#/wallet/import')
    await page.waitForSelector('text=输入助记词')

    // 填写助记词
    await fillMnemonic(page, TEST_MNEMONIC_12_WORDS)
    await page.click('button:has-text("下一步")')

    // 密码步骤
    await page.waitForSelector('text=设置密码')
    await page.fill('input[placeholder="输入密码"]', 'Test1234!')
    await page.fill('input[placeholder="再次输入密码"]', 'Test1234!')
    await page.click('button:has-text("完成导入")')

    await page.waitForURL(/\/#?\/?$/)

    // 验证多链地址派生
    const walletData = await page.evaluate(() => {
      return localStorage.getItem('bfm_wallets')
    })
    const parsed = JSON.parse(walletData!)
    const wallet = parsed.wallets[0]

    // 验证外部链地址 (BIP44)
    const externalChains = ['ethereum', 'bitcoin', 'tron']
    for (const chain of externalChains) {
      const chainAddr = wallet.chainAddresses.find((ca: { chain: string }) => ca.chain === chain)
      expect(chainAddr, `应该有 ${chain} 地址`).toBeDefined()
      expect(chainAddr.address.length).toBeGreaterThan(10)
    }

    // 验证 BioForest 链地址 (Ed25519)
    const bioforestChains = ['bfmeta', 'pmchain', 'ccchain']
    for (const chain of bioforestChains) {
      const chainAddr = wallet.chainAddresses.find((ca: { chain: string }) => ca.chain === chain)
      expect(chainAddr, `应该有 ${chain} 地址`).toBeDefined()
      // BioForest 地址以 'c' 开头
      expect(chainAddr.address.startsWith('c')).toBe(true)
    }
  })

  test('无效助记词显示错误', async ({ page }) => {
    await page.goto('/#/wallet/import')
    await page.waitForSelector('text=输入助记词')

    // 填写无效助记词
    const invalidWords = Array(12).fill('invalid')
    await fillMnemonic(page, invalidWords)

    // 点击下一步
    await page.click('button:has-text("下一步")')

    // 应该显示错误提示
    await expect(page.locator('text=助记词无效')).toBeVisible()

    // 不应该跳转到密码步骤
    await expect(page.locator('text=设置密码')).not.toBeVisible()
  })

  test('部分填写助记词禁用下一步', async ({ page }) => {
    await page.goto('/#/wallet/import')
    await page.waitForSelector('text=输入助记词')

    // 只填写部分单词
    for (let i = 0; i < 6; i++) {
      const input = page.locator(`[data-word-index="${i}"]`)
      await input.fill(TEST_MNEMONIC_12_WORDS[i])
    }

    // 下一步按钮应该禁用
    const nextBtn = page.locator('button:has-text("下一步")')
    await expect(nextBtn).toBeDisabled()

    // 验证显示已输入数量
    await expect(page.locator('text=已输入 6/12 个单词')).toBeVisible()
  })

  test('粘贴助记词功能', async ({ page }) => {
    await page.goto('/#/wallet/import')
    await page.waitForSelector('text=输入助记词')

    // 在第一个输入框粘贴完整助记词
    const firstInput = page.locator('[data-word-index="0"]')
    await firstInput.fill(TEST_MNEMONIC_12)

    // 所有单词应该被自动填充
    for (let i = 0; i < 12; i++) {
      const input = page.locator(`[data-word-index="${i}"]`)
      await expect(input).toHaveValue(TEST_MNEMONIC_12_WORDS[i])
    }

    // 下一步按钮应该启用
    const nextBtn = page.locator('button:has-text("下一步")')
    await expect(nextBtn).toBeEnabled()
  })

  test('清除按钮功能', async ({ page }) => {
    await page.goto('/#/wallet/import')
    await page.waitForSelector('text=输入助记词')

    // 填写一些单词
    await fillMnemonic(page, TEST_MNEMONIC_12_WORDS.slice(0, 6))

    // 验证清除按钮存在
    const clearBtn = page.locator('button:has-text("清除")')
    await expect(clearBtn).toBeVisible()

    // 点击清除
    await clearBtn.click()

    // 所有输入框应该被清空
    for (let i = 0; i < 12; i++) {
      const input = page.locator(`[data-word-index="${i}"]`)
      await expect(input).toHaveValue('')
    }

    // 显示已输入 0/12
    await expect(page.locator('text=已输入 0/12 个单词')).toBeVisible()
  })

  test('切换词数后显示正确数量的输入框', async ({ page }) => {
    await page.goto('/#/wallet/import')
    await page.waitForSelector('text=输入助记词')

    // 默认 12 词
    let wordInputs = page.locator('[data-word-index]')
    await expect(wordInputs).toHaveCount(12)

    // 切换到 24 词
    await page.click('text=24 个单词')

    // 应该显示 24 个输入框
    wordInputs = page.locator('[data-word-index]')
    await expect(wordInputs).toHaveCount(24)

    // 切换回 12 词
    await page.click('text=12 个单词')

    // 应该显示 12 个输入框
    wordInputs = page.locator('[data-word-index]')
    await expect(wordInputs).toHaveCount(12)
  })

  test('导入密码强度验证', async ({ page }) => {
    await page.goto('/#/wallet/import')
    await page.waitForSelector('text=输入助记词')

    // 填写助记词
    await fillMnemonic(page, TEST_MNEMONIC_12_WORDS)
    await page.click('button:has-text("下一步")')

    // 密码步骤
    await page.waitForSelector('text=设置密码')

    const completeBtn = page.locator('button:has-text("完成导入")')

    // 短密码 - 禁用
    await page.fill('input[placeholder="输入密码"]', '123')
    await page.fill('input[placeholder="再次输入密码"]', '123')
    await expect(completeBtn).toBeDisabled()

    // 8 字符 - 启用
    await page.fill('input[placeholder="输入密码"]', '12345678')
    await page.fill('input[placeholder="再次输入密码"]', '12345678')
    await expect(completeBtn).toBeEnabled()
  })

  test('导入后返回首页显示钱包', async ({ page }) => {
    await page.goto('/#/wallet/import')
    await page.waitForSelector('text=输入助记词')

    // 快速完成导入流程
    await fillMnemonic(page, TEST_MNEMONIC_12_WORDS)
    await page.click('button:has-text("下一步")')
    await page.waitForSelector('text=设置密码')
    await page.fill('input[placeholder="输入密码"]', 'Test1234!')
    await page.fill('input[placeholder="再次输入密码"]', 'Test1234!')
    await page.click('button:has-text("完成导入")')

    // 等待跳转到首页
    await page.waitForURL(/\/#?\/?$/)
    await page.waitForSelector('[data-testid="chain-selector"]', { timeout: 10000 })

    // 验证钱包名称显示
    await expect(page.locator('text=导入钱包')).toBeVisible()

    // 验证可以切换链
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')

    // 验证显示了多个链选项
    await expect(page.locator('[data-testid="chain-sheet"]')).toBeVisible()
  })
})
