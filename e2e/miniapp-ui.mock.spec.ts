import { test, expect, type Page } from './fixtures'

/**
 * 小程序 UI 截图测试
 *
 * 直接测试小程序界面，验证共享组件和主题正常工作
 */

async function getMiniappBaseUrl(page: Page, appId: string): Promise<string> {
  const res = await page.request.get('/miniapps/ecosystem.json')
  expect(res.ok()).toBeTruthy()

  const data = (await res.json()) as { apps?: Array<{ id: string; url: string }> }
  const app = data.apps?.find((a) => a.id === appId)
  expect(app?.url).toBeTruthy()

  return app!.url
}

async function gotoMiniapp(page: Page, appId: string, query?: string): Promise<void> {
  const baseUrl = await getMiniappBaseUrl(page, appId)
  const url = query ? `${baseUrl}${query}` : baseUrl

  await page.goto(url)
  await expect(page.getByTestId('connect-button')).toBeVisible()
  await expect(page.getByTestId('connect-button')).toBeEnabled()
}

test.describe('Teleport 小程序 UI', () => {
  test.beforeEach(async ({ page }) => {
    // 设置视口为移动端尺寸
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('连接页面 - 初始状态', async ({ page }) => {
    await gotoMiniapp(page, 'xin.dweb.teleport')
    await expect(page).toHaveScreenshot('teleport-01-connect.png')
  })

  test('连接页面 - 暗色主题', async ({ page }) => {
    await gotoMiniapp(page, 'xin.dweb.teleport', '?colorMode=dark')

    // 手动添加 dark class（因为小程序需要接收 context）
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })
    await expect(page.getByTestId('connect-button')).toBeVisible()

    await expect(page).toHaveScreenshot('teleport-02-connect-dark.png')
  })

  test('连接页面 - 不同主题色', async ({ page }) => {
    await gotoMiniapp(page, 'xin.dweb.teleport', '?primaryHue=200')
    
    // 设置蓝色主题
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--primary-hue', '200')
    })
    await expect(page.getByTestId('connect-button')).toBeVisible()

    await expect(page).toHaveScreenshot('teleport-03-connect-blue-theme.png')
  })
})

test.describe('Forge 小程序 UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('连接页面 - 初始状态', async ({ page }) => {
    await gotoMiniapp(page, 'xin.dweb.biobridge')
    await expect(page).toHaveScreenshot('forge-01-connect.png')
  })

  test('连接页面 - 暗色主题', async ({ page }) => {
    await gotoMiniapp(page, 'xin.dweb.biobridge', '?colorMode=dark')

    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })
    await expect(page.getByTestId('connect-button')).toBeVisible()

    await expect(page).toHaveScreenshot('forge-02-connect-dark.png')
  })

  test('连接页面 - 自定义主题色', async ({ page }) => {
    await gotoMiniapp(page, 'xin.dweb.biobridge', '?primaryHue=145')
    
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--primary-hue', '145')
    })
    await expect(page.getByTestId('connect-button')).toBeVisible()

    await expect(page).toHaveScreenshot('forge-03-green-theme.png')
  })
})

test.describe('小程序主题同步', () => {
  test('Teleport - 主题色通过 URL 参数传递', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // 使用绿色主题 (hue=145)
    await gotoMiniapp(page, 'xin.dweb.teleport', '?primaryHue=145&primarySaturation=0.2')
    
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--primary-hue', '145')
      document.documentElement.style.setProperty('--primary-saturation', '0.2')
    })
    await expect(page.getByTestId('connect-button')).toBeVisible()

    await expect(page).toHaveScreenshot('teleport-04-green-theme.png')
  })

  test('Forge - 暗色 + 自定义主题色', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await gotoMiniapp(page, 'xin.dweb.biobridge', '?colorMode=dark&primaryHue=280')
    
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
      document.documentElement.style.setProperty('--primary-hue', '280')
    })
    await expect(page.getByTestId('connect-button')).toBeVisible()

    await expect(page).toHaveScreenshot('forge-04-dark-purple-theme.png')
  })
})
