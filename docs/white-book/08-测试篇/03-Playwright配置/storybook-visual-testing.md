# Storybook 视觉测试最佳实践

> 基于 Storybook 官方文档和项目实践总结

---

## 1. 测试架构概述

项目采用**双轨制**测试策略：

```
┌─────────────────────────────────────────────────────────────┐
│                    Storybook 测试生态                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │  pnpm test:storybook │    │  npx playwright test        │ │
│  │  (vitest + browser)  │    │  --config=playwright.       │ │
│  │                      │    │  storybook.config.ts        │ │
│  ├─────────────────────┤    ├─────────────────────────────┤ │
│  │  ✓ 交互测试          │    │  ✓ 视觉回归测试              │ │
│  │  ✓ play 函数验证     │    │  ✓ 截图对比                  │ │
│  │  ✓ 状态断言          │    │  ✓ 跨浏览器验证              │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.1 Vitest Storybook 测试

用于验证组件**交互逻辑**：

```bash
pnpm test:storybook
```

- 执行所有 stories 中的 `play` 函数
- 验证用户交互行为
- 断言组件状态变化

### 1.2 Playwright Storybook E2E

用于**视觉回归**截图测试：

```bash
npx playwright test --config=playwright.storybook.config.ts
```

- 截图对比检测 UI 变化
- 移动端视口验证
- 基线管理

---

## 2. 配置规范

### 2.1 Playwright Storybook 配置

```typescript
// playwright.storybook.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './storybook-e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  
  // 截图输出目录
  snapshotDir: './storybook-e2e/__screenshots__',
  snapshotPathTemplate: '{snapshotDir}/{projectName}/{testFileName}-{arg}{ext}',
  
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  expect: {
    toHaveScreenshot: {
      // 允许 1% 像素差异（处理抗锯齿等微小差异）
      maxDiffPixelRatio: 0.01,
    },
  },
  
  projects: [
    {
      // 移动端优先
      name: 'Mobile-Chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
      },
    },
  ],
})
```

### 2.2 截图目录结构

```
storybook-e2e/
├── __screenshots__/
│   └── Mobile-Chrome/
│       ├── provider-fallback-warning.spec.ts-bfmeta-normal-data.png
│       ├── provider-fallback-warning.spec.ts-bfmeta-fallback-warning.png
│       ├── provider-fallback-warning.spec.ts-ethereum-normal-data.png
│       └── ...
├── provider-fallback-warning.spec.ts
├── currency-exchange.spec.ts
└── ...
```

---

## 3. 编写规范

### 3.1 测试文件结构

```typescript
// storybook-e2e/xxx.spec.ts
import { expect, test } from '@playwright/test'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const storybookStaticDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../storybook-static'
)

// 启动静态服务器（复用模式）
async function startStorybookServer() { /* ... */ }

// 生成 story iframe URL
function storyIframeUrl(baseUrl: string, storyId: string): string {
  return `${baseUrl}/iframe.html?viewMode=story&id=${storyId}`
}

test.describe('Feature Screenshots', () => {
  let server: Server
  let baseUrl: string

  test.beforeAll(async () => {
    const started = await startStorybookServer()
    server = started.server
    baseUrl = started.baseUrl
  })

  test.afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    )
  })

  test('Component - State A', async ({ page }) => {
    await page.goto(storyIframeUrl(baseUrl, 'category-component--state-a'))
    await page.waitForSelector('[data-testid="component"]', { timeout: 10000 })
    await expect(page).toHaveScreenshot('component-state-a.png')
  })
})
```

### 3.2 Story ID 命名规则

Story ID 由 Storybook 自动生成，规则如下：

```
{category}-{component}--{story-name}
```

示例：
- `wallet-walletaddressportfolio--bf-meta-normal-data`
- `token-tokenitem--multi-currency`

可通过 Storybook URL 查看实际 ID：
```
http://localhost:6006/?path=/story/wallet-walletaddressportfolio--bf-meta-normal-data
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                                     这就是 Story ID
```

---

## 4. Stories 设计原则

### 4.1 为截图测试设计 Stories

```tsx
// xxx.stories.tsx
export const NormalData: Story = {
  args: {
    // 使用固定的 mock 数据，确保截图一致性
    balance: '23.68',
    symbol: 'ETH',
  },
}

export const FallbackWarning: Story = {
  args: {
    // 模拟降级场景
    supported: false,
    fallbackReason: 'Provider timeout after 10s',
    balance: '0',
  },
}

export const EmptyState: Story = {
  args: {
    // 空数据状态
    balance: '0',
    transactions: [],
  },
}
```

### 4.2 Mock 数据稳定性

**关键原则：截图测试的 mock 数据必须稳定**

```tsx
// ❌ 不稳定 - 使用随机数据
const mockBalance = Math.random() * 100

// ✅ 稳定 - 使用固定数据
const mockBalance = '23.68'

// ❌ 不稳定 - 使用当前时间
const mockDate = new Date()

// ✅ 稳定 - 使用固定时间
const mockDate = new Date('2024-01-15T10:30:00Z')
```

### 4.3 添加 data-testid

```tsx
// 组件中添加 data-testid 便于等待和验证
<div data-testid="wallet-address-portfolio">
  {/* ... */}
</div>

<div data-testid="provider-fallback-warning">
  {/* ... */}
</div>
```

---

## 5. 运行和维护

### 5.1 运行截图测试

```bash
# 1. 先构建 Storybook 静态文件
pnpm build-storybook

# 2. 运行截图测试
npx playwright test --config=playwright.storybook.config.ts

# 3. 更新基线截图
npx playwright test --config=playwright.storybook.config.ts --update-snapshots
```

### 5.2 CI 集成

```yaml
# .github/workflows/test.yml
storybook-visual:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v2
    - run: pnpm install
    - run: pnpm build-storybook
    - run: npx playwright test --config=playwright.storybook.config.ts
```

### 5.3 截图更新流程

1. 本地运行测试，发现差异
2. 检查差异是否为**预期变更**
3. 如果是预期变更，运行 `--update-snapshots`
4. 提交新的基线截图到 Git

---

## 6. 官方推荐方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **Chromatic** (官方推荐) | 云端托管、跨浏览器、团队协作 | 付费服务、需网络 | 大型团队、CI/CD |
| **Playwright + Storybook** | 免费、本地运行、灵活 | 需手动管理基线 | 本项目采用 |
| **Percy** | 云端、集成好 | 付费 | 企业项目 |

本项目采用 **Playwright + Storybook** 方案，原因：
- 开源免费
- 本地可控
- 与现有 E2E 测试工具链统一
- 移动端优先的截图策略

---

## 7. 常见问题

### Q1: 截图不稳定（flaky）？

检查以下几点：
1. Mock 数据是否固定
2. 字体是否已加载完成
3. 动画是否已完成
4. 异步数据是否已渲染

### Q2: 如何等待组件渲染完成？

```typescript
// 等待特定元素出现
await page.waitForSelector('[data-testid="component"]', { timeout: 10000 })

// 等待网络空闲
await page.waitForLoadState('networkidle')

// 等待固定时间（最后手段）
await page.waitForTimeout(500)
```

### Q3: 如何处理动态内容？

```typescript
await expect(page).toHaveScreenshot('component.png', {
  // 遮盖动态区域
  mask: [
    page.locator('[data-testid="timestamp"]'),
    page.locator('[data-testid="random-avatar"]'),
  ],
})
```

---

## 本章小结

- **双轨制**：Vitest 测交互，Playwright 测视觉
- **移动优先**：截图使用移动端视口 (393x851)
- **稳定数据**：Mock 数据必须固定
- **统一目录**：截图存放于 `storybook-e2e/__screenshots__/Mobile-Chrome/`
