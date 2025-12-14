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

    const homeTab = page.getByRole('button', { name: 'الرئيسية' })
    const transferTab = page.getByRole('button', { name: 'تحويل' })
    const walletTab = page.getByRole('button', { name: 'المحفظة' })
    const settingsTab = page.getByRole('button', { name: 'الإعدادات' })

    await expect(homeTab).toBeVisible()
    await expect(transferTab).toBeVisible()
    await expect(walletTab).toBeVisible()
    await expect(settingsTab).toBeVisible()

    // Ensure the *visible* labels are localized (not only aria-label / accessible name).
    await expect(homeTab).toContainText('الرئيسية')
    await expect(transferTab).toContainText('تحويل')
    await expect(walletTab).toContainText('المحفظة')
    await expect(settingsTab).toContainText('الإعدادات')
  })

  test('applies persisted EN language on reload', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('bfmpay_preferences', JSON.stringify({ language: 'en' }))
    })
    await page.reload()

    await page.goto('/#/settings')

    await expect
      .poll(async () => await page.evaluate(() => document.documentElement.dir))
      .toBe('ltr')

    const homeTab = page.getByRole('button', { name: 'Home' })
    const transferTab = page.getByRole('button', { name: 'Transfer' })
    const walletTab = page.getByRole('button', { name: 'Wallet' })
    const settingsTab = page.getByRole('button', { name: 'Settings' })

    await expect(homeTab).toBeVisible()
    await expect(transferTab).toBeVisible()
    await expect(walletTab).toBeVisible()
    await expect(settingsTab).toBeVisible()

    // Ensure the *visible* labels are localized (not only aria-label / accessible name).
    await expect(homeTab).toContainText('Home')
    await expect(transferTab).toContainText('Transfer')
    await expect(walletTab).toContainText('Wallet')
    await expect(settingsTab).toContainText('Settings')
  })
})
