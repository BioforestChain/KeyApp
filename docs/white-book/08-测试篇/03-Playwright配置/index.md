# 第二十五章：Playwright 配置

> E2E 测试、截图、视觉回归

---

## 25.1 配置文件

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  snapshotPathTemplate: '{snapshotDir}/{projectName}/{arg}{ext}',
  snapshotDir: './e2e/__screenshots__',
  
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
  },
  
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      threshold: 0.3,
    },
  },
  
  projects: [
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Desktop Chrome',
      use: { viewport: { width: 1280, height: 720 } },
    },
  ],
  
  webServer: {
    command: 'pnpm dev:mock',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 25.2 E2E 测试示例

```typescript
// e2e/wallet-create.spec.ts
import { test, expect } from '@playwright/test'

test('创建钱包流程', async ({ page }) => {
  await page.goto('/')
  await page.click('text=创建新钱包')
  
  // 设置钱包锁（E2E 测试中使用模拟图案）
  await page.fill('[data-testid="pattern-lock-input"]', '0,1,2,5,8')
  await page.fill('[data-testid="pattern-lock-confirm"]', '0,1,2,5,8')
  await page.click('text=下一步')
  
  // 备份助记词
  await page.waitForSelector('text=备份助记词')
  await page.click('text=显示')
  await page.click('text=我已备份')
  
  // 验证助记词
  // ... 填写验证
  
  // 完成创建
  await page.click('text=完成创建')
  await page.waitForURL('**/#/')
  
  // 验证钱包已创建
  await expect(page.locator('[data-testid="chain-selector"]')).toBeVisible()
})
```

---

## 25.3 视觉回归测试

```typescript
test('首页截图', async ({ page }) => {
  await setupTestWallet(page)
  await expect(page).toHaveScreenshot('home-with-wallet.png', {
    mask: [page.locator('[data-testid="address-display"]')],
  })
})
```

### 更新截图

```bash
pnpm e2e:update
```

---

## 25.4 运行命令

```bash
# 运行 E2E 测试
pnpm e2e

# UI 模式
pnpm e2e:ui

# 有头模式
pnpm e2e:headed

# 查看报告
pnpm e2e:report
```

---

## 本章小结

- 多视口测试：移动端 + 桌面端
- 视觉回归测试确保 UI 一致性
- Mock 服务避免外部依赖
