import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './empty-state'
import { GradientButton } from './gradient-button'

const meta: Meta<typeof EmptyState> = {
  title: 'Common/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof EmptyState>

const WalletIcon = () => (
  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

const TransactionIcon = () => (
  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)

export const Default: Story = {
  args: {
    icon: <WalletIcon />,
    title: '暂无钱包',
    description: '创建或导入钱包开始使用',
    action: <GradientButton>创建钱包</GradientButton>,
  },
}

export const NoTransactions: Story = {
  args: {
    icon: <TransactionIcon />,
    title: '暂无交易记录',
    description: '完成第一笔交易后，记录将显示在这里',
  },
}

export const NoAssets: Story = {
  args: {
    title: '暂无资产',
    description: '转入资产后将显示在这里',
    action: (
      <button className="text-primary text-sm font-medium">
        了解如何转入
      </button>
    ),
  },
}

export const Responsive: Story = {
  args: {
    icon: <WalletIcon />,
    title: '容器响应式',
    description: '调整容器尺寸，观察文字大小变化',
    action: <GradientButton>操作按钮</GradientButton>,
  },
  parameters: {
    docs: {
      description: {
        story: '使用 @container 查询响应容器尺寸',
      },
    },
  },
}
