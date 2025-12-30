import { useState, useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, waitFor, within } from '@storybook/test'
import { MiniappSplashScreen } from './miniapp-splash-screen'

const meta: Meta<typeof MiniappSplashScreen> = {
  title: 'Ecosystem/MiniappSplashScreen',
  component: MiniappSplashScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="relative h-[600px] w-full bg-background">
        <Story />
      </div>
    ),
  ],
  args: {
    visible: true,
    animating: true,
    onClose: fn(),
  },
}

export default meta
type Story = StoryObj<typeof MiniappSplashScreen>

// 默认紫色主题
export const Default: Story = {
  args: {
    app: {
      name: '转账助手',
      icon: 'https://picsum.photos/seed/splash1/200',
      themeColor: 280, // 紫色
    },
  },
}

// 蓝色主题
export const BlueTheme: Story = {
  args: {
    app: {
      name: 'DeFi 收益',
      icon: 'https://picsum.photos/seed/splash2/200',
      themeColor: 220, // 蓝色
    },
  },
}

// 绿色主题
export const GreenTheme: Story = {
  args: {
    app: {
      name: '质押挖矿',
      icon: 'https://picsum.photos/seed/splash3/200',
      themeColor: 145, // 绿色
    },
  },
}

// 橙色主题
export const OrangeTheme: Story = {
  args: {
    app: {
      name: 'NFT 市场',
      icon: 'https://picsum.photos/seed/splash4/200',
      themeColor: 45, // 橙色
    },
  },
}

// 红色主题
export const RedTheme: Story = {
  args: {
    app: {
      name: '风险提醒',
      icon: 'https://picsum.photos/seed/splash5/200',
      themeColor: 25, // 红色
    },
  },
}

// 使用 hex 颜色
export const HexColor: Story = {
  args: {
    app: {
      name: '跨链桥',
      icon: 'https://picsum.photos/seed/splash6/200',
      themeColor: '#6366f1', // Indigo
    },
  },
}

// 使用 oklch 颜色
export const OklchColor: Story = {
  args: {
    app: {
      name: '链上投票',
      icon: 'https://picsum.photos/seed/splash7/200',
      themeColor: 'oklch(0.6 0.2 180)',
    },
  },
}

// 深色模式
export const DarkMode: Story = {
  args: {
    app: {
      name: '暗黑钱包',
      icon: 'https://picsum.photos/seed/splash8/200',
      themeColor: 280,
    },
  },
  decorators: [
    (Story) => (
      <div className="dark relative h-[600px] w-full bg-background">
        <Story />
      </div>
    ),
  ],
}

// 无动画
export const NoAnimation: Story = {
  args: {
    app: {
      name: '静态启动',
      icon: 'https://picsum.photos/seed/splash9/200',
      themeColor: 200,
    },
    animating: false,
  },
}

// 隐藏状态
export const Hidden: Story = {
  args: {
    app: {
      name: '隐藏的应用',
      icon: 'https://picsum.photos/seed/splash10/200',
      themeColor: 280,
    },
    visible: false,
  },
}

// 自动关闭演示
function AutoCloseDemo() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <MiniappSplashScreen
      app={{
        name: '3秒后关闭',
        icon: 'https://picsum.photos/seed/splash11/200',
        themeColor: 280,
      }}
      visible={visible}
      onClose={() => setVisible(false)}
    />
  )
}

export const AutoClose: Story = {
  render: () => <AutoCloseDemo />,
}

// 真实 DOM 测试：渲染验证
export const RenderTest: Story = {
  args: {
    app: {
      name: '渲染测试',
      icon: 'https://picsum.photos/seed/test1/200',
      themeColor: 120,
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('验证组件渲染', async () => {
      const splash = canvas.getByTestId('miniapp-splash-screen')
      await expect(splash).toBeInTheDocument()
      await expect(splash).toHaveAttribute('data-visible', 'true')
    })

    await step('验证图标渲染', async () => {
      const icon = canvas.getByAltText('渲染测试')
      await expect(icon).toBeInTheDocument()
    })

    await step('验证无障碍属性', async () => {
      const splash = canvas.getByTestId('miniapp-splash-screen')
      await expect(splash).toHaveAttribute('role', 'status')
      await expect(splash).toHaveAttribute('aria-label', '渲染测试 正在加载')
    })
  },
}

// 真实 DOM 测试：CSS 渐变验证
export const GradientTest: Story = {
  args: {
    app: {
      name: '渐变测试',
      icon: 'https://picsum.photos/seed/test2/200',
      themeColor: 180, // Cyan
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('验证 CSS 变量设置', async () => {
      const splash = canvas.getByTestId('miniapp-splash-screen')
      const style = splash.style

      // 验证主色
      await expect(style.getPropertyValue('--splash-hue-primary')).toBe('180')
      // 验证邻近色1 (+30)
      await expect(style.getPropertyValue('--splash-hue-secondary')).toBe('210')
      // 验证邻近色2 (-30)
      await expect(style.getPropertyValue('--splash-hue-tertiary')).toBe('150')
    })
  },
}

// 真实 DOM 测试：动画状态
export const AnimationTest: Story = {
  args: {
    app: {
      name: '动画测试',
      icon: 'https://picsum.photos/seed/test3/200',
      themeColor: 280,
    },
    animating: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('验证动画属性启用', async () => {
      const splash = canvas.getByTestId('miniapp-splash-screen')
      await expect(splash).toHaveAttribute('data-animating', 'true')
    })
  },
}

// 真实 DOM 测试：可见性切换
export const VisibilityToggleTest: Story = {
  render: function VisibilityToggle() {
    const [visible, setVisible] = useState(true)

    return (
      <div>
        <button
          onClick={() => setVisible((v) => !v)}
          className="absolute bottom-4 left-4 z-50 rounded bg-primary px-4 py-2 text-primary-foreground"
          data-testid="toggle-btn"
        >
          Toggle
        </button>
        <MiniappSplashScreen
          app={{
            name: '切换测试',
            icon: 'https://picsum.photos/seed/test4/200',
            themeColor: 280,
          }}
          visible={visible}
        />
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('初始状态应该可见', async () => {
      const splash = canvas.getByTestId('miniapp-splash-screen')
      await expect(splash).toHaveAttribute('data-visible', 'true')
    })

    await step('点击按钮切换隐藏', async () => {
      const btn = canvas.getByTestId('toggle-btn')
      btn.click()

      await waitFor(() => {
        const splash = canvas.getByTestId('miniapp-splash-screen')
        expect(splash).toHaveAttribute('data-visible', 'false')
      })
    })

    await step('再次点击切换显示', async () => {
      const btn = canvas.getByTestId('toggle-btn')
      btn.click()

      await waitFor(() => {
        const splash = canvas.getByTestId('miniapp-splash-screen')
        expect(splash).toHaveAttribute('data-visible', 'true')
      })
    })
  },
}

// 响应式布局测试
export const ResponsiveTest: Story = {
  args: {
    app: {
      name: '响应式测试',
      icon: 'https://picsum.photos/seed/test5/200',
      themeColor: 280,
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('移动端视图验证', async () => {
      const splash = canvas.getByTestId('miniapp-splash-screen')
      await expect(splash).toBeInTheDocument()
    })
  },
}
