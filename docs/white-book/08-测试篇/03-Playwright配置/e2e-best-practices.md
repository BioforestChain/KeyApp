# E2E 测试最佳实践

> 国际化项目的 E2E 测试规范

---

## 核心原则：禁止使用明文选择器

由于本项目是国际化项目，支持多语言切换，**严禁使用硬编码的文本内容作为元素选择器**。

### 错误示例 ❌

```typescript
// 严禁：使用硬编码的中文文本
await page.click('text=转账')
await page.click('text=确认')
await page.waitForSelector('text=发送成功')
await page.click('button:has-text("下一步")')
```

### 正确示例 ✅

```typescript
// 正确：使用 data-testid 属性
await page.click('[data-testid="send-button"]')
await page.click('[data-testid="confirm-button"]')
await page.waitForSelector('[data-testid="success-message"]')
await page.click('[data-testid="next-step-button"]')
```

---

## data-testid 命名规范

### 命名格式

采用 kebab-case（短横线分隔），格式为：`{组件/功能}-{元素类型}`

```
chain-selector          // 链选择器
send-button            // 发送按钮
receive-button         // 收款按钮
confirm-dialog         // 确认对话框
pattern-lock           // 图案锁
mnemonic-textarea      // 助记词文本框
wallet-card            // 钱包卡片
token-list             // 代币列表
```

### 页面级别命名

页面级别的元素添加页面前缀：

```
home-balance           // 首页余额显示
send-amount-input      // 发送页金额输入
receive-qrcode         // 收款页二维码
settings-language      // 设置页语言选项
```

### 动态元素命名

对于列表项等动态元素，使用 `data-testid` 配合索引或唯一标识：

```tsx
// 列表项
{tokens.map((token, index) => (
  <div data-testid={`token-item-${index}`}>
    {/* 或使用唯一ID */}
  </div>
))}

// 链选项
{chains.map(chain => (
  <div data-testid={`chain-option-${chain.id}`}>
    {chain.name}
  </div>
))}
```

---

## 必须添加 data-testid 的元素

以下类型的元素必须添加 `data-testid`：

### 1. 交互元素

| 元素类型 | 命名示例 |
|---------|---------|
| 按钮 | `send-button`, `confirm-button`, `cancel-button` |
| 输入框 | `pattern-lock`, `amount-input`, `address-input` |
| 选择器 | `chain-selector`, `token-selector`, `language-selector` |
| 开关 | `dark-mode-toggle`, `notification-toggle` |
| 链接 | `settings-link`, `help-link` |

### 2. 内容展示

| 元素类型 | 命名示例 |
|---------|---------|
| 余额显示 | `balance-display`, `fiat-value` |
| 地址显示 | `address-display`, `qrcode-address` |
| 状态指示 | `loading-spinner`, `success-message`, `error-message` |
| 列表容器 | `token-list`, `transaction-list`, `wallet-list` |

### 3. 容器/区域

| 元素类型 | 命名示例 |
|---------|---------|
| 页面标题 | `page-title`, `section-title` |
| Sheet/Modal | `chain-sheet`, `confirm-dialog`, `wallet-lock-modal` |
| 导航 | `bottom-tabs`, `back-button`, `nav-header` |

---

## 组件实现示例

### PageHeader 组件

```tsx
export function PageHeader({ title, onBack }: PageHeaderProps) {
  return (
    <header data-testid="page-header">
      {onBack && (
        <button data-testid="back-button" onClick={onBack}>
          <IconArrowLeft />
        </button>
      )}
      <h1 data-testid="page-title">{title}</h1>
    </header>
  )
}
```

### GradientButton 组件

```tsx
export function GradientButton({ 
  children, 
  'data-testid': testId,
  ...props 
}: GradientButtonProps) {
  return (
    <button data-testid={testId} {...props}>
      {children}
    </button>
  )
}
```

### 列表组件

```tsx
export function TokenList({ tokens }: TokenListProps) {
  return (
    <div data-testid="token-list">
      {tokens.map((token, index) => (
        <TokenItem
          key={token.symbol}
          data-testid={`token-item-${index}`}
          token={token}
        />
      ))}
    </div>
  )
}
```

---

## E2E 测试编写规范

### 测试文件结构

```typescript
import { test, expect } from '@playwright/test'

// 使用辅助函数设置测试环境
async function setupTestWallet(page: Page) {
  await page.addInitScript((data) => {
    localStorage.setItem('bfm_wallets', JSON.stringify(data))
  }, TEST_WALLET_DATA)
  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

test.describe('功能模块名称', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
  })

  test('测试用例描述', async ({ page }) => {
    await setupTestWallet(page)
    
    // 使用 data-testid 进行元素定位
    await page.click('[data-testid="send-button"]')
    await page.waitForSelector('[data-testid="page-title"]')
    
    // 使用 expect 进行断言
    await expect(page.locator('[data-testid="balance-display"]')).toBeVisible()
  })
})
```

### 等待策略

```typescript
// 推荐：等待特定 testid 元素
await page.waitForSelector('[data-testid="success-message"]')

// 推荐：等待元素状态变化
await page.waitForSelector('[data-testid="modal"]', { state: 'hidden' })

// 推荐：等待网络空闲（用于异步数据加载）
await page.waitForLoadState('networkidle')

// 避免：使用固定延时
// await page.waitForTimeout(1000) // ❌
```

### 表单交互

```typescript
// 输入框使用 testid
await page.fill('[data-testid="pattern-lock-input"]', '0,1,2,5,8')
await page.fill('[data-testid="pattern-lock-confirm"]', '0,1,2,5,8')

// 按钮点击使用 testid
await page.click('[data-testid="submit-button"]')
```

---

## 已定义的 data-testid 列表

### 全局组件

| testid | 组件/元素 | 所在文件 |
|--------|----------|---------|
| `chain-selector` | 链选择器按钮 | HomeTab.tsx |
| `chain-sheet` | 链选择 Sheet | ChainSelectorSheet.tsx |
| `send-button` | 发送/转账按钮 | HomeTab.tsx |
| `receive-button` | 收款按钮 | HomeTab.tsx |
| `page-title` | 页面标题 | PageHeader.tsx |
| `back-button` | 返回按钮 | PageHeader.tsx |

### 钱包相关

| testid | 组件/元素 | 所在文件 |
|--------|----------|---------|
| `wallet-card` | 钱包卡片 | WalletCard.tsx |
| `address-display` | 地址显示 | AddressDisplay.tsx |
| `balance-display` | 余额显示 | BalanceDisplay.tsx |
| `token-list` | 代币列表 | TokenList.tsx |

### 导入/创建流程

| testid | 组件/元素 | 所在文件 |
|--------|----------|---------|
| `create-wallet-button` | 创建钱包按钮 | WelcomePage.tsx |
| `import-wallet-button` | 导入钱包按钮 | WelcomePage.tsx |
| `key-type-selector` | 密钥类型选择 | OnboardingRecover.tsx |
| `mnemonic-textarea` | 助记词输入框 | MnemonicInput.tsx |
| `pattern-lock` | 图案锁组件 | PatternLock.tsx |
| `pattern-lock-confirm` | 确认图案锁 | PatternLockSetup.tsx |
| `continue-button` | 继续按钮 | 多个页面 |
| `success-message` | 成功提示 | ImportSuccess.tsx |
| `enter-wallet-button` | 进入钱包按钮 | ImportSuccess.tsx |

---

## 审查清单

在提交 E2E 测试代码前，请确认：

- [ ] 所有元素定位都使用 `data-testid`
- [ ] 没有使用 `text=xxx` 或 `:has-text("xxx")` 选择器
- [ ] 相关组件已添加必要的 `data-testid` 属性
- [ ] testid 命名遵循 kebab-case 规范
- [ ] 新增的 testid 已添加到上方列表

---

## 迁移指南

对于现有使用明文选择器的测试：

1. 找到所有 `text=` 和 `:has-text()` 选择器
2. 确定对应的组件文件
3. 在组件中添加 `data-testid` 属性
4. 更新测试代码使用新的 testid
5. 本地运行测试确认通过
6. 更新 testid 文档列表

---

## 截图审计

### 残留截图检测

项目使用 `@biochain/e2e-tools` 检测残留截图（不再被测试引用的截图文件）。

```bash
# 主应用
pnpm e2e:audit         # 检查所有项目
pnpm e2e:audit:run     # 仅检查主应用

# miniapps
cd miniapps/forge && pnpm e2e:audit
cd miniapps/teleport && pnpm e2e:audit
```

### 工作原理

1. 扫描 `e2e/*.spec.ts` 文件
2. 提取所有 `toHaveScreenshot('name.png')` 调用
3. 对比 `e2e/__screenshots__/` 目录中的实际文件
4. 报告未被引用的残留截图

### 处理残留截图

```bash
# 查看残留截图
pnpm e2e:audit:run

# 自动删除残留截图
bunx @biochain/e2e-tools audit --fix
```

### CI 集成

`--strict` 模式下发现残留截图会导致 exit code 1，用于 CI 流程中阻止合并。

### 常见场景

| 场景 | 处理方式 |
|------|---------|
| 删除了测试用例 | 运行 `--fix` 删除对应截图 |
| 重命名了截图 | 删除旧截图或更新测试代码 |
| 截图未被引用 | 检查是否遗漏 `toHaveScreenshot` 调用 |
