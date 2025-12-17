# 第十七章：组件开发规范

> 定义 Storybook 驱动的组件开发流程

---

## 17.1 开发流程

### Story First 开发

```
1. 定义接口 (Props)
        ↓
2. 编写 Story
        ↓
3. 在 Storybook 中开发
        ↓
4. 编写测试
        ↓
5. 集成到页面
```

### 优势

- 组件独立开发，不依赖页面环境
- 即时预览所有状态
- 自动生成文档
- 便于测试和评审

---

## 17.2 Story 编写规范

### 基本结构

```typescript
// src/components/wallet/wallet-card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { WalletCard } from './wallet-card'

const meta = {
  title: 'Wallet/WalletCard',
  component: WalletCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WalletCard>

export default meta
type Story = StoryObj<typeof meta>

// 默认状态
export const Default: Story = {
  args: {
    wallet: mockWallet,
    chainAddress: mockChainAddress,
  },
}

// 未备份状态
export const NotBackedUp: Story = {
  args: {
    ...Default.args,
    wallet: { ...mockWallet, isBackedUp: false },
  },
}

// 加载状态
export const Loading: Story = {
  args: {
    wallet: null,
    isLoading: true,
  },
}
```

### 命名规范

| 规则 | 示例 |
|-----|------|
| 文件名 | `组件名.stories.tsx` |
| Meta title | `分类/组件名` |
| Story 名 | PascalCase，描述状态 |

### 分类建议

```
UI/                  # 基础 UI 组件
├── Button
├── Input
├── Card

Common/              # 通用业务组件
├── AddressDisplay
├── AmountDisplay

Wallet/              # 钱包组件
├── WalletCard
├── ChainSelector

Transfer/            # 转账组件
├── TransferForm
├── FeeSelector
```

---

## 17.3 交互测试

### 使用 play 函数

```typescript
import { within, userEvent, expect } from '@storybook/test'

export const ToggleVisibility: Story = {
  args: {
    placeholder: '输入密码',
    showToggle: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('输入密码')
    const toggleButton = canvas.getByRole('button')
    
    await step('输入密码', async () => {
      await userEvent.type(input, 'secret123')
      await expect(input).toHaveAttribute('type', 'password')
    })
    
    await step('显示密码', async () => {
      await userEvent.click(toggleButton)
      await expect(input).toHaveAttribute('type', 'text')
    })
    
    await step('隐藏密码', async () => {
      await userEvent.click(toggleButton)
      await expect(input).toHaveAttribute('type', 'password')
    })
  },
}
```

### 表单交互测试

```typescript
export const FormValidation: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // 提交空表单
    const submitButton = canvas.getByRole('button', { name: /提交/ })
    await userEvent.click(submitButton)
    
    // 验证错误提示
    await expect(canvas.getByText('请输入地址')).toBeVisible()
    
    // 填写表单
    const addressInput = canvas.getByLabelText('收款地址')
    await userEvent.type(addressInput, '0x1234567890abcdef...')
    
    // 错误消失
    await expect(canvas.queryByText('请输入地址')).not.toBeInTheDocument()
  },
}
```

---

## 17.4 参数控制

### Args 定义

```typescript
const meta = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'ghost'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    onClick: {
      action: 'clicked',
    },
  },
} satisfies Meta<typeof Button>
```

### Decorators

```typescript
const meta = {
  decorators: [
    // 添加容器
    (Story) => (
      <div className="p-4 max-w-md">
        <Story />
      </div>
    ),
    // 提供 Context
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
}
```

---

## 17.5 文档生成

### JSDoc 注释

```typescript
interface ButtonProps {
  /**
   * 按钮变体
   * @default 'default'
   */
  variant?: 'default' | 'destructive' | 'outline' | 'ghost'
  
  /**
   * 按钮尺寸
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  
  /**
   * 是否禁用
   */
  disabled?: boolean
  
  /**
   * 点击事件处理
   */
  onClick?: () => void
}
```

### MDX 文档

```mdx
{/* src/components/wallet/wallet-card.mdx */}
import { Meta, Canvas, Controls } from '@storybook/blocks'
import * as WalletCardStories from './wallet-card.stories'

<Meta of={WalletCardStories} />

# WalletCard

钱包卡片组件，用于展示钱包信息和快捷操作。

## 使用示例

<Canvas of={WalletCardStories.Default} />

## Props

<Controls />

## 变体

### 未备份状态

当钱包未备份时，显示警告标签。

<Canvas of={WalletCardStories.NotBackedUp} />
```

---

## 17.6 视口测试

### 移动端视口

```typescript
// .storybook/preview.tsx
const viewports = {
  iPhone14: {
    name: 'iPhone 14',
    styles: { width: '390px', height: '844px' },
  },
  iPhone14ProMax: {
    name: 'iPhone 14 Pro Max',
    styles: { width: '430px', height: '932px' },
  },
  pixel7: {
    name: 'Pixel 7',
    styles: { width: '412px', height: '915px' },
  },
}

const preview: Preview = {
  parameters: {
    viewport: {
      viewports,
      defaultViewport: 'iPhone14',
    },
  },
}
```

### 容器尺寸测试

```typescript
export const ResponsiveTest: Story = {
  decorators: [
    (Story, context) => {
      const width = context.args.containerWidth || 360
      return (
        <div
          style={{ width, resize: 'horizontal', overflow: 'auto' }}
          className="border border-dashed p-2"
        >
          <Story />
        </div>
      )
    },
  ],
  args: {
    containerWidth: 360,
  },
}
```

---

## 17.7 与 Vitest 集成

### 运行 Story 测试

```bash
# 运行所有 Story 测试
pnpm test:storybook

# 运行特定组件
pnpm test:storybook -- --grep "WalletCard"
```

### 配置

```typescript
// vitest.config.ts
{
  plugins: [
    storybookTest({
      configDir: '.storybook',
      storybookScript: 'pnpm storybook --ci',
    }),
  ],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
    },
  },
}
```

---

## 本章小结

- Story First 开发流程
- 使用 play 函数进行交互测试
- 通过 argTypes 控制参数
- JSDoc + MDX 生成文档
- 与 Vitest 集成运行测试

---

## 下一篇

完成组件篇后，继续阅读 [第六篇：安全篇](../../06-安全篇/)，了解安全设计。
