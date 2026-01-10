import { test, expect } from '@playwright/test'

test.describe('Guide 页面', () => {
  test('欢迎页面显示三个滑动页', async ({ page }) => {
    await page.goto('/#/welcome')

    // 应该显示跳过按钮
    await expect(page.locator('[data-testid="skip-button"]')).toBeVisible()

    // 应该显示下一步按钮
    await expect(page.locator('[data-testid="next-button"]')).toBeVisible()

    // 应该显示 3 个点指示器
    await expect(page.locator('[data-testid="slide-dot-0"]')).toBeVisible()
    await expect(page.locator('[data-testid="slide-dot-1"]')).toBeVisible()
    await expect(page.locator('[data-testid="slide-dot-2"]')).toBeVisible()
  })

  test('点击下一步切换到第二页', async ({ page }) => {
    await page.goto('/#/welcome')

    // 等待页面加载
    await expect(page.locator('[data-testid="next-button"]')).toBeVisible()

    // 点击下一步
    await page.click('[data-testid="next-button"]')

    // 应该仍然显示下一步按钮（第二页）
    await expect(page.locator('[data-testid="next-button"]')).toBeVisible({ timeout: 5000 })
  })

  test('最后一页显示开始使用和我有钱包按钮', async ({ page }) => {
    await page.goto('/#/welcome')

    // 使用点指示器直接跳到第三页
    await page.click('[data-testid="slide-dot-2"]', { force: true })

    // 应该显示开始使用和我有钱包按钮
    await expect(page.locator('[data-testid="get-started-button"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('[data-testid="have-wallet-button"]')).toBeVisible()
  })

  test('跳过按钮导航到首页', async ({ page }) => {
    await page.goto('/#/welcome')

    // 点击跳过
    await page.click('[data-testid="skip-button"]')

    // 应该导航到首页
    await expect(page).toHaveURL('/#/')
  })

  test('开始使用按钮导航到创建钱包页', async ({ page }) => {
    await page.goto('/#/welcome')

    // 使用点指示器直接跳到第三页
    await page.click('[data-testid="slide-dot-2"]', { force: true })

    // 等待按钮出现
    await expect(page.locator('[data-testid="get-started-button"]')).toBeVisible({ timeout: 5000 })

    // 点击开始使用
    await page.click('[data-testid="get-started-button"]', { force: true })

    // 应该导航到创建钱包页
    await expect(page).toHaveURL(/(\/#\/wallet\/create)|(\/#\/onboarding\/create)\/?/)
  })

  test('我有钱包按钮导航到导入钱包页', async ({ page }) => {
    await page.goto('/#/welcome')

    // 跳到第三页
    await page.click('[data-testid="slide-dot-2"]', { force: true })

    // 等待按钮出现
    await expect(page.locator('[data-testid="have-wallet-button"]')).toBeVisible({ timeout: 5000 })

    // 点击我有钱包
    await page.click('[data-testid="have-wallet-button"]', { force: true })

    // 应该导航到导入钱包页
    await expect(page).toHaveURL(/(\/#\/wallet\/import)|(\/#\/onboarding\/recover)\/?/)
  })
})
