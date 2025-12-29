import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, SwipeableTabs } from './swipeable-tabs'
import { fn } from '@storybook/test'

const AssetsContent = () => (
  <div className="space-y-2 p-4">
    {['USDT', 'ETH', 'BTC', 'BNB'].map((token) => (
      <div key={token} className="bg-muted flex items-center justify-between rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 flex size-10 items-center justify-center rounded-full">
            <span className="text-primary text-sm font-bold">{token[0]}</span>
          </div>
          <div>
            <div className="font-medium">{token}</div>
            <div className="text-muted-foreground text-sm">
              {(Math.random() * 1000).toFixed(2)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-medium">${(Math.random() * 10000).toFixed(2)}</div>
          <div className={`text-sm ${Math.random() > 0.5 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 5).toFixed(2)}%
          </div>
        </div>
      </div>
    ))}
  </div>
)

const HistoryContent = () => (
  <div className="space-y-2 p-4">
    {['转账', '收款', '兑换', '质押'].map((type, i) => (
      <div key={i} className="bg-muted flex items-center justify-between rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 flex size-10 items-center justify-center rounded-full">
            <span className="text-primary text-lg">
              {type === '转账' ? '↑' : type === '收款' ? '↓' : type === '兑换' ? '⇄' : '🔒'}
            </span>
          </div>
          <div>
            <div className="font-medium">{type}</div>
            <div className="text-muted-foreground text-sm">2024-01-{10 + i}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-medium ${type === '收款' ? 'text-green-500' : ''}`}>
            {type === '收款' ? '+' : '-'}{(Math.random() * 100).toFixed(2)} USDT
          </div>
          <div className="text-muted-foreground text-sm">已完成</div>
        </div>
      </div>
    ))}
  </div>
)

const meta: Meta<typeof Tabs> = {
  title: 'Layout/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="bg-background h-[500px] w-[360px] overflow-hidden rounded-xl shadow-lg">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  args: {
    onTabChange: fn(),
  },
  render: (args) => (
    <Tabs {...args}>
      {(tab) => (tab === 'assets' ? <AssetsContent /> : <HistoryContent />)}
    </Tabs>
  ),
}

export const HistoryActive: Story = {
  args: {
    defaultTab: 'history',
    onTabChange: fn(),
  },
  render: (args) => (
    <Tabs {...args}>
      {(tab) => (tab === 'assets' ? <AssetsContent /> : <HistoryContent />)}
    </Tabs>
  ),
}

export const CustomTabs: Story = {
  args: {
    tabs: [
      { id: 'all', label: '全部' },
      { id: 'sent', label: '转出' },
      { id: 'received', label: '转入' },
      { id: 'pending', label: '待处理' },
    ],
    defaultTab: 'all',
    onTabChange: fn(),
  },
  render: (args) => (
    <Tabs {...args}>
      {(tab) => (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          当前选中: {tab}
        </div>
      )}
    </Tabs>
  ),
}

export const SwipeableDefault: Story = {
  args: {
    onTabChange: fn(),
  },
  render: (args) => (
    <SwipeableTabs {...args}>
      {(tab) => (tab === 'assets' ? <AssetsContent /> : <HistoryContent />)}
    </SwipeableTabs>
  ),
  parameters: {
    docs: {
      description: {
        story: '可滑动版本的 Tab 切换，使用 Swiper 实现手势滑动。',
      },
    },
  },
}

export const SwipeableHistoryActive: Story = {
  args: {
    defaultTab: 'history',
    onTabChange: fn(),
  },
  render: (args) => (
    <SwipeableTabs {...args}>
      {(tab) => (tab === 'assets' ? <AssetsContent /> : <HistoryContent />)}
    </SwipeableTabs>
  ),
}

export const SwipeableCustomTabs: Story = {
  args: {
    tabs: [
      { id: 'tokens', label: '代币' },
      { id: 'nfts', label: 'NFT' },
      { id: 'defi', label: 'DeFi' },
    ],
    defaultTab: 'tokens',
    onTabChange: fn(),
  },
  render: (args) => (
    <SwipeableTabs {...args}>
      {(tab) => (
        <div className="flex h-60 flex-col items-center justify-center gap-2 text-muted-foreground">
          <div className="text-4xl">
            {tab === 'tokens' ? '🪙' : tab === 'nfts' ? '🖼️' : '📊'}
          </div>
          <div>{tab.toUpperCase()} 内容</div>
        </div>
      )}
    </SwipeableTabs>
  ),
}

export const Controlled: Story = {
  args: {
    activeTab: 'history',
    onTabChange: fn(),
  },
  render: (args) => (
    <Tabs {...args}>
      {(tab) => (tab === 'assets' ? <AssetsContent /> : <HistoryContent />)}
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: '受控模式，activeTab 由外部状态管理。',
      },
    },
  },
}

export const DarkMode: Story = {
  args: {
    onTabChange: fn(),
  },
  render: (args) => (
    <SwipeableTabs {...args}>
      {(tab) => (tab === 'assets' ? <AssetsContent /> : <HistoryContent />)}
    </SwipeableTabs>
  ),
  decorators: [
    (Story) => (
      <div className="dark bg-background h-[500px] w-[360px] overflow-hidden rounded-xl shadow-lg">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
}
