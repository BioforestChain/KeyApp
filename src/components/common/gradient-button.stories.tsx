import type { Meta, StoryObj } from '@storybook/react';
import { GradientButton } from './gradient-button';

const meta: Meta<typeof GradientButton> = {
  title: 'Common/GradientButton',
  component: GradientButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['blue', 'purple', 'red', 'mint'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    fullWidth: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GradientButton>;

export const Default: Story = {
  args: {
    children: '确认转账',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <GradientButton variant="purple">Purple (默认)</GradientButton>
      <GradientButton variant="blue">Blue</GradientButton>
      <GradientButton variant="red">Red</GradientButton>
      <GradientButton variant="mint">Mint</GradientButton>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <GradientButton size="sm">Small</GradientButton>
      <GradientButton size="md">Medium (默认)</GradientButton>
      <GradientButton size="lg">Large</GradientButton>
    </div>
  ),
};

export const Loading: Story = {
  args: {
    children: '处理中...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: '不可用',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: '全宽按钮',
    fullWidth: true,
  },
};

export const ResponsiveContainer: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">拖拽容器边缘或使用工具栏切换容器尺寸，观察按钮响应式变化</p>
      <GradientButton fullWidth>响应式按钮</GradientButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '按钮使用 @container 查询响应容器尺寸变化。尝试调整容器宽度查看效果。',
      },
    },
  },
};
