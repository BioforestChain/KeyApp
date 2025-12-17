import { test, expect } from '@playwright/test'

test.describe('Guide 页面', () => {
  test('欢迎页面显示三个滑动页', async ({ page }) => {
    await page.goto('/#/welcome')

    // 应该显示第一个滑动页
    await expect(page.getByText('便捷转账')).toBeVisible()
    await expect(page.getByText('随时随地，轻松管理您的数字资产。')).toBeVisible()

    // 应该显示跳过按钮
    await expect(page.getByRole('button', { name: '跳过' })).toBeVisible()

    // 应该显示下一步按钮 (包含图标)
    await expect(page.getByRole('button', { name: /下一步/ })).toBeVisible()

    // 应该显示 3 个点指示器
    const dots = page.locator('button[aria-label*="跳转到第"]')
    await expect(dots).toHaveCount(3)
  })

  test('点击下一步切换到第二页', async ({ page }) => {
    await page.goto('/#/welcome')

    // 等待页面加载
    await expect(page.getByText('便捷转账')).toBeVisible()

    // 使用 JavaScript 点击，绕过 pointer event 拦截
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button')
      for (const btn of buttons) {
        if (btn.textContent?.includes('下一步')) {
          btn.click()
          return
        }
      }
    })

    // 应该显示第二个滑动页
    await expect(page.getByText('多链支持')).toBeVisible({ timeout: 5000 })
  })

  test('最后一页显示开始使用和我有钱包按钮', async ({ page }) => {
    await page.goto('/#/welcome')

    // 使用点指示器直接跳到第三页
    await page.locator('button[aria-label="跳转到第 3 页"]').click({ force: true })

    // 应该显示第三个滑动页
    await expect(page.getByText('全面安全')).toBeVisible({ timeout: 5000 })

    // 应该显示开始使用和我有钱包按钮
    await expect(page.getByRole('button', { name: '开始使用' })).toBeVisible()
    await expect(page.getByRole('button', { name: '我有钱包' })).toBeVisible()
  })

  test('跳过按钮导航到首页', async ({ page }) => {
    await page.goto('/#/welcome')

    // 点击跳过
    await page.getByRole('button', { name: '跳过' }).click()

    // 应该导航到首页
    await expect(page).toHaveURL('/#/')
  })

  test('开始使用按钮导航到创建钱包页', async ({ page }) => {
    await page.goto('/#/welcome')

    // 使用点指示器直接跳到第三页
    await page.locator('button[aria-label="跳转到第 3 页"]').click({ force: true })

    // 等待按钮出现
    const getStartedButton = page.getByRole('button', { name: '开始使用' })
    await expect(getStartedButton).toBeVisible({ timeout: 5000 })

    // 点击开始使用
    await getStartedButton.click({ force: true })

    // 应该导航到创建钱包页
    await expect(page).toHaveURL(/\/#\/wallet\/create\/?/)
  })

  test('我有钱包按钮导航到导入钱包页', async ({ page }) => {
    await page.goto('/#/welcome')

    // 等待页面加载
    await expect(page.getByText('便捷转账')).toBeVisible()

    // 使用 JavaScript 跳到第三页
    await page.evaluate(() => {
      const thirdDot = document.querySelector('button[aria-label="跳转到第 3 页"]') as HTMLButtonElement
      if (thirdDot) thirdDot.click()
    })

    // 等待第三页内容出现
    await expect(page.getByText('全面安全')).toBeVisible({ timeout: 5000 })

    // 等待按钮出现
    const haveWalletButton = page.getByRole('button', { name: '我有钱包' })
    await expect(haveWalletButton).toBeVisible({ timeout: 5000 })

    // 使用 JavaScript 点击
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button')
      for (const btn of buttons) {
        if (btn.textContent?.includes('我有钱包')) {
          btn.click()
          return
        }
      }
    })

    // 应该导航到导入钱包页
    await expect(page).toHaveURL(/\/#\/wallet\/import\/?/)
  })
})
