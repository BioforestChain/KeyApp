import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './page-header';

const meta: Meta<typeof PageHeader> = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-background min-h-[200px]">
        <Story />
        <div className="p-4">
          <p className="text-muted-foreground">页面内容区域</p>
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: '转账',
    onBack: () => alert('返回'),
  },
};

export const WithRightAction: Story = {
  args: {
    title: '设置',
    onBack: () => alert('返回'),
    rightAction: <button className="text-primary text-sm font-medium">保存</button>,
  },
};

export const TransparentBackground: Story = {
  args: {
    title: '钱包详情',
    onBack: () => alert('返回'),
    transparent: true,
  },
  decorators: [
    (Story) => (
      <div className="bg-gradient-purple min-h-[200px]">
        <Story />
        <div className="p-4 text-white">
          <p>渐变背景内容</p>
        </div>
      </div>
    ),
  ],
};

export const NoBackButton: Story = {
  args: {
    title: '首页',
    rightAction: (
      <button className="hover:bg-muted/50 flex h-8 w-8 items-center justify-center rounded-full">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>
    ),
  },
};

export const CustomContent: Story = {
  args: {
    onBack: () => alert('返回'),
    children: (
      <div className="flex items-center gap-2">
        <span className="text-sm">ETH</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    ),
  },
};
