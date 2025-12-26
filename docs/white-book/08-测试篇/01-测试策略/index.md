# 第二十三章：测试策略

> 分层测试、覆盖率目标、Storybook + Vitest 集成

---

## 23.1 测试分层

| 层级 | 工具 | 测试内容 | 运行频率 |
|-----|------|---------|---------|
| 单元测试 | Vitest (jsdom) | 业务逻辑、工具函数、Hooks | 每次提交 |
| 组件测试 | Storybook + Vitest (浏览器) | 组件渲染、交互 | 每次提交 |
| E2E 测试 | Playwright | 完整用户流程 | PR / 发布前 |

---

## 23.2 测试命令

```bash
pnpm test              # 单元测试 (*.test.ts)
pnpm test:storybook    # Storybook 组件测试 (*.stories.tsx)
pnpm test:all          # 运行所有测试
pnpm test:coverage     # 单元测试 + 覆盖率报告
```

---

## 23.3 Storybook + Vitest 集成

项目使用 `@storybook/addon-vitest` 将 Stories 作为测试用例运行。

### 测试类型对比

| 文件类型 | 测试内容 | 运行环境 | 价值 |
|---------|---------|---------|------|
| `*.test.ts` | 纯逻辑/函数 | jsdom (快) | 验证业务逻辑正确性 |
| `*.stories.tsx` (无 play) | 组件能否渲染 | 真实浏览器 | 冒烟测试，防止渲染崩溃 |
| `*.stories.tsx` (有 play) | 用户交互流程 | 真实浏览器 | 集成测试 |

### 配置文件

```
vitest.config.ts          # 定义 unit 和 storybook 两个项目
.storybook/vitest.setup.ts # Storybook 测试初始化
.storybook/preview.tsx     # 全局 decorators (i18n, QueryClient, theme)
```

### Story 编写规范

**基础 Story（自动冒烟测试）：**

```tsx
export const Default: Story = {
  args: { value: 'test' },
}
```

**带交互测试的 Story：**

```tsx
import { within, userEvent, expect } from 'storybook/test'

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    await userEvent.type(input, 'hello')
    expect(canvas.getByText('hello')).toBeInTheDocument()
  },
}
```

### 全局 Decorators

在 `.storybook/preview.tsx` 中配置全局 Provider：

```tsx
// 必须包装的 Provider
- I18nextProvider      # 国际化
- QueryClientProvider  # TanStack Query
- ThemeProvider        # 主题切换
```

### 何时使用 play 函数

| 场景 | 是否需要 play |
|-----|--------------|
| 纯展示组件 | 否 - 自动冒烟测试足够 |
| 复杂交互（手势、拖拽） | 是 |
| 表单验证流程 | 是 |
| 状态机组件 | 是 |
| 已有 *.test.ts 覆盖的逻辑 | 否 - 避免重复 |

---

## 23.4 覆盖率目标

| 类型 | 目标 |
|-----|------|
| 语句覆盖 | ≥ 70% |
| 分支覆盖 | ≥ 70% |
| 函数覆盖 | ≥ 70% |
| 行覆盖 | ≥ 70% |

---

## 23.5 测试优先级

| 优先级 | 测试内容 |
|-------|---------|
| P0 | 密钥生成/派生、加密/解密、签名验证 |
| P1 | 钱包创建/导入、转账流程 |
| P2 | 余额查询、交易历史 |
| P3 | 设置、语言切换 |

---

## 23.6 测试命名规范

```typescript
describe('WalletStore', () => {
  describe('addWallet', () => {
    it('should add wallet to list', () => {})
    it('should set as current wallet', () => {})
    it('should persist to localStorage', () => {})
  })
})
```

---

## 23.7 CI 集成

CI 流水线运行以下测试：

```yaml
# .github/workflows/ci.yml
pnpm turbo run test:run test:storybook e2e:ci
```

| 步骤 | 说明 |
|-----|------|
| test:run | 单元测试 (jsdom) |
| test:storybook | Storybook 组件测试 (chromium) |
| e2e:ci | E2E 集成测试 |

---

## 本章小结

- 三层测试：单元 → 组件 → E2E
- Storybook Stories 自动作为冒烟测试运行
- 复杂交互使用 `play` 函数
- 避免 `*.test.ts` 和 `play` 函数测试重复
- 覆盖率目标 70%
- 安全相关代码优先测试
