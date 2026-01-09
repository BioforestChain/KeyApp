# 测试策略

> 分层测试、覆盖率目标、Storybook + Vitest 集成

---

## 测试环境的本质区别

**Storybook v10 的核心价值：与 Vitest 深度融合，为组件测试提供真实浏览器环境。**

| 环境 | 技术栈 | 特点 | 适用场景 |
|------|--------|------|----------|
| **jsdom/happy-dom** | Vitest 单元测试 | 虚拟 DOM，快速但非真实浏览器 | 纯逻辑、算法、工具函数 |
| **真实浏览器 (Storybook)** | Storybook + Vitest | 真实渲染、真实 CSS、真实事件 | 组件渲染、复杂交互、样式验证 |
| **真实浏览器 (E2E)** | Playwright | 完整应用实例 | 端到端用户流程 |

### 为什么需要三层测试？

```
jsdom/happy-dom 的局限性：
├── 不支持真实 CSS 计算 (layout、动画)
├── 不支持某些 Web API (ResizeObserver、IntersectionObserver)
└── 事件模型与真实浏览器有差异

Storybook 组件测试的价值：
├── 在真实 Chromium 中渲染组件
├── 验证 CSS 样式、动画、响应式布局
├── 测试真实的用户交互
└── 每个 Story 自动成为冒烟测试

E2E 与组件测试的区别：
├── E2E 测试完整应用流程 (页面导航、状态持久化)
├── 组件测试聚焦单个组件的隔离行为
└── 组件测试更快、更稳定、更容易定位问题
```

---

## 测试分层

| 层级 | 工具 | 文件模式 | 测试内容 | 运行频率 |
|------|------|----------|----------|----------|
| 单元测试 | Vitest (jsdom) | `*.test.ts` | 业务逻辑、工具函数、Hooks | 每次提交 |
| 组件测试 | Storybook + Vitest | `*.stories.tsx` | 组件渲染、交互 | 每次提交 |
| E2E 测试 | Playwright | `e2e/*.spec.ts` | 完整用户流程 | PR / 发布前 |

---

## 测试命令

```bash
pnpm test              # 单元测试 (*.test.ts)
pnpm test:storybook    # Storybook 组件测试 (*.stories.tsx)
pnpm test:all          # 运行所有测试
pnpm test:coverage     # 单元测试 + 覆盖率报告
pnpm e2e               # E2E 测试
pnpm e2e:ui            # E2E 测试 (带 UI)
```

---

## Storybook + Vitest 集成

项目使用 `@storybook/addon-vitest` 将 Stories 作为测试用例运行。

### 测试类型对比

| 文件类型 | 测试内容 | 运行环境 | 价值 |
|----------|----------|----------|------|
| `*.test.ts` | 纯逻辑/函数 | jsdom (快) | 验证业务逻辑正确性 |
| `*.stories.tsx` (无 play) | 组件能否渲染 | 真实浏览器 | 冒烟测试，防止渲染崩溃 |
| `*.stories.tsx` (有 play) | 用户交互流程 | 真实浏览器 | 集成测试 |

### Story 编写规范

**基础 Story (自动冒烟测试)：**

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

### 何时使用 play 函数

| 场景 | 是否需要 play |
|------|---------------|
| 纯展示组件 | 否 - 自动冒烟测试足够 |
| 复杂交互 (手势、拖拽) | 是 |
| 表单验证流程 | 是 |
| 状态机组件 | 是 |
| 已有 *.test.ts 覆盖的逻辑 | 否 - 避免重复 |

---

## 覆盖率目标

| 类型 | 目标 |
|------|------|
| 语句覆盖 | ≥ 70% |
| 分支覆盖 | ≥ 70% |
| 函数覆盖 | ≥ 70% |
| 行覆盖 | ≥ 70% |

---

## 测试优先级

| 优先级 | 测试内容 | 说明 |
|--------|----------|------|
| **P0** | 密钥生成/派生、加密/解密、签名验证 | 安全关键 |
| **P1** | 钱包创建/导入、转账流程 | 核心功能 |
| **P2** | 余额查询、交易历史 | 重要功能 |
| **P3** | 设置、语言切换 | 辅助功能 |

---

## 测试命名规范

```typescript
describe('WalletStore', () => {
  describe('addWallet', () => {
    it('should add wallet to list', () => {})
    it('should set as current wallet', () => {})
    it('should persist to localStorage', () => {})
  })
})
```

### 命名约束

| 约束级别 | 要求 |
|----------|------|
| **MUST** | describe 描述模块/函数名 |
| **MUST** | it 描述预期行为 (should...) |
| **SHOULD** | 按功能分组 |
| **SHOULD** | 测试边界条件 |

---

## Mock 规范

### API Mock (MSW)

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/balance', () => {
    return HttpResponse.json({ balance: '1000000000' })
  }),
]
```

### 服务 Mock

```typescript
vi.mock('@/services/wallet', () => ({
  walletService: {
    getBalance: vi.fn().mockResolvedValue('1000000000'),
  },
}))
```

### Mock 约束

| 约束级别 | 要求 |
|----------|------|
| **MUST** | Mock 外部 API |
| **SHOULD** | 测试完整前端栈 |
| **SHOULD** | 使用 MSW 而非直接 mock fetch |

---

## 选择器规范

| 约束级别 | 要求 |
|----------|------|
| **MUST** | 使用 `data-testid` 作为稳定选择器 |
| **SHOULD** | 优先使用语义化选择器 (getByRole, getByLabelText) |
| **MUST NOT** | 依赖 CSS 类名或内部实现细节 |

```tsx
// ✅ Good
<button data-testid="submit-btn">Submit</button>
screen.getByTestId('submit-btn')
screen.getByRole('button', { name: 'Submit' })

// ❌ Bad
<button className="btn-primary">Submit</button>
document.querySelector('.btn-primary')
```

---

## CI 集成

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    steps:
      - run: pnpm test:run
      - run: pnpm test:storybook
      - run: pnpm e2e:ci
```

| 步骤 | 说明 |
|------|------|
| test:run | 单元测试 (jsdom) |
| test:storybook | Storybook 组件测试 (chromium) |
| e2e:ci | E2E 集成测试 |

---

## 相关文档

- [构建配置](../01-Build/README.md)
- [部署机制](../03-Release/02-Deployment.md)
- [安全审计](../../08-Security-Ref/04-Security-Audit.md)
