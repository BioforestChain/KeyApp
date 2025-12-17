import type { Meta, StoryObj } from '@storybook/react';
import { TokenItem, type TokenInfo } from './token-item';

const meta: Meta<typeof TokenItem> = {
  title: 'Token/TokenItem',
  component: TokenItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TokenItem>;

const mockUSDT: TokenInfo = {
  symbol: 'USDT',
  name: 'Tether USD',
  balance: '1,234.56',
  fiatValue: '1,234.56',
  chain: 'ethereum',
  change24h: 0.05,
};

const mockETH: TokenInfo = {
  symbol: 'ETH',
  name: 'Ethereum',
  balance: '2.5',
  fiatValue: '4,500.00',
  chain: 'ethereum',
  change24h: -2.3,
};

const mockTRX: TokenInfo = {
  symbol: 'TRX',
  name: 'Tron',
  balance: '10,000',
  fiatValue: '800.00',
  chain: 'tron',
  change24h: 5.2,
};

const mockBTC: TokenInfo = {
  symbol: 'BTC',
  name: 'Bitcoin',
  balance: '0.05',
  fiatValue: '2,500.00',
  chain: 'bitcoin',
  change24h: 1.8,
};

export const Default: Story = {
  args: {
    token: mockUSDT,
    onClick: () => alert('Clicked USDT'),
  },
};

export const WithChange: Story = {
  args: {
    token: mockETH,
    showChange: true,
    onClick: () => alert('Clicked ETH'),
  },
};

export const NegativeChange: Story = {
  args: {
    token: { ...mockETH, change24h: -5.5 },
    showChange: true,
  },
};

export const NotClickable: Story = {
  args: {
    token: mockTRX,
  },
};

export const TokenList: Story = {
  render: () => (
    <div className="space-y-1">
      <TokenItem token={mockUSDT} onClick={() => {}} showChange />
      <TokenItem token={mockETH} onClick={() => {}} showChange />
      <TokenItem token={mockTRX} onClick={() => {}} showChange />
      <TokenItem token={mockBTC} onClick={() => {}} showChange />
    </div>
  ),
};

export const MultiCurrency: Story = {
  render: () => (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs">
        使用顶部工具栏的 <span className="font-medium">Currency</span> 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。
      </p>
      <div className="space-y-1">
        <TokenItem token={mockUSDT} onClick={() => {}} showChange />
        <TokenItem token={mockETH} onClick={() => {}} showChange />
        <TokenItem token={mockTRX} onClick={() => {}} showChange />
        <TokenItem token={mockBTC} onClick={() => {}} showChange />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。',
      },
    },
  },
};

export const Responsive: Story = {
  args: {
    token: mockUSDT,
    onClick: () => {},
    showChange: true,
  },
  parameters: {
    docs: {
      description: {
        story: '调整容器宽度，观察图标和文字尺寸变化',
      },
    },
  },
};
