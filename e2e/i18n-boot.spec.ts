import { expect, test } from '@playwright/test'

/**
 * i18n 启动测试
 * 
 * 注意：TabBar 标签当前是硬编码中文，不受 i18n 影响
 * 此测试验证 document.dir 属性（RTL/LTR）正确应用
 */

test.describe('i18n boot', () => {
  test('applies persisted RTL language on reload', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('bfmpay_preferences', JSON.stringify({ language: 'ar' }))
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 验证 RTL 方向设置
    await expect
      .poll(async () => await page.evaluate(() => document.documentElement.dir))
      .toBe('rtl')
  })

  test('applies persisted EN language on reload', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('bfmpay_preferences', JSON.stringify({ language: 'en' }))
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 验证 LTR 方向设置
    await expect
      .poll(async () => await page.evaluate(() => document.documentElement.dir))
      .toBe('ltr')
  })

  test('defaults to LTR for Chinese language', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('bfmpay_preferences', JSON.stringify({ language: 'zh' }))
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 中文应该是 LTR
    await expect
      .poll(async () => await page.evaluate(() => document.documentElement.dir))
      .toBe('ltr')
  })
})
