import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonList } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Common/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    className: 'h-4 w-32',
  },
};

export const Circle: Story = {
  args: {
    className: 'w-12 aspect-square rounded-full',
  },
};

export const Rectangle: Story = {
  args: {
    className: 'h-24 w-full rounded-lg',
  },
};

export const Text: Story = {
  render: () => <SkeletonText lines={3} />,
};

export const Card: Story = {
  render: () => <SkeletonCard />,
};

export const List: Story = {
  render: () => <SkeletonList count={5} />,
};

export const WalletCardSkeleton: Story = {
  render: () => (
    <div className="bg-gradient-purple space-y-4 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="aspect-square w-10 shrink-0 rounded-full bg-white/20" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 bg-white/20" />
          <Skeleton className="h-3 w-16 bg-white/20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-32 bg-white/20" />
        <Skeleton className="h-4 w-20 bg-white/20" />
      </div>
      <Skeleton className="h-4 w-40 bg-white/20" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '钱包卡片加载状态',
      },
    },
  },
};

export const TokenListSkeleton: Story = {
  render: () => (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-3">
          <Skeleton className="aspect-square w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="space-y-1.5 text-right">
            <Skeleton className="ml-auto h-4 w-20" />
            <Skeleton className="ml-auto h-3 w-14" />
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '代币列表加载状态',
      },
    },
  },
};
