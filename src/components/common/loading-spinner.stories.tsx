import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from './loading-spinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Common/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    fullScreen: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="sm" />
        <span className="text-muted-foreground text-xs">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="md" />
        <span className="text-muted-foreground text-xs">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="lg" />
        <span className="text-muted-foreground text-xs">Large</span>
      </div>
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <button className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-md px-4 py-2">
      <LoadingSpinner size="sm" className="text-white" />
      <span>加载中...</span>
    </button>
  ),
};
