import { expect, test } from '@playwright/test'

test.describe('i18n boot', () => {
  test('applies persisted RTL language on reload', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('bfmpay_preferences', JSON.stringify({ language: 'ar' }))
    })
    await page.reload()

    await page.goto('/#/settings')

    await expect
      .poll(async () => await page.evaluate(() => document.documentElement.dir))
      .toBe('rtl')

    await expect(page.getByRole('button', { name: 'الرئيسية' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'تحويل' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'المحفظة' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'الإعدادات' })).toBeVisible()
  })
})

